import type { NextApiRequest, NextApiResponse } from 'next';
import { submitKYCData } from '@/utils/onmeta';

/**
 * OnMeta Submit KYC Data API Route
 * POST /api/onmeta/kyc/submit
 * Submits KYC documents and data to OnMeta
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
      email,
      selfie,
      aadharFront,
      aadharBack,
      panFront,
      panBack,
      panNumber,
      aadharNumber,
      firstName,
      lastName,
      incomeRange,
      profession,
    } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'email is required and must be a string' });
    }

    if (!selfie || typeof selfie !== 'string') {
      return res.status(400).json({ success: false, error: 'selfie is required and must be a string (base64 encoded)' });
    }

    if (!aadharFront || typeof aadharFront !== 'string') {
      return res.status(400).json({ success: false, error: 'aadharFront is required and must be a string (base64 encoded)' });
    }

    if (!aadharBack || typeof aadharBack !== 'string') {
      return res.status(400).json({ success: false, error: 'aadharBack is required and must be a string (base64 encoded)' });
    }

    if (!panFront || typeof panFront !== 'string') {
      return res.status(400).json({ success: false, error: 'panFront is required and must be a string (base64 encoded)' });
    }

    if (!panBack || typeof panBack !== 'string') {
      return res.status(400).json({ success: false, error: 'panBack is required and must be a string (base64 encoded)' });
    }

    if (!panNumber || typeof panNumber !== 'string') {
      return res.status(400).json({ success: false, error: 'panNumber is required and must be a string' });
    }

    if (!aadharNumber || typeof aadharNumber !== 'string') {
      return res.status(400).json({ success: false, error: 'aadharNumber is required and must be a string' });
    }

    if (!firstName || typeof firstName !== 'string') {
      return res.status(400).json({ success: false, error: 'firstName is required and must be a string' });
    }

    if (!lastName || typeof lastName !== 'string') {
      return res.status(400).json({ success: false, error: 'lastName is required and must be a string' });
    }

    if (!incomeRange || typeof incomeRange !== 'string') {
      return res.status(400).json({ success: false, error: 'incomeRange is required and must be a string' });
    }

    const validIncomeRanges = ['<10L', '10L-15L', '15L-20L', '20L-25L', '25L-50L', '>50L'];
    if (!validIncomeRanges.includes(incomeRange)) {
      return res.status(400).json({ 
        success: false, 
        error: `incomeRange must be one of: ${validIncomeRanges.join(', ')}` 
      });
    }

    if (!profession || typeof profession !== 'string') {
      return res.status(400).json({ success: false, error: 'profession is required and must be a string' });
    }

    console.log('OnMeta submit KYC API route called:', {
      email,
      incomeRange,
      profession,
      hasSelfie: !!selfie,
      hasAadharFront: !!aadharFront,
      hasAadharBack: !!aadharBack,
      hasPanFront: !!panFront,
      hasPanBack: !!panBack,
    });

    const result = await submitKYCData({
      accessToken,
      email,
      selfie,
      aadharFront,
      aadharBack,
      panFront,
      panBack,
      panNumber,
      aadharNumber,
      firstName,
      lastName,
      incomeRange: incomeRange as '<10L' | '10L-15L' | '15L-20L' | '20L-25L' | '25L-50L' | '>50L',
      profession,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta submit KYC API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
