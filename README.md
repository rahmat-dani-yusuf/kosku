# KosKu - Manajemen Kos Sederhana

KosKu adalah aplikasi web untuk pemilik kos dalam mengelola kamar, penghuni, sewa, tagihan bulanan, denda, pembayaran cicilan, bukti transfer, pengingat WhatsApp, kwitansi, laporan, dan pengaturan kos. Aplikasi ini juga menyediakan halaman publik untuk calon penghuni melihat kamar kosong dan mengajukan pemesanan, serta halaman bayar untuk penghuni mengunggah bukti transfer. Demo: https://kosku-navy.vercel.app

## Teknologi

- React 18
- Vite
- Tailwind CSS
- Supabase: Auth, PostgreSQL, RLS, RPC, Storage
- PWA (vite-plugin-pwa)
- Vercel

## Fitur per Peran

### Pemilik Kos

- Kelola kamar, penghuni, dan sewa (mulai/akhiri sewa).
- Buat tagihan bulanan otomatis per sewa aktif.
- Tandai pembayaran, catat pembayaran sebagian (cicilan), dan batalkan pembayaran.
- Hitung denda keterlambatan berdasarkan pengaturan kos.
- Terima atau tolak bukti transfer yang diunggah penghuni.
- Kirim pengingat tagihan melalui WhatsApp.
- Unduh kwitansi PDF (termasuk rincian pembayaran untuk tagihan yang dibayar lebih dari sekali, dan kwitansi per pembayaran).
- Laporan bulanan PDF dan Excel, termasuk ringkasan, rincian tagihan, dan riwayat pembayaran.
- Pengaturan kos: denda, masa tenggang, hari tagih, deposit, aturan kos, info pembayaran, izin cicilan, dan minimal pembayaran.
- Dashboard: okupansi, pendapatan bulan ini, tunggakan, grafik 6 bulan, jatuh tempo 7 hari, dan daftar menunggak.
- Mode gelap, lupa kata sandi, dan pagination 10/25/50 pada daftar.

### Calon Penghuni (tanpa akun)

- Halaman publik `/kos/:kosId`: melihat profil kos, kamar kosong, harga, fasilitas, aturan kos, dan tombol WhatsApp pemilik.
- Form pemesanan kamar dengan validasi nama, nomor HP, tanggal masuk, catatan, dan persetujuan penggunaan data.

### Penghuni (tanpa akun)

- Halaman publik `/bayar/:tagihanId`: melihat rincian tagihan, info pembayaran, dan mengunggah bukti transfer.
- Dukungan pembayaran sebagian (cicilan) dengan validasi jumlah, minimal pembayaran, dan progres pembayaran.

### Super Admin

- `/admin`: statistik global kos, pemilik, kamar, dan sewa aktif.
- Daftar kos dengan pencarian, filter status, pengurutan, dan pagination.
- Aktifkan atau nonaktifkan akun pemilik.
- Ekspor daftar kos ke Excel.
- Super Admin tidak memiliki akses ke data penghuni, kamar detail, atau tagihan per kos.

## Tabel Rute

| Rute | Akses | Keterangan |
| --- | --- | --- |
| `/login` | Publik | Masuk akun pemilik/admin |
| `/daftar` | Publik | Daftar akun pemilik |
| `/lupa-sandi` | Publik | Minta tautan reset kata sandi |
| `/atur-ulang-sandi` | Publik | Atur kata sandi baru dari tautan recovery |
| `/kos/:kosId` | Publik | Halaman pemesanan kos |
| `/bayar/:tagihanId` | Publik | Halaman bayar tagihan dan unggah bukti |
| `/` | Pemilik/Admin | Beranda dan dashboard |
| `/kamar` | Pemilik | Kelola kamar |
| `/penghuni` | Pemilik | Kelola penghuni |
| `/sewa` | Pemilik | Kelola sewa |
| `/pemesanan` | Pemilik | Kelola pemesanan |
| `/tagihan` | Pemilik | Kelola tagihan dan pembayaran |
| `/laporan` | Pemilik | Laporan bulanan |
| `/profil` | Pemilik | Profil dan ubah kata sandi |
| `/pengaturan` | Pemilik | Pengaturan kos |
| `/lainnya` | Pemilik | Menu tambahan |
| `/admin` | Super Admin | Dashboard super admin |

## Arsitektur dan Keamanan

- Frontend React + Vite dengan routing berbasis `react-router-dom`.
- Data disimpan di Supabase PostgreSQL dengan Row Level Security (RLS) berbasis `user_id`, sehingga setiap pemilik hanya mengakses datanya sendiri.
- Halaman publik menggunakan fungsi RPC `security definer` yang mengembalikan data minimal yang diperlukan (kos, kamar kosong, tagihan publik).
- Bucket Storage `bukti-bayar` bersifat privat; bukti ditampilkan melalui signed URL dengan masa berlaku terbatas.
- Peran admin disimpan di tabel `profiles` (`role = 'admin'`) dan dijaga trigger penjaga kolom `role` dan `aktif`.
- Akun nonaktif ditolak saat login dan tidak dapat mengakses data.
- Super Admin hanya membaca data ringkasan kos dan tidak mengakses data penghuni.

## Menjalankan Lokal

Prasyarat: Node.js dan npm.

```bash
npm install
cp .env.example .env
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
npm run dev
npm run build
npm run preview
```

Buat file `.env` dari `.env.example`. Jangan commit `.env`.

## Menyiapkan Supabase

1. Buat project Supabase baru.
2. Jalankan `supabase/schema.sql` di SQL Editor untuk schema awal.
3. Jalankan skrip migrasi tambahan yang dirujuk di `PRD.MD` secara berurutan: pengaturan kos, peran admin, pemesanan, bukti transfer, dan cicilan.
4. Buat akun admin pertama melalui SQL dengan placeholder email:

```sql
UPDATE profiles SET role = 'admin', aktif = true WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

5. Authentication > URL Configuration:
   - Site URL: URL deploy (misalnya `https://kosku-navy.vercel.app`) dan/atau `http://localhost:5173`.
   - Redirect URLs: tambahkan wildcard untuk domain deploy dan localhost, misalnya `https://kosku-navy.vercel.app/**` dan `http://localhost:5173/**`.
6. Untuk penggunaan nyata, atur SMTP sendiri sebelum mengandalkan email konfirmasi dan reset kata sandi.

## Deploy ke Vercel

1. Import repository ke Vercel.
2. Set environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
3. Build command: `npm run build`, output directory: `dist`.
4. `vercel.json` berisi rewrite ke `/index.html` agar refresh pada rute SPA tidak 404.

## Struktur Folder

```text
src/
  components/   Komponen bersama (Modal, Toast, Pagination, dll.)
  hooks/        Hook data dan state
  lib/          Helper format, ekspor, kwitansi, denda, WhatsApp
  pages/        Halaman aplikasi
  App.jsx       Definisi rute
supabase/
  schema.sql    Schema awal
public/         Aset statis dan ikon PWA
```

## Pengujian

Lihat `TESTING.md` untuk daftar periksa uji manual lengkap. Uji yang dilakukan meliputi:

- Autentikasi, isolasi data antar pemilik, dan akun nonaktif.
- Kamar, penghuni, sewa, tagihan, denda, cicilan, dan bukti transfer.
- Pemesanan publik, kwitansi PDF, laporan PDF/Excel.
- Super Admin, mode gelap, responsif HP 360 px, dan lupa kata sandi.

## Keterbatasan dan Pengembangan Lanjutan

- Belum terintegrasi payment gateway.
- Pengingat WhatsApp masih manual (membuka tautan WhatsApp).
- Belum ada portal penghuni lengkap.
- Belum ada captcha pada form publik.

## Catatan Keamanan

- Jangan commit file `.env`.
- Hanya anon key Supabase yang boleh ada di klien.
- Bersihkan data uji sebelum aplikasi dipakai di kos asli.
- Simpan service role key hanya di server/backend yang aman, jangan di frontend.