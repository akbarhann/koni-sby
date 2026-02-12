import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean up "Test/Garbage" Cabor Accounts
 * 
 * Usage:
 * npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/clean-cabor-data.ts
 * 
 * Logic:
 * 1. Delete all CaborProfile records.
 * 2. Delete all User records WHERE role is 'ADMIN_CABOR'.
 *    - EXPLICITLY EXCLUDES 'admin@koni-surabaya.go.id' just in case.
 *    - EXPLICITLY EXCLUDES role 'ADMIN_KONI'.
 */
async function main() {
    console.log('🚀 Starting Cabor Data Cleanup...');

    try {
        // Step 1: Delete all CaborProfiles
        // Since onDelete: Cascade is likely set on User -> CaborProfile, deleting users might be enough,
        // but deleting profiles first ensures we clear that data specifically as requested.
        console.log('Deleting Cabor Profiles...');
        const deletedProfiles = await prisma.caborProfile.deleteMany({});
        console.log(`✅ Deleted ${deletedProfiles.count} Cabor Profiles.`);

        // Step 2: Delete Users with role ADMIN_CABOR
        // CRITICAL: Ensure we DO NOT delete the Super Admin or other important roles.
        console.log('Deleting Cabor Admin Accounts...');
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                role: 'ADMIN_CABOR', // Only target Cabor Admins
                NOT: {
                    email: 'admin@koni-surabaya.go.id', // Double safety: Never delete the main admin email
                },
            },
        });

        console.log(`✅ Deleted ${deletedUsers.count} Cabor Admin Users.`);
        console.log('🎉 Cleanup complete. KONI Admin preserved.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
