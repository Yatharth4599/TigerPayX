// Modal to prompt user to import their existing wallet
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { importWallet } from "@/app/wallet/importWallet";
import { showToast } from "./Toast";
import { LoadingSpinner } from "./LoadingSpinner";

interface ImportWalletPromptProps {
  isOpen: boolean;
  existingAddress: string;
  onClose: () => void;
  onImport: (address: string) => void;
}

export function ImportWalletPrompt({
  isOpen,
  existingAddress,
  onClose,
  onImport,
}: ImportWalletPromptProps) {
  const [privateKey, setPrivateKey] = useState("");
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!privateKey.trim()) {
      showToast("Please enter your private key or seed phrase", "warning");
      return;
    }

    setImporting(true);
    try {
      const result = await importWallet(privateKey.trim());
      
      if (result.success && result.address) {
        // Verify the imported address matches the database address
        if (result.address !== existingAddress) {
          showToast("The imported wallet doesn't match your account wallet", "error");
          setImporting(false);
          return;
        }
        
        showToast("Wallet imported successfully!", "success");
        onImport(result.address);
        setPrivateKey("");
        onClose();
      } else {
        showToast(result.error || "Failed to import wallet", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Import failed", "error");
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-panel bg-[#0a0d0f] border-white/20 max-w-md w-full rounded-2xl p-6">
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Import Your Wallet
                  </h2>
                  <p className="text-sm text-zinc-400">
                    You already have a TigerPayX wallet. Import it using your private key or seed phrase.
                  </p>
                </div>

                {/* Existing Address */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-2">Your Wallet Address</p>
                  <p className="text-white font-mono text-sm break-all">
                    {existingAddress}
                  </p>
                </div>

                {/* Import Form */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Private Key or Seed Phrase
                  </label>
                  <textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm min-h-[120px] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none"
                    placeholder="Enter your private key (Base64 or Base58) or 12-word seed phrase..."
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Your private key is stored locally and never sent to our servers.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || !privateKey.trim()}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b00] to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Importing...
                      </>
                    ) : (
                      "Import Wallet"
                    )}
                  </button>
                </div>

                {/* Warning */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    ⚠️ <strong>Important:</strong> Only import if you have your private key or seed phrase. 
                    Creating a new wallet will generate a different address.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

