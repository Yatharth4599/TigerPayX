import type { NextApiRequest, NextApiResponse } from "next";

type PaymentLinkRequest = {
  amount: string;
  currency: string;
  description?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { amount, currency, description } = req.body as PaymentLinkRequest;

  if (!amount || !currency) {
    return res.status(400).json({ message: "Amount and currency are required" });
  }

  // Generate a mock payment link
  const linkId = Math.random().toString(36).substring(2, 15);
  const paymentLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://tigerpayx.com"}/pay/${linkId}`;

  return res.status(200).json({
    success: true,
    link: paymentLink,
    amount,
    currency,
    description: description || "",
    qrCode: paymentLink, // QR code will be generated client-side from this link
  });
}
