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
  
  // Log which RPC is being used (hide API key for security)
  const maskedUrl = rpcUrl.includes('api-key') 
    ? rpcUrl.split('api-key')[0] + 'api-key=***'
    : rpcUrl;
  console.log(`[getSolanaConnection] Using RPC: ${maskedUrl} on ${network}`);
  
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
  
  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i];
    const maskedUrl = url.includes('api-key') 
      ? url.split('api-key')[0] + 'api-key=***'
      : url;
    console.log(`[tryWithFallback] Trying RPC ${i + 1}/${urlsToTry.length}: ${maskedUrl}`);
    
    try {
      const connection = new Connection(url, "confirmed");
      // Set a timeout for the operation
      const result = await Promise.race([
        operation(connection),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("RPC request timeout")), 15000) // Increased timeout
        )
      ]) as T;
      console.log(`[tryWithFallback] Success with RPC: ${maskedUrl}`);
      return result;
    } catch (error: any) {
      lastError = error;
      // Get more detailed error information
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      const errorCode = error?.code;
      const errorStatus = error?.status;
      const errorResponse = error?.response;
      const errorName = error?.name;
      
      // Check for CORS errors (common with Helius)
      const isCorsError = errorName === "TypeError" && 
                         (errorMsg?.includes("Failed to fetch") || 
                          errorMsg === "" || 
                          !errorMsg || 
                          errorMsg === "Unknown error");
      
      // Log full error details for debugging
      if (isCorsError && url.includes('helius-rpc.com')) {
        console.error(`[tryWithFallback] Helius RPC CORS/Network Error:`, {
          url: maskedUrl,
          errorName,
          errorMsg: errorMsg || "(empty - likely CORS)",
          suggestion: "Helius RPC may be blocked by browser. Try QuickNode or Alchemy instead."
        });
      } else {
        console.warn(`[tryWithFallback] RPC ${maskedUrl} failed:`, {
          message: errorMsg.substring(0, 200),
          code: errorCode,
          status: errorStatus,
          type: errorName,
          stack: error?.stack?.substring(0, 200)
        });
      }
      
      // Check for 403, rate limit, or network errors
      const is403 = errorMsg?.includes("403") || 
                   errorCode === 403 || 
                   errorStatus === 403 ||
                   errorMsg?.includes("Forbidden");
      const isRateLimit = errorMsg?.includes("rate limit") || 
                        errorMsg?.includes("429");
      const isNetworkError = errorMsg?.includes("Failed to fetch") ||
                            errorMsg?.includes("ERR_CONNECTION") ||
                            errorMsg?.includes("CORS") ||
                            errorMsg?.includes("NetworkError") ||
                            errorName === "TypeError" ||
                            isCorsError;
      
      // For Helius specifically, check if it's an API key issue
      if (url.includes('helius-rpc.com')) {
        if (is403 || errorMsg?.includes("Unauthorized") || errorMsg?.includes("Invalid") || errorMsg?.includes("api-key")) {
          console.error(`[tryWithFallback] Helius RPC authentication failed. Check your API key.`);
          // Still try fallbacks, but log the issue
        }
      }
      
      // Check for TokenAccountNotFoundError or "Attempt to debit" - these are valid blockchain errors, not RPC issues
      // These errors mean the account doesn't exist or has no balance - no point trying other RPCs
      const isTokenAccountNotFound = errorName === "TokenAccountNotFoundError" || 
                                     errorMsg?.includes("TokenAccountNotFound") ||
                                     errorMsg?.includes("could not find account");
      
      const isAttemptToDebit = errorMsg?.includes("Attempt to debit") || 
                               errorMsg?.includes("no record of a prior credit");
      
      if (isTokenAccountNotFound || isAttemptToDebit) {
        // This is a valid blockchain error - account doesn't exist or has no balance
        // No point trying other RPCs, they'll all return the same error
        console.log(`[tryWithFallback] Blockchain error (not RPC issue): ${isTokenAccountNotFound ? 'TokenAccountNotFoundError' : 'Attempt to debit'}`);
        throw error; // Re-throw so caller can handle it with a clear message
      }
      
      if (is403 || isRateLimit || isNetworkError) {
        console.warn(`RPC ${maskedUrl} failed (${is403 ? '403' : isRateLimit ? 'rate limit' : 'network error'}), trying fallback...`);
        continue;
      }
      // For other errors, still try next endpoint
      console.warn(`RPC ${maskedUrl} failed: ${errorMsg.substring(0, 100)}, trying fallback...`);
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
    const countedAccounts = new Set<string>(); // Track accounts we've already counted
    
    // First, try to get the Associated Token Account (ATA)
    let ataAddress: string | null = null;
    try {
    const tokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      ataAddress = tokenAccount.toString();
      console.log(`[getTokenBalance] 🔍 ATA address calculated: ${ataAddress}`);
      console.log(`[getTokenBalance] 🔍 Wallet address: ${address}`);
      console.log(`[getTokenBalance] 🔍 Mint: ${tokenMint}`);
    
    const accountInfo = await tryWithFallback(async (connection) => {
      return await getAccount(connection, tokenAccount);
    });
    
      const balance = Number(accountInfo.amount) / Math.pow(10, decimals);
      console.log(`[getTokenBalance] ✅ ATA exists! Balance: ${balance}`);
      
      // If ATA exists and has balance, add it to total and mark as counted
      // Only mark as counted if we successfully got a balance > 0
      // If balance is 0 or check failed, let the search find it and use the correct balance
      if (balance > 0) {
        totalBalance += balance;
        countedAccounts.add(ataAddress);
        console.log(`[getTokenBalance] ✅ ATA marked as counted (balance > 0): ${ataAddress}`);
      } else {
        console.log(`[getTokenBalance] ⚠️ ATA has 0 balance (or RPC returned 0), will check in search: ${ataAddress}`);
        console.log(`[getTokenBalance] ⚠️ NOT marking as counted - search will find it with correct balance`);
        // Don't mark as counted - let the search find it and use the correct balance
      }
    } catch (ataError: any) {
      // ATA doesn't exist or has no balance, continue to search all token accounts
      const errorName = ataError?.name || "";
      const errorMsg = ataError?.message || "";
      
      // TokenAccountNotFoundError is expected if account doesn't exist - not a real error
      if (errorName === "TokenAccountNotFoundError" || errorMsg?.includes("could not find account")) {
        console.log(`[getTokenBalance] ATA doesn't exist (TokenAccountNotFoundError) - this is normal if you haven't received tokens yet`);
      } else {
        console.log(`[getTokenBalance] ATA not found or error: ${errorMsg || errorName}`);
      }
    }
    
    // Search for ALL token accounts owned by this wallet, then filter by mint
    // This handles cases where tokens were sent before ATA was created
    // IMPORTANT: Skip accounts we've already counted (like the ATA)
    try {
      console.log(`[getTokenBalance] Searching all token accounts for mint ${tokenMint}...`);
      const allTokenAccounts = await tryWithFallback(async (connection) => {
        // Get all token accounts owned by this wallet
        return await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
      });
      
      console.log(`[getTokenBalance] Found ${allTokenAccounts.value.length} total token accounts`);
      console.log(`[getTokenBalance] Accounts already counted: ${Array.from(countedAccounts).join(", ") || "none"}`);
      
      // Filter by mint and sum balances (excluding already counted accounts)
      let foundMatchingAccounts = 0;
      const foundMints: string[] = []; // Track all mint addresses found
      
      for (const accountInfo of allTokenAccounts.value) {
        const accountAddress = accountInfo.pubkey.toString();
        const parsedInfo = accountInfo.account.data.parsed.info;
        
        console.log(`[getTokenBalance] 🔍 Processing account: ${accountAddress}`);
        console.log(`[getTokenBalance] 🔍 Is already counted? ${countedAccounts.has(accountAddress)}`);
        console.log(`[getTokenBalance] 🔍 ATA address was: ${ataAddress}`);
        console.log(`[getTokenBalance] 🔍 Account matches ATA? ${accountAddress === ataAddress}`);
        
        // Skip if we've already counted this account (e.g., ATA)
        // IMPORTANT: If an account is already counted, it means we already added its balance
        // Don't add it again or we'll get double counting!
        if (countedAccounts.has(accountAddress)) {
          console.log(`[getTokenBalance] ⚠️ Skipping already counted account: ${accountAddress}`);
          console.log(`[getTokenBalance] ⚠️ This account was already processed and its balance was added`);
          console.log(`[getTokenBalance] ⚠️ Account mint: ${parsedInfo.mint}, Looking for: ${tokenMint}`);
          // Skip this account - it's already been counted
          continue;
        }
        
        // Debug: Log all token accounts to see what we're getting
        // Handle mint as PublicKey object or string
        let accountMint: string = "";
        if (parsedInfo.mint) {
          // If it's a PublicKey object, convert to string; if it's already a string, use it
          accountMint = typeof parsedInfo.mint === 'string' 
            ? parsedInfo.mint 
            : parsedInfo.mint.toString();
        }
        
        const accountDecimals = parsedInfo.tokenAmount?.decimals || decimals;
        const accountBalance = parsedInfo.tokenAmount?.amount 
          ? Number(parsedInfo.tokenAmount.amount) / Math.pow(10, accountDecimals)
          : 0;
        
        if (accountMint) {
          console.log(`[getTokenBalance] 🔍 Token account ${accountAddress.substring(0, 8)}...: mint=${accountMint}, balance=${accountBalance}, decimals=${accountDecimals}`);
          foundMints.push(accountMint);
        }
        
        // Check if this account is for the mint we're looking for
        // Normalize both mints to strings for comparison
        const searchMint = tokenMint.toString().trim();
        const normalizedAccountMint = accountMint.trim();
        
        // Debug: Log the comparison with detailed info
        console.log(`[getTokenBalance] 🔎 Comparing mints:`);
        console.log(`  - Account mint: "${normalizedAccountMint}" (type: ${typeof normalizedAccountMint}, length: ${normalizedAccountMint.length})`);
        console.log(`  - Search mint:  "${searchMint}" (type: ${typeof searchMint}, length: ${searchMint.length})`);
        console.log(`  - Match: ${normalizedAccountMint === searchMint}`);
        console.log(`  - Account address: ${accountAddress}`);
        console.log(`  - Already counted: ${countedAccounts.has(accountAddress)}`);
        
        if (normalizedAccountMint && normalizedAccountMint === searchMint) {
          foundMatchingAccounts++;
          const accountDecimals = parsedInfo.tokenAmount.decimals || decimals;
          usedDecimals = accountDecimals; // Use the actual decimals from the account
          const balance = Number(parsedInfo.tokenAmount.amount) / Math.pow(10, accountDecimals);
          console.log(`[getTokenBalance] ✅ Found matching token account ${accountAddress} with balance: ${balance}`);
          totalBalance += balance;
          countedAccounts.add(accountAddress); // Mark as counted
        }
      }
      
      if (foundMatchingAccounts === 0 && allTokenAccounts.value.length > 0) {
        console.error(`[getTokenBalance] ⚠️ Found ${allTokenAccounts.value.length} token accounts but none match mint ${tokenMint}`);
        console.error(`[getTokenBalance] 📋 Mint addresses found in wallet: ${foundMints.join(", ")}`);
        console.error(`[getTokenBalance] 🔎 Looking for mint: ${tokenMint}`);
        console.error(`[getTokenBalance] 💡 This might be a different USDT version or the mint address in config is incorrect`);
        
        // Check if any of the accounts match the mint but were skipped (already counted)
        // This can happen if the ATA check marked it as counted but got wrong balance from RPC
        const searchMint = tokenMint.toString().trim();
        for (const accountInfo of allTokenAccounts.value) {
          const accountAddress = accountInfo.pubkey.toString();
          const parsedInfo = accountInfo.account.data.parsed.info;
          let accountMint: string = "";
          if (parsedInfo.mint) {
            accountMint = typeof parsedInfo.mint === 'string' 
              ? parsedInfo.mint.trim()
              : parsedInfo.mint.toString().trim();
          }
          
          const accountBalance = parsedInfo.tokenAmount?.amount 
            ? Number(parsedInfo.tokenAmount.amount) / Math.pow(10, parsedInfo.tokenAmount.decimals || decimals)
            : 0;
          
          console.error(`[getTokenBalance] 📊 Token Account Details:`);
          console.error(`  - Address: ${accountAddress}`);
          console.error(`  - Mint: ${accountMint}`);
          console.error(`  - Balance: ${accountBalance}`);
          console.error(`  - Decimals: ${parsedInfo.tokenAmount?.decimals || decimals}`);
          console.error(`  - Already counted: ${countedAccounts.has(accountAddress)}`);
          console.error(`  - Mint matches? ${accountMint === searchMint}`);
          
          // If this account matches the mint but was skipped (already counted), 
          // and we haven't found a matching account, use this one
          if (accountMint === searchMint && countedAccounts.has(accountAddress) && accountBalance > 0) {
            console.error(`[getTokenBalance] 🔄 Found matching account that was already counted - checking if balance was added`);
            // If we found 0 matching accounts, it means this account was skipped
            // The ATA check might have marked it as counted but got 0 balance from RPC
            // In that case, we need to use the account's actual balance
            if (foundMatchingAccounts === 0) {
              // Check if totalBalance is less than accountBalance (meaning ATA check didn't add it)
              if (totalBalance < accountBalance) {
                console.error(`[getTokenBalance] ✅ ATA check didn't add balance (totalBalance=${totalBalance} < accountBalance=${accountBalance}), using account balance`);
                totalBalance = accountBalance; // Use the account's balance
                foundMatchingAccounts = 1; // Mark as found so we don't show error
              } else {
                console.error(`[getTokenBalance] ℹ️ Balance was already added (totalBalance=${totalBalance} >= accountBalance=${accountBalance})`);
              }
            }
          }
        }
      }
    } catch (searchError: any) {
      const errorName = searchError?.name || "";
      const errorMsg = searchError?.message || "";
      
      // TokenAccountNotFoundError is expected if no token accounts exist
      if (errorName === "TokenAccountNotFoundError" || errorMsg?.includes("could not find account")) {
        console.log(`[getTokenBalance] No token accounts found for this wallet`);
      } else {
        console.error(`[getTokenBalance] Error searching token accounts: ${errorMsg || errorName}`);
      }
      // If search fails, we still have the ATA balance if it exists
    }
    
    const finalBalance = totalBalance.toFixed(usedDecimals);
    console.log(`[getTokenBalance] ✅ Final balance for ${address.substring(0, 8)}...: ${finalBalance} (mint: ${tokenMint.substring(0, 8)}...)`);
    
    return finalBalance;
  } catch (error: any) {
    const errorName = error?.name || "";
    const errorMsg = error?.message || "";
    console.error(`[getTokenBalance] ❌ Error getting balance for ${address.substring(0, 8)}... (mint: ${tokenMint.substring(0, 8)}...): ${errorName} - ${errorMsg}`);
    
    // If it's a TokenAccountNotFoundError, return 0 (account doesn't exist)
    if (errorName === "TokenAccountNotFoundError" || errorMsg?.includes("could not find account")) {
      console.log(`[getTokenBalance] Token account not found - returning 0`);
      return "0";
    }
    
    // For other errors, still return 0 but log the error
    return "0";
  }
}

/**
 * Get all token accounts in a wallet with their mint addresses and balances
 * Useful for debugging mint address mismatches
 */
export async function getAllTokenAccounts(address: string): Promise<Array<{
  accountAddress: string;
  mint: string;
  balance: number;
  decimals: number;
}>> {
  try {
    const publicKey = new PublicKey(address);
    const allTokenAccounts = await tryWithFallback(async (connection) => {
      return await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
    });
    
    const accounts = [];
    for (const accountInfo of allTokenAccounts.value) {
      const parsedInfo = accountInfo.account.data.parsed.info;
      const decimals = parsedInfo.tokenAmount?.decimals || 9;
      const balance = parsedInfo.tokenAmount?.amount 
        ? Number(parsedInfo.tokenAmount.amount) / Math.pow(10, decimals)
        : 0;
      
      accounts.push({
        accountAddress: accountInfo.pubkey.toString(),
        mint: parsedInfo.mint,
        balance,
        decimals,
      });
    }
    
    return accounts;
  } catch (error: any) {
    console.error(`[getAllTokenAccounts] Error:`, error);
    return [];
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
  try {
    console.log(`[buildSolTransferTransaction] Building SOL transfer: ${amount} SOL to ${toAddress}`);
  const connection = getSolanaConnection();
  const toPublicKey = new PublicKey(toAddress);
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

    // Get recent blockhash with fallback
    console.log(`[buildSolTransferTransaction] Getting recent blockhash...`);
    const { blockhash, lastValidBlockHeight } = await tryWithFallback(async (conn) => {
      return await conn.getLatestBlockhash("confirmed");
    });
    
  transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromKeypair.publicKey;

    console.log(`[buildSolTransferTransaction] Transaction built successfully`);
  return transaction;
  } catch (error: any) {
    console.error(`[buildSolTransferTransaction] Error:`, error);
    throw new Error(`Failed to build transaction: ${error.message || "Unknown error"}`);
  }
}

/**
 * Build SPL token transfer transaction
 * Automatically creates recipient's token account if it doesn't exist
 * Verifies sender's token account exists and has sufficient balance
 */
export async function buildTokenTransferTransaction(
  fromKeypair: Keypair,
  toAddress: string,
  tokenMint: string,
  amount: number,
  decimals: number = 9
): Promise<Transaction> {
  try {
    console.log(`[buildTokenTransferTransaction] Building token transfer: ${amount} tokens`);
  const connection = getSolanaConnection();
  const toPublicKey = new PublicKey(toAddress);
  const mintPublicKey = new PublicKey(tokenMint);
  
    // First, try to find the actual token account address (might not be ATA)
    console.log(`[buildTokenTransferTransaction] Finding sender's token account for mint ${tokenMint}...`);
    let fromTokenAccount: PublicKey;
    let senderAccount;
    let senderBalance = 0;
    
    try {
      // Get all token accounts owned by the sender
      const allTokenAccounts = await tryWithFallback(async (conn) => {
        return await conn.getParsedTokenAccountsByOwner(fromKeypair.publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
      });
      
      console.log(`[buildTokenTransferTransaction] Found ${allTokenAccounts.value.length} token accounts`);
      
      // Log all accounts for debugging
      allTokenAccounts.value.forEach((acc, idx) => {
        const parsedInfo = acc.account.data.parsed.info;
        const accountMint = parsedInfo.mint;
        const normalizedMint = typeof accountMint === 'string' 
          ? accountMint.trim() 
          : accountMint.toString().trim();
        const balance = parsedInfo.tokenAmount?.amount 
          ? Number(parsedInfo.tokenAmount.amount) / Math.pow(10, parsedInfo.tokenAmount.decimals || decimals)
          : 0;
        console.log(`[buildTokenTransferTransaction] Account ${idx + 1}: ${acc.pubkey.toString()}, mint: ${normalizedMint}, balance: ${balance}`);
      });
      
      // Find the account that matches the mint
      // Normalize mint comparison (handle PublicKey objects vs strings)
      const searchMint = tokenMint.toString().trim();
      const matchingAccount = allTokenAccounts.value.find((acc) => {
        const accountMint = acc.account.data.parsed.info.mint;
        const normalizedMint = typeof accountMint === 'string' 
          ? accountMint.trim() 
          : accountMint.toString().trim();
        const matches = normalizedMint === searchMint;
        if (!matches) {
          console.log(`[buildTokenTransferTransaction] Account mint "${normalizedMint}" doesn't match search "${searchMint}"`);
        }
        return matches;
      });
      
      console.log(`[buildTokenTransferTransaction] Searched ${allTokenAccounts.value.length} accounts, found match: ${!!matchingAccount}`);
      
      if (matchingAccount) {
        // Use the actual token account address
        fromTokenAccount = matchingAccount.pubkey;
        const parsedInfo = matchingAccount.account.data.parsed.info;
        const accountDecimals = parsedInfo.tokenAmount?.decimals || decimals;
        senderBalance = parsedInfo.tokenAmount?.amount 
          ? Number(parsedInfo.tokenAmount.amount) / Math.pow(10, accountDecimals)
          : 0;
        console.log(`[buildTokenTransferTransaction] ✅ Found token account: ${fromTokenAccount.toString()}, balance: ${senderBalance}`);
      } else {
        // Fallback to ATA if no account found
        console.log(`[buildTokenTransferTransaction] No matching account found, using ATA...`);
        fromTokenAccount = getAssociatedTokenAddressSync(
          mintPublicKey,
          fromKeypair.publicKey
        );
        
        // Try to get the account
        senderAccount = await tryWithFallback(async (conn) => {
          return await getAccount(conn, fromTokenAccount);
        });
        senderBalance = Number(senderAccount.amount) / Math.pow(10, decimals);
        console.log(`[buildTokenTransferTransaction] ATA balance: ${senderBalance}`);
      }
    } catch (error: any) {
      // If we can't find any account, try ATA as fallback
      console.log(`[buildTokenTransferTransaction] Error finding account, trying ATA...`);
      fromTokenAccount = getAssociatedTokenAddressSync(
    mintPublicKey,
    fromKeypair.publicKey
  );
  
      try {
        senderAccount = await tryWithFallback(async (conn) => {
          return await getAccount(conn, fromTokenAccount);
        });
        senderBalance = Number(senderAccount.amount) / Math.pow(10, decimals);
      } catch (ataError: any) {
        const errorName = ataError?.name || "";
        const errorMsg = ataError?.message || "";
        
        // Check if it's an account not found error
        if (errorName === "TokenAccountNotFoundError" ||
            errorMsg?.includes("could not find account") || 
            errorMsg?.includes("InvalidAccountData") ||
            errorMsg?.includes("AccountNotFound") ||
            errorMsg?.includes("TokenAccountNotFound")) {
          throw new Error(`You don't have a token account for this token. You need to receive tokens first before you can send them.`);
        }
        
        throw ataError;
      }
    }
    
    // Validate balance
    console.log(`[buildTokenTransferTransaction] Sender balance: ${senderBalance}`);
    if (senderBalance < amount) {
      throw new Error(`Insufficient balance. You have ${senderBalance.toFixed(decimals)} but trying to send ${amount}`);
    }
    
    if (senderBalance === 0) {
      throw new Error(`Your token account exists but has zero balance. You need to receive tokens first before you can send them.`);
    }
  
    const toTokenAccount = getAssociatedTokenAddressSync(
    mintPublicKey,
    toPublicKey
  );

    console.log(`[buildTokenTransferTransaction] From token account: ${fromTokenAccount.toString()}`);
    console.log(`[buildTokenTransferTransaction] To token account: ${toTokenAccount.toString()}`);

    const transaction = new Transaction();

    // Check if recipient's token account exists, if not, create it
    try {
      await tryWithFallback(async (conn) => {
        return await getAccount(conn, toTokenAccount);
      });
      console.log(`[buildTokenTransferTransaction] Recipient token account exists`);
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

    // Get recent blockhash with fallback
    console.log(`[buildTokenTransferTransaction] Getting recent blockhash...`);
    const { blockhash, lastValidBlockHeight } = await tryWithFallback(async (conn) => {
      return await conn.getLatestBlockhash("confirmed");
    });
    
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromKeypair.publicKey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    console.log(`[buildTokenTransferTransaction] Transaction built successfully`);
  return transaction;
  } catch (error: any) {
    console.error(`[buildTokenTransferTransaction] Error:`, error);
    throw error; // Re-throw to preserve the error message
  }
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
      const errorName = rpcError?.name || "";
      const errorMsg = rpcError?.message || "RPC connection failed";
      console.error(`[signAndSendTransaction] RPC Error:`, rpcError);
      
      // Check for blockchain errors first (these are not RPC connection issues)
      const isTokenAccountNotFound = errorName === "TokenAccountNotFoundError" ||
                                     errorMsg?.includes("TokenAccountNotFound") ||
                                     errorMsg?.includes("could not find account");
      
      const isAttemptToDebit = errorMsg?.includes("Attempt to debit") || 
                               errorMsg?.includes("no record of a prior credit");
      
      if (isTokenAccountNotFound || isAttemptToDebit) {
        // This is a blockchain error - account doesn't exist or has no balance
        throw new Error("You don't have a token account for this token or your balance is zero. You need to receive tokens first before you can send them.");
      }
      
      if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
        throw new Error("RPC endpoints are rate-limited. Please configure a dedicated RPC provider or try again later.");
      } else if (errorMsg.includes("timeout") || errorMsg.includes("Failed to fetch") || errorMsg.includes("network")) {
        // Check if it's actually a network issue or RPC issue
        const isNetworkIssue = errorMsg.includes("ERR_INTERNET_DISCONNECTED") || 
                               errorMsg.includes("ERR_NETWORK_CHANGED") ||
                               errorMsg.includes("ERR_CONNECTION_REFUSED");
        
        if (isNetworkIssue) {
          throw new Error("Network connection failed. Please check your internet connection and try again.");
        } else {
          // Likely RPC endpoint issue, not network
          throw new Error("RPC endpoint connection failed. Please check your RPC provider configuration or try again in a moment.");
        }
      } else if (errorMsg.includes("Transaction simulation failed") || 
                 errorMsg.includes("insufficient funds")) {
        // This usually means sender's token account doesn't exist or has no balance
        throw new Error("Transaction failed: Your token account doesn't exist or has insufficient balance. Please check your balance and try again.");
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

