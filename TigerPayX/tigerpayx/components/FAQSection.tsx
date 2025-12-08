import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "What is TigerPayX?",
      answer: "TigerPayX is a next-generation neo bank built on Solana that enables merchants and individuals to make payments with ultra-low transaction fees. We also offer decentralized lending powered by Jupiter and a unique RoaR Score system for better financial access.",
    },
    {
      question: "How low are the transaction fees?",
      answer: "TigerPayX leverages Solana's blockchain technology to offer transaction fees as low as $0.00025 per transaction. This is significantly lower than traditional payment processors and even other crypto payment solutions.",
    },
    {
      question: "What is RoaR Score?",
      answer: "RoaR Score is a decentralized credit scoring system that calculates your creditworthiness based on your on-chain transaction history, payment reliability, and lending activity. A higher RoaR Score unlocks better lending rates and access to premium financial services.",
    },
    {
      question: "How does Jupiter Lending work?",
      answer: "Jupiter Lending is integrated into TigerPayX, allowing you to borrow and lend assets directly through our platform. Your RoaR Score determines the interest rates you receive, with higher scores getting better rates.",
    },
    {
      question: "Is TigerPayX secure?",
      answer: "Yes, TigerPayX is built on Solana's secure blockchain infrastructure. We use self-custodial wallets, meaning you maintain full control of your funds. All transactions are verified on-chain and transparent.",
    },
    {
      question: "When will TigerPayX be available?",
      answer: "We're currently in early access phase. Join our waiting list to be among the first to experience TigerPayX when we launch. We'll notify you as soon as early access is available.",
    },
    {
      question: "Can merchants accept payments?",
      answer: "Yes! Merchants can register their business and start accepting crypto payments instantly. You can generate payment links for one-time or recurring payments with minimal fees.",
    },
    {
      question: "What tokens are supported?",
      answer: "TigerPayX supports SOL, USDC, USDT, and other popular Solana-based tokens. We're continuously adding support for more tokens based on user demand.",
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-white via-orange-50/30 to-white py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden">
      <div className="max-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium mb-4">
            FAQ
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="max-w-2xl mx-auto text-base text-gray-700">
            Everything you need to know about TigerPayX.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-panel overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-orange-50/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#ff6b00] text-xl flex-shrink-0"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

