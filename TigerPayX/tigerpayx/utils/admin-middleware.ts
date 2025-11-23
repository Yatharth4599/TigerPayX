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

      // Check if user is admin - handle case where isAdmin column might not exist in Prisma client
      let isAdmin = false;
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { isAdmin: true },
        });
        isAdmin = user?.isAdmin || false;
      } catch (prismaError: any) {
        // If error is due to missing column (P2022), use raw query
        if (prismaError.code === "P2022" || prismaError.message?.includes("isAdmin") || prismaError.message?.includes("Unknown column")) {
          console.warn("Prisma client out of sync - using raw query to check admin status");
          try {
            const rawUsers = await prisma.$queryRaw`
              SELECT "isAdmin" FROM "User" WHERE id = ${req.user.userId}
            ` as any[];
            if (rawUsers.length > 0) {
              isAdmin = rawUsers[0].isAdmin === true || rawUsers[0].isAdmin === 'true';
            }
          } catch (rawError: any) {
            // If raw query also fails, try without isAdmin column (migration not run)
            console.error("Raw query failed:", rawError);
            // Try to get user by email to verify they exist
            const userByEmail = await prisma.user.findUnique({
              where: { id: req.user.userId },
              select: { id: true, email: true },
            });
            if (!userByEmail) {
              return res.status(403).json({ error: "User not found" });
            }
            // If we can't check isAdmin, deny access
            return res.status(403).json({ error: "Admin access not available. Please run database migration." });
          }
        } else {
          console.error("Prisma error checking admin:", prismaError);
          throw prismaError;
        }
      }

      if (!isAdmin) {
        console.log(`Access denied for user ${req.user.userId} - isAdmin: ${isAdmin}`);
        return res.status(403).json({ error: "Admin access required" });
      }

      console.log(`Admin access granted for user ${req.user.userId}`);

      await handler(req, res);
    } catch (error: any) {
      console.error("Admin middleware error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

