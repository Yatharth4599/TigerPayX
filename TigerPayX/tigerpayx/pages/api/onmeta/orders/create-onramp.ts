import type { NextApiRequest, NextApiResponse } from 'next';
import { createOnrampOrder } from '@/utils/onmeta';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * OnMeta Create Onramp Order API Route
 * POST /api/onmeta/orders/create-onramp
 * Creates an onramp order with payment mode and UPI/bank details
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
    const {
      buyTokenSymbol,
      chainId,
      fiatCurrency,
      fiatAmount,
      buyTokenAddress,
      receiverAddress,
      paymentMode,
      upiId,
      bankDetails,
      metaData,
      redirectUrl,
    } = req.body;

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

    if (!receiverAddress || typeof receiverAddress !== 'string') {
      return res.status(400).json({ success: false, error: 'receiverAddress is required and must be a string' });
    }

    if (!paymentMode || typeof paymentMode !== 'string') {
      return res.status(400).json({ success: false, error: 'paymentMode is required and must be a string' });
    }

    // Validate payment mode and required fields
    const isUPI = paymentMode.includes('UPI');
    const isIMPS = paymentMode.includes('IMPS');
    const isNEFT = paymentMode.includes('NEFT');

    if (isUPI && (!upiId || !upiId.upiId)) {
      return res.status(400).json({ success: false, error: 'upiId is required for UPI orders' });
    }

    if ((isIMPS || isNEFT) && !bankDetails) {
      return res.status(400).json({ success: false, error: 'bankDetails is required for IMPS/NEFT orders' });
    }

    console.log('OnMeta create onramp order API route called:', {
      buyTokenSymbol,
      chainId,
      fiatCurrency,
      fiatAmount,
      paymentMode,
      hasUPI: !!upiId,
      hasBankDetails: !!bankDetails,
    });

    const result = await createOnrampOrder({
      accessToken,
      buyTokenSymbol,
      chainId,
      fiatCurrency,
      fiatAmount,
      buyTokenAddress,
      receiverAddress,
      paymentMode,
      upiId,
      bankDetails,
      metaData,
      redirectUrl,
    });

    if (result.success && result.orderId) {
      // Store order in database if we have user email in metadata
      try {
        const userEmail = metaData?.email || metaData?.userEmail;
        if (userEmail) {
          const user = await prisma.user.findUnique({
            where: { email: userEmail },
          });

          if (user) {
            // Check if order already exists (might have been created by webhook)
            const existingOrder = await prisma.onMetaOrder.findUnique({
              where: { onmetaOrderId: result.orderId },
            });

            if (!existingOrder) {
              await prisma.onMetaOrder.create({
                data: {
                  onmetaOrderId: result.orderId,
                  userId: user.id,
                  orderType: 'onramp',
                  status: 'pending',
                  buyTokenSymbol: buyTokenSymbol,
                  buyTokenAddress: buyTokenAddress,
                  fiatCurrency: fiatCurrency.toUpperCase(),
                  fiatAmount: fiatAmount.toString(),
                  chainId: chainId,
                  paymentMode: paymentMode,
                  receiverWalletAddress: receiverAddress,
                  upiId: upiId?.upiId,
                  bankDetails: bankDetails ? JSON.parse(JSON.stringify(bankDetails)) : null,
                  metadata: metaData ? JSON.parse(JSON.stringify(metaData)) : null,
                },
              });
              console.log('✅ Stored order in database:', result.orderId);
            }
          }
        }
      } catch (dbError) {
        console.error('❌ Error storing order in database:', dbError);
        // Don't fail the request if database storage fails
        // The webhook will create the order later if needed
      }
    }

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta create onramp order API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
