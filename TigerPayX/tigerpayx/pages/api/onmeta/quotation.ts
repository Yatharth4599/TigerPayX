import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchTokenQuotation } from '@/utils/onmeta';

/**
 * OnMeta Fetch Token Quotation API Route
 * POST /api/onmeta/quotation
 * Fetches quotation for token purchase
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { buyTokenSymbol, chainId, fiatCurrency, fiatAmount, buyTokenAddress } = req.body;

    // Validation
    if (!buyTokenSymbol || typeof buyTokenSymbol !== 'string') {
      return res.status(400).json({ success: false, error: 'buyTokenSymbol is required and must be a string' });
    }

    if (!chainId || typeof chainId !== 'number') {
      return res.status(400).json({ success: false, error: 'chainId is required and must be a number' });
    }

    if (!fiatCurrency || typeof fiatCurrency !== 'string') {
      return res.status(400).json({ success: false, error: 'fiatCurrency is required and must be a string' });
    }

    if (!fiatAmount || typeof fiatAmount !== 'number' || fiatAmount <= 0) {
      return res.status(400).json({ success: false, error: 'fiatAmount is required and must be a positive number' });
    }

    if (!buyTokenAddress || typeof buyTokenAddress !== 'string') {
      return res.status(400).json({ success: false, error: 'buyTokenAddress is required and must be a string' });
    }

    console.log('OnMeta fetch quotation API route called:', {
      buyTokenSymbol,
      chainId,
      fiatCurrency,
      fiatAmount,
      buyTokenAddress: `${buyTokenAddress.slice(0, 10)}...`,
    });

    const result = await fetchTokenQuotation({
      buyTokenSymbol,
      chainId,
      fiatCurrency,
      fiatAmount,
      buyTokenAddress,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta fetch quotation API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
