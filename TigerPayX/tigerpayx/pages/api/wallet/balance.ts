import type { NextApiRequest, NextApiResponse } from "next";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    // Try multiple public RPC endpoints
    const rpcEndpoints = [
      "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
      "https://rpc.solana.com",
    ];

    let balance = null;
    let lastError = null;

    for (const endpoint of rpcEndpoints) {
      try {
        const connection = new Connection(endpoint, "confirmed");
        const publicKey = new PublicKey(walletAddress);
        const lamports = await connection.getBalance(publicKey);
        balance = lamports / LAMPORTS_PER_SOL;
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        console.error(`Failed to fetch from ${endpoint}:`, error.message);
        // Continue to next endpoint
        continue;
      }
    }

    if (balance === null) {
      return res.status(500).json({
        error: "Failed to fetch balance from all RPC endpoints",
        details: lastError?.message,
      });
    }

    return res.status(200).json({ balance, sol: balance });
  } catch (error: any) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({
      error: "Failed to fetch wallet balance",
      details: error.message,
    });
  }
}
