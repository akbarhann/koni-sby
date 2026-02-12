# 📋 TECHNICAL SPEC: Sistem Skor Atlet (Versi Indonesia)

## 1. Tujuan
Mengimplementasikan skema database untuk manajemen Atlet dan Prestasi menggunakan penamaan **Bahasa Indonesia (snake_case)** agar konsisten dengan tabel `ClubProfile` yang sudah ada. Aturan poin disimpan di database (dinamis), bukan hardcode.

## 2. Skema Database (Prisma)

### A. Enums (Nilai Tetap)
Gunakan Bahasa Inggris untuk Value Enum agar standar di kodingan TypeScript, tapi kolomnya Bahasa Indonesia.
* **Gender**: `MALE`, `FEMALE`
* **TingkatPrestasi**: `INTERNATIONAL`, `NATIONAL`, `PROVINCIAL`, `CITY`, `DISTRICT`
* **TipeMedali**: `GOLD`, `SILVER`, `BRONZE`, `PARTICIPANT`
* **StatusVerifikasi**: `PENDING`, `VERIFIED`, `REJECTED`

### B. Model: `AturanPoin` (Dulu: ScoringRule)
Tabel referensi untuk menentukan nilai poin medali.
* `id`: Int (Auto-increment).
* `tingkat`: TingkatPrestasi (Enum).
* `medali`: TipeMedali (Enum).
* `poin`: Int (Contoh: 100).
* **Constraints**: `@@unique([tingkat, medali])` (Mencegah duplikasi aturan).

### C. Model: `Atlet` (Dulu: Athlete)
* `id`: String (CUID) -> Primary Key.
* `club_id`: BigInt -> Relasi ke `ClubProfile` (Perhatikan tipe BigInt).
* `nik`: String -> Unique (Kunci Identitas).
* `nama`: String
* `tempat_lahir`: String
* `tgl_lahir`: DateTime
* `jenis_kelamin`: Gender
* `tinggi_badan`: Int? (cm)
* `berat_badan`: Int? (kg)
* `ukuran_baju`: String?
* `ukuran_sepatu`: Int?
* `no_hp`: String?
* `url_foto`: String?
* `total_poin`: Int (Default 0) -> Cache total poin yang sah.
* `created_at`, `updated_at`

### D. Model: `Prestasi` (Dulu: Achievement)
* `id`: String (CUID)
* `atlet_id`: String -> Relasi ke `Atlet`.
* `nama_kejuaraan`: String
* `tahun`: Int
* `tingkat`: TingkatPrestasi
* `medali`: TipeMedali
* `url_bukti`: String? (URL Gambar Sertifikat).
* `status_verifikasi`: StatusVerifikasi (Default: `PENDING`).
* `nilai_poin`: Int (Default: 0) -> Snapshot nilai poin saat diverifikasi.
* `created_at`.

## 3. Strategi Seeding (Data Awal)
Script `prisma/seed.ts` harus mengisi tabel `AturanPoin` dengan matriks berikut menggunakan `upsert`:

| Tingkat | Gold | Silver | Bronze | Participant |
| :--- | :--- | :--- | :--- | :--- |
| **INTERNATIONAL** | 500 | 300 | 150 | 50 |
| **NATIONAL** | 200 | 125 | 75 | 25 |
| **PROVINCIAL** | 100 | 60 | 30 | 10 |
| **CITY** | 50 | 25 | 10 | 5 |
| **DISTRICT** | 10 | 5 | 2 | 1 |