# KYC Callback URL Configuration Guide

## Understanding the Two Types of Callbacks

### 1. Widget Redirect URLs (User-facing)
These are the URLs the **KYC widget** redirects users to after completion:
- **Success**: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc&status=success`
- **Failure**: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc&status=failure`

**These are automatically set** in the widget URL when the user clicks "Start KYC Verification". You don't need to configure these in OnMeta dashboard.

### 2. Webhook Callback URL (Server-to-server)
This is the URL OnMeta sends **webhook events** to (server-to-server):
- **Current**: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc`
- **Recommended**: `https://tigerpayx.com/api/onmeta/webhook`

## Current Setup Analysis

### What You Have in OnMeta Dashboard:
```
Callback URL: https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc
```

### What the Code Uses:
- **Widget redirects**: Automatically includes `status=success` or `status=failure`
- **Webhook handler**: `/api/onmeta/webhook`

## Recommendation

### Option 1: Keep Current (Works for Widget Redirects)
**Keep**: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc`

**Pros:**
- Works for widget redirects
- Simple setup

**Cons:**
- Webhooks might not work properly (webhooks should go to API endpoint)
- Mixing user redirects with webhook callbacks

### Option 2: Use Separate URLs (Recommended)
**For Widget Redirects** (in widget URL - already handled):
- Success: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc&status=success`
- Failure: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc&status=failure`

**For Webhooks** (in OnMeta dashboard):
- Change to: `https://tigerpayx.com/api/onmeta/webhook`

**Pros:**
- Proper separation of concerns
- Webhooks go to dedicated API endpoint
- Better for handling webhook events

## What to Do

### If You Want Webhooks (Recommended):
1. **Change callback URL in OnMeta dashboard to:**
   ```
   https://tigerpayx.com/api/onmeta/webhook
   ```
2. **Keep widget redirects as-is** (they're handled automatically in the code)

### If You Don't Need Webhooks:
**Keep current**: `https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc`

The widget redirects will still work because they use the `successRedirectUrl` and `failureRedirectUrl` parameters in the widget URL itself.

## How It Works

### Widget Flow:
1. User clicks "Start KYC Verification"
2. Widget opens with redirect URLs: `?type=kyc&status=success` or `?type=kyc&status=failure`
3. After KYC completion, widget redirects to dashboard
4. Dashboard shows toast notification

### Webhook Flow (if configured):
1. OnMeta sends webhook event to `/api/onmeta/webhook`
2. Webhook handler processes the event
3. Updates database if needed
4. Can trigger notifications

## Current Status

✅ **Widget redirects**: Already working (handled in code)
✅ **Dashboard callback handling**: Already working
⚠️ **Webhook callbacks**: May need URL change if you want webhooks

## Recommendation

**Keep the current callback URL** (`https://tigerpayx.com/dashboard?onmeta_callback=true&type=kyc`) for now. It works for widget redirects.

**If you want webhooks**, change it to `https://tigerpayx.com/api/onmeta/webhook` in OnMeta dashboard.

The widget redirects will work either way because they use the redirect URLs passed in the widget URL itself.

