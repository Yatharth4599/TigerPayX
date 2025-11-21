// Wallet Connection Modal - Connect to external Solana wallets

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDetectedWallets, connectWallet, type DetectedWallet } from "@/app/wallet/walletDetection";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { showToast } from "@/components/Toast";
import { getStoredWalletAddress, hasWallet } from "@/app/wallet/createWallet";
import { importWallet } from "@/app/wallet/importWallet";

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export function WalletConnectionModal({ isOpen, onClose, onConnect }: WalletConnectionModalProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Detect wallets when modal opens
      const wallets = getDetectedWallets();
      setDetectedWallets(wallets);
    }
  }, [isOpen]);

  const handleConnect = async (wallet: DetectedWallet) => {
    if (!wallet.installed) {
      // Open wallet download page
      const walletName = wallet.name.toLowerCase();
      if (walletName === "phantom") {
        window.open("https://phantom.app/", "_blank");
      } else if (walletName === "solflare") {
        window.open("https://solflare.com/", "_blank");
      } else if (walletName === "backpack") {
        window.open("https://www.backpack.app/", "_blank");
      }
      return;
    }

    setConnecting(wallet.name);
    try {
      const result = await connectWallet(wallet.name);
      if (result.success && result.publicKey) {
        showToast(`Connected to ${wallet.name}!`, "success");
        onConnect(result.publicKey);
        onClose();
      } else {
        showToast(result.error || "Failed to connect", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Connection failed", "error");
    } finally {
      setConnecting(null);
    }
  };

  const handleImport = async () => {
    if (!privateKey.trim()) {
      showToast("Please enter a private key", "warning");
      return;
    }

    setImporting(true);
    try {
      // Import wallet using existing function
      const result = await importWallet(privateKey.trim());
      
      if (result.success && result.address) {
        showToast("Wallet imported successfully!", "success");
        onConnect(result.address);
        setPrivateKey("");
        setShowImport(false);
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

  const installedWallets = detectedWallets.filter((w) => w.installed);
  const notInstalledWallets = detectedWallets.filter((w) => !w.installed);
  const hasExistingWallet = hasWallet();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#161A1E] border border-white/10 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showImport ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Private Key (Base64 or Base58)
                </label>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm min-h-[120px]"
                  placeholder="Enter your private key..."
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Your private key is stored locally and never sent to our servers.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowImport(false);
                    setPrivateKey("");
                  }}
                  className="flex-1 bg-zinc-700 text-white font-semibold py-3 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || !privateKey.trim()}
                  className="flex-1 bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
          ) : (
            <div className="space-y-4">
              {hasExistingWallet && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-400">
                    ⚠️ You already have a TigerPayX wallet. Connecting an external wallet will replace it.
                  </p>
                </div>
              )}

              {/* Installed Wallets */}
              {installedWallets.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-400 mb-3">Detected Wallets</p>
                  <div className="space-y-2">
                    {installedWallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => handleConnect(wallet)}
                        disabled={connecting !== null}
                        className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg p-4 hover:border-[#ff6b00]/50 transition-colors disabled:opacity-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <div className="text-left">
                            <p className="text-white font-semibold">{wallet.name}</p>
                            <p className="text-xs text-zinc-400">Click to connect</p>
                          </div>
                        </div>
                        {connecting === wallet.name ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <svg
                            className="w-5 h-5 text-zinc-400 group-hover:text-[#ff6b00] transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Not Installed Wallets */}
              {notInstalledWallets.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-400 mb-3">Install Wallet</p>
                  <div className="space-y-2">
                    {notInstalledWallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => handleConnect(wallet)}
                        className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg p-4 hover:border-[#ff6b00]/50 transition-colors flex items-center justify-between group opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <div className="text-left">
                            <p className="text-white font-semibold">{wallet.name}</p>
                            <p className="text-xs text-zinc-400">Click to install</p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-zinc-400 group-hover:text-[#ff6b00] transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-zinc-500">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Import Private Key */}
              <button
                onClick={() => setShowImport(true)}
                className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg p-4 hover:border-[#ff6b00]/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔑</span>
                  <div className="text-left">
                    <p className="text-white font-semibold">Import Private Key</p>
                    <p className="text-xs text-zinc-400">Import existing wallet</p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-400 group-hover:text-[#ff6b00] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {detectedWallets.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-zinc-400 mb-2">No wallets detected</p>
                  <p className="text-sm text-zinc-500">
                    Install Phantom, Solflare, or Backpack to connect
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

