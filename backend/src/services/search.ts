import weaviate, { WeaviateClient } from "weaviate-client";

const TIKA_URL = process.env.TIKA_URL || "http://tika:9998";
const WEAVIATE_URL = process.env.WEAVIATE_URL || "http://weaviate:8080";

let client: WeaviateClient | null = null;
let initializationPromise: Promise<void> | null = null;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseWeaviateUrl(url: string): { host: string; port: number } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 8080,
  };
}

async function connectWithRetry(
  maxRetries: number = 10,
  delayMs: number = 3000
): Promise<WeaviateClient> {
  const { host, port } = parseWeaviateUrl(WEAVIATE_URL);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Attempting to connect to Weaviate at ${host}:${port} (attempt ${attempt}/${maxRetries})...`
      );
      const weaviateClient = await weaviate.connectToCustom({
        httpHost: host,
        httpPort: port,
        httpSecure: false,
        grpcHost: host,
        grpcPort: 50051,
        grpcSecure: false,
      });

      // Verify connection by listing collections
      await weaviateClient.collections.listAll();
      console.log("Successfully connected to Weaviate");
      return weaviateClient;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await sleep(delayMs);
      } else {
        throw new Error(
          `Failed to connect to Weaviate after ${maxRetries} attempts`
        );
      }
    }
  }
  throw new Error("Unreachable");
}

export async function initSearchService(): Promise<void> {
  // Prevent multiple concurrent initialization attempts
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      client = await connectWithRetry();

      // Check if collection exists, create if not
      const collections = await client.collections.listAll();
      const fileCollectionExists = collections.some((c) => c.name === "File");

      if (!fileCollectionExists) {
        await client.collections.create({
          name: "File",
          vectorizers: weaviate.configure.vectorizer.text2VecOpenAI({
            model: "text-embedding-3-small",
            vectorizeCollectionName: false,
          }),
          properties: [
            {
              name: "path",
              dataType: "text",
              description: "Full path to the file in S3",
            },
            {
              name: "filename",
              dataType: "text",
              description: "Name of the file",
            },
            {
              name: "content",
              dataType: "text",
              description: "Extracted text content from the file",
            },
            {
              name: "mimeType",
              dataType: "text",
              description: "MIME type of the file",
            },
            {
              name: "size",
              dataType: "int",
              description: "File size in bytes",
            },
            {
              name: "lastModified",
              dataType: "date",
              description: "Last modified timestamp",
            },
          ],
        });
        console.log("Created File collection in Weaviate with OpenAI embeddings");
      }

      console.log("Search service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize search service:", error);
      initializationPromise = null; // Allow retry on next call
      throw error;
    }
  })();

  return initializationPromise;
}

export async function extractText(fileBuffer: Buffer): Promise<string> {
  const startTime = Date.now();
  console.log(`[Search] Starting Tika text extraction (${fileBuffer.length} bytes)...`);

  try {
    const response = await fetch(`${TIKA_URL}/tika`, {
      method: "PUT",
      body: fileBuffer,
      headers: {
        Accept: "text/plain",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Tika extraction failed: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    console.log(`[Search] Tika extraction completed in ${Date.now() - startTime}ms (${text.length} chars extracted)`);
    return text.trim();
  } catch (error) {
    console.error(`[Search] Text extraction failed after ${Date.now() - startTime}ms:`, error);
    // Re-throw instead of returning empty string - let the caller handle it
    throw error;
  }
}

export interface IndexFileParams {
  path: string;
  filename: string;
  content: string;
  mimeType: string;
  size: number;
  lastModified: Date;
}

// OpenAI text-embedding-3-small has 8192 token limit
// Character-to-token ratio varies: ~4 for plain text, ~2.5 for PDFs with special chars
// Using conservative estimate of 2.5 chars/token: 8192 * 2.5 = ~20k
// Leave buffer for filename/path metadata: use 16k chars
const MAX_CONTENT_CHARS = 16000;

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_CHARS) {
    return content;
  }
  // Truncate and add indicator
  return content.slice(0, MAX_CONTENT_CHARS) + "\n\n[Content truncated due to length...]";
}

async function ensureInitialized(): Promise<void> {
  if (!client) {
    await initSearchService();
  }
}

export async function indexFile(params: IndexFileParams): Promise<void> {
  const startTime = Date.now();
  console.log(`[Search] Starting indexFile for: ${params.path}`);

  await ensureInitialized();
  if (!client) {
    throw new Error("Search service not initialized");
  }

  try {
    const collection = client.collections.get("File");

    // Check if file already exists and delete it first
    console.log(`[Search] Checking for existing entry: ${params.path}`);
    const queryStart = Date.now();
    const existing = await collection.query.fetchObjects({
      filters: collection.filter.byProperty("path").equal(params.path),
      limit: 1,
    });
    console.log(`[Search] Query completed in ${Date.now() - queryStart}ms, found ${existing.objects.length} existing`);

    if (existing.objects.length > 0) {
      console.log(`[Search] Deleting existing entry: ${existing.objects[0].uuid}`);
      const deleteStart = Date.now();
      await collection.data.deleteById(existing.objects[0].uuid);
      console.log(`[Search] Delete completed in ${Date.now() - deleteStart}ms`);
    }

    // Truncate content to fit within embedding model token limits
    const truncatedContent = truncateContent(params.content);
    const wasTruncated = truncatedContent.length < params.content.length;
    if (wasTruncated) {
      console.log(`[Search] Content truncated from ${params.content.length} to ${truncatedContent.length} chars`);
    }

    // Index the new/updated file
    console.log(`[Search] Inserting into Weaviate (content: ${truncatedContent.length} chars)...`);
    const insertStart = Date.now();
    await collection.data.insert({
      path: params.path,
      filename: params.filename,
      content: truncatedContent,
      mimeType: params.mimeType,
      size: params.size,
      lastModified: params.lastModified,
    });
    console.log(`[Search] Insert completed in ${Date.now() - insertStart}ms`);

    console.log(`[Search] Indexed file: ${params.path} (total: ${Date.now() - startTime}ms)`);
  } catch (error) {
    console.error(`[Search] Failed to index file ${params.path} after ${Date.now() - startTime}ms:`, error);
    throw error;
  }
}

export async function deleteFromIndex(path: string): Promise<void> {
  const startTime = Date.now();
  console.log(`[Search] Starting deleteFromIndex for: ${path}`);

  await ensureInitialized();
  if (!client) {
    throw new Error("Search service not initialized");
  }

  try {
    const collection = client.collections.get("File");

    // Find and delete by path
    console.log(`[Search] Querying for entry to delete: ${path}`);
    const queryStart = Date.now();
    const existing = await collection.query.fetchObjects({
      filters: collection.filter.byProperty("path").equal(path),
      limit: 1,
    });
    console.log(`[Search] Query completed in ${Date.now() - queryStart}ms, found ${existing.objects.length}`);

    if (existing.objects.length > 0) {
      console.log(`[Search] Deleting entry: ${existing.objects[0].uuid}`);
      const deleteStart = Date.now();
      await collection.data.deleteById(existing.objects[0].uuid);
      console.log(`[Search] Delete completed in ${Date.now() - deleteStart}ms`);
      console.log(`[Search] Removed from index: ${path} (total: ${Date.now() - startTime}ms)`);
    } else {
      console.log(`[Search] No entry found to delete for: ${path}`);
    }
  } catch (error) {
    console.error(`[Search] Failed to delete from index ${path} after ${Date.now() - startTime}ms:`, error);
    throw error; // Re-throw to let caller handle it
  }
}

export interface SearchResult {
  path: string;
  filename: string;
  mimeType: string;
  size: number;
  lastModified: string;
  score: number;
  type: "file" | "directory";
}

// Extract the immediate parent directory from a file path
function getParentDirectory(filePath: string): string | null {
  const parts = filePath.split("/");

  // Need at least 2 parts (directory + filename) to have a parent
  if (parts.length < 2) {
    return null;
  }

  // Remove the filename and create the parent directory path
  const dirPath = parts.slice(0, -1).join("/") + "/";
  return dirPath || null;
}

export async function searchFiles(
  query: string,
  limit: number = 20
): Promise<SearchResult[]> {
  await ensureInitialized();
  if (!client) {
    throw new Error("Search service not initialized");
  }

  try {
    const collection = client.collections.get("File");

    const results = await collection.query.nearText(query, {
      limit,
      returnMetadata: ["distance"],
    });

    // Map file results
    const fileResults: SearchResult[] = results.objects.map((obj) => ({
      path: obj.properties.path as string,
      filename: obj.properties.filename as string,
      mimeType: obj.properties.mimeType as string,
      size: obj.properties.size as number,
      lastModified: obj.properties.lastModified as string,
      score: obj.metadata?.distance ? 1 - obj.metadata.distance : 0,
      type: "file" as const,
    }));

    // Extract unique immediate parent directories from file results
    // Track the best score for each directory (from its most relevant file)
    const directoryScores = new Map<string, number>();

    for (const file of fileResults) {
      const parentDir = getParentDirectory(file.path);
      if (parentDir) {
        const existingScore = directoryScores.get(parentDir) ?? 0;
        // Directory inherits the best score from its files
        if (file.score > existingScore) {
          directoryScores.set(parentDir, file.score);
        }
      }
    }

    // Create directory results
    const directoryResults: SearchResult[] = Array.from(directoryScores.entries()).map(
      ([dirPath, score]) => {
        const parts = dirPath.split("/").filter(Boolean);
        const dirName = parts[parts.length - 1] || dirPath;
        return {
          path: dirPath,
          filename: dirName,
          mimeType: "directory",
          size: 0,
          lastModified: "",
          score,
          type: "directory" as const,
        };
      }
    );

    // Combine and sort by score (directories first at same score level, then files)
    const combined = [...directoryResults, ...fileResults];
    combined.sort((a, b) => {
      // Sort by score descending
      if (b.score !== a.score) return b.score - a.score;
      // At same score, directories come first
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return 0;
    });

    return combined;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

export function getSearchClient(): WeaviateClient | null {
  return client;
}

export interface ReindexProgress {
  total: number;
  processed: number;
  indexed: number;
  failed: number;
  currentFile: string;
  status: "idle" | "starting" | "running" | "completed" | "error";
  error?: string;
}

export interface ReindexFile {
  key: string;
  size: number;
  lastModified: Date;
  getContent: () => Promise<Buffer>;
}

// Global reindex state - allows checking if reindex is in progress
let currentReindexProgress: ReindexProgress = {
  total: 0,
  processed: 0,
  indexed: 0,
  failed: 0,
  currentFile: "",
  status: "idle",
};

export function getReindexProgress(): ReindexProgress {
  return { ...currentReindexProgress };
}

export function isReindexRunning(): boolean {
  return currentReindexProgress.status === "running" || currentReindexProgress.status === "starting";
}

/**
 * Reindex all files with streaming progress via async generator
 */
export async function* reindexAllFilesStream(
  files: ReindexFile[],
  getMimeType: (key: string) => string
): AsyncGenerator<ReindexProgress> {
  await ensureInitialized();
  if (!client) {
    currentReindexProgress = {
      total: 0,
      processed: 0,
      indexed: 0,
      failed: 0,
      currentFile: "",
      status: "error",
      error: "Search service not initialized",
    };
    yield currentReindexProgress;
    return;
  }

  // Filter out directories (keys ending with /)
  const filesToIndex = files.filter((f) => !f.key.endsWith("/"));

  currentReindexProgress = {
    total: filesToIndex.length,
    processed: 0,
    indexed: 0,
    failed: 0,
    currentFile: "",
    status: "starting",
  };

  yield { ...currentReindexProgress };

  console.log(`Starting reindex of ${filesToIndex.length} files...`);
  currentReindexProgress.status = "running";

  for (const file of filesToIndex) {
    currentReindexProgress.currentFile = file.key;

    try {
      const content = await file.getContent();
      const extractedText = await extractText(content);
      const filename = file.key.split("/").pop() || file.key;

      await indexFile({
        path: file.key,
        filename,
        content: extractedText,
        mimeType: getMimeType(file.key),
        size: file.size,
        lastModified: file.lastModified,
      });

      currentReindexProgress.indexed++;
    } catch (error) {
      console.error(`Failed to index ${file.key}:`, error);
      currentReindexProgress.failed++;
    }

    currentReindexProgress.processed++;
    yield { ...currentReindexProgress };
  }

  currentReindexProgress.status = "completed";
  currentReindexProgress.currentFile = "";
  yield { ...currentReindexProgress };

  console.log(
    `Reindex completed: ${currentReindexProgress.indexed} indexed, ${currentReindexProgress.failed} failed out of ${currentReindexProgress.total} files`
  );
}
