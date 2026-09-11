import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { PublicChrome } from '@/components/public/PublicChrome';
import { publicConfig } from '@/lib/public-config';

export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Kontak resmi dukungan Manifly.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <PublicChrome>
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-black uppercase tracking-[.18em] text-kicker">Kontak resmi</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-.05em]">Ada yang ingin dibicarakan?</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 opacity-65">Manifly dioperasikan oleh {publicConfig.legalEntity}. Tim kami membantu pertanyaan akun, membership, privasi, dan permintaan refund.</p>
        <a href={`mailto:${publicConfig.supportEmail}`} className="mt-10 flex items-center gap-4 rounded-3xl border-2 border-black/15 bg-white p-6 shadow-[7px_7px_0_#c9f45a] dark:border-white/10 dark:bg-white/5">
          <span className="rounded-2xl bg-brand-lime p-4 text-brand-navy"><Mail className="h-6 w-6" /></span>
          <span><strong className="block text-lg">{publicConfig.supportEmail}</strong><small className="opacity-60">Respons awal maksimal 2 hari kerja, Senin–Jumat WIB.</small></span>
        </a>
      </section>
    </PublicChrome>
  );
}
