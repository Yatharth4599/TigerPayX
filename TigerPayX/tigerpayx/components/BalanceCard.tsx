import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";

type BalanceCardProps = {
  label: string;
  amount: string;
  currency: string;
  icon?: string;
  gradient?: string;
  index?: number;
};

export function BalanceCard({
  label,
  amount,
  currency,
  icon = "💰",
  gradient = "from-orange-100 to-orange-50",
  index = 0,
}: BalanceCardProps) {
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="balance-card p-6 cursor-pointer"
      >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
            >
              {icon}
            </motion.span>
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-600 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{amount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[#ff6b00]">{currency}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-orange-100">
        <span className="text-xs text-gray-600">Available Balance</span>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
          className="h-1.5 bg-gradient-to-r from-[#ff6b00] via-[#ff8c42] to-[#ff6b00] rounded-full"
        />
      </div>
      </motion.div>
    </TiltCard>
  );
}
