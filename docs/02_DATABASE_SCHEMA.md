# Database Schema Specification
**Database Engine:** PostgreSQL
**ORM:** Prisma
**Strategy:** Strict Typing and Relational Integrity

## Prisma Schema Definition
Gunakan skema berikut secara presisi untuk file `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// --- ENUMS ---
enum Role {
  ADMIN_KONI
  ADMIN_CABOR
  ADMIN_CLUB
}

enum VerificationStatus {
  DRAFT
  SUBMITTED
  VERIFIED
  REJECTED
}

enum ChampionshipLevel {
  KOTA
  PROVINSI
  NASIONAL
  INTERNASIONAL
}

enum Gender {
  L
  P
}

// --- MODELS ---

// 1. User Authentication & Authorization
model User {
  id            BigInt    @id @default(autoincrement())
  username      String    @unique
  email         String    @unique
  password_hash String
  role          Role
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())

  // Relations
  cabor_profile CaborProfile?
  club_profile  ClubProfile?
  verified_achievements Achievement[]
  created_invitations   KoniInvitation[]
}

// 2. Invitation Management (KONI to Cabor)
model KoniInvitation {
  id          Int      @id @default(autoincrement())
  token       String   @unique
  deskripsi   String? 
  expires_at  DateTime
  is_active   Boolean  @default(true)
  created_by  BigInt
  created_at  DateTime @default(now())

  creator     User     @relation(fields: [created_by], references: [id])
}

// 3. Master Data for Cabor Names
model MasterCabor {
  id            BigInt    @id @default(autoincrement())
  nama_cabor    String    @unique
  is_verified   Boolean   @default(false)
  
  cabor_profiles CaborProfile[]
}

// 4. Cabor Organization Profile
model CaborProfile {
  id              BigInt    @id @default(autoincrement())
  user_id         BigInt    @unique
  master_cabor_id BigInt
  
  // Documents (Stored as URL Strings)
  sk_file_url          String?
  struktur_org_url     String?
  verification_status  VerificationStatus @default(PENDING)
  
  // Token Management for Clubs
  club_registration_token String?   @unique
  club_token_expires_at   DateTime?
  
  // Relations
  user         User        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  master_cabor MasterCabor @relation(fields: [master_cabor_id], references: [id])
  clubs        ClubProfile[]
}

// 5. Club Organization Profile
model ClubProfile {
  id              BigInt    @id @default(autoincrement())
  user_id         BigInt    @unique
  cabor_profile_id BigInt
  
  nama_club       String
  alamat_basecamp String?   @db.Text
  jadwal_latihan  String?   @db.Text
  lokasi_latihan  String?
  
  // Documents (Stored as URL Strings)
  legalitas_file_url String?
  logo_url           String?
  verification_status VerificationStatus @default(PENDING)

  // Relations
  user          User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  parent_cabor  CaborProfile @relation(fields: [cabor_profile_id], references: [id])
  athletes      Athlete[]
}

// 6. Athlete Data Entity
model Athlete {
  id          BigInt    @id @default(autoincrement())
  club_id     BigInt
  
  // Identity Data
  nik           String   @unique @db.VarChar(16)
  nama_lengkap  String
  tempat_lahir  String?
  tgl_lahir     DateTime
  jenis_kelamin Gender
  alamat        String?  @db.Text
  
  // Photo Evidence
  foto_profil_url String?
  foto_ktp_url    String?

  // System Calculation Flags
  is_surabaya   Boolean  @default(false)
  total_score   Decimal  @default(0)
  
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relations
  club          ClubProfile   @relation(fields: [club_id], references: [id])
  achievements  Achievement[]
}

// 7. Achievement and Scoring Data
model Achievement {
  id          BigInt    @id @default(autoincrement())
  athlete_id  BigInt
  
  nama_kejuaraan String
  tingkat        ChampionshipLevel
  peringkat      Int     
  tahun          Int     
  sertifikat_url String 

  verification_status VerificationStatus @default(DRAFT)
  rejection_reason    String?            @db.Text
  verified_by         BigInt?            
  
  // Snapshot of score value at the time of verification
  score_value         Decimal @default(0) 

  created_at DateTime @default(now())

  // Relations
  athlete       Athlete @relation(fields: [athlete_id], references: [id])
  verifier      User?   @relation(fields: [verified_by], references: [id])
}

// 8. Dynamic Scoring Configuration
model ScoringRule {
  id        Int               @id @default(autoincrement())
  tingkat   ChampionshipLevel
  peringkat Int               
  points    Decimal           
  active    Boolean @default(true)

  @@unique([tingkat, peringkat])
}