import type { NextApiRequest, NextApiResponse } from "next";
import { createWithdrawOrder } from "@/utils/onmeta";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      bankAccountNumber,
      ifscCode,
      routingNumber,
      bankCode,
      accountHolderName,
      userId,
    } = req.body;

    // Validate required fields
    if (!fiatCurrency || !fiatAmount || !cryptoCurrency || !bankAccountNumber || !accountHolderName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fiatCurrency, fiatAmount, cryptoCurrency, bankAccountNumber, accountHolderName",
      });
    }

    // Validate currency
    if (!["INR", "PHP", "IDR"].includes(fiatCurrency)) {
      return res.status(400).json({
        success: false,
        error: "Invalid fiatCurrency. Must be INR, PHP, or IDR",
      });
    }

    // Validate currency-specific bank code
    if (fiatCurrency === "INR" && !ifscCode) {
      return res.status(400).json({
        success: false,
        error: "IFSC code is required for INR withdrawals",
      });
    }
    if (fiatCurrency === "PHP" && !routingNumber) {
      return res.status(400).json({
        success: false,
        error: "Routing number is required for PHP withdrawals",
      });
    }
    if (fiatCurrency === "IDR" && !bankCode) {
      return res.status(400).json({
        success: false,
        error: "Bank code is required for IDR withdrawals",
      });
    }

    // Validate amount
    if (typeof fiatAmount !== "number" || fiatAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "fiatAmount must be a positive number",
      });
    }

    // Create withdrawal order
    const result = await createWithdrawOrder({
      fiatCurrency,
      fiatAmount,
      cryptoCurrency: cryptoCurrency || "USDC",
      bankAccountNumber,
      ifscCode: ifscCode || undefined,
      routingNumber: routingNumber || undefined,
      bankCode: bankCode || undefined,
      accountHolderName,
      userId: userId || undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Withdrawal API error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
