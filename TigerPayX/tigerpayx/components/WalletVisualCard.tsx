import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";

type WalletVisualCardProps = {
  title: string;
  description: string;
  gradient: string;
  icon: string;
  features: string[];
  index?: number;
};

export function WalletVisualCard({
  title,
  description,
  gradient,
  icon,
  features,
  index = 0,
}: WalletVisualCardProps) {
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15, duration: 0.6 }}
        className={`colorful-card p-8 relative overflow-hidden cursor-pointer`}
      >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-300 rounded-full opacity-15 blur-xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <motion.div 
            className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
          >
            <motion.span 
              className="text-3xl"
              animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
            >
              {icon}
            </motion.span>
          </motion.div>
          <motion.div 
            className="h-2 w-2 rounded-full bg-[#ff6b00]"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
        
        <div className="space-y-2">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + i * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ x: 5, scale: 1.02 }}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <motion.div 
                className="h-1.5 w-1.5 rounded-full bg-[#ff6b00]"
                whileHover={{ scale: 1.5 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
              <span>{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
      </motion.div>
    </TiltCard>
  );
}

