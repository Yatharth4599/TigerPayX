# TigerPayX Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest way to deploy Next.js applications with zero configuration.

#### Prerequisites
1. **PostgreSQL Database** (required - SQLite doesn't work on serverless)
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - Or [Supabase](https://supabase.com) (free tier available)
   - Or [Neon](https://neon.tech) (serverless Postgres)
   - Or [Railway](https://railway.app) Postgres

2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)

#### Quick Deploy Steps

1. **Prepare Database:**
   ```bash
   # Update prisma/schema.prisma to use PostgreSQL
   # Change: provider = "sqlite" → provider = "postgresql"
   ```

2. **Deploy via Vercel CLI:**
   ```bash
   cd tigerpayx
   npm i -g vercel
   vercel login
   vercel
   ```

3. **Or Deploy via GitHub:**
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Connect GitHub repository
   - Vercel will auto-detect Next.js

4. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
     SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
     SOLANA_NETWORK=mainnet-beta
     PAYRAM_API_URL=http://your-payram-server.com:8080
     PAYRAM_API_KEY=your-payram-key
     TT_TOKEN_MINT=your-tt-token-mint
     ```

5. **Run Database Migration:**
   ```bash
   # In Vercel dashboard, go to Deployments → Latest → Settings
   # Or run locally:
   DATABASE_URL="your-postgres-url" npx prisma migrate deploy
   ```

#### Vercel Build Settings

The `vercel.json` is already configured with:
- Prisma generation and migration
- Environment variables
- Build commands

### Option 2: Railway (Full Stack)

Railway supports both the app and database.

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Or use Railway CLI: `railway init`

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy connection string

4. **Deploy Application:**
   - Railway auto-detects Next.js
   - Set environment variables
   - Deploy

5. **Set Environment Variables:**
   - `DATABASE_URL` (auto-set by Railway)
   - `JWT_SECRET`
   - `SOLANA_RPC_URL`
   - `PAYRAM_API_URL`
   - etc.

### Option 3: Self-Hosted (VPS/Docker)

For full control, deploy on your own server.

#### Using Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:20-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
   COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://user:pass@db:5432/tigerpayx
         - JWT_SECRET=your-secret
         - SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         - POSTGRES_USER=tigerpayx
         - POSTGRES_PASSWORD=your-password
         - POSTGRES_DB=tigerpayx
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Deploy:**
   ```bash
   docker-compose up -d
   ```

## 📋 Pre-Deployment Checklist

### 1. Database Migration
- [ ] Switch from SQLite to PostgreSQL
- [ ] Update `prisma/schema.prisma` provider
- [ ] Run `npx prisma migrate deploy`
- [ ] Verify database connection

### 2. Environment Variables
- [ ] Set `DATABASE_URL` (PostgreSQL)
- [ ] Set `JWT_SECRET` (strong random string)
- [ ] Set `SOLANA_RPC_URL` (Helius/Triton recommended)
- [ ] Set `PAYRAM_API_URL` (if using PayRam)
- [ ] Set `TT_TOKEN_MINT` (if using TT token)

### 3. Build Test
- [ ] Run `npm run build` locally
- [ ] Fix any build errors
- [ ] Test production build: `npm start`

### 4. Security
- [ ] Use strong `JWT_SECRET`
- [ ] Use HTTPS in production
- [ ] Set up CORS if needed
- [ ] Review environment variables

## 🔧 Database Setup (PostgreSQL)

### Update Prisma Schema

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Run Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

## 🌐 Environment Variables Reference

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens

### Recommended
- `SOLANA_RPC_URL` - Solana RPC endpoint (use Helius/Triton for production)
- `SOLANA_NETWORK` - `mainnet-beta` or `devnet`

### Optional
- `PAYRAM_API_URL` - Your self-hosted PayRam instance
- `PAYRAM_API_KEY` - PayRam API key
- `TT_TOKEN_MINT` - Tiger Token mint address
- `SOLANA_DEVNET_RPC_URL` - Devnet RPC (for testing)

## 🚨 Important Notes

### SQLite → PostgreSQL Migration

**SQLite does NOT work on serverless platforms** (Vercel, Netlify, etc.)

You MUST switch to PostgreSQL:
1. Update `prisma/schema.prisma`
2. Create PostgreSQL database
3. Update `DATABASE_URL`
4. Run migrations

### Build Commands

Vercel automatically runs:
```bash
prisma generate && prisma migrate deploy && next build
```

### Database Migrations

Run migrations after deployment:
```bash
DATABASE_URL="your-postgres-url" npx prisma migrate deploy
```

## 📊 Recommended RPC Providers

For production Solana RPC:
- **Helius** - https://www.helius.dev (free tier available)
- **Triton** - https://triton.one (reliable, fast)
- **QuickNode** - https://www.quicknode.com (enterprise)

Avoid using public RPC endpoints in production (rate limits).

## 🔍 Post-Deployment

1. **Test Authentication:**
   - Sign up new user
   - Login
   - Verify JWT tokens work

2. **Test Wallet:**
   - Create wallet
   - Check balances
   - Send test transaction

3. **Test Swaps:**
   - Try Jupiter swap
   - Verify transaction

4. **Test Merchant:**
   - Register merchant
   - Create PayLink
   - Process payment

## 🆘 Troubleshooting

### Build Fails
- Check Prisma schema is correct
- Verify `DATABASE_URL` is set
- Check Node.js version (20+)

### Database Connection Errors
- Verify `DATABASE_URL` format
- Check database is accessible
- Run migrations: `npx prisma migrate deploy`

### Environment Variables Not Working
- Restart deployment after adding vars
- Check variable names match exactly
- Use `NEXT_PUBLIC_` prefix for client-side vars

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

