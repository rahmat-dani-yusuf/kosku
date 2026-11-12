# PRD — KosKu: Aplikasi Manajemen Kos (Versi 2.0)

Versi: 2.0
Tanggal: 9 November 2026
Jenis tugas: Tugas bulanan mentor (satu orang satu web)
Platform: Web responsif + PWA (bisa dipasang di HP)
Pengembang: (isi nama Anda)
Catatan: dirancang agar bisa dipakai di kos sungguhan setelah tugas selesai.

---

## 0. Ringkasan Perubahan dari Versi 1.0

Versi 1.0 hanya melayani satu jenis pengguna: pemilik kos. Setelah masukan mentor, versi 2.0 menambahkan tiga hal.

| Masukan mentor | Jawaban pada versi 2.0 |
|---|---|
| Apakah ada fitur khusus untuk mengatur kos, misalnya harga dan aturan lain? | **Pengaturan Kos** untuk pemilik: denda keterlambatan, masa tenggang, nilai bawaan hari tagih dan deposit, serta teks aturan kos. |
| Apakah bisa dibuat Super Admin, dan apa fungsinya? | **Super Admin**: pengelola seluruh aplikasi yang memantau semua kos dan mengaktifkan atau menonaktifkan akun pemilik, tanpa melihat data pribadi penghuni. |
| Apakah ada sisi pengguna untuk memesan kamar? | **Pemesanan kamar**: halaman publik berisi kamar kosong dan form pengajuan untuk calon penghuni, serta halaman persetujuan untuk pemilik. |

---

## 1. Ringkasan Produk

KosKu adalah aplikasi web multi-pemilik untuk mengelola kos. Pemilik kos mengelola kamar, penghuni, sewa, tagihan bulanan, denda, pengingat WhatsApp, kwitansi, dan laporan. Calon penghuni dapat melihat kamar kosong dan mengajukan pemesanan lewat tautan publik tanpa membuat akun. Super Admin mengawasi seluruh pemilik kos di aplikasi.

## 2. Latar Belakang dan Masalah

- Banyak pemilik kos mencatat penghuni dan pembayaran di buku atau chat WhatsApp.
- Pembayaran sering lupa ditagih, dan sulit melacak siapa menunggak berapa bulan serta berapa dendanya.
- Calon penghuni biasanya bertanya kamar kosong lewat chat satu per satu, dan pemilik harus membalas manual.
- Tidak ada rekap pendapatan bulanan yang rapi.
- Aplikasi manajemen properti yang ada terlalu besar atau berbayar untuk kos kecil.
- Untuk dipakai oleh banyak pemilik, aplikasi membutuhkan pengelola yang dapat memantau dan mengendalikan akses akun.

## 3. Tujuan

Tujuan produk:
1. Melihat status semua kamar (kosong, terisi, perbaikan) dalam satu layar.
2. Membuat tagihan bulanan untuk semua penghuni dengan satu tombol, lengkap dengan perhitungan denda sesuai aturan kos.
3. Menandai pembayaran lunas, mengirim pengingat via WhatsApp, dan mencetak kwitansi dalam hitungan detik.
4. Memudahkan calon penghuni memesan kamar lewat tautan publik dan memudahkan pemilik memprosesnya.
5. Memberi pengelola aplikasi (Super Admin) kemampuan memantau dan mengendalikan akses akun pemilik secara aman.
6. Menyediakan laporan pendapatan bulanan dan cadangan data yang bisa diunduh.

Tujuan tugas (untuk mentor):
1. Menunjukkan kemampuan membangun aplikasi full-stack: frontend, backend, database, autentikasi, otorisasi berbasis peran, logika bisnis, dan deployment.
2. Menghasilkan produk online yang bisa didemokan dan dipakai pada kasus nyata.

## 4. Pengguna dan Peran

| Peran | Deskripsi | Masuk dengan akun? | Kebutuhan |
|---|---|---|---|
| **Pemilik kos** | Usia 25-60, memakai HP, mengelola 5-30 kamar | Ya | Rekap cepat, tagihan tidak terlewat, aturan kos, laporan sederhana, pengajuan pemesanan |
| **Super Admin** | Pengelola aplikasi (platform) | Ya (dibuat manual lewat database) | Memantau seluruh kos, mengendalikan akses akun pemilik |
| **Calon penghuni** | Pencari kos | Tidak | Melihat kamar kosong, harga, fasilitas, aturan; mengajukan pemesanan |
| **Penghuni** | Penyewa aktif | Belum (rencana lanjutan) | Menerima pesan WhatsApp dan kwitansi dari pemilik |

### Matriks Hak Akses

| Kemampuan | Calon penghuni (publik) | Pemilik | Super Admin |
|---|---|---|---|
| Melihat kamar kosong sebuah kos | Ya | Ya (kosnya) | Tidak lewat halaman publik |
| Mengajukan pemesanan | Ya | - | - |
| Mengelola kamar, penghuni, sewa, tagihan | Tidak | Ya (kosnya sendiri) | Tidak |
| Melihat nama dan nomor HP penghuni | Tidak | Ya (kosnya sendiri) | **Tidak** |
| Menyetujui atau menolak pemesanan | Tidak | Ya (kosnya sendiri) | Tidak |
| Mengatur denda dan aturan kos | Tidak | Ya (kosnya sendiri) | Tidak |
| Melihat statistik dan daftar semua kos | Tidak | Tidak | Ya (data ringkasan) |
| Mengaktifkan atau menonaktifkan akun pemilik | Tidak | Tidak | Ya |

## 5. Ruang Lingkup

### 5.1 Termasuk (MVP, wajib selesai)

Pemilik kos:
- Registrasi, login, logout, ubah kata sandi
- Profil kos (nama kos, alamat, nomor WhatsApp pemilik)
- Kelola kamar, penghuni, mulai dan akhiri sewa
- Tagihan bulanan otomatis, tandai lunas, pengingat WhatsApp, kwitansi PDF
- Pengaturan Kos: denda per hari, masa tenggang, nilai bawaan hari tagih dan deposit, aturan kos
- Perhitungan denda keterlambatan
- Pengiriman aturan kos ke penghuni lewat WhatsApp
- Pemesanan: terima, setujui, atau tolak pengajuan; bagikan tautan pemesanan
- Dashboard dan laporan bulanan dengan ekspor PDF/Excel
- PWA dan deploy online

Calon penghuni (tanpa akun):
- Halaman publik per kos: info kos, kamar kosong, aturan kos
- Form pengajuan pemesanan dengan pembatasan penyalahgunaan

Super Admin:
- Dashboard statistik seluruh aplikasi
- Daftar semua kos dengan pencarian, filter, dan pengurutan
- Aktifkan dan nonaktifkan akun pemilik
- Ekspor daftar kos ke Excel

### 5.2 Tidak termasuk
- Pembayaran online / payment gateway
- Pengiriman WhatsApp otomatis lewat API (hanya tautan wa.me yang dibuka pemilik)
- Portal penghuni dengan login (rencana lanjutan)
- Pencatatan token listrik per kamar
- Aplikasi native Android/iOS
- Penyimpanan nomor KTP atau dokumen identitas

### 5.3 Pengembangan lanjutan
- Portal penghuni: login penghuni untuk melihat tagihan, kwitansi, dan aturan sendiri
- Pencatatan pengeluaran kos dan laba bersih
- Foto kamar pada halaman publik
- Mode gelap
- Beberapa kos dalam satu akun
- Lupa kata sandi dengan SMTP sendiri dan captcha pada form publik

## 6. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas | Status |
|---|---|---|---|
| F-01 | Pengguna dapat mendaftar dan login dengan email dan password | Wajib | Selesai |
| F-02 | Sesi login tersimpan, halaman login menjadi halaman pertama bagi yang belum login | Wajib | Selesai |
| F-03 | Pemilik dapat menambah, mengubah, menghapus kamar | Wajib | Selesai |
| F-04 | Kamar memiliki status: kosong, terisi, perbaikan | Wajib | Selesai |
| F-05 | Pemilik dapat menambah, mengubah, menghapus penghuni | Wajib | Selesai |
| F-06 | Mulai sewa: pilih kamar kosong, penghuni, tanggal masuk, tanggal tagih, harga, deposit | Wajib | Selesai |
| F-07 | Satu kamar hanya boleh punya satu sewa aktif | Wajib | Selesai |
| F-08 | Akhiri sewa, kamar otomatis kembali kosong | Wajib | Selesai |
| F-09 | Tombol "Buat tagihan bulan ini" tanpa duplikat | Wajib | Selesai |
| F-10 | Daftar tagihan dengan filter periode dan status | Wajib | Selesai |
| F-11 | Tandai tagihan lunas dengan tanggal dan metode bayar | Wajib | Selesai |
| F-12 | Tombol "Ingatkan via WhatsApp" dengan pesan terisi | Wajib | Selesai |
| F-13 | Unduh kwitansi PDF untuk tagihan lunas | Wajib | Selesai |
| F-14 | Dashboard: okupansi, pendapatan, tunggakan, jatuh tempo mendekat | Wajib | Selesai |
| F-15 | Laporan bulanan dan ekspor PDF/Excel | Wajib | Selesai |
| F-16 | Ubah profil kos dan kata sandi | Wajib | Selesai |
| F-17 | Aplikasi dapat dipasang sebagai PWA | Wajib | Selesai |
| F-18 | Pencatatan pengeluaran dan laba bersih | Opsional | Rencana |
| F-19 | Mode gelap | Opsional | Rencana |
| F-20 | Pengaturan Kos: denda per hari, masa tenggang, hari tagih dan deposit bawaan, aturan kos | Wajib | Selesai |
| F-21 | Denda keterlambatan dihitung otomatis dan tampil di tagihan, pesan WhatsApp, kwitansi, dashboard, laporan | Wajib | Selesai |
| F-22 | Kirim aturan kos ke penghuni aktif lewat WhatsApp | Wajib | Selesai |
| F-23 | Peran pengguna (pemilik dan admin) disimpan di database dan ditegakkan oleh aturan keamanan | Wajib | Selesai |
| F-24 | Dashboard Super Admin: total pemilik, kamar, kamar terisi, sewa aktif | Wajib | Selesai |
| F-25 | Daftar semua kos dengan pencarian, filter status, dan pengurutan | Wajib | Selesai |
| F-26 | Super Admin dapat mengaktifkan dan menonaktifkan akun pemilik; akun nonaktif tidak dapat membaca atau menulis data | Wajib | Selesai |
| F-27 | Ekspor daftar kos ke Excel (tanpa data penghuni) | Wajib | Selesai |
| F-28 | Halaman publik per kos berisi info kos, kamar kosong, dan aturan kos tanpa login | Wajib | Selesai |
| F-29 | Calon penghuni mengajukan pemesanan kamar lewat form | Wajib | Selesai |
| F-30 | Pembatasan pengajuan: maksimal 2 pengajuan menunggu per nomor HP dan 50 per kos, validasi data di database | Wajib | Selesai |
| F-31 | Halaman Pemesanan pemilik: daftar pengajuan, setujui (otomatis membuat penghuni dan sewa), tolak dengan alasan | Wajib | Dalam pengerjaan |
| F-32 | Tautan pemesanan publik dapat disalin dan dibagikan; kartu pemesanan menunggu di dashboard | Wajib | Dalam pengerjaan |
| F-33 | Portal penghuni dengan login | Opsional | Rencana |

## 7. Kebutuhan Non-Fungsional

- **Keamanan akses:** setiap pemilik hanya mengakses datanya sendiri (Row Level Security). Peran admin dan status akun ditegakkan di database, bukan hanya di tampilan.
- **Perlindungan peran:** pengguna biasa tidak dapat mengubah kolom peran atau status akun miliknya (dijaga trigger database). Akun admin hanya dapat dibuat lewat SQL manual.
- **Akun nonaktif:** semua tabel data memiliki policy restriktif sehingga akun nonaktif tidak bisa membaca atau menulis walau memanggil API langsung.
- **Privasi data penghuni:** hanya simpan data yang perlu (nama, nomor HP, kontak darurat). Tidak menyimpan nomor KTP. Super Admin tidak dapat melihat data penghuni. Data calon penghuni hanya dapat dibaca pemilik kos yang dituju.
- **Halaman publik:** tidak membuka tabel secara langsung, hanya fungsi database yang mengembalikan kolom aman. Fungsi pengajuan memvalidasi nama, nomor HP, tanggal, dan membatasi jumlah pengajuan.
- **Performa:** halaman termuat di bawah 3 detik pada 4G.
- **Responsif:** nyaman mulai lebar 360 px.
- **Kegunaan:** semua teks Bahasa Indonesia, format Rupiah (Rp 1.250.000), tanggal format Indonesia.
- **Validasi:** nomor kamar unik, harga tidak negatif, tanggal wajib, nomor HP berformat Indonesia.
- **Keandalan:** operasi penting (mulai sewa, akhiri sewa, buat tagihan, setujui pemesanan) dijalankan sebagai fungsi database agar konsisten.
- **PWA aman:** permintaan ke domain Supabase tidak disimpan di cache (NetworkOnly), sehingga data tidak basi atau bocor antar pengguna.
- **Cadangan data:** ekspor Excel agar pemilik punya salinan data.

## 8. Teknologi yang Digunakan

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Bahasa pemrograman | JavaScript (ES2022) untuk frontend, SQL dan PL/pgSQL untuk logika database | Sudah dikuasai, cepat dikerjakan |
| Frontend | React 18 + Vite | Cepat dan ringan |
| Routing | React Router | Navigasi, rute terproteksi, rute admin, dan rute publik |
| Styling | Tailwind CSS | UI responsif cepat |
| Backend | Supabase (Backend-as-a-Service) | Database, autentikasi, dan API otomatis tanpa server sendiri |
| Database | PostgreSQL (Supabase) | Relasional, cocok untuk kamar-penghuni-sewa-tagihan-pemesanan |
| Logika bisnis | Fungsi SQL (RPC) | Transaksi aman dan konsisten |
| Autentikasi | Supabase Auth (email + password) | Aman dan siap pakai |
| Otorisasi | Row Level Security, kolom peran, fungsi `is_admin()` | Data terpisah per pemilik dan hak admin ditegakkan di server |
| Grafik | Recharts | Integrasi mudah dengan React |
| Ekspor | jsPDF + jspdf-autotable, SheetJS (xlsx) | Laporan, kwitansi, dan Excel di sisi klien |
| Pengingat dan komunikasi | Tautan wa.me dengan pesan terisi | Tanpa biaya API, cocok untuk kos kecil |
| PWA | vite-plugin-pwa | Bisa dipasang di HP |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) | Gratis untuk skala ini |
| Alat | VS Code + OpenCode, Git + GitHub | Alur kerja yang sudah dipakai |

Catatan: tidak ada server backend yang ditulis manual. Logika backend berupa skema database, aturan RLS, trigger, fungsi SQL, dan pemanggilan lewat `@supabase/supabase-js`.

## 9. Arsitektur Sistem

```
Calon penghuni (tanpa login)    Pemilik kos (login)         Super Admin (login)
          |                              |                           |
          +------------------- React + Vite (PWA) di Vercel ---------+
                                         |
                          @supabase/supabase-js (query + rpc)
                                         |
                                   Supabase Cloud
   - Auth
   - PostgreSQL: profiles, kamar, penghuni, sewa, tagihan,
                 pengaturan_kos, pemesanan  (+ RLS)
   - Fungsi publik  : kos_publik, kamar_kosong_publik, ajukan_pemesanan
   - Fungsi pemilik : mulai_sewa, akhiri_sewa, buat_tagihan_bulanan,
                      setujui_pemesanan, tolak_pemesanan
   - Fungsi admin   : is_admin, admin_statistik, admin_daftar_kos, admin_set_aktif
                                         |
                    WhatsApp (dibuka lewat tautan wa.me dari browser)
```

## 10. Desain Database

Relasi: satu pemilik memiliki banyak kamar, penghuni, dan pemesanan, serta satu baris pengaturan. Satu sewa menghubungkan satu kamar dan satu penghuni. Satu sewa memiliki banyak tagihan (satu per bulan). Satu pemesanan mengarah ke satu kamar dan, bila disetujui, ke satu penghuni dan satu sewa.

### 10.1 Tabel

| Tabel | Isi utama | Keterangan |
|---|---|---|
| `profiles` | id, nama_pemilik, nama_kos, alamat, no_wa, **role**, **aktif** | Satu baris per akun. `role`: pemilik atau admin. `aktif`: status akun |
| `kamar` | nomor, tipe, harga_bulanan, fasilitas, status | Unik per pemilik+nomor |
| `penghuni` | nama, no_hp, pekerjaan, kontak_darurat, catatan | Tanpa data identitas |
| `sewa` | kamar_id, penghuni_id, tanggal_masuk/keluar, hari_tagih, harga_sewa, deposit, status | Satu sewa aktif per kamar (unique index parsial) |
| `tagihan` | sewa_id, periode, jumlah, jatuh_tempo, status, tanggal_bayar, metode, **denda** | Unik per sewa+periode |
| `pengaturan_kos` | denda_per_hari, masa_tenggang_hari, hari_tagih_default, deposit_default, aturan_kos | Satu baris per pemilik |
| `pemesanan` | kamar_id, nama, no_hp, tanggal_masuk, catatan, status, alasan_tolak, penghuni_id, sewa_id | status: menunggu, disetujui, ditolak |

### 10.2 Fungsi database

| Fungsi | Dipanggil oleh | Tugas |
|---|---|---|
| `mulai_sewa` | Pemilik | Membuat sewa dan mengubah status kamar menjadi terisi |
| `akhiri_sewa` | Pemilik | Menutup sewa dan mengembalikan kamar menjadi kosong |
| `buat_tagihan_bulanan` | Pemilik | Membuat tagihan bulan itu untuk semua sewa aktif tanpa duplikat |
| `setujui_pemesanan` | Pemilik | Membuat (atau memakai ulang) penghuni, memulai sewa, menandai disetujui, dan menolak pengajuan lain untuk kamar yang sama |
| `tolak_pemesanan` | Pemilik | Menolak pengajuan dengan alasan opsional |
| `kos_publik`, `kamar_kosong_publik` | Publik | Mengembalikan info kos dan kamar kosong (kolom aman saja) |
| `ajukan_pemesanan` | Publik | Memvalidasi dan menyimpan pengajuan dengan pembatasan |
| `is_admin`, `akun_aktif` | Sistem (RLS) | Pengecekan peran dan status akun |
| `admin_statistik`, `admin_daftar_kos`, `admin_set_aktif` | Super Admin | Data ringkasan dan aktif/nonaktif akun |
| `normalisasi_hp` | Fungsi pembantu | Mengubah 08xx dan +62xx menjadi 62xx |

### 10.3 Aturan keamanan data (ringkas)

- Semua tabel data memiliki policy "milik sendiri" (`user_id = auth.uid()`).
- Semua tabel data memiliki policy restriktif "akun harus aktif" untuk peran `authenticated`.
- Trigger `profiles_jaga_kolom` mencegah pengguna mengubah `role` dan `aktif` miliknya sendiri.
- Fungsi admin memeriksa `is_admin()` di dalam fungsi dan hak eksekusinya dicabut dari `anon`.
- Fungsi publik berjalan sebagai `security definer`, hanya mengembalikan kolom yang aman, dan hanya untuk kos milik pemilik yang aktif.
- Status "terlambat" tidak disimpan, melainkan dihitung di aplikasi.
- Rumus denda: `denda = denda_per_hari × jumlah hari terlambat`, dihitung hanya setelah `jatuh_tempo + masa_tenggang_hari` terlewati. Denda final disimpan pada kolom `tagihan.denda` saat ditandai lunas.

Skema awal (profiles, kamar, penghuni, sewa, tagihan, tiga fungsi sewa, dan trigger pendaftaran) tercantum pada dokumen PRD-manajemen-kos.md versi 1.0 dan berkas `supabase/schema.sql`. Skrip tambahan versi 2.0 ada pada Lampiran A.

## 11. Daftar Halaman dan Alur

### 11.1 Halaman publik (tanpa login)

| Rute | Halaman | Isi |
|---|---|---|
| /kos/:kosId | Pesan Kamar | Nama kos, alamat, tombol WhatsApp pemilik, kamar kosong, aturan kos, form pengajuan |

### 11.2 Halaman pemilik

| Rute | Halaman | Isi |
|---|---|---|
| /login, /daftar | Login, Registrasi | Form email dan password; pendaftaran dengan nama pemilik dan nama kos |
| / | Dashboard | Okupansi, pendapatan, tunggakan, jatuh tempo 7 hari, grafik 6 bulan, kartu pemesanan menunggu |
| /kamar | Kamar | Kartu kamar berwarna per status |
| /penghuni | Penghuni | Daftar, cari, WhatsApp, kirim aturan kos |
| /sewa | Sewa | Mulai dan akhiri sewa, riwayat |
| /pemesanan | Pemesanan | Link pemesanan, tab Menunggu dan Diproses, setujui, tolak, WhatsApp |
| /tagihan | Tagihan | Filter, buat tagihan, tandai lunas, denda, WhatsApp, kwitansi |
| /laporan | Laporan | Ringkasan, rincian, ekspor PDF dan Excel |
| /pengaturan | Pengaturan Kos | Denda, masa tenggang, nilai bawaan, aturan kos |
| /profil | Profil | Data kos, ubah kata sandi, keluar |

### 11.3 Halaman Super Admin

| Rute | Halaman | Isi |
|---|---|---|
| /admin | Super Admin | Statistik, daftar kos, pencarian dan filter, aktif/nonaktif, ekspor Excel |

Halaman admin memakai layout sendiri (tanpa menu pemilik). Admin yang membuka rute pemilik dialihkan ke /admin, dan pemilik yang membuka /admin dialihkan ke /.

### 11.4 Alur utama

Pemilik:
1. Daftar dan login, lalu isi profil dan Pengaturan Kos.
2. Isi data kamar.
3. Bagikan link pemesanan, atau tambah penghuni dan mulai sewa langsung.
4. Tiap awal bulan: Buat Tagihan Bulan Ini.
5. Penghuni bayar: Tandai Lunas, lalu unduh kwitansi. Belum bayar: Ingatkan via WhatsApp (denda ikut tercantum bila terlambat).
6. Akhir bulan: buka Laporan dan ekspor.

Calon penghuni:
1. Membuka link kos dari pemilik.
2. Melihat kamar kosong dan aturan kos.
3. Mengisi form pemesanan lalu mengabari pemilik via WhatsApp.
4. Pemilik menyetujui atau menolak; calon penghuni dihubungi lewat WhatsApp.

Super Admin:
1. Login dan masuk ke /admin.
2. Memantau statistik dan daftar kos.
3. Menonaktifkan akun yang bermasalah, atau mengaktifkannya kembali.

## 12. Model Keamanan dan Peran (Penjelasan untuk Presentasi)

**Fungsi Super Admin:** pemilik kos mengelola kosnya, Super Admin mengelola aplikasinya. Aplikasi dipakai banyak pemilik, dan tiap pemilik hanya melihat datanya sendiri. Super Admin memantau semua kos dan mengendalikan akses akun, tanpa melihat data pribadi penghuni.

Alasan perancangan:
1. **Peran ada di database.** Menyembunyikan menu saja tidak cukup karena pengguna bisa memanggil API langsung. Karena itu peran dicek oleh fungsi dan policy di database.
2. **Akun admin tidak bisa dibuat lewat pendaftaran.** Hanya lewat SQL manual oleh pemilik proyek.
3. **Tidak ada kenaikan peran sendiri.** Trigger menolak perubahan `role` dan `aktif` dari pengguna biasa.
4. **Admin hanya melihat ringkasan.** Fungsi admin tidak memuat data penghuni, sewa, atau tagihan.
5. **Akun nonaktif terkunci di database.** Diuji dengan menjalankan permintaan sebagai akun nonaktif: hasilnya 0 baris walau akun memiliki 5 kamar.
6. **Halaman publik minim data.** Pengunjung hanya melihat kamar kosong lewat fungsi khusus, tidak pernah tabel langsung.

Keterbatasan yang diakui: pembatas pengajuan publik berupa batas jumlah pengajuan menunggu, bukan captcha. Untuk produksi disarankan menambah captcha dan pembatasan laju di tingkat jaringan.

## 13. Rencana Pengerjaan dan Status

| Tahap | Isi | Status |
|---|---|---|
| 1 | Setup proyek | Selesai |
| 2 | Database dan keamanan | Selesai |
| 3 | Autentikasi | Selesai |
| 4 | Layout dan navigasi | Selesai |
| 5 | Kamar | Selesai |
| 6 | Penghuni | Selesai |
| 7 | Sewa (mulai dan akhiri) | Selesai |
| 8A, 8B | Tagihan, WhatsApp, kwitansi | Selesai |
| 9 | Dashboard | Selesai |
| 10 | Laporan dan ekspor | Selesai |
| 11A, 11B | Profil, perapian UI, PWA | Selesai |
| 12A | Pengaturan Kos dan denda | Selesai |
| 12B | Peran admin (database dan routing) | Selesai |
| 12C-1, 12C-2 | Halaman Super Admin | Selesai |
| 12D-1 | Halaman publik pemesanan dan database pemesanan | Selesai |
| 12D-2 | Halaman Pemesanan pemilik | Dalam pengerjaan |
| 12E | Portal penghuni | Rencana lanjutan |
| 13 | Pengujian akhir, keamanan, deploy, dokumentasi | Belum |

## 14. Kriteria Penerimaan

Fitur pemilik (versi 1.0):
- Pemilik baru dapat daftar, login, dan menambah kamar.
- Mulai sewa mengubah kamar menjadi terisi; akhiri sewa mengembalikannya ke kosong; sewa ganda pada satu kamar ditolak.
- Tombol Buat Tagihan Bulan Ini dua kali berturut-turut tidak membuat tagihan ganda.
- Tagihan lewat jatuh tempo dan belum lunas ditandai "Terlambat".
- Tombol WhatsApp membuka chat dengan nomor dan pesan yang benar.
- Kwitansi PDF memuat nama kos, penghuni, kamar, periode, jumlah, tanggal bayar.
- Angka dashboard dan laporan sesuai dengan hitungan manual.
- Pemilik A tidak dapat melihat data pemilik B.

Pengaturan dan denda:
- Pengaturan tersimpan dan menjadi nilai awal pada form mulai sewa.
- Denda mulai dihitung setelah masa tenggang (contoh: tenggang 3 hari, terlambat 5 hari, Rp 10.000 per hari, hasilnya Rp 20.000).
- Denda tampil pada tagihan, pesan WhatsApp, kwitansi, dashboard, dan laporan, dan angkanya saling cocok.

Super Admin:
- Akun admin langsung masuk ke /admin tanpa menu pemilik dan tanpa nama kos.
- Pemilik yang membuka /admin dialihkan ke /.
- Statistik admin cocok dengan hitungan di database.
- Pemilik tidak dapat mengubah perannya sendiri (error dari database).
- Akun yang dinonaktifkan tidak dapat membaca data apa pun (hasil 0 baris) dan halaman publiknya tidak ditemukan; setelah diaktifkan, datanya utuh kembali.
- Halaman admin tidak mengakses tabel penghuni, sewa, atau tagihan.

Pemesanan:
- Halaman publik menampilkan hanya kamar kosong milik kos yang aktif.
- Form menolak nama kosong, nomor HP tidak valid, tanggal lampau, dan persetujuan yang belum dicentang.
- Pengajuan ketiga dengan nomor HP yang sama saat dua sebelumnya masih menunggu ditolak.
- Menyetujui pengajuan membuat penghuni dan sewa, mengubah kamar menjadi terisi, dan menolak otomatis pengajuan lain untuk kamar yang sama.
- Kamar yang sudah terisi tidak muncul lagi di halaman publik.

Umum:
- Aplikasi dapat dipasang ke layar utama HP dan diakses lewat URL publik.
- Tidak ada error pada console di alur utama.

## 15. Rencana Pengujian

- Uji manual tiap fitur per tahap (cek di akhir tiap prompt).
- Uji keamanan dengan dua akun pemilik dan satu akun admin.
- Uji kunci akun nonaktif di database dengan mensimulasikan permintaan sebagai akun tersebut.
- Uji peran: pemilik mencoba mengubah `role`, dan memanggil fungsi admin (harus ditolak).
- Uji logika: sewa ganda, tagihan ganda, kamar dan penghuni yang masih terkait sewa tidak bisa dihapus, penolakan otomatis pengajuan pada kamar yang sama.
- Uji tanggal: penghuni masuk di tengah bulan, hari tagih 28, pergantian bulan dan tahun, perhitungan denda pada batas masa tenggang.
- Uji publik: id kos tidak valid, kos nonaktif, kamar terisi, pengajuan berulang.
- Uji responsif pada 360, 768, 1280 px.
- Uji PWA pada hasil build (`npm run build` lalu `npm run preview`) dan pada URL produksi.

## 16. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Waktu tidak cukup | Kerjakan fitur Wajib dulu, portal penghuni dan opsional belakangan |
| Data kamar tidak sinkron dengan sewa | Ubah status hanya lewat fungsi database |
| RLS salah sehingga data bocor | Uji dua akun dan uji akun nonaktif di database |
| Pengguna menaikkan perannya sendiri | Trigger penjaga kolom dan pembuatan admin hanya lewat SQL |
| Kunci Supabase terekspos | Hanya anon key di .env, .env tidak di-commit |
| Spam pada form publik | Pembatasan jumlah pengajuan, validasi di database; captcha sebagai pengembangan lanjutan |
| Data pribadi calon penghuni dan penghuni | Simpan minimal, tanpa nomor KTP, hanya pemilik yang dapat membaca |
| Batas email bawaan Supabase | Atur SMTP sendiri sebelum dipakai di kos asli |
| Cache PWA menampilkan versi lama | Uji di jendela penyamaran, hapus service worker saat pengembangan |
| Batas pemakaian model AI gratis | Pecah prompt per bagian dan siapkan model cadangan |

## 17. Struktur Folder

```
kosku/
  supabase/
    schema.sql                      (skema awal versi 1.0)
    migrations/                     (simpan skrip Lampiran A di sini)
      2026-11-03_pengaturan_kos.sql
      2026-11-04_peran_admin.sql
      2026-11-07_pemesanan.sql
  src/
    components/   (Layout, AdminRoute, ProtectedRoute, Modal, Toast, ConfirmDialog,
                   EmptyState, TombolPasang)
    pages/        (Login, Daftar, Beranda, Kamar, Penghuni, Sewa, Tagihan, Laporan,
                   Pengaturan, Pemesanan, Profil, Lainnya, Admin, PesanKamar)
    lib/          (supabaseClient.js, format.js, ekspor.js, kwitansi.js, whatsapp.js, denda.js)
    hooks/        (useAuth, useProfil, useKamar, usePenghuni, useSewa, useTagihan,
                   usePengaturan, usePemesanan, useDashboard, useLaporan, useAdmin)
    App.jsx
    main.jsx
  public/         (ikon PWA)
  vercel.json
  .env            (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
```

---

# LAMPIRAN A — Skrip SQL Tambahan Versi 2.0

Jalankan berurutan di SQL Editor Supabase. Semuanya aman dijalankan ulang. Simpan juga sebagai berkas di `supabase/migrations/` agar tercatat di repositori.

## A.1 Pengaturan Kos dan denda (Tahap 12A)

```sql
create table if not exists public.pengaturan_kos (
  user_id uuid primary key references auth.users(id) on delete cascade,
  denda_per_hari numeric(14,2) not null default 0 check (denda_per_hari >= 0),
  masa_tenggang_hari smallint not null default 0 check (masa_tenggang_hari between 0 and 31),
  hari_tagih_default smallint not null default 1 check (hari_tagih_default between 1 and 28),
  deposit_default numeric(14,2) not null default 0 check (deposit_default >= 0),
  aturan_kos text,
  updated_at timestamptz not null default now()
);

alter table public.pengaturan_kos enable row level security;

drop policy if exists "pengaturan sendiri" on public.pengaturan_kos;
create policy "pengaturan sendiri" on public.pengaturan_kos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.tagihan
  add column if not exists denda numeric(14,2) not null default 0 check (denda >= 0);
```

## A.2 Peran admin dan fungsi admin (Tahap 12B)

```sql
alter table public.profiles
  add column if not exists role text not null default 'pemilik',
  add column if not exists aktif boolean not null default true;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('pemilik','admin'));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and aktif
  );
$$;

create or replace function public.akun_aktif()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select aktif from public.profiles where id = auth.uid()), true);
$$;

create or replace function public.jaga_kolom_profil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null
     or coalesce(current_setting('app.admin_op', true), '') = '1' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'pemilik';
    new.aktif := true;
  elsif new.role is distinct from old.role
     or new.aktif is distinct from old.aktif then
    raise exception 'Tidak boleh mengubah peran atau status akun';
  end if;
  return new;
end $$;

drop trigger if exists profiles_jaga_kolom on public.profiles;
create trigger profiles_jaga_kolom
  before insert or update on public.profiles
  for each row execute function public.jaga_kolom_profil();

do $$
declare t text;
begin
  foreach t in array array['kamar','penghuni','sewa','tagihan','pengaturan_kos'] loop
    execute format('drop policy if exists "akun harus aktif" on public.%I', t);
    execute format(
      'create policy "akun harus aktif" on public.%I as restrictive for all to authenticated using (public.akun_aktif()) with check (public.akun_aktif())',
      t);
  end loop;
end $$;

create or replace function public.admin_statistik()
returns table (
  jumlah_pemilik bigint, pemilik_aktif bigint,
  total_kamar bigint, kamar_terisi bigint, sewa_aktif bigint
) language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Akses ditolak'; end if;
  return query select
    (select count(*) from profiles where role = 'pemilik'),
    (select count(*) from profiles where role = 'pemilik' and aktif),
    (select count(*) from kamar),
    (select count(*) from kamar where status = 'terisi'),
    (select count(*) from sewa where status = 'aktif');
end $$;

create or replace function public.admin_daftar_kos()
returns table (
  user_id uuid, email text, nama_pemilik text, nama_kos text, alamat text,
  aktif boolean, terdaftar timestamptz,
  jumlah_kamar bigint, kamar_terisi bigint, sewa_aktif bigint
) language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'Akses ditolak'; end if;
  return query
  select p.id, u.email::text, p.nama_pemilik, p.nama_kos, p.alamat,
         p.aktif, p.created_at,
         (select count(*) from kamar k where k.user_id = p.id),
         (select count(*) from kamar k where k.user_id = p.id and k.status = 'terisi'),
         (select count(*) from sewa s where s.user_id = p.id and s.status = 'aktif')
  from profiles p
  left join auth.users u on u.id = p.id
  where p.role = 'pemilik'
  order by p.created_at desc;
end $$;

create or replace function public.admin_set_aktif(p_user uuid, p_aktif boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Akses ditolak'; end if;
  if p_user = auth.uid() then
    raise exception 'Tidak bisa mengubah status akun sendiri';
  end if;
  perform set_config('app.admin_op', '1', true);
  update public.profiles set aktif = p_aktif
   where id = p_user and role = 'pemilik';
  perform set_config('app.admin_op', '', true);
end $$;

revoke all on function public.admin_statistik() from public, anon;
revoke all on function public.admin_daftar_kos() from public, anon;
revoke all on function public.admin_set_aktif(uuid, boolean) from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.admin_statistik() to authenticated;
grant execute on function public.admin_daftar_kos() to authenticated;
grant execute on function public.admin_set_aktif(uuid, boolean) to authenticated;
grant execute on function public.is_admin() to authenticated;
```

Membuat akun admin pertama (setelah akunnya dibuat di Authentication, ganti email-nya):

```sql
insert into public.profiles (id, nama_pemilik, nama_kos, role)
select id, 'Super Admin', 'KosKu', 'admin'
from auth.users
where email = 'EMAIL-ADMIN'
on conflict (id) do update set role = 'admin', nama_pemilik = 'Super Admin';
```

## A.3 Pemesanan kamar (Tahap 12D)

```sql
create table if not exists public.pemesanan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kamar_id uuid not null references public.kamar(id) on delete cascade,
  nama text not null check (char_length(nama) between 2 and 100),
  no_hp text not null,
  tanggal_masuk date not null,
  catatan text check (catatan is null or char_length(catatan) <= 500),
  status text not null default 'menunggu'
    check (status in ('menunggu','disetujui','ditolak')),
  alasan_tolak text,
  penghuni_id uuid references public.penghuni(id) on delete set null,
  sewa_id uuid references public.sewa(id) on delete set null,
  created_at timestamptz not null default now(),
  diproses_at timestamptz
);

create index if not exists pemesanan_user_status
  on public.pemesanan (user_id, status, created_at desc);
create index if not exists pemesanan_kamar_menunggu
  on public.pemesanan (kamar_id) where status = 'menunggu';

alter table public.pemesanan enable row level security;

drop policy if exists "pemesanan sendiri" on public.pemesanan;
create policy "pemesanan sendiri" on public.pemesanan
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "akun harus aktif" on public.pemesanan;
create policy "akun harus aktif" on public.pemesanan
  as restrictive for all to authenticated
  using (public.akun_aktif()) with check (public.akun_aktif());

create or replace function public.normalisasi_hp(p text)
returns text language sql immutable as $$
  select case
    when d = '' then ''
    when d like '62%' then d
    when d like '0%' then '62' || substr(d, 2)
    else '62' || d
  end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) x;
$$;

create or replace function public.kos_publik(p_kos uuid)
returns table (nama_kos text, alamat text, no_wa text, aturan_kos text)
language sql stable security definer set search_path = public as $$
  select p.nama_kos, p.alamat, p.no_wa, k.aturan_kos
  from profiles p
  left join pengaturan_kos k on k.user_id = p.id
  where p.id = p_kos and p.role = 'pemilik' and p.aktif;
$$;

create or replace function public.kamar_kosong_publik(p_kos uuid)
returns table (id uuid, nomor text, tipe text, harga_bulanan numeric, fasilitas text)
language sql stable security definer set search_path = public as $$
  select k.id, k.nomor, k.tipe, k.harga_bulanan, k.fasilitas
  from kamar k
  join profiles p on p.id = k.user_id
  where k.user_id = p_kos and k.status = 'kosong'
    and p.role = 'pemilik' and p.aktif
  order by k.nomor;
$$;

create or replace function public.ajukan_pemesanan(
  p_kos uuid, p_kamar uuid, p_nama text, p_no_hp text,
  p_tanggal_masuk date, p_catatan text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_hp text := public.normalisasi_hp(p_no_hp);
  v_id uuid;
begin
  if p_nama is null or char_length(trim(p_nama)) < 2 or char_length(p_nama) > 100 then
    raise exception 'Nama tidak valid';
  end if;
  if v_hp !~ '^62[0-9]{9,13}$' then
    raise exception 'Nomor HP tidak valid';
  end if;
  if p_tanggal_masuk is null
     or p_tanggal_masuk < current_date - 1
     or p_tanggal_masuk > current_date + 365 then
    raise exception 'Tanggal masuk tidak valid';
  end if;
  if p_catatan is not null and char_length(p_catatan) > 500 then
    raise exception 'Catatan terlalu panjang';
  end if;
  if not exists (
    select 1 from kamar k join profiles p on p.id = k.user_id
    where k.id = p_kamar and k.user_id = p_kos and k.status = 'kosong'
      and p.role = 'pemilik' and p.aktif
  ) then
    raise exception 'Kamar tidak tersedia';
  end if;
  if (select count(*) from pemesanan
       where user_id = p_kos and no_hp = v_hp and status = 'menunggu') >= 2 then
    raise exception 'Anda masih memiliki pengajuan yang menunggu. Mohon tunggu konfirmasi pemilik.';
  end if;
  if (select count(*) from pemesanan
       where user_id = p_kos and status = 'menunggu') >= 50 then
    raise exception 'Pengajuan sedang penuh, coba lagi nanti';
  end if;

  insert into pemesanan (user_id, kamar_id, nama, no_hp, tanggal_masuk, catatan)
  values (p_kos, p_kamar, trim(p_nama), v_hp, p_tanggal_masuk,
          nullif(trim(p_catatan), ''))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.setujui_pemesanan(
  p_pesan uuid, p_hari_tagih int, p_harga numeric, p_deposit numeric
) returns uuid language plpgsql security invoker set search_path = public as $$
declare
  r pemesanan%rowtype;
  v_penghuni uuid;
  v_sewa uuid;
begin
  select * into r from pemesanan
   where id = p_pesan and user_id = auth.uid() and status = 'menunggu'
   for update;
  if not found then
    raise exception 'Pemesanan tidak ditemukan atau sudah diproses';
  end if;

  if not exists (select 1 from kamar
                  where id = r.kamar_id and user_id = auth.uid() and status = 'kosong') then
    raise exception 'Kamar sudah tidak kosong';
  end if;

  select h.id into v_penghuni from penghuni h
   where h.user_id = auth.uid() and h.no_hp = r.no_hp
     and not exists (select 1 from sewa s
                      where s.penghuni_id = h.id and s.status = 'aktif')
   limit 1;
  if v_penghuni is null then
    insert into penghuni (user_id, nama, no_hp, catatan)
    values (auth.uid(), r.nama, r.no_hp, r.catatan)
    returning id into v_penghuni;
  end if;

  v_sewa := mulai_sewa(r.kamar_id, v_penghuni, r.tanggal_masuk,
                       p_hari_tagih, p_harga, p_deposit);

  update pemesanan
     set status = 'disetujui', penghuni_id = v_penghuni,
         sewa_id = v_sewa, diproses_at = now()
   where id = r.id;

  update pemesanan
     set status = 'ditolak', alasan_tolak = 'Kamar sudah dipesan orang lain',
         diproses_at = now()
   where user_id = auth.uid() and kamar_id = r.kamar_id
     and status = 'menunggu' and id <> r.id;

  return v_sewa;
end $$;

create or replace function public.tolak_pemesanan(p_pesan uuid, p_alasan text default null)
returns void language plpgsql security invoker set search_path = public as $$
begin
  update pemesanan
     set status = 'ditolak', alasan_tolak = nullif(trim(p_alasan), ''),
         diproses_at = now()
   where id = p_pesan and user_id = auth.uid() and status = 'menunggu';
  if not found then
    raise exception 'Pemesanan tidak ditemukan atau sudah diproses';
  end if;
end $$;

revoke all on function public.kos_publik(uuid) from public;
revoke all on function public.kamar_kosong_publik(uuid) from public;
revoke all on function public.ajukan_pemesanan(uuid, uuid, text, text, date, text) from public;
grant execute on function public.kos_publik(uuid) to anon, authenticated;
grant execute on function public.kamar_kosong_publik(uuid) to anon, authenticated;
grant execute on function public.ajukan_pemesanan(uuid, uuid, text, text, date, text) to anon, authenticated;

revoke all on function public.setujui_pemesanan(uuid, int, numeric, numeric) from public, anon;
revoke all on function public.tolak_pemesanan(uuid, text) from public, anon;
grant execute on function public.setujui_pemesanan(uuid, int, numeric, numeric) to authenticated;
grant execute on function public.tolak_pemesanan(uuid, text) to authenticated;
```

---

# LAMPIRAN B — Prompt OpenCode Tahap 12A sampai 12D

Prompt Tahap 1 sampai 11 ada pada dokumen PRD-manajemen-kos.md (versi 1.0). Tempel satu prompt per tahap di OpenCode (VS Code), jalankan skrip SQL pada Lampiran A lebih dulu bila tahap itu membutuhkannya, lalu uji sebelum lanjut.

## Tahap 12A: Pengaturan Kos (setelah SQL A.1)

```text
Tambahkan fitur Pengaturan Kos. Database sudah siap: tabel pengaturan_kos (user_id, denda_per_hari, masa_tenggang_hari, hari_tagih_default, deposit_default, aturan_kos, updated_at) dengan RLS milik sendiri, dan kolom baru tagihan.denda (numeric, default 0). Jangan membuat atau mengubah skema database. (1) Buat hook src/hooks/usePengaturan.js yang memuat pengaturan pengguna; bila barisnya belum ada, kembalikan nilai bawaan (denda 0, tenggang 0, hari tagih 1, deposit 0, aturan kosong) tanpa error; simpan memakai upsert dengan onConflict 'user_id' dan isi updated_at. (2) Buat halaman /pengaturan (daftarkan di router, sidebar desktop, menu Lainnya di HP, dan tautan dari halaman Profil) berisi form: denda per hari (Rupiah, input memakai parseRupiah), masa tenggang (0 sampai 31 hari), hari tagih bawaan (1 sampai 28), deposit bawaan (Rupiah), dan aturan kos (textarea, maksimal 2000 karakter). Validasi semua field, tampilkan Toast sukses atau error.message. (3) Form Mulai Sewa di halaman /sewa memakai hari_tagih_default dan deposit_default sebagai nilai awal (tetap bisa diubah). (4) Perhitungan denda: buat fungsi hitungDenda(tagihan, pengaturan, hariIni) di src/lib/denda.js dengan aturan: bila status 'belum' dan hari ini lebih besar dari jatuh_tempo ditambah masa_tenggang_hari, maka hariTelat = selisih hari antara hari ini dan (jatuh_tempo + masa_tenggang_hari) dan denda = denda_per_hari dikali hariTelat; selain itu 0. Gunakan tanggal lokal, bukan UTC. Di halaman /tagihan tampilkan pada kartu tagihan terlambat baris "Denda: Rp X (N hari)" bila denda lebih dari 0. Pada modal "Tandai Lunas" tambahkan field denda yang terisi otomatis dari hasil hitungDenda tetapi bisa diubah (boleh 0), simpan ke kolom tagihan.denda; "Batalkan Lunas" mengembalikan denda menjadi 0. (5) Pesan WhatsApp untuk tagihan terlambat di buatPesanTagihan: bila denda lebih dari 0 tambahkan kalimat "Denda keterlambatan saat ini {Rupiah} ({N} hari)." (6) Di halaman /penghuni tambahkan tombol "Kirim aturan kos via WhatsApp" pada penghuni yang berstatus aktif, yang membuka wa.me dengan pesan berisi nama kos dan isi aturan_kos; tombol nonaktif dengan keterangan bila aturan_kos masih kosong. (7) Kwitansi: bila denda lebih dari 0 tampilkan baris Tagihan, Denda, dan Total Dibayar (jumlah ditambah denda) beserta terbilang dari total; bila denda 0 tampilannya seperti sebelumnya. (8) Dashboard dan Laporan: pendapatan (tagihan lunas) dihitung dari jumlah ditambah denda; tambahkan kolom Denda pada tabel rincian Laporan dan pada PDF serta Excel; Tunggakan tetap dihitung dari jumlah tagihan saja dan beri keterangan kecil "belum termasuk denda". Pastikan angka Dashboard, Tagihan, dan Laporan tetap saling cocok. Jangan mengubah fungsi database yang sudah ada. File berisi JSX harus berekstensi .jsx. Jangan baca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: pengaturan tersimpan dan bertahan setelah refresh; denda dihitung setelah masa tenggang; kwitansi, dashboard, dan laporan menampilkan denda dan angkanya cocok.

## Tahap 12B: Peran Admin (setelah SQL A.2 dan pembuatan akun admin)

```text
Siapkan fondasi peran admin di frontend. Database sudah siap: kolom profiles.role ('pemilik' atau 'admin') dan profiles.aktif (boolean), serta fungsi rpc is_admin(), admin_statistik(), admin_daftar_kos(), admin_set_aktif(p_user, p_aktif). Jangan membuat atau mengubah skema database. (1) Lengkapi hook src/hooks/useProfil.js agar juga memuat role dan aktif, dan sediakan isAdmin (role === 'admin'); sediakan state loading agar tidak ada layar berkedip. Profil harus dimuat berdasarkan id pengguna yang sedang login (.eq('id', user.id).maybeSingle()), dikosongkan saat logout atau saat user.id berubah, dan tidak boleh disimpan di localStorage atau cache modul. (2) Buat komponen AdminRoute di src/components yang hanya meloloskan pengguna dengan role 'admin' dan aktif; selain itu arahkan ke /. (3) Pengguna dengan role 'admin' yang membuka rute pemilik (/, /kamar, /penghuni, /sewa, /tagihan, /laporan, /pengaturan, /profil, /lainnya) harus diarahkan ke /admin; setelah login, admin langsung diarahkan ke /admin. (4) Bila aktif bernilai false pada akun pemilik, tampilkan halaman penuh "Akun Anda dinonaktifkan" dengan pesan "Silakan hubungi pengelola KosKu" dan tombol Keluar, tanpa menampilkan layout dan menu pemilik. (5) Buat halaman placeholder /admin di dalam AdminRoute dengan layout sederhana tersendiri (header bertuliskan "KosKu Super Admin", tombol Keluar, tanpa menu pemilik dan tanpa nama kos, rute /admin berdiri di luar layout pemilik) berisi sapaan "Halo, {nama_pemilik}" (tampilkan loading selama profil belum terbaca) dan teks "Dashboard Super Admin akan tampil di sini". (6) Judul tab "Super Admin - KosKu". Pastikan akun pemilik biasa yang membuka /admin langsung diarahkan ke /. Tidak mengubah alur pemilik yang sudah ada. File berisi JSX harus berekstensi .jsx. Jangan baca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: admin masuk ke /admin tanpa menu pemilik dan tanpa nama kos; pemilik tidak bisa membuka /admin; pemilik tidak bisa menaikkan perannya (error dari database).

## Tahap 12C-1: Statistik dan Daftar Kos

```text
Bangun halaman Super Admin di rute /admin (di dalam AdminRoute) menggantikan placeholder, bagian pertama: statistik dan daftar kos. Database sudah siap, jangan membuat atau mengubah skema. Fungsi rpc yang tersedia: admin_statistik() mengembalikan satu baris { jumlah_pemilik, pemilik_aktif, total_kamar, kamar_terisi, sewa_aktif }; admin_daftar_kos() mengembalikan baris { user_id, email, nama_pemilik, nama_kos, alamat, aktif, terdaftar, jumlah_kamar, kamar_terisi, sewa_aktif }. Fungsi ini sengaja TIDAK memuat data penghuni, jadi halaman admin tidak boleh menampilkan atau mengambil data penghuni, sewa, atau tagihan milik pemilik. (1) Buat hook src/hooks/useAdmin.js berisi statistik, daftarKos, loading, error, dan fungsi muat ulang. (2) Bagian atas halaman: kartu statistik Total Pemilik (dengan keterangan berapa yang aktif), Total Kamar, Kamar Terisi (dengan persentase okupansi keseluruhan), dan Sewa Aktif. (3) Bagian daftar kos berupa tabel di desktop dan kartu di HP, dengan kolom: nama kos, nama pemilik, email, alamat, jumlah kamar, kamar terisi (dengan persen okupansi per kos), sewa aktif, tanggal daftar (formatTanggal), dan badge status (Aktif hijau, Nonaktif merah). (4) Tambahkan pencarian berdasarkan nama kos, nama pemilik, atau email, filter status (Semua, Aktif, Nonaktif), dan pengurutan (terbaru, nama kos, jumlah kamar terbanyak). (5) Tambahkan catatan kecil di halaman: "Admin hanya melihat data ringkasan. Data penghuni tidak ditampilkan demi privasi." (6) State loading (skeleton), EmptyState ("Belum ada pemilik kos terdaftar" dan "Tidak ada hasil untuk pencarian ini"), tampilkan error.message bila gagal, dan tampilan responsif mobile-first (lebar 360 px tidak boleh meluber). Header "KosKu Super Admin", tombol Keluar, dan judul tab "Super Admin - KosKu" tetap. Belum perlu tombol aktif atau nonaktif dan ekspor Excel, itu tahap berikutnya. Jangan mengubah halaman pemilik. File berisi JSX harus berekstensi .jsx. Jangan baca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: angka statistik cocok dengan hitungan SQL; daftar tidak memuat akun admin; tab Network tidak memanggil tabel penghuni, sewa, atau tagihan.

## Tahap 12C-2: Aktif/Nonaktif dan Ekspor Excel

```text
Lengkapi halaman Super Admin di /admin dengan dua fitur. Database sudah siap, jangan membuat atau mengubah skema. Fungsi rpc admin_set_aktif(p_user, p_aktif) mengubah status akun pemilik dan hanya bisa dipanggil admin. (1) Di src/hooks/useAdmin.js tambahkan fungsi setAktif(userId, aktif) yang memanggil supabase.rpc('admin_set_aktif', { p_user: userId, p_aktif: aktif }), lalu memuat ulang statistik dan daftar kos. (2) Pada tiap baris atau kartu kos tambahkan tombol "Nonaktifkan" (untuk akun aktif) atau "Aktifkan" (untuk akun nonaktif). Tombol membuka ConfirmDialog yang menjelaskan akibatnya: akun nonaktif tidak bisa masuk ke aplikasi dan datanya tidak bisa diakses sampai diaktifkan lagi, data tidak dihapus. Setelah berhasil tampilkan Toast sukses dan perbarui daftar, bila gagal tampilkan error.message. Tombol harus nonaktif (disabled) dan menampilkan loading selama proses berjalan agar tidak terkirim dua kali. (3) Tambahkan tombol "Unduh Excel" yang mengekspor daftar kos hasil filter yang sedang tampil memakai paket xlsx, satu sheet bernama "Daftar Kos" dengan kolom: Nama Kos, Nama Pemilik, Email, Alamat, Jumlah Kamar, Kamar Terisi, Sewa Aktif, Status (Aktif atau Nonaktif), dan Tanggal Daftar, tanpa data penghuni. Angka disimpan sebagai angka, lebar kolom diatur agar terbaca. Nama file daftar-kos-YYYY-MM-DD.xlsx (tanggal lokal). Taruh logikanya di src/lib/ekspor.js (fungsi unduhDaftarKos). Tombol dinonaktifkan bila tidak ada data. (4) Pastikan admin tidak muncul di daftar sehingga tidak bisa menonaktifkan dirinya sendiri. Jangan mengubah halaman pemilik. File berisi JSX harus berekstensi .jsx. Jangan baca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: akun yang dinonaktifkan melihat halaman "Akun Anda dinonaktifkan"; uji di database mengembalikan 0 baris saat nonaktif dan jumlah semula setelah diaktifkan; ekspor Excel terbuka dan tanpa data penghuni.

## Tahap 12D-1: Halaman Publik Pemesanan (setelah SQL A.3)

```text
Buat halaman publik pemesanan kamar, tanpa login. Database sudah siap, jangan membuat atau mengubah skema. Fungsi rpc yang tersedia untuk pengunjung (tanpa login): kos_publik(p_kos) mengembalikan { nama_kos, alamat, no_wa, aturan_kos } (kosong bila kos tidak ada atau akun nonaktif); kamar_kosong_publik(p_kos) mengembalikan daftar { id, nomor, tipe, harga_bulanan, fasilitas } kamar yang kosong; ajukan_pemesanan(p_kos, p_kamar, p_nama, p_no_hp, p_tanggal_masuk, p_catatan) membuat pengajuan dan melempar error berbahasa Indonesia bila gagal (tampilkan error.message apa adanya di Toast). (1) Daftarkan rute publik /kos/:kosId di App.jsx DI LUAR ProtectedRoute dan AdminRoute dan layout pemilik; rute ini bisa dibuka siapa pun, termasuk pengguna yang sedang login (jangan diarahkan ke mana-mana). Judul tab "Pesan Kamar - KosKu". (2) Buat halaman src/pages/PesanKamar.jsx dengan layout publik sendiri (header berisi nama kos, tanpa sidebar pemilik, tanpa tombol Keluar): tampilkan nama kos, alamat, dan tombol "Hubungi pemilik via WhatsApp" (buatLinkWA ke no_wa, disembunyikan bila kosong); bagian "Kamar Tersedia" berupa kartu responsif (nomor, tipe, harga per bulan dengan formatRupiah, fasilitas) dengan tombol "Pesan Kamar"; bagian "Aturan Kos" yang bisa dibuka-tutup (accordion) bila aturan_kos tidak kosong, teks ditampilkan dengan baris baru dipertahankan (whitespace-pre-line). Bila kos tidak ditemukan atau id tidak valid tampilkan pesan "Kos tidak ditemukan atau tidak aktif". Bila tidak ada kamar kosong tampilkan EmptyState "Belum ada kamar kosong saat ini" beserta tombol WhatsApp ke pemilik. (3) Tombol "Pesan Kamar" membuka Modal berisi form: nama lengkap (wajib, 2 sampai 100 karakter), nomor HP/WhatsApp (wajib, divalidasi: setelah dibersihkan dari spasi, tanda hubung, dan tanda plus harus diawali 08 atau 62 dengan panjang 10 sampai 14 digit), tanggal masuk yang diinginkan (wajib, tidak boleh sebelum hari ini dan paling jauh satu tahun ke depan, memakai tanggal lokal), catatan (opsional, maksimal 500 karakter dengan penghitung karakter), dan satu kotak persetujuan "Data saya dipakai pemilik kos hanya untuk menghubungi dan memproses pemesanan ini". Tambahkan satu field jebakan tersembunyi (honeypot) yang tidak boleh terisi; bila terisi, pura-pura berhasil tanpa memanggil rpc. Jangan menyediakan field nomor KTP atau dokumen identitas. Kirim nomor HP yang sudah dinormalisasi dengan normalisasiNomor dari src/lib/whatsapp.js. Tombol kirim menampilkan loading dan tidak bisa ditekan dua kali. (4) Setelah berhasil tampilkan layar sukses "Pengajuan terkirim. Pemilik kos akan menghubungi Anda lewat WhatsApp." beserta ringkasan (kamar, tanggal masuk) dan tombol "Kabari pemilik via WhatsApp" yang membuka wa.me ke no_wa pemilik dengan pesan terisi: "Halo, saya {nama}, baru mengajukan pemesanan kamar {nomor} di {nama_kos} untuk masuk tanggal {tanggal}. Mohon konfirmasinya. Terima kasih." (sembunyikan tombol bila no_wa kosong). Setelah modal ditutup, muat ulang daftar kamar agar kamar yang baru dipesan tetap konsisten. (5) Desain mobile-first, bersih, konsisten dengan warna aplikasi, skeleton saat memuat, nyaman di lebar 360 px. Halaman ini tidak boleh memanggil tabel mana pun secara langsung, hanya ketiga rpc di atas. File berisi JSX harus berekstensi .jsx. Jangan baca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: halaman terbuka tanpa login, hanya kamar kosong tampil; id ngawur menampilkan "Kos tidak ditemukan"; validasi form bekerja; pengajuan masuk ke tabel pemesanan dengan nomor berbentuk 628...; pengajuan ketiga dengan nomor yang sama ditolak; tab Network hanya memanggil tiga rpc publik.

## Tahap 12D-2: Halaman Pemesanan Pemilik

```text
Buat sisi pemilik untuk pemesanan kamar. Database sudah siap, jangan membuat atau mengubah skema. Tabel pemesanan (id, user_id, kamar_id, nama, no_hp, tanggal_masuk, catatan, status 'menunggu'/'disetujui'/'ditolak', alasan_tolak, penghuni_id, sewa_id, created_at, diproses_at) dengan RLS milik sendiri. Fungsi rpc: setujui_pemesanan(p_pesan, p_hari_tagih, p_harga, p_deposit) mengembalikan id sewa dan otomatis membuat penghuni dan sewa serta menolak pengajuan lain untuk kamar yang sama; tolak_pemesanan(p_pesan, p_alasan). (1) Buat hook src/hooks/usePemesanan.js berisi daftar pemesanan milik pengguna (join dengan kamar untuk nomor dan harga, urut terbaru), jumlahMenunggu, loading, error, serta fungsi setujui(id, {hariTagih, harga, deposit}), tolak(id, alasan), dan muat ulang. (2) Buat halaman /pemesanan (di dalam ProtectedRoute dan layout pemilik; daftarkan di router, sidebar desktop setelah Sewa, menu Lainnya di HP, dan tampilkan badge angka jumlah pengajuan menunggu pada menunya bila lebih dari 0) dengan dua tab: "Menunggu" dan "Diproses" (disetujui dan ditolak). Tiap pengajuan tampil sebagai kartu: nama, nomor HP, kamar, tanggal masuk (formatTanggal), catatan, waktu pengajuan, dan badge status (kuning Menunggu, hijau Disetujui, merah Ditolak; alasan penolakan ditampilkan bila ada). (3) Aksi pada pengajuan menunggu: "Setujui" membuka Modal berisi hari tagih (1 sampai 28; default dari pengaturan.hari_tagih_default dari hook usePengaturan, bila tidak ada pakai hari dari tanggal masuk maksimal 28), harga sewa (default harga bulanan kamar, input memakai parseRupiah), dan deposit (default deposit_default dari pengaturan), lalu memanggil setujui lewat ConfirmDialog; setelah berhasil tampilkan Toast "Pemesanan disetujui, sewa dimulai" dan muat ulang data pemesanan, kamar, penghuni, dan sewa sehingga halaman lain ikut berubah; bila gagal tampilkan error.message (misalnya kamar sudah tidak kosong). "Tolak" membuka Modal berisi alasan opsional lalu memanggil tolak. "Hubungi via WhatsApp" membuka wa.me ke nomor calon penghuni dengan pesan terisi sesuai status: untuk menunggu "Halo {nama}, terima kasih sudah mengajukan kamar {nomor} di {nama_kos}. Kami ingin mengonfirmasi rencana masuk tanggal {tanggal}."; untuk disetujui "Halo {nama}, pemesanan kamar {nomor} di {nama_kos} sudah kami setujui. Silakan masuk tanggal {tanggal}. Terima kasih."; untuk ditolak "Halo {nama}, mohon maaf pemesanan kamar {nomor} di {nama_kos} belum bisa kami terima.{alasan}". Tulis pembuat pesan di src/lib/whatsapp.js. (4) Di bagian atas halaman /pemesanan tampilkan kartu "Link Pemesanan Anda" berisi URL publik `${window.location.origin}/kos/${user.id}` dengan tombol "Salin link" (Toast "Link disalin") dan tombol "Bagikan via WhatsApp" yang membuka wa.me tanpa nomor tujuan dengan pesan berisi link, plus keterangan "Bagikan link ini ke calon penghuni. Mereka bisa memesan kamar tanpa membuat akun." (5) Tampilkan juga pada Dashboard satu kartu kecil "Pemesanan Menunggu" (jumlah, mengarah ke /pemesanan) tanpa mengubah angka-angka lain di Dashboard. (6) State loading (skeleton), EmptyState ("Belum ada pengajuan pemesanan" dan bagikan link-nya), tampilan responsif mobile-first. Jangan mengubah fungsi database, jangan mengubah halaman admin. File berisi JSX harus berekstensi .jsx. Jangan baca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: pengajuan tampil di tab Menunggu; setuju membuat penghuni dan sewa, kamar menjadi terisi, dan pengajuan lain untuk kamar yang sama otomatis ditolak; kamar yang terisi hilang dari halaman publik; pemilik B tidak melihat pengajuan pemilik A.

---

# LAMPIRAN C — Tahap 13: Pengujian, Keamanan, dan Deploy

```text
(1) Tinjau seluruh aplikasi: jalankan alur lengkap untuk tiga peran. Pemilik: daftar, isi profil dan Pengaturan Kos, tambah kamar dan penghuni, mulai sewa, buat tagihan, tandai lunas dengan denda, kwitansi, WhatsApp, laporan, akhiri sewa. Calon penghuni: buka link /kos/:id, ajukan pemesanan, lalu pemilik menyetujui dan menolak. Super Admin: statistik, daftar kos, nonaktifkan dan aktifkan akun, ekspor Excel. Perbaiki bug yang ditemukan. Uji kasus tepi: sewa ganda pada satu kamar, tagihan dobel, penghuni masuk tengah bulan, hari tagih 28, pergantian bulan dan tahun, batas masa tenggang denda, pengajuan ganda dari nomor HP yang sama, kamar yang dipesan dua orang sekaligus. (2) Pastikan tidak ada error atau warning di console, tidak ada rahasia ter-commit (.env di .gitignore, hanya anon key), semua query pemilik hanya mengakses data milik pengguna login, dan halaman admin tidak memanggil tabel penghuni, sewa, atau tagihan. (3) Kurangi ukuran bundel dengan memuat halaman berat (Laporan, Admin, ekspor PDF dan Excel) secara lazy (React.lazy dan dynamic import) tanpa mengubah perilaku. (4) Buat TESTING.md berisi daftar periksa uji manual untuk ketiga peran, termasuk uji dua akun pemilik berbeda dan uji akun nonaktif. (5) Siapkan deploy Vercel: pastikan npm run build sukses, tambahkan vercel.json dengan rewrite semua rute (termasuk /kos/:id dan /admin) ke /index.html. Jelaskan langkah: push ke GitHub, import repo di Vercel, isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu di Supabase tambahkan URL Vercel pada Authentication > URL Configuration (Site URL dan Redirect URLs). (6) Buat README.md: deskripsi, fitur per peran, teknologi, cara menjalankan lokal, variabel lingkungan, urutan menjalankan skrip SQL, cara membuat akun admin pertama, struktur folder, dan tautan demo. Jangan membaca file .env. Jalankan npm run build dan pastikan tidak ada error.
```

Cek: lulus uji tiga peran, console bersih, URL publik berfungsi, refresh di /kos/:id dan /admin tidak 404, login berfungsi di versi online, halaman publik pemesanan dapat dibuka dari HP.

## Pekerjaan manual sebelum dipakai di kos asli

- Matikan kembali **Confirm email** tidak disarankan; nyalakan, lalu atur **SMTP sendiri** agar batas email bawaan Supabase tidak menghalangi pendaftaran.
- Gunakan kata sandi kuat untuk akun pemilik dan akun admin.
- Beritahu penghuni dan calon penghuni bahwa nama dan nomor HP mereka disimpan untuk keperluan tagihan dan pemesanan.
- Unduh ekspor Excel tiap akhir bulan sebagai cadangan.
- Pertimbangkan menambah captcha pada form pemesanan publik.

---

## Checklist Pengumpulan ke Mentor

- [ ] PRD ini (PRD-KosKu-v2.md) beserta PRD-manajemen-kos.md (prompt tahap 1 sampai 11)
- [ ] URL aplikasi online
- [ ] Repositori GitHub beserta README dan TESTING.md
- [ ] Skema database (supabase/schema.sql dan supabase/migrations/)
- [ ] Demo tiga peran: pemilik (sewa, tagihan, denda, kwitansi, laporan, pengaturan), calon penghuni (link publik, pemesanan), Super Admin (statistik, aktif/nonaktif akun)
- [ ] Penjelasan model keamanan (Bagian 12) untuk pertanyaan tentang fungsi Super Admin