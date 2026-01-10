import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/auth-middleware';
import { generateWalletAddress } from '@/utils/wallet';

/**
 * Lookup user by email and return wallet address
 * If user doesn't exist, create them with a wallet address
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

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email address is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        preferredCurrency: true,
      },
    });

    if (user) {
      // User exists - check if they have a wallet address
      if (!user.walletAddress) {
        // Generate wallet address for existing user without one
        // For now, we'll use a placeholder - in production, generate actual Solana address
        const walletAddress = await generateWalletAddress();
        
        user = await prisma.user.update({
          where: { id: user.id },
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

      return res.status(200).json({
        success: true,
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          preferredCurrency: user.preferredCurrency,
        },
      });
    } else {
      // User doesn't exist - create account with wallet address
      const walletAddress = await generateWalletAddress();
      
      // Create user account (they'll verify email later)
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: '', // Will be set when user completes signup
          name: null,
          walletAddress,
          preferredCurrency: 'INR', // Default, can be changed later
          emailVerified: false,
          // Other required fields with defaults
        },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          preferredCurrency: true,
        },
      });

      // TODO: Send invite email to new user

      return res.status(200).json({
        success: true,
        exists: false,
        isNew: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          walletAddress: newUser.walletAddress,
          preferredCurrency: newUser.preferredCurrency,
        },
      });
    }
  } catch (error: any) {
    console.error('Error looking up user:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to lookup user',
    });
  }
}


export default withAuth(handler);

