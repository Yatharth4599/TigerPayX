import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WalletCard } from "@/components/WalletCard";
import { BalanceCard } from "@/components/BalanceCard";
import { WalletVisualCard } from "@/components/WalletVisualCard";
import { CryptoCard } from "@/components/CryptoCard";
import { LogoDecoration } from "@/components/LogoDecoration";
import { StatsSection } from "@/components/StatsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { FAQSection } from "@/components/FAQSection";
import { ComparisonTable } from "@/components/ComparisonTable";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  };

  return (
    <div className="min-h-screen text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        <section
          id="how"
          className="section-padding bg-gradient-to-b from-white via-amber-50/20 to-white py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden"
        >
          {/* Floating decorative elements */}
          <div className="absolute top-20 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-10 blur-2xl floating" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-amber-200 rounded-full opacity-10 blur-2xl floating" style={{ animationDelay: "1.5s" }} />
          
          {/* Logo decorations */}
          <LogoDecoration size={120} opacity={0.06} className="top-40 right-20" />
          <LogoDecoration size={90} opacity={0.05} className="bottom-40 left-16" />
          <div className="max-width">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16 space-y-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium">
                How it works
              </p>
              <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900">
                Neo banking in three simple steps
              </h2>
              <p className="max-w-2xl mx-auto text-base text-gray-700">
                TigerPayX is a next-generation neo bank built on Solana. 
                Low fees, instant payments, and decentralized lending — all in one place.
              </p>
            </motion.div>
            <motion.div
              {...staggerContainer}
              className="grid gap-6 sm:grid-cols-3"
            >
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -12, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-panel p-6 space-y-4 cursor-pointer"
                >
                  <motion.div 
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  >
                    <motion.span 
                      className="text-lg font-semibold text-[#ff6b00]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      1
                    </motion.span>
            </motion.div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Create your account
                </h3>
                <p className="text-sm text-gray-700">
                  Sign up in minutes. Get your Solana wallet and start making payments with ultra-low transaction fees.
                </p>
              </motion.div>
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -12, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-panel p-6 space-y-4 cursor-pointer"
                >
                  <motion.div 
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  >
                    <motion.span 
                      className="text-lg font-semibold text-[#ff6b00]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    >
                      2
                    </motion.span>
              </motion.div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Make payments & access lending
                </h3>
                <p className="text-sm text-gray-700">
                  Send and receive payments instantly. Access Jupiter-powered lending to borrow or lend assets.
                </p>
              </motion.div>
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -12, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-panel p-6 space-y-4 cursor-pointer"
                >
                  <motion.div 
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  >
                    <motion.span 
                      className="text-lg font-semibold text-[#ff6b00]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    >
                      3
                    </motion.span>
              </motion.div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Build your RoaR Score
                </h3>
                <p className="text-sm text-gray-700">
                  Build your decentralized credit score through on-chain activity. Unlock better rates and financial opportunities.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="section-padding bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden"
        >
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-20 w-36 h-36 bg-orange-300 rounded-full opacity-10 blur-3xl floating" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-10 right-20 w-28 h-28 bg-amber-300 rounded-full opacity-10 blur-2xl floating" style={{ animationDelay: "2s" }} />
          
          {/* Logo decorations */}
          <LogoDecoration size={140} opacity={0.07} className="top-32 left-1/4" />
          <LogoDecoration size={100} opacity={0.05} className="bottom-32 right-1/3" />
          <div className="max-width relative z-10">
            <motion.div
              {...fadeInUp}
              className="text-center mb-20 space-y-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium">
                Features
              </p>
              <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900">
                Powerful tools made for everyone
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-700">
                Built on Solana for speed and ultra-low fees. Everything you need for modern banking and payments.
              </p>
            </motion.div>
            <motion.div
              {...staggerContainer}
              className="grid gap-6 lg:grid-cols-2"
            >
              <div className="space-y-6">
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-panel p-6 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💸</span>
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Low-Fee Payments</h3>
                      <p className="text-sm text-gray-700">
                        Send and receive payments with transaction fees as low as $0.00025. Perfect for merchants processing high volumes and individuals making frequent transfers.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-panel p-6 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                      className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0"
                    >
                      <motion.span 
                        className="text-xl"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        🏦
                      </motion.span>
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Jupiter Lending</h3>
                      <p className="text-sm text-gray-700">
                        Access decentralized lending markets powered by Jupiter. Borrow and lend assets with competitive rates, all on Solana.
                      </p>
                </div>
                  </div>
                </motion.div>
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-panel p-6 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                      className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0"
                    >
                      <motion.span 
                        className="text-xl"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        📊
                      </motion.span>
                  </motion.div>
                  <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">RoaR Score</h3>
                      <p className="text-sm text-gray-700">
                        Build your decentralized credit score through on-chain activity. The RoaR Score unlocks better lending rates and access to premium financial services.
                      </p>
                    </div>
                  </div>
                </motion.div>
                </div>
              <div className="space-y-6">
                <motion.div
                  {...fadeInUp}
                  whileHover={{ y: -4 }}
                  className="glass-panel p-6 space-y-4"
                >
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                    <motion.div 
                      className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <motion.span 
                        className="text-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        ⚡
                      </motion.span>
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Lightning Fast</p>
                      <p className="text-xs text-gray-700">Solana's 400ms finality</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <motion.span 
                        className="text-lg"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        💰
                      </motion.span>
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Ultra-Low Fees</p>
                      <p className="text-xs text-gray-700">~$0.00025 per transaction</p>
                  </div>
                  </motion.div>
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                    <motion.div 
                      className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                    <motion.span 
                      className="text-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      🌐
                    </motion.span>
                  </motion.div>
                  <div>
                      <p className="text-sm font-semibold text-gray-900">Global Access</p>
                      <p className="text-xs text-gray-700">Borderless payments worldwide</p>
                  </div>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <motion.span 
                        className="text-lg"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        🔐
                      </motion.span>
                    </motion.div>
                  <div>
                      <p className="text-sm font-semibold text-gray-900">Secure by Design</p>
                      <p className="text-xs text-gray-700">Self-custodial, you control your funds</p>
                  </div>
                  </motion.div>
                </motion.div>
                <motion.div
                  {...fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                >
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#ff6b00]">
                      Powered by Solana
                    </p>
                    <p className="text-sm text-gray-700">
                      Built on the world's fastest blockchain. Experience banking at the speed of light with Solana's high-performance infrastructure.
                    </p>
                </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="wallet"
          className="section-padding bg-gradient-to-b from-white via-orange-50/30 to-amber-50/20 py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden"
        >
          {/* Floating decorative elements */}
          <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-orange-200 rounded-full opacity-10 blur-3xl floating" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-amber-200 rounded-full opacity-10 blur-2xl floating" style={{ animationDelay: "2.5s" }} />
          
          {/* Logo decorations */}
          <LogoDecoration size={160} opacity={0.08} className="top-1/3 right-1/4" />
          <LogoDecoration size={110} opacity={0.06} className="bottom-1/3 left-1/4" />
          <div className="max-width relative z-10">
            <motion.div
              {...fadeInUp}
              className="text-center mb-20 space-y-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium">
                Your Wallet
              </p>
              <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900">
                Keep everything in one place
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-700">
                Manage multiple tokens, track your RoaR Score, and access all your banking needs from a single interface.
              </p>
            </motion.div>
            
            {/* Crypto Cards - Enhanced Visual Display */}
            <motion.div
              {...staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20"
            >
              <CryptoCard
                token="SOL"
                amount="0.00"
                value="0.00"
                change="+2.5%"
                gradient="rgba(255, 107, 0, 0.9), rgba(255, 140, 66, 0.8)"
                icon="⚡"
                index={0}
              />
              <CryptoCard
                token="USDC"
                amount="0.00"
                value="0.00"
                change="+0.1%"
                gradient="rgba(0, 132, 255, 0.9), rgba(100, 181, 246, 0.8)"
                icon="💵"
                index={1}
              />
              <CryptoCard
                token="USDT"
                amount="0.00"
                value="0.00"
                change="+0.1%"
                gradient="rgba(38, 166, 91, 0.9), rgba(76, 175, 80, 0.8)"
                icon="💸"
                index={2}
              />
              <CryptoCard
                token="RoaR"
                amount="750"
                value="750"
                change="+5.2%"
                gradient="rgba(156, 39, 176, 0.9), rgba(186, 104, 200, 0.8)"
                icon="⭐"
                index={3}
              />
            </motion.div>

            {/* Wallet Features */}
            <motion.div
              {...staggerContainer}
              className="grid gap-6 lg:grid-cols-3"
            >
              <WalletVisualCard
                title="Multi-Token Wallet"
                description="Manage all your assets in one beautiful interface. Track balances, view history, and monitor your portfolio."
                gradient="from-orange-200 via-orange-100 to-amber-100"
                icon="💼"
                features={[
                  "Real-time balance tracking",
                  "Complete transaction history",
                  "Multi-chain support"
                ]}
                index={0}
              />
              <WalletVisualCard
                title="Instant Payments"
                description="Send and receive payments instantly with QR code scanning. Ultra-low fees powered by Solana."
                gradient="from-blue-200 via-blue-100 to-cyan-100"
                icon="📱"
                features={[
                  "QR code scanning",
                  "Instant settlement",
                  "Global payments"
                ]}
                index={1}
              />
              <WalletVisualCard
                title="RoaR Score"
                description="Build your decentralized credit score and unlock better rates. Track your on-chain reputation."
                gradient="from-purple-200 via-purple-100 to-pink-100"
                icon="⭐"
                features={[
                  "On-chain credit scoring",
                  "Better lending rates",
                  "Premium features access"
                ]}
                index={2}
              />
            </motion.div>
          </div>
        </section>

        <section
          id="roar-score"
          className="section-padding bg-gradient-to-b from-purple-50/30 via-white to-orange-50/20 py-20 border-t border-orange-100 relative overflow-hidden"
        >
          {/* Logo decorations */}
          <LogoDecoration size={130} opacity={0.06} className="top-20 left-10" />
          <LogoDecoration size={95} opacity={0.05} className="bottom-20 right-16" />
          <div className="max-width relative z-10">
            <div className="text-center mb-16 space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium">
                RoaR Score
              </p>
              <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900">
                Your decentralized credit score
              </h2>
              <p className="max-w-2xl mx-auto text-base text-gray-700">
                Build your on-chain reputation and unlock better financial opportunities. 
                RoaR Score is the future of decentralized credit.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="glass-panel p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                  </div>
                  <div>
                        <h3 className="text-xl font-bold text-gray-900">Build Your Score</h3>
                        <p className="text-sm text-gray-700">Track your on-chain activity</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Your RoaR Score is calculated based on your on-chain transaction history, 
                      payment reliability, and lending activity. The higher your score, the better 
                      rates and access you get.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass-panel p-5 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Better Rates</h4>
                    <p className="text-xs text-gray-700">
                      Access lower interest rates on loans with a higher RoaR Score
                    </p>
                  </div>
                  <div className="glass-panel p-5 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">More Access</h4>
                    <p className="text-xs text-gray-700">
                      Unlock premium financial services and higher credit limits
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-panel p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">How RoaR Score Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#ff6b00] text-sm font-semibold">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">On-Chain Activity</p>
                        <p className="text-xs text-gray-700 mt-1">
                          Your payment history and transaction volume contribute to your score
                        </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#ff6b00] text-sm font-semibold">2</span>
                  </div>
                  <div>
                        <p className="text-sm font-semibold text-gray-900">Lending History</p>
                        <p className="text-xs text-gray-700 mt-1">
                          Successful borrows and repayments improve your creditworthiness
                        </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#ff6b00] text-sm font-semibold">3</span>
                  </div>
                  <div>
                        <p className="text-sm font-semibold text-gray-900">Unlock Benefits</p>
                        <p className="text-xs text-gray-700 mt-1">
                          Higher scores unlock better rates, higher limits, and premium features
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-700">
                    RoaR Score is calculated on-chain, ensuring transparency and fairness. 
                    Your financial reputation is yours to build and control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="merchant"
          className="section-padding bg-gradient-to-b from-amber-50/30 via-white to-orange-50/30 py-20 border-t border-orange-100 relative overflow-hidden"
        >
          {/* Logo decorations */}
          <LogoDecoration size={120} opacity={0.06} className="top-32 right-20" />
          <LogoDecoration size={100} opacity={0.05} className="bottom-32 left-12" />
          <div className="max-width relative z-10">
            <div className="text-center mb-16 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium">
                For Merchants & Individuals
              </p>
              <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900">
                Low-fee payments for everyone
              </h2>
              <p className="max-w-2xl mx-auto text-base text-gray-700">
                Accept payments as a merchant or send money as an individual. All with ultra-low transaction fees powered by Solana.
              </p>
            </div>
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">For Merchants</h3>
                  <p className="text-sm text-gray-700">
                    Register your business and start accepting crypto payments instantly. Generate PayLinks for one-time or recurring payments with minimal fees.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#ff6b00] text-xs">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Register Your Business</p>
                        <p className="text-xs text-gray-700">Set up your merchant profile in minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#ff6b00] text-xs">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Create Payment Links</p>
                        <p className="text-xs text-gray-700">Generate custom payment links with low fees</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#ff6b00] text-xs">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Receive Payments Instantly</p>
                        <p className="text-xs text-gray-700">Get paid directly to your wallet with instant settlement</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">For Individuals</h3>
                  <p className="text-sm text-gray-700">
                    Send and receive payments with friends, family, or businesses. All with the lowest transaction fees in the industry.
                  </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-[#ff6b00]">✓</span>
                      P2P payments with QR code scanning
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#ff6b00]">✓</span>
                      Instant settlement on Solana
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#ff6b00]">✓</span>
                      Ultra-low fees (~$0.00025 per transaction)
                    </li>
                  </ul>
                </div>
              </div>
              <div className="glass-panel p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Low Transaction Fees</p>
                      <p className="text-xs text-gray-700">Save money on every payment</p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2 text-sm text-gray-700 font-medium">
                    <p className="flex items-center gap-2">
                      <span className="text-[#ff6b00] font-bold">✓</span>
                      Instant payment verification
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#ff6b00] font-bold">✓</span>
                      Multi-token support (SOL, USDC, USDT)
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#ff6b00] font-bold">✓</span>
                      Real-time transaction tracking
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#ff6b00] font-bold">✓</span>
                      Secure on-chain settlement
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-700">
                      Powered by Solana's high-performance blockchain for the fastest and cheapest payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <StatsSection />
        <TestimonialsSection />
        <InteractiveDemo />
        <ComparisonTable />
        <FAQSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
