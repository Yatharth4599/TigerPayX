/**
 * OnMeta API Integration Utilities
 * Documentation: https://onmeta.in/helpcenter
 */

// OnMeta API Configuration
// These should be set via environment variables in .env.local or Vercel
// 
// PRODUCTION URL (REQUIRED): https://api.platform.onmeta.in
// STAGING URL (DO NOT USE IN PRODUCTION): https://stg.api.onmeta.in
//
// IMPORTANT: Always use production URL in production environment!
// Set ONMETA_API_BASE_URL=https://api.platform.onmeta.in in Vercel environment variables
//
// Production API base URL (default for production API keys)
const ONMETA_API_BASE_URL = (process.env.ONMETA_API_BASE_URL || "https://api.platform.onmeta.in").replace(/\/$/, ""); // Remove trailing slash
// Staging API base URL (for staging API keys) - NOT USED IN PRODUCTION - ONLY FOR TESTING
const ONMETA_API_BASE_URL_STAGING = (process.env.ONMETA_API_BASE_URL_STAGING || "https://stg.api.onmeta.in").replace(/\/$/, ""); // Remove trailing slash
// Some endpoints (like UPI) use a different base URL - use production (same as main base URL)
const ONMETA_API_BASE_URL_ALT = (process.env.ONMETA_API_BASE_URL_ALT || "https://api.platform.onmeta.in").replace(/\/$/, ""); // Remove trailing slash
const ONMETA_CLIENT_ID = process.env.ONMETA_CLIENT_ID || "";
const ONMETA_CLIENT_SECRET = process.env.ONMETA_CLIENT_SECRET || "";

// Log API key status (without exposing the actual key)
if (!ONMETA_CLIENT_ID || !ONMETA_CLIENT_SECRET) {
  console.warn("OnMeta API credentials not found in environment variables. Please set ONMETA_CLIENT_ID and ONMETA_CLIENT_SECRET in .env.local");
} else {
  console.log("OnMeta API credentials loaded:", {
    hasClientId: !!ONMETA_CLIENT_ID,
    clientIdLength: ONMETA_CLIENT_ID.length,
    clientIdPrefix: ONMETA_CLIENT_ID.substring(0, 8) + "...",
    hasClientSecret: !!ONMETA_CLIENT_SECRET,
    apiBaseUrl: ONMETA_API_BASE_URL,
  });
}

/**
 * Get the base URL for redirects and callbacks
 * Uses NEXT_PUBLIC_APP_URL if set (production URL), otherwise falls back to window.location.origin
 * This ensures OnMeta callbacks work in production
 */
function getBaseUrl(): string {
  // In server-side context, use environment variable
  if (typeof window === 'undefined') {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return '';
  }
  
  // In client-side context, prefer environment variable over window.location.origin
  // This allows overriding localhost with production URL
  // Note: NEXT_PUBLIC_* vars are available in client-side code
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback to window.location.origin (for local development)
  return window.location.origin;
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
      redirectUrl: request.redirectUrl || `${getBaseUrl()}/dashboard`,
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
      redirectUrl: request.redirectUrl || `${getBaseUrl()}/dashboard?onmeta_callback=true&type=kyc`,
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
      console.error("OnMeta API credentials missing: ONMETA_CLIENT_ID is not set in environment variables");
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please set ONMETA_CLIENT_ID in Vercel environment variables.",
      };
    }

    const requestBody = {
      email: request.email,
    };

    // Try different login endpoint patterns - OnMeta might use different paths
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/users/login`,
      `${ONMETA_API_BASE_URL}/v1/auth/login`,
      `${ONMETA_API_BASE_URL}/v1/user/login`,
    ];

    let lastError: any = null;
    let data: any = null;
    let response: Response | null = null;

    for (const apiUrl of possibleEndpoints) {
      console.log("OnMeta login request (trying endpoint):", {
        url: apiUrl,
        email: request.email,
      });

      try {
        // Match OnMeta API requirements exactly:
        // - Accept: application/json
        // - x-api-key: API key
        // - Content-Type: application/json (for POST with body)
        // - Body: JSON string with email
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "x-api-key": ONMETA_CLIENT_ID,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // If 404 or 405, try next endpoint
        if (response.status === 404 || response.status === 405) {
          console.log(`Endpoint ${apiUrl} returned ${response.status}, trying next endpoint...`);
          lastError = { status: response.status, error: `Endpoint not found or method not allowed: ${apiUrl}` };
          continue; // Try next endpoint
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("OnMeta login response is not JSON:", {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
            endpoint: apiUrl,
          });
          
          // If not 404/405, this is a real error
          if (response.status !== 404 && response.status !== 405) {
            return {
              success: false,
              error: `Invalid response from OnMeta API: ${response.status} ${response.statusText}`,
            };
          }
          continue; // Try next endpoint for 404/405
        }

        data = await response.json();
        console.log("OnMeta login response:", {
          status: response.status,
          statusText: response.statusText,
          hasAccessToken: !!data.accessToken,
          hasRefreshToken: !!data.refreshToken,
          endpoint: apiUrl,
          fullResponse: data,
        });

        if (!response.ok) {
          // Log the full error for debugging
          console.error("OnMeta login error response:", {
            status: response.status,
            statusText: response.statusText,
            data: data,
            endpoint: apiUrl,
          });
          
          // If 404/405, try next endpoint
          if (response.status === 404 || response.status === 405) {
            lastError = { 
              status: response.status, 
              error: data.message || data.error || data.errorMessage || `Endpoint not found or method not allowed: ${apiUrl}`,
              data: data,
            };
            continue;
          }
          
          // For other errors, extract the actual error message
          const errorMsg = data.message || data.error || data.errorMessage || data.msg || 
                          (data.errors && Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
                          `Login failed: ${response.status} ${response.statusText}`;
          
          return {
            success: false,
            error: errorMsg,
          };
        }

        // Success! Break out of loop
        break;
      } catch (error: any) {
        console.error(`OnMeta login error for endpoint ${apiUrl}:`, error);
        lastError = error;
        // If this is the last endpoint, return error
        if (possibleEndpoints.indexOf(apiUrl) === possibleEndpoints.length - 1) {
          return {
            success: false,
            error: error.message || "Network error occurred",
          };
        }
        // Otherwise, try next endpoint
        continue;
      }
    }

    // If we got here without success, return last error
    if (!response || !response.ok) {
      let errorMessage = "Failed to login after trying all endpoints";
      
      // First, try to get error from the last response data (most reliable)
      if (data) {
        // Try multiple possible error field names
        const possibleErrors = [
          data.error,
          data.message,
          data.errorMessage,
          data.msg,
          data.description,
          data.detail,
        ].filter(Boolean);
        
        if (possibleErrors.length > 0) {
          errorMessage = typeof possibleErrors[0] === 'string' ? possibleErrors[0] : JSON.stringify(possibleErrors[0]);
        } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map((e: any) => typeof e === 'string' ? e : e.message || JSON.stringify(e)).join(', ');
        } else if (data.statusCode || data.status) {
          errorMessage = `Login failed with status ${data.statusCode || data.status}`;
        }
      }
      
      // Then try lastError
      if (lastError && errorMessage === "Failed to login after trying all endpoints") {
        if (typeof lastError === 'string') {
          errorMessage = lastError;
        } else if (lastError.error) {
          errorMessage = typeof lastError.error === 'string' ? lastError.error : JSON.stringify(lastError.error);
        } else if (lastError.message) {
          errorMessage = typeof lastError.message === 'string' ? lastError.message : JSON.stringify(lastError.message);
        } else if (lastError.data) {
          // If lastError has data, try to extract from it
          const errorData = lastError.data;
          errorMessage = errorData.message || errorData.error || errorData.errorMessage || errorMessage;
        } else if (lastError.status) {
          errorMessage = `Login failed with status ${lastError.status}`;
        }
      }
      
      // If we have response status, include it as fallback
      if (response && errorMessage === "Failed to login after trying all endpoints") {
        errorMessage = `Login failed: ${response.status} ${response.statusText || ''}`.trim();
      }
      
      console.error("OnMeta login final error (all attempts failed):", {
        lastError,
        lastResponseData: data,
        response: response ? { status: response.status, statusText: response.statusText } : null,
        extractedErrorMessage: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Extract tokens from OnMeta response structure:
    // { success: true, data: { accessToken: "...", refreshToken: "..." }, error: {} }
    // Priority: data.data.accessToken (OnMeta format) > data.accessToken (fallback)
    const accessToken = data.data?.accessToken || 
                       data.data?.access_token || 
                       data.accessToken || 
                       data.access_token || 
                       data.token ||
                       data.result?.accessToken ||
                       data.result?.access_token ||
                       data.result?.token;
    
    const refreshToken = data.data?.refreshToken || 
                        data.data?.refresh_token ||
                        data.refreshToken || 
                        data.refresh_token ||
                        data.result?.refreshToken ||
                        data.result?.refresh_token;
    
    // Log if token not found for debugging
    if (!accessToken) {
      console.warn("OnMeta login: Access token not found in expected fields. Response structure:", {
        topLevelKeys: Object.keys(data),
        hasData: !!data.data,
        hasResult: !!data.result,
        dataKeys: data.data ? Object.keys(data.data) : null,
        resultKeys: data.result ? Object.keys(data.result) : null,
        fullResponse: data,
      });
    } else {
      console.log("OnMeta login: Access token found successfully", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenLength: accessToken.length,
      });
    }
    
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: data.message,
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

    // Correct endpoint for refresh token
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/users/refresh-token`;
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
    console.log("OnMeta refresh token response:", {
      status: response.status,
      fullResponse: data,
    });

    if (!response.ok) {
      // Extract readable error message from various possible formats
      let errorMessage = "Failed to refresh token";
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error.message) {
          errorMessage = data.error.message;
        } else if (data.error.code) {
          errorMessage = data.error.message || `Error ${data.error.code}`;
        }
      } else if (data.message) {
        errorMessage = typeof data.message === 'string' ? data.message : String(data.message);
      } else if (data.errorMessage) {
        errorMessage = typeof data.errorMessage === 'string' ? data.errorMessage : String(data.errorMessage);
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // OnMeta response structure: { success: true, data: { accessToken: "..." }, error: {} }
    const accessToken = data.data?.accessToken || data.accessToken || data.access_token || data.token;

    if (!accessToken) {
      console.error("OnMeta refresh token: Access token not found in response", {
        topLevelKeys: Object.keys(data),
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : null,
      });
      return {
        success: false,
        error: "Access token not found in refresh token response",
      };
    }

    return {
      success: true,
      accessToken: accessToken,
      refreshToken: data.data?.refreshToken || data.refreshToken || data.refresh_token,
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
  refNumber?: string; // Reference number needed to check status later
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
  refNumber?: string; // Reference number needed to check status later
  error?: string;
  message?: string;
  statusCode?: number; // HTTP status code from OnMeta API
  onMetaError?: string; // Original error from OnMeta API
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

    // OnMeta endpoint: POST /v1/users/account-link
    // Response: { success: true, data: { status: "SUCCESS", referenceNumber: "89822" }, error: {} }
    const endpoints = [
      `${ONMETA_API_BASE_URL}/v1/users/account-link`,
      `${ONMETA_API_BASE_URL}/v1/account/link-bank`, // Fallback
    ];
    
    let lastError: any = null;
    let data: any = null;
    let response: Response | null = null;

    for (const apiUrl of endpoints) {
      console.log("OnMeta link bank request (trying endpoint):", {
        url: apiUrl,
        email: request.email,
        hasAccessToken: !!request.accessToken,
        requestBody: JSON.stringify(requestBody, null, 2),
      });

      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${request.accessToken}`,
            "x-api-key": ONMETA_CLIENT_ID,
          },
          body: JSON.stringify(requestBody),
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("OnMeta link bank response is not JSON:", {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
            endpoint: apiUrl,
          });
          
          // If 404, try next endpoint
          if (response.status === 404 && endpoints.indexOf(apiUrl) < endpoints.length - 1) {
            lastError = { status: response.status, error: `Endpoint not found: ${apiUrl}` };
            continue;
          }
          
          return {
            success: false,
            error: `Invalid response from OnMeta API: ${response.status} ${response.statusText}`,
          };
        }

        data = await response.json();
        console.log("OnMeta link bank response:", {
          status: response.status,
          statusText: response.statusText,
          accountStatus: data.data?.status || data.status,
          referenceNumber: data.data?.referenceNumber || data.referenceNumber || data.refNumber,
          fullResponse: data,
          endpoint: apiUrl,
        });

        // If 404, try next endpoint
        if (response.status === 404 && endpoints.indexOf(apiUrl) < endpoints.length - 1) {
          lastError = { status: response.status, error: data.message || data.error || `Endpoint not found: ${apiUrl}` };
          continue;
        }

        // If not OK, return error (but don't try next endpoint for non-404 errors)
        if (!response.ok) {
          console.error("OnMeta link bank error details:", {
            status: response.status,
            statusText: response.statusText,
            error: data.error,
            message: data.message,
            fullResponse: data,
            endpoint: apiUrl,
          });
          return {
            success: false,
            error: data.message || data.error || `Failed to link bank account: ${response.status} ${response.statusText}`,
          };
        }

        // Success! Break out of loop
        break;
      } catch (error: any) {
        console.error(`OnMeta link bank error for endpoint ${apiUrl}:`, error);
        lastError = error;
        // If this is the last endpoint, return error
        if (endpoints.indexOf(apiUrl) === endpoints.length - 1) {
          return {
            success: false,
            error: error.message || "Network error occurred",
          };
        }
        // Otherwise, try next endpoint
        continue;
      }
    }

    // If we got here without success, return last error
    if (!response || !response.ok) {
      return {
        success: false,
        error: lastError?.error || lastError?.message || "Failed to link bank account after trying all endpoints",
      };
    }

    // OnMeta response: { success: true, data: { status: "SUCCESS", referenceNumber: "89822" }, error: {} }
    return {
      success: true,
      status: data.data?.status || data.status || data.accountStatus,
      refNumber: data.data?.referenceNumber || data.referenceNumber || data.refNumber || data.ref_number,
      message: data.message || data.data?.message,
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
 * GET /v1/users/get-bank-status (or similar endpoint)
 * Note: This endpoint may require refNumber or may not exist - handle gracefully
 */
/**
 * Get Bank Status
 * GET /v1/users/get-bank-status/{refNumber}
 * Requires refNumber in the path
 */
export async function onMetaGetBankStatus(accessToken: string, refNumber?: string): Promise<{ success: boolean; status?: string; error?: string; refNumber?: string }> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    // OnMeta requires refNumber in the path: /v1/users/get-bank-status/{refNumber}
    if (!refNumber) {
      return {
        success: false,
        error: "Reference number (refNumber) is required to check bank status",
      };
    }

    // Primary endpoint: /v1/users/get-bank-status/{refNumber}
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/users/get-bank-status/${refNumber}`;
    
    console.log("OnMeta get bank status request:", { url: apiUrl, refNumber });
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": ONMETA_CLIENT_ID,
        "Accept": "application/json",
      },
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("OnMeta get bank status response is not JSON:", {
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
    console.log("OnMeta get bank status response:", {
      status: response.status,
      bankStatus: data.data?.bankStatus || data.bankStatus || data.status || data.accountStatus,
      fullResponse: data,
    });

    if (response.ok) {
      // OnMeta response: { success: true, data: { bankStatus: "SUCCESS", transactionId: "1212", referenceId: "89822" }, error: {} }
      return {
        success: true,
        status: data.data?.bankStatus || data.bankStatus || data.status || data.accountStatus,
        refNumber: data.data?.referenceId || data.data?.refNumber || data.referenceId || data.refNumber || refNumber,
      };
    }

    // Return error
    return {
      success: false,
      error: data.message || data.error || `Failed to get bank status: ${response.status} ${response.statusText}`,
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
      email: request.email.toLowerCase(), // Ensure email is lowercase
      upiId: request.upiId,
    };

    if (request.phone) {
      requestBody.phone = request.phone;
    }

    // OnMeta endpoint: POST /v1/users/upi-link (confirmed by OnMeta documentation)
    // Response: { success: true, data: { status: "SUCCESS", referenceId: "89822" }, error: {} }
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/users/upi-link`;
    
    // Validate API base URL and client ID before making request
    if (!ONMETA_API_BASE_URL || ONMETA_API_BASE_URL.includes('undefined')) {
      return {
        success: false,
        error: `Invalid ONMETA_API_BASE_URL: ${ONMETA_API_BASE_URL}`,
      };
    }
    
    if (!ONMETA_CLIENT_ID || ONMETA_CLIENT_ID.trim() === '') {
      return {
        success: false,
        error: 'ONMETA_CLIENT_ID is not configured',
      };
    }

    console.log("OnMeta link UPI request:", {
      url: apiUrl,
      email: request.email,
      upiId: request.upiId,
      requestBody: JSON.stringify(requestBody, null, 2),
    });

    let response: Response;
    let data: any;

    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${request.accessToken}`,
          "x-api-key": ONMETA_CLIENT_ID,
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("OnMeta link UPI response is not JSON:", {
          status: response.status,
          contentType,
          textPreview: text.substring(0, 200),
          endpoint: apiUrl,
        });
        
        return {
          success: false,
          error: `Invalid response from OnMeta API: ${response.status} ${response.statusText}`,
        };
      }

      // Parse JSON response
      data = await response.json();
      console.log("OnMeta link UPI response:", {
        status: response.status,
        statusText: response.statusText,
        upiStatus: data.data?.status || data.status,
        referenceId: data.data?.referenceId || data.referenceId || data.refNumber,
        fullResponse: JSON.stringify(data, null, 2),
        endpoint: apiUrl,
      });

      // If not OK, return error with detailed information
      if (!response.ok) {
        // Extract error message from various possible locations
        // OnMeta can return error as: {error: {code: 400, message: "KYC not verified"}} or {error: "KYC not verified"}
        let errorMessage = `Failed to link UPI: ${response.status} ${response.statusText}`;
        
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (typeof data.error === 'object' && data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'object' && data.error.code) {
            errorMessage = data.error.message || `Error ${data.error.code}`;
          }
        } else if (data.message) {
          errorMessage = typeof data.message === 'string' ? data.message : (data.message.message || String(data.message));
        } else if (data.errorMessage) {
          errorMessage = typeof data.errorMessage === 'string' ? data.errorMessage : String(data.errorMessage);
        } else if (data.data && typeof data.data === 'object') {
          if (data.data.error) {
            errorMessage = typeof data.data.error === 'string' ? data.data.error : (data.data.error.message || String(data.data.error));
          } else if (data.data.message) {
            errorMessage = typeof data.data.message === 'string' ? data.data.message : String(data.data.message);
          }
        }
        
        console.error("OnMeta link UPI error details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          fullResponse: JSON.stringify(data, null, 2),
          endpoint: apiUrl,
          requestBody: requestBody,
        });
        
        return {
          success: false,
          error: errorMessage,
          statusCode: response.status,
          onMetaError: typeof data.error === 'object' ? data.error.message : (data.error || data.message),
        };
      }
    } catch (error: any) {
      console.error("OnMeta link UPI error:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
      };
    }

    // OnMeta response: { success: true, data: { status: "SUCCESS", referenceId: "89822" }, error: {} }
    return {
      success: true,
      status: data.data?.status || data.status || data.upiStatus,
      refNumber: data.data?.referenceId || data.referenceId || data.refNumber || data.ref_number || data.referenceNumber,
      message: data.message || data.data?.message,
    };
  } catch (error: any) {
    console.error("OnMeta link UPI error:", {
      error: error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    // Extract error message
    let errorMessage = "Network error occurred";
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error) {
      errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get UPI Status
 * GET /v1/users/get-upi-status/{refNumber}
 * Requires refNumber in the path
 */
export async function onMetaGetUPIStatus(accessToken: string, refNumber?: string): Promise<{ success: boolean; status?: string; error?: string; refNumber?: string }> {
  try {
    if (!ONMETA_CLIENT_ID) {
      return {
        success: false,
        error: "OnMeta API credentials not configured",
      };
    }

    // OnMeta requires refNumber in the path: /v1/users/get-upi-status/{refNumber}
    if (!refNumber) {
      return {
        success: false,
        error: "Reference number (refNumber) is required to check UPI status",
      };
    }

    // Primary endpoint: /v1/users/get-upi-status/{refNumber}
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/users/get-upi-status/${refNumber}`;
    
    console.log("OnMeta get UPI status request:", { url: apiUrl, refNumber });
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": ONMETA_CLIENT_ID,
        "Accept": "application/json",
      },
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("OnMeta get UPI status response is not JSON:", {
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
    console.log("OnMeta get UPI status response:", {
      status: response.status,
      upiStatus: data.data?.upiStatus || data.upiStatus || data.status,
      fullResponse: JSON.stringify(data, null, 2),
      allFields: Object.keys(data),
      dataFields: data.data ? Object.keys(data.data) : null,
    });

    if (response.ok) {
      // OnMeta response: { success: true, data: { upiStatus: "SUCCESS", referenceId: "89822" }, error: {} }
      return {
        success: true,
        status: data.data?.upiStatus || data.upiStatus || data.status,
        refNumber: data.data?.referenceId || data.data?.refNumber || data.referenceId || data.refNumber || refNumber,
      };
    }

    // Return error
    return {
      success: false,
      error: data.message || data.error || `Failed to get UPI status: ${response.status} ${response.statusText}`,
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
      console.error("OnMeta API credentials missing: ONMETA_CLIENT_ID is not set in environment variables");
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please set ONMETA_CLIENT_ID in Vercel environment variables.",
      };
    }

    // Correct endpoint for fetch tokens
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/tokens/`;
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
      console.error("OnMeta fetch tokens response is not JSON:", {
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
    console.log("OnMeta fetch tokens response:", {
      status: response.status,
      tokenCount: Array.isArray(data) ? data.length : data.tokens?.length || 0,
    });

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Failed to fetch tokens: ${response.status} ${response.statusText}`,
      };
    }

    // Handle both array response and object with tokens property
    const tokens = Array.isArray(data) ? data : (data.tokens || data.data || []);
    
    return {
      success: true,
      tokens: tokens,
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
      console.error("OnMeta API credentials missing: ONMETA_CLIENT_ID is not set in environment variables");
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please set ONMETA_CLIENT_ID in Vercel environment variables.",
      };
    }

    // Correct endpoint for fetch chain limits
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/orders/get-chain-limit`;
    console.log("OnMeta fetch chain limits request:", { 
      url: apiUrl,
      hasApiKey: !!ONMETA_CLIENT_ID,
      apiKeyPrefix: ONMETA_CLIENT_ID ? ONMETA_CLIENT_ID.substring(0, 8) + "..." : "missing",
    });

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
      console.error("OnMeta fetch chain limits response is not JSON:", {
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
    console.log("OnMeta fetch chain limits response:", {
      status: response.status,
      hasLimits: !!data.limits || !!data.data || Array.isArray(data),
    });

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Failed to fetch chain limits: ${response.status} ${response.statusText}`,
      };
    }

    // Handle different response formats
    const limits = Array.isArray(data) ? data : (data.limits || data.data || []);
    
    return {
      success: true,
      limits: limits,
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

    // Correct endpoint for fetch quotation
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/quote/buy`;
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

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("OnMeta fetch quotation response is not JSON:", {
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
    console.log("OnMeta fetch quotation response:", {
      status: response.status,
      hasQuotation: !!data.quotation || !!data.data,
    });

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Failed to fetch quotation: ${response.status} ${response.statusText}`,
      };
    }

    // Handle different response formats
    const quotation = data.quotation || data.data || data;
    
    return {
      success: true,
      quotation: quotation,
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
          orderCount: Array.isArray(data) ? data.length : (data.orders?.length || data.transactions?.length || data.data?.length || 0),
          endpoint: apiUrl,
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

        // If 404 or 400, try next endpoint
        if (response.status === 404 || response.status === 400) {
          console.log(`Endpoint ${apiUrl} returned ${response.status}, trying next endpoint...`);
          lastError = {
            message: data.message || data.error || `Endpoint not found or invalid: ${apiUrl}`,
            status: response.status,
          };
          continue; // Try next endpoint
        }

        // For other errors, don't try other endpoints
        lastError = data;
        break;
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        continue; // Try next endpoint
      }
    }

    // If all endpoints failed with 404/400, return empty array instead of error (order history is optional)
    // This allows the app to continue working even if order history endpoint doesn't exist
    if (lastError && (lastError.status === 404 || lastError.status === 400)) {
      console.warn("OnMeta order history endpoint not found, returning empty array");
      return {
        success: true,
        orders: [],
        transactions: [],
        hasMore: false,
        skip: skip,
        message: "Order history endpoint not available",
      };
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
      console.error("OnMeta API credentials missing: ONMETA_CLIENT_ID is not set in environment variables");
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please set ONMETA_CLIENT_ID in Vercel environment variables.",
      };
    }

    // Try different endpoint patterns - start with the most likely one
    // Ensure no double slashes by removing trailing slash from base URL (already done above)
    // Note: Based on testing, currencies endpoint might not exist or require different auth
    // Try only the main endpoint, if it fails, return empty array instead of error
    const possibleEndpoints = [
      `${ONMETA_API_BASE_URL}/v1/currencies`,
    ].map(url => {
      // Fix double slashes but preserve https:// protocol
      // Replace multiple slashes after the protocol with single slash
      return url.replace(/(https?:\/\/[^\/]+)\/+/g, '$1/');
    });

    let lastError: any = null;
    let lastResponse: Response | null = null;

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

        lastResponse = response;

        // If 404, try next endpoint
        if (response.status === 404) {
          console.log(`Endpoint ${apiUrl} returned 404, trying next endpoint...`);
          lastError = { message: `Endpoint not found: ${apiUrl}` };
          continue; // Try next endpoint
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error(`OnMeta fetch supported currencies response is not JSON for ${apiUrl}:`, {
            status: response.status,
            contentType,
            textPreview: text.substring(0, 200),
          });
          
          // If not 404, this is a real error
          if (response.status !== 404) {
            lastError = { message: `Invalid response format: ${response.status} ${response.statusText}` };
            break; // Don't try other endpoints
          }
          continue; // Try next endpoint for 404
        }

        const data = await response.json();
        console.log("OnMeta fetch supported currencies response:", {
          status: response.status,
          currencyCount: Array.isArray(data) ? data.length : (data.currencies?.length || data.data?.length || 0),
          endpoint: apiUrl,
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

        // If not 404, this is a real error - don't try other endpoints
        if (response.status !== 404) {
          lastError = {
            message: data.message || data.error || `Failed to fetch currencies: ${response.status} ${response.statusText}`,
            status: response.status,
            data: data,
          };
          break; // Don't try other endpoints if it's not a 404
        }
      } catch (fetchError: any) {
        console.error(`Error trying endpoint ${apiUrl}:`, fetchError);
        lastError = fetchError;
        // Continue to try next endpoint
        continue;
      }
    }

    // If we tried all endpoints and none worked
    // If it's a 404, the endpoint might not exist - return empty array instead of error
    // This allows the app to continue working even if currencies endpoint is unavailable
    if (lastResponse && lastResponse.status === 404) {
      console.warn("OnMeta currencies endpoint not found, returning empty array");
      return {
        success: true,
        currencies: [],
        supportedCurrencies: [],
        message: "Currencies endpoint not available",
      };
    }
    
    // For other errors, return error
    let errorMessage = `Failed to fetch supported currencies. Tried ${possibleEndpoints.length} endpoints`;
    if (lastResponse) {
      errorMessage += `, last status: ${lastResponse.status}`;
    }
    if (lastError?.message) {
      errorMessage = lastError.message;
    } else if (lastError?.error) {
      errorMessage = lastError.error;
    }
    
    return {
      success: false,
      error: errorMessage,
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


// ==================== KYC Status ====================

export interface OnMetaKYCStatusRequest {
  accessToken?: string; // Optional: Bearer token from customer login
  email: string; // Email of the customer
}

export interface OnMetaKYCStatusResponse {
  success: boolean;
  kycStatus?: string; // e.g., "VERIFIED", "PENDING", "REJECTED"
  isVerified?: boolean;
  message?: string;
  error?: string;
}

/**
 * Fetch KYC status of a user by email
 * POST /v1/users/kyc-status
 */
export async function fetchKYCStatus(request: OnMetaKYCStatusRequest): Promise<OnMetaKYCStatusResponse> {
  try {
    if (!ONMETA_CLIENT_ID) {
      console.error("OnMeta API credentials missing: ONMETA_CLIENT_ID is not set in environment variables");
      return {
        success: false,
        error: "OnMeta API credentials not configured. Please set ONMETA_CLIENT_ID in Vercel environment variables.",
      };
    }

    if (!request.email || !request.email.includes('@')) {
      return {
        success: false,
        error: "Valid email is required",
      };
    }

    const requestBody = {
      email: request.email.toLowerCase(), // Ensure email is lowercase
    };

    // Production endpoint for KYC status
    const apiUrl = `${ONMETA_API_BASE_URL}/v1/users/kyc-status`;
    console.log("OnMeta fetch KYC status request:", {
      url: apiUrl,
      email: request.email,
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": ONMETA_CLIENT_ID,
      "Accept": "application/json",
    };

    // Authorization header is required for KYC status check
    // Use access token if provided, otherwise API call may fail
    if (request.accessToken) {
      headers["Authorization"] = `Bearer ${request.accessToken}`;
    } else {
      console.warn("OnMeta KYC status check: Access token not provided. API may return error.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("OnMeta fetch KYC status response is not JSON:", {
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
    console.log("OnMeta fetch KYC status response:", {
      status: response.status,
      statusText: response.statusText,
      kycStatus: data.kycStatus || data.status || data.kyc_status || data.data?.kycStatus,
      isVerified: data.isVerified || data.is_verified || data.data?.isVerified,
      fullResponse: JSON.stringify(data, null, 2),
    });

    if (!response.ok) {
      // Extract error message from various possible formats
      let errorMessage = `Failed to fetch KYC status: ${response.status} ${response.statusText}`;
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error.message) {
          errorMessage = data.error.message;
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      console.error("OnMeta fetch KYC status error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        fullResponse: data,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Handle different response formats from OnMeta
    // OnMeta may return: 
    // - { success: true, isVerified: false } - KYC not verified
    // - { success: true, isVerified: true } - KYC verified
    // - { kycStatus: "VERIFIED" } or { status: "VERIFIED" } or { data: { kycStatus: "VERIFIED" } }
    const kycStatus = data.kycStatus || data.status || data.kyc_status || data.data?.kycStatus || data.data?.status;
    
    // Check isVerified flag first (most reliable)
    const isVerifiedFlag = data.isVerified === true || 
                          data.is_verified === true || 
                          data.data?.isVerified === true ||
                          data.data?.is_verified === true;
    
    // Check status string
    const isVerifiedStatus = kycStatus === 'VERIFIED' || 
                            kycStatus === 'verified' || 
                            kycStatus === 'VERIFIED_SUCCESS' ||
                            kycStatus === 'SUCCESS';
    
    const isVerified = isVerifiedFlag || isVerifiedStatus;

    console.log("OnMeta KYC status parsing:", {
      kycStatus,
      isVerifiedFlag,
      isVerifiedStatus,
      isVerified,
      hasIsVerified: 'isVerified' in data,
      isVerifiedValue: data.isVerified,
    });

    return {
      success: true,
      kycStatus: kycStatus,
      isVerified: isVerified,
      message: data.message || data.data?.message,
    };
  } catch (error: any) {
    console.error("OnMeta fetch KYC status error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}
