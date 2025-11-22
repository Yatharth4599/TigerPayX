# 🔍 Verify Your RPC Setup

## Issue: Helius RPC Not Being Used

If you're seeing fallback RPCs being used instead of Helius, follow these steps:

## Step 1: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Check these variables exist:
   - `SOLANA_RPC_URL`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`

3. **Verify the values:**
   - Should be: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - Make sure there are **no extra spaces** or quotes
   - Make sure the **entire URL** is copied (including `?api-key=`)

4. **Check environment scope:**
   - Select **Production**, **Preview**, AND **Development**
   - Click **Save**

## Step 2: Verify RPC URL Format

Your Helius RPC URL should look like:
```
https://mainnet.helius-rpc.com/?api-key=4f2ffa37-a1ad-46ab-b5c5-dd4b67f6b8be
```

**Common mistakes:**
- ❌ Missing `?api-key=`
- ❌ Extra spaces
- ❌ Wrong network (using devnet URL for mainnet)
- ❌ Missing `https://`

## Step 3: Redeploy Your App

**CRITICAL:** After adding/updating environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**OR** trigger a new deployment by:
- Pushing a commit to GitHub
- Vercel will auto-deploy

## Step 4: Verify RPC is Being Used

After redeploy, check browser console (F12):

1. **Look for this log:**
   ```
   [getSolanaConnection] Using RPC: https://mainnet.helius-rpc.com/?api-key=***
   ```

2. **If you see fallback RPCs instead:**
   - Environment variables aren't being picked up
   - Check Step 1 again
   - Make sure you redeployed

## Step 5: Test Your RPC URL Directly

Test if your Helius RPC works:

```bash
curl -X POST "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

Should return:
```json
{"jsonrpc":"2.0","result":"ok","id":1}
```

If it fails, your API key might be invalid or expired.

## Step 6: Check Helius Dashboard

1. Go to https://www.helius.dev/
2. Login to your account
3. Check your project dashboard
4. Verify:
   - Project is **active**
   - You haven't exceeded **rate limits**
   - API key is **valid**

## Common Issues

### Issue 1: RPC Not Being Used

**Symptoms:**
- Logs show fallback RPCs
- Still getting 403 errors

**Solution:**
- Verify environment variables are set correctly
- **Redeploy** after setting variables
- Check variable names match exactly (case-sensitive)

### Issue 2: "Failed to fetch" Errors

**Symptoms:**
- RPC URL is correct
- But getting network errors

**Possible causes:**
- CORS issues (if accessing from browser)
- API key invalid/expired
- Rate limit exceeded
- Network connectivity issues

**Solution:**
- Test RPC URL directly (Step 5)
- Check Helius dashboard for rate limits
- Try regenerating API key

### Issue 3: Balance Check Fails

**Symptoms:**
- "You don't have any USDT" error
- But you know you have balance

**Solution:**
- This means your USDT token account doesn't exist yet
- You need to **receive** USDT first before you can send it
- Check your balance on Solscan to verify

## Quick Checklist

- [ ] Environment variables set in Vercel
- [ ] Variables enabled for all environments
- [ ] RPC URL format is correct
- [ ] App redeployed after setting variables
- [ ] Console shows Helius RPC being used
- [ ] Direct RPC test works
- [ ] Helius dashboard shows active project

## Still Not Working?

1. **Check browser console** for detailed logs
2. **Share the logs** - especially the `[getSolanaConnection]` and `[tryWithFallback]` messages
3. **Verify RPC URL** by testing directly (Step 5)
4. **Check Helius dashboard** for any issues

---

**Note:** The balance check I added will now catch the "no token account" issue BEFORE trying to send, so you'll get a clearer error message.

