import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutStatus } from '@/components/public/CheckoutStatus';
import { PublicChrome } from '@/components/public/PublicChrome';

export const metadata: Metadata = { title: 'Verifikasi pembayaran', robots: { index: false, follow: false } };

export default function CheckoutSuccessPage() {
  return <PublicChrome><section className="px-4 py-20 sm:px-6"><Suspense fallback={<p className="text-center">Memuat status…</p>}><CheckoutStatus /></Suspense></section></PublicChrome>;
}
