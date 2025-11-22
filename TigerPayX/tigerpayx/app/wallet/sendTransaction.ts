// Send Solana transactions (SOL or SPL tokens)

import { Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  buildSolTransferTransaction,
  buildTokenTransferTransaction,
  signAndSendTransaction,
  getKeypairFromPrivateKey,
  getTokenBalance,
  getSolBalance,
  getSolanaConnection,
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
      
      console.log(`[sendToken] Current balance from getTokenBalance: ${currentBalance} (parsed: ${balanceNum})`);
      
      // If balance is 0 or NaN, check if it's because the account doesn't exist or RPC issue
      if (isNaN(balanceNum) || balanceNum === 0) {
        console.warn(`[sendToken] Balance is 0 or NaN. Checking if this is a real zero balance or RPC issue...`);
        
        // Try to directly check if any token accounts exist for this mint
        // This helps distinguish between "no account" vs "RPC error"
        try {
          const connection = getSolanaConnection();
          const publicKey = new PublicKey(senderAddress);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
          });
          
          console.log(`[sendToken] Found ${tokenAccounts.value.length} total token accounts`);
          
          // Check if any account matches our mint
          const matchingAccount = tokenAccounts.value.find(
            (acc) => acc.account.data.parsed.info.mint === tokenMint
          );
          
          if (matchingAccount) {
            const accountBalance = Number(matchingAccount.account.data.parsed.info.tokenAmount.amount) / Math.pow(10, decimals);
            console.log(`[sendToken] Found matching token account with balance: ${accountBalance}`);
            
            if (accountBalance === 0) {
              throw new Error(`You have a ${token} token account but it has zero balance. You need to receive ${token} first before you can send it.`);
            }
            
            if (accountBalance < amount) {
              throw new Error(`Insufficient ${token} balance. You have ${accountBalance.toFixed(decimals)} ${token} but trying to send ${amount} ${token}.`);
            }
            
            // Balance is sufficient, continue
            console.log(`[sendToken] Direct check passed: ${accountBalance} >= ${amount}`);
          } else {
            throw new Error(`You don't have a ${token} token account. You need to receive ${token} first before you can send it. Found ${tokenAccounts.value.length} other token accounts but none match ${tokenMint.substring(0, 8)}...`);
          }
        } catch (directCheckError: any) {
          // If direct check fails, use the original error
          throw new Error(`You don't have any ${token} in your wallet. You need to receive ${token} first before you can send it. Current balance: ${currentBalance}`);
        }
      } else {
        // Balance is non-zero, check if sufficient
        if (balanceNum < amount) {
          throw new Error(`Insufficient ${token} balance. You have ${currentBalance} ${token} but trying to send ${amount} ${token}.`);
        }
        
        console.log(`[sendToken] Balance check passed: ${balanceNum} >= ${amount}`);
      }
    } catch (balanceError: any) {
      // If balance check fails, throw a clear error
      const errorMsg = balanceError?.message || "";
      if (errorMsg.includes("don't have any") || 
          errorMsg.includes("Insufficient") ||
          errorMsg.includes("don't have a token account") ||
          errorMsg.includes("TokenAccountNotFound")) {
        throw balanceError; // Re-throw our custom errors
      }
      // If it's an RPC error during balance check, throw a clear error
      console.error(`[sendToken] Balance check failed: ${errorMsg}`);
      throw new Error(`Unable to check your ${token} balance. Please check your RPC connection and try again. Error: ${errorMsg}`);
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

