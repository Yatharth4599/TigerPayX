import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchKYCStatus } from '@/utils/onmeta';

/**
 * OnMeta Fetch KYC Status API Route
 * POST /api/onmeta/kyc-status
 * Fetches KYC verification status of a user by email
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const authHeader = req.headers.authorization;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    const accessToken = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : undefined;

    console.log('OnMeta fetch KYC status API route called:', { email, hasAccessToken: !!accessToken });

    const result = await fetchKYCStatus({
      email,
      accessToken,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch KYC status API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

