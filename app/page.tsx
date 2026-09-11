import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  ChartNoAxesCombined,
  MessageCircle,
  Mic2,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { PricingGrid } from '@/components/public/PricingGrid';
import { PublicChrome } from '@/components/public/PublicChrome';
import { getPublicCatalog } from '@/lib/public-catalog';

const features = [
  [MessageCircle, 'Langsung catat di WhatsApp', 'Ketik “kopi 15rb”, Manifly langsung menangkap pengeluaran itu ke catatanmu.'],
  [Mic2, 'Cukup bilang, Manifly catat', 'Kirim voice note berbahasa Indonesia, periksa hasilnya, lalu simpan.'],
  [Camera, 'Struk nggak sempat hilang', 'Foto struk dan Manifly bantu menangkap pengeluarannya sebelum terlupa.'],
  [WalletCards, 'Uang tetap pada tempatnya', 'Pisahkan kas, bank, dan e-wallet dalam Pocket agar setiap saldo mudah dipantau.'],
  [ChartNoAxesCombined, 'Tahu ke mana uang pergi', 'Temukan pola pengeluaran, tren, dan kondisi uang dari catatan yang sama.'],
  [ShieldCheck, 'Kamu tetap pegang kendali', 'Ekspor dan hapus data tersedia; Manifly tidak meminta PIN atau OTP bank.'],
] as const;

export default async function Home() {
  const catalog = await getPublicCatalog();
  return (
    <PublicChrome>
      <section className="overflow-hidden border-b border-black/10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-black/15 bg-white px-3 py-1 text-xs font-black uppercase tracking-[.13em] dark:bg-white/10">
              Personal finance · WhatsApp · PWA
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl">
              Biar uang nggak <span className="text-[#6b8e23] dark:text-brand-lime">asal terbang.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 opacity-70">
              Pengeluaran kecil gampang terlewat sampai saldo tiba-tiba menipis.
              Catat lewat WhatsApp, voice note, atau foto struk, lalu biarkan
              Manifly menunjukkan ke mana uangmu pergi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-[#151515] px-6 py-3.5 font-black text-white dark:bg-brand-lime dark:text-brand-navy"
              >
                Mulai gratis →
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border-2 border-black/20 px-6 py-3 font-black dark:border-white/20"
              >
                Lihat harga
              </Link>
            </div>
            <p className="mt-5 text-sm opacity-60">
              Semua fitur pengelolaan uang di web tetap gratis. Membership
              hanya untuk menambah kapasitas layanan WhatsApp.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-lg rounded-[2.4rem] border-2 border-[#151515] bg-[#151515] p-5 text-white shadow-[12px_12px_0_#c9f45a]">
            <Image
              src="/brand/manifly-mark.png"
              alt=""
              width={92}
              height={92}
              className="absolute -right-5 -top-8 h-24 w-24 rotate-6"
            />
            <p className="text-xs font-black uppercase tracking-[.16em] text-brand-lime">
              WhatsApp demo
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <p className="ml-auto w-fit rounded-2xl rounded-br-sm bg-[#176c4b] px-4 py-3">
                bensin 50k, parkir 3k
              </p>
              <div className="w-[88%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 leading-6">
                Siap, 2 transaksi tercatat:<br />
                <strong>Rp50.000 · Transport</strong><br />
                <strong>Rp3.000 · Transport</strong>
              </div>
              <p className="ml-auto w-fit rounded-2xl rounded-br-sm bg-[#176c4b] px-4 py-3">
                rekap minggu ini
              </p>
              <p className="w-[88%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
                Pengeluaran minggu ini Rp428.000. Makanan paling besar: 34%.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-xs font-black uppercase tracking-[.18em] text-kicker">Sudah tersedia</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-[-.04em] sm:text-5xl">
          Tangkap setiap pengeluaran sebelum uangmu terbang.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, body]) => (
            <article key={title} className="rounded-3xl border-2 border-black/15 bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <span className="inline-flex rounded-xl bg-brand-lime p-3 text-brand-navy"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 opacity-65">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white/60 px-4 py-20 dark:border-white/10 dark:bg-white/[.03] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[.18em] text-kicker">Harga transparan</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em]">Mulai gratis, tambah kapasitas saat kamu membutuhkannya.</h2>
          </div>
          <PricingGrid {...catalog} />
          <div className="mt-8 text-center"><Link href="/pricing" className="font-black underline underline-offset-4">Detail pricing dan kebijakan billing</Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <div className="rounded-[2rem] bg-brand-lime px-6 py-14 text-brand-navy">
          <h2 className="text-4xl font-black tracking-[-.04em]">Siap tahu ke mana uangmu pergi?</h2>
          <p className="mx-auto mt-3 max-w-xl">Buat Pocket pertama dan mulai tangkap pengeluaran yang biasanya lolos tanpa terasa.</p>
          <Link href="/register" className="mt-7 inline-flex rounded-full bg-[#151515] px-6 py-3 font-black text-white">Buat akun gratis →</Link>
        </div>
      </section>
    </PublicChrome>
  );
}
