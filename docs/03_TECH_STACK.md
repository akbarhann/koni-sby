# Technology Stack Specification
Gunakan teknologi berikut tanpa deviasi.

## Core Framework
* **Framework:** Next.js 15 App Router
* **Language:** TypeScript (Strict Mode Enabled)
* **Environment:** Node.js Runtime

## Backend and Database
* **API Architecture:** Next.js Server Actions dan Route Handlers
* **Database Service:** Vercel Postgres (Managed Neon)
* **ORM:** Prisma
* **Schema Validation:** Zod
* **Authentication:** NextAuth.js (Auth.js) v5

## Frontend and User Interface
* **CSS Framework:** Tailwind CSS
* **Component Library:** Shadcn/UI
* **Icon Set:** Lucide React
* **Form Management:** React Hook Form dengan Zod Resolver

## File Processing and Storage
* **Excel Parsing Library:** `exceljs`
    * *Constraint:* Parsing harus dilakukan menggunakan stream buffer untuk efisiensi memori.
* **Object Storage:** Vercel Blob
    * *Usage:* Menyimpan file PDF SK, JPG Foto, dan PDF Sertifikat.

## Deployment Environment
* **Platform:** Vercel
* **Build Command:** `prisma generate && next build`
* **Environment Variables:** Wajib dikonfigurasi di Vercel Dashboard Project Settings.