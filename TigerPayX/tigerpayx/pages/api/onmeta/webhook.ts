import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

/**
 * OnMeta Webhook Handler
 * This endpoint receives callbacks from OnMeta when order status changes
 * Configure this URL in your OnMeta dashboard: https://yourdomain.com/api/onmeta/webhook
 * 
 * Webhook events: fiatPending, orderReceived, fiatReceived, transferred, completed, expired
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify HMAC signature
    const signature = req.headers['x-onmeta-signature'] as string;
    const apiSecret = process.env.ONMETA_CLIENT_SECRET || '';
    
    if (!signature) {
      console.error('Missing X-Onmeta-Signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Compute HMAC signature
    const payload = JSON.stringify(req.body);
    const computedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(payload)
      .digest('hex');

    // Verify signature
    if (signature !== computedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const webhookData = req.body;
    console.log('OnMeta webhook received:', webhookData);

    // Verify webhook signature if OnMeta provides one
    // const signature = req.headers['x-onmeta-signature'];
    // if (signature) {
    //   // Verify signature here
    // }

    // Extract order information from OnMeta webhook
    const {
      orderId,
      status,
      eventType,
      fiat,
      receiverWalletAddress,
      buyTokenSymbol,
      buyTokenAddress,
      currency,
      chainId,
      txnHash,
      transferredAmount,
      transferredAmountWei,
      customer,
      createdAt,
    } = webhookData;

    console.log('Processing OnMeta webhook:', {
      orderId,
      status,
      eventType,
      fiat,
      currency,
      receiverWalletAddress: receiverWalletAddress?.slice(0, 8) + '...',
      buyTokenSymbol,
      chainId,
    });

    // Handle different webhook event types
    switch (eventType) {
      case 'fiatPending':
        console.log('Order fiat payment pending:', orderId);
        // User has initiated order but fiat deposit is pending
        // Update order status in your database
        break;

      case 'orderReceived':
        console.log('Order received and payment completed:', orderId);
        // User completed payment, OnMeta initiated crypto transfer
        // Update order status
        break;

      case 'fiatReceived':
        console.log('Fiat payment confirmed received:', orderId);
        // OnMeta confirmed receipt of payment
        // Update order status
        break;

      case 'transferred':
        console.log('Tokens transferred on blockchain:', orderId, 'Txn:', txnHash);
        // Token transfer confirmed on blockchain
        // Update order status, notify user
        break;

      case 'completed':
        console.log('Order completed successfully:', orderId);
        console.log('Transaction details:', {
          txnHash,
          transferredAmount,
          transferredAmountWei,
          receiverWalletAddress,
        });
        // Order fully completed
        // Update order status, credit user's account, send notification
        // You can access metadata.conversionRate and metadata.commission here
        break;

      case 'expired':
        console.log('Order expired:', orderId);
        // Order expired (pending > 3 hours)
        // Update order status, notify user
        break;

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('OnMeta webhook error:', error);
    // Still return 200 to prevent OnMeta from retrying
    return res.status(200).json({ received: true, error: error.message });
  }
}
