import type { NextApiRequest, NextApiResponse } from 'next';
import { onMetaLinkUPI } from '@/utils/onmeta';

/**
 * OnMeta Link UPI ID API Route
 * POST /api/onmeta/account/link-upi
 * Links user UPI ID with OnMeta
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
    const { name, email, upiId, phone } = req.body;

    // Validation
    if (!name || !email || !upiId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, email, upiId' });
    }

    // Validate UPI ID format (should contain @)
    if (!upiId.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid UPI ID format. Should be like: bank@upi' });
    }

    console.log('OnMeta link UPI API route called:', {
      email,
      upiId,
    });

    const result = await onMetaLinkUPI({
      accessToken,
      name,
      email,
      upiId,
      phone,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta link UPI API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
