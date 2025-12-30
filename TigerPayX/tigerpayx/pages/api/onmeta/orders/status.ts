import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchOrderStatus } from '@/utils/onmeta';

/**
 * OnMeta Fetch Order Status API Route
 * POST /api/onmeta/orders/status
 * Fetches order status using order ID
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
      return res.status(401).json({ success: false, error: 'Access token required in Authorization header' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { orderId } = req.body;

    // Validation
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, error: 'orderId is required and must be a string' });
    }

    console.log('OnMeta fetch order status API route called:', {
      orderId,
    });

    const result = await fetchOrderStatus({
      accessToken,
      orderId,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch order status API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
