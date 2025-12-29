// P2P.me style landing page for TigerPayX
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      answer: "Liquidity providers can earn up to 12% APY by providing stablecoin liquidity to the network. Every transaction you enable strengthens the network while you earn."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
                  href="/dashboard"
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
              {/* Replace 'hero-globe.png' with your image filename */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/assets/hero-globe.png"
                  alt="Global Payments - Borderless Transactions"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
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

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="#" className="block">
                <div className="text-5xl font-bold text-gray-900 mb-2">$19.1M</div>
                <div className="text-sm text-gray-600">Total Volume</div>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link href="#" className="block">
                <div className="text-5xl font-bold text-gray-900 mb-2">224.1K</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="#" className="block">
                <div className="text-5xl font-bold text-gray-900 mb-2">19.0K</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </Link>
            </motion.div>
          </div>
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
                Earn up to 12% APY as a Liquidity Provider
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Provide stablecoin liquidity and process swaps through your account — every transaction you enable strengthens the network, while you earn up to 12% APY on each trade.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  href="/dashboard"
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 aspect-square flex items-center justify-center border border-green-200">
                <div className="text-center">
                  <div className="text-7xl mb-4">💰</div>
                  <p className="text-gray-700 font-semibold text-xl">Earn Yield</p>
                  <p className="text-gray-500 text-sm mt-2">Up to 12% APY</p>
                </div>
              </div>
            </motion.div>
          </div>
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
            href="/dashboard"
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
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Telegram
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Medium
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
  );
}
