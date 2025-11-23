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

    try {
      const response = await fetch("/api/auth?action=signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name: name.trim(),
          handle: handle.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Check if email verification is required
      if (data.requiresVerification) {
        setUserEmail(email);
        setShowVerification(true);
        setLoading(false);
        return;
      }

      // Store auth state with JWT token (if verification not required)
      if (data.token && data.user) {
        setAuth(data.token, data.user.email);
        // Redirect to dashboard
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

      // Store auth state with JWT token
      if (data.token && data.user) {
        setAuth(data.token, data.user.email);
        // Redirect to dashboard
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
        // Show success message (you can use a toast here)
        alert("OTP sent! Please check your email.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 section-padding flex items-center justify-center py-10 min-h-[calc(100vh-80px)]">
        <div className="max-width grid w-full gap-10 lg:grid-cols-2 items-center justify-items-center lg:justify-items-stretch">
          <div className="hidden lg:block space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Create account
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Open your TigerPayX Wallet in minutes.
            </h1>
            <p className="text-sm text-zinc-300 max-w-md">
              Start with email and a password. Create your non-custodial wallet
              and start sending, swapping, and earning with crypto.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto lg:mx-0 glass-panel tiger-stripes relative overflow-hidden p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,107,0,0.25),transparent_55%)]" />
            <div className="relative space-y-6">
              {!showVerification ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Sign up
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Create your TigerPayX account.
                    </h2>
                  </div>
                  <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                  >
                <div className="space-y-2 text-sm">
                  <label htmlFor="name" className="text-zinc-300">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <label htmlFor="handle" className="text-zinc-300">
                    Username (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-sm">@</span>
                    <input
                      id="handle"
                      name="handle"
                      type="text"
                      placeholder="johndoe"
                      pattern="[a-z0-9._]+"
                      className="flex-1 rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Leave empty to auto-generate from your name</p>
                </div>
                <div className="space-y-2 text-sm">
                  <label htmlFor="email" className="text-zinc-300">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@studio.jungle"
                    className="w-full rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <label htmlFor="password" className="text-zinc-300">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Create a strong password"
                    minLength={8}
                    className="w-full rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                  />
                  <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
                </div>
                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-[#ff6b00] py-2.5 text-sm font-semibold text-black tiger-glow hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
                  <p className="text-xs text-zinc-400">
                    Already using TigerPayX?{" "}
                    <Link
                      href="/login"
                      className="text-amber-300 hover:text-amber-200"
                    >
                      Log in
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Verify Email
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Check your email
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      We've sent a 6-digit verification code to <strong className="text-white">{userEmail}</strong>
                    </p>
                  </div>
                  <form
                    className="space-y-4"
                    onSubmit={handleVerifyOTP}
                  >
                    <div className="space-y-2 text-sm">
                      <label htmlFor="otp" className="text-zinc-300">
                        Verification Code <span className="text-red-400">*</span>
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
                        className="w-full rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-center text-2xl font-mono tracking-widest text-white placeholder:text-zinc-500 outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                      />
                      <p className="text-xs text-zinc-500">Enter the 6-digit code from your email</p>
                    </div>
                    {error && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2">
                        <p className="text-xs text-red-400">{error}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={verifying || otp.length !== 6}
                      className="mt-2 w-full rounded-full bg-[#ff6b00] py-2.5 text-sm font-semibold text-black tiger-glow hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifying ? "Verifying..." : "Verify Email"}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending}
                        className="text-xs text-amber-300 hover:text-amber-200 disabled:opacity-50"
                      >
                        {resending ? "Sending..." : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}


