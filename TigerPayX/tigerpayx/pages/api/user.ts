// Simplified user API for DeFi - returns user profile and Solana address
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAuth, AuthenticatedRequest } from "@/utils/auth-middleware";

type Data = {
  profile: {
    name: string;
    handle: string;
    avatarInitials: string;
  };
  solanaAddress?: string;
};

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<Data | { error: string; message?: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      profile: {
        name: user.name || "TigerPayX User",
        handle: user.handle || `@tiger.${user.id.slice(0, 6)}`,
        avatarInitials: user.avatarInitials || (user.name || "TX").slice(0, 2).toUpperCase(),
      },
      solanaAddress: user.solanaAddress || undefined,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message || "Unknown error",
    });
  }
}

export default withAuth(handler);
