import type { NextApiRequest, NextApiResponse } from 'next';
import { createKYCRequest } from '@/utils/onmeta';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, redirectUrl } = req.body;

    console.log('OnMeta KYC API route called:', {
      userId,
    });

    // Create KYC request via OnMeta API
    const result = await createKYCRequest({
      userId,
      redirectUrl,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta KYC API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
