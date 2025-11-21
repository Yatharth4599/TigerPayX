/**
 * Script to generate a custody wallet for TigerPayX
 * 
 * Usage: node scripts/generate-custody-wallet.js
 * 
 * This generates a new wallet that will be used to send tokens
 * on behalf of users when they withdraw to external wallets.
 */

const { ethers } = require("ethers");

// Generate a new wallet
const wallet = ethers.Wallet.createRandom();

console.log("\n" + "=".repeat(50));
console.log("CUSTODY WALLET GENERATED");
console.log("=".repeat(50));
console.log("\n📍 Wallet Address:");
console.log("   " + wallet.address);
console.log("\n🔑 Private Key:");
console.log("   " + wallet.privateKey);
console.log("\n" + "=".repeat(50));
console.log("\n⚠️  SECURITY INSTRUCTIONS:");
console.log("   1. Copy the private key above");
console.log("   2. Add it to your .env.local file:");
console.log("      CUSTODY_WALLET_PRIVATE_KEY=0x...");
console.log("   3. NEVER commit this to git");
console.log("   4. Fund this wallet with tokens on each chain:");
console.log("      - Ethereum: USDT, USDC, BUSD + ETH for gas");
console.log("      - Polygon: USDT, USDC, BUSD + MATIC for gas");
console.log("      - BSC: USDT, USDC, BUSD + BNB for gas");
console.log("      - Arbitrum: USDT, USDC, BUSD + ETH for gas");
console.log("      - Avalanche: USDT, USDC, BUSD + AVAX for gas");
console.log("   5. Monitor wallet balances regularly");
console.log("\n✅ Next Steps:");
console.log("   - Add private key to environment variables");
console.log("   - Fund the wallet with tokens");
console.log("   - Test a withdrawal");
console.log("\n" + "=".repeat(50) + "\n");

