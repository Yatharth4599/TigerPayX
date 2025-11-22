# 🔧 Fix Helius RPC Connection Issues

## Current Issue

Your Helius RPC is configured but failing with "Unknown error". Here's how to fix it:

## Step 1: Verify Helius API Key

1. Go to https://www.helius.dev/
2. Login to your account
3. Go to your project dashboard
4. **Copy the RPC URL** - it should look like:
   ```
   https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   ```

## Step 2: Check API Key Format

Helius RPC URLs should be in this format:
```
https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

**Common mistakes:**
- ❌ Missing `?api-key=`
- ❌ Extra spaces
- ❌ Quotes around the URL
- ❌ Wrong network (using devnet for mainnet)

## Step 3: Test Your Helius RPC Directly

Test if your Helius RPC works:

```bash
curl -X POST "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

**Expected response:**
```json
{"jsonrpc":"2.0","result":"ok","id":1}
```

**If you get an error:**
- **401/403:** API key is invalid or expired
- **Timeout:** Network issue
- **CORS:** Browser blocking (normal for curl, but check browser console)

## Step 4: Verify in Vercel

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. Check `NEXT_PUBLIC_SOLANA_RPC_URL`:
   - Value: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`
   - No quotes
   - No extra spaces
   - Enabled for all environments

## Step 5: Check Helius Dashboard

1. Login to Helius dashboard
2. Check your project:
   - Is it **active**?
   - Have you exceeded **rate limits**?
   - Is the API key **valid**?

## Step 6: Alternative - Use Different RPC Provider

If Helius continues to fail, try QuickNode:

1. Go to https://www.quicknode.com/
2. Create free endpoint
3. Copy the HTTP endpoint URL
4. Update Vercel environment variable:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY"
   ```

## Common Helius Issues

### Issue 1: "Unknown error" or Empty Error

**Cause:** CORS or network issue

**Solution:**
- Check browser console for CORS errors
- Verify API key is correct
- Test RPC URL directly (Step 3)

### Issue 2: API Key Invalid

**Symptoms:**
- 401/403 errors
- "Unauthorized" messages

**Solution:**
- Regenerate API key in Helius dashboard
- Update environment variable
- Redeploy

### Issue 3: Rate Limit Exceeded

**Symptoms:**
- Works sometimes, fails other times
- 429 errors

**Solution:**
- Check Helius dashboard for usage
- Upgrade plan if needed
- Or use QuickNode (10M requests/month free)

## Debugging Steps

After redeploy, check browser console for:

1. **RPC being used:**
   ```
   [getSolanaConnection] Using RPC: https://mainnet.helius-rpc.com/?api-key=***
   ```

2. **Detailed error:**
   ```
   [tryWithFallback] RPC ... failed: { message: "...", code: ..., status: ... }
   ```

3. **If Helius fails:**
   - Check the error details in console
   - Verify API key in Helius dashboard
   - Test RPC URL directly

## Quick Test Script

Add this to your browser console to test Helius RPC:

```javascript
fetch('https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getHealth'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Replace `YOUR_API_KEY` with your actual key.

## Still Not Working?

1. **Check Helius status:** https://status.helius.dev/ (if available)
2. **Try QuickNode** as alternative (more reliable free tier)
3. **Check browser console** for detailed error messages
4. **Verify API key** is active in Helius dashboard

---

**Note:** The improved error logging will now show you exactly what's failing with Helius RPC.

