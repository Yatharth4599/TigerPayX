import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAdmin, AdminRequest } from "@/utils/admin-middleware";

/**
 * API route to set a user as admin
 * Only existing admins can set other users as admin
 */
async function handler(req: AdminRequest, res: NextApiResponse<{ success: boolean; message: string } | { error: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ error: "Either userId or email is required" });
    }

    // Find user by userId or email
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user to admin
    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    });

    return res.status(200).json({
      success: true,
      message: `User ${user.email} has been set as admin`,
    });
  } catch (error: any) {
    console.error("Error setting admin:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAdmin(handler);

