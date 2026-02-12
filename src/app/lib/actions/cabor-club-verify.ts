'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { VerificationStatus } from '@prisma/client';

export async function approveClub(clubId: string) {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN_CABOR') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await prisma.clubProfile.update({
            where: { id: BigInt(clubId) },
            data: {
                verification_status: VerificationStatus.VERIFIED,
                rejection_reason: null,
            },
        });

        revalidatePath('/dashboard/cabor');
        return { success: true };
    } catch (error) {
        console.error('Error approving club:', error);
        return { success: false, error: 'Failed to approve club.' };
    }
}

export async function rejectClub(clubId: string, reason: string) {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN_CABOR') {
        return { success: false, error: 'Unauthorized' };
    }

    if (!reason || reason.trim() === '') {
        return { success: false, error: 'Alasan penolakan wajib diisi.' };
    }

    try {
        await prisma.clubProfile.update({
            where: { id: BigInt(clubId) },
            data: {
                verification_status: VerificationStatus.REJECTED,
                rejection_reason: reason,
            },
        });

        revalidatePath('/dashboard/cabor');
        return { success: true };
    } catch (error) {
        console.error('Error rejecting club:', error);
        return { success: false, error: 'Failed to reject club.' };
    }
}
