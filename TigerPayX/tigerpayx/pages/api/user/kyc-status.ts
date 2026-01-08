import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/auth-middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        kycVerified: true,
        kycStatus: true,
        kycVerifiedAt: true,
        onmetaKycRefNumber: true,
      },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      kycVerified: dbUser.kycVerified || false,
      kycStatus: dbUser.kycStatus || 'NOT_VERIFIED',
      kycVerifiedAt: dbUser.kycVerifiedAt,
      onmetaKycRefNumber: dbUser.onmetaKycRefNumber,
    });
  } catch (error: any) {
    console.error('Get KYC status error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
    });
  }
}

export default withAuth(handler);

