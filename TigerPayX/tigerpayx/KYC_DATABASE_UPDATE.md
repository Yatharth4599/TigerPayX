# KYC Database Fields Update

## Summary
Added KYC-related fields to the `User` model in Prisma schema to persist KYC status in the database instead of only localStorage.

## Schema Changes

Added to `User` model in `prisma/schema.prisma`:

```prisma
// KYC/OnMeta verification
kycVerified          Boolean  @default(false)
kycVerifiedAt        DateTime?
kycStatus            String?  // "VERIFIED", "PENDING", "REJECTED", "NOT_VERIFIED"
onmetaKycRefNumber   String?  // Reference number from OnMeta KYC
onmetaAccessToken    String?  // Encrypted OnMeta access token
onmetaRefreshToken   String?  // Encrypted OnMeta refresh token
onmetaTokenExpiresAt DateTime? // When access token expires
```

## Benefits

1. **Persistence**: KYC status survives browser data clears
2. **Cross-device**: Works across different devices/browsers
3. **Server-side access**: Can check KYC status in API routes
4. **Analytics**: Query users by KYC status
5. **Audit trail**: Track when KYC was verified

## Next Steps

### 1. Create Migration

Run this command (when DATABASE_URL is set):

```bash
npx prisma migrate dev --name add_kyc_fields_to_user
```

Or create migration manually:

```bash
npx prisma migrate dev --name add_kyc_fields_to_user --create-only
```

Then apply to production:

```bash
npx prisma migrate deploy
```

### 2. Update Code to Sync KYC Status

Update these locations to sync KYC status to database:

#### A. After KYC Success (in `pages/dashboard.tsx`)

When KYC callback is received:

```typescript
// After setting localStorage
localStorage.setItem('onmeta_kyc_verified', 'true');
setOnMetaKYCStatus('VERIFIED');

// Also update database
await fetch('/api/user/update-kyc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    kycVerified: true,
    kycStatus: 'VERIFIED',
    kycVerifiedAt: new Date().toISOString(),
  }),
});
```

#### B. Create API Route: `pages/api/user/update-kyc.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await isAuthenticated(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { kycVerified, kycStatus, kycVerifiedAt, onmetaKycRefNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        kycVerified: kycVerified ?? undefined,
        kycStatus: kycStatus ?? undefined,
        kycVerifiedAt: kycVerifiedAt ? new Date(kycVerifiedAt) : undefined,
        onmetaKycRefNumber: onmetaKycRefNumber ?? undefined,
      },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update KYC error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
```

#### C. Load KYC Status on Login (in `pages/dashboard.tsx`)

On component mount or after login:

```typescript
// Load KYC status from database
useEffect(() => {
  const loadKYCStatus = async () => {
    try {
      const response = await fetch('/api/user/kyc-status');
      if (response.ok) {
        const data = await response.json();
        if (data.kycVerified) {
          setOnMetaKYCStatus('VERIFIED');
          localStorage.setItem('onmeta_kyc_verified', 'true');
        }
      }
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    }
  };
  
  if (isAuthenticated()) {
    loadKYCStatus();
  }
}, []);
```

#### D. Create API Route: `pages/api/user/kyc-status.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '@/utils/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await isAuthenticated(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        kycVerified: true,
        kycStatus: true,
        kycVerifiedAt: true,
        onmetaKycRefNumber: true,
      },
    });

    return res.status(200).json({
      success: true,
      kycVerified: dbUser?.kycVerified || false,
      kycStatus: dbUser?.kycStatus || 'NOT_VERIFIED',
      kycVerifiedAt: dbUser?.kycVerifiedAt,
      onmetaKycRefNumber: dbUser?.onmetaKycRefNumber,
    });
  } catch (error: any) {
    console.error('Get KYC status error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
```

### 3. Optional: Encrypt Tokens

If storing OnMeta tokens in database, encrypt them:

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY!), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY!), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

## Migration Status

- [x] Schema updated
- [ ] Migration created
- [ ] Migration applied to database
- [ ] Code updated to sync KYC status
- [ ] API routes created
- [ ] Tested locally
- [ ] Deployed to production

## Notes

- Tokens (`onmetaAccessToken`, `onmetaRefreshToken`) are optional - only add if you want to store them server-side
- Consider encrypting tokens if storing them
- `kycVerifiedAt` tracks when KYC was verified for audit purposes
- `onmetaKycRefNumber` can be used to check KYC status with OnMeta API

