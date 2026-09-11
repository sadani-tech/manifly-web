import type { Metadata } from 'next';
import { PricingGrid } from '@/components/public/PricingGrid';
import { PublicChrome } from '@/components/public/PublicChrome';
import { getPublicCatalog } from '@/lib/public-catalog';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Harga membership WhatsApp Manifly yang transparan.',
  alternates: { canonical: '/pricing' },
};

export default async function PricingPage() {
  const catalog = await getPublicCatalog();
  return (
    <PublicChrome>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[.18em] text-kicker">Pricing v1.8</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-.05em]">Semua fitur web gratis. Pilih kapasitas WhatsApp.</h1>
          <p className="mt-5 leading-7 opacity-65">Plan berbayar ditagih bulanan dan diperpanjang otomatis sampai dibatalkan. Harga dan total selalu dikonfirmasi sebelum hosted checkout dibuka.</p>
        </div>
        <PricingGrid {...catalog} />
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
          {[
            ['Aktivasi aman', 'Akses berbayar baru aktif setelah pembayaran diverifikasi oleh server, bukan karena redirect browser.'],
            ['Ubah plan', 'Upgrade menagih total bulanan penuh tanpa kredit otomatis untuk sisa periode. Downgrade berlaku pada siklus berikutnya.'],
            ['Batalkan kapan saja', 'Auto-renew berhenti dan entitlement tetap tersedia sampai akhir periode yang sudah dibayar.'],
          ].map(([title, body]) => <article key={title} className="rounded-2xl border border-black/10 p-5 dark:border-white/10"><h2 className="font-black">{title}</h2><p className="mt-2 text-sm leading-6 opacity-65">{body}</p></article>)}
        </div>
      </section>
    </PublicChrome>
  );
}
