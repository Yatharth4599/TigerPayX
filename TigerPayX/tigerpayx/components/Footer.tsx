import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-orange-800/30 bg-orange-950/50">
      <div className="section-padding">
        <div className="max-width flex flex-col items-start justify-between gap-4 py-8 text-xs text-zinc-400 md:flex-row md:items-center">
          <p>© 2025 TigerPayX. Dubai — The Fintech Jungle.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-white">
              About
            </Link>
            <Link href="#" className="hover:text-white">
              Careers
            </Link>
            <Link href="#" className="hover:text-white">
              Security
            </Link>
            <Link href="#" className="hover:text-white">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


