import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TiltCard } from "./TiltCard";
import { BalanceCard } from "./BalanceCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { showToast } from "./Toast";
import { CopyButton } from "./CopyButton";
import { formatAddress, formatTokenAmount } from "@/utils/formatting";

type ActiveSection = "overview" | "ramp" | "payments" | "lending" | "transactions" | "analytics";

interface MerchantDashboardProps {
  merchant: any;
  walletAddress: string;
  balances: any;
  transactions: any[];
  onRefresh: () => void;
}

export function MerchantDashboard({
  merchant,
  walletAddress,
  balances,
  transactions,
  onRefresh,
}: MerchantDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [roarScore, setRoarScore] = useState(750); // Mock RoaR Score
  const [yieldEarnings, setYieldEarnings] = useState(0);
  const [payLinks, setPayLinks] = useState<any[]>([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showCreatePayLink, setShowCreatePayLink] = useState(false);
  const [rampMethod, setRampMethod] = useState<"bank" | "upi" | "gcash" | "aani">("bank");
  const [rampAmount, setRampAmount] = useState("");
  const [lendingAmount, setLendingAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC" | "USDT">("USDC");

  // Calculate total portfolio value
  const totalPortfolio = (balances?.SOL || 0) * 100 + (balances?.USDC || 0) + (balances?.USDT || 0);

  const sections = [
    { id: "overview" as ActiveSection, label: "Overview", icon: "📊" },
    { id: "ramp" as ActiveSection, label: "Add/Withdraw", icon: "💳" },
    { id: "payments" as ActiveSection, label: "Payment Links", icon: "🔗" },
    { id: "lending" as ActiveSection, label: "Earn Yield", icon: "💰" },
    { id: "transactions" as ActiveSection, label: "Transactions", icon: "📝" },
    { id: "analytics" as ActiveSection, label: "Analytics", icon: "📈" },
  ];

  const handleAddMoney = async () => {
    if (!rampAmount || parseFloat(rampAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    // TODO: Implement actual on-ramp integration
    showToast(`Adding ${rampAmount} ${selectedToken} via ${rampMethod}...`, "info");
    setShowAddMoney(false);
  };

  const handleWithdraw = async () => {
    if (!rampAmount || parseFloat(rampAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    // TODO: Implement actual off-ramp integration
    showToast(`Withdrawing ${rampAmount} ${selectedToken} via ${rampMethod}...`, "info");
    setShowWithdraw(false);
  };

  const handleLend = async () => {
    if (!lendingAmount || parseFloat(lendingAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    // TODO: Implement actual lending integration
    showToast(`Lending ${lendingAmount} ${selectedToken} to earn yield...`, "info");
    setLendingAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50/30 to-orange-50/50">
      <div className="max-width section-padding py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {merchant?.name || "Merchant Dashboard"}
              </h1>
              <p className="text-gray-600">Manage your neo-bank account</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full bg-green-50 border border-green-200"
              >
                <span className="text-sm font-semibold text-green-700">
                  RoaR Score: {roarScore}
                </span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRefresh}
                className="px-4 py-2 rounded-full bg-white border border-orange-200 text-gray-700 hover:bg-orange-50 transition-colors"
              >
                🔄 Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 border border-orange-200">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-[#ff6b00] text-white shadow-lg"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Portfolio Overview */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <BalanceCard
                  label="Total Portfolio"
                  amount={totalPortfolio.toFixed(2)}
                  currency="USD"
                  icon="💼"
                  gradient="from-orange-200 to-orange-100"
                  index={0}
                />
                <BalanceCard
                  label="SOL Balance"
                  amount={formatTokenAmount(balances?.SOL || 0, "SOL")}
                  currency="SOL"
                  icon="◎"
                  gradient="from-purple-200 to-purple-100"
                  index={1}
                />
                <BalanceCard
                  label="USDC Balance"
                  amount={formatTokenAmount(balances?.USDC || 0, "USDC")}
                  currency="USDC"
                  icon="💵"
                  gradient="from-blue-200 to-blue-100"
                  index={2}
                />
                <BalanceCard
                  label="Yield Earnings"
                  amount={yieldEarnings.toFixed(2)}
                  currency="USD"
                  icon="📈"
                  gradient="from-green-200 to-green-100"
                  index={3}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid gap-6 md:grid-cols-3">
                <TiltCard>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowAddMoney(true)}
                    className="colorful-card p-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center text-3xl">
                        ➕
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Add Money</h3>
                        <p className="text-sm text-gray-600">Via bank, UPI, GCash, or Aani</p>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>

                <TiltCard>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowCreatePayLink(true)}
                    className="colorful-card p-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-3xl">
                        🔗
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Create PayLink</h3>
                        <p className="text-sm text-gray-600">Generate payment links</p>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>

                <TiltCard>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveSection("lending")}
                    className="colorful-card p-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center text-3xl">
                        💎
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Earn 12% APY</h3>
                        <p className="text-sm text-gray-600">Start lending now</p>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              </div>

              {/* RoaR Score Card */}
              <TiltCard>
                <div className="colorful-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Your RoaR Score</h3>
                    <span className="text-3xl font-bold text-[#ff6b00]">{roarScore}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Credit Rating</span>
                      <span className="font-semibold text-gray-900">Excellent</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(roarScore / 1000) * 100}%` }}
                        className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ff8c42]"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Higher scores unlock better lending rates and financial services
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {activeSection === "ramp" && (
            <motion.div
              key="ramp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Add Money */}
                <TiltCard>
                  <div className="colorful-card p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Add Money</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "bank", label: "Bank Account", icon: "🏦" },
                            { id: "upi", label: "UPI", icon: "🇮🇳" },
                            { id: "gcash", label: "GCash", icon: "🇵🇭" },
                            { id: "aani", label: "Aani", icon: "🇦🇪" },
                          ].map((method) => (
                            <motion.button
                              key={method.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setRampMethod(method.id as any)}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                rampMethod === method.id
                                  ? "border-[#ff6b00] bg-orange-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="text-2xl mb-1">{method.icon}</div>
                              <div className="text-xs font-medium text-gray-700">{method.label}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={rampAmount}
                          onChange={(e) => setRampAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddMoney}
                        className="w-full py-3 rounded-xl bg-[#ff6b00] text-white font-semibold hover:bg-[#e55a00] transition-colors"
                      >
                        Add Money
                      </motion.button>
                    </div>
                  </div>
                </TiltCard>

                {/* Withdraw Money */}
                <TiltCard>
                  <div className="colorful-card p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Money</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "bank", label: "Bank Account", icon: "🏦" },
                            { id: "upi", label: "UPI", icon: "🇮🇳" },
                            { id: "gcash", label: "GCash", icon: "🇵🇭" },
                            { id: "aani", label: "Aani", icon: "🇦🇪" },
                          ].map((method) => (
                            <motion.button
                              key={method.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setRampMethod(method.id as any)}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                rampMethod === method.id
                                  ? "border-[#ff6b00] bg-orange-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="text-2xl mb-1">{method.icon}</div>
                              <div className="text-xs font-medium text-gray-700">{method.label}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={rampAmount}
                          onChange={(e) => setRampAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleWithdraw}
                        className="w-full py-3 rounded-xl bg-white border-2 border-[#ff6b00] text-[#ff6b00] font-semibold hover:bg-orange-50 transition-colors"
                      >
                        Withdraw
                      </motion.button>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {activeSection === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Payment Links</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreatePayLink(true)}
                  className="px-6 py-3 rounded-full bg-[#ff6b00] text-white font-semibold hover:bg-[#e55a00] transition-colors"
                >
                  ➕ Create PayLink
                </motion.button>
              </div>

              {payLinks.length === 0 ? (
                <TiltCard>
                  <div className="colorful-card p-12 text-center">
                    <div className="text-6xl mb-4">🔗</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment Links</h3>
                    <p className="text-gray-600 mb-6">Create your first payment link to start accepting payments</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreatePayLink(true)}
                      className="px-6 py-3 rounded-full bg-[#ff6b00] text-white font-semibold hover:bg-[#e55a00] transition-colors"
                    >
                      Create PayLink
                    </motion.button>
                  </div>
                </TiltCard>
              ) : (
                <div className="grid gap-4">
                  {payLinks.map((link, index) => (
                    <TiltCard key={link.id}>
                      <div className="colorful-card p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {link.amount} {link.token}
                            </h3>
                            <p className="text-sm text-gray-600">{link.description || "No description"}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Status: <span className="font-semibold">{link.status}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CopyButton text={typeof window !== "undefined" ? `${window.location.origin}/pay/${link.payLinkId}` : ""} />
                            <span className="text-xs text-gray-500">{link.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeSection === "lending" && (
            <motion.div
              key="lending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <TiltCard>
                  <div className="colorful-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Earn Yield</h3>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">12% APY</div>
                        <div className="text-sm text-gray-600">Annual Yield</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Token
                        </label>
                        <select
                          value={selectedToken}
                          onChange={(e) => setSelectedToken(e.target.value as any)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none"
                        >
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                          <option value="USDT">USDT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount to Lend
                        </label>
                        <input
                          type="number"
                          value={lendingAmount}
                          onChange={(e) => setLendingAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {formatTokenAmount(balances?.[selectedToken] || 0, selectedToken)}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLend}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors"
                      >
                        Start Earning Yield
                      </motion.button>
                    </div>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="colorful-card p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Active Positions</h3>
                    <div className="space-y-3">
                      {yieldEarnings > 0 ? (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">Lending Position</p>
                              <p className="text-sm text-gray-600">Earning 12% APY</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">+${yieldEarnings.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Total Earnings</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <div className="text-4xl mb-2">💤</div>
                          <p>No active lending positions</p>
                          <p className="text-sm mt-1">Start lending to earn yield</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {activeSection === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <TiltCard>
                  <div className="colorful-card p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions</h3>
                    <p className="text-gray-600">Your transaction history will appear here</p>
                  </div>
                </TiltCard>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx, index) => (
                    <TiltCard key={tx.id || index}>
                      <div className="colorful-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center text-xl">
                              {tx.type === "send" ? "📤" : tx.type === "receive" ? "📥" : "💳"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{tx.type}</p>
                              <p className="text-sm text-gray-600">{tx.description || "Transaction"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${tx.type === "receive" ? "text-green-600" : "text-gray-900"}`}>
                              {tx.type === "receive" ? "+" : "-"}{formatTokenAmount(tx.amount || 0, tx.token || "USDC")}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeSection === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <TiltCard>
                  <div className="colorful-card p-6">
                    <div className="text-3xl mb-2">💰</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Revenue</h3>
                    <p className="text-2xl font-bold text-[#ff6b00]">${(totalPortfolio * 0.3).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                </TiltCard>
                <TiltCard>
                  <div className="colorful-card p-6">
                    <div className="text-3xl mb-2">🔗</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Links</h3>
                    <p className="text-2xl font-bold text-[#ff6b00]">{payLinks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active links</p>
                  </div>
                </TiltCard>
                <TiltCard>
                  <div className="colorful-card p-6">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Success Rate</h3>
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                    <p className="text-xs text-gray-500 mt-1">Payment success</p>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

