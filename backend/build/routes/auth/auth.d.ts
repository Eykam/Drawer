import { Context, Next } from "hono";
interface User {
    username: string;
}
interface JWTPayload {
    username: string;
    iat: number;
    exp: number;
}
export declare function generateToken(user: User): Promise<string>;
export declare function verifyToken(token: string): Promise<JWTPayload | null>;
export declare function validateCredentials(username: string, password: string): Promise<User | null>;
export declare function authMiddleware(c: Context, next: Next): Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">) | undefined>;
export {};
