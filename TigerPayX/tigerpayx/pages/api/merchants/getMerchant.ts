// API route: Get merchant

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

    const merchant = await prisma.merchant.findUnique({
      where: { merchantId },
    });

    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Check if user owns this merchant or is requesting their own
    if (merchant.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      merchant: {
        id: merchant.id,
        merchantId: merchant.merchantId,
        userId: merchant.userId,
        name: merchant.name,
        logoUrl: merchant.logoUrl,
        settlementAddress: merchant.settlementAddress,
        preferredToken: merchant.preferredToken,
        payramMerchantId: merchant.payramMerchantId,
        createdAt: merchant.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error getting merchant:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);

