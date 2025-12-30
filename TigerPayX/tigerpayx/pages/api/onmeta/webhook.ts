import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * OnMeta Webhook Handler
 * This endpoint receives callbacks from OnMeta when order status changes
 * Configure this URL in your OnMeta dashboard: https://yourdomain.com/api/onmeta/webhook
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;
    console.log('OnMeta webhook received:', webhookData);

    // Verify webhook signature if OnMeta provides one
    // const signature = req.headers['x-onmeta-signature'];
    // if (signature) {
    //   // Verify signature here
    // }

    // Extract order information
    const { orderId, order_id, status, transactionId, transaction_id, eventType, event_type } = webhookData;

    const order = orderId || order_id;
    const transaction = transactionId || transaction_id;
    const event = eventType || event_type || 'order.updated';

    console.log('Processing webhook:', {
      order,
      transaction,
      status,
      event,
    });

    // Handle different event types
    switch (event) {
      case 'order.completed':
      case 'deposit.completed':
        // Handle successful deposit
        console.log('Deposit completed for order:', order);
        // Update your database, send notifications, etc.
        break;

      case 'order.failed':
      case 'deposit.failed':
        // Handle failed deposit
        console.log('Deposit failed for order:', order);
        // Update your database, send notifications, etc.
        break;

      case 'withdrawal.completed':
        // Handle successful withdrawal
        console.log('Withdrawal completed for order:', order);
        break;

      case 'withdrawal.failed':
        // Handle failed withdrawal
        console.log('Withdrawal failed for order:', order);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('OnMeta webhook error:', error);
    // Still return 200 to prevent OnMeta from retrying
    return res.status(200).json({ received: true, error: error.message });
  }
}
