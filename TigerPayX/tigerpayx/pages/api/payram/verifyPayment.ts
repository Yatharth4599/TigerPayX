// API route: Verify payment with PayRam

import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/utils/auth-middleware";
import { prisma } from "@/utils/db";
import { verifyPayRamPayment } from "@/backend/services/payramService";
import { verifyTransaction } from "@/backend/services/solanaService";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { payLinkId, txHash } = req.body;

    if (!payLinkId || !txHash) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get PayLink
    const payLink = await prisma.payLink.findUnique({
      where: { payLinkId },
      include: { merchant: true },
    });

    if (!payLink) {
      return res.status(404).json({ error: "PayLink not found" });
    }

    // Verify Solana transaction
    const txVerification = await verifyTransaction(txHash);
    if (!txVerification.success || !txVerification.confirmed) {
      return res.status(400).json({ error: "Transaction not confirmed" });
    }

    // Verify with PayRam (optional - will skip if PayRam not configured)
    if (payLink.merchant.payramMerchantId) {
      const payramVerification = await verifyPayRamPayment({
        merchantId: payLink.merchant.payramMerchantId,
        txHash,
        amount: payLink.amount,
        token: payLink.token,
        metadata: {
          payLinkId,
          merchantId: payLink.merchant.merchantId,
        },
      });

      if (!payramVerification.success || !payramVerification.verified) {
        console.warn("PayRam verification failed:", payramVerification.error);
        // Continue with payment even if PayRam verification fails
        // This allows payments to work without PayRam
      }
    } else {
      console.log("PayRam not configured for this merchant, skipping verification");
    }

    // Update PayLink status
    await prisma.payLink.update({
      where: { id: payLink.id },
      data: {
        status: "paid",
        solanaTxHash: txHash,
      },
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId: req.user!.userId,
        type: "pay",
        fromAddress: "", // Will be extracted from tx if needed
        toAddress: payLink.merchant.settlementAddress,
        amount: payLink.amount,
        token: payLink.token,
        txHash,
        status: "confirmed",
        description: payLink.description || `Payment to ${payLink.merchant.name}`,
      },
    });

    return res.status(200).json({
      success: true,
      verified: true,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAuth(handler);

