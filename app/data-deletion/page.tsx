import type { Metadata } from 'next';
import { PublicChrome } from '@/components/public/PublicChrome';
import { publicConfig } from '@/lib/public-config';

export const metadata: Metadata = {
  title: 'Data Deletion',
  description: 'Cara ekspor dan menghapus data akun Manifly.',
  alternates: { canonical: '/data-deletion' },
};

export default function DataDeletionPage() {
  return (
    <PublicChrome>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[.18em] text-kicker">Privasi</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-.05em]">Ekspor atau hapus datamu.</h1>
        <div className="mt-10 space-y-7 leading-7 [&_h2]:text-xl [&_h2]:font-black [&_p]:opacity-75">
          <section><h2>1. Ekspor lebih dahulu</h2><p>Masuk ke Pengaturan → Backup untuk mengunduh salinan data. Jika tidak dapat masuk, hubungi dukungan.</p></section>
          <section><h2>2. Ajukan penghapusan</h2><p>Gunakan Pengaturan → Profil → Hapus akun, atau kirim email dari alamat akun ke <a className="font-bold underline" href={`mailto:${publicConfig.supportEmail}?subject=Permintaan%20penghapusan%20data%20Manifly`}>{publicConfig.supportEmail}</a>. Jangan kirim password, PIN, atau OTP.</p></section>
          <section><h2>3. Verifikasi dan SLA</h2><p>Kami memverifikasi kepemilikan lewat sesi akun atau email terdaftar. Permintaan yang valid diselesaikan maksimal 30 hari kalender dan konfirmasi dikirim setelah selesai.</p></section>
          <section><h2>Pengecualian retensi</h2><p>Bukti pembayaran, refund, sengketa, keamanan, dan catatan yang wajib disimpan menurut hukum dapat dipertahankan secara terbatas lalu dihapus atau dianonimkan setelah masa retensinya berakhir. Penghapusan akun tidak membatalkan kewajiban pembayaran yang sudah terjadi.</p></section>
        </div>
      </article>
    </PublicChrome>
  );
}
