import { Context, Next } from "hono";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me"
);
const JWT_EXPIRY = "24h";

interface User {
  username: string;
}

interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}

export async function generateToken(user: User): Promise<string> {
  const token = await new SignJWT({ username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const validUsername = process.env.AUTH_USER || "";
  const validPassword = process.env.AUTH_PASS || "";

  if (username === validUsername && password === validPassword) {
    return { username };
  }

  return null;
}

export async function authMiddleware(c: Context, next: Next) {
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
