# 🧪 TigerPayX Local Testing Guide

## ✅ Platform Status

**TigerPayX is now running locally!**

- **URL:** http://localhost:3000
- **Database:** SQLite (local)
- **Network:** Solana Devnet (for testing)
- **PayRam:** Optional (not required)

## 🚀 Quick Start

### Access the Platform

Open your browser and go to:
```
http://localhost:3000
```

### Create Your First Account

1. Click **"Sign Up"** or go to `http://localhost:3000/signup`
2. Enter:
   - Name
   - Email
   - Password
3. Click **"Sign Up"**
4. You'll be redirected to the dashboard

## 🎯 Testing Features

### 1. Wallet Creation (Automatic)

- ✅ Wallet is automatically created when you first access the dashboard
- ✅ Private key stored in browser localStorage (client-side only)
- ✅ Wallet address displayed on dashboard

**Test:**
- Go to dashboard → Home tab
- Check if wallet address is shown
- Check token balances (SOL, USDC, USDT, TT)

### 2. Send Payments (P2P)

**Test Steps:**
1. Go to **"Send"** tab
2. Enter a Solana address (or use a test address)
3. Select token (SOL, USDC, USDT, TT)
4. Enter amount
5. Click **"Send"**
6. Sign transaction in browser
7. Check transaction status

**Test Addresses (Devnet):**
```
So11111111111111111111111111111111111111112 (SOL)
```

### 3. Token Swaps (Jupiter)

**Test Steps:**
1. Go to **"Swap"** tab
2. Select "From" token (e.g., USDC)
3. Select "To" token (e.g., SOL)
4. Enter amount
5. Click **"Preview"** to see quote
6. Click **"Swap"** to execute
7. Sign transaction

**Note:** You need tokens in your wallet to swap. Get devnet tokens from faucets.

### 4. Merchant Registration

**Test Steps:**
1. Go to **"Merchant"** tab
2. Click **"Register Merchant"**
3. Fill in:
   - Merchant name
   - Settlement address (your Solana address)
   - Preferred token (USDC, USDT, SOL, TT)
4. Submit
5. Check if merchant is created

**Note:** PayRam integration is optional. Merchant will be created even without PayRam.

### 5. PayLink Creation

**Test Steps:**
1. After registering merchant, create a PayLink
2. Set:
   - Amount
   - Token
   - Description (optional)
3. Generate PayLink
4. Share PayLink URL or QR code
5. Test payment flow

### 6. Transaction History

**Test:**
- Go to dashboard → Home tab
- Scroll to "Recent Transactions"
- View all your transactions

## 🔧 Development Tools

### View Logs

The dev server shows logs in the terminal. Watch for:
- API requests
- Database queries
- Errors

### Database Access

```bash
# View database
npx prisma studio
# Opens at http://localhost:5555
```

### Reset Database

```bash
# Reset and migrate
npx prisma migrate reset
npx prisma migrate dev
```

## 🧪 Test Scenarios

### Scenario 1: Complete Payment Flow

1. **Setup:**
   - Create account
   - Wallet auto-created
   - Get some devnet tokens

2. **Send Payment:**
   - Go to Send tab
   - Send tokens to another address
   - Verify transaction in history

3. **Verify:**
   - Check transaction appears in history
   - Check balance updated

### Scenario 2: Merchant Payment

1. **Register Merchant:**
   - Create merchant account
   - Set settlement address

2. **Create PayLink:**
   - Generate payment link
   - Copy link or QR code

3. **Process Payment:**
   - Use PayLink to make payment
   - Verify payment status

### Scenario 3: Token Swap

1. **Get Tokens:**
   - Get USDC from devnet faucet
   - Or swap from another token

2. **Execute Swap:**
   - Go to Swap tab
   - Preview swap
   - Execute swap
   - Verify tokens received

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 $(lsof -t -i:3000)

# Restart
npm run dev
```

### Database Errors

```bash
# Regenerate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Wallet Not Creating

- Check browser console for errors
- Check localStorage (DevTools → Application → Local Storage)
- Try clearing localStorage and refreshing

### Transactions Failing

- Check you have enough SOL for fees
- Verify you're on devnet (not mainnet)
- Check Solana RPC connection
- View browser console for errors

## 📊 Monitoring

### Check Server Status

```bash
# Server should be running
curl http://localhost:3000

# Check database
ls -la prisma/dev.db
```

### View API Logs

All API requests are logged in the terminal where `npm run dev` is running.

## 🎓 Next Steps

1. **Test all features** using the scenarios above
2. **Get devnet tokens** from Solana faucets
3. **Test with real transactions** on devnet
4. **Add PayRam** (optional - install Docker first)
5. **Deploy to production** when ready

## 🔗 Useful Links

- **Solana Devnet Explorer:** https://explorer.solana.com/?cluster=devnet
- **Solana Devnet Faucet:** https://faucet.solana.com/
- **Jupiter Swap:** https://jup.ag/ (for reference)

## ✅ Testing Checklist

- [ ] Account creation works
- [ ] Wallet auto-created
- [ ] Can view balances
- [ ] Can send payments
- [ ] Can swap tokens
- [ ] Can register merchant
- [ ] Can create PayLinks
- [ ] Transactions appear in history
- [ ] No console errors

Happy Testing! 🚀

