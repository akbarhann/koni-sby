# UI Design System & Theming
**Identity:** KONI Surabaya Official Theme
**Framework:** Tailwind CSS
**Strategy:** Strict Consistency

## 1. Color Palette (Official)
Gunakan kode Hex berikut secara konsisten. Dilarang menggunakan variasi warna lain (misal: merah muda atau kuning lemon) di luar palet ini untuk menjaga identitas visual.

| Role | Nama Warna | Hex Code | Penggunaan Wajib |
| :--- | :--- | :--- | :--- |
| **Primary** | Merah Tua | `#B8161C` | Header Navigasi, Tombol Utama (CTA), Footer, Link Hover. |
| **Secondary** | Kuning Emas | `#FFC72C` | Icon, Garis Aksen (Border), Badge Prestasi, Highlight Text. |
| **Neutral Dark** | Hitam Arang | `#212121` | Teks Judul (H1-H6), Teks Paragraf Utama, Border Input Aktif. |
| **Neutral Light** | Abu-abu Muda | `#F4F4F4` | Latar Belakang Bagian (Section Background), Card Background (Alternatif). |
| **Base** | Putih Bersih | `#FFFFFF` | Latar Belakang Utama Halaman, Card Container, Teks pada tombol Merah. |

## 2. Usage Rules (Aturan Pakai)

### A. Contrast & Accessibility
* **Teks pada Background Merah:** WAJIB menggunakan warna **Putih** (`#FFFFFF`).
* **Teks pada Background Kuning:** WAJIB menggunakan warna **Hitam Arang** (`#212121`). Jangan gunakan putih karena kontras rendah.
* **Teks Utama:** Hindari warna `#000000` (Hitam pekat). Gunakan `#212121` agar lebih nyaman di mata.

### B. Button Hierarchy
1.  **Primary Button (Aksi Utama):**
    * Background: `#B8161C`
    * Text: `#FFFFFF`
    * Hover: Opacity 90%
    * *Contoh:* "Simpan", "Daftar", "Upload".
2.  **Secondary Button (Aksi Alternatif):**
    * Background: Transparent
    * Border: `#B8161C`
    * Text: `#B8161C`
    * *Contoh:* "Kembali", "Lihat Detail".
3.  **Accent Button (Jarang Dipakai):**
    * Background: `#FFC72C`
    * Text: `#212121`
    * *Contoh:* "Download Template", "Cetak Sertifikat".

## 3. Tailwind Configuration (`tailwind.config.ts`)
Copy konfigurasi berikut ke dalam file `tailwind.config.ts` di dalam objek `theme.extend.colors`. Ini memungkinkan pemanggilan class seperti `bg-koni-red` atau `text-koni-dark`.

```typescript
// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  // ... konfigurasi lainnya ...
  theme: {
    extend: {
      colors: {
        koni: {
          red: "#B8161C",    // Primary
          gold: "#FFC72C",   // Secondary
          dark: "#212121",   // Neutral Dark (Text)
          light: "#F4F4F4",  // Neutral Light (Background)
          white: "#FFFFFF",  // Base White
        },
        // Semantic Colors (Status System)
        status: {
          success: "#16A34A", // Green-600 (Verified)
          error: "#DC2626",   // Red-600 (Rejected)
          warning: "#D97706", // Amber-600 (Pending)
          info: "#2563EB",    // Blue-600 (Draft)
        }
      },
    },
  },
  // ... plugins lainnya ...
};
export default config;