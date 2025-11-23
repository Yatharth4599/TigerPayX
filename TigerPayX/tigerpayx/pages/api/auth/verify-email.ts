// API route: Verify email with OTP

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { generateToken } from "@/utils/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Verify OTP
    if (!user.emailVerificationToken || user.emailVerificationToken !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Check if OTP expired (10 minutes)
    if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });

    // Generate JWT token for immediate login
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        emailVerified: true,
      },
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

