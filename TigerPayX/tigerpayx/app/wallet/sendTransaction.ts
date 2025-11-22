// Send Solana transactions (SOL or SPL tokens)

import { Keypair } from "@solana/web3.js";
import {
  buildSolTransferTransaction,
  buildTokenTransferTransaction,
  signAndSendTransaction,
  getKeypairFromPrivateKey,
  getTokenBalance,
  getSolBalance,
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
    console.log(`[sendSol] Sending ${amount} SOL to ${toAddress}`);
    
    // Get private key from storage if not provided
    const key = privateKey || getStoredPrivateKey();
    if (!key) {
      throw new Error("No wallet found. Please create or import a wallet.");
    }

    const keypair = getKeypairFromPrivateKey(key);
    
    // Build transaction
    console.log(`[sendSol] Building transaction...`);
    const transaction = await buildSolTransferTransaction(
      keypair,
      toAddress,
      amount
    );

    console.log(`[sendSol] Transaction built, signing and sending...`);
    // Sign and send
    const signature = await signAndSendTransaction(transaction, keypair);

    console.log(`[sendSol] Transaction sent successfully: ${signature}`);
    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error(`[sendSol] Error:`, error);
    return {
      signature: "",
      success: false,
      error: error.message || "Transaction failed. Please check your balance and try again.",
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
    console.log(`[sendToken] Sending ${amount} ${token} to ${toAddress}`);
    
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

    console.log(`[sendToken] Using token mint: ${tokenMint} on ${network}`);

    // Pre-flight check: Verify sender has token account and sufficient balance
    console.log(`[sendToken] Checking sender balance...`);
    const senderAddress = keypair.publicKey.toString();
    
    try {
      const currentBalance = await getTokenBalance(senderAddress, tokenMint);
      const balanceNum = parseFloat(currentBalance);
      
      console.log(`[sendToken] Current balance: ${balanceNum} ${token}`);
      
      if (isNaN(balanceNum) || balanceNum === 0) {
        throw new Error(`You don't have any ${token} in your wallet. You need to receive ${token} first before you can send it. Current balance: ${currentBalance}`);
      }
      
      if (balanceNum < amount) {
        throw new Error(`Insufficient ${token} balance. You have ${currentBalance} ${token} but trying to send ${amount} ${token}.`);
      }
      
      console.log(`[sendToken] Balance check passed: ${balanceNum} >= ${amount}`);
    } catch (balanceError: any) {
      // If balance check fails, throw a clear error
      if (balanceError.message.includes("don't have any") || balanceError.message.includes("Insufficient")) {
        throw balanceError; // Re-throw our custom errors
      }
      // If it's an RPC error during balance check, still try to proceed but warn
      console.warn(`[sendToken] Balance check failed, but continuing: ${balanceError.message}`);
      // Don't throw - let the transaction simulation catch the error
    }

    // Build transaction
    console.log(`[sendToken] Building transaction...`);
    const transaction = await buildTokenTransferTransaction(
      keypair,
      toAddress,
      tokenMint,
      amount,
      decimals
    );

    console.log(`[sendToken] Transaction built, signing and sending...`);
    // Sign and send
    const signature = await signAndSendTransaction(transaction, keypair);

    console.log(`[sendToken] Transaction sent successfully: ${signature}`);
    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error(`[sendToken] Error:`, error);
    return {
      signature: "",
      success: false,
      error: error.message || "Transaction failed. Please check your balance and try again.",
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

