// PayRam webhook and verification functions

import { PAYRAM_CONFIG } from "@/shared/config";

/**
 * Verify payment with PayRam API
 * Called by backend after Solana transaction is confirmed
 */
export async function verifyPaymentWithPayRam(data: {
  merchantId: string;
  txHash: string;
  amount: string;
  token: string;
  metadata?: any;
}): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  try {
    const response = await fetch(`${PAYRAM_CONFIG.apiUrl}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PAYRAM_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        merchantId: data.merchantId,
        transactionHash: data.txHash,
        amount: data.amount,
        token: data.token,
        metadata: data.metadata,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "PayRam verification failed",
      };
    }

    return {
      success: true,
      verified: result.verified === true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Register merchant with PayRam
 * Called by backend during merchant registration
 */
export async function registerMerchantWithPayRam(data: {
  name: string;
  settlementAddress: string;
  preferredToken: string;
}): Promise<{ success: boolean; payramMerchantId?: string; error?: string }> {
  try {
    const response = await fetch(`${PAYRAM_CONFIG.apiUrl}/merchants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PAYRAM_CONFIG.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to register with PayRam",
      };
    }

    return {
      success: true,
      payramMerchantId: result.merchantId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

