import { z } from "zod";
// ======================= Auth Schemas =======================
export const LoginRequestSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});
export const LoginResponseSchema = z.object({
    status: z.enum(["success", "failure"]),
    token: z.string().optional(),
});
export const LogoutResponseSchema = z.object({
    status: z.literal("logged out"),
});
// ======================= File Operation Schemas =======================
export const RenameRequestSchema = z.object({
    source: z.string().min(1),
    dest: z.string().min(1),
    type: z.enum(["file", "dir"]),
});
export const DeleteRequestSchema = z.object({
    names: z.array(z.string().min(1)).min(1),
});
export const MkdirRequestSchema = z.object({
    name: z.string().min(1),
});
export const DirectoryRequestSchema = z.object({
    path: z.string().default(""),
});
export const FileRequestSchema = z.object({
    path: z.string().min(1),
});
// ======================= Response Schemas =======================
export const FileItemSchema = z.object({
    name: z.string().optional(),
    mimeType: z.union([z.string(), z.literal("dir"), z.literal(false)]),
    size: z.number().optional(),
    lastModified: z.date().optional(),
});
export const DirectoryListingResponseSchema = z.array(FileItemSchema);
