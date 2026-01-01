# OnMeta KYC Widget Integration

## Overview
The KYC functionality now uses OnMeta's KYC widget instead of a custom form. This provides a better user experience with face matching and automated verification.

## What Was Implemented

### 1. KYC Widget Integration
- **Widget URL**: `https://platform.onmeta.in/kyc/?apiKey={apiKey}&successRedirectUrl={successUrl}&failureRedirectUrl={failureUrl}`
- Opens in a popup window (800x600)
- Handles success and failure redirects automatically

### 2. KYC Status Checking
- New API endpoint: `/api/onmeta/kyc-status`
- Fetches KYC verification status by email
- Shows status: VERIFIED, PENDING, REJECTED

### 3. Callback Handling
- Handles KYC success/failure callbacks
- Automatically fetches updated KYC status after successful verification
- Shows appropriate toast notifications

## Environment Variables Required

### For KYC Widget (Client-side)
```
NEXT_PUBLIC_ONMETA_CLIENT_ID=2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4
```

**Note**: This is optional. The code currently uses the production API key directly. For better security, set this in Vercel.

### For KYC Status API (Server-side)
```
ONMETA_CLIENT_ID=2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4
ONMETA_API_BASE_URL=https://api.platform.onmeta.in
```

## How It Works

### 1. User Clicks "Start KYC Verification"
- Opens OnMeta KYC widget in a popup
- Widget URL includes:
  - API key
  - Success redirect URL
  - Failure redirect URL

### 2. User Completes KYC in Widget
- OnMeta handles:
  - Face verification
  - ID document verification
  - Face matching with ID photo
  - If face doesn't match → Manual KYC (processed within 24hrs)

### 3. Callback Handling
- On success: Redirects to `/dashboard?onmeta_callback=true&type=kyc&status=success`
- On failure: Redirects to `/dashboard?onmeta_callback=true&type=kyc&status=failure`
- Dashboard shows appropriate toast notification
- Automatically fetches updated KYC status

### 4. Check KYC Status
- User can click "Check KYC Status" button
- Fetches current KYC status from OnMeta
- Shows status in toast notification

## Webhook Setup (Optional)

If you want to receive webhook events for KYC:

1. Go to OnMeta Dashboard
2. Set callback URL: `https://your-app.vercel.app/api/onmeta/webhook`
3. Webhook events will be received at `/api/onmeta/webhook`

Webhook events for KYC:
- KYC verification status updates
- Manual KYC processing updates

## Production URLs

- **KYC Widget**: `https://platform.onmeta.in/kyc/`
- **KYC Status API**: `https://api.platform.onmeta.in/v1/users/kyc-status`
- **API Key**: `2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4` (Production)

## Testing

1. Click "Start KYC Verification" button
2. Complete KYC in the widget
3. Check redirect back to dashboard
4. Verify toast notification appears
5. Click "Check KYC Status" to verify status

## Notes

- The widget handles all KYC verification steps
- Face matching is automatic
- If face doesn't match ID, goes to manual review (24hrs)
- All webhook events can be captured if webhook URL is configured

