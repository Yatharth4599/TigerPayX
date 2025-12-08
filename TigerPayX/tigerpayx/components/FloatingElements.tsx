import { motion } from "framer-motion";
import Image from "next/image";

export function FloatingElements() {
  const elements = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(el.id) * 20, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: el.delay,
          }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 opacity-20">
            <Image
              src="/assets/logo copy.svg"
              alt=""
              width={80}
              height={80}
              className="object-contain"
              unoptimized
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

