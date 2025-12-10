import { SignJWT, jwtVerify } from "jose";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-me");
const JWT_EXPIRY = "24h";
export async function generateToken(user) {
    const token = await new SignJWT({ username: user.username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRY)
        .sign(JWT_SECRET);
    return token;
}
export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    }
    catch {
        return null;
    }
}
export async function validateCredentials(username, password) {
    const validUsername = process.env.AUTH_USER || "";
    const validPassword = process.env.AUTH_PASS || "";
    if (username === validUsername && password === validPassword) {
        return { username };
    }
    return null;
}
export async function authMiddleware(c, next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
        return c.json({ error: "Invalid or expired token" }, 401);
    }
    c.set("user", payload);
    await next();
}
