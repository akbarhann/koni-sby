import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ClubSidebar from '@/components/dashboard/club-sidebar';
import ClubHeader from '@/components/dashboard/club-header';

export default async function ClubDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Gatekeeper: Check if Club Admin is onboarded
    const clubProfile = await prisma.clubProfile.findUnique({
        where: { user_id: BigInt(session.user.id) },
        select: {
            nama_club: true,
            is_onboarded: true,
            verification_status: true, // Fetch verification status
        },
    });

    // If no profile found OR not onboarded OR rejected, redirect to onboarding
    if (!clubProfile || !clubProfile.is_onboarded || clubProfile.verification_status === 'REJECTED') {
        redirect('/onboarding/club');
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <ClubSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <ClubHeader
                    clubName={clubProfile.nama_club}
                    userName={session.user.name || session.user.email || 'Admin'}
                />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
