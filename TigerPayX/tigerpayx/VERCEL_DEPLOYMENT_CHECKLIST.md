# ✅ Vercel Deployment Checklist

Use this checklist to ensure everything is ready for production deployment.

## Pre-Deployment

### Database Setup
- [ ] **PostgreSQL Database Created**
  - [ ] Vercel Postgres (recommended)
  - [ ] Or Supabase/Neon/Railway
  - [ ] Database URL copied

- [ ] **Prisma Schema Updated**
  - [ ] Changed `provider = "sqlite"` → `provider = "postgresql"` in `prisma/schema.prisma`
  - [ ] Schema matches production requirements

- [ ] **Database Migration**
  - [ ] Run: `DATABASE_URL="your-postgres-url" npx prisma migrate deploy`
  - [ ] Verify migrations succeeded

### Environment Variables (Set in Vercel Dashboard)

#### Required Variables:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Random 32+ character secret
- [ ] `JWT_EXPIRES_IN` - Token expiry (e.g., "7d")
- [ ] `SOLANA_NETWORK` - Set to "mainnet-beta"
- [ ] `SOLANA_RPC_URL` - Mainnet RPC endpoint
- [ ] `SOLANA_DEVNET_RPC_URL` - Devnet RPC (for fallback)
- [ ] `NEXT_PUBLIC_SOLANA_NETWORK` - "mainnet-beta"
- [ ] `TT_TOKEN_MINT` - Your Tiger Token mainnet mint address
- [ ] `TT_TOKEN_MINT_DEVNET` - Devnet mint (optional)

#### Optional Variables (PayRam):
- [ ] `PAYRAM_API_URL` - Your PayRam production URL
- [ ] `PAYRAM_API_KEY` - PayRam API key
- [ ] `NEXT_PUBLIC_PAYRAM_API_URL` - Public PayRam URL

#### System Variables:
- [ ] `NODE_ENV` - Set to "production"

### Code Configuration

- [ ] **Network Settings**
  - [ ] Config defaults to mainnet in production
  - [ ] RPC URLs are production-ready
  - [ ] Token mints are mainnet addresses

- [ ] **No Localhost References**
  - [ ] All URLs use environment variables
  - [ ] No hardcoded localhost in source code

- [ ] **Build Configuration**
  - [ ] `vercel.json` is configured
  - [ ] Build command includes Prisma generation
  - [ ] Environment variables mapped

### PayRam Setup (If Using)

- [ ] **PayRam Deployed**
  - [ ] PayRam running on production server
  - [ ] SSL certificate installed
  - [ ] Domain configured
  - [ ] API accessible from Vercel

- [ ] **PayRam Configuration**
  - [ ] `PAYRAM_API_URL` set correctly
  - [ ] API key configured
  - [ ] CORS settings allow Vercel domain

## Deployment Steps

1. [ ] **Install Vercel CLI** (if not installed)
   ```bash
   npm i -g vercel
   ```

2. [ ] **Login to Vercel**
   ```bash
   vercel login
   ```

3. [ ] **Link Project** (first time)
   ```bash
   cd tigerpayx
   vercel link
   ```

4. [ ] **Set Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - Set for Production, Preview, and Development

5. [ ] **Deploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Verification

### Functionality Tests
- [ ] **Authentication**
  - [ ] Sign up works
  - [ ] Login works
  - [ ] JWT tokens generated correctly

- [ ] **Wallet Features**
  - [ ] Wallet creation works
  - [ ] Balance fetching works
  - [ ] RPC connection successful

- [ ] **Transactions**
  - [ ] Send transactions work
  - [ ] Swap transactions work
  - [ ] Transaction history loads

- [ ] **Merchant Features**
  - [ ] Merchant registration works
  - [ ] PayLink creation works
  - [ ] PayLink payment works

- [ ] **PayRam Integration** (if configured)
  - [ ] PayRam API accessible
  - [ ] Merchant registration with PayRam works
  - [ ] Payment verification works

### Performance Checks
- [ ] **Build Time**
  - [ ] Build completes successfully
  - [ ] No build errors or warnings

- [ ] **API Response Times**
  - [ ] API endpoints respond quickly
  - [ ] Database queries optimized

- [ ] **Error Monitoring**
  - [ ] Check Vercel logs for errors
  - [ ] Monitor error rates

### Security Checks
- [ ] **Environment Variables**
  - [ ] No secrets in code
  - [ ] All sensitive data in env vars
  - [ ] JWT_SECRET is strong

- [ ] **HTTPS**
  - [ ] All connections use HTTPS
  - [ ] No mixed content warnings

- [ ] **CORS**
  - [ ] CORS configured correctly
  - [ ] No unauthorized access

## Monitoring Setup

- [ ] **Vercel Analytics**
  - [ ] Analytics enabled
  - [ ] Monitoring dashboard set up

- [ ] **Error Tracking**
  - [ ] Error logs reviewed
  - [ ] Alerts configured (optional)

- [ ] **Uptime Monitoring**
  - [ ] External monitoring set up (optional)
  - [ ] Health check endpoint (optional)

## Documentation

- [ ] **Production URLs Documented**
  - [ ] Main app URL saved
  - [ ] API endpoints documented
  - [ ] PayRam URL documented (if used)

- [ ] **Team Access**
  - [ ] Team members have Vercel access
  - [ ] Database access shared (if needed)

## Rollback Plan

- [ ] **Previous Deployment**
  - [ ] Know how to rollback in Vercel
  - [ ] Previous version accessible

- [ ] **Database Backup**
  - [ ] Database backup strategy in place
  - [ ] Know how to restore if needed

---

## Quick Deploy Command

Once everything is configured:

```bash
cd tigerpayx
vercel --prod
```

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify DATABASE_URL format
   - Check database firewall rules
   - Ensure SSL is enabled

2. **Build Fails**
   - Check Vercel build logs
   - Verify all dependencies in package.json
   - Check Prisma generation

3. **RPC Rate Limits**
   - Switch to premium RPC provider
   - Check SOLANA_RPC_URL is correct

4. **PayRam Not Working**
   - Verify PAYRAM_API_URL is accessible
   - Check CORS settings
   - Verify API key

---

**Ready to deploy?** ✅ Check all items above, then run `vercel --prod`

