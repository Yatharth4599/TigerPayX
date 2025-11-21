// API route: Get all PayLinks for a merchant

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/utils/auth-middleware";
import { prisma } from "@/utils/db";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { merchantId } = req.query;

    if (!merchantId || typeof merchantId !== "string") {
      return res.status(400).json({ error: "Merchant ID required" });
    }

    // Verify merchant belongs to user
    const merchant = await prisma.merchant.findUnique({
      where: { merchantId },
    });

    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    if (merchant.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get all PayLinks for this merchant
    const payLinks = await prisma.payLink.findMany({
      where: {
        merchantId: merchant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      payLinks: payLinks.map((pl) => ({
        id: pl.id,
        payLinkId: pl.payLinkId,
        merchantId: merchant.merchantId,
        amount: pl.amount,
        token: pl.token,
        description: pl.description,
        status: pl.status,
        solanaTxHash: pl.solanaTxHash,
        createdAt: pl.createdAt.toISOString(),
        expiresAt: pl.expiresAt?.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Error getting PayLinks:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);

