import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { isAuthenticated, clearAuth } from "@/utils/auth";

// Logo component
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Liquidity Provider", href: "/#liquidity" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoImage />
            <span className="text-xl font-bold text-gray-900">TigerPayX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#ff6b00] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#ff6b00] transition-colors"
              >
                <span className="text-lg">🇺🇸</span>
                <span>English</span>
                <svg
                  className={`w-4 h-4 transition-transform ${langMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span>🇺🇸</span>
                    <span>English</span>
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span>🇧🇷</span>
                    <span>Português</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span>🇮🇩</span>
                    <span>Bahasa Indonesia</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span>🇮🇳</span>
                    <span>हिन्दी</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span>🇪🇸</span>
                    <span>Español</span>
                  </button>
                </div>
              )}
            </div>

            {/* Open App / Logout Button */}
            {router.pathname === "/dashboard" ? (
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-2 bg-[#ff6b00] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#e55a00] transition-colors"
              >
                Open App
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-base font-medium text-gray-700 hover:text-[#ff6b00] hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 py-2">
                <button className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <span className="text-lg">🇺🇸</span>
                  <span>English</span>
                </button>
              </div>
              <div className="px-4 pt-2">
                {router.pathname === "/dashboard" ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors w-full justify-center"
                  >
                    Logout
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center gap-2 bg-[#ff6b00] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#e55a00] transition-colors w-full justify-center"
                  >
                    Open App
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
