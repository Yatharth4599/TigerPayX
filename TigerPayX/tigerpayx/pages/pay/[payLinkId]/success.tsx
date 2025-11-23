// Payment success page

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatAddress } from "@/utils/formatting";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { payLinkId } = router.query;
  const [loading, setLoading] = useState(true);
  const [payLink, setPayLink] = useState<any>(null);

  useEffect(() => {
    if (!payLinkId || typeof payLinkId !== "string") return;

    const loadPayLink = async () => {
      try {
        const response = await fetch(`/api/paylink/${payLinkId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPayLink(data.payLink);
        }
      } catch (err) {
        console.error("Error loading paylink:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPayLink();
  }, [payLinkId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-[#161A1E] border border-white/10 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-zinc-400 mb-6">
              Your payment has been processed successfully.
            </p>

            {payLink && (
              <div className="space-y-4 text-left">
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-zinc-400 mb-1">Amount Paid</p>
                  <p className="text-xl font-bold text-white">
                    {payLink.amount} {payLink.token}
                  </p>
                </div>

                {payLink.solanaTxHash && (
                  <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-2">Transaction Hash</p>
                    <a
                      href={`https://solscan.io/tx/${payLink.solanaTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#ff6b00] hover:underline break-all"
                    >
                      {formatAddress(payLink.solanaTxHash)}
                    </a>
                  </div>
                )}

                {payLink.merchantName && (
                  <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-1">Merchant</p>
                    <p className="text-white">{payLink.merchantName}</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full mt-6 bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

