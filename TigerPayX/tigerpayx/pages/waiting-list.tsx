import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function WaitingListPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    role: "",
    useCase: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/waiting-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show more detailed error message
        const errorMessage = data.error || data.details || "Failed to join waiting list";
        setError(errorMessage);
        setLoading(false);
        console.error("Waiting list API error:", data);
        return;
      }

      setSuccess(true);
      setFormData({
        email: "",
        name: "",
        company: "",
        role: "",
        useCase: "",
      });
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 section-padding flex items-center justify-center py-20 bg-gradient-to-b from-orange-50 via-amber-50/30 to-orange-50/50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl floating" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200 rounded-full opacity-15 blur-3xl floating" style={{ animationDelay: "1s" }} />
        
        <div className="max-width w-full relative z-10">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs text-orange-700 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_8px_rgba(255,107,0,0.6)]" />
                Join the Waitlist
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900">
                Be among the first to experience
                <span className="block mt-3 gradient-text">
                  TigerPayX
                </span>
              </h1>
              <p className="text-lg text-gray-700 max-w-xl mx-auto">
                We're launching soon! Join our waiting list to get early access to the neo bank that'll take you places.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="colorful-card p-8 sm:p-10"
            >
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center mx-auto">
                    <span className="text-3xl">✓</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      You're on the list!
                    </h2>
                    <p className="text-gray-700">
                      We'll notify you as soon as TigerPayX is ready. Get ready to experience the future of neo banking!
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full bg-[#ff6b00] px-8 py-3 text-base font-semibold text-white hover:bg-[#e55a00] transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Back to Home
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-900">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-900">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-semibold text-gray-900">
                      Company (if applicable)
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Company Name"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-semibold text-gray-900">
                      I'm interested as
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="merchant">Merchant</option>
                      <option value="individual">Individual</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="useCase" className="text-sm font-semibold text-gray-900">
                      What do you plan to use TigerPayX for?
                    </label>
                    <textarea
                      id="useCase"
                      value={formData.useCase}
                      onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                      placeholder="Tell us about your use case..."
                      rows={4}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-3d w-full rounded-full bg-[#ff6b00] px-8 py-4 text-base font-bold text-white hover:bg-[#e55a00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Joining..." : "Join Waiting List"}
                  </button>

                  <p className="text-xs text-center text-gray-700">
                    By joining, you agree to receive updates about TigerPayX. We respect your privacy.
                  </p>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <Link
                href="/"
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                ← Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

