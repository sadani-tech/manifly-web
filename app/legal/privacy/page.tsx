import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/LegalPage';
import { publicConfig } from '@/lib/public-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Kebijakan privasi Manifly.',
  alternates: { canonical: '/legal/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" effectiveDate={publicConfig.policyVersion}>
      <section><h2>Siapa pengelola data</h2><p>{publicConfig.legalEntity} mengoperasikan Manifly dan bertanggung jawab atas pemrosesan data produk. Pertanyaan privasi dapat dikirim ke <a href={`mailto:${publicConfig.supportEmail}`}>{publicConfig.supportEmail}</a>.</p></section>
      <section><h2>Data yang kami proses</h2><ul><li>Identitas akun, profil, preferensi, device, dan log keamanan.</li><li>Data finansial yang kamu masukkan, akun/pocket, kategori, budget, receipt dan hasil OCR.</li><li>Nomor WhatsApp, isi pesan atau voice note yang kamu kirim ke bot, Meta message IDs, status delivery, dan pilihan opt-in/out notifikasi.</li><li>Customer/payment reference dari Xendit melalui payment-service, plan, nominal, status, dan periode pembayaran.</li></ul><p>Manifly tidak menyimpan nomor kartu penuh, CVV, PIN, atau OTP pembayaran.</p></section>
      <section><h2>Tujuan dan dasar pemrosesan</h2><p>Data digunakan untuk menyediakan ledger, analitik, otomasi WhatsApp, dukungan pelanggan, billing, pencegahan penyalahgunaan, dan pemenuhan kewajiban hukum. Pemrosesan didasarkan pada pelaksanaan layanan, persetujuan untuk kanal opsional, kepentingan keamanan yang sah, dan kewajiban hukum.</p></section>
      <section><h2>Processor, transfer, dan keamanan</h2><p>Kami dapat menggunakan penyedia hosting/database, Meta untuk WhatsApp, Groq untuk transkripsi voice note, Google Gemini untuk parsing opsional, layanan email/push, dan Xendit untuk pembayaran. Data hanya dibagikan seperlunya dan dapat diproses di negara tempat processor beroperasi dengan perlindungan kontraktual dan teknis yang relevan.</p></section>
      <section><h2>Retensi dan hakmu</h2><p>Data akun disimpan selama akun aktif. Log keamanan dan bukti transaksi/billing dapat disimpan lebih lama untuk audit, sengketa, pajak, atau kewajiban hukum. Kamu dapat meminta akses, koreksi, ekspor, atau penghapusan melalui halaman Penghapusan Data. Izin WhatsApp dapat dicabut dari Pengaturan atau dengan melepaskan nomor.</p></section>
    </LegalPage>
  );
}
