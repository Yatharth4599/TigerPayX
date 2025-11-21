# ✅ Add Environment Variables to Vercel

## Step 1: Add DATABASE_URL (Most Important!)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your **TigerPayX** project

2. **Settings → Environment Variables**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in sidebar

3. **Add DATABASE_URL**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: 
     ```
     postgresql://neondb_owner:npg_JRv6ruwC1DIn@ep-odd-dew-ahmwxrzs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

---

## Step 2: Add Other Required Variables

Click **"Add New"** for each:

### 1. JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: Generate one at https://generate-secret.vercel.app/32
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 2. JWT_EXPIRES_IN
- **Name**: `JWT_EXPIRES_IN`
- **Value**: `7d`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 3. SOLANA_NETWORK
- **Name**: `SOLANA_NETWORK`
- **Value**: `mainnet-beta`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 4. NEXT_PUBLIC_SOLANA_NETWORK
- **Name**: `NEXT_PUBLIC_SOLANA_NETWORK`
- **Value**: `mainnet-beta`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 5. SOLANA_RPC_URL
- **Name**: `SOLANA_RPC_URL`
- **Value**: `https://api.mainnet-beta.solana.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 6. SOLANA_DEVNET_RPC_URL
- **Name**: `SOLANA_DEVNET_RPC_URL`
- **Value**: `https://api.devnet.solana.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 7. TT_TOKEN_MINT
- **Name**: `TT_TOKEN_MINT`
- **Value**: Your Tiger Token mainnet mint address (or placeholder for now)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 8. NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: ✅ **Production only**

---

## Step 3: Verify All Variables

After adding, you should have:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `JWT_EXPIRES_IN`
- ✅ `SOLANA_NETWORK`
- ✅ `NEXT_PUBLIC_SOLANA_NETWORK`
- ✅ `SOLANA_RPC_URL`
- ✅ `SOLANA_DEVNET_RPC_URL`
- ✅ `TT_TOKEN_MINT`
- ✅ `NODE_ENV` (Production only)

---

## Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. **Uncheck** "Use existing Build Cache"
4. Click **"Redeploy"**

---

## Step 5: Verify Build

Check build logs for:
- ✅ "Prisma Client generated"
- ✅ "Running migrations..."
- ✅ "Migration applied successfully"
- ✅ "Build completed successfully"

---

## Quick Copy-Paste Values

**DATABASE_URL:**
```
postgresql://neondb_owner:npg_JRv6ruwC1DIn@ep-odd-dew-ahmwxrzs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**JWT_SECRET:**
- Generate: https://generate-secret.vercel.app/32

**Other values:**
- `JWT_EXPIRES_IN` → `7d`
- `SOLANA_NETWORK` → `mainnet-beta`
- `NEXT_PUBLIC_SOLANA_NETWORK` → `mainnet-beta`
- `SOLANA_RPC_URL` → `https://api.mainnet-beta.solana.com`
- `SOLANA_DEVNET_RPC_URL` → `https://api.devnet.solana.com`
- `NODE_ENV` → `production` (Production only)

---

**After adding DATABASE_URL and redeploying, your build should succeed!** 🚀

