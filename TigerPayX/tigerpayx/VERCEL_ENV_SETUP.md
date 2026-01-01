# Vercel Environment Variables Setup

## ⚠️ CRITICAL: OnMeta API Key Missing

The 401 "unauthorized to access" errors indicate that `ONMETA_CLIENT_ID` is not set in your Vercel production environment.

## Required Environment Variables

### 1. OnMeta API Credentials (REQUIRED)
```
ONMETA_CLIENT_ID=2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4
ONMETA_CLIENT_SECRET=your-client-secret-here
ONMETA_API_BASE_URL=https://api.platform.onmeta.in
```

**Important**: 
- Your production API key is: `2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4`
- Production API uses: `https://api.platform.onmeta.in`
- Staging API key (for testing): `359288fc-f15a-44ba-a1e1-cf04c894c2be`
- Staging API uses: `https://stg.api.onmeta.in`

**Note**: Replace `your-client-secret-here` with your actual OnMeta client secret.

### 2. Application URL (REQUIRED)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
**Important**: Replace `your-app.vercel.app` with your actual Vercel deployment URL.

### 3. Database (if using)
```
DATABASE_URL=your-database-connection-string
```

### 4. NextAuth (if using)
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

## How to Set Environment Variables in Vercel

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`TigerPayX`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click **Add New**
   - Enter the variable name (e.g., `ONMETA_CLIENT_ID`)
   - Enter the value
   - Select **Production**, **Preview**, and **Development** (or as needed)
   - Click **Save**
5. **Redeploy** your application after adding variables

### Option 2: Via Vercel CLI
```bash
vercel env add ONMETA_CLIENT_ID production
# Enter value when prompted: 359288fc-f15a-44ba-a1e1-cf04c894c2be

vercel env add ONMETA_CLIENT_SECRET production
# Enter your client secret

vercel env add ONMETA_API_BASE_URL production
# Enter: https://stg.api.onmeta.in

vercel env add NEXT_PUBLIC_APP_URL production
# Enter your Vercel app URL (e.g., https://tigerpayx.vercel.app)
```

## After Setting Variables

1. **Redeploy** your application:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click the "..." menu on the latest deployment
   - Select **Redeploy**

   OR

   - Push a new commit to trigger auto-deployment

2. **Verify** the variables are loaded:
   - Check Vercel function logs
   - Look for any warnings about missing credentials
   - Test the APIs in production

## Quick Fix Command

If you have Vercel CLI installed and are logged in:

```bash
cd tigerpayx

# Set all required variables
vercel env add ONMETA_CLIENT_ID production
# Enter: 359288fc-f15a-44ba-a1e1-cf04c894c2be

vercel env add ONMETA_CLIENT_SECRET production
# Enter your actual secret

vercel env add ONMETA_API_BASE_URL production
# Enter: https://stg.api.onmeta.in

vercel env add NEXT_PUBLIC_APP_URL production
# Enter your Vercel app URL

# Redeploy
vercel --prod
```

## Verification

After setting variables and redeploying, check:
1. Browser console - should no longer see 401 errors
2. Vercel function logs - should see successful API calls
3. Dashboard - tokens, limits, and currencies should load

## Troubleshooting

### Still getting 401 errors?
1. Verify variables are set for **Production** environment
2. Check variable names match exactly (case-sensitive)
3. Ensure no extra spaces in values
4. Redeploy after adding variables
5. Check Vercel logs for any errors

### Variables not loading?
1. Make sure you're checking the **Production** environment
2. Variables starting with `NEXT_PUBLIC_` are available in browser
3. Other variables are only available in server-side code
4. Restart/redeploy after adding variables
