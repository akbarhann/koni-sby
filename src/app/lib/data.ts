/**
 * Data fetching layer for KONI application dashboards
 */

import { PrismaClient, VerificationStatus, StatusVerifikasi } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/lib/prisma';

/**
 * Fetches dashboard statistics for KONI Admin
 * @returns Object containing total counts and recent activities
 */
export async function fetchKoniDashboardStats() {
    noStore();

    try {
        const [totalCabor, totalClub, totalAthlete, recentActivities] = await Promise.all([
            // Count all MasterCabor
            prisma.masterCabor.count(),

            // Count all ClubProfile
            prisma.clubProfile.count(),

            // Count all Athlete
            prisma.atlet.count(),

            // Fetch last 5 ClubProfile creations with parent_cabor relation
            prisma.clubProfile.findMany({
                take: 5,
                orderBy: {
                    id: 'desc',
                },
                include: {
                    parent_cabor: {
                        include: {
                            master_cabor: true,
                        },
                    },
                },
            }),
        ]);

        return {
            total_cabor: totalCabor,
            total_club: totalClub,
            total_athlete: totalAthlete,
            recent_activities: recentActivities,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch KONI dashboard stats.');
    }
}

/**
 * Fetches dashboard statistics for Cabor Admin
 * @param caborId - The ID of the Cabor profile
 * @returns Object containing club count, athlete count, and verification queue
 */
export async function fetchCaborDashboardStats(caborId: number) {
    noStore();

    try {
        // Get clubs belonging to this Cabor
        const clubs = await prisma.clubProfile.findMany({
            where: {
                cabor_profile_id: BigInt(caborId),
            },
            select: {
                id: true,
            },
        });

        const clubIds = clubs.map((club: { id: bigint }) => club.id);

        const [totalClub, totalAthlete, verificationQueue] = await Promise.all([
            // Count of ClubProfile belonging to this Cabor
            prisma.clubProfile.count({
                where: {
                    cabor_profile_id: BigInt(caborId),
                },
            }),

            // Count of Athlete belonging to Clubs in this Cabor
            prisma.atlet.count({
                where: {
                    club_id: {
                        in: clubIds,
                    },
                },
            }),

            // Count of Achievement where status is SUBMITTED
            prisma.prestasi.count({
                where: {
                    atlet: {
                        club_id: {
                            in: clubIds,
                        },
                    },
                    status_verifikasi: StatusVerifikasi.PENDING,
                },
            }),
        ]);

        return {
            total_club: totalClub,
            total_athlete: totalAthlete,
            verification_queue: verificationQueue,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Cabor dashboard stats.');
    }
}

/**
 * Fetches the Cabor profile for a user
 * @param userId - The user ID
 * @returns CaborProfile with master_cabor relation or null
 */
export async function fetchCaborProfile(userId: string) {
    noStore();

    try {
        const caborProfile = await prisma.caborProfile.findUnique({
            where: {
                user_id: BigInt(userId),
            },
            include: {
                master_cabor: true,
            },
        });

        return caborProfile;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Cabor profile.');
    }
}


/**
 * Fetches the Club profile for a user
 * @param userId - The user ID
 * @returns ClubProfile with related info or null
 */
export async function fetchClubProfile(userId: string) {
    noStore();

    try {
        const clubProfile = await prisma.clubProfile.findUnique({
            where: {
                user_id: BigInt(userId),
            },
            include: {
                parent_cabor: true,
                athletes: {
                    select: { id: true }
                }
            }
        });

        return clubProfile;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Club profile.');
    }
}

/**
 * Fetches all KONI invitations (for admin view)
 * @returns List of KONI invitations with creator info
 */
export async function fetchKoniInvitations() {
    noStore();

    try {
        const invitations = await prisma.koniInvitation.findMany({
            orderBy: {
                created_at: 'desc',
            },
            include: {
                creator: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
        });

        return invitations;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch KONI invitations.');
    }
}

/**
 * Fetches list of clubs for a specific Cabor
 * @param caborId - The ID of the Cabor profile
 * @returns List of ClubProfile with associated User info
 */
export async function fetchCaborClubs(caborId: number) {
    noStore();

    try {
        const clubs = await prisma.clubProfile.findMany({
            where: {
                cabor_profile_id: BigInt(caborId),
            },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });

        return clubs;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Cabor clubs.');
    }
}

/**
 * Fetches verification queue (achievements with SUBMITTED status)
 * @param caborId - The ID of the Cabor profile
 * @returns List of Achievements with Athlete and Club info
 */
export async function fetchCaborVerificationQueue(caborId: number) {
    noStore();

    try {
        // First get all club IDs for this Cabor
        const clubs = await prisma.clubProfile.findMany({
            where: {
                cabor_profile_id: BigInt(caborId),
            },
            select: {
                id: true,
            },
        });

        const clubIds = clubs.map((club: { id: bigint }) => club.id);

        if (clubIds.length === 0) {
            return [];
        }

        const achievements = await prisma.prestasi.findMany({
            where: {
                atlet: {
                    club_id: {
                        in: clubIds,
                    },
                },
                status_verifikasi: StatusVerifikasi.PENDING,
            },
            include: {
                atlet: {
                    include: {
                        club: {
                            select: {
                                nama_club: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });

        return achievements;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Cabor verification queue.');
    }
}

/**
 * Fetches all Cabor names from MasterCabor for the onboarding dropdown
 * @returns Array of { id, name } objects sorted alphabetically
 */
export async function getAllCaborNames(): Promise<{ id: string; name: string }[]> {
    noStore();

    try {
        const cabors = await prisma.masterCabor.findMany({
            orderBy: {
                nama_cabor: 'asc',
            },
            select: {
                id: true,
                nama_cabor: true,
            },
        });

        return cabors.map((cabor: { id: bigint; nama_cabor: string }) => ({
            id: cabor.id.toString(),
            name: cabor.nama_cabor,
        }));
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Cabor names.');
    }
}

/**
 * Fetches all Cabor data with their profiles and admin users for KONI verification
 * @returns Array of Cabor data with profile and user information
 */
export async function getAllCaborData() {
    noStore();

    try {
        const cabors = await prisma.masterCabor.findMany({
            orderBy: {
                nama_cabor: 'asc',
            },
            include: {
                cabor_profiles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        return cabors.map((cabor: any) => ({
            id: cabor.id.toString(),
            nama_cabor: cabor.nama_cabor,
            is_verified: cabor.is_verified,
            profile: cabor.cabor_profiles[0]
                ? {
                    id: cabor.cabor_profiles[0].id.toString(),
                    verification_status: cabor.cabor_profiles[0].verification_status,
                    sk_file_url: cabor.cabor_profiles[0].sk_file_url,
                    sk_file_name: cabor.cabor_profiles[0].sk_file_name,
                    ad_art_file_url: cabor.cabor_profiles[0].ad_art_file_url,
                    ad_art_file_name: cabor.cabor_profiles[0].ad_art_file_name,
                    description: cabor.cabor_profiles[0].description,
                    admin: {
                        id: cabor.cabor_profiles[0].user.id.toString(),
                        email: cabor.cabor_profiles[0].user.email,
                        username: cabor.cabor_profiles[0].user.username,
                    },
                }
                : null,
        }));
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all Cabor data.');
    }
}

/**
 * Gets count of CaborProfiles pending verification (status PENDING with SK uploaded)
 * @returns Number of pending verifications ready for review
 */
export async function getPendingVerificationCount(): Promise<number> {
    noStore();

    try {
        const count = await prisma.caborProfile.count({
            where: {
                verification_status: 'PENDING',
                sk_file_url: {
                    not: null,
                },
            },
        });

        return count;
    } catch (error) {
        console.error('Database Error:', error);
        return 0; // Return 0 on error to prevent crashing the dashboard
    }
}
