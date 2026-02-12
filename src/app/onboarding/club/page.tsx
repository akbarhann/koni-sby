import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { submitClubOnboarding } from '@/app/lib/actions/club-onboarding';
// Actually, I should check the export name. I exported `submitClubOnboarding`.
// Also, I need to create a client component for the form or make this file a client component if it uses useFormState.
// Since it needs to be interactive, I'll make a separate client form component or just make this page a server component that renders a client form.
// For simplicity and cleaner separation, I will create a client component for the form.

export const metadata: Metadata = {
    title: 'Club Onboarding | KONI Surabaya',
    description: 'Lengkapi data club Anda',
};

async function getClubData() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const club = await prisma.clubProfile.findUnique({
        where: { user_id: BigInt(session.user.id) },
        select: {
            nama_club: true,
            is_onboarded: true,
            verification_status: true,
            rejection_reason: true,
            nama_ketua: true,
            nama_sekretaris: true,
            alamat_basecamp: true,
            jadwal_latihan: true,
            lokasi_latihan: true,
        },
    });

    return club;
}

import ClubOnboardingForm from './club-onboarding-form';

export default async function ClubOnboardingPage() {
    const club = await getClubData();

    if (!club) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Data Club Tidak Ditemukan</h2>
                        <p className="text-gray-600 mb-6">
                            Terjadi kesalahan pada data akun Anda. Profil Club tidak ditemukan.
                            Hal ini mungkin terjadi karena kesalahan saat registrasi.
                        </p>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Silakan hubungi Admin KONI atau coba registrasi ulang dengan akun baru.
                            </p>
                            <form action={async () => {
                                'use server';
                                await import('@/app/lib/actions').then(m => m.signOutAction());
                            }}>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Keluar / Login Ulang
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (club.is_onboarded && club.verification_status !== 'REJECTED') {
        redirect('/dashboard/club');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {club.verification_status === 'REJECTED' ? 'Perbaiki Data Club' : `Selamat Datang, ${club.nama_club}!`}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {club.verification_status === 'REJECTED'
                        ? 'Mohon perbaiki data sesuai catatan penolakan.'
                        : 'Silakan lengkapi data club Anda sebelum melanjutkan.'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <ClubOnboardingForm
                        clubName={club.nama_club}
                        initialData={club.verification_status === 'REJECTED' ? club : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
