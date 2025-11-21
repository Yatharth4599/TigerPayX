import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export function PaymentLinkGenerator() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("TT");
  const [description, setDescription] = useState("");
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateLink() {
    if (!amount) return;
    setLoading(true);
    try {
      const response = await fetch("/api/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, description }),
      });
      const json = await response.json();
      setPaymentLink(json.link ?? null);
    } catch {
      setPaymentLink(null);
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 text-sm group"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,107,0,0.1),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="mb-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1"
          >
            Generate Payment Link
          </motion.p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Create a link or QR code for others to pay you
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!paymentLink ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-3">
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-28 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all"
                >
                  <option value="TT">TT</option>
                  <option value="USDC">USDC</option>
                  <option value="BUSD">BUSD</option>
                </motion.select>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all"
                />
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateLink}
                disabled={loading || !amount}
                className="w-full rounded-full bg-gradient-to-r from-[#ff6b00] to-orange-600 py-3 text-xs font-semibold text-black tiger-glow hover:shadow-[0_0_60px_rgba(255,107,0,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full"
                    />
                    Generating...
                  </span>
                ) : (
                  "Generate Link & QR Code"
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400 font-medium">Payment Link Generated</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPaymentLink(null);
                    setAmount("");
                    setDescription("");
                  }}
                  className="text-xs text-zinc-500 hover:text-[#ff6b00] transition-colors"
                >
                  New Link
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  className="rounded-xl bg-white p-4 shadow-2xl"
                >
                  <QRCodeSVG value={paymentLink} size={180} />
                </motion.div>
                <div className="w-full space-y-3">
                  <div className="flex gap-2">
                    <motion.input
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      type="text"
                      value={paymentLink}
                      readOnly
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[10px] text-white outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyLink}
                      className="rounded-xl border border-white/10 bg-gradient-to-r from-[#ff6b00] to-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:border-[#ff6b00] transition-all flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className="text-center text-[10px] text-zinc-500">
                    Share this link or QR code to receive payments
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
