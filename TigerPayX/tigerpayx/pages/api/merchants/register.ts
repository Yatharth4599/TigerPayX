// API route: Register merchant
// Next.js API route handler

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/utils/auth-middleware";
import { prisma } from "@/utils/db";
import { registerPayRamMerchant } from "@/backend/services/payramService";
import { isValidSolanaAddress } from "@/backend/services/solanaService";

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, logoUrl, settlementAddress, preferredToken } = req.body;

    // Validate input
    if (!name || !settlementAddress || !preferredToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isValidSolanaAddress(settlementAddress)) {
      return res.status(400).json({ error: "Invalid Solana address" });
    }

    const validTokens = ["SOL", "USDC", "USDT", "TT"];
    if (!validTokens.includes(preferredToken)) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Allow multiple merchants per user (removed restriction)
    // Users can register multiple merchants if needed

    // Register with PayRam (optional - will skip if PayRam not configured)
    let payramMerchantId: string | null = null;
    try {
      const payramResult = await registerPayRamMerchant({
        name,
        settlementAddress,
        preferredToken,
      });
      if (payramResult.success && payramResult.payramMerchantId) {
        payramMerchantId = payramResult.payramMerchantId;
      } else {
        console.warn("PayRam registration failed or not configured:", payramResult.error);
      }
    } catch (error) {
      console.warn("PayRam registration error (continuing without PayRam):", error);
    }

    // Create merchant in database
    const merchant = await prisma.merchant.create({
      data: {
        merchantId: generateId(),
        userId: req.user!.userId,
        name,
        logoUrl: logoUrl || null,
        settlementAddress,
        preferredToken,
        payramMerchantId: payramMerchantId,
      },
    });

    return res.status(201).json({
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
    console.error("Error registering merchant:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);
