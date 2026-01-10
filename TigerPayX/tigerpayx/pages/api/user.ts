// Simplified user API for DeFi - returns user profile and Solana address
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAuth, AuthenticatedRequest } from "@/utils/auth-middleware";

type Data = {
  user: {
    id: string;
    name: string;
    email: string;
    handle: string;
    avatarInitials: string;
    solanaAddress?: string;
    isAdmin?: boolean;
    fiatBalance?: number;
    preferredCurrency?: string;
    country?: string | null;
    cryptoBalance?: number;
    walletAddress?: string | null;
    autoOfframpEnabled?: boolean;
  };
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

    // Use select to avoid errors if emailVerified column doesn't exist in Prisma client
    // Try to get user - handle case where Prisma client might be out of sync with database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });
    } catch (prismaError: any) {
      // If error is due to missing column (P2022), try without selecting that field
      if (prismaError.code === "P2022" && prismaError.message?.includes("emailVerified")) {
        console.warn("Prisma client out of sync - querying without emailVerified field");
        // Use raw query or select specific fields
        user = await prisma.$queryRaw`
          SELECT id, email, name, handle, "avatarInitials", "solanaAddress", "isAdmin"
          FROM "User"
          WHERE id = ${req.user.userId}
        ` as any;
      } else {
        throw prismaError;
      }
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name || "TigerPayX User",
        email: user.email,
        handle: user.handle || `@tiger.${user.id.slice(0, 6)}`,
        avatarInitials: user.avatarInitials || (user.name || "TX").slice(0, 2).toUpperCase(),
        solanaAddress: user.solanaAddress || undefined,
        isAdmin: user.isAdmin || false,
        // New fields for fiat/crypto balance
        fiatBalance: (user as any).fiatBalance || 0,
        preferredCurrency: (user as any).preferredCurrency || 'INR',
        country: (user as any).country || null,
        cryptoBalance: (user as any).cryptoBalance || 0,
        walletAddress: (user as any).walletAddress || null,
        autoOfframpEnabled: (user as any).autoOfframpEnabled || false,
      },
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
