import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="section-padding">
        <div className="max-width py-12">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#features" className="hover:text-gray-900 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how" className="hover:text-white transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Powered by</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Built on <span className="text-[#ff6b00] font-medium">Solana</span>
                </p>
                <p className="text-xs text-gray-500">
                  The world's fastest blockchain
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">© 2025 TigerPayX. All rights reserved.</p>
            <div className="flex flex-wrap gap-6 text-xs text-gray-500">
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


