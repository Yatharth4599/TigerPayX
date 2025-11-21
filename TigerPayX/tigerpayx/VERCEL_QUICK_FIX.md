# ⚡ Quick Fix: DATABASE_URL Missing Error

## The Error

```
PrismaConfigEnvError: Missing required environment variable: DATABASE_URL
```

## Solution: Set DATABASE_URL in Vercel

### Option 1: Use Vercel Postgres (Easiest - 2 minutes)

1. **Go to Vercel Dashboard**
   - Open your TigerPayX project
   - Click **"Storage"** tab (or **"Add"** → **"Storage"**)

2. **Create Postgres Database**
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Name it: `tigerpayx-db`
   - Select region
   - Click **"Create"**

3. **Done!** 
   - Vercel automatically creates `DATABASE_URL` for you
   - No manual configuration needed

4. **Redeploy**
   - Go to **Deployments**
   - Click **"Redeploy"** on the latest deployment

### Option 2: Use External Database (Supabase/Neon/Railway)

1. **Create Database** (choose one):
   - **Supabase**: https://supabase.com → New Project
   - **Neon**: https://neon.tech → New Project
   - **Railway**: https://railway.app → New Database

2. **Get Connection String**
   - Copy the PostgreSQL connection string
   - Format: `postgresql://user:password@host:5432/dbname?sslmode=require`

3. **Add to Vercel**
   - Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your connection string
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

4. **Redeploy**
   - Go to **Deployments**
   - Click **"Redeploy"**

## Minimum Required Variables

For the build to succeed, you need at least:

1. ✅ **DATABASE_URL** (Required)
2. ✅ **JWT_SECRET** (Required)
3. ✅ **SOLANA_NETWORK** (Required)
4. ✅ **NEXT_PUBLIC_SOLANA_NETWORK** (Required)

## After Setting DATABASE_URL

Once `DATABASE_URL` is set:
1. Vercel will automatically run `prisma migrate deploy`
2. Database tables will be created
3. Build will succeed

## Verify It's Set

1. Go to **Settings** → **Environment Variables**
2. Look for `DATABASE_URL`
3. Make sure it's set for **Production** environment
4. Check the value starts with `postgresql://`

---

**Quickest Solution**: Use Vercel Postgres - it's automatic! 🚀

