import { motion } from "framer-motion";
import { useState } from "react";
import { CryptoCard } from "./CryptoCard";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"wallet" | "payments" | "lending">("wallet");

  return (
    <section className="section-padding bg-gradient-to-b from-white via-orange-50/30 to-amber-50/20 py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden">
      <div className="max-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium mb-4">
            See It In Action
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900 mb-4">
            Experience TigerPayX
          </h2>
          <p className="max-w-2xl mx-auto text-base text-gray-700">
            Explore our features with an interactive preview of the TigerPayX experience.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {(["wallet", "payments", "lending"] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                activeTab === tab
                  ? "bg-[#ff6b00] text-white shadow-lg shadow-orange-500/20"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Demo Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-8 lg:p-12"
        >
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Wallet</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CryptoCard
                  token="SOL"
                  amount="12.5"
                  value="1,250.00"
                  change="+2.5%"
                  gradient="rgba(255, 107, 0, 0.9), rgba(255, 140, 66, 0.8)"
                  icon="⚡"
                  index={0}
                />
                <CryptoCard
                  token="USDC"
                  amount="5,000"
                  value="5,000.00"
                  change="+0.1%"
                  gradient="rgba(0, 132, 255, 0.9), rgba(100, 181, 246, 0.8)"
                  icon="💵"
                  index={1}
                />
                <CryptoCard
                  token="USDT"
                  amount="2,500"
                  value="2,500.00"
                  change="+0.1%"
                  gradient="rgba(38, 166, 91, 0.9), rgba(76, 175, 80, 0.8)"
                  icon="💸"
                  index={2}
                />
                <CryptoCard
                  token="RoaR"
                  amount="850"
                  value="850"
                  change="+5.2%"
                  gradient="rgba(156, 39, 176, 0.9), rgba(186, 104, 200, 0.8)"
                  icon="⭐"
                  index={3}
                />
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Payment</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Solana address..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Amount
                    </label>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none"
                      readOnly
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full bg-[#ff6b00] py-3 text-white font-semibold hover:bg-[#e55a00] transition-colors"
                  >
                    Send Payment
                  </motion.button>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-32 w-32 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-6xl">📱</span>
                    </div>
                    <p className="text-sm text-gray-600">QR Code Preview</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lending" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Jupiter Lending</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="glass-panel p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <h4 className="font-semibold text-gray-900 mb-2">Borrow</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-2">5.2% APR</p>
                    <p className="text-sm text-gray-600">Based on your RoaR Score</p>
                  </div>
                  <div className="glass-panel p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                    <h4 className="font-semibold text-gray-900 mb-2">Lend</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-2">8.5% APY</p>
                    <p className="text-sm text-gray-600">Earn passive income</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-panel p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Your RoaR Score</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Score</span>
                        <span className="font-bold text-gray-900">850</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                          className="h-3 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff8c42]"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Excellent score! You qualify for the best rates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

