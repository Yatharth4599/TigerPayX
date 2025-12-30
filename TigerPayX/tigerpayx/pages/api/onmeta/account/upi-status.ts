import type { NextApiRequest, NextApiResponse } from 'next';
import { onMetaGetUPIStatus } from '@/utils/onmeta';

/**
 * OnMeta Get UPI Status API Route
 * GET /api/onmeta/account/upi-status
 * Gets the status of linked UPI ID
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const refNumber = req.query.refNumber as string | undefined;

    console.log('OnMeta get UPI status API route called', { refNumber });

    const result = await onMetaGetUPIStatus(accessToken, refNumber);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta get UPI status API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
