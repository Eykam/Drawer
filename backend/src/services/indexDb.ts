import { Database } from "bun:sqlite";
import path from "path";

const DB_PATH = process.env.INDEX_DB_PATH || "./data/index.db";
const BATCH_SIZE = parseInt(process.env.INDEX_BATCH_SIZE || "10", 10);

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
await Bun.write(path.join(dataDir, ".gitkeep"), "");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.run("PRAGMA journal_mode = WAL");

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS index_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT NOT NULL DEFAULT 'reindex',
    status TEXT NOT NULL DEFAULT 'pending',
    total_files INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS index_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT,
    operation TEXT NOT NULL DEFAULT 'index',
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (job_id) REFERENCES index_jobs(id) ON DELETE CASCADE
  )
`);

// Migrations for existing DBs
try {
  db.run("ALTER TABLE index_queue ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0");
} catch {
  // Column already exists
}

try {
  db.run("ALTER TABLE index_jobs ADD COLUMN job_type TEXT NOT NULL DEFAULT 'reindex'");
} catch {
  // Column already exists
}

try {
  db.run("ALTER TABLE index_queue ADD COLUMN operation TEXT NOT NULL DEFAULT 'index'");
} catch {
  // Column already exists
}

// Create indexes for faster queries
db.run(`CREATE INDEX IF NOT EXISTS idx_queue_status ON index_queue(status)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_queue_job_id ON index_queue(job_id)`);

export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "persistent";
export type QueueItemStatus = "pending" | "processing" | "completed" | "failed";
export type JobType = "reindex" | "upload" | "delete";
export type QueueOperation = "index" | "delete";

export interface IndexJob {
  id: number;
  job_type: JobType;
  status: JobStatus;
  total_files: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface QueueItem {
  id: number;
  job_id: number;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  operation: QueueOperation;
  status: QueueItemStatus;
  error: string | null;
  retry_count: number;
  created_at: string;
  processed_at: string | null;
}

export const MAX_RETRIES = parseInt(process.env.INDEX_MAX_RETRIES || "3", 10);

export interface JobProgress {
  job: IndexJob | null;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  currentFile: string | null;
  percentComplete: number;
}

// Job operations
export function createJob(jobType: JobType = "reindex"): number {
  const result = db.run("INSERT INTO index_jobs (job_type, status) VALUES (?, 'pending')", [jobType]);
  return Number(result.lastInsertRowid);
}

export function getJob(jobId: number): IndexJob | null {
  return db.query("SELECT * FROM index_jobs WHERE id = ?").get(jobId) as IndexJob | null;
}

export function getJobByType(jobType: JobType): IndexJob | null {
  return db.query("SELECT * FROM index_jobs WHERE job_type = ? ORDER BY id DESC LIMIT 1").get(jobType) as IndexJob | null;
}

// Get or create persistent jobs (upload/delete) - these jobs are never completed
export function getOrCreatePersistentJob(jobType: "upload" | "delete"): number {
  const existing = getJobByType(jobType);
  if (existing) {
    return existing.id;
  }
  // Create with 'persistent' status since these are always active
  const result = db.run("INSERT INTO index_jobs (job_type, status) VALUES (?, 'persistent')", [jobType]);
  return Number(result.lastInsertRowid);
}

// Initialize persistent jobs on startup
let uploadJobId: number | null = null;
let deleteJobId: number | null = null;

export function initPersistentJobs(): { uploadJobId: number; deleteJobId: number } {
  uploadJobId = getOrCreatePersistentJob("upload");
  deleteJobId = getOrCreatePersistentJob("delete");
  return { uploadJobId, deleteJobId };
}

export function getUploadJobId(): number {
  if (uploadJobId === null) {
    uploadJobId = getOrCreatePersistentJob("upload");
  }
  return uploadJobId;
}

export function getDeleteJobId(): number {
  if (deleteJobId === null) {
    deleteJobId = getOrCreatePersistentJob("delete");
  }
  return deleteJobId;
}

export function getLatestJob(): IndexJob | null {
  return db.query("SELECT * FROM index_jobs ORDER BY id DESC LIMIT 1").get() as IndexJob | null;
}

export function updateJobStatus(jobId: number, status: JobStatus): void {
  const updates: string[] = ["status = ?"];
  const params: (string | number)[] = [status];

  if (status === "processing") {
    updates.push("started_at = CURRENT_TIMESTAMP");
  } else if (status === "completed" || status === "failed" || status === "cancelled") {
    updates.push("completed_at = CURRENT_TIMESTAMP");
  }

  params.push(jobId);
  db.run(`UPDATE index_jobs SET ${updates.join(", ")} WHERE id = ?`, params);
}

export function updateJobTotalFiles(jobId: number, total: number): void {
  db.run("UPDATE index_jobs SET total_files = ? WHERE id = ?", [total, jobId]);
}

// Queue operations
export function queueFile(
  jobId: number,
  filePath: string,
  fileSize: number,
  mimeType: string | null,
  operation: QueueOperation = "index"
): void {
  db.run(
    "INSERT INTO index_queue (job_id, file_path, file_size, mime_type, operation, status) VALUES (?, ?, ?, ?, ?, 'pending')",
    [jobId, filePath, fileSize, mimeType, operation]
  );
}

export function queueFiles(
  jobId: number,
  files: Array<{ path: string; size: number; mimeType: string | null }>,
  operation: QueueOperation = "index"
): void {
  const insert = db.prepare(
    "INSERT INTO index_queue (job_id, file_path, file_size, mime_type, operation, status) VALUES (?, ?, ?, ?, ?, 'pending')"
  );

  const insertMany = db.transaction((files) => {
    for (const file of files) {
      insert.run(jobId, file.path, file.size, file.mimeType, operation);
    }
  });

  insertMany(files);
}

// Helper: Queue a file for indexing (upload job)
export function queueFileForIndex(
  filePath: string,
  fileSize: number,
  mimeType: string | null
): void {
  const jobId = getUploadJobId();
  queueFile(jobId, filePath, fileSize, mimeType, "index");
}

// Helper: Queue a file for deletion (delete job)
export function queueFileForDelete(filePath: string): void {
  const jobId = getDeleteJobId();
  queueFile(jobId, filePath, 0, null, "delete");
}

// Remove a file from the queue by path (used when renaming/deleting)
export function removeFileFromQueue(filePath: string): void {
  db.run(
    "DELETE FROM index_queue WHERE file_path = ? AND status = 'pending'",
    [filePath]
  );
}

export function getPendingFiles(limit: number = BATCH_SIZE): QueueItem[] {
  return db
    .query(
      `SELECT * FROM index_queue
       WHERE status = 'pending'
       ORDER BY id ASC
       LIMIT ?`
    )
    .all(limit) as QueueItem[];
}

export function markFileProcessing(queueId: number): void {
  db.run("UPDATE index_queue SET status = 'processing' WHERE id = ?", [queueId]);
}

export function markFileCompleted(queueId: number): void {
  db.run(
    "UPDATE index_queue SET status = 'completed', processed_at = CURRENT_TIMESTAMP WHERE id = ?",
    [queueId]
  );
}

export function markFileFailed(queueId: number, error: string, isRetryable: boolean = false): void {
  if (isRetryable) {
    // Increment retry count and reset to pending for retry
    const item = db.query("SELECT retry_count FROM index_queue WHERE id = ?").get(queueId) as { retry_count: number } | null;
    const retryCount = (item?.retry_count || 0) + 1;

    if (retryCount < MAX_RETRIES) {
      db.run(
        "UPDATE index_queue SET status = 'pending', error = ?, retry_count = ? WHERE id = ?",
        [error, retryCount, queueId]
      );
      return;
    }
  }

  // Mark as permanently failed
  db.run(
    "UPDATE index_queue SET status = 'failed', error = ?, retry_count = retry_count + 1, processed_at = CURRENT_TIMESTAMP WHERE id = ?",
    [error, queueId]
  );
}

// Reset stale "processing" items back to pending (for recovery after crash)
export function resetStaleProcessingItems(): number {
  const result = db.run(
    "UPDATE index_queue SET status = 'pending' WHERE status = 'processing'"
  );
  return result.changes;
}

// Get items that can be retried (failed but under max retries)
export function getRetryableFailedFiles(limit: number = BATCH_SIZE): QueueItem[] {
  return db
    .query(
      `SELECT * FROM index_queue
       WHERE status = 'failed' AND retry_count < ?
       ORDER BY id ASC
       LIMIT ?`
    )
    .all(MAX_RETRIES, limit) as QueueItem[];
}

// Reset specific failed items for retry
export function resetFailedForRetry(queueIds: number[]): void {
  if (queueIds.length === 0) return;
  const placeholders = queueIds.map(() => "?").join(",");
  db.run(
    `UPDATE index_queue SET status = 'pending', error = NULL WHERE id IN (${placeholders}) AND retry_count < ?`,
    [...queueIds, MAX_RETRIES]
  );
}

export function getJobProgress(jobId: number): JobProgress {
  const job = getJob(jobId);

  if (!job) {
    return {
      job: null,
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      currentFile: null,
      percentComplete: 0,
    };
  }

  const stats = db
    .query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
       FROM index_queue WHERE job_id = ?`
    )
    .get(jobId) as {
      total: number;
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };

  const currentFile = db
    .query("SELECT file_path FROM index_queue WHERE job_id = ? AND status = 'processing' LIMIT 1")
    .get(jobId) as { file_path: string } | null;

  const processed = stats.completed + stats.failed;
  const percentComplete = stats.total > 0 ? Math.round((processed / stats.total) * 100) : 0;

  return {
    job,
    total: stats.total,
    pending: stats.pending,
    processing: stats.processing,
    completed: stats.completed,
    failed: stats.failed,
    currentFile: currentFile?.file_path || null,
    percentComplete,
  };
}

export function getLatestJobProgress(): JobProgress {
  const job = getLatestJob();
  if (!job) {
    return {
      job: null,
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      currentFile: null,
      percentComplete: 0,
    };
  }
  return getJobProgress(job.id);
}

export function hasActiveJob(): boolean {
  const result = db
    .query("SELECT COUNT(*) as count FROM index_jobs WHERE status IN ('pending', 'processing')")
    .get() as { count: number };
  return result.count > 0;
}

export function cancelActiveJobs(): void {
  db.run("UPDATE index_jobs SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP WHERE status IN ('pending', 'processing')");
  db.run("UPDATE index_queue SET status = 'failed', error = 'Job cancelled' WHERE status IN ('pending', 'processing')");
}

export function getRecentJobs(limit: number = 10): JobProgress[] {
  const jobs = db
    .query("SELECT * FROM index_jobs ORDER BY id DESC LIMIT ?")
    .all(limit) as IndexJob[];

  return jobs.map((job) => getJobProgress(job.id));
}

export { BATCH_SIZE };
