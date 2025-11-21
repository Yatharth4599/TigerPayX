// Shared types for TigerPayX DeFi platform

export type Token = "SOL" | "USDC" | "USDT" | "TT";

export type TransactionType = "send" | "swap" | "pay";

export type TransactionStatus = "pending" | "confirmed" | "failed";

export type PayLinkStatus = "pending" | "paid" | "expired" | "cancelled";

export interface WalletBalance {
  sol: string;
  usdc: string;
  usdt: string;
  tt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: Token;
  txHash: string;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
}

export interface Merchant {
  id: string;
  merchantId: string;
  userId: string;
  name: string;
  logoUrl?: string;
  settlementAddress: string;
  preferredToken: Token;
  payramMerchantId?: string;
  createdAt: string;
}

export interface PayLink {
  id: string;
  payLinkId: string;
  merchantId: string;
  amount: string;
  token: Token;
  description?: string;
  status: PayLinkStatus;
  solanaTxHash?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SwapRoute {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  marketInfos: any[];
}

export interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  priceImpactPct: number;
  routePlan: any[];
}

export interface SolanaTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

