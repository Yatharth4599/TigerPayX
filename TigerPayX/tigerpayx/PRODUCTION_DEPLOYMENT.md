# 🚀 TigerPayX Production Deployment Guide

## Pre-Deployment Checklist

### ✅ 1. Database Setup (REQUIRED)

**Switch to PostgreSQL:**
```bash
# Update prisma/schema.prisma
# Change: provider = "sqlite" → provider = "postgresql"
```

**Options for PostgreSQL:**
- **Vercel Postgres** (Recommended for Vercel) - Built-in integration
- **Supabase** - Free tier: 500MB database
- **Neon** - Serverless Postgres, free tier available
- **Railway** - $5/month, includes database
- **Render** - Free tier available

**Get Database URL:**
```
postgresql://user:password@host:5432/tigerpayx?schema=public
```

### ✅ 2. Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

#### Required Variables:
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/tigerpayx"

# Authentication
JWT_SECRET="generate-a-random-32-char-secret"
JWT_EXPIRES_IN="7d"

# Solana (Production - Mainnet)
SOLANA_NETWORK="mainnet-beta"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
# Or use a premium RPC:
# SOLANA_RPC_URL="https://your-helius-or-quicknode-url.com"
SOLANA_DEVNET_RPC_URL="https://api.devnet.solana.com"

# Token Mints
TT_TOKEN_MINT="your-mainnet-tiger-token-mint-address"
TT_TOKEN_MINT_DEVNET="your-devnet-tiger-token-mint-address"
```

#### Optional Variables (PayRam):
```bash
# Only if you're using PayRam
PAYRAM_API_URL="https://payram.yourdomain.com"
PAYRAM_API_KEY="your-payram-api-key"
NEXT_PUBLIC_PAYRAM_API_URL="https://payram.yourdomain.com"
```

#### Public Variables (accessible in browser):
```bash
NEXT_PUBLIC_SOLANA_NETWORK="mainnet-beta"
```

### ✅ 3. Update Prisma Schema for Production

**Before deploying, update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql" // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### ✅ 4. Database Migration

**Run migration on production database:**
```bash
# Set DATABASE_URL to production database
DATABASE_URL="your-production-postgres-url" npx prisma migrate deploy
```

Or Vercel will run it automatically if configured in `vercel.json`.

### ✅ 5. PayRam Setup (If Using)

**Deploy PayRam to production:**
1. Set up a VPS or server
2. Install Docker
3. Deploy PayRam using Docker (see `PAYRAM_DEPLOYMENT.md`)
4. Set up SSL/HTTPS
5. Configure `PAYRAM_API_URL` in Vercel

**PayRam Production Requirements:**
- PostgreSQL database
- SSL certificate (Let's Encrypt)
- Domain name
- Firewall rules (port 8080/8443)

### ✅ 6. Solana RPC Provider (Recommended)

For production, use a reliable RPC provider instead of public endpoints:

**Options:**
- **Helius** - Free tier: 100k requests/day
- **QuickNode** - Free tier available
- **Alchemy** - Free tier: 300M compute units/month
- **Triton** - Free tier available

**Update `SOLANA_RPC_URL` with your provider's endpoint.**

### ✅ 7. Vercel Deployment Steps

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   cd tigerpayx
   vercel link
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add SOLANA_NETWORK
   # ... add all variables
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### ✅ 8. Post-Deployment

1. **Verify Database Connection:**
   - Check Vercel logs for Prisma errors
   - Verify migrations ran successfully

2. **Test API Endpoints:**
   ```bash
   curl https://your-app.vercel.app/api/auth?action=login
   ```

3. **Test PayRam (if configured):**
   ```bash
   curl https://your-app.vercel.app/api/payram/verifyPayment
   ```

4. **Monitor:**
   - Check Vercel Analytics
   - Monitor error logs
   - Set up uptime monitoring

## Production Configuration Summary

### Network: Mainnet
- All transactions on Solana Mainnet
- Real SOL, USDC, USDT tokens
- Production token mints

### Database: PostgreSQL
- Serverless-compatible
- Scalable
- Reliable

### Security:
- Strong JWT_SECRET (32+ characters)
- HTTPS only
- Secure environment variables
- No private keys on server

### Performance:
- Use premium RPC providers
- Enable Vercel caching
- Optimize images
- Monitor API limits

## Troubleshooting

### Database Connection Issues:
- Verify DATABASE_URL format
- Check database firewall rules
- Ensure SSL is enabled

### RPC Rate Limits:
- Switch to premium RPC provider
- Implement request caching
- Use fallback RPCs

### PayRam Not Working:
- Verify PAYRAM_API_URL is accessible
- Check SSL certificate
- Verify API key
- Check CORS settings

## Support

For issues, check:
- Vercel deployment logs
- Browser console errors
- Network tab in DevTools
- Database connection status

