import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { setAuth } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          setUserEmail(email);
          setShowVerification(true);
          setLoading(false);
          return;
        }
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.token && data.user) {
        setAuth(data.token, data.user.email);
        router.push("/dashboard");
      } else {
        setError("Invalid response from server");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        setVerifying(false);
        return;
      }

      if (data.token && data.user) {
        setAuth(data.token, data.user.email);
        router.push("/dashboard");
      } else {
        setError("Invalid response from server");
        setVerifying(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setVerifying(false);
    }
  }

  async function handleResendOTP() {
    setResending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend OTP");
      } else {
        setError(null);
        alert("OTP sent! Please check your email.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b00] via-[#ff8c42] to-[#ff6b00] relative overflow-hidden">
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

      <Navbar />
      
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Welcome message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block text-white"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm mb-6">
                <span className="h-2 w-2 bg-white rounded-full"></span>
                <span>Welcome Back</span>
              </div>
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Log back into your{" "}
              <span className="text-yellow-300">TigerPayX</span> account
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-md">
              Continue where you left off. Send, spend, and track your Roar Score — all from a single, powerful platform.
            </p>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Secure & Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Global Payments</span>
              </div>
          </div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl relative overflow-hidden">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
              
              <div className="relative z-10">
                {!showVerification ? (
                  <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                      <p className="text-white/70 mb-8">Sign in to your account</p>
                    </motion.div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-2"
                      >
                        <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          style={{ color: '#ffffff' }}
                  />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-2"
                      >
                        <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                          className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          style={{ color: '#ffffff' }}
                  />
                      </motion.div>

                {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3"
                        >
                          <p className="text-sm text-red-200">{error}</p>
                        </motion.div>
                )}

                      <motion.button
                  type="submit"
                  disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-[#ff6b00] py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Continue"}
                      </motion.button>
              </form>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-6 text-center text-sm text-white/70"
                    >
                      Don't have an account?{" "}
                    <Link
                      href="/signup"
                        className="text-white font-semibold hover:text-yellow-300 transition-colors"
                    >
                        Sign up
                    </Link>
                    </motion.p>
                </>
              ) : (
                <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
                      <p className="text-white/70 mb-2">
                        We've sent a 6-digit code to{" "}
                        <span className="font-semibold text-white">{userEmail}</span>
                    </p>
                    </motion.div>

                    <form className="space-y-6 mt-8" onSubmit={handleVerifyOTP}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-2"
                      >
                        <label htmlFor="otp" className="block text-sm font-medium text-white">
                          Verification Code
                      </label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                          className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-center text-2xl font-mono tracking-widest text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          style={{ color: '#ffffff' }}
                      />
                      </motion.div>

                    {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3"
                        >
                          <p className="text-sm text-red-200">{error}</p>
                        </motion.div>
                    )}

                      <motion.button
                      type="submit"
                      disabled={verifying || otp.length !== 6}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-[#ff6b00] py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifying ? "Verifying..." : "Verify Email"}
                      </motion.button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending}
                          className="text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {resending ? "Sending..." : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </>
              )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
