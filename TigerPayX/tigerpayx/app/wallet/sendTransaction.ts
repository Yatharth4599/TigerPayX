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
  getAllTokenAccounts,
  getTokenAccountAddress,
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
    let knownTokenAccountAddress: string | undefined = undefined;
    
    try {
      const currentBalance = await getTokenBalance(senderAddress, tokenMint);
      const balanceNum = parseFloat(currentBalance);
      
      console.log(`[sendToken] Current balance from getTokenBalance: ${currentBalance} (parsed: ${balanceNum})`);
      
      // Try to get the account address if balance exists
      // Use getTokenAccountAddress which uses the same logic as getTokenBalance
      if (balanceNum > 0) {
        try {
          const accountAddress = await getTokenAccountAddress(senderAddress, tokenMint);
          if (accountAddress) {
            knownTokenAccountAddress = accountAddress;
            console.log(`[sendToken] ✅ Found token account address using getTokenAccountAddress: ${knownTokenAccountAddress}`);
          } else {
            console.warn(`[sendToken] ⚠️ Balance exists (${balanceNum}) but getTokenAccountAddress returned null`);
            // Fallback to getAllTokenAccounts
            try {
              const allAccounts = await getAllTokenAccounts(senderAddress);
              const searchMint = tokenMint.trim();
              const matchingAccount = allAccounts.find((acc) => {
                const normalizedMint = acc.mint.trim();
                return normalizedMint === searchMint;
              });
              if (matchingAccount) {
                knownTokenAccountAddress = matchingAccount.accountAddress;
                console.log(`[sendToken] ✅ Found token account address via getAllTokenAccounts fallback: ${knownTokenAccountAddress}`);
              }
            } catch (fallbackErr) {
              console.warn(`[sendToken] Fallback to getAllTokenAccounts also failed:`, fallbackErr);
            }
          }
        } catch (err) {
          console.warn(`[sendToken] Could not get account address, will let buildTokenTransferTransaction find it:`, err);
        }
      }
      
      // If balance is 0 or NaN, check if it's because the account doesn't exist or RPC issue
      if (isNaN(balanceNum) || balanceNum === 0) {
        console.warn(`[sendToken] Balance is 0 or NaN. Checking if this is a real zero balance or RPC issue...`);
        
        // Try to directly check if any token accounts exist for this mint
        // This helps distinguish between "no account" vs "RPC error"
        try {
          // Use the helper function to get all token accounts
          const allAccounts = await getAllTokenAccounts(senderAddress);
          
          console.log(`[sendToken] Found ${allAccounts.length} total token accounts`);
          
          // Check if any account matches our mint (normalize comparison)
          const searchMint = tokenMint.trim();
          const matchingAccount = allAccounts.find((acc) => {
            const normalizedMint = acc.mint.trim();
            return normalizedMint === searchMint;
          });
          
          if (matchingAccount) {
            console.log(`[sendToken] Found matching token account with balance: ${matchingAccount.balance}`);
            
            if (matchingAccount.balance === 0) {
              throw new Error(`You have a ${token} token account but it has zero balance. You need to receive ${token} first before you can send it.`);
            }
            
            if (matchingAccount.balance < amount) {
              throw new Error(`Insufficient ${token} balance. You have ${matchingAccount.balance.toFixed(matchingAccount.decimals)} ${token} but trying to send ${amount} ${token}.`);
            }
            
            // Balance is sufficient, continue
            console.log(`[sendToken] Direct check passed: ${matchingAccount.balance} >= ${amount}`);
          } else {
            // Log all mint addresses found for debugging
            const foundMints = allAccounts.map((acc) => acc.mint);
            const foundBalances = allAccounts.map((acc) => acc.balance);
            
            console.error(`[sendToken] ❌ No matching token account found`);
            console.error(`[sendToken] Expected mint: ${tokenMint}`);
            console.error(`[sendToken] Found ${allAccounts.length} token account(s):`);
            allAccounts.forEach((acc, idx) => {
              console.error(`[sendToken]   ${idx + 1}. Mint: ${acc.mint}`);
              console.error(`[sendToken]      Balance: ${acc.balance}`);
              console.error(`[sendToken]      Account: ${acc.accountAddress.substring(0, 16)}...`);
            });
            
            // Check if any of the found mints might be a different version of the same token
            // (e.g., different USDT mint)
            const isUSDTSearch = token === "USDT";
            const isUSDCSearch = token === "USDC";
            
            if (isUSDTSearch || isUSDCSearch) {
              // Log a helpful message about potential mint mismatch
              console.error(`[sendToken] 💡 Your wallet has token accounts, but they don't match the expected ${token} mint address.`);
              console.error(`[sendToken] 💡 This could mean:`);
              console.error(`[sendToken]    1. You received a different version of ${token} (different mint address)`);
              console.error(`[sendToken]    2. The mint address in the config is incorrect`);
              console.error(`[sendToken]    3. You need to receive ${token} using the correct mint address`);
              console.error(`[sendToken] 💡 Please check Solscan (https://solscan.io/account/${senderAddress}) to see which mint address your ${token} uses.`);
              console.error(`[sendToken] 💡 Then share the mint address with us so we can update the config.`);
            }
            
            throw new Error(`You don't have a ${token} token account. You need to receive ${token} first before you can send it. Found ${allAccounts.length} other token account(s) but none match the expected ${token} mint address. Check the browser console for the actual mint address(es) in your wallet.`);
          }
        } catch (directCheckError: any) {
          // If direct check fails, use the original error
          const errorMsg = directCheckError?.message || "";
          if (errorMsg.includes("don't have a") || errorMsg.includes("Insufficient")) {
            throw directCheckError; // Re-throw our custom errors
          }
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
    console.log(`[sendToken] Known token account address: ${knownTokenAccountAddress || 'none (will search)'}`);
    const transaction = await buildTokenTransferTransaction(
      keypair,
      toAddress,
      tokenMint,
      amount,
      decimals,
      knownTokenAccountAddress // Pass the known account address if we have it
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

