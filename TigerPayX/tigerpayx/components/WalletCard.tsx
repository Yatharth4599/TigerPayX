import { ReactNode } from "react";
import { motion } from "framer-motion";

type WalletCardProps = {
  label: string;
  currency: string;
  description: string;
  accent?: ReactNode;
  index?: number;
};

export function WalletCard({
  label,
  currency,
  description,
  accent,
  index = 0,
}: WalletCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-panel tiger-stripes-soft relative overflow-hidden p-5 cursor-pointer group"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,107,0,0.25),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,107,0,0.15),transparent_60%)]" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Content */}
      <div className="relative flex flex-col gap-3 text-sm text-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium mb-1">
              {currency}
            </p>
            <p className="mt-0.5 font-semibold text-white text-base">{label}</p>
          </div>
          {accent ?? (
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="h-10 w-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-[#ff6b00]/30 to-orange-600/30 backdrop-blur-sm flex items-center justify-center group-hover:border-[#ff6b00]/50 transition-all duration-300"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#ff6b00] to-orange-500 glow-orange" />
            </motion.div>
          )}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-medium">Instant transfers</span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
            className="h-1.5 w-12 rounded-full bg-gradient-to-r from-[#ff6b00] via-amber-300 to-orange-500 shadow-[0_0_8px_rgba(255,107,0,0.5)]"
          />
        </div>
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-[#ff6b00]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
