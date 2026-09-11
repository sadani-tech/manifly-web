import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/LegalPage';
import { publicConfig } from '@/lib/public-config';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Syarat dan ketentuan Manifly.',
  alternates: { canonical: '/legal/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms and Conditions" effectiveDate={publicConfig.policyVersion}>
      <section><h2>Layanan</h2><p>Manifly adalah aplikasi pengelolaan keuangan pribadi. Seluruh fitur web tersedia pada plan Free; membership berbayar menyediakan entitlement WhatsApp sesuai katalog versioned saat pembelian. Manifly bukan bank, penasihat investasi, atau pengganti nasihat profesional.</p></section>
      <section><h2>Akun dan penggunaan yang wajar</h2><p>Kamu bertanggung jawab menjaga kredensial, memastikan data yang dimasukkan sah, dan tidak memakai layanan untuk spam, broadcast marketing, penipuan, akses tanpa izin, atau tindakan yang melanggar kebijakan Meta dan hukum.</p></section>
      <section><h2>Membership dan auto-renew</h2><p>Plan berbayar adalah produk digital dengan periode bulanan dan diperpanjang otomatis. Total, interval, versi plan/add-on, serta tanggal tagih ditampilkan sebelum checkout. Entitlement baru aktif hanya setelah pembayaran terverifikasi. Upgrade/penggantian menagih total bulanan penuh tanpa kredit otomatis untuk sisa periode.</p></section>
      <section><h2>Pembatalan dan perubahan</h2><p>Pembatalan menghentikan renewal; akses berbayar bertahan sampai akhir periode yang sudah dibayar. Downgrade atau pengurangan add-on berlaku pada siklus berikutnya. Kegagalan renewal dapat memicu grace period, past due, lalu kembali ke entitlement Free tanpa menghapus data finansial.</p></section>
      <section><h2>Ketersediaan dan batas tanggung jawab</h2><p>Kami berupaya menjaga layanan, tetapi tidak menjamin tanpa gangguan. Integrasi pihak ketiga dapat mengalami perubahan atau outage. Pengguna tetap bertanggung jawab memverifikasi catatan dan keputusan finansialnya.</p></section>
    </LegalPage>
  );
}
