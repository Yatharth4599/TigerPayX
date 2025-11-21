// Modal to display seed phrase to user (shown once after wallet creation)
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "./CopyButton";
import { showToast } from "./Toast";

interface SeedPhraseModalProps {
  isOpen: boolean;
  seedPhrase: string;
  walletAddress: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function SeedPhraseModal({
  isOpen,
  seedPhrase,
  walletAddress,
  onClose,
  onConfirm,
}: SeedPhraseModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    showToast("Seed phrase copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    if (!confirmed) {
      showToast("Please confirm you've saved your seed phrase", "error");
      return;
    }
    onConfirm();
  };

  if (!isOpen) return null;

  const words = seedPhrase.split(" ");

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
            <div className="glass-panel bg-[#0a0d0f] border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Your TigerPayX Wallet
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    Save your seed phrase securely. You'll need it to recover your wallet.
                  </p>
                </div>

                {/* Wallet Address */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-2">Your Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-white font-mono text-sm break-all">
                      {walletAddress}
                    </code>
                    <CopyButton text={walletAddress} />
                  </div>
                </div>

                {/* Seed Phrase */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-white">
                      Your Seed Phrase (12 words)
                    </p>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-[#ff6b00] hover:text-orange-400 transition-colors"
                    >
                      {copied ? "✓ Copied" : "Copy All"}
                    </button>
                  </div>

                  {/* Word Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        className="bg-black/40 border border-white/10 rounded-lg p-3 flex items-center gap-2"
                      >
                        <span className="text-xs text-zinc-500 font-mono w-6">
                          {index + 1}.
                        </span>
                        <span className="text-white font-medium text-sm">
                          {word}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warning */}
                  <div className="mt-4 p-3 bg-orange-950/30 border border-orange-800/30 rounded-lg">
                    <p className="text-xs text-orange-300">
                      ⚠️ <strong>Important:</strong> Write down these words in order and store them in a safe place.
                      Never share your seed phrase with anyone. TigerPayX cannot recover your wallet if you lose it.
                    </p>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirm-seed"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#ff6b00] focus:ring-[#ff6b00] focus:ring-2"
                  />
                  <label
                    htmlFor="confirm-seed"
                    className="text-sm text-zinc-300 cursor-pointer"
                  >
                    I have saved my seed phrase in a secure location and understand that
                    TigerPayX cannot recover my wallet if I lose it.
                  </label>
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
                    onClick={handleConfirm}
                    disabled={!confirmed}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b00] to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    I've Saved It
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

