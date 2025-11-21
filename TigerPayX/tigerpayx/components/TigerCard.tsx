import { motion } from "framer-motion";

export function TigerCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-panel tiger-stripes-soft relative overflow-hidden p-6 group cursor-pointer"
    >
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,107,0,0.3),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(255,107,0,0.15),transparent_70%)]" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Floating glow orb */}
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#ff6b00]/20 to-orange-600/10 rounded-full blur-3xl"
      />
      
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1"
            >
              Coming Soon
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent"
            >
              Tiger Card
            </motion.h3>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-[#ff6b00] via-amber-300 to-orange-500 blur-2xl opacity-30"
          />
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-5 text-sm text-zinc-300 leading-relaxed"
        >
          A digital-first banking experience built for global creators and
          workers. Spend your Tiger Wallet balance anywhere, anytime.
        </motion.p>
        
        <div className="space-y-2.5 mb-6">
          {[
            "Global acceptance",
            "Instant top-ups from wallet",
            "Real-time transaction alerts",
          ].map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 text-xs text-zinc-400"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 180 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-2 w-2 rounded-full bg-gradient-to-br from-[#ff6b00] to-orange-500 shadow-[0_0_8px_rgba(255,107,0,0.6)]"
              />
              <span>{feature}</span>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff6b00]/20 to-orange-600/20 border border-[#ff6b00]/30 px-4 py-3 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2.5 w-2.5 rounded-full bg-[#ff6b00] shadow-[0_0_12px_rgba(255,107,0,0.8)]"
          />
          <span className="text-xs text-zinc-300 font-medium">
            Launching soon — Join the waitlist
          </span>
        </motion.div>
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-[#ff6b00]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
