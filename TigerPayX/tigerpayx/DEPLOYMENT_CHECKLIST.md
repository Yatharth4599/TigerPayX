# ✅ Vercel Deployment Checklist

## Before Redeploying

### 1. Environment Variables (CRITICAL)

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

#### Required:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Random 32+ character string
- [ ] `JWT_EXPIRES_IN` - `7d`
- [ ] `SOLANA_NETWORK` - `mainnet-beta`
- [ ] `NEXT_PUBLIC_SOLANA_NETWORK` - `mainnet-beta`
- [ ] `SOLANA_RPC_URL` - `https://api.mainnet-beta.solana.com`
- [ ] `SOLANA_DEVNET_RPC_URL` - `https://api.devnet.solana.com`
- [ ] `TT_TOKEN_MINT` - Your Tiger Token mint address
- [ ] `NODE_ENV` - `production` (Production only)

#### Optional (PayRam):
- [ ] `PAYRAM_API_URL` - Only if using PayRam
- [ ] `PAYRAM_API_KEY` - Only if using PayRam
- [ ] `NEXT_PUBLIC_PAYRAM_API_URL` - Only if using PayRam

**Important**: Set each variable for **Production**, **Preview**, and **Development** environments.

### 2. Database Setup

- [ ] PostgreSQL database created (Vercel Postgres, Supabase, Neon, etc.)
- [ ] `DATABASE_URL` environment variable set
- [ ] Database allows connections from Vercel

### 3. Code Fixes Applied

- [ ] `next.config.ts` - Removed `standalone` output
- [ ] `tailwind.config.ts` - Added for Tailwind v4
- [ ] `prisma.config.ts` - Fixed DATABASE_URL handling
- [ ] All changes pushed to GitHub

## After Deployment

### 1. Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check **Build Logs** for:
   - ✅ No errors
   - ✅ Prisma Client generated
   - ✅ CSS compiled successfully
   - ✅ Build completed successfully

### 2. Test the Site

1. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
   - Or use incognito mode

2. **Check UI**
   - [ ] Styling looks correct
   - [ ] Colors and gradients showing
   - [ ] Logo displays
   - [ ] Animations working

3. **Test Functionality**
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Dashboard loads
   - [ ] API calls work (check Network tab)

### 3. Browser Console Check

1. Open DevTools (F12)
2. Check **Console** tab:
   - [ ] No red errors
   - [ ] No missing environment variable errors
   - [ ] No API errors

3. Check **Network** tab:
   - [ ] CSS files loading (/_next/static/css/)
   - [ ] JavaScript files loading
   - [ ] API calls succeeding
   - [ ] Images loading

## Troubleshooting

### UI Looks Broken

**Symptoms**: No styling, plain HTML
**Fix**: 
- Clear browser cache
- Check if CSS files are loading in Network tab
- Verify build logs show CSS compilation

### Nothing Works / JavaScript Errors

**Symptoms**: Buttons don't work, API calls fail
**Fix**:
- Check browser console for errors
- Verify environment variables are set
- Check API routes are accessible
- Verify DATABASE_URL is correct

### Images Not Loading

**Symptoms**: Logo missing, broken images
**Fix**:
- Verify `/public/assets/logo.png` exists
- Check image paths in code
- Verify Next.js Image component is working

### Database Errors

**Symptoms**: Sign up/login fails, "Database error"
**Fix**:
- Verify `DATABASE_URL` is set correctly
- Check database allows connections
- Verify migrations ran successfully
- Check build logs for Prisma errors

## Quick Test Commands

After deployment, test these endpoints:

```bash
# Test homepage
curl https://tiger-pay-x.vercel.app/

# Test API (should return error without auth, but not 500)
curl https://tiger-pay-x.vercel.app/api/auth

# Check if CSS is loading
curl -I https://tiger-pay-x.vercel.app/_next/static/css/
```

## Success Criteria

✅ Build completes without errors
✅ Site loads with proper styling
✅ No console errors
✅ Sign up/login works
✅ Dashboard loads
✅ API calls succeed

---

**After fixing and redeploying, your site should work perfectly!** 🚀

