import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/auth-middleware';
import { convertFiatToCrypto } from '@/utils/exchangeRates';
import { createOnrampOrder } from '@/utils/onmeta';
import { generateWalletAddress } from '@/utils/wallet';

/**
 * Send money via onramp (UPI/Bank/etc) to recipient's wallet
 * Creates OnMeta onramp order that sends crypto directly to recipient's wallet address
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

    const { recipientEmail, amount, paymentMethod, message } = req.body;

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

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment method is required (e.g., INR_UPI, PHP_EWALLET_GCASH)' 
      });
    }

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        preferredCurrency: true,
        onmetaAccessToken: true,
      },
    });

    if (!sender) {
      return res.status(404).json({ success: false, error: 'Sender not found' });
    }

    // Check if sender has OnMeta access token
    if (!sender.onmetaAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'OnMeta authentication required. Please complete KYC first.',
      });
    }

    // Find or create recipient
    let recipient = await prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        preferredCurrency: true,
      },
    });

    // If recipient doesn't exist, create account with wallet
    if (!recipient) {
      const walletAddress = await generateWalletAddress();
      
      recipient = await prisma.user.create({
        data: {
          email: recipientEmail.toLowerCase().trim(),
          password: '', // Will be set when user completes signup
          name: null,
          walletAddress,
          preferredCurrency: sender.preferredCurrency || 'INR',
          emailVerified: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          preferredCurrency: true,
        },
      });

      // TODO: Send invite email to new recipient
    } else if (!recipient.walletAddress) {
      // Existing recipient without wallet - generate one
      const walletAddress = await generateWalletAddress();
      
      recipient = await prisma.user.update({
        where: { id: recipient.id },
        data: { walletAddress },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          preferredCurrency: true,
        },
      });
    }

    if (!recipient.walletAddress) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate recipient wallet address',
      });
    }

    // Calculate fees
    const onrampFeeRate = 0.02; // 2%
    const transferFeeRate = 0.005; // 0.5%
    const networkFee = 2; // Fixed network fee (approximate)
    
    const onrampFee = amount * onrampFeeRate;
    const transferFee = amount * transferFeeRate;
    const totalFees = onrampFee + transferFee + networkFee;
    const totalAmount = amount + totalFees;

    // Convert fiat amount to crypto (USDC) for onramp
    const fiatCurrency = sender.preferredCurrency || 'INR';
    const cryptoAmount = await convertFiatToCrypto(amount, fiatCurrency);

    // Determine chain ID and token address based on recipient's preferences or default to Polygon
    const chainId = 137; // Polygon mainnet (default)
    const buyTokenAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC on Polygon

    // Prepare UPI/Bank details based on payment method
    let upiId: { upiId: string } | undefined;
    let bankDetails: any | undefined;

    // TODO: Get linked UPI ID from sender's linked accounts if available
    // For now, OnMeta will handle UPI linking during payment flow
    if (paymentMethod.includes('UPI')) {
      // UPI ID will be provided by OnMeta during payment, or use linked UPI if available
      upiId = undefined; // OnMeta will prompt for UPI during payment
    }

    if (paymentMethod.includes('IMPS') || paymentMethod.includes('NEFT')) {
      // Bank details should be linked before creating order
      // For now, OnMeta will handle bank linking during payment flow
      bankDetails = undefined; // OnMeta will prompt for bank during payment
    }

    // Prepare metadata (all values must be strings)
    const metaData: Record<string, string> = {
      senderId: sender.id,
      senderEmail: sender.email,
      recipientId: recipient.id,
      recipientEmail: recipientEmail.toLowerCase().trim(),
      ...(message && { message: message }),
    };

    // Create OnMeta onramp order to recipient's wallet
    const onrampOrder = await createOnrampOrder({
      accessToken: sender.onmetaAccessToken,
      buyTokenSymbol: 'USDC',
      chainId: chainId,
      fiatCurrency: fiatCurrency.toLowerCase(),
      fiatAmount: amount,
      buyTokenAddress: buyTokenAddress,
      receiverAddress: recipient.walletAddress, // Recipient's wallet address!
      paymentMode: paymentMethod, // INR_UPI, PHP_EWALLET_GCASH, INR_IMPS, INR_NEFT, etc
      upiId: upiId,
      bankDetails: bankDetails,
      metaData: metaData,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.tigerpayx.com'}/dashboard?send_success=true&orderId={orderId}`,
    });

    if (!onrampOrder.success || !onrampOrder.orderId) {
      return res.status(500).json({
        success: false,
        error: onrampOrder.error || 'Failed to create onramp order',
      });
    }

    // Create transaction record (pending until onramp completes)
    const transaction = await prisma.transaction.create({
      data: {
        userId: sender.id,
        type: 'p2p_send',
        fiatAmount: amount,
        fiatCurrency: fiatCurrency,
        cryptoAmount: cryptoAmount,
        cryptoCurrency: 'USDC',
        fees: totalFees,
        feeBreakdown: {
          onrampFee: onrampFee,
          transferFee: transferFee,
          networkFee: networkFee,
        },
        senderUserId: sender.id,
        recipientUserId: recipient.id,
        recipientEmail: recipientEmail.toLowerCase().trim(),
        onrampOrderId: onrampOrder.orderId,
        onMetaRefNumber: onrampOrder.refNumber || null,
        status: 'pending',
        description: message || `Sending to ${recipientEmail}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment initiated. Please complete the payment on OnMeta.',
      transaction: {
        id: transaction.id,
        amount: amount,
        fees: totalFees,
        total: totalAmount,
        recipientEmail: recipientEmail,
        status: 'pending',
      },
      onrampOrder: {
        orderId: onrampOrder.orderId,
        orderUrl: onrampOrder.orderUrl || onrampOrder.depositUrl, // URL to redirect user to OnMeta payment page
      },
    });
  } catch (error: any) {
    console.error('Error sending via onramp:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate payment',
    });
  }
}

export default withAuth(handler);

