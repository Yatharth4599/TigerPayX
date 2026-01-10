import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { setAuth } from "@/utils/auth";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [country, setCountry] = useState<string>("");
  const [preferredCurrency, setPreferredCurrency] = useState<string>("INR");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");
    const handle = String(formData.get("handle") ?? "");

    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!country) {
      setError("Please select your country");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth?action=signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name: name.trim(),
          handle: handle.trim() || undefined,
          country: country,
          preferredCurrency: preferredCurrency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      if (data.requiresVerification) {
        setUserEmail(email);
        setShowVerification(true);
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
                <span>Get Started</span>
              </div>
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Create your{" "}
              <span className="text-yellow-300">TigerPayX</span> account
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-md">
              Start with email and password. Create your account and start sending, swapping, and earning with crypto.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Secure & Private</div>
                  <div className="text-sm text-white/70">Your keys, your funds</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Lightning Fast</div>
                  <div className="text-sm text-white/70">Powered by Solana</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Global Payments</div>
                  <div className="text-sm text-white/70">Borderless transactions</div>
                </div>
              </div>
          </div>
          </motion.div>

          {/* Right side - Signup form */}
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
                      <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                      <p className="text-white/70 mb-8">Join TigerPayX today</p>
                    </motion.div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-2"
                      >
                        <label htmlFor="name" className="block text-sm font-medium text-white">
                          Full Name <span className="text-red-300">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                          className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          style={{ color: '#ffffff' }}
                  />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="space-y-2"
                      >
                        <label htmlFor="handle" className="block text-sm font-medium text-white">
                          Username <span className="text-white/50 text-xs">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                          <span className="text-white/50 text-lg">@</span>
                    <input
                      id="handle"
                      name="handle"
                      type="text"
                      placeholder="johndoe"
                      pattern="[a-z0-9._]+"
                            className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                            style={{ color: '#ffffff' }}
                    />
                  </div>
                        <p className="text-xs text-white/50">Leave empty to auto-generate</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-2"
                      >
                        <label htmlFor="email" className="block text-sm font-medium text-white">
                          Email <span className="text-red-300">*</span>
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
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="space-y-2"
                      >
                        <label htmlFor="password" className="block text-sm font-medium text-white">
                          Password <span className="text-red-300">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Create a strong password"
                    minLength={8}
                          className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          style={{ color: '#ffffff' }}
                  />
                        <p className="text-xs text-white/50">Must be at least 8 characters</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-2"
                      >
                        <label htmlFor="country" className="block text-sm font-medium text-white">
                          Country <span className="text-red-300">*</span>
                        </label>
                        <select
                          id="country"
                          name="country"
                          required
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            // Auto-detect currency based on country
                            const countryCurrencyMap: { [key: string]: string } = {
                              'IN': 'INR',
                              'PH': 'PHP',
                              'ID': 'IDR',
                              'US': 'USD',
                            };
                            const detectedCurrency = countryCurrencyMap[e.target.value] || 'USD';
                            setPreferredCurrency(detectedCurrency);
                          }}
                          className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          style={{ color: '#ffffff' }}
                        >
                          <option value="" className="bg-gray-800 text-white">Select your country</option>
                          <option value="IN" className="bg-gray-800 text-white">🇮🇳 India</option>
                          <option value="PH" className="bg-gray-800 text-white">🇵🇭 Philippines</option>
                          <option value="ID" className="bg-gray-800 text-white">🇮🇩 Indonesia</option>
                          <option value="US" className="bg-gray-800 text-white">🇺🇸 United States</option>
                          <option value="GB" className="bg-gray-800 text-white">🇬🇧 United Kingdom</option>
                          <option value="CA" className="bg-gray-800 text-white">🇨🇦 Canada</option>
                          <option value="AU" className="bg-gray-800 text-white">🇦🇺 Australia</option>
                          <option value="SG" className="bg-gray-800 text-white">🇸🇬 Singapore</option>
                          <option value="AE" className="bg-gray-800 text-white">🇦🇪 United Arab Emirates</option>
                          <option value="MY" className="bg-gray-800 text-white">🇲🇾 Malaysia</option>
                          <option value="TH" className="bg-gray-800 text-white">🇹🇭 Thailand</option>
                          <option value="VN" className="bg-gray-800 text-white">🇻🇳 Vietnam</option>
                          <option value="BD" className="bg-gray-800 text-white">🇧🇩 Bangladesh</option>
                          <option value="PK" className="bg-gray-800 text-white">🇵🇰 Pakistan</option>
                          <option value="NG" className="bg-gray-800 text-white">🇳🇬 Nigeria</option>
                          <option value="ZA" className="bg-gray-800 text-white">🇿🇦 South Africa</option>
                          <option value="BR" className="bg-gray-800 text-white">🇧🇷 Brazil</option>
                          <option value="MX" className="bg-gray-800 text-white">🇲🇽 Mexico</option>
                          <option value="OTHER" className="bg-gray-800 text-white">Other</option>
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="space-y-2"
                      >
                        <label htmlFor="preferredCurrency" className="block text-sm font-medium text-white">
                          Preferred Currency <span className="text-white/50 text-xs">(auto-detected)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            id="preferredCurrency"
                            name="preferredCurrency"
                            value={preferredCurrency}
                            onChange={(e) => setPreferredCurrency(e.target.value)}
                            className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                            style={{ color: '#ffffff' }}
                          >
                            <option value="INR" className="bg-gray-800 text-white">₹ INR - Indian Rupee</option>
                            <option value="PHP" className="bg-gray-800 text-white">₱ PHP - Philippine Peso</option>
                            <option value="IDR" className="bg-gray-800 text-white">Rp IDR - Indonesian Rupiah</option>
                            <option value="USD" className="bg-gray-800 text-white">$ USD - US Dollar</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              // Reset to auto-detected based on country
                              const countryCurrencyMap: { [key: string]: string } = {
                                'IN': 'INR',
                                'PH': 'PHP',
                                'ID': 'IDR',
                                'US': 'USD',
                              };
                              const detectedCurrency = countryCurrencyMap[country] || 'USD';
                              setPreferredCurrency(detectedCurrency);
                            }}
                            className="px-3 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/15 transition-colors text-xs"
                            title="Reset to auto-detected"
                          >
                            Reset
                          </button>
                        </div>
                        <p className="text-xs text-white/50">You can change this later in Account Settings</p>
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
                        className="w-full bg-white text-[#ff6b00] py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                        {loading ? "Creating account..." : "Create Account"}
                      </motion.button>
              </form>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-6 text-center text-sm text-white/70"
                    >
                      Already have an account?{" "}
                    <Link
                      href="/login"
                        className="text-white font-semibold hover:text-yellow-300 transition-colors"
                    >
                      Log in
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
