// QR code scanner utilities for Solana addresses and payment links

/**
 * Parse QR code data for Solana payment
 * Supports:
 * - Direct Solana address
 * - Payment link format: tigerpayx://pay?address=...&token=...&amount=...
 * - Standard Solana URI: solana:address?amount=...&token=...
 */
export interface ParsedQRData {
  address: string;
  token?: string;
  amount?: number;
  description?: string;
  payLinkId?: string;
}

/**
 * Parse QR code string
 */
export function parseQRCode(qrData: string): ParsedQRData | null {
  try {
    // Direct Solana address
    if (isValidSolanaAddress(qrData)) {
      return {
        address: qrData,
      };
    }

    // TigerPayX payment link format
    if (qrData.startsWith("tigerpayx://pay")) {
      return parseTigerPayXLink(qrData);
    }

    // Solana URI format
    if (qrData.startsWith("solana:")) {
      return parseSolanaURI(qrData);
    }

    // Try as direct address anyway
    if (qrData.length >= 32 && qrData.length <= 44) {
      return {
        address: qrData,
      };
    }

    return null;
  } catch (error) {
    console.error("Error parsing QR code:", error);
    return null;
  }
}

/**
 * Parse TigerPayX payment link
 */
function parseTigerPayXLink(link: string): ParsedQRData | null {
  try {
    const url = new URL(link);
    const params = url.searchParams;

    const address = params.get("address");
    if (!address || !isValidSolanaAddress(address)) {
      return null;
    }

    return {
      address,
      token: params.get("token") || undefined,
      amount: params.get("amount") ? parseFloat(params.get("amount")!) : undefined,
      description: params.get("description") || undefined,
      payLinkId: params.get("payLinkId") || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Parse Solana URI format
 */
function parseSolanaURI(uri: string): ParsedQRData | null {
  try {
    const url = new URL(uri);
    const address = url.pathname;

    if (!isValidSolanaAddress(address)) {
      return null;
    }

    const params = url.searchParams;

    return {
      address,
      amount: params.get("amount") ? parseFloat(params.get("amount")!) : undefined,
      token: params.get("token") || undefined,
      description: params.get("label") || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Generate QR code data for Solana address
 */
export function generateAddressQR(address: string): string {
  return address;
}

/**
 * Generate QR code data for payment link
 */
export function generatePaymentQR(data: {
  address: string;
  token?: string;
  amount?: number;
  description?: string;
  payLinkId?: string;
}): string {
  const params = new URLSearchParams();
  params.set("address", data.address);
  if (data.token) params.set("token", data.token);
  if (data.amount) params.set("amount", data.amount.toString());
  if (data.description) params.set("description", data.description);
  if (data.payLinkId) params.set("payLinkId", data.payLinkId);

  return `tigerpayx://pay?${params.toString()}`;
}

/**
 * Validate Solana address
 */
function isValidSolanaAddress(address: string): boolean {
  try {
    if (!address || address.length < 32 || address.length > 44) {
      return false;
    }
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
}

