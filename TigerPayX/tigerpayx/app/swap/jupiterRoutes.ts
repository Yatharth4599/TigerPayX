// Jupiter Aggregator API integration for token swaps

import { JUPITER_CONFIG, getTokenMint, TOKEN_DECIMALS, SOLANA_CONFIG } from "@/shared/config";
import type { Token, JupiterQuoteResponse } from "@/shared/types";

/**
 * Get swap quote from Jupiter
 */
export async function getSwapQuote(
  inputToken: Token,
  outputToken: Token,
  amount: number,
  slippageBps: number = 50 // 0.5% default slippage
): Promise<JupiterQuoteResponse | null> {
  try {
    const network = SOLANA_CONFIG.network;
    const inputMint = getTokenMint(inputToken, network);
    const outputMint = getTokenMint(outputToken, network);
    const decimals = TOKEN_DECIMALS[inputToken] || 9;
    
    // Convert amount to smallest unit
    const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals)).toString();

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountInSmallestUnit,
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: "false",
      asLegacyTransaction: "false",
    });

    const response = await fetch(`${JUPITER_CONFIG.apiUrl}/quote?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const data: JupiterQuoteResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting swap quote:", error);
    return null;
  }
}

/**
 * Get swap transaction from Jupiter
 */
export async function getSwapTransaction(
  quote: JupiterQuoteResponse,
  userPublicKey: string
): Promise<string | null> {
  try {
    const response = await fetch(JUPITER_CONFIG.swapApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`Jupiter swap API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.swapTransaction; // Base64 encoded transaction
  } catch (error) {
    console.error("Error getting swap transaction:", error);
    return null;
  }
}

/**
 * Calculate price impact percentage
 */
export function calculatePriceImpact(quote: JupiterQuoteResponse): number {
  return quote.priceImpactPct || 0;
}

/**
 * Get estimated output amount from quote
 */
export function getOutputAmount(quote: JupiterQuoteResponse, outputDecimals: number): number {
  const amount = BigInt(quote.outAmount);
  return Number(amount) / Math.pow(10, outputDecimals);
}

