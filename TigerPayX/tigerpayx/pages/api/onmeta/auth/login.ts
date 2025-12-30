import type { NextApiRequest, NextApiResponse } from 'next';
import { onMetaUserLogin } from '@/utils/onmeta';

/**
 * OnMeta User Login API Route
 * POST /api/onmeta/auth/login
 * Creates an access token using email
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    console.log('OnMeta login API route called:', { email });

    const result = await onMetaUserLogin({ email });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('OnMeta login API route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
