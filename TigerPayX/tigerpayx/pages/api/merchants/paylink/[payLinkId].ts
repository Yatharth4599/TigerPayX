// API route: Get PayLink by ID

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/utils/auth-middleware";
import { prisma } from "@/utils/db";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { payLinkId } = req.query;

    if (!payLinkId || typeof payLinkId !== "string") {
      return res.status(400).json({ error: "PayLink ID required" });
    }

    // Get PayLink
    const payLink = await prisma.payLink.findUnique({
      where: { payLinkId },
      include: {
        merchant: true,
      },
    });

    if (!payLink) {
      return res.status(404).json({ error: "PayLink not found" });
    }

    // Verify merchant belongs to user (for private access)
    if (payLink.merchant.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      payLink: {
        id: payLink.id,
        payLinkId: payLink.payLinkId,
        merchantId: payLink.merchant.merchantId,
        amount: payLink.amount,
        token: payLink.token,
        description: payLink.description,
        status: payLink.status,
        solanaTxHash: payLink.solanaTxHash,
        createdAt: payLink.createdAt.toISOString(),
        expiresAt: payLink.expiresAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error getting PayLink:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);

