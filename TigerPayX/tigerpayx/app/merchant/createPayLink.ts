// Create and manage PayLinks for merchant payments

import { getAuthHeader } from "@/utils/auth";
import type { PayLink } from "@/shared/types";

const API_BASE = "/api/merchants";

/**
 * Create a new PayLink
 */
export async function createPayLink(data: {
  merchantId: string;
  amount: string;
  token: "SOL" | "USDC" | "USDT" | "TT";
  description?: string;
  expiresInHours?: number;
}): Promise<{ success: boolean; payLink?: PayLink; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/paylink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      return {
        success: false,
        error: `Server error: Received ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to create PayLink",
      };
    }

    return {
      success: true,
      payLink: result.payLink,
    };
  } catch (error: any) {
    console.error("PayLink creation error:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Get PayLink by ID
 */
export async function getPayLink(payLinkId: string): Promise<{
  success: boolean;
  payLink?: PayLink;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/paylink/${payLinkId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      return {
        success: false,
        error: `Server error: Received ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to get PayLink",
      };
    }

    return {
      success: true,
      payLink: result.payLink,
    };
  } catch (error: any) {
    console.error("Get PayLink error:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Get all PayLinks for a merchant
 */
export async function getMerchantPayLinks(merchantId: string): Promise<{
  success: boolean;
  payLinks?: PayLink[];
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/${merchantId}/paylinks`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      return {
        success: false,
        error: `Server error: Received ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to get PayLinks",
      };
    }

    return {
      success: true,
      payLinks: result.payLinks,
    };
  } catch (error: any) {
    console.error("Get merchant PayLinks error:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Pay a PayLink (initiate payment)
 */
export async function payPayLink(
  payLinkId: string,
  txHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/paylink/${payLinkId}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ txHash }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      return {
        success: false,
        error: `Server error: Received ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to process payment",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Pay PayLink error:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

