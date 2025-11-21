// New DeFi-only TigerPayX Dashboard
// Removed all fiat, KYC, Roar Score, and credit features

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { isAuthenticated, getAuthHeader } from "@/utils/auth";
import { createWallet, hasWallet, getStoredWalletAddress } from "@/app/wallet/createWallet";
import { getAllTokenBalances } from "@/app/wallet/solanaUtils";
import { sendP2PPayment } from "@/app/payments/p2pSend";
import { parseQRCode } from "@/app/payments/qrScanner";
import { getSwapPreview, executeSwap } from "@/app/swap/swapExecute";
import { registerMerchant, getUserMerchants } from "@/app/merchant/registerMerchant";
import { createPayLink } from "@/app/merchant/createPayLink";
import type { Token, WalletBalance, Transaction as TxType } from "@/shared/types";

type ActiveTab = "home" | "send" | "swap" | "earn" | "merchant";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<TxType[]>([]);

  // Send tab state
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendToken, setSendToken] = useState<Token>("USDC");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);

  // Swap tab state
  const [swapFrom, setSwapFrom] = useState<Token>("USDC");
  const [swapTo, setSwapTo] = useState<Token>("SOL");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapPreview, setSwapPreview] = useState<any>(null);
  const [swapping, setSwapping] = useState(false);

  // Merchant tab state
  const [merchants, setMerchants] = useState<any[]>([]);
  const [showMerchantForm, setShowMerchantForm] = useState(false);

  // Check authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = async () => {
        if (!isAuthenticated()) {
          await router.push("/login");
        } else {
          setAuthChecked(true);
          initializeWallet();
        }
      };
      checkAuth();
    }
  }, [router]);

  // Initialize wallet
  const initializeWallet = async () => {
    try {
      if (!hasWallet()) {
        // Create new wallet
        const wallet = createWallet();
        setWalletAddress(wallet.publicKey);
      } else {
        const address = getStoredWalletAddress();
        setWalletAddress(address);
      }

      // Load balances
      if (walletAddress) {
        await loadBalances();
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load balances
  const loadBalances = async () => {
    if (!walletAddress) return;
    try {
      const bal = await getAllTokenBalances(walletAddress);
      setBalances(bal);
    } catch (error) {
      console.error("Error loading balances:", error);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/transactions", {
        headers: getAuthHeader(),
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // Handle send payment
  const handleSend = async () => {
    if (!sendToAddress || !sendAmount) return;
    setSending(true);
    try {
      const amount = parseFloat(sendAmount);
      const result = await sendP2PPayment(sendToAddress, sendToken, amount);
      if (result.success) {
        alert(`Payment sent! TX: ${result.signature}`);
        setSendToAddress("");
        setSendAmount("");
        await loadBalances();
        await loadTransactions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Handle swap preview
  const handleSwapPreview = async () => {
    if (!swapAmount) return;
    try {
      const amount = parseFloat(swapAmount);
      const preview = await getSwapPreview(swapFrom, swapTo, amount);
      setSwapPreview(preview);
    } catch (error) {
      console.error("Error getting swap preview:", error);
    }
  };

  // Handle swap execute
  const handleSwap = async () => {
    if (!swapAmount || !swapPreview) return;
    setSwapping(true);
    try {
      const amount = parseFloat(swapAmount);
      const result = await executeSwap(swapFrom, swapTo, amount);
      if (result.success) {
        alert(`Swap completed! TX: ${result.signature}`);
        setSwapAmount("");
        setSwapPreview(null);
        await loadBalances();
        await loadTransactions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSwapping(false);
    }
  };

  // Load merchants
  const loadMerchants = async () => {
    try {
      const result = await getUserMerchants();
      if (result.success && result.merchants) {
        setMerchants(result.merchants);
      }
    } catch (error) {
      console.error("Error loading merchants:", error);
    }
  };

  useEffect(() => {
    if (authChecked && walletAddress) {
      loadBalances();
      loadTransactions();
      if (activeTab === "merchant") {
        loadMerchants();
      }
    }
  }, [authChecked, walletAddress, activeTab]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-[#0a0d0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d0f]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          {(["home", "send", "swap", "earn", "merchant"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "text-[#ff6b00] border-b-2 border-[#ff6b00]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#161A1E] border border-white/5 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Wallet</h2>
              {walletAddress && (
                <div className="mb-4">
                  <p className="text-sm text-zinc-400 mb-1">Address</p>
                  <p className="text-white font-mono text-sm">{walletAddress}</p>
                </div>
              )}
              {balances && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">SOL</p>
                    <p className="text-xl font-bold text-white">{balances.sol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">USDC</p>
                    <p className="text-xl font-bold text-white">{balances.usdc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">USDT</p>
                    <p className="text-xl font-bold text-white">{balances.usdt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">TT</p>
                    <p className="text-xl font-bold text-white">{balances.tt}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab("send")}
                className="bg-[#161A1E] border border-white/5 rounded-xl p-6 hover:border-[#ff6b00]/50 transition-colors"
              >
                <p className="text-white font-semibold">Send</p>
              </button>
              <button
                onClick={() => setActiveTab("swap")}
                className="bg-[#161A1E] border border-white/5 rounded-xl p-6 hover:border-[#ff6b00]/50 transition-colors"
              >
                <p className="text-white font-semibold">Swap</p>
              </button>
              <button
                onClick={() => setActiveTab("earn")}
                className="bg-[#161A1E] border border-white/5 rounded-xl p-6 hover:border-[#ff6b00]/50 transition-colors"
              >
                <p className="text-white font-semibold">Earn</p>
              </button>
              <button
                onClick={() => setActiveTab("merchant")}
                className="bg-[#161A1E] border border-white/5 rounded-xl p-6 hover:border-[#ff6b00]/50 transition-colors"
              >
                <p className="text-white font-semibold">Merchant</p>
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#161A1E] border border-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="text-zinc-400">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center py-2 border-b border-white/5">
                      <div>
                        <p className="text-white">{tx.type}</p>
                        <p className="text-sm text-zinc-400">{tx.token} {tx.amount}</p>
                      </div>
                      <p className="text-sm text-zinc-400">{tx.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Send Tab */}
        {activeTab === "send" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161A1E] border border-white/5 rounded-xl p-6 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">To Address</label>
                <input
                  type="text"
                  value={sendToAddress}
                  onChange={(e) => setSendToAddress(e.target.value)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                  placeholder="Solana address"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Token</label>
                <select
                  value={sendToken}
                  onChange={(e) => setSendToken(e.target.value as Token)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="TT">TT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !sendToAddress || !sendAmount}
                className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Swap Tab */}
        {activeTab === "swap" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161A1E] border border-white/5 rounded-xl p-6 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">From</label>
                <select
                  value={swapFrom}
                  onChange={(e) => setSwapFrom(e.target.value as Token)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="TT">TT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">To</label>
                <select
                  value={swapTo}
                  onChange={(e) => setSwapTo(e.target.value as Token)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="TT">TT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="w-full bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-3 text-white"
                  placeholder="0.00"
                />
              </div>
              {swapPreview && (
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-zinc-400">You will receive</p>
                  <p className="text-xl font-bold text-white">{swapPreview.outputAmount} {swapTo}</p>
                  <p className="text-xs text-zinc-500 mt-1">Price impact: {swapPreview.priceImpact.toFixed(2)}%</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSwapPreview}
                  disabled={!swapAmount}
                  className="flex-1 bg-zinc-700 text-white font-semibold py-3 rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-50"
                >
                  Preview
                </button>
                <button
                  onClick={handleSwap}
                  disabled={swapping || !swapPreview}
                  className="flex-1 bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
                >
                  {swapping ? "Swapping..." : "Swap"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Earn Tab */}
        {activeTab === "earn" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#161A1E] border border-white/5 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Earn Yield</h2>
              <p className="text-zinc-400 mb-6">Stake SOL to earn yield</p>
              <div className="space-y-4">
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Jito Staking</h3>
                  <p className="text-sm text-zinc-400 mb-4">Stake SOL with Jito validators</p>
                  <button className="bg-[#ff6b00] text-black font-semibold px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors">
                    Coming Soon
                  </button>
                </div>
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Marinade Staking</h3>
                  <p className="text-sm text-zinc-400 mb-4">Liquid staking with Marinade</p>
                  <button className="bg-[#ff6b00] text-black font-semibold px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Merchant Tab */}
        {activeTab === "merchant" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#161A1E] border border-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Merchant Dashboard</h2>
                <button
                  onClick={() => setShowMerchantForm(true)}
                  className="bg-[#ff6b00] text-black font-semibold px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  Register Merchant
                </button>
              </div>
              {merchants.length === 0 ? (
                <p className="text-zinc-400">No merchants registered</p>
              ) : (
                <div className="space-y-4">
                  {merchants.map((merchant) => (
                    <div key={merchant.id} className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white">{merchant.name}</h3>
                      <p className="text-sm text-zinc-400">{merchant.merchantId}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

