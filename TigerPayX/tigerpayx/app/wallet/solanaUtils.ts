// Solana utility functions for TigerPayX

import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount, TOKEN_PROGRAM_ID, getMint, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { SOLANA_CONFIG, TOKEN_DECIMALS, getTokenMint, TOKEN_MINTS, TOKEN_MINTS_DEVNET } from "@/shared/config";

/**
 * Get Solana connection with fallback support
 */
export function getSolanaConnection(): Connection {
  const network = SOLANA_CONFIG.network;
  const rpcUrl = network === "mainnet-beta" 
    ? SOLANA_CONFIG.rpcUrl 
    : SOLANA_CONFIG.devnetRpcUrl;
  return new Connection(rpcUrl, "confirmed");
}

/**
 * Get Solana connection with fallback RPC URLs
 * Tries multiple RPC endpoints if one fails
 */
async function getSolanaConnectionWithFallback(): Promise<Connection> {
  const network = SOLANA_CONFIG.network;
  const fallbackUrls = network === "mainnet-beta" 
    ? SOLANA_CONFIG.fallbackRpcUrls.mainnet 
    : SOLANA_CONFIG.fallbackRpcUrls.devnet;
  
  // Primary RPC URL
  const primaryUrl = network === "mainnet-beta" 
    ? SOLANA_CONFIG.rpcUrl 
    : SOLANA_CONFIG.devnetRpcUrl;
  
  // Return primary connection (fallback will happen at call site)
  return new Connection(primaryUrl, "confirmed");
}

/**
 * Try RPC call with fallback endpoints
 */
async function tryWithFallback<T>(
  operation: (connection: Connection) => Promise<T>
): Promise<T> {
  const network = SOLANA_CONFIG.network;
  const fallbackUrls = network === "mainnet-beta" 
    ? SOLANA_CONFIG.fallbackRpcUrls.mainnet 
    : SOLANA_CONFIG.fallbackRpcUrls.devnet;
  
  const primaryUrl = network === "mainnet-beta" 
    ? SOLANA_CONFIG.rpcUrl 
    : SOLANA_CONFIG.devnetRpcUrl;
  
  const urlsToTry = [primaryUrl, ...fallbackUrls];
  
  let lastError: any;
  
  for (const url of urlsToTry) {
    try {
      const connection = new Connection(url, "confirmed");
      // Set a timeout for the operation
      const result = await Promise.race([
        operation(connection),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("RPC request timeout")), 10000)
        )
      ]) as T;
      return result;
    } catch (error: any) {
      lastError = error;
      // Check for 403, rate limit, or network errors
      const is403 = error?.message?.includes("403") || 
                   error?.code === 403 || 
                   error?.status === 403 ||
                   error?.message?.includes("Forbidden");
      const isRateLimit = error?.message?.includes("rate limit") || 
                        error?.message?.includes("429");
      const isNetworkError = error?.message?.includes("Failed to fetch") ||
                            error?.message?.includes("ERR_CONNECTION");
      
      if (is403 || isRateLimit || isNetworkError) {
        console.warn(`RPC ${url} failed (${is403 ? '403' : isRateLimit ? 'rate limit' : 'network error'}), trying fallback...`);
        continue;
      }
      // For other errors, still try next endpoint
      console.warn(`RPC ${url} failed: ${error?.message}, trying fallback...`);
    }
  }
  
  // If all fail, throw the last error
  throw lastError || new Error("All RPC endpoints failed");
}

/**
 * Get keypair from private key (stored as base58 string)
 */
export function getKeypairFromPrivateKey(privateKey: string): Keypair {
  try {
    // Private key can be stored as base58 string or array
    if (typeof privateKey === "string") {
      const decoded = Buffer.from(privateKey, "base64");
      return Keypair.fromSecretKey(decoded);
    }
    return Keypair.fromSecretKey(Buffer.from(privateKey));
  } catch (error) {
    throw new Error("Invalid private key format");
  }
}

/**
 * Get keypair from seed phrase (not used in MVP, but placeholder)
 */
export function getKeypairFromSeed(seed: string): Keypair {
  // This would use BIP39/BIP44 derivation
  // For MVP, we'll use direct keypair generation
  throw new Error("Seed phrase import not implemented in MVP");
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get SOL balance with fallback RPC support
 */
export async function getSolBalance(address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await tryWithFallback(async (connection) => {
      return await connection.getBalance(publicKey);
    });
    return balance / LAMPORTS_PER_SOL;
  } catch (error: any) {
    console.error("Error getting SOL balance:", error);
    return 0;
  }
}

/**
 * Get decimals for a token mint address
 */
async function getTokenDecimals(tokenMint: string): Promise<number> {
  // First, try to get from config by matching mint address
  const network = SOLANA_CONFIG.network;
  const mints = network === "devnet" ? TOKEN_MINTS_DEVNET : TOKEN_MINTS;
  
  // Find token symbol from mint address
  for (const [symbol, mint] of Object.entries(mints)) {
    if (mint === tokenMint) {
      return TOKEN_DECIMALS[symbol] || 9;
    }
  }
  
  // If not found in config, try to fetch from blockchain
  try {
    const connection = getSolanaConnection();
    const mintPublicKey = new PublicKey(tokenMint);
    const mintInfo = await getMint(connection, mintPublicKey);
    return mintInfo.decimals;
  } catch (error) {
    // Fallback to 9 decimals (SOL standard)
    return 9;
  }
}

/**
 * Get SPL token balance with fallback RPC support
 * This function checks both the Associated Token Account (ATA) and searches for all token accounts
 * owned by the wallet that hold the specified mint, in case funds were sent before ATA creation
 */
export async function getTokenBalance(
  address: string,
  tokenMint: string
): Promise<string> {
  try {
    // Validate inputs
    if (!address || !tokenMint) {
      console.warn(`[getTokenBalance] Missing address or tokenMint: address=${address}, tokenMint=${tokenMint}`);
      return "0";
    }
    
    if (tokenMint.trim() === "") {
      console.warn(`[getTokenBalance] Empty tokenMint, returning 0`);
      return "0";
    }
    
    const publicKey = new PublicKey(address);
    const mintPublicKey = new PublicKey(tokenMint);
    const network = SOLANA_CONFIG.network;
    
    console.log(`[getTokenBalance] Checking balance for ${address.substring(0, 8)}... for mint ${tokenMint} on ${network}`);
    
    // Get token decimals
    const decimals = await getTokenDecimals(tokenMint);
    console.log(`[getTokenBalance] Using ${decimals} decimals for mint ${tokenMint}`);
    
    let totalBalance = 0;
    let usedDecimals = decimals;
    
    // First, try to get the Associated Token Account (ATA)
    try {
      const tokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      console.log(`[getTokenBalance] ATA address: ${tokenAccount.toString()}`);
      
      const accountInfo = await tryWithFallback(async (connection) => {
        return await getAccount(connection, tokenAccount);
      });
      
      const balance = Number(accountInfo.amount) / Math.pow(10, decimals);
      console.log(`[getTokenBalance] ATA balance: ${balance}`);
      
      // If ATA exists and has balance, add it to total
      if (balance > 0) {
        totalBalance += balance;
      }
    } catch (ataError: any) {
      // ATA doesn't exist or has no balance, continue to search all token accounts
      console.log(`[getTokenBalance] ATA not found or error: ${ataError?.message || ataError}`);
    }
    
    // Search for ALL token accounts owned by this wallet, then filter by mint
    // This is more reliable than filtering by mint in the query
    try {
      const allTokenAccounts = await tryWithFallback(async (connection) => {
        // Get all token accounts owned by this wallet
        return await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
      });
      
      console.log(`[getTokenBalance] Found ${allTokenAccounts.value.length} total token accounts`);
      
      // Filter by mint and sum balances
      for (const accountInfo of allTokenAccounts.value) {
        const parsedInfo = accountInfo.account.data.parsed.info;
        
        // Check if this account is for the mint we're looking for
        if (parsedInfo.mint === tokenMint) {
          const accountDecimals = parsedInfo.tokenAmount.decimals || decimals;
          usedDecimals = accountDecimals; // Use the actual decimals from the account
          const balance = Number(parsedInfo.tokenAmount.amount) / Math.pow(10, accountDecimals);
          console.log(`[getTokenBalance] Found token account ${accountInfo.pubkey.toString()} with balance: ${balance}`);
          totalBalance += balance;
        }
      }
    } catch (searchError: any) {
      console.error(`[getTokenBalance] Error searching token accounts: ${searchError?.message || searchError}`);
      // If search fails, we still have the ATA balance if it exists
    }
    
    const finalBalance = totalBalance.toFixed(usedDecimals);
    console.log(`[getTokenBalance] Final balance for ${tokenMint}: ${finalBalance}`);
    
    return finalBalance;
  } catch (error: any) {
    // Token account doesn't exist or other error
    console.error(`[getTokenBalance] Error getting token balance for ${tokenMint}:`, error);
    return "0";
  }
}

/**
 * Get all token balances for a wallet
 */
export async function getAllTokenBalances(address: string): Promise<{
  sol: string;
  usdc: string;
  usdt: string;
  tt: string;
}> {
  const connection = getSolanaConnection();
  const network = SOLANA_CONFIG.network;
  
  // Get token mints, skip if empty
  const usdcMint = getTokenMint("USDC", network);
  const usdtMint = getTokenMint("USDT", network);
  const ttMint = getTokenMint("TT", network);
  
  const [sol, usdc, usdt, tt] = await Promise.all([
    getSolBalance(address),
    usdcMint ? getTokenBalance(address, usdcMint) : Promise.resolve("0"),
    usdtMint ? getTokenBalance(address, usdtMint) : Promise.resolve("0"),
    ttMint ? getTokenBalance(address, ttMint) : Promise.resolve("0"),
  ]);

  return {
    sol: sol.toFixed(9),
    usdc,
    usdt,
    tt,
  };
}

/**
 * Build SOL transfer transaction
 */
export async function buildSolTransferTransaction(
  fromKeypair: Keypair,
  toAddress: string,
  amount: number
): Promise<Transaction> {
  const connection = getSolanaConnection();
  const toPublicKey = new PublicKey(toAddress);
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromKeypair.publicKey;

  return transaction;
}

/**
 * Build SPL token transfer transaction
 * Automatically creates recipient's token account if it doesn't exist
 */
export async function buildTokenTransferTransaction(
  fromKeypair: Keypair,
  toAddress: string,
  tokenMint: string,
  amount: number,
  decimals: number = 9
): Promise<Transaction> {
  const connection = getSolanaConnection();
  const toPublicKey = new PublicKey(toAddress);
  const mintPublicKey = new PublicKey(tokenMint);
  
  // Get associated token addresses
  const fromTokenAccount = getAssociatedTokenAddressSync(
    mintPublicKey,
    fromKeypair.publicKey
  );
  
  const toTokenAccount = getAssociatedTokenAddressSync(
    mintPublicKey,
    toPublicKey
  );

  const transaction = new Transaction();

  // Check if recipient's token account exists, if not, create it
  try {
    await getAccount(connection, toTokenAccount);
    // Account exists, no need to create it
  } catch (error) {
    // Account doesn't exist, add instruction to create it
    console.log(`[buildTokenTransferTransaction] Creating token account for recipient: ${toTokenAccount.toString()}`);
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromKeypair.publicKey, // Payer (sender pays for account creation)
        toTokenAccount, // Associated token account to create
        toPublicKey, // Owner of the token account
        mintPublicKey // Token mint
      )
    );
  }

  const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, decimals)));

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromKeypair.publicKey,
      amountInSmallestUnit
    )
  );

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromKeypair.publicKey;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
}

/**
 * Sign and send transaction with RPC fallback
 */
export async function signAndSendTransaction(
  transaction: Transaction,
  keypair: Keypair
): Promise<string> {
  try {
    console.log(`[signAndSendTransaction] Signing transaction...`);
    // Sign transaction
    transaction.sign(keypair);
    
    console.log(`[signAndSendTransaction] Sending transaction to network...`);
    
    // Try to send with fallback RPC endpoints
    let signature: string;
    try {
      signature = await tryWithFallback(async (connection) => {
        return await connection.sendRawTransaction(
          transaction.serialize(),
          {
            skipPreflight: false,
            maxRetries: 3,
          }
        );
      });
    } catch (rpcError: any) {
      // If all RPC endpoints fail, provide a helpful error message
      const errorMsg = rpcError?.message || "RPC connection failed";
      if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
        throw new Error("RPC endpoints are rate-limited. Please configure a dedicated RPC provider or try again later.");
      } else if (errorMsg.includes("timeout") || errorMsg.includes("Failed to fetch")) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      } else {
        throw new Error(`Failed to send transaction: ${errorMsg}`);
      }
    }
    
    console.log(`[signAndSendTransaction] Transaction sent, signature: ${signature}`);
    console.log(`[signAndSendTransaction] Waiting for confirmation...`);
    
    // Wait for confirmation with fallback
    try {
      const confirmation = await tryWithFallback(async (connection) => {
        return await connection.confirmTransaction(signature, "confirmed");
      });
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log(`[signAndSendTransaction] Transaction confirmed!`);
      return signature;
    } catch (confirmError: any) {
      // Even if confirmation fails, the transaction might still be processing
      console.warn(`[signAndSendTransaction] Confirmation check failed, but transaction was sent: ${signature}`);
      console.warn(`[signAndSendTransaction] Error:`, confirmError);
      // Return signature anyway - user can check on explorer
      return signature;
    }
  } catch (error: any) {
    console.error(`[signAndSendTransaction] Error:`, error);
    throw error;
  }
}

