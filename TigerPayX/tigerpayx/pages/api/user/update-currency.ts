import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/auth-middleware';
import { convertFiatToFiat } from '@/utils/exchangeRates';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { preferredCurrency } = req.body;

    if (!preferredCurrency || !['INR', 'PHP', 'IDR', 'USD'].includes(preferredCurrency)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid currency. Must be one of: INR, PHP, IDR, USD' 
      });
    }

    // Get current user with current currency
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        fiatBalance: true,
        preferredCurrency: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // If currency is different, convert balance
    let newBalance = Number(user.fiatBalance || 0);
    if (user.preferredCurrency && user.preferredCurrency !== preferredCurrency) {
      try {
        newBalance = await convertFiatToFiat(
          Number(user.fiatBalance || 0),
          user.preferredCurrency,
          preferredCurrency
        );
      } catch (error: any) {
        console.error('Error converting currency:', error);
        // Continue with current balance if conversion fails
        newBalance = Number(user.fiatBalance || 0);
      }
    }

    // Update user currency and converted balance
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        preferredCurrency: preferredCurrency,
        fiatBalance: newBalance,
        currencyChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        preferredCurrency: true,
        fiatBalance: true,
        currencyChangedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating currency:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update currency',
    });
  }
}

export default withAuth(handler);

