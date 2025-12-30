import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchSupportedTokens } from '@/utils/onmeta';

/**
 * OnMeta Fetch Supported Tokens API Route
 * GET /api/onmeta/tokens
 * Fetches list of enabled tokens for the API key
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('OnMeta fetch tokens API route called');

    const result = await fetchSupportedTokens();

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch tokens API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
