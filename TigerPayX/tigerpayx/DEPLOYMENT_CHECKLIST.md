# Production Deployment Checklist

## Pre-Deployment Checks ✅

### 1. Build Verification
- [x] Build completed successfully
- [x] No TypeScript errors
- [x] All API routes compiled correctly

### 2. Code Changes Summary
- [x] Fixed OnMeta API response handling (chain-limits, tokens, currencies, order-history)
- [x] Improved UI/UX (toasts, loading states, form validation, mobile responsiveness)
- [x] Added copy-to-clipboard functionality
- [x] Added auto-refresh for pending orders
- [x] Improved empty states and status badges

## Environment Variables Required

Make sure these are set in Vercel:

### Required OnMeta Variables
```
ONMETA_CLIENT_ID=your-client-id
ONMETA_CLIENT_SECRET=your-client-secret
ONMETA_API_BASE_URL=https://stg.api.onmeta.in
```

### Required App URL
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
**Important**: Replace `your-app.vercel.app` with your actual Vercel deployment URL

### Database (if using)
```
DATABASE_URL=your-database-url
```

### Other Required Variables
```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Push your changes to GitHub
2. Go to Vercel Dashboard
3. Your project should auto-deploy
4. Check deployment logs for any errors

### Option 2: Deploy via Vercel CLI
```bash
cd tigerpayx
vercel --prod
```

## Post-Deployment Verification

### 1. Test OnMeta APIs
- [ ] Chain Limits API loads correctly
- [ ] Tokens API loads correctly
- [ ] Currencies API loads correctly
- [ ] Order History API works (requires authentication)

### 2. Test UI/UX Improvements
- [ ] Toast notifications appear instead of alerts
- [ ] Loading spinners show on buttons
- [ ] Skeleton loaders appear during data fetching
- [ ] Form validation shows inline errors
- [ ] Mobile responsiveness works correctly
- [ ] Copy buttons work for addresses/IDs

### 3. Test OnMeta Integration
- [ ] User can authenticate with OnMeta
- [ ] Deposit flow works end-to-end
- [ ] Withdrawal flow works (if implemented)
- [ ] KYC submission works
- [ ] Order status updates correctly
- [ ] Auto-refresh works for pending orders

### 4. Check Logs
- [ ] No errors in Vercel function logs
- [ ] API calls are successful
- [ ] Webhooks are being received (if configured)

## OnMeta Dashboard Configuration

### Redirect URLs (CRITICAL)
Add these URLs to OnMeta dashboard:
- `https://your-app.vercel.app/dashboard?onmeta_callback=true`
- `https://your-app.vercel.app/dashboard?onmeta_callback=true&type=kyc`
- `https://your-app.vercel.app/dashboard?onmeta_callback=true&type=withdrawal`

### Webhook URL (Optional)
- `https://your-app.vercel.app/api/onmeta/webhook`

## Troubleshooting

### If APIs fail:
1. Check environment variables in Vercel dashboard
2. Verify `ONMETA_CLIENT_ID` is correct
3. Check Vercel function logs for errors
4. Verify `NEXT_PUBLIC_APP_URL` is set correctly

### If redirects don't work:
1. Verify `NEXT_PUBLIC_APP_URL` matches your Vercel URL exactly
2. Check OnMeta dashboard has your URL whitelisted
3. Clear browser cache and try again

### If build fails:
1. Check Node.js version (should be >= 18)
2. Verify all dependencies are installed
3. Check Prisma schema is valid

## Rollback Plan

If something goes wrong:
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find the last working deployment
4. Click "..." → "Promote to Production"
