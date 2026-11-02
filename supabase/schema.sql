-- ============================================================
-- Schema Aplikasi Manajemen Kos
-- Supabase SQL Editor: tempel seluruh isi ini lalu Run
-- ============================================================

-- --------------------------------------------------
-- 1. Tabel profiles
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  nama_pemilik text,
  nama_kos text,
  alamat text,
  no_wa text,
  created_at timestamp with time zone DEFAULT now()
);

-- --------------------------------------------------
-- 2. Tabel kamar
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS kamar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nomor text NOT NULL,
  tipe text,
  harga_bulanan integer CHECK (harga_bulanan >= 0),
  fasilitas text,
  status text DEFAULT 'kosong' CHECK (status IN ('kosong','terisi','perbaikan')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, nomor)
);

-- --------------------------------------------------
-- 3. Tabel penghuni
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS penghuni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  no_hp text,
  pekerjaan text,
  kontak_darurat text,
  catatan text,
  created_at timestamp with time zone DEFAULT now()
);

-- --------------------------------------------------
-- 4. Tabel sewa
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS sewa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kamar_id uuid NOT NULL REFERENCES kamar(id) ON DELETE RESTRICT,
  penghuni_id uuid NOT NULL REFERENCES penghuni(id) ON DELETE RESTRICT,
  tanggal_masuk date NOT NULL,
  tanggal_keluar date,
  hari_tagih integer CHECK (hari_tagih BETWEEN 1 AND 28),
  harga_sewa integer NOT NULL,
  deposit integer DEFAULT 0,
  status text DEFAULT 'aktif' CHECK (status IN ('aktif','selesai')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX idx_sewa_kamar_aktif ON sewa(kamar_id) WHERE status = 'aktif';

-- --------------------------------------------------
-- 5. Tabel tagihan
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS tagihan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sewa_id uuid NOT NULL REFERENCES sewa(id) ON DELETE CASCADE,
  periode date NOT NULL,
  jumlah integer NOT NULL,
  jatuh_tempo date NOT NULL,
  status text DEFAULT 'belum' CHECK (status IN ('belum','lunas')),
  tanggal_bayar date,
  metode text CHECK (metode IN ('tunai','transfer','lainnya')),
  catatan text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (sewa_id, periode)
);

-- --------------------------------------------------
-- 6. Index tambahan
-- --------------------------------------------------
CREATE INDEX idx_tagihan_user_periode ON tagihan(user_id, periode DESC);
CREATE INDEX idx_tagihan_user_status ON tagihan(user_id, status);
CREATE INDEX idx_sewa_user_status ON sewa(user_id, status);

-- --------------------------------------------------
-- 7. Row Level Security (RLS) + Policy
-- --------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE penghuni ENABLE ROW LEVEL SECURITY;
ALTER TABLE sewa ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan ENABLE ROW LEVEL SECURITY;

-- profiles: hanya baris miliknya (id = auth.uid())
CREATE POLICY profiles_own ON profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- tabel lain: berdasarkan user_id
CREATE POLICY kamar_own ON kamar FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY penghuni_own ON penghuni FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY sewa_own ON sewa FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY tagihan_own ON tagihan FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------
-- 8. Trigger auth.users -> profiles (SECURITY DEFINER)
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  INSERT INTO public.profiles (id, nama_pemilik, nama_kos, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'nama_pemilik', new.raw_user_meta_data->>'nama_kos', now());
  RETURN new;
END
$func$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------
-- 9. Function keamanan: mulai_sewa (SECURITY INVOKER)
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION public.mulai_sewa(
  p_kamar uuid,
  p_penghuni uuid,
  p_tanggal_masuk date,
  p_hari_tagih int,
  p_harga int,
  p_deposit int DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $func$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.sewa (
    user_id, kamar_id, penghuni_id, tanggal_masuk, hari_tagih,
    harga_sewa, deposit, status
  ) VALUES (
    auth.uid(), p_kamar, p_penghuni, p_tanggal_masuk, p_hari_tagih,
    p_harga, p_deposit, 'aktif'
  ) RETURNING id INTO v_id;

  UPDATE public.kamar SET status = 'terisi' WHERE id = p_kamar;
  RETURN v_id;
END
$func$;

-- --------------------------------------------------
-- 10. Function keamanan: akhiri_sewa (SECURITY INVOKER)
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION public.akhiri_sewa(
  p_sewa uuid,
  p_tanggal_keluar date
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $func$
BEGIN
  UPDATE public.sewa
  SET status = 'selesai', tanggal_keluar = p_tanggal_keluar
  WHERE id = p_sewa AND user_id = auth.uid();

  UPDATE public.kamar
  SET status = 'kosong'
  WHERE id = (SELECT kamar_id FROM public.sewa WHERE id = p_sewa AND user_id = auth.uid());
END
$func$;

-- --------------------------------------------------
-- 11. Function keamanan: buat_tagihan_bulanan (SECURITY INVOKER)
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION public.buat_tagihan_bulanan(p_periode date)
RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $func$
DECLARE
  v_count int;
BEGIN
  INSERT INTO public.tagihan (
    user_id, sewa_id, periode, jumlah, jatuh_tempo, status
  )
  SELECT
    auth.uid(),
    s.id,
    date_trunc('month', p_periode)::date,
    s.harga_sewa,
    (date_trunc('month', p_periode)::date + (s.hari_tagih - 1)),
    'belum'
  FROM public.sewa s
  WHERE s.user_id = auth.uid()
    AND s.status = 'aktif'
  ON CONFLICT (sewa_id, periode) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END
$func$;
