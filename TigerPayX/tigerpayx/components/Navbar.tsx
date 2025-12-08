import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { isAuthenticated, clearAuth } from "@/utils/auth";

type NavItem = {
  label: string;
  href: string;
  hasDropdown?: boolean;
};

// Logo component - uses SVG like Phantom
function LogoImage() {
  return (
    <img
      src="/assets/logo copy.svg"
      alt="TigerPayX Logo"
      width={32}
      height={32}
      className="object-contain transition-all duration-300 group-hover:scale-105"
      style={{ display: 'block' }}
    />
  );
}

export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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

  const navItems: NavItem[] = [
    { label: "Features", href: "#features", hasDropdown: true },
    { label: "Learn", href: "#how", hasDropdown: true },
    { label: "Explore", href: "#wallet" },
    { label: "Company", href: "#", hasDropdown: true },
    { label: "Support", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#fff5f0] border-b border-orange-100/50">
      <div className="section-padding">
        <div className="max-width flex items-center justify-between py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative flex items-center justify-center shrink-0"
              >
                <LogoImage />
              </motion.div>
              <span className="text-lg font-semibold text-[#7c2d12] lowercase">TigerPayX</span>
            </Link>
          </motion.div>

          {/* Navigation Menu in Rounded Container */}
          <nav className="hidden lg:flex items-center gap-0 bg-gray-100/80 rounded-full px-2 py-1.5 backdrop-blur-sm">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#7c2d12] hover:text-[#ff6b00] transition-colors rounded-full hover:bg-white/60"
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg
                      className="w-3 h-3 ml-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden text-sm text-[#7c2d12] hover:text-[#ff6b00] md:inline transition-colors"
                >
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-[#7c2d12] hover:bg-orange-50 transition-colors"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-orange-200 text-[#7c2d12] hover:bg-orange-50 transition-colors"
                  aria-label="Search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </motion.button>

                {/* Join Waitlist Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/waiting-list"
                    className="rounded-full bg-[#ffedd5] px-5 py-2.5 text-sm font-semibold text-[#7c2d12] hover:bg-[#fed7aa] transition-colors"
                  >
                    Join Waitlist
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


