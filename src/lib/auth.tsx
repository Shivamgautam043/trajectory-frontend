// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getUserFromToken() {
  const token = (await cookies()).get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      name: string;
      email: string;
    };

    return {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };
  } catch (err) {
    console.error("[AUTH] Invalid token", err);
    return null;
  }
}
