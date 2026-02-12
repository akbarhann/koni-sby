import { auth } from '@/auth';
import { fetchCaborProfile } from '@/app/lib/data';
import { SignOut } from '@/components/auth/signout-button';
import ProfileForm from './profile-form';
import {
    Shield,
    ArrowLeft,
    Building2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function CaborProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="p-8 text-center text-red-600">
                Error: User session not found. Please login again.
            </div>
        );
    }

    // Fetch Cabor Profile
    const caborProfile = await fetchCaborProfile(session.user.id);

    if (!caborProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <Building2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Profil Tidak Ditemukan</h1>
                    <p className="text-gray-600 mb-6">
                        Akun Anda tidak terhubung dengan profil Cabang Olahraga manapun.
                    </p>
                    <SignOut />
                </div>
            </div>
        );
    }

    // Serialize BigInt to string for Client Component
    const serializedProfile = {
        id: caborProfile.id.toString(),
        nama_cabor: caborProfile.master_cabor.nama_cabor,
        description: caborProfile.description || '',
        alamat_sekretariat: caborProfile.alamat_sekretariat || '',
        email_resmi: caborProfile.email_resmi || '',
        nomor_telepon: caborProfile.nomor_telepon || '',
        sk_file_url: caborProfile.sk_file_url || '',
        sk_file_name: caborProfile.sk_file_name || '',
        sk_start_date: caborProfile.sk_start_date ? caborProfile.sk_start_date.toISOString().split('T')[0] : '',
        sk_end_date: caborProfile.sk_end_date ? caborProfile.sk_end_date.toISOString().split('T')[0] : '',
        rejection_reason: caborProfile.rejection_reason || null,

        // Social Media
        facebook_url: caborProfile.facebook_url || '',
        instagram_url: caborProfile.instagram_url || '',
        website_url: caborProfile.website_url || '',
        youtube_url: caborProfile.youtube_url || '',

        // Organization
        org_structure: caborProfile.org_structure || '',
        facilities: caborProfile.facilities || '',
        training_schedule: caborProfile.training_schedule || '[]',
        training_location: caborProfile.training_location || '',
        development_program: caborProfile.development_program || '',
        achievements: caborProfile.achievements || '',



        // Stats
        total_referees: caborProfile.total_referees,
        total_coaches: caborProfile.total_coaches,
        total_athletes_manual: caborProfile.total_athletes_manual,

        // AD/ART File
        ad_art_file_url: caborProfile.ad_art_file_url || '',
        ad_art_file_name: caborProfile.ad_art_file_name || '',
    };

    // DETERMINE EDIT MODE
    // If description exists and is not empty, we assume they have started filling it out.
    // We can be stricter if needed (e.g. check multiple fields)
    const isEditMode = !!(caborProfile.description && caborProfile.description.length > 5);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24">
                        <div className="flex items-center gap-3">
                            <div className="w-28 h-28 relative flex items-center justify-center">
                                <Image
                                    src="/img/logo/koni.svg"
                                    alt="Logo KONI"
                                    width={112}
                                    height={112}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">KONI Surabaya</h1>
                                <p className="text-xs text-gray-500">Panel Admin Cabor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-900">{session.user.username}</p>
                                <p className="text-xs text-gray-500">{session.user.email}</p>
                            </div>
                            <SignOut />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Link */}
                <Link
                    href="/dashboard/cabor"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Profil {serializedProfile.nama_cabor}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {isEditMode
                            ? "Anda dalam mode Edit. Navigasi bebas aktif."
                            : "Silahkan lengkapi data profil anda langkah demi langkah."}
                    </p>
                </div>

                {/* Profile Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-900">Form Profil Cabor</h2>
                    </div>
                    <ProfileForm profile={serializedProfile} isEditMode={isEditMode} />
                </div>
            </main>
        </div>
    );
}
