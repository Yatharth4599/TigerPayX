// Merchant registration form modal

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "./LoadingSpinner";
import { showToast } from "./Toast";
import { registerMerchant } from "@/app/merchant/registerMerchant";
import { isValidSolanaAddress } from "@/app/wallet/solanaUtils";
import { getStoredWalletAddress } from "@/app/wallet/createWallet";

interface MerchantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultSettlementAddress?: string;
}

export function MerchantFormModal({ isOpen, onClose, onSuccess, defaultSettlementAddress }: MerchantFormModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Get wallet address from storage if available
  const getWalletAddress = () => {
    if (typeof window === "undefined") return defaultSettlementAddress || "";
    try {
      const stored = getStoredWalletAddress();
      return stored || defaultSettlementAddress || "";
    } catch {
      return defaultSettlementAddress || "";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    settlementAddress: getWalletAddress(),
    preferredToken: "USDC" as "SOL" | "USDC" | "USDT" | "TT",
  });

  // Update settlement address when default changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const walletAddr = getWalletAddress();
      if (walletAddr) {
      setFormData(prev => ({
        ...prev,
          settlementAddress: walletAddr,
      }));
      }
    }
  }, [defaultSettlementAddress, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Merchant name is required", "error");
      return;
    }

    if (!isValidSolanaAddress(formData.settlementAddress)) {
      showToast("Invalid Solana address. Please enter a valid wallet address.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await registerMerchant({
        name: formData.name,
        logoUrl: formData.logoUrl || undefined,
        settlementAddress: formData.settlementAddress,
        preferredToken: formData.preferredToken,
      });

      if (result.success) {
        showToast("Merchant registered successfully!", "success");
        // Reset form
        setFormData({
          name: "",
          logoUrl: "",
          settlementAddress: getWalletAddress(),
          preferredToken: "USDC",
        });
        // Close modal
        onClose();
        // Refresh merchant list
        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        showToast(result.error || "Failed to register merchant", "error");
      }
    } catch (error: any) {
      console.error("Merchant registration error:", error);
      showToast(error.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#161A1E] border border-white/10 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Register Merchant</h2>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Merchant Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                    placeholder="My Store"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Logo URL (optional)</label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Settlement Address (Wallet) *</label>
                  <input
                    type="text"
                    value={formData.settlementAddress}
                    onChange={(e) => setFormData({ ...formData, settlementAddress: e.target.value })}
                    className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm"
                    placeholder="Your Solana wallet address"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    {formData.settlementAddress 
                      ? "✓ Wallet address entered" 
                      : "Enter your Solana wallet address where payments will be received"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Preferred Token *</label>
                  <select
                    value={formData.preferredToken}
                    onChange={(e) => setFormData({ ...formData, preferredToken: e.target.value as any })}
                    className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="TT">TT</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
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
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

