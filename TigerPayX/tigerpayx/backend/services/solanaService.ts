// Backend Solana service (read-only, no private keys)

import { Connection, PublicKey } from "@solana/web3.js";
import { SOLANA_CONFIG } from "@/shared/config";

/**
 * Get Solana connection (backend)
 */
export function getSolanaConnection(): Connection {
  const rpcUrl = SOLANA_CONFIG.network === "mainnet-beta" 
    ? SOLANA_CONFIG.rpcUrl 
    : SOLANA_CONFIG.devnetRpcUrl;
  return new Connection(rpcUrl, "confirmed");
}

/**
 * Verify Solana transaction
 */
export async function verifyTransaction(txHash: string): Promise<{
  success: boolean;
  confirmed: boolean;
  blockTime?: number;
  error?: string;
}> {
  try {
    const connection = getSolanaConnection();
    const signature = txHash;

    // Get transaction status
    const status = await connection.getSignatureStatus(signature);
    
    if (!status || !status.value) {
      return {
        success: false,
        confirmed: false,
        error: "Transaction not found",
      };
    }

    // Get transaction details
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return {
        success: false,
        confirmed: false,
        error: "Transaction details not found",
      };
    }

    return {
      success: true,
      confirmed: status.value.confirmationStatus === "confirmed" || status.value.confirmationStatus === "finalized",
      blockTime: tx.blockTime || undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      confirmed: false,
      error: error.message || "Verification failed",
    };
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(txHash: string): Promise<{
  success: boolean;
  transaction?: any;
  error?: string;
}> {
  try {
    const connection = getSolanaConnection();
    const tx = await connection.getTransaction(txHash, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      transaction: tx,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get transaction",
    };
  }
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

