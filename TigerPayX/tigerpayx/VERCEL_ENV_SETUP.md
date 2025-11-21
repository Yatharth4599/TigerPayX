# 🔧 Vercel Environment Variables Setup

## The Issue

The `@` syntax in `vercel.json` references Vercel Secrets, which you need to create separately. For simplicity, we've removed that and you'll set environment variables directly in the Vercel Dashboard.

## How to Set Environment Variables in Vercel

### Step 1: Go to Environment Variables

1. Open your Vercel Dashboard
2. Select your **TigerPayX** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Each Variable

Click **"Add New"** for each variable below:

#### Required Variables:

**1. DATABASE_URL**
- **Name**: `DATABASE_URL`
- **Value**: Your PostgreSQL connection string
  - Example: `postgresql://user:password@host:5432/tigerpayx?sslmode=require`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**2. JWT_SECRET**
- **Name**: `JWT_SECRET`
- **Value**: Generate a random 32+ character string
  - You can use: `openssl rand -base64 32`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**3. JWT_EXPIRES_IN**
- **Name**: `JWT_EXPIRES_IN`
- **Value**: `7d`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**4. SOLANA_NETWORK**
- **Name**: `SOLANA_NETWORK`
- **Value**: `mainnet-beta`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**5. NEXT_PUBLIC_SOLANA_NETWORK**
- **Name**: `NEXT_PUBLIC_SOLANA_NETWORK`
- **Value**: `mainnet-beta`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**6. SOLANA_RPC_URL**
- **Name**: `SOLANA_RPC_URL`
- **Value**: `https://api.mainnet-beta.solana.com`
  - Or use a premium RPC: `https://your-helius-url.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**7. SOLANA_DEVNET_RPC_URL**
- **Name**: `SOLANA_DEVNET_RPC_URL`
- **Value**: `https://api.devnet.solana.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**8. TT_TOKEN_MINT**
- **Name**: `TT_TOKEN_MINT`
- **Value**: Your Tiger Token mainnet mint address
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**9. TT_TOKEN_MINT_DEVNET**
- **Name**: `TT_TOKEN_MINT_DEVNET`
- **Value**: Your Tiger Token devnet mint address (optional)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**10. NODE_ENV**
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: ✅ Production only

#### Optional Variables (PayRam):

**11. PAYRAM_API_URL** (Only if using PayRam)
- **Name**: `PAYRAM_API_URL`
- **Value**: `https://payram.yourdomain.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**12. PAYRAM_API_KEY** (Only if using PayRam)
- **Name**: `PAYRAM_API_KEY`
- **Value**: Your PayRam API key
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

**13. NEXT_PUBLIC_PAYRAM_API_URL** (Only if using PayRam)
- **Name**: `NEXT_PUBLIC_PAYRAM_API_URL`
- **Value**: `https://payram.yourdomain.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Step 3: Save and Redeploy

After adding all variables:
1. Click **"Save"** for each variable
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger a new deployment

## Quick Setup with Vercel Postgres

If you're using **Vercel Postgres**:

1. Go to **Storage** tab in your Vercel project
2. Create a **Postgres** database
3. Vercel will **automatically** create `DATABASE_URL` for you
4. You only need to add the other variables manually

## Verify Variables Are Set

After deployment, check build logs:
1. Go to **Deployments** → Latest deployment
2. Click **"Build Logs"**
3. Look for successful Prisma migration
4. No errors about missing environment variables

## Troubleshooting

### Error: "Environment Variable X references Secret Y, which does not exist"

**Solution**: This means you're using `@` syntax. We've removed that from `vercel.json`. Just set variables directly in the dashboard.

### Error: "DATABASE_URL not found"

**Solution**: 
- Make sure you added `DATABASE_URL` in Vercel Dashboard
- Check it's set for **Production** environment
- Redeploy after adding

### Build Fails with Database Error

**Solution**:
- Verify `DATABASE_URL` format is correct
- Check database allows connections from Vercel
- Ensure SSL mode is set: `?sslmode=require`

## Example: Setting DATABASE_URL

If using **Supabase**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?sslmode=require
```

If using **Neon**:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

If using **Vercel Postgres**:
- Automatically set when you create the database
- Check in **Storage** → Your database → **.env.local** tab

---

**After setting all variables, redeploy and your app should work!** 🚀

