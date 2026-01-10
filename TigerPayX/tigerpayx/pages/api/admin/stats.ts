import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { withAdmin, AdminRequest } from "@/utils/admin-middleware";

type StatsResponse = {
  users: {
    total: number;
    verified: number;
    withWallet: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  transactions: {
    total: number;
    totalVolume: string;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: {
      send: number;
      swap: number;
      pay: number;
    };
    byToken: Record<string, number>;
  };
  merchants: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  payLinks: {
    total: number;
    paid: number;
    pending: number;
    expired: number;
    totalVolume: string;
  };
};

async function handler(req: AdminRequest, res: NextApiResponse<StatsResponse | { error: string }>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // User stats
    const [totalUsers, verifiedUsers, usersWithWallet, newUsersToday, newUsersThisWeek, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { solanaAddress: { not: null } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    // Transaction stats
    const allTransactions = await prisma.transaction.findMany({
      select: {
        type: true,
        amount: true,
        token: true,
        createdAt: true,
        status: true,
      },
    });

    const transactionsToday = allTransactions.filter(t => t.createdAt >= today);
    const transactionsThisWeek = allTransactions.filter(t => t.createdAt >= weekAgo);
    const transactionsThisMonth = allTransactions.filter(t => t.createdAt >= monthAgo);

    const byType = {
      send: allTransactions.filter(t => t.type === "send").length,
      swap: allTransactions.filter(t => t.type === "swap").length,
      pay: allTransactions.filter(t => t.type === "pay").length,
    };

    const byToken: Record<string, number> = {};
    allTransactions.forEach(t => {
      if (t.token) {
        byToken[t.token] = (byToken[t.token] || 0) + 1;
      }
    });

    // Calculate total volume (sum of all transaction amounts)
    const totalVolume = allTransactions
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0)
      .toFixed(2);

    // Merchant stats
    const [totalMerchants, activeMerchants, newMerchantsThisMonth] = await Promise.all([
      prisma.merchant.count(),
      prisma.merchant.count({
        where: {
          payLinks: {
            some: {
              createdAt: { gte: monthAgo },
            },
          },
        },
      }),
      prisma.merchant.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    // PayLink stats
    const allPayLinks = await prisma.payLink.findMany({
      select: {
        status: true,
        amount: true,
      },
    });

    const paidPayLinks = allPayLinks.filter(p => p.status === "paid");
    const pendingPayLinks = allPayLinks.filter(p => p.status === "pending");
    const expiredPayLinks = allPayLinks.filter(p => p.status === "expired");

    const payLinkVolume = allPayLinks
      .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0)
      .toFixed(2);

    return res.status(200).json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        withWallet: usersWithWallet,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      transactions: {
        total: allTransactions.length,
        totalVolume,
        today: transactionsToday.length,
        thisWeek: transactionsThisWeek.length,
        thisMonth: transactionsThisMonth.length,
        byType,
        byToken,
      },
      merchants: {
        total: totalMerchants,
        active: activeMerchants,
        newThisMonth: newMerchantsThisMonth,
      },
      payLinks: {
        total: allPayLinks.length,
        paid: paidPayLinks.length,
        pending: pendingPayLinks.length,
        expired: expiredPayLinks.length,
        totalVolume: payLinkVolume,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export default withAdmin(handler);

