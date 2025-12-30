import type { NextApiRequest, NextApiResponse } from 'next';
import { onMetaLinkBankAccount } from '@/utils/onmeta';

/**
 * OnMeta Link Bank Account API Route
 * POST /api/onmeta/account/link-bank
 * Links user bank account with OnMeta
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { name, panNumber, email, kycVerified, bankDetails, phone } = req.body;

    // Validation
    if (!name || !panNumber || !email || typeof kycVerified !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, panNumber, email, kycVerified' });
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.accountHolderName) {
      return res.status(400).json({ success: false, error: 'Bank details incomplete' });
    }

    if (!phone || !phone.countryCode || !phone.number) {
      return res.status(400).json({ success: false, error: 'Phone number required' });
    }

    console.log('OnMeta link bank API route called:', {
      email,
      hasAccessToken: !!accessToken,
    });

    const result = await onMetaLinkBankAccount({
      accessToken,
      name,
      panNumber,
      email,
      kycVerified,
      bankDetails,
      phone,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta link bank API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
