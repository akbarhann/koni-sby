'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { AthleteFormSchema } from '@/app/lib/zod/athlete-schema';

// Helper to serialize BigInt
function serializeBigInt(obj: any): any {
    return JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
}

export type Athlete = {
    id: string;
    nik: string;
    nama: string;
    jenis_kelamin: string;
    tgl_lahir: Date | string;
    // Add other fields as needed for display
};

const ITEMS_PER_PAGE = 10;

export async function getAthletesByClub(
    query?: string,
    currentPage?: number,
    gender?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        // 1. Get ClubProfile based on logged-in user
        const clubProfile = await prisma.clubProfile.findUnique({
            where: {
                user_id: BigInt(session.user.id),
            },
        });

        if (!clubProfile) {
            throw new Error('Club profile not found');
        }

        // 2. Build where clause
        const offset = ((currentPage || 1) - 1) * ITEMS_PER_PAGE;

        const whereClause: any = {
            club_id: clubProfile.id,
        };

        if (query) {
            whereClause.OR = [
                { nama: { contains: query, mode: 'insensitive' } },
                { nik: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (gender && gender !== 'all') {
            whereClause.jenis_kelamin = gender;
        }

        // 3. Fetch athletes for this club with pagination
        const [athletes, totalCount] = await Promise.all([
            prisma.atlet.findMany({
                where: whereClause,
                orderBy: {
                    created_at: 'desc',
                },
                skip: offset,
                take: ITEMS_PER_PAGE,
            }),
            prisma.atlet.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        // 4. Serialize BigInts and return data
        return {
            athletes: serializeBigInt(athletes),
            totalPages,
            totalCount,
        };
    } catch (error) {
        console.error('Error fetching athletes:', error);
        return { athletes: [], totalPages: 0, totalCount: 0 };
    }
}

export type CreateAthleteState = {
    success: boolean;
    message?: string;
    errors?: {
        [key: string]: string[];
    };
};

export async function createAthlete(
    prevState: CreateAthleteState,
    formData: FormData
): Promise<CreateAthleteState> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized' };
        }

        // 1. Get ClubProfile
        const clubProfile = await prisma.clubProfile.findUnique({
            where: {
                user_id: BigInt(session.user.id),
            },
        });

        if (!clubProfile) {
            return { success: false, message: 'Club profile not found' };
        }

        // 2. Validate form data
        const rawData = {
            nik: formData.get('nik'),
            nama: formData.get('nama'),
            tempat_lahir: formData.get('tempat_lahir'),
            tgl_lahir: formData.get('tgl_lahir') ? new Date(formData.get('tgl_lahir') as string) : undefined,
            jenis_kelamin: formData.get('jenis_kelamin'),
            tinggi_badan: formData.get('tinggi_badan'),
            berat_badan: formData.get('berat_badan'),
            ukuran_baju: formData.get('ukuran_baju'),
            ukuran_sepatu: formData.get('ukuran_sepatu'),
            no_hp: formData.get('no_hp'),
        };

        const validatedFields = AthleteFormSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Validasi gagal. Mohon periksa kembali input Anda.',
            };
        }

        const { data } = validatedFields;

        // 3. Check for unique NIK
        const existingAthlete = await prisma.atlet.findUnique({
            where: {
                nik: data.nik,
            },
        });

        if (existingAthlete) {
            return {
                success: false,
                message: 'NIK sudah terdaftar.',
                errors: {
                    nik: ['NIK sudah digunakan.'],
                },
            };
        }

        // 4. Create Athlete
        await prisma.atlet.create({
            data: {
                club_id: clubProfile.id,
                nik: data.nik,
                nama: data.nama,
                tempat_lahir: data.tempat_lahir,
                tgl_lahir: data.tgl_lahir,
                jenis_kelamin: data.jenis_kelamin,
                tinggi_badan: data.tinggi_badan,
                berat_badan: data.berat_badan,
                ukuran_baju: data.ukuran_baju,
                ukuran_sepatu: data.ukuran_sepatu,
                no_hp: data.no_hp,
            },
        });

        revalidatePath('/dashboard/club/athletes');
        return { success: true, message: 'Atlet berhasil ditambahkan.' };
    } catch (error) {
        console.error('Error creating athlete:', error);
        return { success: false, message: 'Gagal menambahkan atlet. Terjadi kesalahan pada server.' };
    }
}

export async function updateAthlete(
    prevState: CreateAthleteState,
    formData: FormData
): Promise<CreateAthleteState> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized' };
        }

        const id = formData.get('id') as string;
        if (!id) return { success: false, message: 'ID Atlet tidak ditemukan' };

        // 1. Get ClubProfile
        const clubProfile = await prisma.clubProfile.findUnique({
            where: { user_id: BigInt(session.user.id) },
        });

        if (!clubProfile) {
            return { success: false, message: 'Club profile not found' };
        }

        // 2. Validate form data
        const rawData = {
            nik: formData.get('nik'),
            nama: formData.get('nama'),
            tempat_lahir: formData.get('tempat_lahir'),
            tgl_lahir: formData.get('tgl_lahir') ? new Date(formData.get('tgl_lahir') as string) : undefined,
            jenis_kelamin: formData.get('jenis_kelamin'),
            tinggi_badan: formData.get('tinggi_badan'),
            berat_badan: formData.get('berat_badan'),
            ukuran_baju: formData.get('ukuran_baju'),
            ukuran_sepatu: formData.get('ukuran_sepatu'),
            no_hp: formData.get('no_hp'),
        };

        const validatedFields = AthleteFormSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Validasi gagal. Mohon periksa kembali input Anda.',
            };
        }

        const { data } = validatedFields;

        // 3. Check for unique NIK (exclude current athlete)
        const existingAthlete = await prisma.atlet.findFirst({
            where: {
                nik: data.nik,
                NOT: { id: id },
            },
        });

        if (existingAthlete) {
            return {
                success: false,
                message: 'NIK sudah terdaftar pada atlet lain.',
                errors: {
                    nik: ['NIK sudah digunakan.'],
                },
            };
        }

        // 4. Update Athlete
        // Ensure athlete belongs to this club
        const athlete = await prisma.atlet.findUnique({ where: { id } });
        if (!athlete || athlete.club_id !== clubProfile.id) {
            return { success: false, message: 'Atlet tidak ditemukan atau Anda tidak memiliki akses.' };
        }

        await prisma.atlet.update({
            where: { id },
            data: {
                nik: data.nik,
                nama: data.nama,
                tempat_lahir: data.tempat_lahir,
                tgl_lahir: data.tgl_lahir,
                jenis_kelamin: data.jenis_kelamin,
                tinggi_badan: data.tinggi_badan,
                berat_badan: data.berat_badan,
                ukuran_baju: data.ukuran_baju,
                ukuran_sepatu: data.ukuran_sepatu,
                no_hp: data.no_hp,
            },
        });

        revalidatePath('/dashboard/club/athletes');
        return { success: true, message: 'Data atlet berhasil diperbarui.' };
    } catch (error) {
        console.error('Error updating athlete:', error);
        return { success: false, message: 'Gagal memperbarui data. Terjadi kesalahan pada server.' };
    }
}

export async function deleteAthlete(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        const clubProfile = await prisma.clubProfile.findUnique({
            where: { user_id: BigInt(session.user.id) },
        });

        if (!clubProfile) throw new Error('Club not found');

        // Verify ownership
        const athlete = await prisma.atlet.findUnique({ where: { id } });
        if (!athlete || athlete.club_id !== clubProfile.id) {
            throw new Error('Unauthorized access to athlete');
        }

        await prisma.atlet.delete({ where: { id } });
        revalidatePath('/dashboard/club/athletes');
        return { success: true, message: 'Atlet berhasil dihapus' };
    } catch (error) {
        console.error('Error deleting athlete:', error);
        return { success: false, message: 'Gagal menghapus atlet' };
    }
}
