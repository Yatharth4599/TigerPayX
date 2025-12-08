import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

type StatItemProps = {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
  index?: number;
};

function AnimatedCounter({ value, suffix = "", prefix = "", label, index = 0 }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    if (num < 1) {
      return num.toFixed(4);
    }
    return Math.floor(num).toLocaleString();
  };

  // Handle dollar values properly
  const displayValue = () => {
    if (value.includes("$")) {
      // For dollar values, use the value as-is but remove the prefix to avoid duplication
      return value;
    }
    if (isInView) {
      return formatNumber(count);
    }
    return "0";
  };

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2 break-all overflow-hidden px-2"
        style={{ wordBreak: "break-word" }}
      >
        {value.includes("$") ? "" : prefix}
        {displayValue()}
        {suffix}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
        className="text-sm sm:text-base text-gray-700 font-medium"
      >
        {label}
      </motion.p>
    </div>
  );
}

export function StatsSection() {
  const stats = [
    { value: "$0.00025", label: "Transaction Fee" },
    { value: "400", label: "Finality Time", suffix: "ms" },
    { value: "1000", label: "Early Users", suffix: "+" },
    { value: "99.9", label: "Uptime", suffix: "%" },
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-white via-orange-50/30 to-white py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-orange-200 rounded-full opacity-10 blur-3xl floating" />
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-amber-200 rounded-full opacity-10 blur-3xl floating" style={{ animationDelay: "1s" }} />
      
      <div className="max-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium mb-4">
            By The Numbers
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900 mb-4">
            Built for speed and efficiency
          </h2>
          <p className="max-w-2xl mx-auto text-base text-gray-700">
            Experience the power of Solana blockchain with ultra-low fees and lightning-fast transactions.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel p-6 lg:p-8 text-center"
            >
              <AnimatedCounter
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix || ""}
                prefix={(stat as any).prefix || ""}
                index={index}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

