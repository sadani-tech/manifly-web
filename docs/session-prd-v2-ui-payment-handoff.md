# Handoff Manifly Web: PRD v2, UI mobile, dan membership payment

Tanggal: 23 Oktober 2026

## Navigasi sidebar

Struktur yang disepakati:

- Financial adalah grup tersendiri dengan daftar: Analytics, Health, Plan, Net
  Worth, Smart Rules.
- Bantuan adalah grup tersendiri, bukan child langsung di bawah Settings.
- Settings tetap berisi pengaturan aplikasi dan akun.
- Pocket/route yang belum tersedia harus menampilkan halaman not found bertema
  aplikasi, bukan halaman kosong.
- Pola sidebar financial disamakan dengan grup lain dan tidak memakai dropdown
  yang tidak diperlukan.

## Membership checkout

Modal checkout membership harus:

- berada di tengah viewport yang sedang aktif, bukan di tengah dokumen desktop;
- menggunakan portal/layer modal yang aman terhadap parent dengan transform atau
  overflow;
- memiliki backdrop gelap dan blur yang cukup;
- memiliki `max-height: calc(100dvh - safe margins)` dan scroll internal;
- menghormati safe-area mobile serta tidak tertutup bottom navigation;
- menampilkan loading state setelah submit dan mencegah double submit;
- menampilkan QR/instruksi pembayaran tanpa CTA terpotong;
- menyediakan close/cancel dan status error yang jelas.

Semua modal di aplikasi harus memakai primitive/layout modal yang sama agar
perbaikannya konsisten, bukan patch hanya pada membership.

## Loading, not-found, dan mobile

Perpindahan halaman harus memberi feedback loading melalui route-level loading
state. Halaman not-found harus tersedia untuk route yang tidak ditemukan dan
mengikuti tema visual aplikasi.

Audit mobile wajib mencakup:

- header dan icon pocket tidak terpotong;
- padding icon, dropdown, avatar, dan action group konsisten;
- bottom navigation tidak menutupi modal, CTA, atau konten;
- teks panjang dan tombol tidak overflow;
- modal, drawer, dan dropdown dapat ditutup dengan keyboard/touch;
- ukuran viewport iPhone/Android portrait dan landscape.

## Payment boundary

Manifly Web hanya memanggil API Manifly. QRIS merchant, GDC callback, API key,
notify secret, dan raw payload provider tidak boleh muncul di client bundle.
Frontend menunggu status backend dan menyediakan retry/status refresh untuk
payment pending.

## Manual smoke test

1. Buka Settings/Membership pada desktop dan mobile.
2. Pastikan loading state muncul saat data membership belum tersedia.
3. Pilih plan Lite dan buka modal checkout.
4. Pastikan modal tepat di tengah layar aktif dan seluruh konten dapat di-scroll.
5. Submit satu kali; tombol berubah loading dan idempotency key tidak berubah
   selama retry request yang sama.
6. Tampilkan QR/instruksi sandbox.
7. Setelah callback backend, refresh halaman dan pastikan entitlement mengikuti
   status API.
8. Buka route pockets yang tidak tersedia dan pastikan not-found bertema muncul.

