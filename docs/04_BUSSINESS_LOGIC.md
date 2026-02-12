# Business Logic and Rules
Implementasikan logika berikut di sisi server (Backend).

## 1. Token Generation Logic
Format token harus menggabungkan keterbacaan dan keacakan.

* **Logic:** `UPPERCASE(PREFIX) + "-" + RANDOM_ALPHANUMERIC(4)`
* **Example:** Nama Cabor "Sepak Bola" menjadi `SEPA-X9J2`.
* **Constraint:** Karakter random tidak boleh mengandung huruf 'O' dan 'I' untuk menghindari kebingungan dengan angka '0' dan '1'.

## 2. Token Expiration Rules
* **Token Undangan KONI:** Kadaluarsa dalam **24 Jam** setelah pembuatan.
* **Token Pendaftaran Club:** Kadaluarsa dalam **7 Hari** setelah pembuatan.
* **Expired Handling:** Token yang kadaluarsa harus ditolak saat pendaftaran. Admin harus memiliki opsi untuk melakukan Regenerate Token baru.

## 3. NIK Validation Rule (Surabaya Filter)
* **Input:** String NIK 16 digit.
* **Logic:** Ambil 4 karakter pertama.
* **Condition:**
    * JIKA 4 karakter awal adalah "3578" MAKA `is_surabaya` = `TRUE`.
    * JIKA TIDAK MAKA `is_surabaya` = `FALSE`.
* **Impact:** Atlet dengan `is_surabaya = FALSE` tetap disimpan namun dikecualikan dari daftar rekomendasi utama.

## 4. Achievement Validation Rules
* **Peringkat:** Sistem hanya menerima input angka integer **1**, **2**, dan **3**. Angka lain harus ditolak oleh validator Zod.
* **Tahun:** Sistem hanya menampilkan dan menghitung prestasi dalam rentang **2 Tahun Terakhir** dari tanggal saat ini.
* **Evidence:** Upload file sertifikat bersifat **MANDATORY** (Wajib).

## 5. Dynamic Scoring Calculation
Skor dihitung secara otomatis saat Admin Cabor mengubah status prestasi menjadi VERIFIED.

* **Trigger:** Event `update` pada tabel `Achievement` dimana `verification_status` menjadi `VERIFIED`.
* **Process:**
    1.  Ambil nilai `tingkat` dan `peringkat` dari data prestasi.
    2.  Lakukan Query ke tabel `ScoringRule` yang cocok dengan kriteria tersebut.
    3.  Ambil nilai `points`.
    4.  Simpan nilai tersebut ke kolom `Achievement.score_value`.
    5.  Lakukan kalkulasi ulang `Athlete.total_score` dengan menjumlahkan semua prestasi valid milik atlet tersebut.