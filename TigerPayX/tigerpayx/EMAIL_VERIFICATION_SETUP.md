# Email Verification Setup Guide

## Overview

TigerPayX now requires email verification (OTP) for all new signups. This ensures account security and prevents fake accounts.

## Features

- ✅ 6-digit OTP sent via email
- ✅ 10-minute expiration
- ✅ Resend OTP functionality
- ✅ Email verification required before login
- ✅ Supports multiple email services

## Database Migration

After deploying, you need to run a database migration to add the new fields:

```bash
npx prisma migrate dev --name add_email_verification
```

Or in production:
```bash
npx prisma migrate deploy
```

## Email Service Configuration

The system supports three email service providers:

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to environment variables:

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=TigerPayX <noreply@yourdomain.com>
```

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to environment variables:

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Development Mode

In development, emails are logged to console instead of being sent:

```env
EMAIL_SERVICE=resend  # or any value
# No API key needed - emails will be logged
```

## Environment Variables

Add these to your Vercel environment variables:

- `EMAIL_SERVICE` - `resend`, `sendgrid`, or `smtp`
- `RESEND_API_KEY` - (if using Resend)
- `SENDGRID_API_KEY` - (if using SendGrid)
- `EMAIL_FROM` - Sender email address

## How It Works

1. **Signup Flow:**
   - User signs up with email and password
   - System generates 6-digit OTP
   - OTP is sent to user's email
   - User enters OTP to verify email
   - Account is activated and user is logged in

2. **Login Flow:**
   - If email is not verified, user is prompted to verify
   - OTP can be resent if needed
   - Once verified, user can log in normally

3. **Security:**
   - OTP expires in 10 minutes
   - OTP is stored hashed in database
   - Email must be verified before accessing dashboard

## Testing

In development mode (without email service configured), OTPs are logged to the console. Check your server logs to see the OTP code.

## Notes

- Email verification is required for account security
- Wallet creation is still client-side (non-custodial)
- Email verification only affects account access, not wallet functionality
- Users can resend OTP if they don't receive it

