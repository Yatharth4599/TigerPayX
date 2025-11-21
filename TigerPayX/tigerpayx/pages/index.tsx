import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WalletCard } from "@/components/WalletCard";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-[#1a0a00] to-orange-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        <section
          id="how"
          className="section-padding bg-orange-950/50 py-20 border-t border-orange-800/30"
        >
          <div className="max-width grid gap-10 lg:grid-cols-[0.9fr,1.1fr] items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                How it works
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                DeFi payments in three simple steps.
              </h2>
              <p className="text-sm text-zinc-300">
                TigerPayX is a non-custodial TigerPayX wallet. You control your keys,
                your funds, and your financial future. No intermediaries, just pure DeFi.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass-panel tiger-stripes-soft p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  01
                </p>
                <h3 className="mt-2 text-sm font-semibold">
                  Create your wallet
                </h3>
                <p className="mt-2 text-xs text-zinc-300">
                  Generate a non-custodial TigerPayX wallet instantly. Your private keys
                  stay on your device — we never see them.
                </p>
              </div>
              <div className="glass-panel tiger-stripes-soft p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  02
                </p>
                <h3 className="mt-2 text-sm font-semibold">
                  Send & swap tokens
                </h3>
                <p className="mt-2 text-xs text-zinc-300">
                  Send SOL, USDC, USDT, or TT instantly. Swap any token via Jupiter
                  Aggregator for the best rates across TigerPayX.
                </p>
              </div>
              <div className="glass-panel tiger-stripes-soft p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  03
                </p>
                <h3 className="mt-2 text-sm font-semibold">
                  Earn yield & accept payments
                </h3>
                <p className="mt-2 text-xs text-zinc-300">
                  Stake SOL with Jito or Marinade to earn yield. Register as a merchant
                  and accept crypto payments via PayLinks.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="section-padding bg-gradient-to-b from-orange-950/50 to-orange-900/30 py-20 border-t border-orange-800/30"
        >
          <div className="max-width grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                DeFi Features
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Everything you need for crypto payments and DeFi.
              </h2>
              <p className="text-sm text-zinc-300">
                Built on TigerPayX for speed and low fees. Non-custodial by design,
                so you always maintain full control of your assets.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#ff6b00] mt-0.5">✓</span>
                  <span><strong className="text-white">P2P Payments:</strong> Send crypto to any TigerPayX wallet address instantly with QR code scanning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff6b00] mt-0.5">✓</span>
                  <span><strong className="text-white">Token Swaps:</strong> Swap any SPL token via Jupiter Aggregator for optimal rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff6b00] mt-0.5">✓</span>
                  <span><strong className="text-white">Yield Staking:</strong> Earn passive income by staking SOL with Jito or Marinade validators</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff6b00] mt-0.5">✓</span>
                  <span><strong className="text-white">Merchant Payments:</strong> Accept crypto payments with PayRam integration and PayLinks</span>
                </li>
              </ul>
            </div>
            <div className="glass-panel tiger-stripes-soft p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#ff6b00]/20 flex items-center justify-center">
                    <span className="text-lg">🔐</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Non-Custodial</p>
                    <p className="text-xs text-zinc-400">Your keys, your crypto</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#ff6b00]/20 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Lightning Fast</p>
                    <p className="text-xs text-zinc-400">TigerPayX's 400ms finality</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#ff6b00]/20 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Low Fees</p>
                    <p className="text-xs text-zinc-400">~$0.00025 per transaction</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#ff6b00]/20 flex items-center justify-center">
                    <span className="text-lg">🌐</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Global</p>
                    <p className="text-xs text-zinc-400">Borderless payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="wallet"
          className="section-padding bg-orange-950/40 py-20 border-t border-orange-800/30"
        >
          <div className="max-width grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                TigerPayX Wallet
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Multi-token support, one interface.
              </h2>
              <p className="text-sm text-zinc-300">
                Manage SOL, USDC, USDT, and TT all in one place. View balances,
                track transactions, and manage your DeFi portfolio with ease.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>• Real-time balance tracking across all tokens</li>
                <li>• Transaction history with blockchain explorer links</li>
                <li>• QR code scanning for instant address input</li>
                <li>• Copy-to-clipboard for easy sharing</li>
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <WalletCard
                label="SOL Balance"
                currency="SOL"
                description="Native Solana token for transactions and staking."
              />
              <WalletCard
                label="USDC Balance"
                currency="USDC"
                description="USD-pegged stablecoin for global payments."
              />
              <WalletCard
                label="USDT Balance"
                currency="USDT"
                description="Tether stablecoin for cross-chain liquidity."
              />
              <WalletCard
                label="TT Balance"
                currency="TT"
                description="Tiger Token for platform-specific features."
              />
            </div>
          </div>
        </section>

        <section
          id="merchant"
          className="section-padding bg-gradient-to-b from-orange-900/30 via-orange-950/50 to-orange-900/30 py-20 border-t border-orange-800/30"
        >
          <div className="max-width grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Merchant Payments
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Accept crypto payments with PayRam integration.
              </h2>
              <p className="text-sm text-zinc-300">
                Register as a merchant and start accepting crypto payments instantly.
                Generate PayLinks for one-time or recurring payments, all powered by
                PayRam's self-hosted payment infrastructure.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#ff6b00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ff6b00] text-xs">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Register Your Merchant</p>
                    <p className="text-xs text-zinc-400">Set up your business profile and settlement address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#ff6b00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ff6b00] text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Create PayLinks</p>
                    <p className="text-xs text-zinc-400">Generate payment links with custom amounts and expiration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#ff6b00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ff6b00] text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Receive Payments</p>
                    <p className="text-xs text-zinc-400">Get paid directly to your TigerPayX wallet address, verified on-chain</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-panel tiger-stripes relative overflow-hidden p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0,rgba(255,107,0,0.32),transparent_55%),radial-gradient(circle_at_100%_120%,rgba(255,255,255,0.25),transparent_55%)]" />
              <div className="relative flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  PayRam Integration
                </p>
                <p className="text-sm text-zinc-200">
                  Self-hosted payment infrastructure for merchants. Accept SOL, USDC, USDT,
                  and TT with automatic settlement to your wallet.
                </p>
                <div className="mt-2 space-y-2 text-xs text-zinc-400">
                  <p>✓ Instant payment verification</p>
                  <p>✓ Multi-token support</p>
                  <p>✓ Webhook notifications</p>
                  <p>✓ Transaction logging</p>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  PayRam runs on your infrastructure for maximum control and privacy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
