import { z } from "zod";
export declare const LoginRequestSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const LoginResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["success", "failure"]>;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "success" | "failure";
    token?: string | undefined;
}, {
    status: "success" | "failure";
    token?: string | undefined;
}>;
export declare const LogoutResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"logged out">;
}, "strip", z.ZodTypeAny, {
    status: "logged out";
}, {
    status: "logged out";
}>;
export declare const RenameRequestSchema: z.ZodObject<{
    source: z.ZodString;
    dest: z.ZodString;
    type: z.ZodEnum<["file", "dir"]>;
}, "strip", z.ZodTypeAny, {
    type: "file" | "dir";
    source: string;
    dest: string;
}, {
    type: "file" | "dir";
    source: string;
    dest: string;
}>;
export declare const DeleteRequestSchema: z.ZodObject<{
    names: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    names: string[];
}, {
    names: string[];
}>;
export declare const MkdirRequestSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const DirectoryRequestSchema: z.ZodObject<{
    path: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path?: string | undefined;
}>;
export declare const FileRequestSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const FileItemSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodUnion<[z.ZodString, z.ZodLiteral<"dir">, z.ZodLiteral<false>]>;
    size: z.ZodOptional<z.ZodNumber>;
    lastModified: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    mimeType: string | false;
    name?: string | undefined;
    size?: number | undefined;
    lastModified?: Date | undefined;
}, {
    mimeType: string | false;
    name?: string | undefined;
    size?: number | undefined;
    lastModified?: Date | undefined;
}>;
export declare const DirectoryListingResponseSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodUnion<[z.ZodString, z.ZodLiteral<"dir">, z.ZodLiteral<false>]>;
    size: z.ZodOptional<z.ZodNumber>;
    lastModified: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    mimeType: string | false;
    name?: string | undefined;
    size?: number | undefined;
    lastModified?: Date | undefined;
}, {
    mimeType: string | false;
    name?: string | undefined;
    size?: number | undefined;
    lastModified?: Date | undefined;
}>, "many">;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type RenameRequest = z.infer<typeof RenameRequestSchema>;
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>;
export type MkdirRequest = z.infer<typeof MkdirRequestSchema>;
export type DirectoryRequest = z.infer<typeof DirectoryRequestSchema>;
export type FileRequest = z.infer<typeof FileRequestSchema>;
export type FileItem = z.infer<typeof FileItemSchema>;
export type DirectoryListingResponse = z.infer<typeof DirectoryListingResponseSchema>;
