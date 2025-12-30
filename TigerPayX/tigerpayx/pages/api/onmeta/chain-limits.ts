import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchChainLimits } from '@/utils/onmeta';

/**
 * OnMeta Fetch Chain-wise Limits API Route
 * GET /api/onmeta/chain-limits
 * Fetches Min/Max fiat limits for each chain
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('OnMeta fetch chain limits API route called');

    const result = await fetchChainLimits();

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch chain limits API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
