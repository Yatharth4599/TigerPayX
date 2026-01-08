import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/auth-middleware';

type UpdateKYCRequest = {
  kycVerified?: boolean;
  kycStatus?: string;
  kycVerifiedAt?: string;
  onmetaKycRefNumber?: string;
  onmetaAccessToken?: string;
  onmetaRefreshToken?: string;
  onmetaTokenExpiresAt?: string;
};

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      kycVerified,
      kycStatus,
      kycVerifiedAt,
      onmetaKycRefNumber,
      onmetaAccessToken,
      onmetaRefreshToken,
      onmetaTokenExpiresAt,
    } = req.body as UpdateKYCRequest;

    const updateData: any = {};

    if (kycVerified !== undefined) {
      updateData.kycVerified = kycVerified;
    }

    if (kycStatus !== undefined) {
      updateData.kycStatus = kycStatus;
    }

    if (kycVerifiedAt !== undefined) {
      updateData.kycVerifiedAt = kycVerifiedAt ? new Date(kycVerifiedAt) : null;
    }

    if (onmetaKycRefNumber !== undefined) {
      updateData.onmetaKycRefNumber = onmetaKycRefNumber || null;
    }

    if (onmetaAccessToken !== undefined) {
      updateData.onmetaAccessToken = onmetaAccessToken || null;
    }

    if (onmetaRefreshToken !== undefined) {
      updateData.onmetaRefreshToken = onmetaRefreshToken || null;
    }

    if (onmetaTokenExpiresAt !== undefined) {
      updateData.onmetaTokenExpiresAt = onmetaTokenExpiresAt ? new Date(onmetaTokenExpiresAt) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        kycVerified: true,
        kycStatus: true,
        kycVerifiedAt: true,
        onmetaKycRefNumber: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'KYC status updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update KYC error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
    });
  }
}

export default withAuth(handler);

