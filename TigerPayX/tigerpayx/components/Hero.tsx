import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="section-padding pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-orange-950/60 via-orange-900/40 to-orange-950/50">
      <div className="max-width grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_12px_rgba(255,107,0,0.9)]" />
            Borderless. Programmable. Tiger-fast.
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              DeFi Payments
              <span className="block bg-gradient-to-r from-[#ff6b00] via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Powered by TigerPayX.
              </span>
            </h1>
            <p className="max-w-xl text-balance text-base text-zinc-300 sm:text-lg">
              Non-custodial wallet, instant swaps, and global crypto payments. 
              Send, swap, earn yield, and accept payments — all on TigerPayX.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-semibold text-black tiger-glow"
              >
                Create Account
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Launch Wallet
              </Link>
            </motion.div>
            <span className="text-xs text-zinc-400">
              Built on Solana. Self-custody. Open source.
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#ff6b00]/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-6 bottom-0 h-32 w-56 rotate-12 rounded-[999px] bg-gradient-to-tr from-orange-900/30 via-[#ff6b00]/35 to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass-panel tiger-stripes relative overflow-hidden p-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0,rgba(255,107,0,0.32),transparent_55%),radial-gradient(circle_at_80%_120%,rgba(255,255,255,0.22),transparent_55%)]" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    TigerPayX Wallet
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Non-custodial · DeFi
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center border border-white/10">
                  <span className="h-2 w-5 rounded-full bg-gradient-to-r from-[#ff6b00] to-amber-300 shadow-[0_0_18px_rgba(255,107,0,0.8)]" />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-zinc-200">
                <div className="rounded-2xl bg-black/40 p-3 tiger-stripes-soft">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    SOL
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Solana</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Native blockchain
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 p-3 tiger-stripes-soft">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    USDC
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Stablecoin
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Global payments
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 p-3 tiger-stripes-soft">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    USDT
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Stablecoin
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Cross-chain ready
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 p-3 tiger-stripes-soft">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    TT
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Tiger Token</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Platform token
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/40 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Non-Custodial
                  </p>
                  <p className="text-sm text-zinc-200">
                    You control your keys.
                  </p>
                </div>
                <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-[#ff6b00] via-amber-300 to-white/80 flex items-center justify-center tiger-glow">
                  <div className="h-9 w-9 rounded-full bg-black/80 flex items-center justify-center text-xs text-white">
                    🔐
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



