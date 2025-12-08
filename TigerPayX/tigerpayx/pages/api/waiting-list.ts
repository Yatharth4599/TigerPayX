import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name, company, role, useCase } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email already exists
    const existing = await prisma.waitingList.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You're already on the waiting list!",
        alreadyExists: true,
      });
    }

    // Create waiting list entry
    const entry = await prisma.waitingList.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        company: company?.trim() || null,
        role: role || null,
        useCase: useCase?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Successfully joined the waiting list!",
      entry: {
        id: entry.id,
        email: entry.email,
      },
    });
  } catch (error: any) {
    console.error("Waiting list error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });
    
    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "This email is already on the waiting list.",
      });
    }

    // Handle database connection errors
    if (
      error.code === "P1001" || 
      error.code === "P1000" ||
      error.message?.includes("connect") ||
      error.message?.includes("Can't reach database") ||
      error.message?.includes("Environment variable not found")
    ) {
      console.error("Database connection error:", error);
      return res.status(503).json({
        error: "Database connection failed. Please configure DATABASE_URL in Vercel environment variables.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    // Handle schema/migration errors
    if (error.code === "P2021" || error.message?.includes("does not exist")) {
      console.error("Database schema error:", error);
      return res.status(503).json({
        error: "Database table not found. Please run migrations.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    return res.status(500).json({
      error: "Failed to join waiting list. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

