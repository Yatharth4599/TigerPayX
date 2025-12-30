import type { NextApiRequest, NextApiResponse } from 'next';
import { onMetaRefreshToken } from '@/utils/onmeta';

/**
 * OnMeta Refresh Token API Route
 * GET /api/onmeta/auth/refresh
 * Refreshes the access token using refresh token
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
      return res.status(401).json({ success: false, error: 'Refresh token required in Authorization header' });
    }

    const refreshToken = authHeader.replace('Bearer ', '');

    console.log('OnMeta refresh token API route called');

    const result = await onMetaRefreshToken(refreshToken);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta refresh token API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
