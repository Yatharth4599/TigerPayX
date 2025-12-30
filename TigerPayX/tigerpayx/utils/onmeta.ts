/**
 * OnMeta API Integration Utilities
 * Documentation: https://onmeta.in/helpcenter
 */

// OnMeta API Configuration
// These should be set via environment variables in .env.local
// Based on OnMeta documentation: platform.onmeta.in is the base URL
const ONMETA_API_BASE_URL = process.env.ONMETA_API_BASE_URL || "https://platform.onmeta.in";
const ONMETA_CLIENT_ID = process.env.ONMETA_CLIENT_ID || "";
const ONMETA_CLIENT_SECRET = process.env.ONMETA_CLIENT_SECRET || "";

if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
  console.warn("OnMeta API credentials not found in environment variables. Please set ONMETA_CLIENT_ID and ONMETA_CLIENT_SECRET in .env.local");
}

export interface OnMetaDepositRequest {
  fiatCurrency: "INR" | "PHP" | "IDR";
  fiatAmount: number;
  cryptoCurrency: string; // e.g., "USDC", "USDT"
  walletAddress: string;
  userId?: string;
  redirectUrl?: string;
}

export interface OnMetaWithdrawRequest {
  fiatCurrency: "INR" | "PHP" | "IDR";
  fiatAmount: number;
  cryptoCurrency: string;
  bankAccountNumber: string;
  ifscCode?: string; // For INR
  routingNumber?: string; // For PHP
  bankCode?: string; // For IDR
  accountHolderName: string;
  userId?: string;
}

export interface OnMetaDepositResponse {
  success: boolean;
  orderId?: string;
  depositUrl?: string;
  transactionId?: string;
  error?: string;
  message?: string;
}

export interface OnMetaWithdrawResponse {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  error?: string;
  message?: string;
}

/**
 * Create a deposit order via OnMeta API
 */
export async function createDepositOrder(request: OnMetaDepositRequest): Promise<OnMetaDepositResponse> {
  try {
    if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
      console.error("OnMeta credentials missing:", { hasClientId: !!ONMETA_CLIENT_ID, hasSecret: !!ONMETA_CLIENT_SECRET });
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please check your environment variables.",
      };
    }

    const requestBody = {
      fiatCurrency: request.fiatCurrency,
      fiatAmount: request.fiatAmount,
      cryptoCurrency: request.cryptoCurrency,
      walletAddress: request.walletAddress,
      userId: request.userId,
      redirectUrl: request.redirectUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
    };

    const apiUrl = `${ONMETA_API_BASE_URL}/api/v1/deposit`;
    console.log("OnMeta deposit request:", {
      url: apiUrl,
      method: "POST",
      hasCredentials: !!(ONMETA_CLIENT_ID && ONMETA_CLIENT_SECRET),
      body: { ...requestBody, walletAddress: requestBody.walletAddress?.slice(0, 8) + '...' },
    });

    // OnMeta API endpoint for creating deposit orders
    // Note: Endpoint path may vary - check OnMeta API documentation
    // Common patterns: /api/v1/deposit, /v1/deposit, /deposit, /api/deposit
    let response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ONMETA_CLIENT_ID,
          "Authorization": `Bearer ${ONMETA_CLIENT_SECRET}`,
        },
        body: JSON.stringify(requestBody),
      });
      console.log("OnMeta API response status:", response.status, response.statusText);
    } catch (fetchError: any) {
      console.error("OnMeta API fetch failed:", fetchError);
      return {
        success: false,
        error: `Failed to connect to OnMeta API: ${fetchError?.message || fetchError?.toString() || 'Network error'}. Please check the API endpoint and your internet connection.`,
      };
    }

    // Try to parse JSON response
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
      console.log("OnMeta API response data:", data);
    } catch (parseError) {
      console.error("Failed to parse OnMeta API response as JSON");
      return {
        success: false,
        error: `Invalid response from OnMeta API: ${response.status} ${response.statusText}`,
      };
    }

    if (!response.ok) {
      console.error("OnMeta API Error:", data);
      return {
        success: false,
        error: data.message || data.error || data.errorMessage || `Failed to create deposit order: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      orderId: data.orderId || data.id || data.order_id,
      depositUrl: data.depositUrl || data.url || data.deposit_url || data.checkout_url || data.redirectUrl,
      transactionId: data.transactionId || data.transaction_id,
      message: data.message,
    };
  } catch (error: any) {
    console.error("OnMeta deposit order error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred while contacting OnMeta API",
    };
  }
}

/**
 * Create a withdrawal order via OnMeta API
 */
export async function createWithdrawOrder(request: OnMetaWithdrawRequest): Promise<OnMetaWithdrawResponse> {
  try {
    if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const payload: any = {
      fiatCurrency: request.fiatCurrency,
      fiatAmount: request.fiatAmount,
      cryptoCurrency: request.cryptoCurrency,
      bankAccountNumber: request.bankAccountNumber,
      accountHolderName: request.accountHolderName,
      userId: request.userId,
    };

    // Add currency-specific bank code field
    if (request.fiatCurrency === "INR" && request.ifscCode) {
      payload.ifscCode = request.ifscCode;
    } else if (request.fiatCurrency === "PHP" && request.routingNumber) {
      payload.routingNumber = request.routingNumber;
    } else if (request.fiatCurrency === "IDR" && request.bankCode) {
      payload.bankCode = request.bankCode;
    }

    // OnMeta API endpoint for creating withdrawal orders
    // Note: Endpoint path may vary - check OnMeta API documentation
    const response = await fetch(`${ONMETA_API_BASE_URL}/api/v1/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ONMETA_CLIENT_ID,
        "Authorization": `Bearer ${ONMETA_CLIENT_SECRET}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OnMeta API Error:", data);
      return {
        success: false,
        error: data.message || data.error || `Failed to create withdrawal order: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      orderId: data.orderId || data.id || data.order_id,
      transactionId: data.transactionId || data.transaction_id,
      message: data.message,
    };
  } catch (error: any) {
    console.error("OnMeta withdrawal order error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

export interface OnMetaKYCRequest {
  userId?: string;
  redirectUrl?: string;
}

export interface OnMetaKYCResponse {
  success: boolean;
  kycUrl?: string;
  orderId?: string;
  error?: string;
  message?: string;
}

/**
 * Create a KYC verification request via OnMeta API
 */
export async function createKYCRequest(request: OnMetaKYCRequest): Promise<OnMetaKYCResponse> {
  try {
    if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
      console.error("OnMeta credentials missing");
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please check your environment variables.",
      };
    }

    const requestBody: any = {
      userId: request.userId,
      redirectUrl: request.redirectUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard?onmeta_callback=true&type=kyc`,
    };

    // OnMeta KYC API endpoint - adjust based on their actual API
    const apiUrl = `${ONMETA_API_BASE_URL}/api/v1/kyc`;
    console.log("OnMeta KYC request:", {
      url: apiUrl,
      method: "POST",
      hasCredentials: !!(ONMETA_CLIENT_ID && ONMETA_CLIENT_SECRET),
      body: requestBody,
    });

    let response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ONMETA_CLIENT_ID,
          "Authorization": `Bearer ${ONMETA_CLIENT_SECRET}`,
        },
        body: JSON.stringify(requestBody),
      });
      console.log("OnMeta KYC API response status:", response.status, response.statusText);
    } catch (fetchError: any) {
      console.error("OnMeta KYC API fetch failed:", fetchError);
      return {
        success: false,
        error: `Failed to connect to OnMeta API: ${fetchError?.message || fetchError?.toString() || 'Network error'}. Please check the API endpoint and your internet connection.`,
      };
    }

    // Try to parse JSON response
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
      console.log("OnMeta KYC API response data:", data);
    } catch (parseError) {
      console.error("Failed to parse OnMeta KYC API response as JSON");
      return {
        success: false,
        error: `Invalid response from OnMeta API: ${response.status} ${response.statusText}`,
      };
    }

    if (!response.ok) {
      console.error("OnMeta KYC API Error:", data);
      return {
        success: false,
        error: data.message || data.error || data.errorMessage || `Failed to create KYC request: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      orderId: data.orderId || data.id || data.order_id,
      kycUrl: data.kycUrl || data.url || data.kyc_url || data.checkout_url || data.redirectUrl,
      message: data.message,
    };
  } catch (error: any) {
    console.error("OnMeta KYC request error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred while contacting OnMeta API",
    };
  }
}

/**
 * Get order status from OnMeta API
 */
export async function getOrderStatus(orderId: string): Promise<any> {
  try {
    if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const response = await fetch(`${ONMETA_API_BASE_URL}/api/v1/order/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-key": ONMETA_CLIENT_ID,
        "Authorization": `Bearer ${ONMETA_CLIENT_SECRET}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch order status",
      };
    }

    return {
      success: true,
      order: data,
    };
  } catch (error: any) {
    console.error("OnMeta get order status error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}
