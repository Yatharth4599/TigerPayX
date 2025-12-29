import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { isAuthenticated } from "@/utils/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = async () => {
        if (!isAuthenticated()) {
          await router.push("/login");
          return;
        }
        setAuthChecked(true);
        setLoading(false);
      };
      checkAuth();
    }
  }, [router]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b00] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to TigerPayX</h1>
          <p className="text-xl text-gray-600">Send, receive, and manage your payments globally</p>
        </motion.div>

        {/* Main Payment Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Send Money */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-8 border border-orange-300 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Send Money</h2>
              <p className="text-white/90 mb-6">Send payments to anyone, anywhere instantly</p>
              <button className="w-full bg-white text-[#ff6b00] py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Send Payment
              </button>
            </div>
          </motion.div>

          {/* Receive Money / Payment Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 border border-green-400 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Receive Money</h2>
              <p className="text-white/90 mb-6">Create a payment link to receive payments</p>
              <button className="w-full bg-white text-green-600 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Create Payment Link
              </button>
            </div>
          </motion.div>
        </div>

        {/* Payment Methods Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h2>
            <p className="text-gray-600">Choose how you want to pay or receive money</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* UPI */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 hover:border-blue-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">UPI</h3>
              <p className="text-gray-600 text-sm">Pay using UPI</p>
            </motion.button>

            {/* AANI */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 hover:border-purple-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🇦🇪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AANI</h3>
              <p className="text-gray-600 text-sm">UAE payment system</p>
            </motion.button>

            {/* GCash */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-200 hover:border-cyan-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">GCash</h3>
              <p className="text-gray-600 text-sm">Philippines mobile wallet</p>
            </motion.button>

            {/* Bank Account */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 hover:border-gray-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank Account</h3>
              <p className="text-gray-600 text-sm">Direct bank transfer</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Crypto Wallet Connection & Tiger Card */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Connect Crypto Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 border border-indigo-400 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Connect Wallet</h2>
              <p className="text-white/90 mb-6">Connect your crypto wallet to make payments</p>
              
              {!walletConnected ? (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="w-full bg-white text-indigo-600 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg mb-4"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="text-white font-semibold">Wallet Connected</div>
                  <div className="text-white/70 text-sm">0x1234...5678</div>
                </div>
              )}

              {/* Wallet Options */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">Phantom</div>
                  <div className="text-white/70 text-xs">Solana</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">MetaMask</div>
                  <div className="text-white/70 text-xs">Ethereum</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">WalletConnect</div>
                  <div className="text-white/70 text-xs">Multi-chain</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">Coinbase</div>
                  <div className="text-white/70 text-xs">Multi-chain</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tiger Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-8 border border-orange-300 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Tiger Card</h2>
              <p className="text-white/90 mb-6">Spend your crypto anywhere, anytime</p>
              
              {/* Card Preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                <div className="text-white font-bold text-xl mb-4">TigerPayX</div>
                <div className="text-white/80 text-sm mb-2">Card Number</div>
                <div className="text-white font-mono text-lg mb-4">**** **** **** 1234</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-white/80 text-xs mb-1">Valid Thru</div>
                    <div className="text-white">12/25</div>
                  </div>
                  <div className="text-3xl">🦁</div>
                </div>
              </div>

              <button className="w-full bg-white text-[#ff6b00] py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Apply for Tiger Card
              </button>
            </div>
          </motion.div>
        </div>

        {/* Earn Yield & Lending Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Earn Yield */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Earn Yield</h2>
            <p className="text-gray-600 mb-6">Get 2% on every swap as a liquidity provider</p>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <div className="text-5xl font-bold text-green-600 mb-2">2%</div>
              <div className="text-gray-600">Per Swap Transaction</div>
            </div>
            <button className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg">
              Start Earning Yield
            </button>
          </motion.div>

          {/* Take Loan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Take Loan</h2>
            <p className="text-gray-600 mb-6">Access loans with or without collateral</p>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">Flexible</div>
              <div className="text-gray-600">Collateral & Collateral-Free Options</div>
            </div>
            <button className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg">
              Apply for Loan
            </button>
          </motion.div>
        </div>

        {/* Roar Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-8 md:p-12 border border-orange-300 shadow-2xl relative overflow-hidden mb-12"
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm text-white mb-4">
                  <span className="h-2 w-2 bg-white rounded-full"></span>
                  <span>Your Credit Score</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Roar Score
                </h2>
                <p className="text-white/90 text-lg">
                  Build your creditworthiness and unlock better loan terms
                </p>
              </div>
              <div className="text-6xl">🦁</div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Score Display */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-white mb-2">850</div>
                  <div className="text-white/80 text-sm uppercase tracking-wider">Excellent</div>
                </div>
                
                {/* Score Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white/90 text-sm mb-2">
                      <span>Wallet Activity</span>
                      <span>90%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "90%" }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-white/90 text-sm mb-2">
                      <span>Transaction History</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-white/90 text-sm mb-2">
                      <span>Payment Frequency</span>
                      <span>95%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 1, delay: 1.4 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Options */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💎</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">Collateral Loans</div>
                      <div className="text-white/70 text-sm">Higher Limits</div>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm mb-4">
                    Provide collateral for higher loan amounts and better interest rates
                  </div>
                  <button className="w-full bg-white text-[#ff6b00] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Learn More
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">Collateral-Free Loans</div>
                      <div className="text-white/70 text-sm">Based on Roar Score</div>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm mb-4">
                    Get loans without collateral based on your transaction history and Roar Score
                  </div>
                  <button className="w-full bg-white text-[#ff6b00] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Connect Wallet</h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👻</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Phantom</div>
                      <div className="text-sm text-gray-600">Solana Wallet</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🦊</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">MetaMask</div>
                      <div className="text-sm text-gray-600">Ethereum Wallet</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🔵</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">WalletConnect</div>
                      <div className="text-sm text-gray-600">Multi-chain Wallet</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">C</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Coinbase Wallet</div>
                      <div className="text-sm text-gray-600">Multi-chain Wallet</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
