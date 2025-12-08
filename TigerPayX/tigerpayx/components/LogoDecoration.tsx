import { motion } from "framer-motion";
import Image from "next/image";

type LogoDecorationProps = {
  size?: number;
  opacity?: number;
  className?: string;
  animate?: boolean;
};

export function LogoDecoration({
  size = 120,
  opacity = 0.1,
  className = "",
  animate = true,
}: LogoDecorationProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ opacity }}
      animate={
        animate
          ? {
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              y: [0, -10, 0],
            }
          : {}
      }
      transition={{
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Image
        src="/assets/logo copy.svg"
        alt="TigerPayX Decoration"
        width={size}
        height={size}
        className="object-contain"
        unoptimized
      />
    </motion.div>
  );
}

