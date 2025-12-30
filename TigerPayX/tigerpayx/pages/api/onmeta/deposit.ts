import type { NextApiRequest, NextApiResponse } from 'next';
import { createDepositOrder } from '@/utils/onmeta';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { fiatCurrency, fiatAmount, cryptoCurrency, walletAddress, userId, redirectUrl } = req.body;

    // Validation
    if (!fiatCurrency || !['INR', 'PHP', 'IDR'].includes(fiatCurrency)) {
      return res.status(400).json({ success: false, error: 'Invalid fiat currency. Must be INR, PHP, or IDR' });
    }

    if (!fiatAmount || typeof fiatAmount !== 'number' || fiatAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid fiat amount' });
    }

    if (!cryptoCurrency) {
      return res.status(400).json({ success: false, error: 'Crypto currency is required' });
    }

    if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Wallet address is required' });
    }

    console.log('OnMeta deposit API route called:', {
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      walletAddress: walletAddress.slice(0, 8) + '...',
      userId,
    });

    // Create deposit order via OnMeta API
    const result = await createDepositOrder({
      fiatCurrency,
      fiatAmount,
      cryptoCurrency,
      walletAddress: walletAddress.trim(),
      userId,
      redirectUrl,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta deposit API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
