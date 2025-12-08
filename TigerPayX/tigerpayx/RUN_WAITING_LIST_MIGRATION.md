# 🗄️ Run Waiting List Migration

Your `WaitingList` table needs to be created in your existing Neon database. Here's how to do it:

## Option 1: Automatic (During Next Vercel Build)

The migration should run automatically during the next deployment. Just:
1. Make a small change and push to GitHub (or trigger a redeploy)
2. Check Vercel build logs for: ✅ "Migration applied successfully"

## Option 2: Manual (Run Now)

If you want to run it immediately:

### Step 1: Set DATABASE_URL Locally

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_JRv6ruwC1DIn@ep-odd-dew-ahmwxrzs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Or create a `.env.local` file:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_JRv6ruwC1DIn@ep-odd-dew-ahmwxrzs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 2: Run Migration

```bash
cd tigerpayx
npx prisma migrate deploy
```

You should see:
```
✅ Migration 20251208132454_add_waiting_list applied successfully
```

### Step 3: Verify Table Exists

You can check in Neon dashboard:
1. Go to https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Run: `SELECT * FROM "WaitingList";`
5. Should return empty results (no error = table exists!)

## Option 3: Run SQL Directly in Neon

If migrations don't work, you can run the SQL directly:

1. Go to Neon Dashboard → SQL Editor
2. Paste this SQL:

```sql
-- CreateTable
CREATE TABLE IF NOT EXISTS "WaitingList" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "role" TEXT,
    "useCase" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WaitingList_email_key" ON "WaitingList"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WaitingList_email_idx" ON "WaitingList"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WaitingList_createdAt_idx" ON "WaitingList"("createdAt");
```

3. Click **Run**

## Verify It Works

After running the migration:

1. Visit: `https://www.tigerpayx.com/waiting-list`
2. Fill out the form
3. Submit
4. ✅ Should work now!

## Troubleshooting

### Error: "relation WaitingList does not exist"
- Migration didn't run
- Use Option 2 or 3 above

### Error: "Migration already applied"
- Table already exists (good!)
- Try submitting the form

### Error: "Can't reach database"
- Check DATABASE_URL is correct
- Verify Neon database is active (not paused)

