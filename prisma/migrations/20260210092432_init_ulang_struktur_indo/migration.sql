-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_KONI', 'ADMIN_CABOR', 'ADMIN_CLUB');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChampionshipLevel" AS ENUM ('KOTA', 'PROVINSI', 'NASIONAL', 'INTERNASIONAL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "TingkatPrestasi" AS ENUM ('INTERNATIONAL', 'NATIONAL', 'PROVINCIAL', 'CITY', 'DISTRICT');

-- CreateEnum
CREATE TYPE "TipeMedali" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "StatusVerifikasi" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KoniInvitation" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "deskripsi" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KoniInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterCabor" (
    "id" BIGSERIAL NOT NULL,
    "nama_cabor" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MasterCabor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaborProfile" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "master_cabor_id" BIGINT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "club_registration_token" TEXT,
    "club_token_expires_at" TIMESTAMP(3),
    "description" TEXT,
    "alamat_sekretariat" TEXT,
    "email_resmi" TEXT,
    "nomor_telepon" TEXT,
    "sk_file_url" TEXT,
    "sk_file_name" TEXT,
    "sk_start_date" TIMESTAMP(3),
    "sk_end_date" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "website_url" TEXT,
    "youtube_url" TEXT,
    "org_structure" TEXT,
    "facilities" TEXT,
    "training_schedule" TEXT,
    "training_location" TEXT,
    "development_program" TEXT,
    "achievements" TEXT,
    "total_referees" INTEGER NOT NULL DEFAULT 0,
    "total_coaches" INTEGER NOT NULL DEFAULT 0,
    "total_athletes_manual" INTEGER NOT NULL DEFAULT 0,
    "ad_art_file_url" TEXT,
    "ad_art_file_name" TEXT,

    CONSTRAINT "CaborProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubProfile" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "cabor_profile_id" BIGINT NOT NULL,
    "nama_club" TEXT NOT NULL,
    "alamat_basecamp" TEXT,
    "jadwal_latihan" TEXT,
    "lokasi_latihan" TEXT,
    "legalitas_file_url" TEXT,
    "logo_url" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "nama_ketua" TEXT,
    "nama_sekretaris" TEXT,
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlet" (
    "id" TEXT NOT NULL,
    "club_id" BIGINT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempat_lahir" TEXT NOT NULL,
    "tgl_lahir" TIMESTAMP(3) NOT NULL,
    "jenis_kelamin" "Gender" NOT NULL,
    "tinggi_badan" INTEGER,
    "berat_badan" INTEGER,
    "ukuran_baju" TEXT,
    "ukuran_sepatu" INTEGER,
    "no_hp" TEXT,
    "url_foto" TEXT,
    "total_poin" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestasi" (
    "id" TEXT NOT NULL,
    "atlet_id" TEXT NOT NULL,
    "nama_kejuaraan" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "tingkat" "TingkatPrestasi" NOT NULL,
    "medali" "TipeMedali" NOT NULL,
    "url_bukti" TEXT,
    "status_verifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'PENDING',
    "nilai_poin" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AturanPoin" (
    "id" SERIAL NOT NULL,
    "tingkat" "TingkatPrestasi" NOT NULL,
    "medali" "TipeMedali" NOT NULL,
    "poin" INTEGER NOT NULL,

    CONSTRAINT "AturanPoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KoniInvitation_token_key" ON "KoniInvitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCabor_nama_cabor_key" ON "MasterCabor"("nama_cabor");

-- CreateIndex
CREATE UNIQUE INDEX "CaborProfile_user_id_key" ON "CaborProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CaborProfile_club_registration_token_key" ON "CaborProfile"("club_registration_token");

-- CreateIndex
CREATE UNIQUE INDEX "ClubProfile_user_id_key" ON "ClubProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "atlet_nik_key" ON "atlet"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "AturanPoin_tingkat_medali_key" ON "AturanPoin"("tingkat", "medali");

-- AddForeignKey
ALTER TABLE "KoniInvitation" ADD CONSTRAINT "KoniInvitation_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaborProfile" ADD CONSTRAINT "CaborProfile_master_cabor_id_fkey" FOREIGN KEY ("master_cabor_id") REFERENCES "MasterCabor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaborProfile" ADD CONSTRAINT "CaborProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubProfile" ADD CONSTRAINT "ClubProfile_cabor_profile_id_fkey" FOREIGN KEY ("cabor_profile_id") REFERENCES "CaborProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubProfile" ADD CONSTRAINT "ClubProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlet" ADD CONSTRAINT "atlet_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "ClubProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestasi" ADD CONSTRAINT "Prestasi_atlet_id_fkey" FOREIGN KEY ("atlet_id") REFERENCES "atlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
