import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllExchangeRates, getExchangeRate, updateAllExchangeRates } from '@/utils/exchangeRates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { fromCurrency, toCurrency } = req.query;

      // If specific currency pair requested
      if (fromCurrency && toCurrency) {
        const rate = await getExchangeRate(
          fromCurrency as string,
          toCurrency as string
        );
        return res.status(200).json({
          success: true,
          fromCurrency: fromCurrency as string,
          toCurrency: toCurrency as string,
          rate: rate,
        });
      }

      // Return all exchange rates
      const rates = await getAllExchangeRates();
      return res.status(200).json({
        success: true,
        rates: rates,
      });
    } catch (error: any) {
      console.error('Error fetching exchange rates:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch exchange rates',
      });
    }
  }

  if (req.method === 'POST') {
    // Update all exchange rates (for cron job or manual trigger)
    try {
      await updateAllExchangeRates();
      const rates = await getAllExchangeRates();
      return res.status(200).json({
        success: true,
        message: 'Exchange rates updated successfully',
        rates: rates,
      });
    } catch (error: any) {
      console.error('Error updating exchange rates:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update exchange rates',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

