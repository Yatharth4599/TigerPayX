import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "./Toast";
import { CopyButton } from "./CopyButton";
import { formatTokenAmount } from "@/utils/formatting";

type ActiveSection = "overview" | "ramp" | "payments" | "lending" | "borrow" | "transactions" | "analytics";

interface MerchantDashboardProps {
  merchant: any;
  walletAddress: string;
  balances: any;
  transactions: any[];
  onRefresh: () => void;
  onCreatePayLink?: () => void;
}

// Neo-Bank Icons
const OverviewIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const RampIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PaymentsIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const LendingIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const BorrowIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TransactionsIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const AnalyticsIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export function MerchantDashboard({
  merchant,
  walletAddress,
  balances,
  transactions,
  onRefresh,
  onCreatePayLink,
}: MerchantDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [roarScore] = useState(750);
  const [yieldEarnings] = useState(1247.50);
  const [payLinks, setPayLinks] = useState<any[]>([]);
  const [rampMethod, setRampMethod] = useState<"bank" | "upi" | "gcash" | "aani">("bank");
  const [rampAmount, setRampAmount] = useState("");
  const [lendingAmount, setLendingAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [borrowToken, setBorrowToken] = useState<"SOL" | "USDC" | "USDT">("USDC");
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC" | "USDT">("USDC");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calculate balances
  const solPrice = 100;
  const totalPortfolio = 
    (parseFloat(balances?.sol || "0") * solPrice) + 
    (parseFloat(balances?.usdc || "0")) + 
    (parseFloat(balances?.usdt || "0"));

  // Calculate loan terms based on RoaR Score
  const getLoanTerms = () => {
    if (roarScore >= 800) {
      return { interestRate: 4.5, maxLoan: 100000, collateralRatio: 1.2, tier: "Excellent" };
    } else if (roarScore >= 700) {
      return { interestRate: 6.0, maxLoan: 50000, collateralRatio: 1.3, tier: "Good" };
    } else if (roarScore >= 600) {
      return { interestRate: 8.5, maxLoan: 25000, collateralRatio: 1.5, tier: "Fair" };
    } else {
      return { interestRate: 12.0, maxLoan: 10000, collateralRatio: 2.0, tier: "Basic" };
    }
  };

  const loanTerms = getLoanTerms();

  const sections = [
    { id: "overview" as ActiveSection, label: "Overview", icon: OverviewIcon },
    { id: "ramp" as ActiveSection, label: "Add/Withdraw", icon: RampIcon },
    { id: "payments" as ActiveSection, label: "Payment Links", icon: PaymentsIcon },
    { id: "lending" as ActiveSection, label: "Earn Yield", icon: LendingIcon },
    { id: "borrow" as ActiveSection, label: "Take Loan", icon: BorrowIcon },
    { id: "transactions" as ActiveSection, label: "Transactions", icon: TransactionsIcon },
    { id: "analytics" as ActiveSection, label: "Analytics", icon: AnalyticsIcon },
  ];

  const handleAddMoney = () => {
    if (!rampAmount || parseFloat(rampAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    showToast(`Adding ${rampAmount} ${selectedToken} via ${rampMethod}...`, "info");
    setRampAmount("");
  };

  const handleWithdraw = () => {
    if (!rampAmount || parseFloat(rampAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    showToast(`Withdrawing ${rampAmount} ${selectedToken} via ${rampMethod}...`, "info");
    setRampAmount("");
  };

  const handleLend = () => {
    if (!lendingAmount || parseFloat(lendingAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    showToast(`Lending ${lendingAmount} ${selectedToken} to earn yield...`, "info");
    setLendingAmount("");
  };

  const handleBorrow = () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    const amount = parseFloat(borrowAmount);
    if (amount > loanTerms.maxLoan) {
      showToast(`Maximum loan amount is $${loanTerms.maxLoan.toLocaleString()} for your RoaR Score tier`, "error");
      return;
    }
    const collateralNeeded = amount * loanTerms.collateralRatio;
    showToast(`Requesting loan of ${borrowAmount} ${borrowToken} via Jupiter...`, "info");
    // TODO: Integrate with Jupiter lending protocol
    setBorrowAmount("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation - Neo-Bank Style */}
      <motion.div
        initial={{ width: sidebarOpen ? 280 : 80 }}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-xl font-bold text-gray-900">TigerPayX</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#ff6b00] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <IconComponent active={isActive} />
                {sidebarOpen && (
                  <span className="font-medium">{section.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RoaR Score Badge */}
        <div className="p-4 border-t border-gray-200">
          <div className={`${sidebarOpen ? "p-4" : "p-3"} bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200`}>
            {sidebarOpen ? (
              <>
                <p className="text-xs text-gray-600 mb-1">RoaR Score</p>
                <p className="text-2xl font-bold text-[#ff6b00]">{roarScore}</p>
                <p className="text-xs text-gray-500 mt-1">Excellent</p>
              </>
            ) : (
              <div className="text-center">
                <p className="text-xl font-bold text-[#ff6b00]">{roarScore}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {merchant?.name || "Merchant Account"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Account ID: {merchant?.merchantId || "DEMO_001"}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <AnimatePresence mode="wait">
              {activeSection === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Main Balance Card */}
                  <div className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-2xl p-8 text-white shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Total Balance</p>
                    <h2 className="text-5xl font-bold mb-2">
                      ${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className="text-sm opacity-80">USD Equivalent</p>
                  </div>

                  {/* Balance Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500 mb-2">SOL</p>
                      <p className="text-2xl font-bold text-gray-900">{formatTokenAmount(balances?.sol || "0", "SOL")}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500 mb-2">USDC</p>
                      <p className="text-2xl font-bold text-gray-900">{formatTokenAmount(balances?.usdc || "0", "USDC")}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500 mb-2">USDT</p>
                      <p className="text-2xl font-bold text-gray-900">{formatTokenAmount(balances?.usdt || "0", "USDT")}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveSection("ramp")}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#ff6b00] hover:shadow-md transition-all text-left group"
                    >
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Add Funds</h3>
                      <p className="text-sm text-gray-500">Deposit money</p>
                    </button>

                    <button
                      onClick={() => setActiveSection("payments")}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#ff6b00] hover:shadow-md transition-all text-left group"
                    >
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <PaymentsIcon active={false} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Payment Links</h3>
                      <p className="text-sm text-gray-500">Create links</p>
                    </button>

                    <button
                      onClick={() => setActiveSection("lending")}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#ff6b00] hover:shadow-md transition-all text-left group"
                    >
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        <LendingIcon active={false} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Earn Yield</h3>
                      <p className="text-sm text-gray-500">12% APY</p>
                    </button>

                    <button
                      onClick={() => setActiveSection("borrow")}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#ff6b00] hover:shadow-md transition-all text-left group"
                    >
                      <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                        <BorrowIcon active={false} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Take Loan</h3>
                      <p className="text-sm text-gray-500">From {loanTerms.interestRate}% APR</p>
                    </button>
                  </div>

                  {/* RoaR Score & Yield Earnings */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">RoaR Credit Score</h3>
                      <div className="flex items-end gap-4 mb-4">
                        <p className="text-4xl font-bold text-[#ff6b00]">{roarScore}</p>
                        <p className="text-sm text-gray-500 mb-2">/ 1000</p>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(roarScore / 1000) * 100}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ff8c42]"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">On-chain</p>
                          <p className="text-sm font-semibold text-gray-900">Excellent</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reliability</p>
                          <p className="text-sm font-semibold text-gray-900">98.5%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Activity</p>
                          <p className="text-sm font-semibold text-gray-900">Active</p>
                        </div>
                      </div>
                    </div>

                    {yieldEarnings > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Earnings</h3>
                        <p className="text-4xl font-bold text-green-600 mb-2">
                          +${yieldEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600">Total earned from lending</p>
                      </div>
                    )}
                  </div>
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
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Add Funds</h3>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: "bank", label: "Bank Account" },
                              { id: "upi", label: "UPI" },
                              { id: "gcash", label: "GCash" },
                              { id: "aani", label: "Aani" },
                            ].map((method) => (
                              <button
                                key={method.id}
                                onClick={() => setRampMethod(method.id as any)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  rampMethod === method.id
                                    ? "border-[#ff6b00] bg-orange-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">{method.label}</span>
                                  <div className={`h-2 w-2 rounded-full ${rampMethod === method.id ? "bg-[#ff6b00]" : "bg-gray-300"}`} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={rampAmount}
                              onChange={(e) => setRampAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none text-gray-900"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value as any)}
                                className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                              >
                                <option value="USDC">USDC</option>
                                <option value="USDT">USDT</option>
                                <option value="SOL">SOL</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleAddMoney}
                          className="w-full py-3 rounded-lg bg-[#ff6b00] text-white font-semibold hover:bg-[#e55a00] transition-colors"
                        >
                          Add Funds
                        </button>
                      </div>
                    </div>

                    {/* Withdraw Money */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Withdraw Funds</h3>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: "bank", label: "Bank Account" },
                              { id: "upi", label: "UPI" },
                              { id: "gcash", label: "GCash" },
                              { id: "aani", label: "Aani" },
                            ].map((method) => (
                              <button
                                key={method.id}
                                onClick={() => setRampMethod(method.id as any)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  rampMethod === method.id
                                    ? "border-[#ff6b00] bg-orange-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">{method.label}</span>
                                  <div className={`h-2 w-2 rounded-full ${rampMethod === method.id ? "bg-[#ff6b00]" : "bg-gray-300"}`} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={rampAmount}
                              onChange={(e) => setRampAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none text-gray-900"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value as any)}
                                className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                              >
                                <option value="USDC">USDC</option>
                                <option value="USDT">USDT</option>
                                <option value="SOL">SOL</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleWithdraw}
                          className="w-full py-3 rounded-lg bg-white border-2 border-[#ff6b00] text-[#ff6b00] font-semibold hover:bg-orange-50 transition-colors"
                        >
                          Withdraw Funds
                        </button>
                      </div>
                    </div>
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
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Payment Links</h2>
                      <p className="text-sm text-gray-500 mt-1">Create and manage payment links</p>
                    </div>
                    <button 
                      onClick={() => onCreatePayLink?.()}
                      className="px-5 py-2.5 rounded-lg bg-[#ff6b00] text-white font-semibold hover:bg-[#e55a00] transition-colors flex items-center gap-2"
                    >
                      <PaymentsIcon active={false} />
                      <span>Create Link</span>
                    </button>
                  </div>

                  {payLinks.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
                      <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <PaymentsIcon active={false} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Links</h3>
                      <p className="text-sm text-gray-500 mb-6">Create your first payment link to start accepting payments</p>
                      <button 
                        onClick={() => onCreatePayLink?.()}
                        className="px-6 py-3 rounded-lg bg-[#ff6b00] text-white font-semibold hover:bg-[#e55a00] transition-colors"
                      >
                        Create Payment Link
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {payLinks.map((link, index) => (
                          <div key={link.id || index} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-base font-semibold text-gray-900">
                                    {link.amount} {link.token}
                                  </h3>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    link.status === "paid" ? "bg-green-100 text-green-700" :
                                    link.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {link.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{link.description || "No description"}</p>
                                <p className="text-xs text-gray-400">{new Date(link.createdAt || Date.now()).toLocaleDateString()}</p>
                              </div>
                              <CopyButton text={typeof window !== "undefined" ? `${window.location.origin}/pay/${link.payLinkId}` : ""} />
                            </div>
                          </div>
                        ))}
                      </div>
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
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Earn Yield</h3>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">12%</p>
                          <p className="text-xs text-gray-500">APY</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
                          <select
                            value={selectedToken}
                            onChange={(e) => setSelectedToken(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none text-gray-900"
                          >
                            <option value="SOL">SOL - Solana</option>
                            <option value="USDC">USDC - USD Coin</option>
                            <option value="USDT">USDT - Tether</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Lend</label>
                          <input
                            type="number"
                            value={lendingAmount}
                            onChange={(e) => setLendingAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Available: {formatTokenAmount(balances?.[selectedToken.toLowerCase()] || "0", selectedToken)}
                          </p>
                        </div>
                        <button
                          onClick={handleLend}
                          className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                          Start Earning Yield
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Positions</h3>
                      {yieldEarnings > 0 ? (
                        <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">USDC Lending Pool</p>
                              <p className="text-sm text-gray-600">Earning 12% APY</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                              <LendingIcon active={false} />
                            </div>
                          </div>
                          <div className="pt-3 border-t border-green-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Total Earnings</span>
                              <span className="text-lg font-bold text-green-600">+${yieldEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <LendingIcon active={false} />
                          </div>
                          <p className="text-gray-700 font-medium mb-1">No active positions</p>
                          <p className="text-sm text-gray-500">Start lending to earn yield</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "borrow" && (
                <motion.div
                  key="borrow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* RoaR Score Based Loan Terms */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Loan Terms</h3>
                        <p className="text-sm text-gray-600">Based on your RoaR Score: {roarScore}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          loanTerms.tier === "Excellent" ? "bg-green-100 text-green-700" :
                          loanTerms.tier === "Good" ? "bg-blue-100 text-blue-700" :
                          loanTerms.tier === "Fair" ? "bg-yellow-100 text-yellow-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {loanTerms.tier} Tier
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                        <p className="text-xl font-bold text-gray-900">{loanTerms.interestRate}% APR</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Max Loan</p>
                        <p className="text-xl font-bold text-gray-900">${loanTerms.maxLoan.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Collateral Ratio</p>
                        <p className="text-xl font-bold text-gray-900">{loanTerms.collateralRatio}x</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Request Loan */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BorrowIcon active={false} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Request Loan</h3>
                          <p className="text-sm text-gray-500">Powered by Jupiter</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
                          <select
                            value={borrowToken}
                            onChange={(e) => setBorrowToken(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none text-gray-900"
                          >
                            <option value="SOL">SOL - Solana</option>
                            <option value="USDC">USDC - USD Coin</option>
                            <option value="USDT">USDT - Tether</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount</label>
                          <input
                            type="number"
                            value={borrowAmount}
                            onChange={(e) => setBorrowAmount(e.target.value)}
                            placeholder="0.00"
                            max={loanTerms.maxLoan}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Max: ${loanTerms.maxLoan.toLocaleString()} | Collateral needed: {borrowAmount ? (parseFloat(borrowAmount) * loanTerms.collateralRatio).toFixed(2) : "0.00"} {borrowToken}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Interest Rate</span>
                            <span className="font-semibold text-gray-900">{loanTerms.interestRate}% APR</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Loan Term</span>
                            <span className="font-semibold text-gray-900">30 days</span>
                          </div>
                          {borrowAmount && parseFloat(borrowAmount) > 0 && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Estimated Interest</span>
                                <span className="text-sm font-bold text-gray-900">
                                  ${((parseFloat(borrowAmount) * loanTerms.interestRate) / 100 / 12).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleBorrow}
                          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Request Loan via Jupiter
                        </button>
                      </div>
                    </div>

                    {/* Active Loans */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Loans</h3>
                      {activeLoans.length > 0 ? (
                        <div className="space-y-3">
                          {activeLoans.map((loan, index) => (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-semibold text-gray-900 mb-1">{loan.amount} {loan.token}</p>
                                  <p className="text-sm text-gray-600">Interest: {loan.interestRate}% APR</p>
                                </div>
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <BorrowIcon active={false} />
                                </div>
                              </div>
                              <div className="pt-3 border-t border-blue-200 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Remaining</span>
                                  <span className="font-semibold text-gray-900">{loan.remaining} {loan.token}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Due Date</span>
                                  <span className="font-semibold text-gray-900">{loan.dueDate}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center">
                          <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <BorrowIcon active={false} />
                          </div>
                          <p className="text-gray-700 font-medium mb-1">No active loans</p>
                          <p className="text-sm text-gray-500">Request a loan to get started</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loan Information */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Check Your Rate</p>
                          <p className="text-sm text-gray-600">Your RoaR Score determines your interest rate and loan limits</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Provide Collateral</p>
                          <p className="text-sm text-gray-600">Lock collateral based on your tier's collateral ratio</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Get Funds</p>
                          <p className="text-sm text-gray-600">Receive funds instantly via Jupiter protocol</p>
                        </div>
                      </div>
                    </div>
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
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Transaction History</h2>
                    <p className="text-sm text-gray-500">All your payment and transfer activities</p>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
                      <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <TransactionsIcon active={false} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions</h3>
                      <p className="text-sm text-gray-500">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {transactions.slice(0, 10).map((tx, index) => {
                          const isReceive = tx.type === "pay" && parseFloat(tx.amount || "0") > 0;
                          return (
                            <div key={tx.id || index} className="p-5 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                    isReceive ? "bg-green-100" : "bg-orange-100"
                                  }`}>
                                    {isReceive ? (
                                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m9-9l-9 9-9-9" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 capitalize mb-1">{tx.type}</p>
                                    <p className="text-sm text-gray-500">{tx.description || "Transaction"}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-base font-semibold ${isReceive ? "text-green-600" : "text-gray-900"}`}>
                                    {isReceive ? "+" : "-"}{formatTokenAmount(tx.amount || "0", tx.token || "USDC")}
                                  </p>
                                  <p className="text-xs text-gray-500">{tx.token || "USDC"}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Analytics</h2>
                    <p className="text-sm text-gray-500">Business performance metrics</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                      <p className="text-2xl font-bold text-gray-900">${(totalPortfolio * 0.3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <PaymentsIcon active={false} />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Payment Links</h3>
                      <p className="text-2xl font-bold text-gray-900">{payLinks.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Active links</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <AnalyticsIcon active={false} />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Success Rate</h3>
                      <p className="text-2xl font-bold text-green-600">98.5%</p>
                      <p className="text-xs text-gray-500 mt-1">Payment success</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
