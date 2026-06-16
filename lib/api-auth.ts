import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "./auth";

/**
 * Returns the current session for an API route, or null if unauthenticated.
 */
export function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions);
}

/**
 * Resolves the session and sends a 401 if the request is unauthenticated.
 * Returns null when the response has already been ended.
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "You must be signed in" });
    return null;
  }
  return session;
}

/**
 * Like requireAuth but additionally enforces the ADMIN role.
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session | null> {
  const session = await requireAuth(req, res);
  if (!session) {
    return null;
  }
  if (session.user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }
  return session;
}
