import type { NextApiRequest, NextApiResponse } from 'next';
import { updateAllExchangeRates, getAllExchangeRates } from '@/utils/exchangeRates';

/**
 * API endpoint to update exchange rates
 * Can be called by cron job or manually
 * Should be protected in production
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Optional: Add authentication check here
    // const authHeader = req.headers.authorization;
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return res.status(401).json({ success: false, error: 'Unauthorized' });
    // }

    console.log('Updating exchange rates...');
    await updateAllExchangeRates();
    
    const rates = await getAllExchangeRates();
    
    return res.status(200).json({
      success: true,
      message: 'Exchange rates updated successfully',
      rates: rates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating exchange rates:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update exchange rates',
    });
  }
}

