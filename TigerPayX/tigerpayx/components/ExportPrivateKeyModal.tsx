// Secure modal to export private key (with strong warnings)
// Only show this when user explicitly requests it
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { showToast } from "./Toast";
import { getStoredPrivateKey } from "@/app/wallet/createWallet";

interface ExportPrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportPrivateKeyModal({
  isOpen,
  onClose,
}: ExportPrivateKeyModalProps) {
  const [step, setStep] = useState<"warning" | "reveal">("warning");
  const [confirmed, setConfirmed] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleContinue = () => {
    if (!confirmed) {
      showToast("Please confirm all warnings before continuing", "error");
      return;
    }
    
    // Get private key from storage
    const key = getStoredPrivateKey();
    if (!key) {
      showToast("Private key not found", "error");
      onClose();
      return;
    }
    
    setPrivateKey(key);
    setStep("reveal");
  };

  const handleCopy = () => {
    if (!privateKey) return;
    navigator.clipboard.writeText(privateKey);
    setCopied(true);
    showToast("Private key copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("warning");
    setConfirmed(false);
    setPrivateKey(null);
    onClose();
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-panel bg-[#0a0d0f] border-red-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8">
              {step === "warning" ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-3xl font-bold text-red-400 mb-2">
                      Export Private Key
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      This action will reveal your private key. Proceed with extreme caution.
                    </p>
                  </div>

                  {/* Critical Warnings */}
                  <div className="space-y-4">
                    <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4">
                      <h3 className="text-red-300 font-semibold mb-2">
                        ⚠️ Security Warnings
                      </h3>
                      <ul className="space-y-2 text-sm text-red-200">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            <strong>Never share your private key</strong> with anyone. Anyone with your private key has full control over your wallet.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            <strong>Do not store it online</strong> (cloud storage, email, screenshots). Store it offline in a secure location.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            <strong>If someone gets your private key</strong>, they can steal all your funds. There is no way to recover stolen funds.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            <strong>Your seed phrase is safer</strong> to use for backup. Only export your private key if absolutely necessary.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-orange-950/30 border border-orange-800/30 rounded-xl p-4">
                      <h3 className="text-orange-300 font-semibold mb-2">
                        💡 Recommended Alternative
                      </h3>
                      <p className="text-sm text-orange-200">
                        Instead of exporting your private key, use your <strong>seed phrase</strong> to restore your wallet. 
                        Your seed phrase is shown when you create your wallet and can be used to recover your wallet on any device.
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="confirm-export"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-red-500/50 bg-white/5 text-red-500 focus:ring-red-500 focus:ring-2"
                    />
                    <label
                      htmlFor="confirm-export"
                      className="text-sm text-zinc-300 cursor-pointer"
                    >
                      I understand the risks and want to export my private key anyway. 
                      I will store it securely offline and never share it with anyone.
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                    >
                      Cancel (Recommended)
                    </button>
                    <button
                      onClick={handleContinue}
                      disabled={!confirmed}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue (Not Recommended)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Your Private Key
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      Copy this key and store it securely offline. Never share it with anyone.
                    </p>
                  </div>

                  {/* Private Key Display */}
                  <div className="bg-red-950/20 border-2 border-red-500/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-red-300">
                        Private Key (Base64)
                      </p>
                      <CopyButton text={privateKey || ""} />
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 border border-red-500/30">
                      <code className="text-white font-mono text-sm break-all block">
                        {privateKey}
                      </code>
                    </div>
                    <div className="mt-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg">
                      <p className="text-xs text-red-200">
                        ⚠️ <strong>Warning:</strong> This private key gives full control over your wallet. 
                        Store it securely offline. If you lose it or someone steals it, you cannot recover your funds.
                      </p>
                    </div>
                  </div>

                  {/* Final Warning */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-zinc-400 text-center">
                      After copying your private key, close this window immediately. 
                      Do not leave it open on your screen.
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b00] to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white font-semibold transition-all"
                  >
                    I've Copied It - Close Window
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

