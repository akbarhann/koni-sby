'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const clubOnboardingSchema = z.object({
    nama_ketua: z.string().min(3, 'Nama Ketua minimal 3 karakter.'),
    nama_sekretaris: z.string().min(3, 'Nama Sekretaris minimal 3 karakter.'),
    alamat_basecamp: z.string().min(3, 'Alamat Sekretariat minimal 3 karakter.'),
    jadwal_latihan: z.string().min(3, 'Jadwal Latihan minimal 3 karakter.'),
    lokasi_latihan: z.string().min(3, 'Tempat Latihan minimal 3 karakter.'),
});

export type ClubOnboardingState = {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        nama_ketua?: string[];
        nama_sekretaris?: string[];
        alamat_basecamp?: string[];
        jadwal_latihan?: string[];
        lokasi_latihan?: string[];
    };
};

export async function submitClubOnboarding(
    prevState: ClubOnboardingState,
    formData: FormData
): Promise<ClubOnboardingState> {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const rawData = {
        nama_ketua: formData.get('nama_ketua'),
        nama_sekretaris: formData.get('nama_sekretaris'),
        alamat_basecamp: formData.get('alamat_basecamp'),
        jadwal_latihan: formData.get('jadwal_latihan'),
        lokasi_latihan: formData.get('lokasi_latihan'),
    };

    const validatedFields = clubOnboardingSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const userId = session.user.id;

        // Verify user is actually a Club Admin and has a profile
        const existingProfile = await prisma.clubProfile.findUnique({
            where: { user_id: BigInt(userId) },
        });

        if (!existingProfile) {
            return { success: false, error: 'Club profile not found for this user.' };
        }

        await prisma.clubProfile.update({
            where: { user_id: BigInt(userId) },
            data: {
                nama_ketua: validatedFields.data.nama_ketua,
                nama_sekretaris: validatedFields.data.nama_sekretaris,
                alamat_basecamp: validatedFields.data.alamat_basecamp,
                jadwal_latihan: validatedFields.data.jadwal_latihan,
                lokasi_latihan: validatedFields.data.lokasi_latihan,

                is_onboarded: true,
                verification_status: 'PENDING',
                rejection_reason: null,
            },
        });
    } catch (error) {
        console.error('Club onboarding error:', error);
        return { success: false, error: 'Failed to update club profile.' };
    }

    revalidatePath('/dashboard/club');
    redirect('/dashboard/club');
}
