// Formatting utilities

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: string, decimals: number = 6): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0.00";
  if (num === 0) return "0.00";
  if (num < 0.000001) return "<0.000001";
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export function formatTokenAmount(amount: string, token: string): string {
  const decimals = token === "SOL" || token === "TT" ? 9 : 6;
  return formatBalance(amount, decimals);
}

import { SOLANA_CONFIG } from "@/shared/config";

export function getSolanaExplorerUrl(txHash: string, network?: "mainnet-beta" | "devnet"): string {
  const currentNetwork = network || SOLANA_CONFIG.network;
  const cluster = currentNetwork === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${txHash}${cluster}`;
}

export function getSolanaAddressUrl(address: string, network?: "mainnet-beta" | "devnet"): string {
  const currentNetwork = network || SOLANA_CONFIG.network;
  const cluster = currentNetwork === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

