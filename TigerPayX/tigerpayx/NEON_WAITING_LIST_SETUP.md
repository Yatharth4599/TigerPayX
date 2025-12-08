# 🗄️ Connect Waiting List to Neon Database

## Quick Setup Guide

### Step 1: Get Your Neon Database URL

1. **Go to Neon Dashboard**
   - Visit: https://console.neon.tech
   - Sign in to your account

2. **Select Your Project**
   - Click on your TigerPayX project (or create a new one)

3. **Get Connection String**
   - Go to your project dashboard
   - Click on **"Connection Details"** or **"Connection String"**
   - Copy the connection string
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

### Step 2: Add DATABASE_URL to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your **TigerPayX** project

2. **Add Environment Variable**
   - Go to **Settings** → **Environment Variables**
   - Click **"Add New"**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

### Step 3: Run Database Migrations

The migrations will run automatically during Vercel deployment, but you can also run them manually:

**Option A: Automatic (Recommended)**
- Vercel will run migrations during build
- Check build logs for: ✅ "Migration applied successfully"

**Option B: Manual (Local Testing)**
```bash
# Set your DATABASE_URL locally
export DATABASE_URL="your-neon-connection-string"

# Run migrations
cd tigerpayx
npx prisma migrate deploy
```

### Step 4: Verify Connection

1. **Redeploy on Vercel**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - Wait for build to complete

2. **Test the Waiting List Form**
   - Visit: `https://your-site.vercel.app/waiting-list`
   - Fill out the form
   - Submit
   - ✅ If successful, data is saved to Neon!

3. **Check Database**
   - Go to Neon Dashboard
   - Click **"SQL Editor"**
   - Run: `SELECT * FROM "WaitingList";`
   - You should see your entry!

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
- Verify connection string includes `?sslmode=require`
- Check Neon project is active (not paused)
- Ensure IP allowlist allows connections (Neon allows all by default)

### Error: "Table 'WaitingList' does not exist"

**Solution:**
- Migrations didn't run. Check Vercel build logs
- Manually run: `npx prisma migrate deploy`
- Verify `DATABASE_URL` is set correctly

### Error: "Connection timeout"

**Solution:**
- Check Neon project is not paused (free tier pauses after inactivity)
- Verify connection string is correct
- Try using connection pooling URL (if available in Neon dashboard)

## Quick Checklist

- [ ] Neon database created
- [ ] Connection string copied
- [ ] `DATABASE_URL` added to Vercel
- [ ] Environment set for Production, Preview, Development
- [ ] Project redeployed
- [ ] Waiting list form tested
- [ ] Data verified in Neon dashboard

## That's it! 🚀

Your waiting list is now connected to Neon and will store all submissions!

