// P2P.me style landing page for TigerPayX
import Head from "next/head";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Currency exchange animation state
  const [currencyPair, setCurrencyPair] = useState({ from: "USDC", to: "AED" });
  const [mode, setMode] = useState<'usdc-to-fiat' | 'fiat-to-usdc'>('usdc-to-fiat');
  const fiatCurrencies = ["AED", "INR", "PESO"];
  const [fiatIndex, setFiatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'usdc-to-fiat') {
        // Cycle through: USDC in AED out, USDC in INR out, USDC in PESO out
        const nextIndex = fiatIndex + 1;
        
        if (nextIndex >= fiatCurrencies.length) {
          // After completing all fiat currencies, switch mode to fiat-to-usdc
          setMode('fiat-to-usdc');
          setFiatIndex(0);
          setCurrencyPair({ from: "AED", to: "USDC" });
        } else {
          setFiatIndex(nextIndex);
          setCurrencyPair({ from: "USDC", to: fiatCurrencies[nextIndex] });
        }
      } else {
        // Cycle through: AED in USDC out, INR in USDC out, PESO in USDC out
        const nextIndex = fiatIndex + 1;
        
        if (nextIndex >= fiatCurrencies.length) {
          // After completing all fiat currencies, switch back to usdc-to-fiat mode
          setMode('usdc-to-fiat');
          setFiatIndex(0);
          setCurrencyPair({ from: "USDC", to: "AED" });
        } else {
          setFiatIndex(nextIndex);
          setCurrencyPair({ from: fiatCurrencies[nextIndex], to: "USDC" });
        }
      }
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [mode, fiatIndex]);

  const faqs = [
    {
      question: "What is TigerPayX?",
      answer: "TigerPayX is a stablecoin neobank that enables global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
    },
    {
      question: "How do I get started?",
      answer: "Create an account, connect your wallet, and start making payments instantly. No bank account required. Just download the app and you're ready to go."
    },
    {
      question: "What are the fees?",
      answer: "Transaction fees are ultra-low, around $0.00025 per transaction thanks to Solana's high-performance blockchain. Much lower than traditional banking."
    },
    {
      question: "Is it safe?",
      answer: "Yes, TigerPayX uses self-custodial wallets, meaning you control your funds. All transactions are secured by Solana's blockchain technology."
    },
    {
      question: "Which countries are supported?",
      answer: "TigerPayX is available globally. We currently have strong support in UAE, India, and Philippines, with more regions coming soon."
    },
    {
      question: "Can I use it as a merchant?",
      answer: "Yes! Merchants can register to accept payments via QR codes and payment links. Get paid instantly with low fees."
    },
    {
      question: "What tokens are supported?",
      answer: "We support SOL, USDC, USDT, and TT tokens. All transactions happen on the Solana blockchain."
    },
    {
      question: "How does liquidity providing work?",
      answer: "Liquidity providers earn 2% on every swap transaction by providing stablecoin liquidity to the network. Every transaction you enable strengthens the network while you earn consistent returns."
    }
  ];

  return (
    <>
      <Head>
        <title>TigerPayX - The Stablecoin Neobank | Borderless Global Payments</title>
        <meta
          name="description"
          content="The stablecoin neobank that makes borders disappear. Global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
        />
        <meta property="og:title" content="TigerPayX - The Stablecoin Neobank" />
        <meta
          property="og:description"
          content="The stablecoin neobank that makes borders disappear. Global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
        />
        <meta property="og:image" content="https://tigerpayx.com/assets/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TigerPayX - The Stablecoin Neobank" />
        <meta
          name="twitter:description"
          content="The stablecoin neobank that makes borders disappear. Global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
        />
        <link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
      </Head>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700 mb-6">
                  <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                  <span>USDC • FIAT Swap</span>
                </div>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              >
                The stablecoin neobank that makes{" "}
                <span className="text-[#ff6b00]">borders disappear</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Pay with stablecoins at any QR. Low-fee payments for merchants and individuals without bank freeze worries.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#ff6b00] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#e55a00] transition-colors shadow-lg shadow-[#ff6b00]/20"
                >
                  Open App
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              {/* Hero Visualization - Globe with locations */}
              <motion.div
                className="relative rounded-2xl overflow-hidden"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.4 }
                }}
              >
                <motion.img
                  src="/assets/website.png"
                  alt="Global Payments - Borderless Transactions"
                  className="w-full h-auto rounded-2xl shadow-2xl relative z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                  }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  style={{
                    filter: "drop-shadow(0 25px 50px rgba(255, 107, 0, 0.2))",
                  }}
                />
                {/* Animated glow background */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff6b00]/30 via-purple-500/20 to-blue-500/20 blur-2xl pointer-events-none -z-0"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Backed By Section - Hidden for now */}
      {false && (
        <section className="py-16 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Backed by</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale">
              {/* Placeholder investor logos - replace with actual logos */}
              <div className="h-12 w-40 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">Investor 1</span>
              </div>
              <div className="h-12 w-40 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">Investor 2</span>
              </div>
              <div className="h-12 w-40 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">Investor 3</span>
              </div>
              <div className="h-12 w-40 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">Investor 4</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-[#ff6b00] via-[#ff8c42] to-[#ff6b00] relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                  className="text-5xl md:text-6xl font-bold text-white mb-3"
                >
                  $30 mn +
                </motion.div>
                <div className="text-base md:text-lg text-white/90 font-medium uppercase tracking-wider">Total Volume</div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "85%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                  />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                  className="text-5xl md:text-6xl font-bold text-white mb-3"
                >
                  10K+
                </motion.div>
                <div className="text-base md:text-lg text-white/90 font-medium uppercase tracking-wider">Active Users</div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                  />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                  className="text-5xl md:text-6xl font-bold text-white mb-3"
                >
                  140K
                </motion.div>
                <div className="text-base md:text-lg text-white/90 font-medium uppercase tracking-wider">Total Transactions</div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Currency Exchange Animation Section */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-12 md:p-16 border border-orange-300 relative overflow-hidden shadow-2xl">
              {/* Subtle light overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
              <div className="relative z-10">
              <motion.div
                key={`${currencyPair.from}-${currencyPair.to}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
              >
                {/* From Currency */}
                <motion.div
                  initial={{ x: -20, y: 0, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 md:px-8 md:py-6 shadow-xl border border-white/20 w-full md:w-auto"
                >
                  <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider text-center md:text-left">From</div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">{currencyPair.from}</div>
                </motion.div>

                {/* Exchange Icon */}
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
                  className="bg-white rounded-full p-3 md:p-4 lg:p-5 shadow-xl flex-shrink-0"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#ff6b00] rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </motion.div>

                {/* To Currency */}
                <motion.div
                  initial={{ x: 20, y: 0, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 md:px-8 md:py-6 shadow-xl border border-white/20 w-full md:w-auto"
                >
                  <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider text-center md:text-left">To</div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">{currencyPair.to}</div>
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
              >
                Seamlessly exchange between cryptocurrencies and fiat currencies across multiple chains. 
                Fast, secure, and truly peer-to-peer.
              </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How TigerPayX Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seamless global payments from merchant to customer, with instant conversion to stablecoins
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
              {/* Subtle light overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-xl"
                >
                  <motion.img
                    src="/assets/how-it-works.png"
                    alt="How TigerPayX Works - Merchant to Customer Payment Flow"
                    className="w-full h-auto rounded-xl"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </motion.div>
              </div>

              {/* Decorative elements */}
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
              <motion.div
                className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for fast, secure, and affordable global payments
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 border border-gray-200 rounded-xl hover:border-[#ff6b00] hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ultra-Low Fees</h3>
              <p className="text-gray-600 leading-relaxed">
                Pay with transaction fees as low as $0.00025. Perfect for merchants and individuals making frequent payments.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 border border-gray-200 rounded-xl hover:border-[#ff6b00] hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Instant Settlement</h3>
              <p className="text-gray-600 leading-relaxed">
                Lightning-fast payments with instant settlement powered by Solana's 400ms finality.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 border border-gray-200 rounded-xl hover:border-[#ff6b00] hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Global Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Borderless payments worldwide. No geographical restrictions, no bank freezes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Get Started with Confidence */}
      <section className="py-24 bg-gradient-to-r from-[#ff6b00] to-[#ff8c42] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Get Started with Confidence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl mb-8 opacity-95 leading-relaxed"
          >
            Discover how we make every transaction secure, private, and fraud-proof. Everything you need to know in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/whitepaper"
              className="inline-flex items-center gap-2 bg-white text-[#ff6b00] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Read Whitepaper
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Liquidity Provider Section */}
      <section id="liquidity" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
              >
                Get 2% on Every Swap as a Liquidity Provider
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Provide stablecoin liquidity and earn 2% on every swap transaction processed through your account. Strengthen the network while you generate consistent returns on each trade.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#ff6b00] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#e55a00] transition-colors shadow-lg shadow-[#ff6b00]/20"
                >
                  Launch LP App
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div
                className="relative rounded-2xl overflow-hidden"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.4 }
                }}
              >
                <motion.img
                  src="/assets/lp-image.png"
                  alt="Earn 2% on Every Swap as a Liquidity Provider"
                  className="w-full h-auto rounded-2xl shadow-2xl relative z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  style={{
                    filter: "drop-shadow(0 25px 50px rgba(34, 197, 94, 0.2))",
                  }}
                />
                {/* Animated glow background */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/30 via-emerald-500/20 to-teal-500/20 blur-2xl pointer-events-none -z-0"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lending Section */}
      <section className="py-24 bg-gradient-to-br from-[#ff6b00] via-[#ff8c42] to-[#ff6b00] relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-semibold text-sm uppercase tracking-wider">🚀 Coming Soon</span>
              </div>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Build Your <span className="text-yellow-300">Roar Score</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Connect your wallet, transact on TigerPayX, and unlock lending opportunities with or without collateral
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8">
              {/* Feature 1 - Connect Wallet */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-white rounded-xl p-4 flex-shrink-0"
                  >
                    <svg className="w-8 h-8 text-[#ff6b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-white/80 leading-relaxed">
                      Simply connect your Solana wallet to TigerPayX and start building your creditworthiness
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2 - Transactions */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="bg-white rounded-xl p-4 flex-shrink-0"
                  >
                    <svg className="w-8 h-8 text-[#ff6b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Grow Through Transactions</h3>
                    <p className="text-white/80 leading-relaxed">
                      Every payment, swap, and transaction on TigerPayX builds your Roar Score automatically
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 3 - Lending Options */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5 }}
                    className="bg-white rounded-xl p-4 flex-shrink-0"
                  >
                    <svg className="w-8 h-8 text-[#ff6b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Flexible Lending Options</h3>
                    <p className="text-white/80 leading-relaxed">
                      Access loans with collateral for higher limits, or go collateral-free based on your Roar Score
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Visual Score Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                </div>

                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-8"
                  >
                    <div className="text-6xl md:text-7xl font-bold text-yellow-300 mb-2">
                      🦁
                    </div>
                    <div className="text-5xl md:text-6xl font-bold text-white mb-4">
                      Roar Score
                    </div>
                  </motion.div>

                  {/* Score Display */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                    className="mb-8"
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2">850</div>
                      <div className="text-white/70 text-sm uppercase tracking-wider">Excellent</div>
                    </div>
                  </motion.div>

                  {/* Score Progress Bars */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="flex justify-between text-white/80 text-sm mb-2">
                        <span>Wallet Activity</span>
                        <span>90%</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-3 bg-white/20 rounded-full overflow-hidden"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "90%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.9 }}
                          className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
                        />
                      </motion.div>
                    </div>
                    <div>
                      <div className="flex justify-between text-white/80 text-sm mb-2">
                        <span>Transaction History</span>
                        <span>85%</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="h-3 bg-white/20 rounded-full overflow-hidden"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1 }}
                          className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
                        />
                      </motion.div>
                    </div>
                    <div>
                      <div className="flex justify-between text-white/80 text-sm mb-2">
                        <span>Payment Frequency</span>
                        <span>95%</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="h-3 bg-white/20 rounded-full overflow-hidden"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "95%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1.1 }}
                          className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Lending Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                    >
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-white font-semibold text-sm">Collateral</div>
                      <div className="text-white/70 text-xs">Higher Limits</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                    >
                      <div className="text-2xl mb-1">🚀</div>
                      <div className="text-white font-semibold text-sm">Collateral-Free</div>
                      <div className="text-white/70 text-xs">Based on Score</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mt-12"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-3 bg-white text-[#ff6b00] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Start Building Your Roar Score
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#ff6b00] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to get started?</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-[#ff6b00] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Open App
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-3xl font-bold mb-4">TigerPayX</div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                For any legal inquiries, please feel free to contact us at:{" "}
                <a href="mailto:compliance@tigerpayx.com" className="text-white hover:underline">
                  compliance@tigerpayx.com
                </a>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>India</div>
                <div>Brazil</div>
                <div>Indonesia</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  href="https://x.com/tigerpayx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  X
                </a>
                <a
                  href="https://t.me/tigerpayx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">© 2025 TigerPayX. All rights reserved.</p>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
