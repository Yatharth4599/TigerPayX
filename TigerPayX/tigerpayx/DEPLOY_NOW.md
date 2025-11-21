# 🚀 DEPLOY TO VERCEL NOW

## ✅ Everything is Ready!

All code has been updated for production:
- ✅ Database: PostgreSQL configured
- ✅ Network: Mainnet-ready
- ✅ URLs: Production-aware
- ✅ PayRam: Environment-based
- ✅ Config: Auto-detects production

## Quick 5-Step Deploy

### Step 1: Get PostgreSQL Database (5 minutes)

**Option A: Vercel Postgres (Easiest)**
1. Go to Vercel Dashboard
2. Your Project → Storage → Create Database
3. Select "Postgres"
4. Copy the `DATABASE_URL`

**Option B: Supabase (Free)**
1. Go to https://supabase.com
2. Create account → New Project
3. Settings → Database → Connection String
4. Copy the `DATABASE_URL`

### Step 2: Set Environment Variables (2 minutes)

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Copy these values:**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/tigerpayx
JWT_SECRET=generate-random-32-chars-here
JWT_EXPIRES_IN=7d
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
TT_TOKEN_MINT=your-mainnet-tiger-token-mint
TT_TOKEN_MINT_DEVNET=your-devnet-tiger-token-mint
NODE_ENV=production
```

**Optional (PayRam):**
```bash
PAYRAM_API_URL=https://payram.yourdomain.com
PAYRAM_API_KEY=your-payram-key
NEXT_PUBLIC_PAYRAM_API_URL=https://payram.yourdomain.com
```

### Step 3: Run Migration (1 minute)

```bash
# Set your DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/tigerpayx"

# Run migration
cd tigerpayx
npx prisma migrate deploy
```

**OR** Vercel will run it automatically during build!

### Step 4: Deploy (2 minutes)

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Login
vercel login

# Deploy
cd tigerpayx
vercel --prod
```

**OR** Push to GitHub and deploy via Vercel Dashboard!

### Step 5: Test (2 minutes)

1. Visit your Vercel URL
2. Test signup/login
3. Test wallet features
4. ✅ Done!

## Total Time: ~12 minutes

## What's Already Done ✅

- [x] Prisma schema → PostgreSQL
- [x] Config → Mainnet in production
- [x] URLs → Production-aware
- [x] PayRam → Environment-based
- [x] Vercel config → Ready
- [x] Build commands → Configured
- [x] Error handling → Production-ready

## PayRam Setup (Optional)

If you want PayRam working:

1. **Deploy PayRam** to a VPS/server
   - See `PAYRAM_DEPLOYMENT.md`
   - Set up SSL/HTTPS
   - Get your PayRam URL

2. **Add to Vercel Environment Variables:**
   ```bash
   PAYRAM_API_URL=https://payram.yourdomain.com
   PAYRAM_API_KEY=your-key
   ```

3. **Test:**
   ```bash
   curl https://payram.yourdomain.com/health
   ```

## Troubleshooting

**Build fails?**
- Check Vercel logs
- Verify all env vars are set
- Ensure DATABASE_URL is correct

**Database error?**
- Verify DATABASE_URL format
- Check database allows Vercel IPs
- Run migration manually

**RPC errors?**
- Use premium RPC (Helius, QuickNode)
- Update SOLANA_RPC_URL

## Need Help?

- **Full Guide**: `PRODUCTION_DEPLOYMENT.md`
- **Checklist**: `VERCEL_DEPLOYMENT_CHECKLIST.md`
- **Quick Ref**: `QUICK_START_PRODUCTION.md`

---

## 🎯 Ready? Run This:

```bash
cd tigerpayx
vercel --prod
```

**That's it!** 🎉

