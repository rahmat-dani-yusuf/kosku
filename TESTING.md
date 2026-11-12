# Daftar Periksa Uji Manual — KosKu

Centang setiap butir sebelum deploy. Lakukan pada versi build produksi (`npm run build` + `npm run preview`) maupun di hosting.

## Persiapan

- [ ] Siapkan akun pemilik A (dengan data lengkap: kamar, penghuni, sewa, tagihan)
- [ ] Siapkan akun pemilik B (baru, data kosong)
- [ ] Siapkan akun Super Admin (peran admin di tabel profiles)
- [ ] Siapkan akun pemilik yang sudah dinonaktifkan oleh Super Admin
- [ ] Siapkan HP kedua / nomor WhatsApp lain untuk menguji sisi calon penghuni

## 1. Pemilik

### Kamar

- [ ] Tambah kamar baru (nomor, tipe, harga, fasilitas) muncul di daftar
- [ ] Nomor kamar duplikat ditolak dengan pesan "Nomor kamar sudah digunakan"
- [ ] Ubah data kamar tersimpan
- [ ] Hapus kamar tanpa riwayat sewa berhasil
- [ ] Hapus kamar yang punya riwayat sewa ditolak
- [ ] Status kamar: kosong / terisi / perbaikan tampil benar

### Penghuni

- [ ] Tambah penghuni (nama, no HP, pekerjaan, kontak darurat)
- [ ] Ubah data penghuni tersimpan
- [ ] Hapus penghuni tanpa sewa berhasil
- [ ] Hapus penghuni dengan sewa aktif/riwayat ditolak dengan pesan jelas

### Sewa

- [ ] Mulai sewa: hanya kamar kosong dan penghuni tanpa sewa aktif yang bisa dipilih
- [ ] Tambah penghuni cepat (+ Baru) dari modal sewa berfungsi
- [ ] Harga sewa otomatis terisi dari harga kamar; hari tagih default dari tanggal masuk (1-28)
- [ ] Deposit terisi dari nilai default pengaturan
- [ ] Setelah mulai sewa: kamar berubah jadi terisi, muncul di tab Aktif
- [ ] Akhiri sewa: tanggal keluar tidak boleh sebelum tanggal masuk
- [ ] Setelah sewa diakhiri: kamar kembali kosong, sewa pindah ke tab Riwayat

### Tagihan

- [ ] "Buat Tagihan Bulan Ini" membuat tagihan untuk semua sewa aktif sesuai periode
- [ ] Tandai lunas dengan metode bayar; status berubah jadi lunas
- [ ] Tagihan melewati jatuh tempo masuk daftar menunggak dengan hitungan hari telat
- [ ] Tombol "Ingatkan" membuka WhatsApp dengan pesan tagihan yang benar
- [ ] Pesan tagihan saat telat menyebut denda bila ada

### Denda

- [ ] Atur denda per hari dan masa tenggang di Pengaturan
- [ ] Tagihan telat menampilkan denda = denda/hari x jumlah hari melewati tenggang
- [ ] Tagihan telat yang dibayar pada bulan berikutnya tidak membuat tagihan baru

### Kwitansi

- [ ] Tombol Kwitansi mengunduh PDF A5 landscape
- [ ] Isi kwitansi benar: nama kos, penghuni, kamar, periode, jumlah terbilang, denda (bila ada), tanggal bayar, metode
- [ ] Nomor kwitansi unik per tagihan (KW-YYYYMM-xxxxxx)

### Laporan

- [ ] Ringkasan bulanan: total, lunas, belum, terlambat, kamar terisi, persentase terbayar
- [ ] Grafik pendapatan 6 bulan tampil
- [ ] Unduh PDF berisi ringkasan + rincian tagihan + daftar penunggak
- [ ] Unduh Excel berisi sheet Ringkasan, Tagihan, Kamar, Penghuni
- [ ] Tombol unduh nonaktif saat tidak ada data

### Pengaturan

- [ ] Simpan nama kos, alamat, no WA, aturan kos
- [ ] Simpan denda/hari, masa tenggang, hari tagih default, deposit default
- [ ] Nilai default terpakai di modal Mulai Sewa dan Setujui Pemesanan

### Pemesanan

- [ ] Kartu "Link Pemesanan Anda" menampilkan URL yang benar
- [ ] "Salin link" menampilkan Toast "Link disalin" dan hasil tempel benar
- [ ] "Bagikan via WhatsApp" membuka wa.me dengan pesan berisi link
- [ ] Pengajuan masuk muncul di tab Menunggu, badge sidebar dan Lainnya bertambah
- [ ] Tombol Setujui: hari tagih default dari pengaturan (fallback hari dari tanggal masuk), harga default dari kamar, deposit default
- [ ] Setujui via ConfirmDialog berhasil: Toast "Pemesanan disetujui, sewa dimulai", pemesanan pindah tab Diproses, badge berkurang, kamar jadi terisi, sewa aktif muncul
- [ ] Setujui dengan harga kosong ditolak ("Harga sewa wajib diisi")
- [ ] Tolak dengan alasan: Toast, status Ditolak merah + alasan tampil di kartu
- [ ] Tombol "Hubungi via WhatsApp" membuka wa.me dengan pesan sesuai status (menunggu/disetujui/ditolak; pesan ditolak memuat alasan)
- [ ] Skeleton tampil saat memuat; EmptyState "Belum ada pengajuan pemesanan" saat kosong
- [ ] Kartu "Pemesanan Menunggu" di Beranda menampilkan jumlah dan menuju /pemesanan

## 2. Calon Penghuni (tanpa login)

### Halaman publik /kos/:id

- [ ] Link pemesanan dibuka di HP: nama kos, alamat, tombol WA pemilik tampil tanpa login
- [ ] Daftar hanya kamar yang masih kosong, lengkap dengan harga dan fasilitas
- [ ] Aturan kos (bila diisi) bisa dibuka/tutup
- [ ] Link kos yang salah atau kos nonaktif menampilkan pesan "Kos tidak ditemukan atau tidak aktif"
- [ ] Refresh halaman pada /kos/:id tidak 404 (rewrite Vercel berjalan)

### Form pemesanan

- [ ] Validasi: nama minimal 2 karakter
- [ ] Validasi: nomor HP diawali 08/62, 10-14 digit
- [ ] Validasi: tanggal masuk wajib, tidak boleh lampau, maksimal 1 tahun ke depan
- [ ] Catatan maksimal 500 karakter (counter berjalan)
- [ ] Wajib centang persetujuan penggunaan data
- [ ] Pengajuan berhasil: halaman sukses + tombol kabari pemilik via WhatsApp
- [ ] Pengajuan muncul di sisi pemilik dengan data yang benar
- [ ] Kamar yang dipesan tetap tampil "Kosong" sampai disetujui

## 3. Super Admin

- [ ] Login akun admin mengarah ke /admin
- [ ] Pemilik biasa yang membuka /admin ditolak (AdminRoute)
- [ ] Statistik tampil: jumlah kos, pemilik, kamar, sewa aktif, dsb.
- [ ] Daftar kos tampil dengan status aktif/nonaktif
- [ ] Nonaktifkan akun kos: konfirmasi muncul, status berubah jadi Nonaktif
- [ ] Akun nonaktif tidak bisa login (lihat bagian 5)
- [ ] Aktifkan kembali akun: status jadi Aktif, akun bisa login lagi
- [ ] Unduh Excel daftar kos: kolom lengkap, angka rapi, nama file bertanggal

## 4. Uji Dua Akun Pemilik Berbeda (isolasi data)

- [ ] Login pemilik A: catat jumlah kamar/penghuni/sewa/tagihan
- [ ] Keluar, login pemilik B: semua daftar kosong (tidak melihat data A)
- [ ] Pemilik B menambah 1 kamar; kembali ke A: data A tidak berubah
- [ ] Link pemesanan B berisi id B; pengajuan lewat link B hanya muncul di B
- [ ] Badge pemesanan A dan B independen
- [ ] Laporan/ekspor A hanya memuat data A

## 5. Uji Akun Nonaktif

- [ ] Super Admin menonaktifkan pemilik C
- [ ] Coba login dengan kredensial C: ditolak dengan pesan (bukan masuk ke aplikasi)
- [ ] Sesi lama C (bila masih terbuka) tidak bisa memuat data / diarahkan keluar
- [ ] Link pemesanan milik C menampilkan halaman "Kos tidak ditemukan atau tidak aktif"
- [ ] Aktifkan kembali C: login normal lagi

## 6. Umum

- [ ] Refresh langsung pada /admin, /pemesanan, /kos/:id, /tagihan tidak 404
- [ ] Mode offline menampilkan banner dan tidak merusak halaman
- [ ] Menu mobile (bottom nav + Lainnya) dan sidebar desktop konsisten
- [ ] Toast sukses/gagal tampil untuk semua aksi penting
