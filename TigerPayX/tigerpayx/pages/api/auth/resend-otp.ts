// API route: Resend OTP

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { sendEmail, generateOTPEmail } from "@/utils/email";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
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

    // Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: otp,
        emailVerificationTokenExpires: expiresAt,
      },
    });

    // Send OTP email
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify Your Email - TigerPayX",
      html: generateOTPEmail(otp, user.name || undefined),
    });

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      // Still return success to user (don't reveal email service issues)
      // But log the error for debugging
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

