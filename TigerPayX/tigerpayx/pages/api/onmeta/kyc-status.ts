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

    // Validate email - ensure it's a string and has @ symbol
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const emailStr = String(email).trim(); // Keep original email case as used during KYC
    if (typeof emailStr !== 'string' || !emailStr.includes('@') || emailStr.length < 5) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    const accessToken = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : undefined;

    console.log('OnMeta fetch KYC status API route called:', { email: emailStr, hasAccessToken: !!accessToken });

    const result = await fetchKYCStatus({
      email: emailStr,
      accessToken,
    });

    console.log('=== KYC Status API Route Result ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('result.success:', result.success);
    console.log('result.kycStatus:', result.kycStatus);
    console.log('result.isVerified:', result.isVerified);
    console.log('result.error:', result.error);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // Return 200 even if success is false, so frontend can see the status
      // OnMeta might return success: false but still have kycStatus
      return res.status(200).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch KYC status API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

