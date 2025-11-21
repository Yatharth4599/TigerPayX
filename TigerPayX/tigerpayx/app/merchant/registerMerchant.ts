// Merchant registration functions

import { getAuthHeader } from "@/utils/auth";
import type { Merchant } from "@/shared/types";

const API_BASE = "/api/merchants";

/**
 * Register a new merchant
 */
export async function registerMerchant(data: {
  name: string;
  logoUrl?: string;
  settlementAddress: string;
  preferredToken: "SOL" | "USDC" | "USDT" | "TT";
}): Promise<{ success: boolean; merchant?: Merchant; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to register merchant",
      };
    }

    return {
      success: true,
      merchant: result.merchant,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Get merchant by ID
 */
export async function getMerchant(merchantId: string): Promise<{
  success: boolean;
  merchant?: Merchant;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/${merchantId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to get merchant",
      };
    }

    return {
      success: true,
      merchant: result.merchant,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Get all merchants for current user
 */
export async function getUserMerchants(): Promise<{
  success: boolean;
  merchants?: Merchant[];
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/my-merchants`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to get merchants",
      };
    }

    return {
      success: true,
      merchants: result.merchants,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

