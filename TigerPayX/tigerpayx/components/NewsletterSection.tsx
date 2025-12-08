import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to your API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="section-padding bg-gradient-to-br from-[#ff6b00] via-[#ff8c42] to-[#ffa366] py-24 lg:py-32 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-10 blur-3xl" />
      
      <div className="max-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Get the latest updates on TigerPayX features, launches, and exclusive early access opportunities.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-full bg-white/95 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-white text-[#ff6b00] font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Subscribe
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 inline-block"
            >
              <p className="text-white font-semibold">✓ Thanks for subscribing!</p>
            </motion.div>
          )}

          <p className="text-sm text-white/80 mt-6">
            Or{" "}
            <Link href="/waiting-list" className="underline font-semibold hover:text-white">
              join our waiting list
            </Link>{" "}
            for early access
          </p>
        </motion.div>
      </div>
    </section>
  );
}

