import { motion } from "framer-motion";
import { CryptoCard } from "./CryptoCard";

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 100 }}
      className="relative mt-16 lg:mt-24"
    >
      {/* Glow effect behind cards */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-amber-400/20 to-orange-400/20 rounded-3xl blur-3xl transform scale-150" />
      
      {/* Floating cards preview */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -10, scale: 1.05 }}
        >
          <div className="glass-panel p-4 bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-200 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">SOL</p>
                <p className="text-lg font-bold text-gray-900">12.5</p>
              </div>
            </div>
            <div className="h-1 bg-orange-200 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 1, duration: 1 }}
                className="h-1 bg-gradient-to-r from-[#ff6b00] to-[#ff8c42] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ y: -10, scale: 1.05 }}
        >
          <div className="glass-panel p-4 bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">USDC</p>
                <p className="text-lg font-bold text-gray-900">5,000</p>
              </div>
            </div>
            <div className="h-1 bg-blue-200 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "90%" }}
                transition={{ delay: 1.2, duration: 1 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          whileHover={{ y: -10, scale: 1.05 }}
        >
          <div className="glass-panel p-4 bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-300 to-green-200 flex items-center justify-center">
                <span className="text-xl">💸</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">USDT</p>
                <p className="text-lg font-bold text-gray-900">2,500</p>
              </div>
            </div>
            <div className="h-1 bg-green-200 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ delay: 1.4, duration: 1 }}
                className="h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{ y: -10, scale: 1.05 }}
        >
          <div className="glass-panel p-4 bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-300 to-purple-200 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">RoaR</p>
                <p className="text-lg font-bold text-gray-900">850</p>
              </div>
            </div>
            <div className="h-1 bg-purple-200 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ delay: 1.6, duration: 1 }}
                className="h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <motion.path
          d="M 100 200 Q 300 100 500 200"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 1.5, duration: 2 }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff8c42" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

