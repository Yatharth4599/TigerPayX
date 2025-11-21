// Create a new non-custodial Solana wallet

import { Keypair } from "@solana/web3.js";
import { STORAGE_KEYS } from "@/shared/constants";

/**
 * Generate a new Solana wallet
 * Private key is stored locally in browser storage (never sent to server)
 */
export function createWallet(): {
  publicKey: string;
  privateKey: string; // Base64 encoded secret key
} {
  // Generate new keypair
  const keypair = Keypair.generate();
  
  // Convert private key to base64 for storage
  const privateKey = Buffer.from(keypair.secretKey).toString("base64");
  const publicKey = keypair.publicKey.toBase58();
  
  // Store in localStorage (client-side only)
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.WALLET_PRIVATE_KEY, privateKey);
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, publicKey);
    localStorage.setItem(STORAGE_KEYS.WALLET_IMPORTED, "false");
  }
  
  return {
    publicKey,
    privateKey,
  };
}

/**
 * Check if wallet exists
 */
export function hasWallet(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEYS.WALLET_PRIVATE_KEY);
}

/**
 * Get stored wallet address
 */
export function getStoredWalletAddress(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
}

/**
 * Get stored private key (for signing transactions)
 * WARNING: This should only be used client-side for signing
 */
export function getStoredPrivateKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.WALLET_PRIVATE_KEY);
}

