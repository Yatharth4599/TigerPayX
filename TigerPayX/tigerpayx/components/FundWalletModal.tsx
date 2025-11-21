// Fund Wallet Modal - Add tokens to TigerPayX wallet from external wallets

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "@/components/CopyButton";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { formatAddress } from "@/utils/formatting";
import { getDetectedWallets, type DetectedWallet } from "@/app/wallet/walletDetection";
import { SOLANA_CONFIG, getTokenMint } from "@/shared/config";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function FundWalletModal({ isOpen, onClose, walletAddress }: FundWalletModalProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC" | "USDT" | "TT">("SOL");

  useEffect(() => {
    if (isOpen) {
      const wallets = getDetectedWallets();
      setDetectedWallets(wallets.filter((w) => w.installed));
    }
  }, [isOpen]);

  const handleOpenWallet = (walletName: string) => {
    // Show instructions to open the wallet
    const network = SOLANA_CONFIG.network === "mainnet-beta" ? "Mainnet" : "Devnet";
    const message = `To send ${selectedToken} to your TigerPayX wallet:\n\n1. Open ${walletName}\n2. Click "Send"\n3. Paste this address:\n${walletAddress}\n4. Select ${selectedToken}\n5. Enter amount and confirm\n\n⚠️ Make sure you're on Solana ${network}`;
    
    // Copy address to clipboard for easy pasting
    navigator.clipboard.writeText(walletAddress).then(() => {
      alert(message + "\n\n✅ Address copied to clipboard!");
    }).catch(() => {
      alert(message);
    });
  };

  if (!isOpen) return null;

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
            <h2 className="text-2xl font-bold text-white">Fund Your Wallet</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Select Token</label>
              <div className="grid grid-cols-4 gap-2">
                {(["SOL", "USDC", "USDT", "TT"] as const).map((token) => (
                  <button
                    key={token}
                    onClick={() => setSelectedToken(token)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                      selectedToken === token
                        ? "bg-[#ff6b00] text-black"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4 flex flex-col items-center">
              <p className="text-sm text-zinc-400 mb-3">Scan to send {selectedToken}</p>
              <QRCodeDisplay value={walletAddress} size={200} />
            </div>

            {/* Wallet Address */}
            <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-zinc-400">Your TigerPayX Wallet Address</p>
                <CopyButton text={walletAddress} />
              </div>
              <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
            </div>

            {/* Detected Wallets */}
            {detectedWallets.length > 0 && (
              <div>
                <p className="text-sm text-zinc-400 mb-3">Send from your wallet</p>
                <div className="space-y-2">
                  {detectedWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleOpenWallet(wallet.name)}
                      className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg p-4 hover:border-[#ff6b00]/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div className="text-left">
                          <p className="text-white font-semibold">Send from {wallet.name}</p>
                          <p className="text-xs text-zinc-400">Open {wallet.name} to send {selectedToken}</p>
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
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-400 mb-2">How to fund your wallet:</p>
              <ol className="text-xs text-blue-300 space-y-1 list-decimal list-inside">
                <li>Copy your TigerPayX wallet address above</li>
                <li>Open your external wallet (Phantom, Solflare, etc.)</li>
                <li>Select {selectedToken} and click "Send"</li>
                <li>Paste your TigerPayX address as the recipient</li>
                <li>Enter the amount and confirm the transaction</li>
              </ol>
            </div>

            {/* Network Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                ⚠️ Make sure you're sending on <strong>Solana {SOLANA_CONFIG.network === "mainnet-beta" ? "Mainnet" : "Devnet"}</strong> network
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

