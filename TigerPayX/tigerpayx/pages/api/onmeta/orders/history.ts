import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchOrderHistory } from '@/utils/onmeta';

/**
 * OnMeta Fetch Order History API Route
 * GET /api/onmeta/orders/history
 * Fetches user's order history with pagination
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
      return res.status(401).json({ success: false, error: 'Access token required in Authorization header' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    // Validate skip parameter
    if (isNaN(skip) || skip < 0) {
      return res.status(400).json({ success: false, error: 'skip parameter must be a non-negative integer' });
    }

    console.log('OnMeta fetch order history API route called:', {
      skip,
    });

    const result = await fetchOrderHistory({
      accessToken,
      skip,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // Order history is optional - return 200 with empty array instead of 400
      // This prevents errors when the endpoint doesn't exist
      return res.status(200).json({
        success: true,
        orders: [],
        transactions: [],
        hasMore: false,
        skip: skip,
        error: result.error || 'Order history not available',
      });
    }
  } catch (error: any) {
    console.error('OnMeta fetch order history API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
