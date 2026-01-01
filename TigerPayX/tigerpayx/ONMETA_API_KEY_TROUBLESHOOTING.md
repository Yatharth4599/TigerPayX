# OnMeta API Key Troubleshooting

## Issue: 401 "unauthorized to access" Error

Even though your API key `2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4` is set in Vercel, you're getting 401 errors.

## Possible Causes

### 1. API Key Permissions
The API key might not have access to these specific endpoints:
- `/v1/tokens/`
- `/v1/orders/get-chain-limit`
- `/v1/users/login`

**Solution**: Contact OnMeta support to verify:
- Your API key has access to these endpoints
- The API key is activated for staging/production
- There are no IP restrictions on your API key

### 2. Environment Variable Not Loading
The environment variable might not be accessible in the serverless function.

**Check Vercel Logs**:
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for console.log messages showing:
   - `OnMeta API credentials loaded:` - Should show your API key prefix
   - `hasApiKey: true` - Should be true
   - `apiKeyPrefix: "2fbe1c80..."` - Should match your key

**If the API key is not loading**:
1. Verify the variable name is exactly `ONMETA_CLIENT_ID` (case-sensitive)
2. Check it's set for **Production** environment
3. Redeploy after adding/changing variables
4. Check for extra spaces in the value

### 3. API Key Format
The API key might need to be in a different format or header.

**Current Implementation**:
```javascript
headers: {
  "Accept": "application/json",
  "x-api-key": ONMETA_CLIENT_ID,
}
```

**Test with curl**:
```bash
curl --location 'https://stg.api.onmeta.in/v1/orders/get-chain-limit' \
--header 'x-api-key: 2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4'
```

If this also returns 401, the issue is with the API key itself, not the code.

### 4. Staging vs Production API
Your API key might only work with production API, not staging.

**Check**:
- Is your API key for staging or production?
- Try changing `ONMETA_API_BASE_URL` to production URL (if you have one)
- Contact OnMeta to confirm which environment your key is for

## Debugging Steps

### Step 1: Verify Environment Variable
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `ONMETA_CLIENT_ID` is set to: `2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4`
3. Check it's enabled for **Production**
4. Note: Variables starting with `NEXT_PUBLIC_` are available in browser, others are server-only

### Step 2: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on a function (e.g., `/api/onmeta/tokens`)
3. Check the logs for:
   - `OnMeta API credentials loaded:` - Should show your key
   - `OnMeta fetch tokens request:` - Should show `hasApiKey: true`

### Step 3: Test API Key Directly
```bash
# Test chain limits
curl --location 'https://stg.api.onmeta.in/v1/orders/get-chain-limit' \
--header 'x-api-key: 2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4'

# Test tokens
curl --location 'https://stg.api.onmeta.in/v1/tokens/' \
--header 'x-api-key: 2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4'
```

If these return 401, contact OnMeta support about API key permissions.

### Step 4: Contact OnMeta Support
If the API key is correct but still getting 401:
1. Ask them to verify your API key `2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4` has access to:
   - `/v1/tokens/`
   - `/v1/orders/get-chain-limit`
   - `/v1/users/login`
2. Ask if the key needs to be activated
3. Ask if there are IP restrictions
4. Ask if the key is for staging or production

## Quick Fixes to Try

### Fix 1: Re-add Environment Variable
1. Delete `ONMETA_CLIENT_ID` from Vercel
2. Add it again with value: `2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4`
3. Make sure no extra spaces
4. Redeploy

### Fix 2: Check Variable Name
Make sure it's exactly:
- `ONMETA_CLIENT_ID` (not `ONMETA_API_KEY` or `ONMETA_CLIENT_KEY`)

### Fix 3: Verify API Base URL
Make sure `ONMETA_API_BASE_URL` is set to:
- `https://stg.api.onmeta.in` (for staging)
- Or production URL if your key is for production

## What the Code Does Now

The code now includes better logging:
- Logs when API credentials are loaded (with prefix, not full key)
- Logs API key status in each request
- Logs detailed error information

Check Vercel function logs to see what's happening.

