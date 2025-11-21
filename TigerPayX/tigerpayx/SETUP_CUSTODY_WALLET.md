# Setting Up Custody Wallet for Production

## What is a Custody Wallet?

A custody wallet is a wallet that holds tokens on behalf of your users. When users withdraw from Tiger Wallet to external wallets (like MetaMask), the custody wallet sends the tokens on the blockchain.

## Step 1: Generate a Custody Wallet

### Option A: Using Node.js Script (Recommended)

Create a file `scripts/generate-custody-wallet.js`:

```javascript
const { ethers } = require("ethers");

// Generate a new wallet
const wallet = ethers.Wallet.createRandom();

console.log("=== CUSTODY WALLET GENERATED ===");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("\n⚠️  SECURITY WARNING:");
console.log("1. Save the private key securely");
console.log("2. NEVER commit this to git");
console.log("3. Fund this wallet with tokens for withdrawals");
console.log("4. Only use this wallet for custody operations");
```

Run it:
```bash
cd tigerpayx
node scripts/generate-custody-wallet.js
```

### Option B: Using MetaMask

1. Create a new MetaMask account (separate from personal accounts)
2. Export the private key
3. Use this as your custody wallet

## Step 2: Fund the Custody Wallet

Your custody wallet needs to hold tokens on each chain you support:

- **Ethereum**: USDT, USDC, BUSD
- **Polygon**: USDT, USDC, BUSD  
- **BSC**: USDT, USDC, BUSD
- **Arbitrum**: USDT, USDC, BUSD
- **Avalanche**: USDT, USDC, BUSD

**Important**: 
- Fund it with enough tokens to cover expected withdrawals
- Monitor the balance regularly
- Add more funds as needed

## Step 3: Set Environment Variable

### For Local Development

Create/update `.env.local` in the `tigerpayx` folder:

```env
CUSTODY_WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `CUSTODY_WALLET_PRIVATE_KEY`
   - **Value**: Your private key (starts with `0x`)
   - **Environment**: Production (and Preview if needed)
4. Click **Save**
5. Redeploy your application

### For Production (Other Platforms)

#### Railway
1. Go to your project → **Variables**
2. Add `CUSTODY_WALLET_PRIVATE_KEY` with your private key
3. Redeploy

#### Heroku
```bash
heroku config:set CUSTODY_WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

#### AWS/Docker
Add to your environment variables or `.env` file:
```env
CUSTODY_WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

## Step 4: Security Best Practices

### ✅ DO:
- Use a dedicated wallet only for custody operations
- Store private key in secure environment variables
- Use hardware wallet or secure key management for production
- Monitor wallet balances regularly
- Set up alerts for low balances
- Use multi-sig wallet for large operations (optional but recommended)

### ❌ DON'T:
- Never commit private keys to git
- Never share private keys
- Never use your personal wallet
- Never hardcode keys in source code
- Never log private keys

## Step 5: Verify Setup

After setting the environment variable:

1. Restart your server (if running locally)
2. Try a withdrawal to an external wallet
3. Check the transaction on the blockchain explorer
4. Verify tokens were sent correctly

## Monitoring

Set up monitoring for:
- Custody wallet balances (per chain, per token)
- Withdrawal transaction success rates
- Low balance alerts
- Failed transactions

## Example: Checking Balance

You can check custody wallet balance using ethers:

```javascript
const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider("YOUR_RPC_URL");
const wallet = new ethers.Wallet(process.env.CUSTODY_WALLET_PRIVATE_KEY, provider);
const balance = await provider.getBalance(wallet.address);
console.log("ETH Balance:", ethers.formatEther(balance));
```

## Troubleshooting

**Error: "Custody wallet not configured"**
- Check environment variable is set correctly
- Restart server after setting variable
- Verify variable name is exactly `CUSTODY_WALLET_PRIVATE_KEY`

**Error: "Insufficient funds"**
- Fund the custody wallet with tokens
- Check correct chain and token
- Verify wallet address is correct

**Transactions failing**
- Check custody wallet has native token (ETH, MATIC, BNB) for gas
- Verify RPC endpoints are working
- Check token contract addresses are correct

