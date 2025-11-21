// API endpoint to update user's Solana wallet address in database
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAuth, AuthenticatedRequest } from "@/utils/auth-middleware";

type Data = {
  success?: boolean;
  message?: string;
  error?: string;
};

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const { solanaAddress } = req.body;

    if (!solanaAddress || typeof solanaAddress !== "string") {
      return res.status(400).json({ success: false, error: "Valid Solana address is required" });
    }

    // Validate Solana address format (basic check)
    if (solanaAddress.length < 32 || solanaAddress.length > 44) {
      return res.status(400).json({ success: false, error: "Invalid Solana address format" });
    }

    // Check if user already has a different wallet address
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { solanaAddress: true },
    });

    // If user already has a wallet address, don't allow changing it
    // This ensures one wallet per email
    if (existingUser?.solanaAddress && existingUser.solanaAddress !== solanaAddress) {
      return res.status(400).json({ 
        success: false,
        error: "You already have a wallet linked to this email. Please import your existing wallet instead of creating a new one." 
      });
    }

    // Update user's Solana address (link wallet to email)
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { solanaAddress },
    });

    return res.status(200).json({
      success: true,
      message: "Wallet address updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating wallet address:", error);
    
    // Handle unique constraint violation (address already taken)
    if (error.code === "P2002") {
      return res.status(400).json({ 
        success: false,
        error: "This wallet address is already associated with another account" 
      });
    }

    return res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: error.message || "Unknown error",
    });
  }
}

export default withAuth(handler);

