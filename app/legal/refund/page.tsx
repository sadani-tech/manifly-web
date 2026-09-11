import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/LegalPage';
import { publicConfig } from '@/lib/public-config';

export const metadata: Metadata = {
  title: 'Cancellation and Refund Policy',
  description: 'Kebijakan pembatalan dan refund membership Manifly.',
  alternates: { canonical: '/legal/refund' },
};

export default function RefundPage() {
  return (
    <LegalPage eyebrow="Billing" title="Cancellation and Refund Policy" effectiveDate={publicConfig.policyVersion}>
      <section><h2>Pembatalan</h2><p>Kamu dapat menghentikan auto-renew dari halaman Membership. Entitlement tetap aktif sampai paid-through date yang ditampilkan. Pembatalan tidak otomatis mengembalikan pembayaran periode berjalan.</p></section>
      <section><h2>Permintaan refund</h2><p>Refund ditinjau manual, antara lain untuk tagihan ganda, nominal tidak sesuai konfirmasi, atau kegagalan teknis yang membuat layanan berbayar tidak tersedia. Kirim permintaan dari halaman Membership atau email <a href={`mailto:${publicConfig.supportEmail}`}>{publicConfig.supportEmail}</a> dengan reference pembayaran dan alasan. Respons awal diberikan maksimal 5 hari kerja.</p></section>
      <section><h2>Keputusan dan dampak</h2><p>Persetujuan dan jumlah refund bergantung pada bukti, pemakaian, metode pembayaran, dan kewajiban hukum. Refund, reversal, fraud, atau chargeback yang terkonfirmasi dapat menghentikan atau menyesuaikan entitlement. Data finansial pribadi tidak ikut dihapus.</p></section>
      <section><h2>Perubahan plan</h2><p>Upgrade atau penambahan add-on memakai subscription pengganti dan menagih total bulanan penuh. Tidak ada proration atau kredit otomatis pada v1.8. Downgrade/pengurangan berlaku pada siklus berikutnya.</p></section>
    </LegalPage>
  );
}
