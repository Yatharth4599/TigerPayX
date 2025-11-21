// TypeScript declarations for Solana wallet extensions

interface SolanaWallet {
  isPhantom?: boolean;
  isConnected: boolean;
  publicKey: {
    toString(): string;
  } | null;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
}

interface Window {
  solana?: SolanaWallet;
  solflare?: SolanaWallet;
  backpack?: SolanaWallet;
}

