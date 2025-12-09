import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { ParticleBackground } from "./ParticleBackground";
import { TiltCard } from "./TiltCard";
import { LogoDecoration } from "./LogoDecoration";
import { FloatingElements } from "./FloatingElements";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  function handleJoinWaitlist() {
    router.push("/waiting-list");
  }

  return (
    <section 
      ref={sectionRef}
      className="section-padding pt-20 pb-24 lg:pt-32 lg:pb-40 bg-gradient-to-b from-orange-50 via-amber-50/30 to-orange-50/50 relative overflow-hidden min-h-screen flex items-center"
    >
      <ParticleBackground />
      
      {/* Enhanced decorative background elements with parallax */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl floating"
        style={{ y, opacity }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200 rounded-full opacity-15 blur-3xl floating" 
        style={{ animationDelay: "1s", y: useTransform(scrollYProgress, [0, 1], [0, -150]), opacity }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-300 rounded-full opacity-10 blur-3xl floating" 
        style={{ animationDelay: "2s", y: useTransform(scrollYProgress, [0, 1], [0, 100]), opacity }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-orange-400/30 to-amber-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-400/25 to-orange-400/25 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Floating elements */}
      <FloatingElements />
      
      {/* Logo decorations with enhanced animations */}
      <LogoDecoration size={150} opacity={0.08} className="top-20 left-10" />
      <LogoDecoration size={100} opacity={0.06} className="bottom-32 right-20" />
      <LogoDecoration size={80} opacity={0.05} className="top-1/3 right-1/4" />
      <div className="max-width relative z-10 w-full">
        <div className="mx-auto max-w-6xl">
          {/* Top content */}
          <div className="text-center space-y-8 mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 backdrop-blur-md px-4 py-1.5 text-xs text-orange-700 shadow-lg shadow-orange-500/10"
                >
                  <motion.span 
                    className="h-1.5 w-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_8px_rgba(255,107,0,0.6)]"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    Powered by Solana
                  </motion.span>
                </motion.div>

                {/* Yield Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200, delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50/80 backdrop-blur-md px-5 py-2 text-sm font-bold text-green-700 shadow-lg shadow-green-500/20"
                >
                  <motion.span
                    className="text-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    💎
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Get up to <span className="text-green-800">12% APY</span>
                  </motion.span>
                  <motion.span
                    className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl xl:text-8xl leading-tight"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="block"
                >
                  The stablecoin neobank that makes
                </motion.span>
                <motion.span 
                  className="block mt-3 gradient-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  borders disappear
                </motion.span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mx-auto max-w-2xl text-lg text-gray-700 sm:text-xl leading-relaxed"
              >
                Low-fee payments for merchants and individuals.{" "}
                <motion.span 
                  className="text-gray-900 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  Lending powered by Jupiter.
                </motion.span>{" "}
                <motion.span 
                  className="block mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  Introducing RoaR Score — your gateway to decentralized credit.
                </motion.span>
              </motion.p>

              {/* Country Flags - Available Now */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex items-center justify-center gap-4 mt-8"
              >
                <span className="text-sm font-medium text-gray-600">Available in:</span>
                <div className="flex items-center gap-3">
                  {/* UAE Flag */}
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-orange-200 shadow-sm"
                  >
                    <span className="text-2xl">🇦🇪</span>
                    <span className="text-xs font-semibold text-gray-700">UAE</span>
                  </motion.div>
                  
                  {/* India Flag */}
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-orange-200 shadow-sm"
                  >
                    <span className="text-2xl">🇮🇳</span>
                    <span className="text-xs font-semibold text-gray-700">India</span>
                  </motion.div>
                  
                  {/* Philippines Flag */}
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-orange-200 shadow-sm"
                  >
                    <span className="text-2xl">🇵🇭</span>
                    <span className="text-xs font-semibold text-gray-700">Philippines</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Coming Soon Regions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="mt-4"
              >
                <p className="text-sm text-gray-500">
                  Coming soon:{" "}
                  <span className="font-medium text-gray-600">USA</span>,{" "}
                  <span className="font-medium text-gray-600">UK</span>,{" "}
                  <span className="font-medium text-gray-600">EU</span>,{" "}
                  <span className="font-medium text-gray-600">Latin America</span>
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <motion.button
                onClick={handleJoinWaitlist}
                whileHover={{ scale: 1.08, y: -2 }} 
                whileTap={{ scale: 0.95, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="btn-3d inline-flex items-center justify-center rounded-full bg-[#ff6b00] px-10 py-5 text-base font-bold text-white hover:bg-[#e55a00] transition-all relative overflow-hidden group cursor-pointer"
              >
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Join Waitlist
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-4"
            >
              <p className="text-sm text-gray-600">
                Trusted by merchants and individuals worldwide
              </p>
            </motion.div>
          </div>

          {/* Hero Visual Preview */}
          <HeroVisual />

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 lg:mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
          <TiltCard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="colorful-card p-6 space-y-3 cursor-pointer"
            >
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center shadow-lg icon-bounce"
            >
              <motion.span 
                className="text-2xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                💳
              </motion.span>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900">Low Transaction Fees</h3>
            <p className="text-sm text-gray-700">
              Pay less with Solana's ultra-low fees. Perfect for merchants and individuals making frequent payments.
            </p>
            </motion.div>
          </TiltCard>

          <TiltCard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="colorful-card p-6 space-y-3 cursor-pointer"
            >
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center shadow-lg icon-bounce"
            >
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                💰
              </motion.span>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900">On/Off Ramp</h3>
            <p className="text-sm text-gray-700">
              Easy money transfers via bank accounts, UPI (India), GCash (Philippines), and Aani (UAE). Add and withdraw funds seamlessly.
            </p>
            </motion.div>
          </TiltCard>

          <TiltCard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="colorful-card p-6 space-y-3 cursor-pointer"
            >
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center shadow-lg icon-bounce"
            >
              <motion.span 
                className="text-2xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                🚀
              </motion.span>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900">Jupiter Lending</h3>
            <p className="text-sm text-gray-700">
              Access decentralized lending powered by Jupiter. Borrow and lend with competitive rates.
            </p>
            </motion.div>
          </TiltCard>

          <TiltCard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="colorful-card p-6 space-y-3 cursor-pointer"
            >
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center shadow-lg icon-bounce"
            >
              <motion.span 
                className="text-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                📊
              </motion.span>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900">RoaR Score</h3>
            <p className="text-sm text-gray-700">
              Your decentralized credit score. Unlock better rates and access to financial services.
            </p>
            </motion.div>
          </TiltCard>
        </motion.div>
        </div>
      </div>
    </section>
  );
}



