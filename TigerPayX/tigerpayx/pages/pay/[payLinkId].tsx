// Payment page for PayLinks - public access

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { showToast } from "@/components/Toast";
import { createWallet, hasWallet, getStoredWalletAddress, getStoredPrivateKey } from "@/app/wallet/createWallet";
import { sendP2PPayment } from "@/app/payments/p2pSend";
import { getSolBalance } from "@/app/wallet/solanaUtils";
import { formatTokenAmount, formatAddress } from "@/utils/formatting";
import type { PayLink } from "@/shared/types";

interface PayLinkWithMerchant extends PayLink {
  merchantName?: string;
  merchantLogo?: string;
  settlementAddress: string;
}

export default function PayPage() {
  const router = useRouter();
  const { payLinkId } = router.query;
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payLink, setPayLink] = useState<PayLinkWithMerchant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  // Load paylink details
  useEffect(() => {
    if (!payLinkId || typeof payLinkId !== "string") return;

    const loadPayLink = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/paylink/${payLinkId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || "Failed to load payment link");
          return;
        }

        setPayLink(data.payLink);
      } catch (err: any) {
        setError(err.message || "Failed to load payment link");
      } finally {
        setLoading(false);
      }
    };

    loadPayLink();
  }, [payLinkId]);

  // Check wallet and SOL balance
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkWallet = () => {
      if (hasWallet()) {
        const address = getStoredWalletAddress();
        setWalletAddress(address);
        
        // Load SOL balance
        if (address) {
          getSolBalance(address).then((balance) => {
            setSolBalance(balance);
          }).catch(() => {
            setSolBalance(0);
          });
        }
      } else {
        setShowWalletPrompt(true);
      }
    };

    checkWallet();
  }, []);

  const handlePay = async () => {
    if (!payLink || !walletAddress) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    if (solBalance < 0.001) {
      showToast("Insufficient SOL for transaction fees. You need at least 0.001 SOL.", "error");
      return;
    }

    setPaying(true);
    try {
      // Send payment
      const result = await sendP2PPayment(
        payLink.settlementAddress,
        payLink.token,
        parseFloat(payLink.amount)
      );

      if (!result.success || !result.signature) {
        throw new Error(result.error || "Payment failed");
      }

      // Verify payment with API
      const verifyResponse = await fetch(`/api/paylink/${payLinkId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txHash: result.signature,
          fromAddress: walletAddress,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      showToast("Payment successful!", "success");
      
      // Redirect to success page or show success message
      setTimeout(() => {
        router.push(`/pay/${payLinkId}/success`);
      }, 2000);
    } catch (err: any) {
      console.error("Payment error:", err);
      showToast(err.message || "Payment failed", "error");
    } finally {
      setPaying(false);
    }
  };

  const handleCreateWallet = () => {
    const wallet = createWallet();
    setWalletAddress(wallet.publicKey);
    setShowWalletPrompt(false);
    showToast("Wallet created! Please save your seed phrase.", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !payLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161A1E] border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Link Error</h1>
            <p className="text-zinc-400">{error || "Payment link not found or invalid"}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isExpired = payLink.expiresAt && new Date(payLink.expiresAt) < new Date();
  const isPaid = payLink.status === "paid";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-[#161A1E] border border-white/10 rounded-xl p-8">
            {/* Merchant Info */}
            {payLink.merchantName && (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{payLink.merchantName}</h2>
                {payLink.description && (
                  <p className="text-zinc-400 text-sm">{payLink.description}</p>
                )}
              </div>
            )}

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-1">Amount</p>
                <p className="text-3xl font-bold text-white">
                  {formatTokenAmount(payLink.amount, payLink.token)} {payLink.token}
                </p>
              </div>

              {payLink.description && (
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-zinc-400 mb-1">Description</p>
                  <p className="text-white">{payLink.description}</p>
                </div>
              )}

              {/* Status */}
              {isPaid && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold">✓ Payment Completed</p>
                </div>
              )}

              {isExpired && !isPaid && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-semibold">⚠ Payment Link Expired</p>
                </div>
              )}
            </div>

            {/* Wallet Status */}
            {showWalletPrompt && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm mb-3">
                  You need a wallet to make this payment
                </p>
                <button
                  onClick={handleCreateWallet}
                  className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-medium py-2 rounded-lg transition-colors"
                >
                  Create Wallet
                </button>
              </div>
            )}

            {walletAddress && (
              <div className="mb-6 space-y-2">
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-zinc-400 mb-1">Your Wallet</p>
                  <p className="text-sm text-white font-mono">{formatAddress(walletAddress)}</p>
                </div>
                
                {/* SOL Balance */}
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-zinc-400">SOL Balance</p>
                    <p className={`text-sm font-medium ${solBalance >= 0.001 ? 'text-green-400' : 'text-red-400'}`}>
                      {solBalance.toFixed(9)} SOL
                    </p>
                  </div>
                  {solBalance < 0.001 && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠️ You need at least 0.001 SOL for transaction fees
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pay Button */}
            {!isPaid && !isExpired && (
              <button
                onClick={handlePay}
                disabled={paying || !walletAddress || solBalance < 0.001}
                className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing Payment...
                  </>
                ) : !walletAddress ? (
                  "Connect Wallet"
                ) : solBalance < 0.001 ? (
                  "Insufficient SOL for Fees"
                ) : (
                  `Pay ${formatTokenAmount(payLink.amount, payLink.token)} ${payLink.token}`
                )}
              </button>
            )}

            {/* Transaction Info */}
            {isPaid && payLink.solanaTxHash && (
              <div className="mt-4 p-4 bg-[#0a0d0f] border border-white/10 rounded-lg">
                <p className="text-xs text-zinc-400 mb-1">Transaction Hash</p>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}

