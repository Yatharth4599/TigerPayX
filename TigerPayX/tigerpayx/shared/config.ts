// Configuration for TigerPayX DeFi platform

export const SOLANA_CONFIG = {
  // Use public RPC endpoints with fallbacks
  // For production, use a reliable RPC provider (Helius, QuickNode, Alchemy)
  rpcUrl: process.env.SOLANA_RPC_URL || (process.env.NODE_ENV === "production" 
    ? "https://api.mainnet-beta.solana.com" 
    : "https://api.mainnet-beta.solana.com"),
  // For development, use devnet with multiple fallback options
  devnetRpcUrl: process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com",
  // Fallback RPC URLs if primary fails
  fallbackRpcUrls: {
    devnet: [
      "https://api.devnet.solana.com",
      "https://rpc.ankr.com/solana_devnet",
      "https://solana-devnet.g.alchemy.com/v2/demo",
    ],
    mainnet: [
      "https://api.mainnet-beta.solana.com",
      "https://rpc.ankr.com/solana",
      "https://solana-api.projectserum.com",
    ],
  },
  network: (process.env.SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK || (process.env.NODE_ENV === "production" ? "mainnet-beta" : "devnet")) as "mainnet-beta" | "devnet",
};

export const JUPITER_CONFIG = {
  apiUrl: "https://quote-api.jup.ag/v6",
  swapApiUrl: "https://quote-api.jup.ag/v6/swap",
};

export const PAYRAM_CONFIG = {
  // PayRam is self-hosted via Docker
  // Backend API runs on port 8080 (HTTP) or 8443 (HTTPS)
  // Set PAYRAM_API_URL to your self-hosted PayRam instance
  // Example: http://your-domain.com:8080 or https://your-domain.com:8443
  apiUrl: process.env.PAYRAM_API_URL || process.env.NEXT_PUBLIC_PAYRAM_API_URL || "",
  // PayRam may require API key or authentication token
  // Check PayRam documentation for authentication requirements
  apiKey: process.env.PAYRAM_API_KEY || process.env.NEXT_PUBLIC_PAYRAM_API_KEY || "",
  // Whether PayRam integration is enabled
  enabled: !!(process.env.PAYRAM_API_URL || process.env.NEXT_PUBLIC_PAYRAM_API_URL),
};

export const TOKEN_MINTS = {
  SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Mainnet USDC
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Mainnet USDT
  TT: process.env.TT_TOKEN_MINT || "", // Tiger Token mint address
};

// Devnet token mints (for testing)
export const TOKEN_MINTS_DEVNET = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Devnet USDT
  TT: process.env.TT_TOKEN_MINT_DEVNET || "",
};

export const TOKEN_DECIMALS: Record<string, number> = {
  SOL: 9,
  USDC: 6,
  USDT: 6,
  TT: 9,
};

export const TOKEN_SYMBOLS: Record<string, string> = {
  [TOKEN_MINTS.SOL]: "SOL",
  [TOKEN_MINTS.USDC]: "USDC",
  [TOKEN_MINTS.USDT]: "USDT",
  [TOKEN_MINTS.TT]: "TT",
};

export function getTokenMint(token: string, network: "mainnet-beta" | "devnet" = "mainnet-beta"): string {
  if (network === "devnet") {
    return TOKEN_MINTS_DEVNET[token as keyof typeof TOKEN_MINTS_DEVNET] || "";
  }
  return TOKEN_MINTS[token as keyof typeof TOKEN_MINTS] || "";
}

export function getTokenSymbol(mint: string): string {
  return TOKEN_SYMBOLS[mint] || "UNKNOWN";
}

