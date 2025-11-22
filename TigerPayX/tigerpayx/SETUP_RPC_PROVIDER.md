# 🚀 How to Get a Free Solana RPC Provider

## Why You Need an RPC Provider

Public Solana RPC endpoints are rate-limited and often return 403 errors. A dedicated RPC provider gives you:
- ✅ No rate limits (or much higher limits)
- ✅ Better reliability (99.9%+ uptime)
- ✅ Faster response times
- ✅ Better error handling
- ✅ Transaction support

---

## 🆓 Best Free RPC Providers

### Option 1: Helius (Recommended - Easiest)

**Free Tier:** 100,000 requests/day

1. **Sign up:** https://www.helius.dev/
2. **Create a project:**
   - Click "Create Project"
   - Select "Solana"
   - Choose "Mainnet"
3. **Get your RPC URL:**
   - Copy the RPC URL (looks like: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`)
4. **Add to environment variables:**
   ```bash
   SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
   ```

**Pros:**
- ✅ Very easy setup
- ✅ Good free tier
- ✅ Reliable
- ✅ Great documentation

---

### Option 2: QuickNode (Popular)

**Free Tier:** 10M requests/month

1. **Sign up:** https://www.quicknode.com/
2. **Create endpoint:**
   - Click "Create Endpoint"
   - Select "Solana"
   - Choose "Mainnet"
   - Select "Free" tier
3. **Get your RPC URL:**
   - Copy the HTTP endpoint URL
4. **Add to environment variables:**
   ```bash
   SOLANA_RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY"
   ```

**Pros:**
- ✅ Generous free tier
- ✅ Very reliable
- ✅ Good performance

---

### Option 3: Alchemy (Enterprise-Grade)

**Free Tier:** Available (check current limits)

1. **Sign up:** https://www.alchemy.com/
2. **Create app:**
   - Click "Create App"
   - Select "Solana"
   - Choose "Mainnet"
3. **Get your RPC URL:**
   - Copy the HTTP URL from dashboard
4. **Add to environment variables:**
   ```bash
   SOLANA_RPC_URL="https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY"
   ```

**Pros:**
- ✅ Very reliable (99.99% uptime)
- ✅ Enterprise-grade
- ✅ Good documentation

---

### Option 4: Ankr (Decentralized)

**Free Tier:** Available

1. **Sign up:** https://www.ankr.com/
2. **Create endpoint:**
   - Go to RPC service
   - Select Solana Mainnet
   - Get your endpoint URL
3. **Add to environment variables:**
   ```bash
   SOLANA_RPC_URL="https://rpc.ankr.com/solana/YOUR_KEY"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://rpc.ankr.com/solana/YOUR_KEY"
   ```

**Pros:**
- ✅ Decentralized network
- ✅ Free tier available
- ✅ Multi-chain support

---

## 📝 Step-by-Step Setup (Using Helius as Example)

### Step 1: Sign Up for Helius

1. Go to https://www.helius.dev/
2. Click "Sign Up" or "Get Started"
3. Create an account (email or GitHub)

### Step 2: Create a Project

1. Click "Create Project" or "New Project"
2. Name it: "TigerPayX" (or any name)
3. Select blockchain: **Solana**
4. Select network: **Mainnet**
5. Click "Create"

### Step 3: Get Your RPC URL

1. In your project dashboard, find the **RPC URL**
2. It will look like:
   ```
   https://mainnet.helius-rpc.com/?api-key=abc123def456...
   ```
3. **Copy this entire URL**

### Step 4: Add to Vercel (If Deployed)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

   **Variable Name:** `SOLANA_RPC_URL`
   **Value:** `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

   **Variable Name:** `NEXT_PUBLIC_SOLANA_RPC_URL`
   **Value:** `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

4. Select **Production**, **Preview**, and **Development**
5. Click **Save**
6. **Redeploy** your application

### Step 5: Add to Local Development (.env)

If testing locally, create/update `.env.local`:

```bash
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
NEXT_PUBLIC_SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
```

**⚠️ Important:** Never commit `.env.local` to git!

### Step 6: Restart Your Application

```bash
# If running locally
npm run dev

# Or redeploy on Vercel
# (Vercel will auto-redeploy when you save env vars)
```

### Step 7: Test It

1. Open your TigerPayX dashboard
2. Check browser console (F12) - should see no 403 errors
3. Try refreshing wallet balance
4. Try sending a transaction

---

## 🔍 How to Verify It's Working

### Check Console Logs

Open browser console (F12) and look for:
- ✅ No "403 Forbidden" errors
- ✅ No "RPC failed" messages
- ✅ Balance loads successfully
- ✅ Transactions work

### Test RPC Connection

You can test your RPC URL directly:

```bash
curl -X POST https://your-rpc-url \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getHealth"
  }'
```

Should return: `{"jsonrpc":"2.0","result":"ok","id":1}`

---

## 🎯 Quick Comparison

| Provider | Free Tier | Ease of Setup | Reliability | Best For |
|----------|-----------|---------------|-------------|----------|
| **Helius** | 100K/day | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Beginners |
| **QuickNode** | 10M/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High volume |
| **Alchemy** | Varies | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise |
| **Ankr** | Available | ⭐⭐⭐ | ⭐⭐⭐⭐ | Decentralized |

**Recommendation:** Start with **Helius** - it's the easiest and most beginner-friendly.

---

## 🔒 Security Best Practices

1. **Never commit API keys to git**
   - Use `.env.local` for local development
   - Use Vercel environment variables for production

2. **Rotate keys if exposed**
   - If you accidentally commit a key, regenerate it immediately

3. **Use different keys for dev/prod**
   - Create separate projects for development and production

4. **Monitor usage**
   - Check your RPC provider dashboard regularly
   - Set up alerts if you have usage limits

---

## 🆘 Troubleshooting

### Still Getting 403 Errors?

1. **Check environment variables are set:**
   ```bash
   # In Vercel: Settings → Environment Variables
   # Locally: Check .env.local file
   ```

2. **Verify RPC URL is correct:**
   - Make sure you copied the entire URL including API key
   - Check for typos

3. **Redeploy after adding env vars:**
   - Vercel needs a redeploy to pick up new environment variables

4. **Check RPC provider dashboard:**
   - Make sure you haven't exceeded free tier limits
   - Verify your account is active

### RPC URL Not Working?

1. **Test the URL directly:**
   ```bash
   curl -X POST YOUR_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```

2. **Check network tab in browser:**
   - Open DevTools → Network
   - Look for failed requests
   - Check error messages

3. **Try a different provider:**
   - If one doesn't work, try another (Helius, QuickNode, etc.)

---

## 📊 Monitoring Usage

Most providers have dashboards where you can:
- ✅ See request count
- ✅ Monitor usage vs limits
- ✅ View error rates
- ✅ Check response times

**Check regularly** to avoid hitting limits!

---

## 💰 Upgrading (When Needed)

If you exceed free tier limits:

1. **Check pricing:** Most providers have reasonable paid plans
2. **Optimize requests:** Cache balances, batch requests
3. **Use fallbacks:** Keep public RPC as fallback
4. **Monitor usage:** Track which operations use most requests

---

## ✅ Checklist

- [ ] Signed up for RPC provider (Helius recommended)
- [ ] Created project/endpoint
- [ ] Copied RPC URL
- [ ] Added to Vercel environment variables
- [ ] Added to `.env.local` (for local dev)
- [ ] Redeployed application
- [ ] Tested - no 403 errors
- [ ] Balance loads correctly
- [ ] Transactions work

---

## 🎉 You're Done!

Once you've set up your RPC provider:
- ✅ No more 403 errors
- ✅ Reliable balance checking
- ✅ Working transactions
- ✅ Better performance

**Next Steps:**
1. Set up RPC provider (follow steps above)
2. Test everything works
3. Monitor usage in provider dashboard
4. Enjoy reliable Solana operations! 🚀

---

## 📚 Additional Resources

- **Helius Docs:** https://docs.helius.dev/
- **QuickNode Docs:** https://www.quicknode.com/docs
- **Alchemy Docs:** https://docs.alchemy.com/
- **Solana RPC Methods:** https://docs.solana.com/api/http

---

**Need Help?** Check your RPC provider's documentation or support channels.

