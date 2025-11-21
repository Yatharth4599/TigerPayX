import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAuth, AuthenticatedRequest } from "@/utils/auth-middleware";

type UpdateProfileRequest = {
  name?: string;
  handle?: string;
};

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get user profile
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          avatarInitials: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        profile: user,
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    // Update user profile
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { name, handle } = req.body as UpdateProfileRequest;

      const updateData: {
        name?: string;
        handle?: string;
        avatarInitials?: string;
      } = {};

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({ error: "Name cannot be empty" });
        }
        updateData.name = name.trim();
        // Update avatar initials if name changed
        updateData.avatarInitials = name
          .trim()
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }

      if (handle !== undefined) {
        if (handle.trim()) {
          // Clean and validate handle
          const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
          if (cleanHandle.length === 0) {
            return res.status(400).json({ error: "Invalid handle format" });
          }
          
          const finalHandle = `@${cleanHandle}`;
          
          // Check if handle is already taken by another user
          const existingUser = await prisma.user.findUnique({
            where: { handle: finalHandle },
          });

          if (existingUser && existingUser.id !== req.user.userId) {
            return res.status(400).json({ error: "Handle is already taken" });
          }

          updateData.handle = finalHandle;
        } else {
          return res.status(400).json({ error: "Handle cannot be empty" });
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          avatarInitials: true,
          createdAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedUser,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.code === "P2002") {
        // Unique constraint violation
        return res.status(400).json({ error: "Handle is already taken" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withAuth(handler);

