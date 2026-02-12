'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type AuthAthleteState = {
    success: boolean;
    message?: string;
    atlet?: {
        id: string;
        nama: string;
        club: {
            nama_club: string;
        };
    };
};

export async function authenticateAthlete(
    prevState: AuthAthleteState,
    formData: FormData
): Promise<AuthAthleteState> {
    const nik = formData.get('nik') as string;
    const tgl_lahir_str = formData.get('tgl_lahir') as string;

    if (!nik || !tgl_lahir_str) {
        return {
            success: false,
            message: 'Mohon lengkapi NIK dan Tanggal Lahir.',
        };
    }

    // 1. Check Prefix: Surabaya KTP must start with 3578
    if (!nik.startsWith('3578')) {
        return {
            success: false,
            message: 'Maaf, akses khusus Atlet ber-KTP Surabaya (3578).',
        };
    }

    try {
        // 2. Database Lookup
        const atlet = await prisma.atlet.findUnique({
            where: { nik },
            include: {
                club: {
                    select: {
                        nama_club: true,
                    },
                },
            },
        });

        // 3. Existence Check
        if (!atlet) {
            return {
                success: false,
                message: 'Data tidak ditemukan. Pastikan Anda sudah didaftarkan oleh Club.',
            };
        }

        // 4. DoB Match
        // Convert DB Date to YYYY-MM-DD string for strict comparison
        const dbDate = new Date(atlet.tgl_lahir);
        const dbDateStr = dbDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Input date is likely YYYY-MM-DD from HTML date input
        if (tgl_lahir_str !== dbDateStr) {
            return {
                success: false,
                message: 'Tanggal lahir tidak sesuai dengan data terdaftar.',
            };
        }

        // 5. Success
        return {
            success: true,
            message: 'Autentikasi Berhasil!',
            atlet: {
                id: atlet.id,
                nama: atlet.nama,
                club: {
                    nama_club: atlet.club.nama_club,
                },
            },
        };

    } catch (error) {
        console.error('Auth Athlete Error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada sistem. Silakan coba lagi.',
        };
    }
}
