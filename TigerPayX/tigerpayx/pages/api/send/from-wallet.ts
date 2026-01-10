import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/auth-middleware';

/**
 * Internal P2P transfer from wallet balance
 * Transfers fiat balance directly between users (no onramp/offramp needed)
 */
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

    const { recipientEmail, amount, message } = req.body;

    // Validation
    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient email is required' 
      });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }

    // Find recipient
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase().trim() },
    });

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recipient not found. Please ensure the email address is correct.' 
      });
    }

    if (recipient.id === req.user.userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot send money to yourself' 
      });
    }

    // Get sender with current balance
    const sender = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        fiatBalance: true,
        preferredCurrency: true,
      },
    });

    if (!sender) {
      return res.status(404).json({ success: false, error: 'Sender not found' });
    }

    // Calculate fees (0.5% transfer fee)
    const transferFeeRate = 0.005; // 0.5%
    const transferFee = amount * transferFeeRate;
    const totalNeeded = amount + transferFee;

    // Check balance
    const senderBalance = Number(sender.fiatBalance || 0);
    if (senderBalance < totalNeeded) {
      const currency = sender.preferredCurrency || 'INR';
      const symbol = currency === 'INR' ? '₹' : currency === 'PHP' ? '₱' : currency === 'IDR' ? 'Rp' : '$';
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. You have ${symbol}${senderBalance.toFixed(2)}, but need ${symbol}${totalNeeded.toFixed(2)}`,
        currentBalance: senderBalance,
        requiredAmount: totalNeeded,
      });
    }

    // Perform transaction using Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update sender balance
      const updatedSender = await tx.user.update({
        where: { id: sender.id },
        data: {
          fiatBalance: {
            decrement: totalNeeded,
          },
        },
      });

      // Update recipient balance
      const updatedRecipient = await tx.user.update({
        where: { id: recipient.id },
        data: {
          fiatBalance: {
            increment: amount, // Recipient receives full amount (fee already deducted from sender)
          },
        },
      });

      // Create transaction record for sender
      const senderTransaction = await tx.transaction.create({
        data: {
          userId: sender.id,
          type: 'p2p_send',
          fiatAmount: amount,
          fiatCurrency: sender.preferredCurrency || 'INR',
          fees: transferFee,
          feeBreakdown: {
            transferFee: transferFee,
          },
          senderUserId: sender.id,
          recipientUserId: recipient.id,
          recipientEmail: recipientEmail.toLowerCase().trim(),
          status: 'completed',
          description: message || `Sent to ${recipientEmail}`,
        },
      });

      // Create transaction record for recipient
      const recipientTransaction = await tx.transaction.create({
        data: {
          userId: recipient.id,
          type: 'p2p_receive',
          fiatAmount: amount,
          fiatCurrency: recipient.preferredCurrency || sender.preferredCurrency || 'INR',
          fees: 0, // Recipient doesn't pay fees
          senderUserId: sender.id,
          recipientUserId: recipient.id,
          status: 'completed',
          description: message || `Received from ${sender.email}`,
        },
      });

      return {
        senderTransaction,
        recipientTransaction,
        senderNewBalance: Number(updatedSender.fiatBalance),
        recipientNewBalance: Number(updatedRecipient.fiatBalance),
      };
    });

    // TODO: Send notifications to both users
    // await notifyUser(recipient.id, `You received ₹${amount} from ${sender.email}`);
    // await notifyUser(sender.id, `You sent ₹${amount} to ${recipientEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Money sent successfully',
      transaction: {
        id: result.senderTransaction.id,
        amount: amount,
        fees: transferFee,
        total: totalNeeded,
        recipientEmail: recipientEmail,
        status: 'completed',
      },
      balance: {
        newBalance: result.senderNewBalance,
        previousBalance: senderBalance,
        currency: sender.preferredCurrency || 'INR',
      },
    });
  } catch (error: any) {
    console.error('Error sending from wallet:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send money',
    });
  }
}

export default withAuth(handler);

