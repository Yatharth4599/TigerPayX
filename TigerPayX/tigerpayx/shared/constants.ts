// Constants for TigerPayX DeFi platform

export const STORAGE_KEYS = {
  WALLET_PRIVATE_KEY: "tigerpayx_wallet_private_key",
  WALLET_ADDRESS: "tigerpayx_wallet_address",
  WALLET_IMPORTED: "tigerpayx_wallet_imported",
  WALLET_SEED_SHOWN: "tigerpayx_wallet_seed_shown",
  WALLET_SEED_HASH: "tigerpayx_wallet_seed_hash",
};

export const TRANSACTION_FEES = {
  SOL_TRANSFER: 0.000005, // ~5000 lamports
  SPL_TRANSFER: 0.000005, // ~5000 lamports
  SWAP_BASE: 0.00001, // Base fee for swaps
};

export const PAYLINK_EXPIRY_HOURS = 24; // PayLinks expire after 24 hours

export const MIN_BALANCE_REQUIREMENTS = {
  SOL: 0.001, // Minimum SOL for rent exemption
  USDC: 0,
  USDT: 0,
  TT: 0,
};

export const MAX_TRANSACTION_AMOUNT = {
  SOL: 1000000,
  USDC: 1000000,
  USDT: 1000000,
  TT: 1000000,
};

export const JITO_STAKING = {
  validatorAddress: "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb", // Example Jito validator
  minStake: 0.1, // Minimum SOL to stake
};

export const MARINADE_STAKING = {
  programAddress: "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD", // Marinade program
  minStake: 0.1, // Minimum SOL to stake
};

