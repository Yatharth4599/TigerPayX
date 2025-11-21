// Send Solana transactions (SOL or SPL tokens)

import { Keypair } from "@solana/web3.js";
import {
  buildSolTransferTransaction,
  buildTokenTransferTransaction,
  signAndSendTransaction,
  getKeypairFromPrivateKey,
} from "./solanaUtils";
import { getTokenMint, TOKEN_DECIMALS, SOLANA_CONFIG } from "@/shared/config";
import { getStoredPrivateKey } from "./createWallet";
import type { Token, SolanaTransactionResult } from "@/shared/types";

/**
 * Send SOL to another address
 */
export async function sendSol(
  toAddress: string,
  amount: number,
  privateKey?: string
): Promise<SolanaTransactionResult> {
  try {
    // Get private key from storage if not provided
    const key = privateKey || getStoredPrivateKey();
    if (!key) {
      throw new Error("No wallet found. Please create or import a wallet.");
    }

    const keypair = getKeypairFromPrivateKey(key);
    
    // Build transaction
    const transaction = await buildSolTransferTransaction(
      keypair,
      toAddress,
      amount
    );

    // Sign and send
    const signature = await signAndSendTransaction(transaction, keypair);

    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    return {
      signature: "",
      success: false,
      error: error.message || "Transaction failed",
    };
  }
}

/**
 * Send SPL token to another address
 */
export async function sendToken(
  toAddress: string,
  token: Token,
  amount: number,
  privateKey?: string
): Promise<SolanaTransactionResult> {
  try {
    // Get private key from storage if not provided
    const key = privateKey || getStoredPrivateKey();
    if (!key) {
      throw new Error("No wallet found. Please create or import a wallet.");
    }

    const keypair = getKeypairFromPrivateKey(key);
    const network = SOLANA_CONFIG.network;
    const tokenMint = getTokenMint(token, network);
    const decimals = TOKEN_DECIMALS[token] || 9;

    if (!tokenMint) {
      throw new Error(`Token mint not found for ${token}`);
    }

    // Build transaction
    const transaction = await buildTokenTransferTransaction(
      keypair,
      toAddress,
      tokenMint,
      amount,
      decimals
    );

    // Sign and send
    const signature = await signAndSendTransaction(transaction, keypair);

    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    return {
      signature: "",
      success: false,
      error: error.message || "Transaction failed",
    };
  }
}

/**
 * Send payment (SOL or token) - unified interface
 */
export async function sendPayment(
  toAddress: string,
  token: Token,
  amount: number,
  privateKey?: string
): Promise<SolanaTransactionResult> {
  if (token === "SOL") {
    return sendSol(toAddress, amount, privateKey);
  } else {
    return sendToken(toAddress, token, amount, privateKey);
  }
}

