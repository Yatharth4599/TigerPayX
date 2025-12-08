# 🔧 Waiting List Troubleshooting Guide

## Error: "Failed to join waiting list. Please try again."

This error usually means the database connection is not configured. Follow these steps:

### Step 1: Check Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your **TigerPayX** project

2. **Check Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Look for `DATABASE_URL`
   - If it's missing, you need to add it (see Step 2)

### Step 2: Add DATABASE_URL (If Missing)

#### Option A: Use Neon (Recommended)

1. **Get Neon Connection String**
   - Go to https://console.neon.tech
   - Select your project
   - Copy the connection string
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

2. **Add to Vercel**
   - Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

#### Option B: Use Vercel Postgres

1. **Create Vercel Postgres**
   - Vercel Dashboard → Your Project → **Storage** tab
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Enter name: `tigerpayx-db`
   - Click **"Create"**
   - ✅ `DATABASE_URL` is automatically created!

### Step 3: Run Database Migrations

After adding `DATABASE_URL`, you need to run migrations:

#### Option A: Automatic (Vercel Build)

Migrations should run automatically during build. Check build logs for:
- ✅ "Migration applied successfully"
- ❌ If you see errors, see Option B

#### Option B: Manual (If Automatic Fails)

1. **Get Database URL from Vercel**
   - Copy the `DATABASE_URL` value from Vercel

2. **Run Locally (Temporary)**
   ```bash
   export DATABASE_URL="your-connection-string-here"
   cd tigerpayx
   npx prisma migrate deploy
   ```

3. **Or Use Vercel CLI**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Step 4: Verify Database Connection

1. **Check Vercel Build Logs**
   - Go to **Deployments** → Latest deployment
   - Look for:
     - ✅ "Prisma Client generated"
     - ✅ "Migration applied successfully"
     - ❌ Any database connection errors

2. **Test the Form**
   - Visit: `https://www.tigerpayx.com/waiting-list`
   - Fill out the form
   - Submit
   - If successful, check your database to verify the entry

### Step 5: Check Database Table Exists

If migrations ran but still getting errors:

1. **Connect to Your Database**
   - Use Neon dashboard SQL editor, or
   - Use a database client (pgAdmin, DBeaver, etc.)

2. **Verify Table Exists**
   ```sql
   SELECT * FROM "WaitingList" LIMIT 1;
   ```

3. **If Table Doesn't Exist**
   - Run migrations again (see Step 3)
   - Check migration files in `prisma/migrations/`

## Common Error Codes

### P1001 / P1000: Can't reach database server
**Solution**: 
- Verify `DATABASE_URL` is correct
- Check database is not paused (Neon free tier pauses after inactivity)
- Ensure connection string includes `?sslmode=require`

### P2021: Table does not exist
**Solution**: 
- Run migrations: `npx prisma migrate deploy`
- Check migration files exist in `prisma/migrations/`

### P2002: Unique constraint violation
**Solution**: 
- This means email already exists (not an error, just duplicate)
- User is already on the list

### Environment variable not found
**Solution**: 
- Add `DATABASE_URL` to Vercel environment variables
- Redeploy after adding

## Quick Checklist

- [ ] `DATABASE_URL` exists in Vercel environment variables
- [ ] `DATABASE_URL` is set for Production, Preview, Development
- [ ] Database is active (not paused)
- [ ] Migrations have run successfully
- [ ] `WaitingList` table exists in database
- [ ] Project has been redeployed after adding `DATABASE_URL`

## Still Not Working?

1. **Check Vercel Function Logs**
   - Vercel Dashboard → Your Project → **Functions** tab
   - Click on `/api/waiting-list`
   - Check for error logs

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Submit the form
   - Look for error messages

3. **Test API Directly**
   ```bash
   curl -X POST https://www.tigerpayx.com/api/waiting-list \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

## Need More Help?

Check the error message details:
- In development mode, you'll see detailed error messages
- In production, check Vercel function logs for details
- The API now returns more specific error messages

