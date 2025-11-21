import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { isAuthenticated, clearAuth } from "@/utils/auth";

// Logo component that tries multiple formats
function LogoImage() {
  const [imgError, setImgError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("/assets/logo.png");

  // Try different image formats
  const imageFormats = [
    "/assets/logo.png",
    "/assets/logo.svg",
    "/assets/logo.jpg",
    "/assets/logo.jpeg",
  ];

  const handleError = () => {
    const currentIndex = imageFormats.indexOf(currentSrc);
    if (currentIndex < imageFormats.length - 1) {
      // Try next format
      setCurrentSrc(imageFormats[currentIndex + 1]);
    } else {
      // All formats failed, show fallback
      setImgError(true);
    }
  };

  if (imgError) {
    // Fallback gradient logo
    return (
      <div className="relative h-32 w-32 rounded-2xl bg-gradient-to-tr from-[#ff6b00] via-amber-400 to-orange-600 tiger-stripes-soft tiger-glow transition-transform group-hover:scale-105" />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt="TigerPayX Logo"
      width={128}
      height={128}
      className="object-contain transition-transform group-hover:scale-105"
      priority
      unoptimized
      onError={handleError}
    />
  );
}

export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setIsLoggedIn(isAuthenticated());
      }, 0);
    }
  }, [router.pathname]);

  function handleLogout() {
    clearAuth();
    setIsLoggedIn(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-orange-800/30 bg-orange-950/80 backdrop-blur-xl">
      <div className="section-padding">
        <div className="max-width flex items-center justify-between py-4">
          <Link href="/" className="flex items-center group">
            <div className="relative h-32 w-32 flex items-center justify-center shrink-0">
              <LogoImage />
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            {!isLoggedIn && (
              <>
                <Link href="#how" className="hover:text-white transition-colors">
                  How it works
                </Link>
                <Link href="#wallet" className="hover:text-white transition-colors">
                  Wallet
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden text-sm text-zinc-300 hover:text-white md:inline transition-colors"
                >
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm text-zinc-300 hover:text-white md:inline transition-colors"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/signup"
                    className="rounded-full bg-[#ff6b00] px-4 py-2 text-sm font-medium text-black shadow-[0_0_40px_rgba(255,107,0,0.5)] hover:bg-orange-400 transition-colors"
                  >
                    Create Account
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


