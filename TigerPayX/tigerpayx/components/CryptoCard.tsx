import { motion } from "framer-motion";
import Image from "next/image";

type CryptoCardProps = {
  token: string;
  amount: string;
  value: string;
  change: string;
  gradient: string;
  icon?: string;
  index?: number;
};

export function CryptoCard({
  token,
  amount,
  value,
  change,
  gradient,
  icon,
  index = 0,
}: CryptoCardProps) {
  const isPositive = change.startsWith("+");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ y: -12, scale: 1.05, rotateY: 5 }}
      className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${gradient})`,
        boxShadow: "0 20px 60px rgba(255, 107, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-xl" />
      </div>
      
      {/* Logo decoration */}
      <motion.div
        className="absolute top-4 right-4 opacity-5"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Image
          src="/assets/logo copy.svg"
          alt="TigerPayX"
          width={80}
          height={80}
          className="object-contain"
          unoptimized
        />
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon ? (
              <motion.div
                className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <span className="text-2xl">{icon}</span>
              </motion.div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm" />
            )}
            <div>
              <p className="text-sm font-medium text-white/80">{token}</p>
              <p className="text-xs text-white/60">Balance</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-white">{amount}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80">${value}</p>
            <motion.span
              className={`text-sm font-semibold px-2 py-1 rounded-full ${
                isPositive
                  ? "bg-green-500/20 text-green-200"
                  : "bg-red-500/20 text-red-200"
              }`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {change}
            </motion.span>
          </div>
        </div>

        {/* Decorative line */}
        <motion.div
          className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
        >
          <motion.div
            className="h-full bg-white/40 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

