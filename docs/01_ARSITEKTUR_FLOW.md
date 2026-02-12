# System Architecture and Workflow Specification
**Project Name:** KONI Surabaya Athlete Recommendation System
**Architecture Model:** Cascading Trust with Hierarchical Verification

## 1. User Roles and Hierarchy
Sistem menggunakan Single Table Inheritance untuk manajemen user dengan pembagian peran yang ketat.

1.  **Super Admin (KONI)**
    * **Authority:** Tertinggi.
    * **Responsibility:** Mengelola Master Data Cabor, Mengundang Admin Cabor, dan Melihat Hasil Rekomendasi Akhir.
    * **Access:** Full Access ke seluruh data sistem.

2.  **Admin Cabor (Pengurus Kota)**
    * **Authority:** Menengah (Level 2).
    * **Responsibility:** Mendaftarkan Club di bawah naungannya, Memverifikasi Legalitas Club, dan Memverifikasi Klaim Prestasi Atlet.
    * **Access:** Terbatas hanya pada Club dan Atlet di bawah Cabor tersebut.

3.  **Admin Club (Official Club)**
    * **Authority:** Terendah (Level 3 - Inputter).
    * **Responsibility:** Mengelola Profil Club dan Menginput Data Atlet beserta Bukti Fisik.
    * **Access:** Terbatas hanya pada Atlet di Club tersebut.

4.  **System Engine (Automated Logic)**
    * **Role:** Melakukan validasi format data, parsing NIK, dan kalkulasi skor otomatis.

## 2. Registration Workflow (Cascading Invitation)

### Phase 1: KONI to Cabor (Offline Initiation)
1.  Admin KONI membuat **Token Undangan Cabor** melalui Dashboard KONI.
2.  Token ini memiliki masa berlaku **24 Jam**.
3.  Admin KONI memberikan token tersebut secara manual saat pertemuan tatap muka.
4.  Ketua Cabor mengakses halaman Registrasi Cabor.
5.  Ketua Cabor memasukkan Token.
6.  Sistem memvalidasi Token. Jika valid, akun Cabor dibuat.
7.  Ketua Cabor wajib melengkapi **Profil Cabor**, upload **SK Cabor** (PDF), dan **Struktur Organisasi** (PDF) agar akun aktif sepenuhnya.

### Phase 2: Cabor to Club (Online Propagation)
1.  Admin Cabor yang aktif membuat **Token Pendaftaran Club** melalui Dashboard Cabor.
2.  Token ini memiliki masa berlaku **7 Hari**.
3.  Admin Cabor menyebarkan token ini melalui grup komunikasi resmi.
4.  Admin Club mengakses halaman Registrasi Club.
5.  Admin Club memasukkan Token.
6.  Sistem membaca Token dan secara otomatis mengaitkan Club tersebut ke Cabor pembuat token.
7.  Admin Club wajib melengkapi **Profil Club** dan upload **SK Club** (PDF) agar dapat menginput atlet.

## 3. Data Ingestion Workflow (Strict Validation)

1.  **Input:** Admin Club mengunduh Template Excel dari sistem, mengisi data, dan mengunggah kembali.
2.  **Validation Layer 1 (System):**
    * Memastikan format file adalah `.xlsx`.
    * Memastikan kolom wajib terisi.
    * Mendeteksi Kode Wilayah dari NIK.
3.  **Validation Layer 2 (System):**
    * Admin Club wajib mengunggah foto bukti fisik untuk setiap atlet (KTP dan Foto Diri dalam format JPG).
    * Admin Club wajib mengunggah scan sertifikat (PDF) untuk setiap klaim prestasi.
4.  **Verification Layer (Cabor):**
    * Admin Cabor menerima notifikasi data masuk.
    * Admin Cabor memeriksa kesesuaian data input dengan dokumen asli.
    * Admin Cabor memberikan status **VERIFIED** atau **REJECTED**.

## 4. Recommendation Output
1.  Sistem hanya menghitung skor untuk atlet dengan status **VERIFIED**.
2.  Sistem memfilter atlet yang memiliki NIK Surabaya.
3.  Sistem mengurutkan atlet berdasarkan total skor tertinggi di setiap Cabor.