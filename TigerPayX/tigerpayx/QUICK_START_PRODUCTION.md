# 🚀 Quick Start: Deploy to Vercel

## Step 1: Set Up PostgreSQL Database

Choose one:
- **Vercel Postgres** (easiest): Project → Storage → Create Database
- **Supabase**: https://supabase.com (free tier)
- **Neon**: https://neon.tech (serverless)
- **Railway**: https://railway.app ($5/month)

Copy your database URL:
```
postgresql://user:password@host:5432/tigerpayx?schema=public
```

## Step 2: Update Prisma Schema

✅ **Already done!** The schema is set to PostgreSQL.

## Step 3: Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/tigerpayx

# Auth (REQUIRED)
JWT_SECRET=your-random-32-char-secret-here
JWT_EXPIRES_IN=7d

# Solana (REQUIRED)
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

# Tokens (REQUIRED)
TT_TOKEN_MINT=your-mainnet-tiger-token-mint
TT_TOKEN_MINT_DEVNET=your-devnet-tiger-token-mint

# PayRam (OPTIONAL - only if using PayRam)
PAYRAM_API_URL=https://payram.yourdomain.com
PAYRAM_API_KEY=your-payram-key
NEXT_PUBLIC_PAYRAM_API_URL=https://payram.yourdomain.com

# System
NODE_ENV=production
```

## Step 4: Run Database Migration

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/tigerpayx"

# Run migration
npx prisma migrate deploy
```

Or Vercel will run it automatically during build (configured in `vercel.json`).

## Step 5: Deploy to Vercel

### Option A: Via CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
cd tigerpayx
vercel --prod
```

### Option B: Via GitHub

1. Push code to GitHub
2. Go to Vercel Dashboard
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js
6. Set environment variables (from Step 3)
7. Click "Deploy"

## Step 6: Verify Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Verify build succeeded
   - Check for any errors

2. **Test Your App**
   - Visit your Vercel URL
   - Test signup/login
   - Test wallet features
   - Test transactions

3. **Check API Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/auth?action=login
   ```

## Step 7: PayRam Setup (If Using)

If you're using PayRam:

1. **Deploy PayRam** to a VPS/server
   - See `PAYRAM_DEPLOYMENT.md` for details
   - Set up SSL/HTTPS
   - Configure domain

2. **Update Environment Variables**
   - Set `PAYRAM_API_URL` in Vercel
   - Set `PAYRAM_API_KEY` if required

3. **Test PayRam Connection**
   ```bash
   curl https://payram.yourdomain.com/health
   ```

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Ensure Prisma schema is PostgreSQL

### Database Connection Error
- Verify DATABASE_URL format
- Check database allows connections from Vercel
- Ensure SSL is enabled

### RPC Errors
- Switch to premium RPC provider (Helius, QuickNode)
- Update SOLANA_RPC_URL

### PayRam Not Working
- Verify PAYRAM_API_URL is accessible
- Check CORS settings
- Verify API key

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring
- [ ] Configure backups
- [ ] Set up team access

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Solana Docs**: https://docs.solana.com

---

**Ready?** Run `vercel --prod` and you're live! 🎉

