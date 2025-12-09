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
    // For demo purposes: Try API first, but if auth fails, create client-side pay link
    const authHeader = getAuthHeader();
    const response = await fetch(`${API_BASE}/paylink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(data),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      // If auth error, create demo pay link client-side
      if (response.status === 401 || response.status === 403) {
        return createDemoPayLink(data);
      }
      return {
        success: false,
        error: `Server error: Received ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      // If auth error, create demo pay link client-side
      if (response.status === 401 || response.status === 403 || result.error?.toLowerCase().includes("auth")) {
        return createDemoPayLink(data);
      }
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
    // On network error, create demo pay link client-side
    return createDemoPayLink(data);
  }
}

/**
 * Create a demo pay link client-side (no auth required)
 */
function createDemoPayLink(data: {
  merchantId: string;
  amount: string;
  token: "SOL" | "USDC" | "USDT" | "TT";
  description?: string;
  expiresInHours?: number;
}): { success: boolean; payLink?: any; error?: string } {
  try {
    // Encode amount and token in the payLinkId for easy retrieval
    const encodedData = btoa(JSON.stringify({
      a: data.amount,
      t: data.token,
      d: data.description || "",
    })).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m] || ''));
    
    // Generate a unique pay link ID with encoded data
    const payLinkId = `demo-${Date.now()}-${encodedData.substring(0, 12)}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 24));
    
    // Create demo pay link with extended properties for payment page
    const payLink: any = {
      id: payLinkId,
      payLinkId,
      merchantId: data.merchantId,
      merchantName: "Demo Merchant",
      settlementAddress: "11111111111111111111111111111111", // Demo address
      amount: data.amount,
      token: data.token,
      description: data.description || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    // Store in localStorage for demo purposes
    if (typeof window !== "undefined") {
      const storedLinks = JSON.parse(localStorage.getItem("demo_paylinks") || "[]");
      storedLinks.push(payLink);
      localStorage.setItem("demo_paylinks", JSON.stringify(storedLinks));
    }
    
    return {
      success: true,
      payLink,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create demo pay link",
    };
  }
}

/**
 * Get PayLink by ID (public - no auth required)
 */
export async function getPayLink(payLinkId: string, publicAccess: boolean = false): Promise<{
  success: boolean;
  payLink?: PayLink;
  error?: string;
}> {
  try {
    // First check localStorage for demo pay links
    if (typeof window !== "undefined" && payLinkId.startsWith("demo-")) {
      const storedLinks = JSON.parse(localStorage.getItem("demo_paylinks") || "[]");
      const demoLink = storedLinks.find((link: any) => link.payLinkId === payLinkId);
      if (demoLink) {
        return {
          success: true,
          payLink: demoLink,
        };
      }
    }
    
    // Use public API route for payment page, authenticated route for merchant dashboard
    const apiPath = publicAccess 
      ? `/api/paylink/${payLinkId}`
      : `${API_BASE}/paylink/${payLinkId}`;
    
    const response = await fetch(apiPath, {
      headers: publicAccess ? {} : getAuthHeader(),
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
    // Try localStorage as fallback
    if (typeof window !== "undefined" && payLinkId.startsWith("demo-")) {
      const storedLinks = JSON.parse(localStorage.getItem("demo_paylinks") || "[]");
      const demoLink = storedLinks.find((link: any) => link.payLinkId === payLinkId);
      if (demoLink) {
        return {
          success: true,
          payLink: demoLink,
        };
      }
    }
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
 * Pay a PayLink (initiate payment - public API)
 */
export async function payPayLink(
  payLinkId: string,
  txHash: string,
  fromAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use public API route for payments
    const response = await fetch(`/api/paylink/${payLinkId}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txHash, fromAddress }),
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

