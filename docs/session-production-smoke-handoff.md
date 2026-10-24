# Manifly production smoke-test handoff

Tanggal: 24 Oktober 2026

## Pemeriksaan website dan autentikasi

Production website `https://manifly.suraise.com` merespons HTTP 200. Halaman
berikut juga merespons HTTP 200:

- `/login`
- `/dashboard`
- `/transactions`
- `/settings/membership`

Login akun yang dimigrasikan berhasil diuji satu kali melalui API production,
lalu endpoint read-only `/api/auth/me`, `/api/membership`,
`/api/membership/entitlements`, `/api/accounts`, dan `/api/transactions`
berhasil diakses. Tes tersebut tidak membuat atau mengubah data. Akun uji
memiliki dua akun dan 116 transaksi yang terbaca setelah migrasi.

Pemeriksaan ini membuktikan ketersediaan route dan alur autentikasi/API; ini
bukan audit keamanan menyeluruh dan bukan verifikasi visual interaktif di
browser. Rendering visual, interaksi mobile, serta persistensi sesi/cookie pada
browser nyata belum diuji di sesi ini.

Jangan menyimpan password atau token akses di dokumentasi. Kredensial yang
dibagikan untuk smoke test sebaiknya segera diganti dengan password unik dan
kuat.

## Status pembayaran

API production `https://api-manifly.suraise.com/api/billing/status` merespons
HTTP 200, tetapi checkout memang masih nonaktif (`checkoutEnabled=false`,
`ready=false`). Smoke test tidak memulai checkout atau pembayaran. Jangan
mengaktifkan checkout sebelum credential dan registry GDC production siap serta
telah diverifikasi.
