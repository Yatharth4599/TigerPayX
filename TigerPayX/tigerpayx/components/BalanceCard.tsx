// Enhanced balance card component

import { motion } from "framer-motion";

interface BalanceCardProps {
  token: string;
  balance: string;
  usdValue?: string;
  icon?: string;
  index?: number;
}

export function BalanceCard({ token, balance, usdValue, icon, index = 0 }: BalanceCardProps) {
  const tokenColors: Record<string, string> = {
    SOL: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    USDC: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    USDT: "from-green-500/20 to-green-600/10 border-green-500/30",
    TT: "from-[#ff6b00]/20 to-orange-600/10 border-[#ff6b00]/30",
  };

  const tokenIcons: Record<string, string> = {
    SOL: "◎",
    USDC: "$",
    USDT: "$",
    TT: "🦁",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br ${tokenColors[token] || "from-zinc-500/20 to-zinc-600/10"} border rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{icon || tokenIcons[token] || "💰"}</div>
          <span className="text-sm font-semibold text-zinc-300">{token}</span>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-white">{parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
        {usdValue && (
          <p className="text-xs text-zinc-400 mt-1">≈ ${usdValue}</p>
        )}
      </div>
    </motion.div>
  );
}

