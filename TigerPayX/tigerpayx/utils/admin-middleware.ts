import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./db";
import { withAuth, AuthenticatedRequest } from "./auth-middleware";

export interface AdminRequest extends AuthenticatedRequest {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to check if user is an admin
 */
export function withAdmin(
  handler: (req: AdminRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withAuth(async (req: AdminRequest, res: NextApiResponse) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user is admin - handle case where isAdmin column might not exist
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { isAdmin: true },
        });
      } catch (prismaError: any) {
        // If error is due to missing column (P2022), use raw query
        if (prismaError.code === "P2022" && prismaError.message?.includes("isAdmin")) {
          const rawUsers = await prisma.$queryRaw`
            SELECT id FROM "User" WHERE id = ${req.user.userId}
          ` as any[];
          if (rawUsers.length === 0) {
            return res.status(403).json({ error: "Admin access required" });
          }
          // If column doesn't exist, deny access (migration not run)
          return res.status(403).json({ error: "Admin access not available. Please run database migration." });
        }
        throw prismaError;
      }

      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await handler(req, res);
    } catch (error: any) {
      console.error("Admin middleware error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

