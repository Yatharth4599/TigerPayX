import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, extractTokenFromHeader } from "./jwt";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  const token = extractTokenFromHeader(req.headers.authorization) ||
                req.cookies?.token ||
                req.query.token as string;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = payload;
  next();
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization) ||
                    req.cookies?.token ||
                    req.query.token as string;

      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      req.user = payload;
      await handler(req, res);
    } catch (error: any) {
      console.error("Auth middleware error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}

