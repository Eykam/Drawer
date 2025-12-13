import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import mime from "mime-types";
import path from "path";
import { S3Filesystem } from "./routes/files/Filesystem";
import {
  authMiddleware,
  generateToken,
  validateCredentials,
} from "./routes/auth/auth";
import {
  LoginRequestSchema,
  RenameRequestSchema,
  DeleteRequestSchema,
  MkdirRequestSchema,
  DirectoryRequestSchema,
  FileRequestSchema,
  SearchRequestSchema,
  type FileItem,
} from "./schemas/api";
import {
  initSearchService,
  searchFiles,
} from "./services/search";
import {
  createJob,
  queueFiles,
  updateJobTotalFiles,
  getLatestJobProgress,
  getRecentJobs,
  hasActiveJob,
  cancelActiveJobs,
  initPersistentJobs,
  queueFileForIndex,
  queueFileForDelete,
  removeFileFromQueue,
} from "./services/indexDb";
import { startWorker } from "./services/indexWorker";

// Load environment variables (Bun loads .env automatically, but this ensures compatibility)
if (typeof Bun === "undefined") {
  await import("dotenv").then((dotenv) => dotenv.config());
}

const FILESYSTEM = new S3Filesystem();
await FILESYSTEM.init();

// Initialize search service (Weaviate + Tika)
try {
  await initSearchService();
} catch (error) {
  console.warn("Search service initialization failed, search will be unavailable:", error);
}

// Initialize persistent jobs for upload/delete tracking
const { uploadJobId, deleteJobId } = initPersistentJobs();
console.log(`Initialized persistent jobs: upload=${uploadJobId}, delete=${deleteJobId}`);

// Start background index worker
startWorker().catch((error) => {
  console.error("Failed to start index worker:", error);
});

const FRONTEND_DOMAIN = process.env.PUBLIC_DOMAIN || "";
const port = parseInt(process.env.PORT || "8000");

// Create base app with CORS
const app = new Hono()
  .use(
    "*",
    cors({
      origin: FRONTEND_DOMAIN,
      credentials: true,
    })
  )

  // ======================= Auth Routes =======================

  .post("/login", zValidator("json", LoginRequestSchema), async (c) => {
    try {
      const { username, password } = c.req.valid("json");
      const user = await validateCredentials(username, password);

      if (!user) {
        return c.json({ status: "failure" as const }, 403);
      }

      const token = await generateToken(user);
      return c.json({ status: "success" as const, token });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ status: "failure" as const }, 403);
    }
  })

  .post("/logout", (c) => {
    return c.json({ status: "logged out" as const }, 200);
  })

  .post("/checkAuth", authMiddleware, (c) => {
    return c.json({ authenticated: true as const }, 200);
  })

  .get("/test", (c) => {
    return c.text("test");
  })

  .get("/testAuth", authMiddleware, (c) => {
    return c.text("Authorized!");
  })

  // ======================= File Operations =======================

  .post(
    "/rename",
    authMiddleware,
    zValidator("json", RenameRequestSchema),
    async (c) => {
      try {
        const { source, dest, type } = c.req.valid("json");

        if (type === "dir") {
          console.log(`Dir Renaming ${source} => ${dest}`);
          const files = FILESYSTEM.fileList;

          await FILESYSTEM.renameObject(source, dest + "/");

          for (const currFile of files) {
            if (currFile.Key?.includes(source)) {
              console.log("currKey", currFile);
              const tempDest = currFile.Key.replace(source, dest + "/");
              console.log("tempDest", tempDest);
              await FILESYSTEM.renameObject(currFile.Key, tempDest);

              // Update index: delete old path, queue new path for indexing
              if (!currFile.Key.endsWith("/")) {
                removeFileFromQueue(currFile.Key);
                queueFileForDelete(currFile.Key);
                queueFileForIndex(tempDest, currFile.Size || 0, mime.lookup(tempDest) || null);
              }
            }
          }

          return c.json({ success: true as const }, 200);
        } else {
          console.log(`File Renaming ${source} => ${dest}`);
          const status = await FILESYSTEM.renameObject(source, dest);

          if (status) {
            // Update index: delete old path, queue new path for indexing
            removeFileFromQueue(source);
            queueFileForDelete(source);

            // Get file info for the new path
            const fileInfo = FILESYSTEM.fileList.find((f) => f.Key === dest);
            queueFileForIndex(dest, fileInfo?.Size || 0, mime.lookup(dest) || null);

            return c.json({ success: true as const }, 200);
          }
        }

        return c.json({ success: false as const, error: "Rename failed" }, 400);
      } catch (err) {
        console.log("error renaming:", err);
        return c.json({ success: false as const, error: "Internal error" }, 500);
      }
    }
  )

  .post(
    "/delete",
    authMiddleware,
    zValidator("json", DeleteRequestSchema),
    async (c) => {
      try {
        const { names } = c.req.valid("json");
        const status = await FILESYSTEM.deleteObjects(names);

        if (status) {
          // Queue files for deletion from index (processed by background worker)
          for (const name of names) {
            if (!name.endsWith("/")) {
              removeFileFromQueue(name);
              queueFileForDelete(name);
              console.log(`Queued file for index deletion: ${name}`);
            }
          }
          return c.json({ success: true as const }, 200);
        }
        return c.json({ success: false as const, error: "Delete failed" }, 400);
      } catch (err) {
        console.log("error deleting:", err);
        return c.json({ success: false as const, error: "Internal error" }, 500);
      }
    }
  )

  .post(
    "/mkdir",
    authMiddleware,
    zValidator("json", MkdirRequestSchema),
    async (c) => {
      try {
        const { name } = c.req.valid("json");
        const status = await FILESYSTEM.putObject(name, "dir");

        if (status) {
          return c.json({ success: true as const }, 200);
        }
        return c.json({ success: false as const, error: "Create directory failed" }, 400);
      } catch (err) {
        console.log("error creating directory:", err);
        return c.json({ success: false as const, error: "Internal error" }, 500);
      }
    }
  )

  .post("/upload", authMiddleware, async (c) => {
    try {
      const formData = await c.req.formData();
      const uploadPath = (formData.get("uploadPath") as string) || "";
      const files = formData.getAll("files") as File[];

      if (!files || files.length === 0) {
        return c.json({ success: false as const, error: "No files uploaded" }, 400);
      }

      console.log("files:", files);
      console.log("uploadPath", uploadPath);

      for (const file of files) {
        const key = uploadPath ? `${uploadPath}${file.name}` : file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await FILESYSTEM.putObject(key, file.type, buffer);

        // Queue file for indexing (will be processed by background worker)
        queueFileForIndex(key, file.size, file.type);
        console.log(`Queued file for indexing: ${key}`);
      }

      return c.json({ success: true as const }, 200);
    } catch (error) {
      console.error("Error uploading files:", error);
      return c.json({ success: false as const, error: "Internal error" }, 500);
    }
  })

  .post(
    "/directory",
    authMiddleware,
    zValidator("json", DirectoryRequestSchema),
    async (c) => {
      try {
        const { path: dirPath } = c.req.valid("json");
        const isDir = (p: string) => p[p.length - 1] === "/" || p === "";

        console.log(`Listing directory: ${dirPath}`);

        const items = await FILESYSTEM.listObjects(dirPath);

        // Filter out the current directory itself from results
        const filteredItems = items.filter((item) => item.Key !== dirPath);

        const contentList: FileItem[] = filteredItems.map((item) => ({
          name: item.Key,
          mimeType: isDir(item.Key || "")
            ? "dir"
            : (mime.lookup(item.Key || "") || false),
          size: item.Size,
          lastModified: item.LastModified,
        }));

        return c.json(contentList);
      } catch (error) {
        console.error(error);
        return c.json({ error: "Directory not found" }, 404);
      }
    }
  )

  .post(
    "/file",
    authMiddleware,
    zValidator("json", FileRequestSchema),
    async (c) => {
      try {
        const { path: filePath } = c.req.valid("json");

        console.log(`Downloading file: ${filePath}`);

        const fileContent = await FILESYSTEM.getObject(filePath);

        return new Response(fileContent.data, {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename=${path.basename(filePath)}`,
            "Content-Type": mime.lookup(filePath) || "application/octet-stream",
          },
        });
      } catch (error) {
        console.error(error);
        return c.json({ error: "File not found" }, 404);
      }
    }
  )

  // ======================= Search =======================

  .post(
    "/search",
    authMiddleware,
    zValidator("json", SearchRequestSchema),
    async (c) => {
      try {
        const { query, limit } = c.req.valid("json");

        console.log(`Searching for: ${query}`);

        const results = await searchFiles(query, limit);

        return c.json({ results });
      } catch (error) {
        console.error("Search error:", error);
        return c.json({ error: "Search failed" }, 500);
      }
    }
  )

  // ======================= Reindex =======================

  .get("/reindex/status", authMiddleware, (c) => {
    const progress = getLatestJobProgress();
    return c.json(progress);
  })

  .post("/reindex/start", authMiddleware, async (c) => {
    // Check if reindex is already running
    if (hasActiveJob()) {
      return c.json({ error: "Reindex already in progress" }, 409);
    }

    // Get all files from S3
    const allFiles = await FILESYSTEM.listAllObjects();

    // Filter out directories
    const filesToIndex = allFiles.filter((f) => f.Key && !f.Key.endsWith("/"));

    if (filesToIndex.length === 0) {
      return c.json({ error: "No files to index" }, 400);
    }

    // Create job and queue files
    const jobId = createJob();

    const files = filesToIndex.map((file) => ({
      path: file.Key || "",
      size: file.Size || 0,
      mimeType: (mime.lookup(file.Key || "") || null) as string | null,
    }));

    queueFiles(jobId, files);
    updateJobTotalFiles(jobId, files.length);

    console.log(`Created reindex job ${jobId} with ${files.length} files`);

    return c.json({
      success: true,
      jobId,
      totalFiles: files.length,
    });
  })

  .post("/reindex/cancel", authMiddleware, (c) => {
    cancelActiveJobs();
    return c.json({ success: true });
  })

  .get("/reindex/jobs", authMiddleware, (c) => {
    const limit = parseInt(c.req.query("limit") || "10", 10);
    const jobs = getRecentJobs(limit);
    return c.json({ jobs });
  });

// Export the app type for hono/client RPC
export type AppType = typeof app;

// ======================= Start Server =======================

console.log(`Server is running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 0, // Disable idle timeout - needed for long-running SSE streams (reindex)
};
