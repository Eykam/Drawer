import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import mime from "mime-types";
import path from "path";
import { S3Filesystem } from "./routes/files/Filesystem";
import { authMiddleware, generateToken, validateCredentials, } from "./routes/auth/auth";
import { LoginRequestSchema, RenameRequestSchema, DeleteRequestSchema, MkdirRequestSchema, DirectoryRequestSchema, FileRequestSchema, } from "./schemas/api";
// Load environment variables (Bun loads .env automatically, but this ensures compatibility)
if (typeof Bun === "undefined") {
    await import("dotenv").then((dotenv) => dotenv.config());
}
const FILESYSTEM = new S3Filesystem();
await FILESYSTEM.init();
const FRONTEND_DOMAIN = process.env.PUBLIC_DOMAIN || "";
const port = parseInt(process.env.PORT || "8000");
// Create base app with CORS
const app = new Hono()
    .use("*", cors({
    origin: FRONTEND_DOMAIN,
    credentials: true,
}))
    // ======================= Auth Routes =======================
    .post("/login", zValidator("json", LoginRequestSchema), async (c) => {
    try {
        const { username, password } = c.req.valid("json");
        const user = await validateCredentials(username, password);
        if (!user) {
            return c.json({ status: "failure" }, 403);
        }
        const token = await generateToken(user);
        return c.json({ status: "success", token });
    }
    catch (error) {
        console.error("Login error:", error);
        return c.json({ status: "failure" }, 403);
    }
})
    .post("/logout", (c) => {
    return c.json({ status: "logged out" }, 200);
})
    .post("/checkAuth", authMiddleware, (c) => {
    return c.json({ authenticated: true }, 200);
})
    .get("/test", (c) => {
    return c.text("test");
})
    .get("/testAuth", authMiddleware, (c) => {
    return c.text("Authorized!");
})
    // ======================= File Operations =======================
    .post("/rename", authMiddleware, zValidator("json", RenameRequestSchema), async (c) => {
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
                }
            }
            return c.json({ success: true }, 200);
        }
        else {
            console.log(`File Renaming ${source} => ${dest}`);
            const status = await FILESYSTEM.renameObject(source, dest);
            if (status) {
                return c.json({ success: true }, 200);
            }
        }
        return c.json({ success: false, error: "Rename failed" }, 400);
    }
    catch (err) {
        console.log("error renaming:", err);
        return c.json({ success: false, error: "Internal error" }, 500);
    }
})
    .post("/delete", authMiddleware, zValidator("json", DeleteRequestSchema), async (c) => {
    try {
        const { names } = c.req.valid("json");
        const status = await FILESYSTEM.deleteObjects(names);
        if (status) {
            return c.json({ success: true }, 200);
        }
        return c.json({ success: false, error: "Delete failed" }, 400);
    }
    catch (err) {
        console.log("error deleting:", err);
        return c.json({ success: false, error: "Internal error" }, 500);
    }
})
    .post("/mkdir", authMiddleware, zValidator("json", MkdirRequestSchema), async (c) => {
    try {
        const { name } = c.req.valid("json");
        const status = await FILESYSTEM.putObject(name, "dir");
        if (status) {
            return c.json({ success: true }, 200);
        }
        return c.json({ success: false, error: "Create directory failed" }, 400);
    }
    catch (err) {
        console.log("error creating directory:", err);
        return c.json({ success: false, error: "Internal error" }, 500);
    }
})
    .post("/upload", authMiddleware, async (c) => {
    try {
        const formData = await c.req.formData();
        const uploadPath = formData.get("uploadPath") || "";
        const files = formData.getAll("files");
        if (!files || files.length === 0) {
            return c.json({ success: false, error: "No files uploaded" }, 400);
        }
        console.log("files:", files);
        console.log("uploadPath", uploadPath);
        for (const file of files) {
            const key = uploadPath ? `${uploadPath}${file.name}` : file.name;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await FILESYSTEM.putObject(key, file.type, buffer);
        }
        return c.json({ success: true }, 200);
    }
    catch (error) {
        console.error("Error uploading files:", error);
        return c.json({ success: false, error: "Internal error" }, 500);
    }
})
    .post("/directory", authMiddleware, zValidator("json", DirectoryRequestSchema), async (c) => {
    try {
        const { path: dirPath } = c.req.valid("json");
        const isDir = (p) => p[p.length - 1] === "/" || p === "";
        console.log(`Listing directory: ${dirPath}`);
        const items = await FILESYSTEM.listObjects(dirPath);
        const contentList = items.map((item) => ({
            name: item.Key,
            mimeType: isDir(item.Key || "")
                ? "dir"
                : (mime.lookup(item.Key || "") || false),
            size: item.Size,
            lastModified: item.LastModified,
        }));
        return c.json(contentList);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: "Directory not found" }, 404);
    }
})
    .post("/file", authMiddleware, zValidator("json", FileRequestSchema), async (c) => {
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
    }
    catch (error) {
        console.error(error);
        return c.json({ error: "File not found" }, 404);
    }
});
// ======================= Start Server =======================
console.log(`Server is running at http://localhost:${port}`);
export default {
    port,
    fetch: app.fetch,
};
