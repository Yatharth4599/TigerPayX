// Import an existing Solana wallet

import { Keypair } from "@solana/web3.js";
import { STORAGE_KEYS } from "@/shared/constants";
import { getKeypairFromPrivateKey } from "./solanaUtils";

/**
 * Import wallet from private key (base64 or array format)
 */
export async function importWallet(privateKey: string): Promise<{
  address: string;
  success: boolean;
  error?: string;
}> {
  try {
    // Validate and get keypair
    const keypair = getKeypairFromPrivateKey(privateKey);
    const publicKey = keypair.publicKey.toBase58();
    
    // Convert to base64 if needed for storage
    let privateKeyForStorage = privateKey;
    if (!privateKey.includes("=")) {
      // Assume it's a raw key, convert to base64
      try {
        const keyBuffer = Buffer.from(privateKey, "base64");
        privateKeyForStorage = Buffer.from(keyBuffer).toString("base64");
      } catch {
        // Try as hex
        const keyBuffer = Buffer.from(privateKey, "hex");
        privateKeyForStorage = Buffer.from(keyBuffer).toString("base64");
      }
    }
    
    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.WALLET_PRIVATE_KEY, privateKeyForStorage);
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, publicKey);
      localStorage.setItem(STORAGE_KEYS.WALLET_IMPORTED, "true");
    }
    
    return {
      address: publicKey,
      success: true,
    };
  } catch (error: any) {
    return {
      address: "",
      success: false,
      error: error.message || "Invalid private key",
    };
  }
}

/**
 * Import wallet from seed phrase (placeholder for future)
 */
export function importWalletFromSeed(seedPhrase: string): {
  publicKey: string;
  success: boolean;
  error?: string;
} {
  // TODO: Implement BIP39/BIP44 derivation
  return {
    publicKey: "",
    success: false,
    error: "Seed phrase import not implemented in MVP",
  };
}

/**
 * Clear wallet from storage (logout)
 */
export function clearWallet(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.WALLET_PRIVATE_KEY);
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.WALLET_IMPORTED);
  }
}

