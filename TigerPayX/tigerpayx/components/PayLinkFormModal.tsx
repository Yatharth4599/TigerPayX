// PayLink creation form modal

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "./LoadingSpinner";
import { showToast } from "./Toast";
import { createPayLink } from "@/app/merchant/createPayLink";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { generatePaymentQR } from "@/app/payments/qrScanner";

interface PayLinkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  onSuccess: () => void;
}

export function PayLinkFormModal({ isOpen, onClose, merchantId, onSuccess }: PayLinkFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [createdPayLink, setCreatedPayLink] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    token: "USDC" as "SOL" | "USDC" | "USDT" | "TT",
    description: "",
    expiresInHours: 24,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await createPayLink({
        merchantId,
        amount: formData.amount,
        token: formData.token,
        description: formData.description || undefined,
        expiresInHours: formData.expiresInHours,
      });

      if (result.success && result.payLink) {
        setCreatedPayLink(result.payLink);
        showToast("PayLink created successfully!", "success");
        onSuccess();
      } else {
        showToast(result.error || "Failed to create PayLink", "error");
      }
    } catch (error: any) {
      showToast(error.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedPayLink(null);
    setFormData({
      amount: "",
      token: "USDC",
      description: "",
      expiresInHours: 24,
    });
    onClose();
  };

  const payLinkUrl = createdPayLink 
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${createdPayLink.payLinkId}`
    : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#161A1E] border border-white/10 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              {!createdPayLink ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Create PayLink</h2>
                    <button
                      onClick={handleClose}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Amount *</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Token *</label>
                      <select
                        value={formData.token}
                        onChange={(e) => setFormData({ ...formData, token: e.target.value as any })}
                        className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="TT">TT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Description (optional)</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                        placeholder="Payment for services"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Expires In (hours)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.expiresInHours}
                        onChange={(e) => setFormData({ ...formData, expiresInHours: parseInt(e.target.value) || 24 })}
                        className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 bg-zinc-700 text-white font-semibold py-3 rounded-lg hover:bg-zinc-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Creating...
                          </>
                        ) : (
                          "Create PayLink"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">PayLink Created!</h2>
                    <button
                      onClick={handleClose}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                      <p className="text-sm text-zinc-400 mb-1">Amount</p>
                      <p className="text-xl font-bold text-white">{formData.amount} {formData.token}</p>
                    </div>

                    {formData.description && (
                      <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                        <p className="text-sm text-zinc-400 mb-1">Description</p>
                        <p className="text-white">{formData.description}</p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <QRCodeDisplay value={payLinkUrl} size={200} />
                    </div>

                    <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                      <p className="text-sm text-zinc-400 mb-2">PayLink URL</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white font-mono break-all flex-1">{payLinkUrl}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(payLinkUrl);
                            showToast("PayLink URL copied!", "success");
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

