// API route: Create PayLink

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/utils/auth-middleware";
import { prisma } from "@/utils/db";
// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
import { PAYLINK_EXPIRY_HOURS } from "@/shared/constants";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { merchantId, amount, token, description, expiresInHours } = req.body;

    // Validate input
    if (!merchantId || !amount || !token) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validTokens = ["SOL", "USDC", "USDT", "TT"];
    if (!validTokens.includes(token)) {
      return res.status(400).json({ error: "Invalid token" });
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

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expiresInHours || PAYLINK_EXPIRY_HOURS));

    // Create PayLink
    const payLink = await prisma.payLink.create({
      data: {
        payLinkId: generateId(),
        merchantId: merchant.id,
        amount: amount.toString(),
        token,
        description: description || null,
        status: "pending",
        expiresAt,
      },
    });

    return res.status(201).json({
      success: true,
      payLink: {
        id: payLink.id,
        payLinkId: payLink.payLinkId,
        merchantId: merchant.merchantId,
        amount: payLink.amount,
        token: payLink.token,
        description: payLink.description,
        status: payLink.status,
        createdAt: payLink.createdAt.toISOString(),
        expiresAt: payLink.expiresAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error creating PayLink:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);

