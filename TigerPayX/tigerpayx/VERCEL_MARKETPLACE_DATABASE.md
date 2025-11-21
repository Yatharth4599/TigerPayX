# 🗄️ Setting Up Database via Vercel Marketplace

Since you're seeing the Marketplace, use one of these providers. Here are the easiest options:

## Option 1: Neon (Recommended - Free Tier Available)

### Step 1: Create Neon Database
1. In Vercel Marketplace, click **"Neon"** → **"Add Integration"**
2. Or go directly to: https://neon.tech
3. Sign up for free account
4. Click **"Create Project"**
5. Name: `tigerpayx`
6. Select region (closest to you)
7. Click **"Create Project"**

### Step 2: Get Connection String
1. In Neon dashboard, you'll see your connection string
2. It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
3. Copy this connection string

### Step 3: Add to Vercel
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste your Neon connection string
5. **Environment**: ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### Step 4: Redeploy
- Go to **Deployments** → **Redeploy**

---

## Option 2: Supabase (Free Tier Available)

### Step 1: Create Supabase Database
1. In Vercel Marketplace, click **"Supabase"** → **"Add Integration"**
2. Or go directly to: https://supabase.com
3. Sign up for free account
4. Click **"New Project"**
5. Name: `tigerpayx`
6. Database Password: (save this!)
7. Region: Choose closest
8. Click **"Create new project"**

### Step 2: Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to **"Connection string"**
3. Click **"URI"** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Format: `postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require`

### Step 3: Add to Vercel
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste your Supabase connection string (with password replaced)
5. **Environment**: ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### Step 4: Redeploy
- Go to **Deployments** → **Redeploy**

---

## Option 3: Prisma Postgres (Instant Setup)

### Step 1: Add Integration
1. In Vercel Marketplace, click **"Prisma Postgres"**
2. Click **"Add Integration"**
3. Follow the setup wizard
4. It will automatically create the database and set `DATABASE_URL`

### Step 2: Verify
1. Go to **Settings** → **Environment Variables**
2. Check that `DATABASE_URL` is automatically set
3. If not, copy it from Prisma dashboard

### Step 3: Redeploy
- Go to **Deployments** → **Redeploy**

---

## Quick Comparison

| Provider | Free Tier | Setup Time | Auto-Config |
|----------|-----------|------------|-------------|
| **Neon** | ✅ Yes | 2 min | Manual |
| **Supabase** | ✅ Yes | 3 min | Manual |
| **Prisma Postgres** | ❌ Paid | 1 min | ✅ Automatic |

---

## Recommended: Neon (Easiest Free Option)

1. **Go to**: https://neon.tech
2. **Sign up** (free)
3. **Create Project** → Name: `tigerpayx`
4. **Copy connection string**
5. **Add to Vercel** as `DATABASE_URL`
6. **Redeploy**

**That's it!** 🚀

---

## After Database Setup

Don't forget to add other environment variables:
- `JWT_SECRET` (generate random string)
- `JWT_EXPIRES_IN` → `7d`
- `SOLANA_NETWORK` → `mainnet-beta`
- `NEXT_PUBLIC_SOLANA_NETWORK` → `mainnet-beta`
- `SOLANA_RPC_URL` → `https://api.mainnet-beta.solana.com`
- `SOLANA_DEVNET_RPC_URL` → `https://api.devnet.solana.com`
- `TT_TOKEN_MINT` → Your Tiger Token mint
- `NODE_ENV` → `production`

See `NEXT_STEPS.md` for complete checklist.

