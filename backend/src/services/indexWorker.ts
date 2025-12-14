import {
  getPendingFiles,
  markFileProcessing,
  markFileCompleted,
  markFileFailed,
  getLatestJob,
  updateJobStatus,
  hasActiveJob,
  resetStaleProcessingItems,
  getRecentJobs,
  BATCH_SIZE,
  MAX_RETRIES,
  type QueueItem,
} from "./indexDb";
import { extractText, indexFile, deleteFromIndex, initSearchService } from "./search";
import { S3Filesystem } from "../routes/files/Filesystem";

const POLL_INTERVAL = parseInt(process.env.INDEX_POLL_INTERVAL || "2000", 10);
const BASE_BACKOFF_MS = parseInt(process.env.INDEX_BACKOFF_MS || "5000", 10);

let isRunning = false;
let filesystem: S3Filesystem | null = null;
let currentBackoffMs = 0;
let consecutiveErrors = 0;
let pollCount = 0;
const STATUS_LOG_INTERVAL = 30; // Log status every N polls (with 2s poll = every 60s)

// Detect if an error is retryable (rate limiting, temporary network issues, fixable errors)
function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Rate limiting patterns
  if (lowerMessage.includes("rate limit") || lowerMessage.includes("429") || lowerMessage.includes("too many requests")) {
    return true;
  }

  // Temporary network/connection issues
  if (lowerMessage.includes("econnreset") || lowerMessage.includes("econnrefused") ||
      lowerMessage.includes("etimedout") || lowerMessage.includes("socket hang up") ||
      lowerMessage.includes("network") || lowerMessage.includes("timeout")) {
    return true;
  }

  // Service temporarily unavailable
  if (lowerMessage.includes("503") || lowerMessage.includes("502") || lowerMessage.includes("unavailable")) {
    return true;
  }

  // Token limit errors - retryable because truncation limit may have been adjusted
  if (lowerMessage.includes("maximum context length") || lowerMessage.includes("token")) {
    return true;
  }

  return false;
}

function calculateBackoff(): number {
  // Exponential backoff: 5s, 10s, 20s, 40s... capped at 5 minutes
  const backoff = Math.min(BASE_BACKOFF_MS * Math.pow(2, consecutiveErrors), 5 * 60 * 1000);
  return backoff;
}

function resetBackoff(): void {
  consecutiveErrors = 0;
  currentBackoffMs = 0;
}

function increaseBackoff(): void {
  consecutiveErrors++;
  currentBackoffMs = calculateBackoff();
  console.log(`[Worker] Backing off for ${currentBackoffMs / 1000}s after ${consecutiveErrors} consecutive errors`);
}

function logQueueStatus(): void {
  const jobs = getRecentJobs(5);
  const pendingCount = getPendingFiles(1000).length; // Get count of pending items

  console.log(`[Worker] === Status Report ===`);
  console.log(`[Worker] Pending queue items: ${pendingCount}`);
  console.log(`[Worker] Consecutive errors: ${consecutiveErrors}`);
  console.log(`[Worker] Current backoff: ${currentBackoffMs}ms`);

  for (const progress of jobs) {
    const job = progress.job;
    if (job && (job.status === "persistent" || job.status === "processing" || job.status === "pending")) {
      console.log(`[Worker] Job ${job.id} (${job.job_type}): ${job.status} - pending: ${progress.pending}, processing: ${progress.processing}, completed: ${progress.completed}, failed: ${progress.failed}`);
    }
  }
  console.log(`[Worker] ======================`);
}

async function processIndexOperation(queueItem: QueueItem): Promise<void> {
  if (!filesystem) {
    throw new Error("Filesystem not initialized");
  }

  const startTime = Date.now();
  const path = queueItem.file_path;

  // Get file content from S3
  console.log(`[Worker] Fetching from S3: ${path}`);
  const s3Start = Date.now();
  const fileContent = await filesystem.getObject(path);
  console.log(`[Worker] S3 fetch completed in ${Date.now() - s3Start}ms (${fileContent.data.length} bytes)`);

  // Extract text using Tika
  console.log(`[Worker] Extracting text via Tika: ${path}`);
  const tikaStart = Date.now();
  const extractedText = await extractText(fileContent.data);
  console.log(`[Worker] Tika extraction completed in ${Date.now() - tikaStart}ms (${extractedText.length} chars)`);

  // Get filename from path
  const filename = path.split("/").pop() || path;

  // Index in Weaviate
  console.log(`[Worker] Indexing in Weaviate: ${path}`);
  const weaviateStart = Date.now();
  await indexFile({
    path,
    filename,
    content: extractedText,
    mimeType: queueItem.mime_type || "application/octet-stream",
    size: queueItem.file_size,
    lastModified: new Date(),
  });
  console.log(`[Worker] Weaviate indexing completed in ${Date.now() - weaviateStart}ms`);

  console.log(`[Worker] Indexed: ${path} (total: ${Date.now() - startTime}ms)`);
}

async function processDeleteOperation(queueItem: QueueItem): Promise<void> {
  const startTime = Date.now();
  const path = queueItem.file_path;

  console.log(`[Worker] Deleting from Weaviate: ${path}`);
  await deleteFromIndex(path);
  console.log(`[Worker] Deleted from index: ${path} (${Date.now() - startTime}ms)`);
}

async function processFile(queueItem: QueueItem): Promise<boolean> {
  console.log(`[Worker] Starting ${queueItem.operation} for: ${queueItem.file_path} (id: ${queueItem.id}, retry: ${queueItem.retry_count})`);

  // Mark as processing
  markFileProcessing(queueItem.id);

  try {
    if (queueItem.operation === "delete") {
      await processDeleteOperation(queueItem);
    } else {
      await processIndexOperation(queueItem);
    }

    markFileCompleted(queueItem.id);
    resetBackoff(); // Success - reset backoff
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const retryable = isRetryableError(error);

    if (retryable) {
      increaseBackoff();
      const retriesLeft = MAX_RETRIES - queueItem.retry_count - 1;
      console.warn(`[Worker] Retryable error for ${queueItem.file_path} (${retriesLeft} retries left): ${errorMessage}`);
    } else {
      console.error(`[Worker] Non-retryable error for ${queueItem.file_path}:`, errorMessage);
      if (errorStack) {
        console.error(`[Worker] Stack trace:`, errorStack);
      }
    }

    markFileFailed(queueItem.id, errorMessage, retryable);
    console.error(`[Worker] Failed to process ${queueItem.operation} for ${queueItem.file_path}:`, errorMessage);
    return false;
  }
}

async function processBatch(): Promise<number> {
  const pendingFiles = getPendingFiles(BATCH_SIZE);

  if (pendingFiles.length === 0) {
    return 0;
  }

  console.log(`[Worker] Processing batch of ${pendingFiles.length} files`);

  for (const file of pendingFiles) {
    await processFile(file);
  }

  return pendingFiles.length;
}

async function checkAndUpdateJobStatus(): Promise<void> {
  const job = getLatestJob();
  if (!job) return;

  // If job is pending and we're about to process, mark it as processing
  if (job.status === "pending") {
    updateJobStatus(job.id, "processing");
  }

  // Check if all files are processed
  if (job.status === "processing") {
    const pendingFiles = getPendingFiles(1);
    if (pendingFiles.length === 0) {
      updateJobStatus(job.id, "completed");
      console.log(`[Worker] Job ${job.id} completed`);
    }
  }
}

async function poll(): Promise<void> {
  pollCount++;

  // Log status periodically
  if (pollCount % STATUS_LOG_INTERVAL === 0) {
    logQueueStatus();
  }

  // If we're in backoff, wait before processing
  if (currentBackoffMs > 0) {
    console.log(`[Worker] In backoff, waiting ${currentBackoffMs / 1000}s before next attempt...`);
    await new Promise((resolve) => setTimeout(resolve, currentBackoffMs));
  }

  try {
    // Always process pending files (persistent upload/delete jobs are always active)
    const processed = await processBatch();

    // Update reindex job status if there's an active one
    if (processed > 0 && hasActiveJob()) {
      await checkAndUpdateJobStatus();
    }
  } catch (error) {
    console.error("[Worker] Error during poll:", error);
    console.error("[Worker] Error details:", error instanceof Error ? error.stack : String(error));

    // If poll itself throws, treat it as retryable and back off
    if (isRetryableError(error)) {
      increaseBackoff();
    }
  }
}

export async function startWorker(): Promise<void> {
  if (isRunning) {
    console.log("[Worker] Already running");
    return;
  }

  console.log(`[Worker] Starting with batch size ${BATCH_SIZE}, poll interval ${POLL_INTERVAL}ms, max retries ${MAX_RETRIES}`);

  // Reset any stale "processing" items from previous crash/restart
  const resetCount = resetStaleProcessingItems();
  if (resetCount > 0) {
    console.log(`[Worker] Reset ${resetCount} stale processing items to pending`);
  }

  // Initialize filesystem
  filesystem = new S3Filesystem();
  await filesystem.init();

  // Initialize search service (with retry)
  let searchInitialized = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await initSearchService();
      searchInitialized = true;
      break;
    } catch (error) {
      console.error(`[Worker] Failed to initialize search service (attempt ${attempt}/3):`, error);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  if (!searchInitialized) {
    console.error("[Worker] Could not initialize search service after 3 attempts, will retry during processing");
  }

  isRunning = true;
  resetBackoff();

  // Start polling loop
  const runLoop = async () => {
    while (isRunning) {
      await poll();
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  };

  runLoop();
}

export function stopWorker(): void {
  console.log("[Worker] Stopping");
  isRunning = false;
}

export function isWorkerRunning(): boolean {
  return isRunning;
}
