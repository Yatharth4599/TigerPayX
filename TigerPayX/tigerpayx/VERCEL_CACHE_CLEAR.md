# Clear Vercel Build Cache

If the production site still doesn't match localhost after the latest changes, you need to **clear Vercel's build cache**:

## Steps to Clear Cache:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your TigerPayX project**
3. **Go to Settings → General**
4. **Scroll down to "Build & Development Settings"**
5. **Click "Clear Build Cache"** (if available)
6. **OR manually redeploy**:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - **IMPORTANT**: Uncheck **"Use existing Build Cache"**
   - Click **"Redeploy"**

## Why This Is Needed:

Vercel caches build outputs, and sometimes old CSS builds get cached even after code changes. Clearing the cache forces a fresh build with the new Tailwind v3 configuration.

## After Clearing Cache:

- Wait for the new deployment to complete (2-3 minutes)
- Check your production site
- It should now match localhost exactly

---

**The latest changes include:**
- ✅ Tailwind v3 properly configured
- ✅ Safelist for all custom classes
- ✅ @layer directives for proper CSS processing
- ✅ CommonJS PostCSS config for Vercel compatibility

