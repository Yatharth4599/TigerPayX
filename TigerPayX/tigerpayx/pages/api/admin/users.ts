import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAdmin, AdminRequest } from "@/utils/admin-middleware";

type UserData = {
  id: string;
  email: string;
  name: string | null;
  handle: string | null;
  emailVerified: boolean;
  solanaAddress: string | null;
  createdAt: Date;
  transactionCount: number;
  merchantCount: number;
};

async function handler(
  req: AdminRequest,
  res: NextApiResponse<{ users: UserData[]; total: number } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.user.count();

    // Get users with related counts
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        emailVerified: true,
        solanaAddress: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            merchants: true,
          },
        },
      },
    });

    const userData: UserData[] = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      emailVerified: user.emailVerified || false,
      solanaAddress: user.solanaAddress,
      createdAt: user.createdAt,
      transactionCount: user._count.transactions,
      merchantCount: user._count.merchants,
    }));

    return res.status(200).json({
      users: userData,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAdmin(handler);

