// Public API route: Get PayLink by ID (no auth required for payment)

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { payLinkId } = req.query;

    if (!payLinkId || typeof payLinkId !== "string") {
      return res.status(400).json({ error: "PayLink ID required" });
    }

    // Handle demo pay links (stored in database with demo- prefix)
    if (payLinkId.startsWith("demo-")) {
      const payLink = await prisma.payLink.findUnique({
        where: { payLinkId },
        include: {
          merchant: {
            select: {
              merchantId: true,
              name: true,
              settlementAddress: true,
              logoUrl: true,
            },
          },
        },
      });

      if (payLink) {
        // Check if expired
        const isExpired = payLink.expiresAt && new Date(payLink.expiresAt) < new Date();
        if (isExpired && payLink.status === "pending") {
          return res.status(400).json({ error: "PayLink has expired" });
        }

        // Check if already paid
        if (payLink.status === "paid") {
          return res.status(400).json({ error: "PayLink has already been paid" });
        }

        return res.status(200).json({
          success: true,
          payLink: {
            id: payLink.id,
            payLinkId: payLink.payLinkId,
            merchantId: payLink.merchant.merchantId,
            merchantName: payLink.merchant.name,
            merchantLogo: payLink.merchant.logoUrl,
            settlementAddress: payLink.merchant.settlementAddress,
            amount: payLink.amount,
            token: payLink.token,
            description: payLink.description,
            status: payLink.status,
            createdAt: payLink.createdAt.toISOString(),
            expiresAt: payLink.expiresAt?.toISOString(),
          },
        });
      }
      
      // If demo link not found in DB, return a generic demo response
      // This allows demo links to work even if not in database
      return res.status(200).json({
        success: true,
        payLink: {
          id: payLinkId,
          payLinkId: payLinkId,
          merchantId: "demo-merchant-001",
          merchantName: "Demo Merchant",
          settlementAddress: "11111111111111111111111111111111",
          amount: "10",
          token: "USDC",
          description: "Demo payment link",
          status: "pending",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    // Get PayLink (public access for payment)
    const payLink = await prisma.payLink.findUnique({
      where: { payLinkId },
      include: {
        merchant: {
          select: {
            merchantId: true,
            name: true,
            settlementAddress: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!payLink) {
      return res.status(404).json({ error: "PayLink not found" });
    }

    // Check if expired
    const isExpired = payLink.expiresAt && new Date(payLink.expiresAt) < new Date();
    if (isExpired && payLink.status === "pending") {
      return res.status(400).json({ error: "PayLink has expired" });
    }

    // Check if already paid
    if (payLink.status === "paid") {
      return res.status(400).json({ error: "PayLink has already been paid" });
    }

    return res.status(200).json({
      success: true,
      payLink: {
        id: payLink.id,
        payLinkId: payLink.payLinkId,
        merchantId: payLink.merchant.merchantId,
        merchantName: payLink.merchant.name,
        merchantLogo: payLink.merchant.logoUrl,
        settlementAddress: payLink.merchant.settlementAddress,
        amount: payLink.amount,
        token: payLink.token,
        description: payLink.description,
        status: payLink.status,
        createdAt: payLink.createdAt.toISOString(),
        expiresAt: payLink.expiresAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error getting PayLink:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

