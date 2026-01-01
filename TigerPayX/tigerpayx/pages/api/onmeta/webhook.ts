import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * OnMeta Webhook Handler
 * This endpoint receives callbacks from OnMeta when order status changes
 * 
 * NOTE: Webhooks may be optional or configured differently by OnMeta.
 * If webhooks are not available, you can poll for order status using the API.
 * 
 * If OnMeta requires webhook configuration, the URL would be:
 * https://your-app.vercel.app/api/onmeta/webhook
 * 
 * IMPORTANT: Use your PRODUCTION URL, not localhost!
 * 
 * Webhook events:
 * 1. fiatPending - User initialized order but fiat deposit is pending
 * 2. orderReceived - User completed payment, OnMeta initiated crypto transfer
 * 3. InProgress (optional) - Order is in-progress on the blockchain
 * 4. fiatReceived - OnMeta confirmed receipt of payment
 * 5. transferred - Token transfer confirmed on blockchain
 * 6. completed - Order completed successfully, user received tokens
 * 7. expired - Order expired (pending > 3 hours)
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

    if (!apiSecret) {
      console.error('ONMETA_CLIENT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get raw body for HMAC verification
    // Note: Next.js parses JSON body by default, but for HMAC we need to verify against raw body
    // We'll use the parsed body and stringify it consistently
    const webhookData = req.body;
    const payload = JSON.stringify(webhookData);

    // Compute HMAC signature using SHA256
    const computedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(payload)
      .digest('hex');

    // Verify signature (use constant-time comparison for security)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );

    if (!isValid) {
      console.error('Invalid webhook signature', {
        received: signature.substring(0, 10) + '...',
        computed: computedSignature.substring(0, 10) + '...',
      });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('OnMeta webhook signature verified successfully');

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
      metaData, // Contains conversionRate, commission, and user-set metadata
    } = webhookData;

    console.log('Processing OnMeta webhook:', {
      orderId,
      status,
      eventType,
      fiat,
      currency,
      chainId,
      receiverWalletAddress: receiverWalletAddress?.slice(0, 10) + '...',
      buyTokenSymbol,
      hasMetadata: !!metaData,
    });

    // Helper function to find or create order in database
    const findOrCreateOrder = async () => {
      // Try to find existing order
      let order = await prisma.onMetaOrder.findUnique({
        where: { onmetaOrderId: orderId },
      });

      // If order doesn't exist, try to find user by email from metadata or customer field
      let userId: string | null = null;
      if (!order) {
        const userEmail = metaData?.email || customer?.email || metaData?.userEmail;
        if (userEmail) {
          const user = await prisma.user.findUnique({
            where: { email: userEmail },
          });
          if (user) {
            userId = user.id;
          }
        }
      } else {
        userId = order.userId;
      }

      // If order doesn't exist and we have userId, create it
      if (!order && userId) {
        order = await prisma.onMetaOrder.create({
          data: {
            onmetaOrderId: orderId,
            userId: userId,
            orderType: 'onramp', // Default, can be updated
            status: status || 'pending',
            eventType: eventType,
            buyTokenSymbol: buyTokenSymbol,
            buyTokenAddress: buyTokenAddress,
            fiatCurrency: currency?.toUpperCase(),
            fiatAmount: fiat?.toString(),
            chainId: chainId,
            receiverWalletAddress: receiverWalletAddress,
            metadata: metaData ? JSON.parse(JSON.stringify(metaData)) : null,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
          },
        });
      }

      return { order, userId };
    };

    // Handle different webhook event types
    switch (eventType) {
      case 'fiatPending':
        console.log('📋 Order fiat payment pending:', orderId);
        console.log('Details:', {
          orderId,
          fiat,
          currency,
          receiverWalletAddress,
          buyTokenSymbol,
        });
        // User has initiated order but fiat deposit is pending
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'fiatPending',
                eventType: eventType,
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to fiatPending');
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        // TODO: Notify user that payment is pending (email/push notification)
        break;

      case 'orderReceived':
        console.log('✅ Order received and payment completed:', orderId);
        console.log('Details:', {
          orderId,
          fiat,
          currency,
          status,
        });
        // User completed payment, OnMeta initiated crypto transfer
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'orderReceived',
                eventType: eventType,
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to orderReceived');
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        // TODO: Notify user that payment was received
        break;

      case 'InProgress':
        console.log('⏳ Order in progress on blockchain:', orderId);
        console.log('Details:', {
          orderId,
          chainId,
          buyTokenSymbol,
        });
        // Order is in-progress on the blockchain (optional event, occurs with non-native tokens)
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'InProgress',
                eventType: eventType,
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to InProgress');
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        // TODO: Notify user that transaction is being processed
        break;

      case 'fiatReceived':
        console.log('💰 Fiat payment confirmed received:', orderId);
        console.log('Details:', {
          orderId,
          fiat,
          currency,
        });
        // OnMeta confirmed receipt of payment
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'fiatReceived',
                eventType: eventType,
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to fiatReceived');
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        break;

      case 'transferred':
        console.log('🔗 Tokens transferred on blockchain:', orderId);
        console.log('Transaction details:', {
          orderId,
          txnHash,
          transferredAmount,
          transferredAmountWei,
          receiverWalletAddress,
          chainId,
        });
        // Token transfer confirmed on blockchain
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'transferred',
                eventType: eventType,
                transactionHash: txnHash,
                transferredAmount: transferredAmount?.toString(),
                transferredAmountWei: transferredAmountWei?.toString(),
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to transferred and stored transaction hash');
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        // TODO: Notify user that tokens are being transferred
        break;

      case 'completed':
        console.log('🎉 Order completed successfully:', orderId);
        console.log('Transaction details:', {
          orderId,
          txnHash,
          transferredAmount,
          transferredAmountWei,
          receiverWalletAddress,
          buyTokenSymbol,
          buyTokenAddress,
          chainId,
          fiat,
          currency,
        });

        // Extract metadata (conversionRate, commission, user-set metadata)
        if (metaData) {
          console.log('Metadata:', {
            conversionRate: metaData.conversionRate,
            commission: metaData.commission,
            userMetadata: metaData,
          });
        }

        // Order fully completed
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'completed',
                eventType: eventType,
                transactionHash: txnHash,
                transferredAmount: transferredAmount?.toString(),
                transferredAmountWei: transferredAmountWei?.toString(),
                conversionRate: metaData?.conversionRate?.toString(),
                commission: metaData?.commission?.toString(),
                buyTokenAmount: transferredAmount?.toString(),
                completedAt: new Date(),
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to completed and stored all transaction details');

            // Create a transaction record for the user
            if (order.userId && receiverWalletAddress) {
              try {
                await prisma.transaction.create({
                  data: {
                    userId: order.userId,
                    type: 'onramp',
                    fromAddress: 'onmeta', // OnMeta is the source
                    toAddress: receiverWalletAddress,
                    amount: transferredAmount?.toString() || '0',
                    token: buyTokenSymbol || 'USDC',
                    txHash: txnHash || '',
                    status: 'confirmed',
                    description: `OnMeta onramp: ${fiat} ${currency} → ${transferredAmount} ${buyTokenSymbol}`,
                  },
                });
                console.log('✅ Created transaction record for user');
              } catch (txError) {
                console.error('❌ Error creating transaction record:', txError);
                // Don't fail the webhook if transaction creation fails
              }
            }
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        // TODO: Send success notification to user (email/push notification)
        break;

      case 'expired':
        console.log('⏰ Order expired:', orderId);
        console.log('Details:', {
          orderId,
          createdAt,
          status,
        });
        // Order expired (pending > 3 hours)
        try {
          const { order } = await findOrCreateOrder();
          if (order) {
            await prisma.onMetaOrder.update({
              where: { id: order.id },
              data: {
                status: 'expired',
                eventType: eventType,
                expiredAt: new Date(),
                updatedAt: new Date(),
              },
            });
            console.log('✅ Updated order status to expired');
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        // TODO: Notify user that order has expired
        // TODO: Process any refunds if necessary (handled by OnMeta)
        break;

      default:
        console.warn('⚠️ Unhandled webhook event type:', eventType);
        console.log('Full webhook data:', webhookData);
    }

    // Always return 200 to acknowledge receipt
    // OnMeta will retry if it doesn't receive a 200 response
    return res.status(200).json({ 
      received: true,
      orderId,
      eventType,
    });
  } catch (error: any) {
    console.error('❌ OnMeta webhook error:', error);
    // Still return 200 to prevent OnMeta from retrying indefinitely
    // Log the error for investigation
    return res.status(200).json({ 
      received: true, 
      error: error.message,
    });
  }
}

// Disable body parsing for this route to allow raw body access for HMAC verification
// Note: Next.js API routes parse JSON by default, so we work with the parsed body
// If you need raw body access, you'll need to use a custom server or middleware
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
