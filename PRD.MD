# PRD — KosKu: Aplikasi Manajemen Kos

Versi: 1.0
Jenis tugas: Tugas bulanan mentor (satu orang satu web), waktu pengerjaan 4 minggu
Platform: Web responsif + PWA (bisa dipasang di HP)
Catatan: dirancang agar bisa dipakai di kos sungguhan setelah tugas selesai.

---

## 1. Ringkasan Produk

KosKu adalah aplikasi web untuk membantu pemilik kos mengelola kamar, penghuni, dan pembayaran sewa bulanan. Pemilik bisa melihat kamar mana yang kosong, siapa yang belum membayar, mengirim pengingat tagihan lewat WhatsApp, dan mencetak kwitansi, tanpa buku tulis atau spreadsheet manual.

## 2. Latar Belakang dan Masalah

- Banyak pemilik kos mencatat penghuni dan pembayaran di buku atau chat WhatsApp.
- Pembayaran sering lupa ditagih, dan sulit melacak siapa menunggak berapa bulan.
- Tidak ada rekap pendapatan bulanan yang rapi.
- Aplikasi manajemen properti yang ada terlalu besar atau berbayar untuk kos kecil.

## 3. Tujuan

Tujuan produk:
1. Melihat status semua kamar (kosong, terisi, perbaikan) dalam satu layar.
2. Membuat tagihan bulanan untuk semua penghuni dengan satu tombol.
3. Menandai pembayaran lunas dan mengirim pengingat via WhatsApp dalam hitungan detik.
4. Menyediakan laporan pendapatan bulanan yang bisa diunduh.

Tujuan tugas (untuk mentor):
1. Menunjukkan kemampuan membangun aplikasi full-stack: frontend, backend, database, autentikasi, logika bisnis, dan deployment.
2. Menghasilkan produk online yang bisa didemokan dan dipakai di kasus nyata.

## 4. Target Pengguna

| Persona | Deskripsi | Kebutuhan |
|---|---|---|
| Pemilik/pengelola kos | Usia 25-60, memakai HP, mengelola 5-30 kamar | Rekap cepat, tagihan tidak terlewat, laporan sederhana |

Penghuni tidak memakai aplikasi pada versi ini (hanya menerima pesan WhatsApp dan kwitansi dari pemilik).

## 5. Ruang Lingkup

### 5.1 Termasuk (MVP, wajib selesai)
- Registrasi, login, logout (email dan password)
- Profil kos (nama kos, alamat, nomor WhatsApp pemilik)
- Kelola kamar (nomor, tipe, harga bulanan, fasilitas, status)
- Kelola penghuni (nama, nomor HP, pekerjaan, kontak darurat, catatan)
- Mulai sewa (menempatkan penghuni di kamar) dan akhiri sewa (check-out)
- Tagihan bulanan otomatis (satu tombol untuk semua sewa aktif)
- Tandai tagihan lunas (tanggal dan metode bayar)
- Pengingat tagihan lewat tautan WhatsApp dengan pesan terisi otomatis
- Kwitansi PDF per pembayaran
- Dashboard (okupansi, pendapatan, tunggakan, jatuh tempo mendekat)
- Laporan bulanan dengan ekspor PDF/Excel
- PWA dan deploy online

### 5.2 Tidak termasuk
- Pembayaran online / payment gateway
- Pengiriman WhatsApp otomatis lewat API (hanya tautan wa.me yang dibuka pemilik)
- Aplikasi untuk penghuni (portal penghuni)
- Pencatatan token listrik per kamar
- Aplikasi native Android/iOS

### 5.3 Pengembangan lanjutan (jika waktu tersisa)
- Pencatatan pengeluaran kos (listrik, air, perbaikan) dan laba bersih
- Mode gelap
- Beberapa kos dalam satu akun
- Foto kamar

## 6. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-01 | Pengguna dapat mendaftar dan login dengan email dan password | Wajib |
| F-02 | Sesi login tetap tersimpan, halaman login menjadi halaman pertama bagi yang belum login | Wajib |
| F-03 | Pemilik dapat menambah, mengubah, menghapus kamar | Wajib |
| F-04 | Kamar memiliki status: kosong, terisi, perbaikan | Wajib |
| F-05 | Pemilik dapat menambah, mengubah, menghapus penghuni | Wajib |
| F-06 | Pemilik dapat memulai sewa: pilih kamar kosong, penghuni, tanggal masuk, tanggal tagih tiap bulan, harga, deposit | Wajib |
| F-07 | Satu kamar hanya boleh punya satu sewa aktif | Wajib |
| F-08 | Pemilik dapat mengakhiri sewa, kamar otomatis kembali kosong | Wajib |
| F-09 | Tombol "Buat tagihan bulan ini" membuat tagihan untuk semua sewa aktif tanpa duplikat | Wajib |
| F-10 | Daftar tagihan dengan filter periode dan status (belum bayar, lunas, terlambat) | Wajib |
| F-11 | Tandai tagihan lunas dengan tanggal bayar dan metode (tunai, transfer, lainnya) | Wajib |
| F-12 | Tombol "Ingatkan via WhatsApp" membuka WhatsApp dengan pesan tagihan terisi | Wajib |
| F-13 | Unduh kwitansi PDF untuk tagihan lunas | Wajib |
| F-14 | Dashboard: jumlah kamar terisi/kosong, persentase okupansi, pendapatan bulan ini, total tunggakan, tagihan jatuh tempo 7 hari ke depan | Wajib |
| F-15 | Laporan bulanan dan ekspor PDF/Excel | Wajib |
| F-16 | Ubah profil kos | Wajib |
| F-17 | Aplikasi dapat dipasang sebagai PWA | Wajib |
| F-18 | Pencatatan pengeluaran dan laba bersih | Opsional |
| F-19 | Mode gelap | Opsional |

## 7. Kebutuhan Non-Fungsional

- **Keamanan:** setiap pemilik hanya bisa mengakses datanya sendiri (Row Level Security). Password dikelola Supabase Auth.
- **Privasi data penghuni:** hanya simpan data yang perlu (nama, nomor HP, kontak darurat). Tidak menyimpan nomor KTP atau dokumen identitas pada versi ini.
- **Performa:** halaman termuat di bawah 3 detik pada 4G.
- **Responsif:** nyaman mulai lebar 360 px.
- **Kegunaan:** semua teks Bahasa Indonesia, format Rupiah (Rp 1.250.000), tanggal format Indonesia.
- **Validasi:** nomor kamar unik, harga tidak negatif, tanggal wajib, nomor HP berformat Indonesia.
- **Keandalan:** operasi bernilai penting (mulai sewa, akhiri sewa, buat tagihan) dijalankan sebagai fungsi database agar konsisten.
- **Cadangan data:** sediakan ekspor Excel agar pemilik punya salinan data.

## 8. Teknologi yang Digunakan

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Bahasa pemrograman | JavaScript (ES2022) untuk frontend, SQL dan PL/pgSQL untuk logika database | Sudah dikuasai, cepat dikerjakan |
| Frontend | React 18 + Vite | Cepat dan ringan |
| Routing | React Router | Navigasi antar halaman |
| Styling | Tailwind CSS | UI responsif cepat |
| Backend | Supabase (Backend-as-a-Service) | Database, autentikasi, dan API otomatis tanpa server sendiri |
| Database | PostgreSQL (Supabase) | Relasional, cocok untuk kamar-penghuni-sewa-tagihan |
| Logika bisnis | Fungsi SQL (RPC): mulai_sewa, akhiri_sewa, buat_tagihan_bulanan | Transaksi aman dan konsisten |
| Autentikasi | Supabase Auth (email + password) | Aman dan siap pakai |
| Keamanan data | Row Level Security | Data terpisah per pemilik |
| Grafik | Recharts | Integrasi mudah dengan React |
| Ekspor | jsPDF + jspdf-autotable, SheetJS (xlsx) | Laporan, kwitansi, dan Excel di sisi klien |
| Pengingat | Tautan wa.me dengan pesan terisi | Tanpa biaya API, cocok untuk kos kecil |
| PWA | vite-plugin-pwa | Bisa dipasang di HP |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) | Gratis untuk skala ini |
| Alat | VS Code + OpenCode, Git + GitHub | Alur kerja yang sudah dipakai |

Catatan: tidak ada server backend yang ditulis manual. Logika backend berupa skema database, aturan RLS, fungsi SQL, dan pemanggilan lewat `@supabase/supabase-js`.

## 9. Arsitektur Sistem

```
Pemilik kos (HP/Laptop)
        |
   React + Vite (PWA)  --- di-host di Vercel
        |
   @supabase/supabase-js (query + rpc)
        |
Supabase Cloud
   - Auth
   - PostgreSQL: profiles, kamar, penghuni, sewa, tagihan (+ RLS)
   - Fungsi SQL: mulai_sewa, akhiri_sewa, buat_tagihan_bulanan
        |
   WhatsApp (dibuka lewat tautan wa.me dari browser)
```

## 10. Desain Database

Relasi: satu pemilik memiliki banyak kamar dan penghuni. Satu sewa menghubungkan satu kamar dan satu penghuni. Satu sewa memiliki banyak tagihan (satu per bulan).

```sql
-- Profil kos (satu baris per pemilik)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama_pemilik text,
  nama_kos text,
  alamat text,
  no_wa text,
  created_at timestamptz not null default now()
);

create table public.kamar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nomor text not null,
  tipe text,
  harga_bulanan numeric(14,2) not null check (harga_bulanan >= 0),
  fasilitas text,
  status text not null default 'kosong'
    check (status in ('kosong','terisi','perbaikan')),
  created_at timestamptz not null default now(),
  unique (user_id, nomor)
);

create table public.penghuni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  no_hp text not null,
  pekerjaan text,
  kontak_darurat text,
  catatan text,
  created_at timestamptz not null default now()
);

create table public.sewa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kamar_id uuid not null references public.kamar(id) on delete restrict,
  penghuni_id uuid not null references public.penghuni(id) on delete restrict,
  tanggal_masuk date not null,
  tanggal_keluar date,
  hari_tagih smallint not null check (hari_tagih between 1 and 28),
  harga_sewa numeric(14,2) not null check (harga_sewa >= 0),
  deposit numeric(14,2) not null default 0 check (deposit >= 0),
  status text not null default 'aktif' check (status in ('aktif','selesai')),
  created_at timestamptz not null default now()
);

-- satu kamar hanya boleh punya satu sewa aktif
create unique index sewa_satu_aktif_per_kamar
  on public.sewa (kamar_id) where status = 'aktif';

create table public.tagihan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sewa_id uuid not null references public.sewa(id) on delete cascade,
  periode date not null,            -- selalu tanggal 1 pada bulan tagihan
  jumlah numeric(14,2) not null check (jumlah >= 0),
  jatuh_tempo date not null,
  status text not null default 'belum' check (status in ('belum','lunas')),
  tanggal_bayar date,
  metode text check (metode in ('tunai','transfer','lainnya')),
  catatan text,
  created_at timestamptz not null default now(),
  unique (sewa_id, periode)
);

create index on public.tagihan (user_id, periode desc);
create index on public.tagihan (user_id, status);
create index on public.sewa (user_id, status);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.kamar    enable row level security;
alter table public.penghuni enable row level security;
alter table public.sewa     enable row level security;
alter table public.tagihan  enable row level security;

create policy "profil sendiri" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "kamar sendiri" on public.kamar
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "penghuni sendiri" on public.penghuni
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sewa sendiri" on public.sewa
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tagihan sendiri" on public.tagihan
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Buat profil otomatis saat pengguna mendaftar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama_pemilik, nama_kos)
  values (new.id,
          new.raw_user_meta_data->>'nama_pemilik',
          new.raw_user_meta_data->>'nama_kos');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mulai sewa: buat sewa + ubah status kamar menjadi terisi
create or replace function public.mulai_sewa(
  p_kamar uuid, p_penghuni uuid, p_tanggal_masuk date,
  p_hari_tagih int, p_harga numeric, p_deposit numeric
) returns uuid language plpgsql security invoker set search_path = public as $$
declare v_id uuid;
begin
  insert into sewa (user_id, kamar_id, penghuni_id, tanggal_masuk,
                    hari_tagih, harga_sewa, deposit)
  values (auth.uid(), p_kamar, p_penghuni, p_tanggal_masuk,
          p_hari_tagih, p_harga, coalesce(p_deposit, 0))
  returning id into v_id;

  update kamar set status = 'terisi'
   where id = p_kamar and user_id = auth.uid();
  return v_id;
end $$;

-- Akhiri sewa: tutup sewa + kamar kembali kosong
create or replace function public.akhiri_sewa(p_sewa uuid, p_tanggal_keluar date)
returns void language plpgsql security invoker set search_path = public as $$
declare v_kamar uuid;
begin
  update sewa set status = 'selesai', tanggal_keluar = p_tanggal_keluar
   where id = p_sewa and user_id = auth.uid() and status = 'aktif'
   returning kamar_id into v_kamar;

  if v_kamar is not null then
    update kamar set status = 'kosong'
     where id = v_kamar and user_id = auth.uid();
  end if;
end $$;

-- Buat tagihan bulanan untuk semua sewa aktif (tanpa duplikat)
create or replace function public.buat_tagihan_bulanan(p_periode date)
returns int language plpgsql security invoker set search_path = public as $$
declare v_awal date := date_trunc('month', p_periode)::date;
        v_n int;
begin
  insert into tagihan (user_id, sewa_id, periode, jumlah, jatuh_tempo)
  select s.user_id, s.id, v_awal, s.harga_sewa, v_awal + (s.hari_tagih - 1)
    from sewa s
   where s.user_id = auth.uid()
     and s.status = 'aktif'
     and s.tanggal_masuk <= (v_awal + interval '1 month - 1 day')::date
  on conflict (sewa_id, periode) do nothing;

  get diagnostics v_n = row_count;
  return v_n;
end $$;
```

Status "terlambat" tidak disimpan di database, melainkan dihitung di aplikasi: tagihan berstatus `belum` dan `jatuh_tempo` sudah lewat dari hari ini.

Tabel opsional untuk pengeluaran (Tahap Opsional):

```sql
create table public.pengeluaran (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tanggal date not null default current_date,
  kategori text not null,
  jumlah numeric(14,2) not null check (jumlah > 0),
  catatan text,
  created_at timestamptz not null default now()
);
alter table public.pengeluaran enable row level security;
create policy "pengeluaran sendiri" on public.pengeluaran
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## 11. Daftar Halaman dan Alur

| Rute | Halaman | Isi |
|---|---|---|
| /login | Login | Form email dan password |
| /daftar | Registrasi | Nama pemilik, nama kos, email, password |
| / | Dashboard | Kartu okupansi, pendapatan, tunggakan; daftar jatuh tempo 7 hari; grafik pendapatan 6 bulan |
| /kamar | Kamar | Kartu kamar berwarna per status, tambah, ubah, hapus |
| /penghuni | Penghuni | Daftar, cari, tambah, ubah, hapus |
| /sewa | Sewa | Sewa aktif, tombol Mulai Sewa, tombol Akhiri Sewa, riwayat |
| /tagihan | Tagihan | Filter periode dan status, tombol Buat Tagihan Bulan Ini, Tandai Lunas, WhatsApp, Kwitansi |
| /laporan | Laporan | Pilih bulan, ringkasan, ekspor PDF/Excel |
| /profil | Profil | Ubah data kos, keluar |

Alur utama:
1. Daftar dan login.
2. Isi data kamar.
3. Tambah penghuni, lalu mulai sewa.
4. Tiap awal bulan: Buat Tagihan Bulan Ini.
5. Penghuni bayar: Tandai Lunas, lalu unduh kwitansi.
6. Penghuni belum bayar: Ingatkan via WhatsApp.
7. Akhir bulan: buka Laporan dan ekspor.

Navigasi: bar bawah di HP (Beranda, Kamar, Tagihan, Lainnya) dan sidebar di desktop. Menu "Lainnya" berisi Penghuni, Sewa, Laporan, Profil.

Format pesan WhatsApp (contoh):
"Halo {nama}, mengingatkan tagihan kos {nama_kos} kamar {nomor} periode {bulan tahun} sebesar {jumlah}, jatuh tempo {tanggal}. Terima kasih."

## 12. Rencana Pengerjaan (4 Minggu)

| Minggu | Fokus | Hasil |
|---|---|---|
| 1 | Setup, database, autentikasi, layout, kamar | Login berjalan, kamar bisa dikelola |
| 2 | Penghuni, sewa, tagihan | Siklus sewa dan tagihan berfungsi |
| 3 | WhatsApp, kwitansi, dashboard, laporan | Fitur utama lengkap |
| 4 | Profil, PWA, perapian, pengujian, deploy | Online dan siap presentasi |

## 13. Kriteria Penerimaan

- Pemilik baru dapat daftar, login, dan menambah kamar.
- Mulai sewa mengubah kamar menjadi terisi; akhiri sewa mengembalikannya ke kosong.
- Mulai sewa pada kamar yang sudah punya sewa aktif ditolak.
- Tombol Buat Tagihan Bulan Ini dua kali berturut-turut tidak membuat tagihan ganda.
- Tagihan lewat jatuh tempo dan belum lunas ditandai "Terlambat".
- Tombol WhatsApp membuka chat dengan nomor penghuni dan pesan yang benar.
- Kwitansi PDF memuat nama kos, penghuni, kamar, periode, jumlah, tanggal bayar.
- Angka dashboard dan laporan sesuai dengan hitungan manual.
- Pemilik A tidak dapat melihat data pemilik B (uji dengan dua akun).
- Aplikasi dapat dipasang ke layar utama HP dan diakses lewat URL publik.

## 14. Rencana Pengujian

- Uji manual tiap fitur per tahap (cek di akhir tiap prompt).
- Uji keamanan dengan dua akun.
- Uji logika: sewa ganda pada satu kamar, tagihan ganda, kamar yang masih punya sewa tidak bisa dihapus, penghuni yang masih punya sewa tidak bisa dihapus.
- Uji tanggal: penghuni masuk di tengah bulan, hari tagih 28, pergantian bulan dan tahun.
- Uji responsif pada 360, 768, 1280 px.

## 15. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Waktu tidak cukup | Kerjakan fitur Wajib dulu, Opsional belakangan |
| Data kamar tidak sinkron dengan sewa | Ubah status hanya lewat fungsi mulai_sewa dan akhiri_sewa |
| RLS salah sehingga data bocor | Uji dua akun di tahap database dan pengujian akhir |
| Kunci Supabase terekspos | Hanya anon key di .env, .env tidak di-commit |
| Data pribadi penghuni | Simpan minimal, tanpa nomor KTP, ekspor Excel sebagai cadangan |
| Salah hitung tagihan di batas bulan | Periode selalu tanggal 1, uji kasus pergantian bulan |

## 16. Struktur Folder

```
kosku/
  supabase/
    schema.sql
  src/
    components/   (Layout, KartuKamar, FormSewa, KartuRingkasan, Modal, Toast)
    pages/        (Login, Daftar, Dashboard, Kamar, Penghuni, Sewa, Tagihan, Laporan, Profil)
    lib/          (supabaseClient.js, format.js, ekspor.js, kwitansi.js, whatsapp.js)
    hooks/        (useAuth.js, useKamar.js, usePenghuni.js, useSewa.js, useTagihan.js)
    App.jsx
    main.jsx
  public/         (ikon PWA)
  .env            (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
```

---

# LAMPIRAN — Prompt OpenCode Siap-Paste

Tempel satu prompt per tahap di OpenCode (VS Code). Selesaikan dan uji satu tahap sebelum lanjut.

## Tahap 1 — Setup Proyek

```text
Buat proyek baru bernama "kosku" memakai React 18 + Vite (JavaScript, bukan TypeScript). Install dependensi: react-router-dom, @supabase/supabase-js, tailwindcss (dengan konfigurasi resmi versi terbaru), recharts, jspdf, jspdf-autotable, xlsx. Buat struktur folder: supabase, src/components, src/pages, src/lib, src/hooks. Buat file .env.example berisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, dan pastikan .env masuk .gitignore. Buat src/lib/supabaseClient.js yang membaca dua variabel itu. Buat src/lib/format.js berisi formatRupiah (contoh: Rp 1.250.000), formatTanggal (bahasa Indonesia, contoh: 5 November 2026), dan formatPeriode (contoh: November 2026). Buat src/lib/whatsapp.js berisi fungsi normalisasiNomor (ubah 08xxx menjadi 628xxx) dan buatLinkWA(nomor, pesan) yang menghasilkan URL https://wa.me/NOMOR?text=PESAN_ter-encode. Inisialisasi git. Jalankan npm run dev dan pastikan halaman kosong tampil tanpa error. Beri tahu apa yang harus saya lakukan manual.
```

Cek: `npm run dev` jalan, Tailwind aktif, fungsi format benar.

## Tahap 2 — Database dan Keamanan di Supabase

```text
Buat file supabase/schema.sql untuk aplikasi manajemen kos dengan isi persis seperti berikut, lalu periksa kembali sintaksnya. Tabel: profiles (id uuid referensi auth.users, nama_pemilik, nama_kos, alamat, no_wa, created_at); kamar (id, user_id, nomor, tipe, harga_bulanan >= 0, fasilitas, status 'kosong'/'terisi'/'perbaikan' default 'kosong', created_at, unik per user_id+nomor); penghuni (id, user_id, nama, no_hp, pekerjaan, kontak_darurat, catatan, created_at); sewa (id, user_id, kamar_id referensi kamar on delete restrict, penghuni_id referensi penghuni on delete restrict, tanggal_masuk, tanggal_keluar, hari_tagih 1-28, harga_sewa, deposit default 0, status 'aktif'/'selesai' default 'aktif', created_at) dengan unique index parsial pada kamar_id where status='aktif'; tagihan (id, user_id, sewa_id referensi sewa on delete cascade, periode date, jumlah, jatuh_tempo date, status 'belum'/'lunas' default 'belum', tanggal_bayar, metode 'tunai'/'transfer'/'lainnya', catatan, created_at, unik per sewa_id+periode). Tambahkan index pada tagihan(user_id, periode desc), tagihan(user_id, status), sewa(user_id, status). Aktifkan Row Level Security di semua tabel dengan policy pengguna hanya bisa mengakses baris miliknya (user_id = auth.uid(); untuk profiles id = auth.uid()). Buat trigger pada auth.users after insert yang membuat baris profiles dari raw_user_meta_data (nama_pemilik, nama_kos), function security definer dengan set search_path = public. Buat tiga function SECURITY INVOKER dengan set search_path = public: mulai_sewa(p_kamar, p_penghuni, p_tanggal_masuk, p_hari_tagih, p_harga, p_deposit) yang insert sewa lalu update status kamar jadi 'terisi' dan mengembalikan id sewa; akhiri_sewa(p_sewa, p_tanggal_keluar) yang set sewa jadi 'selesai' dan kamar jadi 'kosong'; buat_tagihan_bulanan(p_periode date) yang membuat tagihan untuk semua sewa aktif milik auth.uid() pada bulan p_periode (periode = tanggal 1 bulan itu, jumlah = harga_sewa, jatuh_tempo = tanggal 1 + hari_tagih - 1), memakai on conflict (sewa_id, periode) do nothing, dan mengembalikan jumlah baris yang dibuat. Jangan jalankan apa pun ke server; cukup tulis file dan beri tahu cara menempelkannya di SQL Editor Supabase serta daftar uji SQL untuk memastikan RLS dan fungsi bekerja.
```

Cek: SQL jalan tanpa error, tabel dan policy tampil di dashboard Supabase.

## Tahap 3 — Autentikasi

```text
Buat sistem autentikasi memakai Supabase Auth (email + password). Buat hook src/hooks/useAuth.js (user, loading, signIn, signUp, signOut) dengan AuthProvider memakai React Context dan onAuthStateChange. Buat halaman Login (/login) dan Daftar (/daftar; field nama pemilik, nama kos, email, password; kirim nama_pemilik dan nama_kos lewat options.data pada signUp agar dipakai trigger). Buat komponen ProtectedRoute: pengguna yang belum login diarahkan ke /login, dan halaman login harus menjadi halaman pertama yang dilihat. Pengguna yang sudah login dan membuka /login diarahkan ke /. Tampilkan pesan error Bahasa Indonesia (email sudah terdaftar, password salah, password minimal 6 karakter). Desain mobile-first dengan Tailwind, bersih dan rapi. Jelaskan cara menguji alurnya.
```

Cek: daftar, login, refresh tetap login, logout kembali ke /login, baris profiles terbentuk.

## Tahap 4 — Layout dan Navigasi

```text
Buat layout utama: bar navigasi bawah untuk HP (Beranda, Kamar, Tagihan, Lainnya) dan sidebar untuk desktop (md ke atas) berisi Beranda, Kamar, Penghuni, Sewa, Tagihan, Laporan, Profil. Menu "Lainnya" di HP membuka halaman/menu berisi Penghuni, Sewa, Laporan, Profil. Setup React Router dengan rute: /, /kamar, /penghuni, /sewa, /tagihan, /laporan, /profil, semuanya di dalam ProtectedRoute dan layout. Buat halaman placeholder tiap rute. Pastikan SEMUA tombol navigasi bisa diklik dan menandai menu aktif (NavLink). Buat juga komponen bersama: Modal, Toast (sukses/error), ConfirmDialog, dan EmptyState. Tambahkan tombol Keluar di halaman Profil.
```

Cek: semua menu bisa diklik dan tersorot, rapi di 360 px dan 1280 px.

## Tahap 5 — Kamar

```text
Buat halaman /kamar: tampilkan kamar sebagai kartu berwarna per status (hijau kosong, biru terisi, abu-abu perbaikan) berisi nomor, tipe, harga per bulan, fasilitas, dan nama penghuni aktif bila terisi. Tambah dan ubah kamar lewat Modal (nomor wajib dan unik, harga >= 0, status kosong/perbaikan hanya bisa diubah manual bila tidak ada sewa aktif). Hapus dengan konfirmasi; jika kamar masih punya sewa (aktif atau riwayat), tampilkan pesan "Kamar ini masih memiliki data sewa" dan jangan hapus. Tambahkan ringkasan di atas: jumlah total, kosong, terisi, perbaikan. Buat hook src/hooks/useKamar.js dengan loading dan error handling.
```

Cek: tambah, ubah, hapus kamar; hapus kamar yang punya sewa ditolak.

## Tahap 6 — Penghuni

```text
Buat halaman /penghuni: daftar penghuni dengan pencarian nama atau nomor HP, tambah dan ubah lewat Modal (nama wajib, no_hp wajib dan divalidasi format nomor Indonesia, pekerjaan, kontak darurat, catatan), hapus dengan konfirmasi. Penghuni yang masih punya sewa aktif tidak boleh dihapus (tampilkan pesan jelas). Tampilkan badge "Aktif di kamar X" atau "Tidak aktif". Jangan menyimpan nomor KTP. Buat hook src/hooks/usePenghuni.js.
```

Cek: CRUD penghuni berjalan, validasi nomor HP bekerja.

## Tahap 7 — Sewa (Mulai dan Akhiri)

```text
Buat halaman /sewa: tab "Aktif" dan "Riwayat". Tombol "Mulai Sewa" membuka form: pilih kamar (hanya yang berstatus kosong), pilih penghuni (yang belum punya sewa aktif; sediakan tombol tambah penghuni cepat), tanggal masuk, tanggal tagih tiap bulan (1-28), harga sewa (otomatis terisi dari harga kamar tetapi bisa diubah), deposit. Simpan dengan supabase.rpc('mulai_sewa', ...). Pada tab Aktif tampilkan kamar, penghuni, tanggal masuk, harga, tanggal tagih, dan tombol "Akhiri Sewa" yang meminta tanggal keluar lalu memanggil rpc('akhiri_sewa'). Tangani error (misalnya kamar sudah terisi) dengan pesan Bahasa Indonesia. Buat hook src/hooks/useSewa.js. Setelah berhasil, status kamar di halaman /kamar harus ikut berubah.
```

Cek: mulai sewa mengubah kamar jadi terisi; akhiri sewa mengembalikan kosong; sewa ganda ditolak.

## Tahap 8 — Tagihan, WhatsApp, Kwitansi

```text
Buat halaman /tagihan. (1) Pilih periode (bulan dan tahun, default bulan ini) dan filter status (Semua, Belum bayar, Lunas, Terlambat). Terlambat dihitung di aplikasi: status 'belum' dan jatuh_tempo < hari ini. (2) Tombol "Buat Tagihan Bulan Ini" memanggil rpc('buat_tagihan_bulanan', { p_periode }) dan menampilkan toast berapa tagihan baru dibuat; menekannya berulang tidak boleh membuat duplikat. (3) Daftar tagihan: kamar, nama penghuni, jumlah, jatuh tempo, badge status berwarna. (4) Aksi "Tandai Lunas": modal berisi tanggal bayar (default hari ini) dan metode (tunai/transfer/lainnya); update status, tanggal_bayar, metode. Sediakan juga "Batalkan Lunas" dengan konfirmasi. (5) Aksi "Ingatkan via WhatsApp" untuk tagihan belum lunas: membuka link wa.me ke nomor penghuni (pakai fungsi di src/lib/whatsapp.js) dengan pesan: "Halo {nama}, mengingatkan tagihan kos {nama_kos} kamar {nomor} periode {Bulan Tahun} sebesar {Rupiah}, jatuh tempo {tanggal}. Terima kasih." (6) Aksi "Kwitansi" untuk tagihan lunas: buat PDF dengan jsPDF di src/lib/kwitansi.js berisi nama kos, alamat, nomor kwitansi, nama penghuni, kamar, periode, jumlah (angka dan terbilang bila memungkinkan), tanggal bayar, metode, dan kolom tanda tangan pemilik. Buat hook src/hooks/useTagihan.js.
```

Cek: tagihan tidak dobel, status terlambat benar, WhatsApp terbuka dengan pesan benar, kwitansi PDF terunduh.

## Tahap 9 — Dashboard

```text
Buat halaman Dashboard (/). Tampilkan kartu: Okupansi (terisi/total kamar dan persen), Kamar Kosong, Pendapatan Bulan Ini (jumlah tagihan lunas dengan tanggal_bayar bulan ini), Tunggakan (total tagihan 'belum' dengan jatuh_tempo lewat). Tampilkan daftar "Jatuh tempo 7 hari ke depan" dan daftar "Menunggak" (dengan tombol WhatsApp langsung). Tambahkan grafik Recharts bar pendapatan 6 bulan terakhir. Tangani state kosong dan loading. Pastikan angka cocok dengan data di halaman Tagihan.
```

Cek: angka dashboard cocok dengan hitungan manual.

## Tahap 10 — Laporan dan Ekspor

```text
Buat halaman /laporan: pilih bulan dan tahun, tampilkan ringkasan (total tagihan, total lunas, total belum bayar, jumlah kamar terisi), tabel rincian tagihan per kamar dengan status, dan daftar penghuni yang menunggak. Tombol "Unduh PDF" (jsPDF + jspdf-autotable; judul memuat nama kos dan periode; tabel rincian dan total di bawah) dan "Unduh Excel" (xlsx; sheet Ringkasan, sheet Tagihan, sheet Kamar, sheet Penghuni sebagai cadangan data). Logika di src/lib/ekspor.js. Format Rupiah dan tanggal Indonesia. Nama file: laporan-kosku-YYYY-MM.
```

Cek: PDF dan Excel terbuka, total sama dengan layar.

## Tahap 11 — Profil, Perapian UI, PWA

```text
(1) Buat halaman /profil: tampilkan dan ubah nama pemilik, nama kos, alamat, nomor WhatsApp (update tabel profiles), tampilkan email, tombol Keluar. (2) Rapikan UI seluruh aplikasi: konsistensi warna dan status, spacing, tombol minimal 44 px, skeleton loading, toast seragam, semua teks Bahasa Indonesia, periksa tampilan di 360, 768, 1280 px. (3) Jadikan PWA dengan vite-plugin-pwa: manifest (name "KosKu", short_name "KosKu", display standalone, theme_color sesuai warna utama, start_url "/"), ikon 192 dan 512 (buat ikon sederhana), service worker untuk cache aset statis, dan tombol "Pasang Aplikasi" bila beforeinstallprompt tersedia. Jelaskan cara menguji dengan npm run build lalu npm run preview dan tab Application di Chrome DevTools.
```

Cek: profil tersimpan, tampilan rapi, bisa dipasang di HP.

## Tahap 12 — Pengujian, Keamanan, Deploy

```text
(1) Tinjau seluruh aplikasi: jalankan alur lengkap (daftar, tambah kamar, tambah penghuni, mulai sewa, buat tagihan, tandai lunas, kwitansi, WhatsApp, laporan, akhiri sewa) dan perbaiki bug. Uji kasus tepi: sewa ganda pada satu kamar, tagihan dobel, penghuni masuk tengah bulan, hari tagih 28, pergantian bulan/tahun. (2) Pastikan tidak ada error atau warning di console, tidak ada rahasia ter-commit (.env di .gitignore, hanya anon key), dan semua query hanya mengakses data milik pengguna login. (3) Buat TESTING.md berisi daftar periksa uji manual termasuk uji dua akun berbeda. (4) Siapkan deploy Vercel: pastikan npm run build sukses, tambahkan vercel.json dengan rewrite semua rute ke /index.html. Jelaskan langkah: push ke GitHub, import repo di Vercel, isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu di Supabase tambahkan URL Vercel pada Authentication > URL Configuration (Site URL dan Redirect URLs). (5) Buat README.md: deskripsi, fitur, teknologi, cara menjalankan lokal, variabel lingkungan, struktur folder, tautan demo.
```

Cek: lulus uji dua akun, console bersih, URL publik berfungsi, refresh di halaman dalam tidak 404.

## Tahap Opsional (jika waktu sisa)

```text
Tambahkan fitur pengeluaran kos: buat tabel pengeluaran (id, user_id, tanggal, kategori, jumlah > 0, catatan) dengan RLS milik sendiri, halaman /pengeluaran untuk tambah, ubah, hapus dan filter bulan, lalu tampilkan laba bersih (pendapatan lunas - pengeluaran) di Dashboard dan Laporan. Tambahkan juga mode gelap dengan toggle di halaman Profil yang tersimpan di localStorage.
```

---

## Catatan Jika Dipakai di Kos Asli

- Mulailah dengan memasukkan data kamar dan penghuni nyata setelah deploy.
- Beritahu penghuni bahwa nama dan nomor HP mereka disimpan untuk keperluan tagihan.
- Unduh ekspor Excel tiap akhir bulan sebagai cadangan.
- Gunakan password yang kuat untuk akun pemilik.

## Checklist Pengumpulan ke Mentor

- [ ] PRD (dokumen ini)
- [ ] URL aplikasi online
- [ ] Repositori GitHub beserta README
- [ ] Skema database (supabase/schema.sql)
- [ ] Demo alur: daftar, tambah kamar dan penghuni, mulai sewa, buat tagihan, lunas, kwitansi, WhatsApp, laporan