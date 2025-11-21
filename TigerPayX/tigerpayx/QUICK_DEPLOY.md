# 🚀 Quick Deployment Guide

## Fastest Way: Vercel (5 minutes)

### Step 1: Prepare Database

**You MUST switch to PostgreSQL** (SQLite doesn't work on serverless):

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Get a PostgreSQL database:
   - **Free option:** [Supabase](https://supabase.com) - Create project → Copy connection string
   - **Free option:** [Neon](https://neon.tech) - Create project → Copy connection string
   - **Vercel option:** [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Add to project

### Step 2: Deploy to Vercel

**Option A: Via CLI (Fastest)**
```bash
cd tigerpayx
npm i -g vercel
vercel login
vercel
```

**Option B: Via GitHub**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js

### Step 3: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-strong-random-secret-here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=mainnet-beta
PAYRAM_API_URL=
PAYRAM_API_KEY=
TT_TOKEN_MINT=
```

### Step 4: Run Database Migration

After first deployment, run:
```bash
DATABASE_URL="your-postgres-url" npx prisma migrate deploy
```

Or in Vercel Dashboard → Deployments → Latest → Run Command:
```bash
npx prisma migrate deploy
```

### Step 5: Done! 🎉

Your app is live at `https://your-project.vercel.app`

---

## Alternative: Railway (Full Stack)

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

---

## Alternative: Docker (Self-Hosted)

```bash
# 1. Update schema to PostgreSQL
# 2. Run:
docker-compose up -d

# App runs on http://localhost:3000
# Database on localhost:5432
```

---

## ⚠️ Important: Database Migration

**Before deploying, you MUST:**

1. **Change Prisma provider:**
   ```prisma
   datasource db {
     provider = "postgresql"  // NOT "sqlite"
   }
   ```

2. **Get PostgreSQL connection string:**
   - Format: `postgresql://user:password@host:5432/database`

3. **Run migration:**
   ```bash
   DATABASE_URL="your-postgres-url" npx prisma migrate deploy
   ```

---

## Need Help?

See `DEPLOYMENT.md` for detailed instructions.

