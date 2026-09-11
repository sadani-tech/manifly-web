import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleX } from 'lucide-react';
import { PublicChrome } from '@/components/public/PublicChrome';

export const metadata: Metadata = { title: 'Checkout dibatalkan', robots: { index: false, follow: false } };

export default function CheckoutCancelPage() {
  return <PublicChrome><section className="px-4 py-20 sm:px-6"><div className="mx-auto max-w-xl rounded-[2rem] border-2 border-black/15 bg-white p-8 text-center dark:border-white/10 dark:bg-white/5"><CircleX className="mx-auto h-14 w-14 text-amber-500" /><h1 className="mt-5 text-3xl font-black">Checkout dibatalkan</h1><p className="mt-3 leading-7 opacity-65">Tidak ada plan baru yang diaktifkan dan membership lamamu tidak berubah.</p><Link href="/settings/membership" className="mt-7 inline-flex rounded-full bg-[#151515] px-5 py-3 font-black text-white dark:bg-brand-lime dark:text-brand-navy">Kembali ke Membership</Link></div></section></PublicChrome>;
}
