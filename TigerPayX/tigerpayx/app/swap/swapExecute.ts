// Execute Jupiter swaps

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { getSolanaConnection, getKeypairFromPrivateKey } from "@/app/wallet/solanaUtils";
import { getSwapTransaction, getSwapQuote, getOutputAmount, calculatePriceImpact } from "./jupiterRoutes";
import { TOKEN_DECIMALS, SOLANA_CONFIG } from "@/shared/config";
import { getStoredPrivateKey } from "@/app/wallet/createWallet";
import type { Token, SolanaTransactionResult } from "@/shared/types";

/**
 * Execute a token swap via Jupiter
 */
export async function executeSwap(
  inputToken: Token,
  outputToken: Token,
  amount: number,
  slippageBps: number = 50,
  privateKey?: string
): Promise<SolanaTransactionResult> {
  try {
    // Get private key
    const key = privateKey || getStoredPrivateKey();
    if (!key) {
      throw new Error("No wallet found. Please create or import a wallet.");
    }

    const keypair = getKeypairFromPrivateKey(key);
    const userPublicKey = keypair.publicKey.toBase58();

    // Get quote
    const quote = await getSwapQuote(inputToken, outputToken, amount, slippageBps);
    if (!quote) {
      throw new Error("Failed to get swap quote");
    }

    // Get swap transaction
    const swapTransactionBase64 = await getSwapTransaction(quote, userPublicKey);
    if (!swapTransactionBase64) {
      throw new Error("Failed to get swap transaction");
    }

    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransactionBase64, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign transaction
    transaction.sign([keypair]);

    // Send transaction
    const connection = getSolanaConnection();
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      maxRetries: 3,
    });

    // Wait for confirmation
    await connection.confirmTransaction(signature, "confirmed");

    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    return {
      signature: "",
      success: false,
      error: error.message || "Swap failed",
    };
  }
}

/**
 * Get swap preview (quote without executing)
 */
export async function getSwapPreview(
  inputToken: Token,
  outputToken: Token,
  amount: number,
  slippageBps: number = 50
): Promise<{
  outputAmount: number;
  priceImpact: number;
  quote: any;
} | null> {
  try {
    const quote = await getSwapQuote(inputToken, outputToken, amount, slippageBps);
    if (!quote) {
      return null;
    }

    const outputDecimals = TOKEN_DECIMALS[outputToken] || 9;
    const outputAmount = getOutputAmount(quote, outputDecimals);
    const priceImpact = calculatePriceImpact(quote);

    return {
      outputAmount,
      priceImpact,
      quote,
    };
  } catch (error) {
    console.error("Error getting swap preview:", error);
    return null;
  }
}

