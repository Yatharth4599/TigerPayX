// Solana utility functions for TigerPayX

import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from "@solana/spl-token";
import { SOLANA_CONFIG, TOKEN_DECIMALS, getTokenMint } from "@/shared/config";

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
      return await operation(connection);
    } catch (error: any) {
      lastError = error;
      // If it's a 403 or rate limit error, try next endpoint
      if (error?.message?.includes("403") || error?.code === 403 || error?.message?.includes("rate limit")) {
        console.warn(`RPC ${url} returned 403, trying fallback...`);
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
 * Get SPL token balance with fallback RPC support
 */
export async function getTokenBalance(
  address: string,
  tokenMint: string
): Promise<string> {
  try {
    const publicKey = new PublicKey(address);
    const mintPublicKey = new PublicKey(tokenMint);
    
    const tokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
    
    const accountInfo = await tryWithFallback(async (connection) => {
      return await getAccount(connection, tokenAccount);
    });
    
    const decimals = TOKEN_DECIMALS[tokenMint] || 9;
    return (Number(accountInfo.amount) / Math.pow(10, decimals)).toFixed(decimals);
  } catch (error) {
    // Token account doesn't exist or other error
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
  
  const [sol, usdc, usdt, tt] = await Promise.all([
    getSolBalance(address),
    getTokenBalance(address, getTokenMint("USDC", network)),
    getTokenBalance(address, getTokenMint("USDT", network)),
    getTokenBalance(address, getTokenMint("TT", network)),
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
  
  const fromTokenAccount = await getAssociatedTokenAddress(
    mintPublicKey,
    fromKeypair.publicKey
  );
  
  const toTokenAccount = await getAssociatedTokenAddress(
    mintPublicKey,
    toPublicKey
  );

  const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, decimals)));

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromKeypair.publicKey,
      amountInSmallestUnit
    )
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromKeypair.publicKey;

  return transaction;
}

/**
 * Sign and send transaction
 */
export async function signAndSendTransaction(
  transaction: Transaction,
  keypair: Keypair
): Promise<string> {
  const connection = getSolanaConnection();
  
  // Sign transaction
  transaction.sign(keypair);
  
  // Send transaction
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    {
      skipPreflight: false,
      maxRetries: 3,
    }
  );
  
  // Wait for confirmation
  await connection.confirmTransaction(signature, "confirmed");
  
  return signature;
}

