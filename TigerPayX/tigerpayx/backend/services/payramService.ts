// PayRam service integration
// PayRam is a self-hosted Docker application
// See PAYRAM_SETUP.md for deployment instructions

import { PAYRAM_CONFIG } from "@/shared/config";

/**
 * Check if PayRam is configured
 */
function isPayRamConfigured(): boolean {
  return PAYRAM_CONFIG.enabled && !!PAYRAM_CONFIG.apiUrl;
}

/**
 * Register merchant with PayRam
 * PayRam API endpoints may vary - check PayRam documentation for exact endpoints
 */
export async function registerPayRamMerchant(data: {
  name: string;
  settlementAddress: string;
  preferredToken: string;
}): Promise<{
  success: boolean;
  payramMerchantId?: string;
  error?: string;
}> {
  if (!isPayRamConfigured()) {
    return {
      success: false,
      error: "PayRam is not configured. Please set PAYRAM_API_URL in environment variables.",
    };
  }

  try {
    // PayRam API endpoint structure - adjust based on actual PayRam API documentation
    // Common patterns: /api/merchants, /merchants, /v1/merchants
    const endpoint = `${PAYRAM_CONFIG.apiUrl}/api/merchants`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Add authentication if API key is provided
    if (PAYRAM_CONFIG.apiKey) {
      headers["Authorization"] = `Bearer ${PAYRAM_CONFIG.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: data.name,
        settlementAddress: data.settlementAddress,
        preferredToken: data.preferredToken,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || "Failed to register with PayRam",
      };
    }

    return {
      success: true,
      payramMerchantId: result.merchantId || result.id || result.data?.merchantId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error connecting to PayRam",
    };
  }
}

/**
 * Verify payment with PayRam
 * PayRam API endpoints may vary - check PayRam documentation for exact endpoints
 */
export async function verifyPayRamPayment(data: {
  merchantId: string;
  txHash: string;
  amount: string;
  token: string;
  metadata?: any;
}): Promise<{
  success: boolean;
  verified?: boolean;
  error?: string;
}> {
  if (!isPayRamConfigured()) {
    return {
      success: false,
      error: "PayRam is not configured. Payment verification skipped.",
    };
  }

  try {
    // PayRam API endpoint structure - adjust based on actual PayRam API documentation
    // Common patterns: /api/verify, /api/transactions/verify, /verify
    const endpoint = `${PAYRAM_CONFIG.apiUrl}/api/verify`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Add authentication if API key is provided
    if (PAYRAM_CONFIG.apiKey) {
      headers["Authorization"] = `Bearer ${PAYRAM_CONFIG.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
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
        error: result.error || result.message || "PayRam verification failed",
      };
    }

    return {
      success: true,
      verified: result.verified === true || result.status === "verified",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error connecting to PayRam",
    };
  }
}

/**
 * Get merchant status from PayRam
 * PayRam API endpoints may vary - check PayRam documentation for exact endpoints
 */
export async function getPayRamMerchantStatus(payramMerchantId: string): Promise<{
  success: boolean;
  status?: any;
  error?: string;
}> {
  if (!isPayRamConfigured()) {
    return {
      success: false,
      error: "PayRam is not configured",
    };
  }

  try {
    // PayRam API endpoint structure - adjust based on actual PayRam API documentation
    const endpoint = `${PAYRAM_CONFIG.apiUrl}/api/merchants/${payramMerchantId}`;
    
    const headers: HeadersInit = {};
    
    // Add authentication if API key is provided
    if (PAYRAM_CONFIG.apiKey) {
      headers["Authorization"] = `Bearer ${PAYRAM_CONFIG.apiKey}`;
    }

    const response = await fetch(endpoint, {
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || "Failed to get merchant status",
      };
    }

    return {
      success: true,
      status: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error connecting to PayRam",
    };
  }
}

