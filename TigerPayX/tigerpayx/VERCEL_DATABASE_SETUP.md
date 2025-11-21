# 🗄️ How to Set Up Database in Vercel

## Quick Solution: Vercel Postgres (Easiest - 2 minutes)

### Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on **"TigerPayX"** project (or your project name)

3. **Go to Storage Tab**
   - Click on **"Storage"** tab at the top
   - Or click **"Add"** → **"Storage"**

4. **Create Postgres Database**
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Enter a name: `tigerpayx-db` (or any name you like)
   - Select a region (choose closest to your users)
   - Click **"Create"**

5. **Done!** 
   - Vercel automatically creates `DATABASE_URL` environment variable
   - You don't need to copy anything manually!

### Step 2: Verify Environment Variable

1. Go to **Settings** → **Environment Variables**
2. You should see `DATABASE_URL` already there
3. Make sure it's set for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete
4. ✅ Done!

---

## Alternative: External Database (Supabase/Neon/Railway)

If you prefer to use an external database:

### Option A: Supabase (Free Tier)

1. **Create Account**
   - Go to https://supabase.com
   - Sign up for free account

2. **Create Project**
   - Click **"New Project"**
   - Name: `tigerpayx`
   - Database Password: (save this!)
   - Region: Choose closest
   - Click **"Create new project"**

3. **Get Connection String**
   - Go to **Settings** → **Database**
   - Scroll to **"Connection string"**
   - Click **"URI"** tab
   - Copy the connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **Add to Vercel**
   - Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Supabase connection string
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

5. **Redeploy**
   - Go to **Deployments** → **Redeploy**

### Option B: Neon (Serverless Postgres - Free Tier)

1. **Create Account**
   - Go to https://neon.tech
   - Sign up for free account

2. **Create Project**
   - Click **"Create Project"**
   - Name: `tigerpayx`
   - Region: Choose closest
   - Click **"Create Project"**

3. **Get Connection String**
   - Copy the connection string from dashboard
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

4. **Add to Vercel**
   - Same steps as Supabase above

### Option C: Railway ($5/month)

1. **Create Account**
   - Go to https://railway.app
   - Sign up

2. **Create PostgreSQL**
   - Click **"New Project"**
   - Click **"Add Service"** → **"Database"** → **"PostgreSQL"**
   - Railway creates it automatically

3. **Get Connection String**
   - Click on PostgreSQL service
   - Go to **"Variables"** tab
   - Copy `DATABASE_URL` value

4. **Add to Vercel**
   - Same steps as above

---

## Required Environment Variables Checklist

After setting up the database, make sure you have these in Vercel:

### Required:
- [ ] `DATABASE_URL` - Your PostgreSQL connection string
- [ ] `JWT_SECRET` - Random 32+ character string
- [ ] `JWT_EXPIRES_IN` - `7d`
- [ ] `SOLANA_NETWORK` - `mainnet-beta`
- [ ] `NEXT_PUBLIC_SOLANA_NETWORK` - `mainnet-beta`
- [ ] `SOLANA_RPC_URL` - `https://api.mainnet-beta.solana.com`
- [ ] `SOLANA_DEVNET_RPC_URL` - `https://api.devnet.solana.com`
- [ ] `TT_TOKEN_MINT` - Your Tiger Token mint address
- [ ] `NODE_ENV` - `production` (Production only)

### Optional (PayRam):
- [ ] `PAYRAM_API_URL` - Only if using PayRam
- [ ] `PAYRAM_API_KEY` - Only if using PayRam
- [ ] `NEXT_PUBLIC_PAYRAM_API_URL` - Only if using PayRam

---

## How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Select your project

2. **Settings → Environment Variables**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in sidebar

3. **Add Each Variable**
   - Click **"Add New"**
   - Enter **Name** and **Value**
   - Select environments (Production, Preview, Development)
   - Click **"Save"**

4. **Repeat** for each variable

---

## Generate JWT_SECRET

You need a random secret for JWT. Generate one:

**Option 1: Online**
- Go to https://generate-secret.vercel.app/32
- Copy the generated secret

**Option 2: Terminal**
```bash
openssl rand -base64 32
```

**Option 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then add it to Vercel as `JWT_SECRET`.

---

## Verify It's Working

After setting `DATABASE_URL` and redeploying:

1. **Check Build Logs**
   - Go to Deployments → Latest deployment
   - Look for: ✅ "Prisma Client generated"
   - Look for: ✅ "Running migrations..."
   - Look for: ✅ "Migration applied successfully"

2. **Test the Site**
   - Visit your Vercel URL
   - Try to sign up
   - If it works, database is connected! ✅

---

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Solution**: 
- Make sure you added `DATABASE_URL` in Vercel
- Check it's set for **Production** environment
- Redeploy after adding

### Error: "Can't reach database server"

**Solution**:
- Verify connection string format is correct
- Check database allows external connections
- Ensure SSL mode is set: `?sslmode=require`

### Migration Fails

**Solution**:
- Verify `DATABASE_URL` is correct
- Check database has proper permissions
- Check build logs for specific error

---

## Quick Summary

**Easiest Way:**
1. Vercel Dashboard → Your Project → **Storage**
2. Create **Postgres** database
3. ✅ `DATABASE_URL` is automatically set!
4. Redeploy

**That's it!** 🚀

