import Image from 'next/image';
import Link from 'next/link';
import { publicConfig } from '@/lib/public-config';
import { PublicActions } from './PublicActions';

export function PublicChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7f1] text-[#151515] dark:bg-[#10110f] dark:text-[#f8f8f0]">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-brand-lime px-4 py-2 font-bold text-brand-navy focus:translate-y-0"
      >
        Lompat ke konten
      </a>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f7f1]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#10110f]/90">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Manifly homepage">
            <Image
              src="/brand/manifly-wordmark-color.png"
              alt="Manifly"
              width={132}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-6 text-sm font-bold md:flex"
          >
            <Link href="/#fitur">Fitur</Link>
            <Link href="/pricing">Harga</Link>
            <Link href="/contact">Kontak</Link>
          </nav>
          <PublicActions />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="border-t border-black/10 bg-[#151515] text-white dark:border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
          <div>
            <Image
              src="/brand/manifly-wordmark-light.png"
              alt="Manifly"
              width={128}
              height={34}
              className="h-8 w-auto"
            />
            <p className="mt-3 text-sm text-white/65">
              Uang cepat, mimpi dekat.
            </p>
            <p className="mt-1 text-xs text-white/50">
              Manifly dioperasikan oleh {publicConfig.legalEntity}.
            </p>
          </div>
          <nav
            aria-label="Tautan footer"
            className="grid grid-cols-2 gap-x-7 gap-y-3 text-sm text-white/75 sm:grid-cols-3"
          >
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/refund">Refund</Link>
            <Link href="/data-deletion">Data Deletion</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
