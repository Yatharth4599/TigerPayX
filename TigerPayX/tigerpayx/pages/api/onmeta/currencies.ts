import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchSupportedCurrencies } from '@/utils/onmeta';

/**
 * OnMeta Fetch Supported Currencies API Route
 * GET /api/onmeta/currencies
 * Fetches list of supported currencies and their payment modes
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('OnMeta fetch supported currencies API route called');

    const result = await fetchSupportedCurrencies();

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch supported currencies API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
