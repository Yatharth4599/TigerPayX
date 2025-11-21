// API route: Get all merchants for current user

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/utils/auth-middleware";
import { prisma } from "@/utils/db";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get all merchants for the current user
    const merchants = await prisma.merchant.findMany({
      where: {
        userId: req.user!.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      merchants: merchants.map((merchant) => ({
        id: merchant.id,
        merchantId: merchant.merchantId,
        userId: merchant.userId,
        name: merchant.name,
        logoUrl: merchant.logoUrl,
        settlementAddress: merchant.settlementAddress,
        preferredToken: merchant.preferredToken,
        payramMerchantId: merchant.payramMerchantId,
        createdAt: merchant.createdAt.toISOString(),
        updatedAt: merchant.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Error getting merchants:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);

