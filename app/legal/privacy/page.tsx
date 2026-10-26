import type { Metadata } from "next";
import { LegalPage } from "@/components/public/LegalPage";
import { publicConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kebijakan privasi Manifly.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate={publicConfig.policyVersion}
    >
      <section>
        <h2>Siapa pengelola data</h2>
        <p>
          {publicConfig.legalEntity} mengoperasikan Manifly dan bertanggung
          jawab atas pemrosesan data produk. Pertanyaan privasi dapat dikirim ke{" "}
          <a href={`mailto:${publicConfig.supportEmail}`}>
            {publicConfig.supportEmail}
          </a>
          .
        </p>
      </section>
      <section>
        <h2>Data yang kami proses</h2>
        <ul>
          <li>
            Identitas akun, profil, preferensi, perangkat, dan log keamanan.
          </li>
          <li>
            Data finansial yang kamu masukkan, akun/pocket, kategori, budget,
            bukti transaksi, dan hasil ekstraksi.
          </li>
          <li>
            Nomor WhatsApp, pesan dan media yang kamu kirim, status pengiriman,
            serta catatan persetujuan/pencabutan notifikasi.
          </li>
          <li>
            Referensi pembayaran, paket, nominal, status, dan periode membership
            yang diperlukan untuk memproses pembayaran.
          </li>
        </ul>
        <p>
          Jangan kirim nomor rekening atau kartu lengkap, nomor identitas, PIN,
          CVV, OTP, atau data sensitif lain melalui chat atau gambar. Samarkan
          informasi tersebut sebelum mengirim foto bukti transaksi. Manifly
          tidak menyimpan nomor kartu penuh, CVV, PIN, atau OTP pembayaran.
        </p>
      </section>
      <section>
        <h2>WhatsApp, voice note, dan gambar</h2>
        <p>
          Menghubungkan nomor meminta Manifly memproses pesan yang kamu kirim
          untuk menjalankan fitur bot. Balasan layanan dikirim sebagai respons
          atas pesan yang kamu mulai. Notifikasi proaktif adalah pilihan
          terpisah, mati secara default, dan hanya dikirim jika kamu
          mengaktifkannya, memilih nomor penerima, serta mengaktifkan jenis
          notifikasi terkait. Balas STOP kapan saja untuk mencabut persetujuan
          notifikasi proaktif; kamu tetap dapat memulai percakapan layanan lagi.
          Foto yang dikirim untuk fitur pembacaan bukti transaksi diproses
          sementara oleh Google Gemini untuk membuat draft, tidak disimpan oleh
          Manifly sebagai foto, dan transaksi hanya dibuat setelah konfirmasi.
          Voice note dapat dikirim ke Groq untuk transkripsi ketika fitur
          tersebut digunakan.
        </p>
      </section>
      <section>
        <h2>Tujuan dan dasar pemrosesan</h2>
        <p>
          Data digunakan untuk menyediakan ledger, analitik, fitur WhatsApp yang
          kamu minta, dukungan pelanggan, billing, pencegahan penyalahgunaan,
          dan pemenuhan kewajiban hukum. Pemrosesan didasarkan pada pelaksanaan
          layanan, persetujuan untuk kanal/fitur opsional, kepentingan keamanan
          yang sah, dan kewajiban hukum.
        </p>
      </section>
      <section>
        <h2>Penyedia layanan, transfer, dan keamanan</h2>
        <p>
          Kami menggunakan penyedia hosting/database, Meta untuk WhatsApp, Groq
          untuk transkripsi voice note, Google Gemini untuk parsing gambar atau
          teks opsional, layanan email/push, serta shared payment-service dan
          GDC Pay untuk pembayaran. Hanya data yang diperlukan untuk fungsi
          terkait yang dibagikan. Penyedia dapat memproses data di negara tempat
          mereka beroperasi dengan perlindungan kontraktual dan teknis yang
          relevan.
        </p>
      </section>
      <section>
        <h2>Retensi dan hakmu</h2>
        <p>
          Data akun disimpan selama akun aktif. Log keamanan dan bukti
          transaksi/billing dapat disimpan lebih lama untuk audit, sengketa,
          pajak, atau kewajiban hukum. Kamu dapat meminta akses, koreksi,
          ekspor, atau penghapusan melalui halaman Penghapusan Data. Persetujuan
          WhatsApp dapat dicabut dengan membalas STOP, mematikan notifikasi di
          Pengaturan, atau melepaskan nomor.
        </p>
      </section>
    </LegalPage>
  );
}
