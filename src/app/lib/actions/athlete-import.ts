'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

// Define the expected strict headers
const EXPECTED_HEADERS = [
    'NIK',
    'NAMA LENGKAP',
    'TEMPAT LAHIR',
    'TANGGAL LAHIR',
    'JENIS KELAMIN',
    'TINGGI BADAN (CM)',
    'BERAT BADAN (KG)',
    'UKURAN BAJU',
    'UKURAN SEPATU',
    'NO WA'
];

export async function importAthletes(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized', count: 0, failed: 0 };
        }

        // 1. Get ClubProfile
        const clubProfile = await prisma.clubProfile.findUnique({
            where: {
                user_id: BigInt(session.user.id),
            },
        });

        if (!clubProfile) {
            return { success: false, message: 'Club profile not found', count: 0, failed: 0 };
        }

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, message: 'No file uploaded', count: 0, failed: 0 };
        }

        // 2. Parse Excel
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 2a. Strict Header Validation (Read first row only)
        // Note: limit is not a valid option in some types types, so we remove it. 
        // We use header: 1 which returns array of arrays.
        const headerRows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0 });
        const headerRow = headerRows?.[0] as string[];

        if (!headerRow || headerRow.length === 0) {
            return { success: false, message: 'File kosong/Format salah', count: 0, failed: 0 };
        }

        const missingHeaders = EXPECTED_HEADERS.filter(h => !headerRow.includes(h));
        if (missingHeaders.length > 0) {
            return {
                success: false,
                message: `Format Header Salah. Missing: ${missingHeaders.join(', ')}`,
                count: 0,
                failed: 0
            };
        }

        // 2b. Read Data as Objects with defval: "" (Critical for Ghost Rows)
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const validRows: any[] = [];
        let failedCount = 0;

        for (const row of jsonData) {
            // 1. Sanitize raw inputs
            // Note: Since we validated headers, we can safely access row['NIK']. 
            // If safely accessed, defval: "" ensures we get "" if empty.
            // But strict typing might need 'as any'.

            const r = row as any;
            const rawNik = r['NIK'] ? String(r['NIK']).trim() : '';
            const rawNama = r['NAMA LENGKAP'] ? String(r['NAMA LENGKAP']).trim() : '';

            // 2. SILENT SKIP: If both NIK and NAMA are empty, this is a ghost row.
            if (rawNik === '' && rawNama === '') {
                continue; // Skip directly. Do NOT increment failedCount.
            }

            // 3. Real Validation (Only runs if row is NOT empty)
            if (rawNik === '' || rawNama === '') {
                failedCount++; // Real error: Row has partial data but missing required NIK/Name
                continue;
            }

            const nik = rawNik;
            const nama = rawNama;

            const tempatLahir = r['TEMPAT LAHIR'] ? String(r['TEMPAT LAHIR']).trim() : '';
            const tglLahirRaw = r['TANGGAL LAHIR'];
            const jenisKelaminRaw = r['JENIS KELAMIN'];
            const tinggiBadanRaw = r['TINGGI BADAN (CM)'];
            const beratBadanRaw = r['BERAT BADAN (KG)'];
            const ukuranBaju = r['UKURAN BAJU'];
            const ukuranSepatuRaw = r['UKURAN SEPATU'];
            const noWa = r['NO WA'];

            // --- VALIDATION RULES ---

            // Jenis Kelamin Strict (L/P)
            let jenisKelamin: 'MALE' | 'FEMALE';
            const jkUpper = String(jenisKelaminRaw).trim().toUpperCase();
            if (jkUpper === 'L') {
                jenisKelamin = 'MALE';
            } else if (jkUpper === 'P') {
                jenisKelamin = 'FEMALE';
            } else {
                failedCount++;
                continue; // Skip invalid gender
            }

            // Tanggal Lahir Parsing
            let tglLahir: Date;
            try {
                if (typeof tglLahirRaw === 'number') {
                    const dateInfo = XLSX.SSF.parse_date_code(tglLahirRaw);
                    tglLahir = new Date(dateInfo.y, dateInfo.m - 1, dateInfo.d);
                } else if (typeof tglLahirRaw === 'string' && tglLahirRaw !== '') {
                    // Expect DD/MM/YYYY
                    const parts = tglLahirRaw.trim().split('/');
                    if (parts.length === 3) {
                        const day = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10) - 1;
                        const year = parseInt(parts[2], 10);
                        tglLahir = new Date(year, month, day);
                    } else {
                        // Maybe it's a date string ISO? Try constructor
                        const d = new Date(tglLahirRaw);
                        if (!isNaN(d.getTime())) {
                            tglLahir = d;
                        } else {
                            throw new Error('Invalid date string format');
                        }
                    }
                } else if (tglLahirRaw instanceof Date) {
                    tglLahir = tglLahirRaw;
                } else {
                    throw new Error('Unknown date format');
                }

                if (isNaN(tglLahir.getTime())) throw new Error('Invalid Date object');

            } catch (err) {
                failedCount++;
                continue; // Skip invalid date
            }

            // Numeric parsing
            const parseOptionalInt = (val: any) => {
                if (val === undefined || val === null || val === '') return null;
                const parsed = parseInt(String(val), 10);
                return isNaN(parsed) ? undefined : parsed;
            };

            const tinggiBadan = parseOptionalInt(tinggiBadanRaw);
            if (tinggiBadan === undefined) { failedCount++; continue; }

            const beratBadan = parseOptionalInt(beratBadanRaw);
            if (beratBadan === undefined) { failedCount++; continue; }

            const ukuranSepatu = parseOptionalInt(ukuranSepatuRaw);
            if (ukuranSepatu === undefined) { failedCount++; continue; }


            // --- DATA MAPPING ---
            validRows.push({
                club_id: clubProfile.id,
                nik: nik,
                nama: nama.toUpperCase(),
                tempat_lahir: tempatLahir.toUpperCase(),
                tgl_lahir: tglLahir,
                jenis_kelamin: jenisKelamin,
                tinggi_badan: tinggiBadan,
                berat_badan: beratBadan,
                ukuran_baju: ukuranBaju ? String(ukuranBaju).trim().toUpperCase() : null,
                ukuran_sepatu: ukuranSepatu,
                no_hp: noWa ? String(noWa).trim() : null,
            });
        }

        // 4. Database Insert
        let insertedCount = 0;
        if (validRows.length > 0) {
            const result = await prisma.atlet.createMany({
                data: validRows,
                skipDuplicates: true,
            });
            insertedCount = result.count;
        }

        revalidatePath('/dashboard/club/athletes');

        return {
            success: true,
            count: insertedCount,
            failed: failedCount,
            message: `Import selesai. ${insertedCount} data berhasil disimpan. ${failedCount} data format salah/dilewati.`
        };

    } catch (error) {
        console.error('Import error:', error);
        return { success: false, message: 'Gagal memproses file.', count: 0, failed: 0 };
    }
}
