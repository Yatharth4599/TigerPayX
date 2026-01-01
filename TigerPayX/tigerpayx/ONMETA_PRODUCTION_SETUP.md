# OnMeta Production Setup Guide

## Issue Fixed
The code was using `localhost` URLs for OnMeta redirects and callbacks, which won't work in production. OnMeta requires production URLs to be configured in their dashboard.

## Changes Made
1. Updated `utils/onmeta.ts` to use `NEXT_PUBLIC_APP_URL` environment variable for redirect URLs
2. Updated `pages/dashboard.tsx` to use production URL instead of `window.location.origin`
3. Added helper function `getBaseUrl()` that prioritizes production URL from environment variables

## Required Setup Steps

### 1. Set Environment Variable
Add the following to your `.env.local` file (for local development) and Vercel environment variables (for production):

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Or if you have a custom domain:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Configure OnMeta Dashboard

#### Redirect URLs (REQUIRED)
**This is the most important step!** OnMeta needs to know where to redirect users after payment. The following URLs will be automatically used:
- **Deposit/Onramp Callback**: `https://your-app.vercel.app/dashboard?onmeta_callback=true`
- **KYC Callback**: `https://your-app.vercel.app/dashboard?onmeta_callback=true&type=kyc`
- **Withdrawal Callback**: `https://your-app.vercel.app/dashboard?onmeta_callback=true&type=withdrawal`

**Action Required**: 
- Look for "Redirect URLs", "Callback URLs", "Whitelist URLs", or "Allowed URLs" in your OnMeta dashboard
- Add/whitelist your production domain (e.g., `https://your-app.vercel.app`)
- If you can't find this setting, contact OnMeta support - they may need to whitelist it on their end

#### Webhook URL (Optional)
**Note**: Webhooks may not be configurable in the OnMeta dashboard, or they might be optional. The webhook endpoint is already set up in your code at `/api/onmeta/webhook`, but it's not required for basic functionality.

If OnMeta supports webhooks and you need to configure them:
- Contact OnMeta support to enable webhooks for your account
- The webhook endpoint URL would be: `https://your-app.vercel.app/api/onmeta/webhook`
- Webhooks provide real-time order status updates, but you can also poll for order status using the API

**Important**: The redirect URLs (above) are what's **critical** for the integration to work. Webhooks are optional and provide additional real-time updates.

### 3. Verify Environment Variables
Ensure these are set in your production environment (Vercel):
- `NEXT_PUBLIC_APP_URL` - Your production app URL
- `ONMETA_CLIENT_ID` - Your OnMeta API client ID
- `ONMETA_CLIENT_SECRET` - Your OnMeta API client secret (for webhook verification)
- `ONMETA_API_BASE_URL` - OnMeta API base URL (defaults to `https://stg.api.onmeta.in`)

### 4. Test the Integration
1. Deploy your app to production
2. Test creating a deposit order
3. Verify that OnMeta redirects back to your production URL after payment
4. Check that webhooks are being received (check Vercel logs)

## How It Works

### Development (Localhost)
- If `NEXT_PUBLIC_APP_URL` is not set, the code falls back to `window.location.origin` (localhost)
- This allows local development to work
- **Note**: OnMeta callbacks won't work in localhost - you need to test in production

### Production
- The code uses `NEXT_PUBLIC_APP_URL` environment variable
- All redirect URLs and callbacks use the production URL
- OnMeta can successfully redirect users back to your app

## Troubleshooting

### Callbacks not working
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in production
- Check that the URL is whitelisted in OnMeta dashboard
- Ensure the URL matches exactly (including https://)

### Webhooks not received (Optional - not critical)
- Webhooks are optional - your app can work without them
- Order status can be checked via API polling (using the "Fetch Order Status" feature in your dashboard)
- If you need webhooks, contact OnMeta support to enable them
- Check that `ONMETA_CLIENT_SECRET` is set correctly if webhooks are enabled

### Still seeing localhost URLs
- Clear browser cache
- Rebuild and redeploy the application
- Verify environment variables are set in Vercel dashboard
- Check that `NEXT_PUBLIC_APP_URL` starts with `https://` (not `http://`)

