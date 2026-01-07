import type { NextApiRequest, NextApiResponse } from 'next';
import { onMetaLinkUPI } from '@/utils/onmeta';

/**
 * OnMeta Link UPI ID API Route
 * POST /api/onmeta/account/link-upi
 * Links user UPI ID with OnMeta
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
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { name, email, upiId, phone } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Missing or invalid name field' });
    }
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Missing or invalid email field' });
    }
    
    if (!upiId || typeof upiId !== 'string' || upiId.trim() === '') {
      return res.status(400).json({ success: false, error: 'Missing or invalid upiId field' });
    }

    // Validate UPI ID format (should contain @)
    if (!upiId.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid UPI ID format. Should be like: bank@upi' });
    }

    // Validate phone if provided
    let phoneObj = undefined;
    if (phone) {
      if (typeof phone === 'object' && phone.countryCode && phone.number) {
        phoneObj = {
          countryCode: String(phone.countryCode),
          number: String(phone.number),
        };
      } else {
        return res.status(400).json({ success: false, error: 'Invalid phone format. Should be { countryCode: string, number: string }' });
      }
    }

    console.log('OnMeta link UPI API route called:', {
      email,
      upiId,
      hasPhone: !!phoneObj,
    });

    const result = await onMetaLinkUPI({
      accessToken,
      name: name.trim(),
      email: email.trim().toLowerCase(), // Convert email to lowercase as per OnMeta requirement
      upiId: upiId.trim(),
      phone: phoneObj,
    });

    console.log('OnMeta link UPI API route result:', {
      success: result.success,
      error: result.error,
      status: result.status,
      refNumber: result.refNumber,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // Return the actual error from OnMeta API
      // Convert error to string before checking includes
      const errorStr = typeof result.error === 'string' ? result.error : String(result.error || '');
      const statusCode = errorStr.includes('401') || errorStr.includes('unauthorized') ? 401 :
                         errorStr.includes('404') || errorStr.includes('not found') ? 404 : 400;
      return res.status(statusCode).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta link UPI API route error:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    
    // Extract error message from various possible sources
    let errorMessage = 'Internal server error';
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error) {
      errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      } : undefined,
    });
  }
}
