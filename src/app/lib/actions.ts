
'use server';

import { signIn, auth, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { PrismaClient, Prisma, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateToken, getExpiryDate } from './utils';
import prisma from '@/lib/prisma';

// ============================================
// AUTHENTICATION ACTION
// ============================================

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function signOutAction() {
    await signOut({ redirect: false });
    redirect('/login');
}

// ============================================
// KONI INVITATION ACTIONS
// ============================================

export type CreateKoniInvitationResult = {
    success: boolean;
    token?: string;
    error?: string;
};

/**
 * Creates a new KONI invitation token.
 * Only accessible by ADMIN_KONI users.
 * @param description - Optional description for the invitation
 * @returns Object containing success status and generated token or error
 */
export async function createKoniInvitation(
    description: string
): Promise<CreateKoniInvitationResult> {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return { success: false, error: 'Unauthorized: Please log in.' };
        }

        // Check if user is ADMIN_KONI
        if (session.user.role !== Role.ADMIN_KONI) {
            return { success: false, error: 'Forbidden: Only KONI admin can create invitations.' };
        }

        // Generate token with KONI prefix
        const token = generateToken('KONI');

        // Set expiry to 24 hours from now
        const expiresAt = getExpiryDate(24);

        // Create the invitation record
        await prisma.koniInvitation.create({
            data: {
                token: token,
                deskripsi: description || null,
                expires_at: expiresAt,
                is_active: true,
                created_by: BigInt(session.user.id),
            },
        });

        // Revalidate the dashboard path to show new invitation
        revalidatePath('/dashboard/koni');

        return { success: true, token: token };
    } catch (error) {
        console.error('Error creating KONI invitation:', error);
        return { success: false, error: 'Failed to create invitation. Please try again.' };
    }
}

// ============================================
// CLUB INVITATION ACTIONS
// ============================================

export type CreateClubInvitationResult = {
    success: boolean;
    token?: string;
    error?: string;
};

/**
 * Creates a new Club registration token for a Cabor.
 * Only accessible by ADMIN_CABOR users.
 * @param caborId - The ID of the Cabor creating the invitation
 * @returns Object containing success status and generated token or error
 */
export async function createClubInvitation(
    caborId: string
): Promise<CreateClubInvitationResult> {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return { success: false, error: 'Unauthorized: Please log in.' };
        }

        // Check if user is ADMIN_CABOR
        if (session.user.role !== Role.ADMIN_CABOR) {
            return { success: false, error: 'Forbidden: Only Cabor admin can create club invitations.' };
        }

        // Fetch the Cabor profile to get the Cabor name
        const caborProfile = await prisma.caborProfile.findUnique({
            where: {
                id: BigInt(caborId),
            },
            include: {
                master_cabor: true,
            },
        });

        if (!caborProfile) {
            return { success: false, error: 'Cabor profile not found.' };
        }

        // Verify the logged-in user owns this Cabor profile
        if (caborProfile.user_id.toString() !== session.user.id) {
            return { success: false, error: 'Forbidden: You can only create invitations for your own Cabor.' };
        }

        // CRITICAL: Ensure profile is VERIFIED by KONI Admin
        if (caborProfile.verification_status !== 'VERIFIED') {
            return {
                success: false,
                error: 'Akun Cabor Anda belum diverifikasi oleh Admin KONI. Mohon tunggu verifikasi sebelum membuat token.'
            };
        }

        // CRITICAL: Ensure documents are uploaded (Double check, though verification usually implies this)
        if (!caborProfile.sk_file_url || !caborProfile.ad_art_file_url) {
            return {
                success: false,
                error: 'Dokumen SK Kepengurusan dan AD/ART belum lengkap.'
            };
        }

        // Generate token using Cabor name as prefix (e.g., "PSSI")
        const caborName = caborProfile.master_cabor.nama_cabor;

        // Retry logic for token generation to handle collisions
        let token = '';
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
            try {
                token = generateToken(caborName);

                // Set expiry to 7 days from now (7 * 24 hours)
                const expiresAt = getExpiryDate(7 * 24);

                // Update CaborProfile with the new club_registration_token
                await prisma.caborProfile.update({
                    where: {
                        id: BigInt(caborId),
                    },
                    data: {
                        club_registration_token: token,
                        club_token_expires_at: expiresAt,
                    },
                });

                success = true;
            } catch (error: any) {
                // Check for unique constraint violation (P2002)
                if (error.code === 'P2002' && error.meta?.target?.includes('club_registration_token')) {
                    console.warn(`Token collision for ${token}. Retrying... (${retries - 1} left)`);
                    retries--;
                } else {
                    throw error; // Re-throw other errors
                }
            }
        }

        if (!success) {
            return { success: false, error: 'Failed to generate a unique token after multiple attempts. Please try again.' };
        }

        // Revalidate the dashboard path
        revalidatePath('/dashboard/cabor');

        return { success: true, token: token };
    } catch (error) {
        console.error('Error creating club invitation:', error);
        return { success: false, error: 'Failed to create club invitation due to a system error.' };
    }
}

// ============================================
// CABOR PROFILE MANAGEMENT ACTIONS
// ============================================

export type UpdateCaborProfileResult = {
    success: boolean;
    error?: string;
};

/**
 * Updates the Cabor profile information.
 * Only accessible by ADMIN_CABOR users.
 * @param formData - Form data containing profile fields
 * @returns Object containing success status or error
 */
export async function updateCaborProfile(
    formData: FormData
): Promise<UpdateCaborProfileResult> {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return { success: false, error: 'Unauthorized: Please log in.' };
        }

        // Check if user is ADMIN_CABOR
        if (session.user.role !== Role.ADMIN_CABOR) {
            return { success: false, error: 'Forbidden: Only Cabor admin can update profile.' };
        }

        // Get form data
        const description = formData.get('description') as string | null;
        const alamatSekretariat = formData.get('alamat_sekretariat') as string | null;
        const emailResmi = formData.get('email_resmi') as string | null;
        const nomorTelepon = formData.get('nomor_telepon') as string | null;
        const skFileUrl = formData.get('sk_file_url') as string | null;
        const skFileName = formData.get('sk_file_name') as string | null;

        const skStartDateStr = formData.get('sk_start_date') as string | null;
        const skEndDateStr = formData.get('sk_end_date') as string | null;

        // New Social Media Fields
        const facebookUrl = formData.get('facebook_url') as string | null;
        const instagramUrl = formData.get('instagram_url') as string | null;
        const websiteUrl = formData.get('website_url') as string | null;
        const youtubeUrl = formData.get('youtube_url') as string | null;

        // New Text Fields
        const orgStructure = formData.get('org_structure') as string | null;
        const facilities = formData.get('facilities') as string | null;
        const trainingSchedule = formData.get('training_schedule') as string | null;
        const trainingLocation = formData.get('training_location') as string | null;
        const developmentProgram = formData.get('development_program') as string | null;
        const achievements = formData.get('achievements') as string | null;

        // New Stats Fields (parse to int)
        const totalReferees = parseInt(formData.get('total_referees') as string || '0');
        const totalCoaches = parseInt(formData.get('total_coaches') as string || '0');
        const totalAthletesManual = parseInt(formData.get('total_athletes_manual') as string || '0');

        // New File Fields
        const adArtFileUrl = formData.get('ad_art_file_url') as string | null;
        const adArtFileName = formData.get('ad_art_file_name') as string | null;

        // Find the Cabor profile for the current user
        const caborProfile = await prisma.caborProfile.findUnique({
            where: {
                user_id: BigInt(session.user.id),
            },
        });

        if (!caborProfile) {
            return { success: false, error: 'Cabor profile not found.' };
        }

        // --- SK Validity & Re-Verification Logic ---

        // Helper to compare dates (comparing YYYY-MM-DD strings)
        const dbStartDateStr = caborProfile.sk_start_date ? caborProfile.sk_start_date.toISOString().split('T')[0] : null;
        const dbEndDateStr = caborProfile.sk_end_date ? caborProfile.sk_end_date.toISOString().split('T')[0] : null;

        const isFileChanged = skFileUrl && skFileUrl !== caborProfile.sk_file_url;
        const isStartDateChanged = skStartDateStr !== dbStartDateStr;
        const isEndDateChanged = skEndDateStr !== dbEndDateStr;

        let shouldReverify = false;

        // Critical Adjustment 1 & 2: 
        // If VERIFIED or REJECTED, and any SK data changes (Original Logic + Start Date Change), trigger re-verification.
        if (caborProfile.verification_status === 'VERIFIED' || caborProfile.verification_status === 'REJECTED') {
            if (isFileChanged || isStartDateChanged || isEndDateChanged) {
                shouldReverify = true;
            }
        }

        // Build update data
        const updateData: any = {
            description: description || null,
            alamat_sekretariat: alamatSekretariat || null,
            email_resmi: emailResmi || null,
            nomor_telepon: nomorTelepon || null,
            // Social Media
            facebook_url: facebookUrl || null,
            instagram_url: instagramUrl || null,
            website_url: websiteUrl || null,
            youtube_url: youtubeUrl || null,
            // Text Fields
            org_structure: orgStructure || null,
            facilities: facilities || null,
            training_schedule: trainingSchedule || null,
            training_location: trainingLocation || null,
            development_program: developmentProgram || null,
            achievements: achievements || null,
            // Stats
            total_referees: isNaN(totalReferees) ? 0 : totalReferees,
            total_coaches: isNaN(totalCoaches) ? 0 : totalCoaches,
            total_athletes_manual: isNaN(totalAthletesManual) ? 0 : totalAthletesManual,
            // Dates (Parse to Date object or null)
            // Using new Date(string) with YYYY-MM-DD ensures UTC midnight interpretation in Prisma/Postgres usually,
            // but to be safe and timezone agnostic (as requested), we rely on the string being YYYY-MM-DD.
            // Prisma DateTime expects a Date object.
            sk_start_date: skStartDateStr ? new Date(skStartDateStr) : null,
            sk_end_date: skEndDateStr ? new Date(skEndDateStr) : null,
        };

        // Only update SK fields if they are provided (non-empty)
        if (skFileUrl) {
            updateData.sk_file_url = skFileUrl;
            updateData.sk_file_name = skFileName || null;
        }

        // Apply Re-verification logic
        if (shouldReverify) {
            updateData.verification_status = 'PENDING';
            updateData.rejection_reason = null;
        }

        // Only update AD/ART fields if they are provided
        if (adArtFileUrl) {
            updateData.ad_art_file_url = adArtFileUrl;
            updateData.ad_art_file_name = adArtFileName || null;
        }

        // Update the profile
        await prisma.caborProfile.update({
            where: {
                id: caborProfile.id,
            },
            data: updateData,
        });

        // Revalidate the dashboard and profile paths
        revalidatePath('/dashboard/cabor');
        revalidatePath('/dashboard/cabor/profile');

        return { success: true };
    } catch (error) {
        console.error('Error updating Cabor profile:', error);
        return { success: false, error: 'Failed to update profile. Please try again.' };
    }
}

// ============================================
// TOKEN VALIDATION ACTIONS
// ============================================

export type ValidateCaborTokenResult = {
    valid: boolean;
    data?: {
        id: number;
        deskripsi: string | null;
        expires_at: Date;
    };
    error?: string;
};

/**
 * Validates a KONI invitation token for Cabor registration.
 * @param token - The invitation token to validate
 * @returns Object containing validity status and token data
 */
export async function validateCaborToken(token: string): Promise<ValidateCaborTokenResult> {
    try {
        const invitation = await prisma.koniInvitation.findUnique({
            where: { token: token },
        });

        if (!invitation) {
            return { valid: false, error: 'Token tidak ditemukan.' };
        }

        if (!invitation.is_active) {
            return { valid: false, error: 'Token sudah digunakan.' };
        }

        if (new Date() > invitation.expires_at) {
            return { valid: false, error: 'Token sudah kadaluarsa.' };
        }

        return {
            valid: true,
            data: {
                id: invitation.id,
                deskripsi: invitation.deskripsi,
                expires_at: invitation.expires_at,
            },
        };
    } catch (error) {
        console.error('Error validating Cabor token:', error);
        return { valid: false, error: 'Gagal memvalidasi token.' };
    }
}

export type ValidateClubTokenResult = {
    valid: boolean;
    caborName?: string;
    caborProfileId?: string;
    error?: string;
};

/**
 * Validates a Club registration token.
 * @param token - The club registration token to validate
 * @returns Object containing validity status and Cabor name
 */
export async function validateClubToken(token: string): Promise<ValidateClubTokenResult> {
    try {
        const caborProfile = await prisma.caborProfile.findFirst({
            where: { club_registration_token: token },
            include: { master_cabor: true },
        });

        if (!caborProfile) {
            return { valid: false, error: 'Token tidak ditemukan.' };
        }

        if (!caborProfile.club_token_expires_at || new Date() > caborProfile.club_token_expires_at) {
            return { valid: false, error: 'Token sudah kadaluarsa.' };
        }

        return {
            valid: true,
            caborName: caborProfile.master_cabor.nama_cabor,
            caborProfileId: caborProfile.id.toString(),
        };
    } catch (error) {
        console.error('Error validating Club token:', error);
        return { valid: false, error: 'Gagal memvalidasi token.' };
    }
}

export type VerifyTokenResult = {
    valid: boolean;
    type?: 'CABOR' | 'CLUB';
    redirectUrl?: string;
    error?: string;
};

/**
 * Verifies a token and determines if it's for Cabor or Club registration.
 * @param token - The token to verify
 * @returns Object containing type and redirect URL
 */
export async function verifyTokenAndRedirect(token: string): Promise<VerifyTokenResult> {
    try {
        // 1. Check if it's a KONI Invitation (for Cabor Registration)
        const koniInvitation = await prisma.koniInvitation.findUnique({
            where: { token: token },
        });

        if (koniInvitation) {
            if (!koniInvitation.is_active) {
                return { valid: false, error: 'Token Cabor sudah digunakan.' };
            }
            if (new Date() > koniInvitation.expires_at) {
                return { valid: false, error: 'Token Cabor sudah kadaluarsa.' };
            }
            return {
                valid: true,
                type: 'CABOR',
                redirectUrl: `/onboarding/cabor?token=${encodeURIComponent(token)}`,
            };
        }

        // 2. Check if it's a Club Invitation (from CaborProfile)
        const caborProfile = await prisma.caborProfile.findFirst({
            where: { club_registration_token: token },
        });

        if (caborProfile) {
            if (!caborProfile.club_token_expires_at || new Date() > caborProfile.club_token_expires_at) {
                return { valid: false, error: 'Token Club sudah kadaluarsa.' };
            }
            return {
                valid: true,
                type: 'CLUB',
                redirectUrl: `/register/club?token=${encodeURIComponent(token)}`,
            };
        }

        return { valid: false, error: 'Token tidak dikenali.' };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { valid: false, error: 'Terjadi kesalahan saat memverifikasi token.' };
    }
}

// ============================================
// REGISTRATION ACTIONS
// ============================================

import bcrypt from 'bcryptjs';


export type RegistrationState = {
    success: boolean;
    error?: string;
    fieldErrors?: {
        email?: string;
        password?: string;
        confirmPassword?: string;
        namaCabor?: string;
        namaClub?: string;
    };
};

/**
 * Registers a new Cabor Admin.
 * @param prevState - Previous form state
 * @param formData - Form data containing registration details
 * @returns Registration result with success/error status
 */
export async function registerCaborAdmin(
    prevState: RegistrationState | undefined,
    formData: FormData
): Promise<RegistrationState> {
    try {
        const token = formData.get('token') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const username = formData.get('username') as string;

        // New fields
        const caborId = formData.get('caborId') as string;
        const newCaborName = formData.get('newCaborName') as string;

        // Field validation
        const fieldErrors: RegistrationState['fieldErrors'] = {};

        if (!email || !email.includes('@')) {
            fieldErrors.email = 'Email tidak valid.';
        }

        if (!password || password.length < 6) {
            fieldErrors.password = 'Password minimal 6 karakter.';
        }

        if (password !== confirmPassword) {
            fieldErrors.confirmPassword = 'Password tidak cocok.';
        }

        // Validate Cabor Selection
        if (!caborId) {
            fieldErrors.namaCabor = 'Pilih Cabang Olahraga.';
        } else if (caborId === 'NEW') {
            if (!newCaborName || newCaborName.trim().length < 2) {
                fieldErrors.namaCabor = 'Nama Cabor baru tidak valid.';
            }
        }

        if (Object.keys(fieldErrors).length > 0) {
            return { success: false, fieldErrors };
        }

        // Validate token again
        const tokenValidation = await validateCaborToken(token);
        if (!tokenValidation.valid) {
            return { success: false, error: tokenValidation.error };
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, fieldErrors: { email: 'Email sudah terdaftar.' } };
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username: username || email.split('@')[0] },
        });

        if (existingUsername) {
            return { success: false, error: 'Username sudah terdaftar.' };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Determine Master Cabor ID
        let masterCaborId: bigint;

        if (caborId === 'NEW') {
            // Check if MasterCabor with this name already exists to prevent duplicates
            // even if user selected "NEW" but typed an existing name
            const normalizedName = newCaborName.trim().toUpperCase();

            let masterCabor = await prisma.masterCabor.findUnique({
                where: { nama_cabor: normalizedName },
            });

            if (!masterCabor) {
                masterCabor = await prisma.masterCabor.create({
                    data: {
                        nama_cabor: normalizedName,
                        is_verified: false,
                    },
                });
            }
            masterCaborId = masterCabor.id;
        } else {
            // Use existing Cabor ID
            masterCaborId = BigInt(caborId);

            // Optional: Verify it exists (Prisma will throw on foreign key constraint anyway, but cleaner to check)
            // skipping explicitly check for performance, relying on FK constraint or assuming logic is correct
        }

        // Use transaction to ensure atomicity
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create User with ADMIN_CABOR role
            const user = await tx.user.create({
                data: {
                    username: username || email.split('@')[0],
                    email: email,
                    password_hash: passwordHash,
                    role: Role.ADMIN_CABOR,
                    is_active: true,
                },
            });

            // Create CaborProfile linked to User and MasterCabor
            await tx.caborProfile.create({
                data: {
                    user: {
                        connect: { id: user.id }
                    },
                    master_cabor: {
                        connect: { id: masterCaborId }
                    },
                    verification_status: 'PENDING',
                },
            });

            // Mark invitation as used
            await tx.koniInvitation.update({
                where: { token: token },
                data: { is_active: false },
            });
        });

        return { success: true };
    } catch (error) {
        console.error('Error registering Cabor admin:', error);
        return { success: false, error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.' };
    }
}

/**
 * Registers a new Club Admin.
 * @param prevState - Previous form state
 * @param formData - Form data containing registration details
 * @returns Registration result with success/error status
 */
export async function registerClubAdmin(
    prevState: RegistrationState | undefined,
    formData: FormData
): Promise<RegistrationState> {
    try {
        const token = formData.get('token') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const namaClub = formData.get('namaClub') as string;

        // Auto-generate username from email
        const username = email.split('@')[0];

        // Field validation
        const fieldErrors: RegistrationState['fieldErrors'] = {};

        if (!email || !email.includes('@')) {
            fieldErrors.email = 'Email tidak valid.';
        }

        if (!password || password.length < 6) {
            fieldErrors.password = 'Password minimal 6 karakter.';
        }

        if (password !== confirmPassword) {
            fieldErrors.confirmPassword = 'Password tidak cocok.';
        }

        if (!namaClub || namaClub.trim().length < 2) {
            fieldErrors.namaClub = 'Nama Club tidak valid.';
        }

        if (Object.keys(fieldErrors).length > 0) {
            return { success: false, fieldErrors };
        }

        // Validate token again
        const tokenValidation = await validateClubToken(token);
        if (!tokenValidation.valid) {
            return { success: false, error: tokenValidation.error };
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, fieldErrors: { email: 'Email sudah terdaftar.' } };
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            return { success: false, fieldErrors: { email: 'Email/Username ini sudah terdaftar.' } };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Use transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Create User with ADMIN_CLUB role
            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    password_hash: passwordHash,
                    role: Role.ADMIN_CLUB,
                    is_active: true,
                },
            });

            // Create ClubProfile linked to User and CaborProfile
            await tx.clubProfile.create({
                data: {
                    user_id: user.id,
                    cabor_profile_id: BigInt(tokenValidation.caborProfileId!),
                    nama_club: namaClub,
                    verification_status: 'VERIFIED',
                },
            });
        });

        // Note: We don't invalidate the club token as it can be reused for multiple clubs

        return { success: true };
    } catch (error) {
        console.error('Error registering Club admin:', error);
        return { success: false, error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.' };
    }
}

// ============================================
// KONI CABOR VERIFICATION ACTIONS
// ============================================

export type VerifyCaborResult = {
    success: boolean;
    error?: string;
};

/**
 * Verifies a Cabor profile by updating its verification status to VERIFIED.
 * Only accessible by SUPER_ADMIN users.
 * @param caborProfileId - The ID of the CaborProfile to verify
 * @returns Object containing success status or error
 */
export async function verifyCabor(caborProfileId: string): Promise<VerifyCaborResult> {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return { success: false, error: 'Unauthorized: Please log in.' };
        }

        // Check if user is ADMIN_KONI (KONI Super Admin)
        if (session.user.role !== Role.ADMIN_KONI) {
            return { success: false, error: 'Forbidden: Only KONI Admin can verify Cabors.' };
        }

        // Update the CaborProfile verification status
        await prisma.caborProfile.update({
            where: {
                id: BigInt(caborProfileId),
            },
            data: {
                verification_status: 'VERIFIED',
                rejection_reason: null, // Clear any previous rejection reason
            },
        });

        // Revalidate relevant paths
        revalidatePath('/dashboard/koni');
        revalidatePath('/dashboard/koni/cabor');

        return { success: true };
    } catch (error) {
        console.error('Error verifying Cabor:', error);
        return { success: false, error: 'Gagal memverifikasi Cabor. Silakan coba lagi.' };
    }
}

/**
 * Rejects a Cabor profile verification with a reason.
 * Only accessible by KONI Admin.
 * @param caborProfileId - The ID of the CaborProfile to reject
 * @param reason - The reason for rejection
 * @returns Object containing success status or error
 */
export async function rejectCabor(caborProfileId: string, reason: string): Promise<VerifyCaborResult> {
    try {
        // Check authentication
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return { success: false, error: 'Unauthorized: Please log in.' };
        }

        // Check if user is ADMIN_KONI
        if (session.user.role !== Role.ADMIN_KONI) {
            return { success: false, error: 'Forbidden: Only KONI Admin can reject Cabor verification.' };
        }

        if (!reason || reason.trim() === '') {
            return { success: false, error: 'Reason is required for rejection.' };
        }

        // Update the CaborProfile verification status
        await prisma.caborProfile.update({
            where: {
                id: BigInt(caborProfileId),
            },
            data: {
                verification_status: 'REJECTED',
                rejection_reason: reason,
            },
        });

        // Revalidate relevant paths
        revalidatePath('/dashboard/koni');
        revalidatePath('/dashboard/koni/cabor');
        revalidatePath('/dashboard/cabor'); // Revalidate Cabor dashboard too

        return { success: true };
    } catch (error) {
        console.error('Error rejecting Cabor:', error);
        return { success: false, error: 'Gagal menolak verifikasi Cabor. Silakan coba lagi.' };
    }
}
