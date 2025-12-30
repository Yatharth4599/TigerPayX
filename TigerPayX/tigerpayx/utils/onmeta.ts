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

    // Try different endpoint patterns - OnMeta API structure may vary
    // Common patterns: /api/v1/deposit, /v1/deposit, /api/deposit, /deposit
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/deposit`,
      `${ONMETA_API_BASE_URL}/api/deposit`,
      `${ONMETA_API_BASE_URL}/api/v1/deposit`,
      `${ONMETA_API_BASE_URL}/deposit`,
    ];
    
    console.log("OnMeta deposit request:", {
      baseUrl: ONMETA_API_BASE_URL,
      possibleEndpoints,
      method: "POST",
      hasCredentials: !!(ONMETA_CLIENT_ID && ONMETA_CLIENT_SECRET),
      body: { ...requestBody, walletAddress: requestBody.walletAddress?.slice(0, 8) + '...' },
    });
    
    // Try the most common pattern first: /v1/deposit (without /api)
    // NOTE: Check your OnMeta dashboard API documentation for the exact endpoint
    // Common patterns: /v1/deposit, /api/v1/deposit, /api/deposit, /deposit, /v1/onramp, /v1/order
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/deposit`;

    // OnMeta API endpoint for creating deposit orders
    // Note: Endpoint path may vary - check OnMeta API documentation in your dashboard
    let response;
    try {
      // Try different authentication patterns
      // Pattern 1: x-api-key header with Client ID, Authorization Bearer with Secret
      // Pattern 2: Both as headers
      // Pattern 3: Basic auth
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add API key
      if (ONMETA_CLIENT_ID) {
        headers["x-api-key"] = ONMETA_CLIENT_ID;
        headers["X-API-Key"] = ONMETA_CLIENT_ID; // Try both cases
      }
      
      // Add secret - try as Bearer token first
      if (ONMETA_CLIENT_SECRET) {
        headers["Authorization"] = `Bearer ${ONMETA_CLIENT_SECRET}`;
      }
      
      console.log("OnMeta API request:", {
        url: apiUrl,
        method: "POST",
        headers: {
          ...headers,
          Authorization: headers.Authorization ? "Bearer ***" : undefined,
        },
        body: { ...requestBody, walletAddress: requestBody.walletAddress?.slice(0, 8) + '...' },
      });
      
      response = await fetch(apiUrl, {
        method: "POST",
        headers,
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
      console.error("OnMeta API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // If 404, suggest checking the endpoint
      if (response.status === 404) {
        return {
          success: false,
          error: `OnMeta API endpoint not found (404). Please check the API endpoint path. Tried: ${apiUrl}. Check OnMeta documentation for the correct endpoint.`,
        };
      }
      
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
    // Try /v1/withdraw first (most common pattern)
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/withdraw`;
    console.log("OnMeta withdraw request:", {
      url: apiUrl,
      method: "POST",
      payload: { ...payload, bankAccountNumber: payload.bankAccountNumber?.slice(0, 4) + '...' },
    });
    
    const response = await fetch(apiUrl, {
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
      console.error("OnMeta API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        data: data,
      });
      
      if (response.status === 404) {
        return {
          success: false,
          error: `OnMeta API endpoint not found (404). Please check the API endpoint path. Tried: ${apiUrl}. Check OnMeta documentation for the correct endpoint.`,
        };
      }
      
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

// KYC Data Submission
export interface OnMetaKYCSubmitRequest {
  accessToken: string;
  email: string;
  selfie: string; // Base64 encoded image or file data
  aadharFront: string; // Base64 encoded image or file data
  aadharBack: string; // Base64 encoded image or file data
  panFront: string; // Base64 encoded image or file data
  panBack: string; // Base64 encoded image or file data
  panNumber: string; // Will be encrypted
  aadharNumber: string; // Will be encrypted
  firstName: string; // Will be encrypted
  lastName: string; // Will be encrypted
  incomeRange: '<10L' | '10L-15L' | '15L-20L' | '20L-25L' | '25L-50L' | '>50L';
  profession: string;
}

export interface OnMetaKYCSubmitResponse {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

/**
 * Encrypt KYC data fields
 * TODO: Replace this with the actual encryption code provided by OnMeta
 * Fields that need encryption: firstName, lastName, panNumber, aadharNumber
 */
function encryptKYCField(value: string): string {
  // PLACEHOLDER: Replace this with actual OnMeta encryption implementation
  // The encryption code should be provided by OnMeta documentation
  console.warn('KYC encryption not implemented yet. Please provide the encryption code from OnMeta.');
  return value; // Return unencrypted for now (this will fail in production)
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

    // OnMeta KYC API endpoint - try /v1/kyc first (most common pattern)
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/kyc`;
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
      console.error("OnMeta KYC API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        data: data,
      });
      
      if (response.status === 404) {
        return {
          success: false,
          error: `OnMeta API endpoint not found (404). Please check the API endpoint path. Tried: ${apiUrl}. Check OnMeta documentation for the correct endpoint.`,
        };
      }
      
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
 * Submit KYC Data
 * POST /v1/kyc/upload (or similar endpoint)
 * Submits KYC documents and data to OnMeta
 */
export async function submitKYCData(request: OnMetaKYCSubmitRequest): Promise<OnMetaKYCSubmitResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    if (!request.accessToken) {
      return {
        success: false,
        error: "Access token is required. Please login first.",
      };
    }

    // Encrypt sensitive fields
    const encryptedFirstName = encryptKYCField(request.firstName);
    const encryptedLastName = encryptKYCField(request.lastName);
    const encryptedPanNumber = encryptKYCField(request.panNumber);
    const encryptedAadharNumber = encryptKYCField(request.aadharNumber);

    // Create form data
    // Note: Node.js 18+ has FormData built-in. For base64 images, we append them as strings.
    // If OnMeta expects actual file objects, we may need to convert base64 to Buffer/Blob.
    const formData = new FormData();
    formData.append('email', request.email);
    formData.append('selfie', request.selfie);
    formData.append('aadharFront', request.aadharFront);
    formData.append('aadharBack', request.aadharBack);
    formData.append('panFront', request.panFront);
    formData.append('panBack', request.panBack);
    formData.append('panNumber', encryptedPanNumber);
    formData.append('aadharNumber', encryptedAadharNumber);
    formData.append('firstName', encryptedFirstName);
    formData.append('lastName', encryptedLastName);
    formData.append('incomeRange', request.incomeRange);
    formData.append('profession', request.profession);

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/kyc/upload`,
      `${ONMETA_API_BASE_URL}/v1/kyc/submit`,
      `${ONMETA_API_BASE_URL}/v1/upload/kyc`,
      `${ONMETA_API_BASE_URL}/api/v1/kyc/upload`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta submit KYC data request:", {
          url: apiUrl,
          email: request.email,
          hasAccessToken: !!request.accessToken,
          incomeRange: request.incomeRange,
          profession: request.profession,
        });

        // Get headers for FormData (Node.js FormData may need headers)
        const headers: Record<string, string> = {
          "x-api-key": ONMETA_CLIENT_ID,
          "Authorization": `Bearer ${request.accessToken}`,
        };

        // For Node.js FormData, we might need to get headers if using form-data package
        // Built-in FormData handles headers automatically with fetch
        const response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: formData,
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(`OnMeta submit KYC response is not JSON for ${apiUrl}:`, {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
          });
          lastError = { message: `Invalid response format: ${response.status} ${response.statusText}` };
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log("OnMeta submit KYC response:", {
          status: response.status,
          success: data.success,
        });

        if (response.ok) {
          return {
            success: true,
            message: data.message || "KYC data submitted successfully",
            ...data,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to submit KYC data. Please check the API endpoint and parameters.",
    };
  } catch (error: any) {
    console.error("OnMeta submit KYC error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Customer Authentication ====================

export interface OnMetaLoginRequest {
  email: string;
}

export interface OnMetaLoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
}

export interface OnMetaRefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * User Login - Create access token using email
 * POST /v1/auth/login (or similar endpoint)
 */
export async function onMetaUserLogin(request: OnMetaLoginRequest): Promise<OnMetaLoginResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const requestBody = {
      email: request.email,
    };

    // Try different endpoint patterns for login
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/auth/login`,
      `${ONMETA_API_BASE_URL}/v1/customer/login`,
      `${ONMETA_API_BASE_URL}/api/v1/auth/login`,
      `${ONMETA_API_BASE_URL}/v1/user/login`,
      `${ONMETA_API_BASE_URL}/v1/login`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta login request:", {
          url: apiUrl,
          email: request.email,
        });

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
          },
          body: JSON.stringify(requestBody),
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(`OnMeta login response is not JSON for ${apiUrl}:`, {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
          });
          if (response.status !== 404) {
            lastError = { message: `Invalid response format: ${response.status} ${response.statusText}` };
            break; // Don't try other endpoints if it's not a 404
          }
          continue; // Try next endpoint for 404
        }

        const data = await response.json();
        console.log("OnMeta login response:", {
          status: response.status,
          hasAccessToken: !!data.accessToken,
          hasRefreshToken: !!data.refreshToken,
        });

        if (response.ok) {
          return {
            success: true,
            accessToken: data.accessToken || data.access_token,
            refreshToken: data.refreshToken || data.refresh_token,
            message: data.message,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to login. Please check the API endpoint and credentials.",
    };
  } catch (error: any) {
    console.error("OnMeta login error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

/**
 * Refresh Access Token
 * GET /v1/auth/refresh (or similar endpoint)
 */
export async function onMetaRefreshToken(refreshToken: string): Promise<OnMetaRefreshTokenResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const apiUrl = `${ONMETA_API_BASE_URL}/v1/auth/refresh`;
    console.log("OnMeta refresh token request:", { url: apiUrl });

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": ONMETA_CLIENT_ID,
        "Authorization": `Bearer ${refreshToken}`,
      },
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("OnMeta refresh token response is not JSON:", {
        status: response.status,
        contentType,
        textPreview: text.substring(0, 200),
      });
      return {
        success: false,
        error: `Invalid response from OnMeta API: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to refresh token",
      };
    }

    return {
      success: true,
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token,
    };
  } catch (error: any) {
    console.error("OnMeta refresh token error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Account Linking ====================

export interface OnMetaLinkBankRequest {
  accessToken: string;
  name: string;
  panNumber: string;
  email: string;
  kycVerified: boolean;
  bankDetails: {
    accountNumber: string;
    ifscCode?: string; // For INR
    routingNumber?: string; // For PHP
    bankCode?: string; // For IDR
    accountHolderName: string;
  };
  phone: {
    countryCode: string;
    number: string;
  };
}

export interface OnMetaLinkBankResponse {
  success: boolean;
  status?: "SUCCESS" | "PENDING" | "FAILED";
  error?: string;
  message?: string;
}

export interface OnMetaLinkUPIRequest {
  accessToken: string;
  name: string;
  email: string;
  upiId: string;
  phone?: {
    countryCode: string;
    number: string;
  };
}

export interface OnMetaLinkUPIResponse {
  success: boolean;
  status?: "SUCCESS" | "PENDING" | "FAILED";
  error?: string;
  message?: string;
}

/**
 * Link User Bank Account
 * POST /v1/account/link-bank (or similar endpoint)
 */
export async function onMetaLinkBankAccount(request: OnMetaLinkBankRequest): Promise<OnMetaLinkBankResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const requestBody: any = {
      name: request.name,
      panNumber: request.panNumber,
      email: request.email,
      kycVerified: request.kycVerified,
      bankDetails: request.bankDetails,
      phone: request.phone,
    };

    const apiUrl = `${ONMETA_API_BASE_URL}/v1/account/link-bank`;
    console.log("OnMeta link bank request:", {
      url: apiUrl,
      email: request.email,
      hasAccessToken: !!request.accessToken,
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${request.accessToken}`,
        "x-api-key": ONMETA_CLIENT_ID,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("OnMeta link bank response:", {
      status: response.status,
      accountStatus: data.status,
    });

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Failed to link bank account: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      status: data.status || data.accountStatus,
      message: data.message,
    };
  } catch (error: any) {
    console.error("OnMeta link bank error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

/**
 * Get Bank Account Status
 * GET /v1/account/bank-status (or similar endpoint)
 */
export async function onMetaGetBankStatus(accessToken: string): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const apiUrl = `${ONMETA_API_BASE_URL}/v1/account/bank-status`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": ONMETA_CLIENT_ID,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get bank status",
      };
    }

    return {
      success: true,
      status: data.status || data.accountStatus,
    };
  } catch (error: any) {
    console.error("OnMeta get bank status error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

/**
 * Link UPI ID
 * POST /v1/account/link-upi (or similar endpoint)
 */
export async function onMetaLinkUPI(request: OnMetaLinkUPIRequest): Promise<OnMetaLinkUPIResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const requestBody: any = {
      name: request.name,
      email: request.email,
      upiId: request.upiId,
    };

    if (request.phone) {
      requestBody.phone = request.phone;
    }

    const apiUrl = `${ONMETA_API_BASE_URL}/v1/account/link-upi`;
    console.log("OnMeta link UPI request:", {
      url: apiUrl,
      email: request.email,
      upiId: request.upiId,
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${request.accessToken}`,
        "x-api-key": ONMETA_CLIENT_ID,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Failed to link UPI: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      status: data.status || data.upiStatus,
      message: data.message,
    };
  } catch (error: any) {
    console.error("OnMeta link UPI error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

/**
 * Get UPI Status
 * GET /v1/account/upi-status (or similar endpoint)
 */
export async function onMetaGetUPIStatus(accessToken: string): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const apiUrl = `${ONMETA_API_BASE_URL}/v1/account/upi-status`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": ONMETA_CLIENT_ID,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get UPI status",
      };
    }

    return {
      success: true,
      status: data.status || data.upiStatus,
    };
  } catch (error: any) {
    console.error("OnMeta get UPI status error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Token & Limits Management ====================

export interface OnMetaToken {
  id: string;
  symbol?: string;
  name?: string;
  address?: string;
  chainId?: number;
  chain?: string;
  decimals?: number;
  logoUrl?: string;
  [key: string]: any; // Allow for additional fields
}

export interface OnMetaTokensResponse {
  success: boolean;
  tokens?: OnMetaToken[];
  error?: string;
  message?: string;
}

export interface ChainLimit {
  chainId: number;
  chain?: string;
  minFiat?: number;
  maxFiat?: number;
  currency?: string;
  [key: string]: any;
}

export interface ChainLimitsResponse {
  success: boolean;
  limits?: ChainLimit[];
  error?: string;
  message?: string;
}

/**
 * Fetch supported tokens for the API key
 * GET /v1/tokens/
 */
export async function fetchSupportedTokens(): Promise<OnMetaTokensResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/tokens/`,
      `${ONMETA_API_BASE_URL}/v1/tokens`,
      `${ONMETA_API_BASE_URL}/api/v1/tokens/`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta fetch tokens request:", { url: apiUrl });

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
          },
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(`OnMeta fetch tokens response is not JSON for ${apiUrl}:`, {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
          });
          lastError = { message: `Invalid response format: ${response.status} ${response.statusText}` };
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log("OnMeta fetch tokens response:", {
          status: response.status,
          tokenCount: Array.isArray(data) ? data.length : data.tokens?.length || 0,
        });

        if (response.ok) {
          // Handle both array response and object with tokens property
          const tokens = Array.isArray(data) ? data : (data.tokens || data.data || []);
          
          return {
            success: true,
            tokens: tokens,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to fetch supported tokens. Please check the API endpoint.",
    };
  } catch (error: any) {
    console.error("OnMeta fetch tokens error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

/**
 * Fetch chain-wise Min/Max fiat limits
 * GET /v1/orders/get-chain-limit
 */
export async function fetchChainLimits(): Promise<ChainLimitsResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/orders/get-chain-limit`,
      `${ONMETA_API_BASE_URL}/v1/orders/get-chain-limit/`,
      `${ONMETA_API_BASE_URL}/v1/chain-limits`,
      `${ONMETA_API_BASE_URL}/v1/limits/chain`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta fetch chain limits request:", { url: apiUrl });

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
          },
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(`OnMeta fetch chain limits response is not JSON for ${apiUrl}:`, {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
          });
          lastError = { message: `Invalid response format: ${response.status} ${response.statusText}` };
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log("OnMeta fetch chain limits response:", {
          status: response.status,
          hasLimits: !!data.limits || !!data.data || Array.isArray(data),
        });

        if (response.ok) {
          // Handle different response formats
          const limits = Array.isArray(data) ? data : (data.limits || data.data || []);
          
          return {
            success: true,
            limits: limits,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to fetch chain limits. Please check the API endpoint.",
    };
  } catch (error: any) {
    console.error("OnMeta fetch chain limits error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Token Quotation ====================

export interface OnMetaQuotationRequest {
  buyTokenSymbol: string; // e.g., "USDC"
  chainId: number; // e.g., 80001 for polygon testnet
  fiatCurrency: string; // e.g., "inr"
  fiatAmount: number; // e.g., 100
  buyTokenAddress: string; // e.g., "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
}

export interface OnMetaQuotationResponse {
  success: boolean;
  quotation?: {
    buyTokenSymbol?: string;
    buyTokenAmount?: number;
    buyTokenAddress?: string;
    fiatCurrency?: string;
    fiatAmount?: number;
    conversionRate?: number;
    commission?: number;
    totalAmount?: number;
    chainId?: number;
    [key: string]: any; // Allow for additional fields
  };
  error?: string;
  message?: string;
}

/**
 * Fetch Token Quotation
 * POST /v1/quotation (or similar endpoint)
 * Fetches quotation for the provided token and chainId combination
 */
export async function fetchTokenQuotation(request: OnMetaQuotationRequest): Promise<OnMetaQuotationResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    const requestBody = {
      buyTokenSymbol: request.buyTokenSymbol,
      chainId: request.chainId,
      fiatCurrency: request.fiatCurrency.toLowerCase(), // Ensure lowercase
      fiatAmount: request.fiatAmount,
      buyTokenAddress: request.buyTokenAddress,
    };

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/quotation`,
      `${ONMETA_API_BASE_URL}/v1/quotation/`,
      `${ONMETA_API_BASE_URL}/v1/quote`,
      `${ONMETA_API_BASE_URL}/v1/orders/quotation`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta fetch quotation request:", {
          url: apiUrl,
          buyTokenSymbol: request.buyTokenSymbol,
          chainId: request.chainId,
          fiatCurrency: request.fiatCurrency,
          fiatAmount: request.fiatAmount,
        });

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
            "Accept": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("OnMeta fetch quotation response:", {
          status: response.status,
          hasQuotation: !!data.quotation || !!data.data,
        });

        if (response.ok) {
          // Handle different response formats
          const quotation = data.quotation || data.data || data;
          
          return {
            success: true,
            quotation: quotation,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to fetch quotation. Please check the API endpoint and parameters.",
    };
  } catch (error: any) {
    console.error("OnMeta fetch quotation error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Create Onramp Order ====================

export interface OnMetaCreateOnrampOrderRequest {
  accessToken: string; // Bearer token from customer login
  buyTokenSymbol: string; // e.g., "USDC"
  chainId: number; // e.g., 80001 for polygon testnet
  fiatCurrency: string; // e.g., "inr"
  fiatAmount: number; // e.g., 100
  buyTokenAddress: string; // e.g., "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
  receiverAddress: string; // e.g., "0xCdF10Bc7a1fAE391ff18F4C220ACe912547971cC"
  paymentMode: string; // e.g., "INR_UPI", "INR_IMPS", "INR_NEFT"
  upiId?: {
    upiId: string; // e.g., "bank@upi"
  };
  bankDetails?: {
    accountNumber: string;
    ifscCode?: string; // For INR/IMPS/NEFT
    routingNumber?: string; // For PHP
    bankCode?: string; // For IDR
    accountHolderName: string;
  };
  metaData?: Record<string, string>; // Optional metadata (all values must be strings)
  redirectUrl?: string; // Optional redirect URL
}

export interface OnMetaCreateOnrampOrderResponse {
  success: boolean;
  orderId?: string;
  orderUrl?: string;
  depositUrl?: string;
  message?: string;
  error?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * Create Onramp Order
 * POST /v1/orders/create-onramp (or similar endpoint)
 * Creates an onramp order with payment mode and UPI/bank details
 */
export async function createOnrampOrder(request: OnMetaCreateOnrampOrderRequest): Promise<OnMetaCreateOnrampOrderResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    if (!request.accessToken) {
      return {
        success: false,
        error: "Access token is required. Please login first.",
      };
    }

    // Build request body
    const requestBody: any = {
      buyTokenSymbol: request.buyTokenSymbol,
      chainId: request.chainId,
      fiatCurrency: request.fiatCurrency.toLowerCase(),
      fiatAmount: request.fiatAmount,
      buyTokenAddress: request.buyTokenAddress,
      receiverAddress: request.receiverAddress,
      paymentMode: request.paymentMode,
    };

    // Add UPI ID if provided (for UPI orders)
    if (request.upiId && request.upiId.upiId) {
      requestBody.upiId = request.upiId;
    }

    // Add bank details if provided (for IMPS/NEFT orders)
    if (request.bankDetails) {
      requestBody.bankDetails = request.bankDetails;
    }

    // Add metadata if provided (ensure all values are strings)
    if (request.metaData) {
      const stringMetaData: Record<string, string> = {};
      for (const [key, value] of Object.entries(request.metaData)) {
        stringMetaData[key] = String(value);
      }
      requestBody.metaData = stringMetaData;
    }

    // Add redirect URL if provided
    if (request.redirectUrl) {
      requestBody.redirectUrl = request.redirectUrl;
    }

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/orders/create-onramp`,
      `${ONMETA_API_BASE_URL}/v1/orders/onramp`,
      `${ONMETA_API_BASE_URL}/v1/onramp/create`,
      `${ONMETA_API_BASE_URL}/v1/order/create`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta create onramp order request:", {
          url: apiUrl,
          buyTokenSymbol: request.buyTokenSymbol,
          chainId: request.chainId,
          fiatCurrency: request.fiatCurrency,
          fiatAmount: request.fiatAmount,
          paymentMode: request.paymentMode,
          hasUPI: !!request.upiId,
          hasBankDetails: !!request.bankDetails,
        });

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
            "Authorization": `Bearer ${request.accessToken}`,
            "Accept": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("OnMeta create onramp order response:", {
          status: response.status,
          hasOrderId: !!data.orderId,
          hasOrderUrl: !!data.orderUrl || !!data.depositUrl,
        });

        if (response.ok) {
          return {
            success: true,
            orderId: data.orderId || data.id,
            orderUrl: data.orderUrl || data.depositUrl || data.url,
            depositUrl: data.depositUrl || data.orderUrl || data.url,
            message: data.message,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to create onramp order. Please check the API endpoint and parameters.",
    };
  } catch (error: any) {
    console.error("OnMeta create onramp order error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Order Status ====================

export interface OnMetaOrderStatusRequest {
  accessToken: string; // Bearer token from customer login
  orderId: string; // Order ID from create order response
}

export interface OnMetaOrderStatusResponse {
  success: boolean;
  orderId?: string;
  status?: string;
  orderStatus?: string;
  order?: any;
  error?: string;
  message?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * Fetch Order Status
 * POST /v1/orders/status (or similar endpoint)
 * Fetches order status using order ID
 */
export async function fetchOrderStatus(request: OnMetaOrderStatusRequest): Promise<OnMetaOrderStatusResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    if (!request.accessToken) {
      return {
        success: false,
        error: "Access token is required. Please login first.",
      };
    }

    if (!request.orderId) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }

    const requestBody = {
      orderId: request.orderId,
    };

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/orders/status`,
      `${ONMETA_API_BASE_URL}/v1/orders/get-status`,
      `${ONMETA_API_BASE_URL}/v1/order/status`,
      `${ONMETA_API_BASE_URL}/v1/order/${request.orderId}`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta fetch order status request:", {
          url: apiUrl,
          orderId: request.orderId,
        });

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
            "Authorization": `Bearer ${request.accessToken}`,
            "Accept": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("OnMeta fetch order status response:", {
          status: response.status,
          orderStatus: data.status || data.orderStatus,
        });

        if (response.ok) {
          return {
            success: true,
            orderId: data.orderId || data.id || request.orderId,
            status: data.status || data.orderStatus || data.state,
            orderStatus: data.status || data.orderStatus || data.state,
            order: data.order || data,
            message: data.message,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to fetch order status. Please check the API endpoint and order ID.",
    };
  } catch (error: any) {
    console.error("OnMeta fetch order status error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Update UTR ====================

export interface OnMetaUpdateUTRRequest {
  accessToken: string; // Bearer token from customer login
  orderId: string; // Order ID from create order response
  utr: string; // UTR from payment success screen
  paymentMode?: string; // Optional: to validate UTR format (UPI, IMPS, NEFT)
}

export interface OnMetaUpdateUTRResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  error?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * Validate UTR format based on payment mode
 */
function validateUTR(utr: string, paymentMode?: string): { valid: boolean; error?: string } {
  // Remove any whitespace
  const trimmedUTR = utr.trim();
  
  if (!trimmedUTR) {
    return { valid: false, error: 'UTR cannot be empty' };
  }

  // If payment mode is provided, validate accordingly
  if (paymentMode) {
    if (paymentMode.includes('UPI')) {
      // UPI: 12 character numbers
      if (!/^\d{12}$/.test(trimmedUTR)) {
        return { valid: false, error: 'UPI UTR must be exactly 12 digits' };
      }
    } else if (paymentMode.includes('IMPS')) {
      // IMPS: 12 character numbers
      if (!/^\d{12}$/.test(trimmedUTR)) {
        return { valid: false, error: 'IMPS UTR must be exactly 12 digits' };
      }
    } else if (paymentMode.includes('NEFT')) {
      // NEFT: 16 character alphanumeric
      if (!/^[A-Za-z0-9]{16}$/.test(trimmedUTR)) {
        return { valid: false, error: 'NEFT UTR must be exactly 16 alphanumeric characters' };
      }
    }
  } else {
    // If payment mode not provided, accept any format (12 digits or 16 alphanumeric)
    const is12Digits = /^\d{12}$/.test(trimmedUTR);
    const is16Alphanumeric = /^[A-Za-z0-9]{16}$/.test(trimmedUTR);
    
    if (!is12Digits && !is16Alphanumeric) {
      return { valid: false, error: 'UTR must be either 12 digits (UPI/IMPS) or 16 alphanumeric characters (NEFT)' };
    }
  }

  return { valid: true };
}

/**
 * Update UTR for a given order ID
 * POST /v1/orders/update-utr (or similar endpoint)
 */
export async function updateUTR(request: OnMetaUpdateUTRRequest): Promise<OnMetaUpdateUTRResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    if (!request.accessToken) {
      return {
        success: false,
        error: "Access token is required. Please login first.",
      };
    }

    if (!request.orderId) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }

    // Validate UTR format
    const utrValidation = validateUTR(request.utr, request.paymentMode);
    if (!utrValidation.valid) {
      return {
        success: false,
        error: utrValidation.error || "Invalid UTR format",
      };
    }

    const requestBody = {
      orderId: request.orderId,
      utr: request.utr.trim(),
    };

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/orders/update-utr`,
      `${ONMETA_API_BASE_URL}/v1/orders/utr`,
      `${ONMETA_API_BASE_URL}/v1/order/update-utr`,
      `${ONMETA_API_BASE_URL}/v1/order/utr`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta update UTR request:", {
          url: apiUrl,
          orderId: request.orderId,
          utrLength: request.utr.length,
          paymentMode: request.paymentMode,
        });

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
            "Authorization": `Bearer ${request.accessToken}`,
            "Accept": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("OnMeta update UTR response:", {
          status: response.status,
          success: data.success || response.ok,
        });

        if (response.ok) {
          return {
            success: true,
            orderId: data.orderId || request.orderId,
            message: data.message || "UTR updated successfully",
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to update UTR. Please check the API endpoint and parameters.",
    };
  } catch (error: any) {
    console.error("OnMeta update UTR error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Order History ====================

export interface OnMetaOrderHistoryRequest {
  accessToken: string; // Bearer token from customer login
  skip?: number; // Skip value for pagination (0 for first page, 1 for next 10, etc.)
}

export interface OnMetaOrderHistoryResponse {
  success: boolean;
  orders?: any[]; // Array of order objects
  transactions?: any[]; // Alternative field name
  totalCount?: number;
  hasMore?: boolean;
  skip?: number;
  error?: string;
  message?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * Fetch User's Order History
 * GET /v1/orders/history (or similar endpoint)
 * Returns 10 recent transactions of the user with pagination
 */
export async function fetchOrderHistory(request: OnMetaOrderHistoryRequest): Promise<OnMetaOrderHistoryResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    if (!request.accessToken) {
      return {
        success: false,
        error: "Access token is required. Please login first.",
      };
    }

    const skip = request.skip || 0;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (skip > 0) {
      queryParams.append('skip', skip.toString());
    }

    const queryString = queryParams.toString();
    const urlSuffix = queryString ? `?${queryString}` : '';

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/orders/history${urlSuffix}`,
      `${ONMETA_API_BASE_URL}/v1/orders${urlSuffix}`,
      `${ONMETA_API_BASE_URL}/v1/order/history${urlSuffix}`,
      `${ONMETA_API_BASE_URL}/v1/user/orders${urlSuffix}`,
      `${ONMETA_API_BASE_URL}/v1/transactions${urlSuffix}`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta fetch order history request:", {
          url: apiUrl,
          skip,
        });

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
            "Authorization": `Bearer ${request.accessToken}`,
          },
        });

        const data = await response.json();
        console.log("OnMeta fetch order history response:", {
          status: response.status,
          orderCount: Array.isArray(data) ? data.length : (data.orders?.length || data.transactions?.length || 0),
        });

        if (response.ok) {
          // Handle different response formats
          const orders = Array.isArray(data) 
            ? data 
            : (data.orders || data.transactions || data.data || []);

          return {
            success: true,
            orders: orders,
            transactions: orders, // Also provide as transactions for convenience
            totalCount: data.totalCount || data.total || orders.length,
            hasMore: orders.length === 10, // If we got 10, there might be more
            skip: skip,
            message: data.message,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to fetch order history. Please check the API endpoint.",
    };
  } catch (error: any) {
    console.error("OnMeta fetch order history error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

// ==================== Supported Currencies ====================

export interface SupportedCurrency {
  currency: string; // e.g., "INR", "PHP", "IDR", "USD"
  paymentModes?: string[]; // e.g., ["INR_UPI", "INR_IMPS", "INR_NEFT"]
  [key: string]: any; // Allow for additional fields
}

export interface SupportedCurrenciesResponse {
  success: boolean;
  currencies?: SupportedCurrency[];
  supportedCurrencies?: SupportedCurrency[];
  data?: SupportedCurrency[];
  error?: string;
  message?: string;
}

/**
 * Get Supported Currencies
 * GET /v1/currencies (or similar endpoint)
 * Fetches list of supported currencies and their payment modes
 */
export async function fetchSupportedCurrencies(): Promise<SupportedCurrenciesResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    // Try different endpoint patterns
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/currencies`,
      `${ONMETA_API_BASE_URL}/v1/currencies/`,
      `${ONMETA_API_BASE_URL}/v1/supported-currencies`,
      `${ONMETA_API_BASE_URL}/v1/payment-modes`,
      `${ONMETA_API_BASE_URL}/api/v1/currencies`,
    ];

    let lastError: any = null;

    for (const apiUrl of possibleEndpoints) {
      try {
        console.log("OnMeta fetch supported currencies request:", { url: apiUrl });

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
          },
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(`OnMeta fetch supported currencies response is not JSON for ${apiUrl}:`, {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
          });
          lastError = { message: `Invalid response format: ${response.status} ${response.statusText}` };
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log("OnMeta fetch supported currencies response:", {
          status: response.status,
          currencyCount: Array.isArray(data) ? data.length : (data.currencies?.length || data.data?.length || 0),
        });

        if (response.ok) {
          // Handle different response formats
          const currencies = Array.isArray(data) 
            ? data 
            : (data.currencies || data.supportedCurrencies || data.data || []);

          return {
            success: true,
            currencies: currencies,
            supportedCurrencies: currencies, // Also provide as supportedCurrencies for convenience
            message: data.message,
          };
        }

        if (response.status !== 404) {
          lastError = data;
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError?.error || "Failed to fetch supported currencies. Please check the API endpoint.",
    };
  } catch (error: any) {
    console.error("OnMeta fetch supported currencies error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

/**
 * Get order status from OnMeta API (Legacy function - kept for backward compatibility)
 * @deprecated Use fetchOrderStatus instead
 */
export async function getOrderStatus(orderId: string): Promise<any> {
  try {
    if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    // Try /v1/order/{orderId} first
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/order/${orderId}`;
    console.log("OnMeta get order status request:", { url: apiUrl, orderId });
    
    const response = await fetch(apiUrl, {
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
