import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAdmin, AdminRequest } from "@/utils/admin-middleware";

type TransactionData = {
  id: string;
  type: string;
  fromAddress: string | null;
  toAddress: string | null;
  amount: string | null;
  token: string | null;
  txHash: string | null;
  status: string;
  description: string | null;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
  };
};

async function handler(
  req: AdminRequest,
  res: NextApiResponse<{ transactions: TransactionData[]; total: number } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.transaction.count();

    // Get transactions with user info
    const transactions = await prisma.transaction.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    const transactionData: TransactionData[] = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      amount: tx.amount,
      token: tx.token,
      txHash: tx.txHash,
      status: tx.status,
      description: tx.description,
      createdAt: tx.createdAt,
      user: {
        email: tx.user.email,
        name: tx.user.name,
      },
    }));

    return res.status(200).json({
      transactions: transactionData,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAdmin(handler);

