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
  const [paymentMethod, setPaymentMethod] = useState<"stablecoin" | "upi" | "gcash" | "bank">("stablecoin");

  // Load paylink details
  useEffect(() => {
    if (!payLinkId || typeof payLinkId !== "string") return;

    const loadPayLink = async () => {
      try {
        setLoading(true);
        
        // First check localStorage for demo pay links
        if (payLinkId.startsWith("demo-") && typeof window !== "undefined") {
          const storedLinks = JSON.parse(localStorage.getItem("demo_paylinks") || "[]");
          const demoLink = storedLinks.find((link: any) => link.payLinkId === payLinkId);
          if (demoLink) {
            setPayLink({
              ...demoLink,
              merchantName: demoLink.merchantName || "Demo Merchant",
              settlementAddress: demoLink.settlementAddress || "11111111111111111111111111111111",
            });
            setLoading(false);
            return;
          }
        }
        
        // Try API for regular pay links
        const response = await fetch(`/api/paylink/${payLinkId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          // If API fails and it's a demo link, check localStorage again
          if (payLinkId.startsWith("demo-") && typeof window !== "undefined") {
            const storedLinks = JSON.parse(localStorage.getItem("demo_paylinks") || "[]");
            const demoLink = storedLinks.find((link: any) => link.payLinkId === payLinkId);
            if (demoLink) {
              setPayLink({
                ...demoLink,
                merchantName: demoLink.merchantName || "Demo Merchant",
                settlementAddress: demoLink.settlementAddress || "11111111111111111111111111111111",
              });
              setLoading(false);
              return;
            }
          }
          setError(data.error || "Failed to load payment link");
          return;
        }

        setPayLink(data.payLink);
      } catch (err: any) {
        // On error, check localStorage for demo links
        if (payLinkId.startsWith("demo-") && typeof window !== "undefined") {
          try {
            const storedLinks = JSON.parse(localStorage.getItem("demo_paylinks") || "[]");
            const demoLink = storedLinks.find((link: any) => link.payLinkId === payLinkId);
            if (demoLink) {
              setPayLink({
                ...demoLink,
                merchantName: demoLink.merchantName || "Demo Merchant",
                settlementAddress: demoLink.settlementAddress || "11111111111111111111111111111111",
              });
              setLoading(false);
              return;
            }
          } catch (e) {
            // Ignore localStorage errors
          }
        }
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
    if (!payLink) {
      showToast("Payment link not loaded", "error");
      return;
    }

    // Handle different payment methods
    if (paymentMethod === "stablecoin") {
      await handleStablecoinPayment();
    } else if (paymentMethod === "upi") {
      await handleUPIPayment();
    } else if (paymentMethod === "gcash") {
      await handleGCashPayment();
    } else if (paymentMethod === "bank") {
      await handleBankTransfer();
    }
  };

  const handleStablecoinPayment = async () => {
    if (!walletAddress) {
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
        payLink!.settlementAddress,
        payLink!.token,
        parseFloat(payLink!.amount)
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
          paymentMethod: "stablecoin",
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

  const handleUPIPayment = async () => {
    setPaying(true);
    try {
      // Create UPI payment request
      const response = await fetch(`/api/paylink/${payLinkId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: "upi",
          amount: payLink!.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate UPI payment");
      }

      if (data.upiUrl) {
        // Open UPI payment URL
        window.location.href = data.upiUrl;
      } else if (data.upiDetails) {
        // Show UPI details for manual payment
        showToast("UPI payment details generated. Please complete the payment.", "info");
        // You can show a modal with UPI details here
      }
    } catch (err: any) {
      console.error("UPI payment error:", err);
      showToast(err.message || "UPI payment failed", "error");
      setPaying(false);
    }
  };

  const handleGCashPayment = async () => {
    setPaying(true);
    try {
      // Create GCash payment request
      const response = await fetch(`/api/paylink/${payLinkId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: "gcash",
          amount: payLink!.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate GCash payment");
      }

      if (data.gcashUrl) {
        // Open GCash payment URL
        window.location.href = data.gcashUrl;
      } else if (data.gcashDetails) {
        // Show GCash details for manual payment
        showToast("GCash payment details generated. Please complete the payment.", "info");
        // You can show a modal with GCash details here
      }
    } catch (err: any) {
      console.error("GCash payment error:", err);
      showToast(err.message || "GCash payment failed", "error");
      setPaying(false);
    }
  };

  const handleBankTransfer = async () => {
    setPaying(true);
    try {
      // Get bank transfer details
      const response = await fetch(`/api/paylink/${payLinkId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: "bank",
          amount: payLink!.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get bank transfer details");
      }

      if (data.bankDetails) {
        // Show bank transfer details
        showToast("Bank transfer details generated. Please complete the transfer.", "info");
        // You can show a modal with bank details here
        setPaying(false);
      }
    } catch (err: any) {
      console.error("Bank transfer error:", err);
      showToast(err.message || "Failed to get bank transfer details", "error");
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

            {/* Payment Method Selection */}
            {!isPaid && !isExpired && (
              <div className="mb-6">
                <p className="text-sm text-zinc-400 mb-3">Choose Payment Method</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setPaymentMethod("stablecoin")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "stablecoin"
                        ? "border-[#ff6b00] bg-[#ff6b00]/10"
                        : "border-white/10 bg-[#0a0d0f] hover:border-white/20"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <p className="text-xs font-medium text-white">Stablecoins</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "upi"
                        ? "border-[#ff6b00] bg-[#ff6b00]/10"
                        : "border-white/10 bg-[#0a0d0f] hover:border-white/20"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📱</div>
                      <p className="text-xs font-medium text-white">UPI</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("gcash")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "gcash"
                        ? "border-[#ff6b00] bg-[#ff6b00]/10"
                        : "border-white/10 bg-[#0a0d0f] hover:border-white/20"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💳</div>
                      <p className="text-xs font-medium text-white">GCash</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === "bank"
                        ? "border-[#ff6b00] bg-[#ff6b00]/10"
                        : "border-white/10 bg-[#0a0d0f] hover:border-white/20"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏦</div>
                      <p className="text-xs font-medium text-white">Bank</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Stablecoin Payment UI */}
            {!isPaid && !isExpired && paymentMethod === "stablecoin" && (
              <>
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
              </>
            )}

            {/* UPI Payment UI */}
            {!isPaid && !isExpired && paymentMethod === "upi" && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm mb-2">
                    💡 Pay using UPI (India) - Unified Payments Interface
                  </p>
                  <p className="text-zinc-400 text-xs">
                    You'll be redirected to complete the UPI payment
                  </p>
                </div>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Initiating UPI Payment...
                    </>
                  ) : (
                    `Pay ₹${parseFloat(payLink.amount).toFixed(2)} via UPI`
                  )}
                </button>
              </div>
            )}

            {/* GCash Payment UI */}
            {!isPaid && !isExpired && paymentMethod === "gcash" && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm mb-2">
                    💡 Pay using GCash (Philippines)
                  </p>
                  <p className="text-zinc-400 text-xs">
                    You'll be redirected to complete the GCash payment
                  </p>
                </div>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Initiating GCash Payment...
                    </>
                  ) : (
                    `Pay ₱${parseFloat(payLink.amount).toFixed(2)} via GCash`
                  )}
                </button>
              </div>
            )}

            {/* Bank Transfer UI */}
            {!isPaid && !isExpired && paymentMethod === "bank" && (
              <div className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-400 text-sm mb-2">
                    💡 Bank Transfer Details
                  </p>
                  <p className="text-zinc-400 text-xs">
                    Complete the bank transfer using the details below
                  </p>
                </div>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Loading Bank Details...
                    </>
                  ) : (
                    "Get Bank Transfer Details"
                  )}
                </button>
              </div>
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

