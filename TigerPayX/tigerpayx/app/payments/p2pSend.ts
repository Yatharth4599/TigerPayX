// P2P wallet-to-wallet payment functions

import { sendPayment } from "@/app/wallet/sendTransaction";
import type { Token, SolanaTransactionResult } from "@/shared/types";

/**
 * Send P2P payment to another Solana address
 */
export async function sendP2PPayment(
  toAddress: string,
  token: Token,
  amount: number,
  description?: string
): Promise<SolanaTransactionResult> {
  // Validate address format
  if (!isValidSolanaAddress(toAddress)) {
    return {
      signature: "",
      success: false,
      error: "Invalid Solana address",
    };
  }

  // Send payment
  const result = await sendPayment(toAddress, token, amount);

  // If successful, log transaction (optional - can be done in UI)
  if (result.success && description) {
    // Transaction logging can be handled by backend API
    console.log("P2P payment sent:", {
      to: toAddress,
      token,
      amount,
      description,
      txHash: result.signature,
    });
  }

  return result;
}

/**
 * Validate Solana address
 */
function isValidSolanaAddress(address: string): boolean {
  try {
    // Basic validation - should be base58 and 32-44 chars
    if (!address || address.length < 32 || address.length > 44) {
      return false;
    }
    // More thorough validation would use PublicKey constructor
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
}

