import { auth } from '@/auth';
import {
    fetchCaborProfile,
    fetchCaborDashboardStats,
    fetchCaborClubs,
    fetchCaborVerificationQueue
} from '@/app/lib/data';
import { SignOut } from '@/components/auth/signout-button';
import ClubTokenGenerator from '@/app/ui/dashboard/club-token-generator';
import CaborDashboardView from '@/app/ui/dashboard/cabor-view';
import Link from 'next/link';
import Image from 'next/image';
import {
    Users,
    Trophy,
    AlertTriangle,
    Shield,
    ArrowRight
} from 'lucide-react';

// Helper for status badge - simple version for header
function VerificationAlert({ status, rejectionReason, skFileUrl }: { status: string, rejectionReason?: string | null, skFileUrl?: string | null }) {
    if (status === 'VERIFIED') return null;

    if (status === 'REJECTED') {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Verifikasi Ditolak</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p className="mb-2">
                                    Dokumen Anda ditolak dengan alasan:
                                </p>
                                <p className="font-medium italic bg-red-100 p-2 rounded border border-red-200">
                                    "{rejectionReason || 'Tidak ada alasan spesifik.'}"
                                </p>
                                <p className="mt-2">
                                    Silakan perbaiki dokumen Anda dan upload ulang.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/cabor/profile"
                        className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-lg transition-colors self-start sm:self-center"
                    >
                        Perbaiki Dokumen
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    // Condition 1: Data Submitted but Pending (Waiting for Approval)
    if (status === 'PENDING' && skFileUrl) {
        return (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-blue-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Menunggu Verifikasi</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Data Anda telah terkirim. Harap menunggu verifikasi dari Admin KONI.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/cabor/profile"
                        className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        ✏️ Edit Data
                    </Link>
                </div>
            </div>
        );
    }

    // Condition 2: Data Empty/Incomplete
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <span className="font-medium">Perhatian:</span> Profil Cabor Anda belum lengkap.
                            Silakan lengkapi data organisasi.
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/cabor/profile"
                    className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                >
                    Lengkapi Data Sekarang
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    color = 'blue'
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    color?: 'blue' | 'yellow' | 'green';
}) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        green: 'bg-green-50 text-green-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

export default async function DashboardCaborPage() {
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
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Profil Tidak Ditemukan</h1>
                    <p className="text-gray-600 mb-6">
                        Akun Anda tidak terhubung dengan profil Cabang Olahraga manapun.
                        Silakan hubungi Super Admin KONI.
                    </p>
                    <SignOut />
                </div>
            </div>
        );
    }

    const caborId = Number(caborProfile.id);

    // Fetch Stats & Data concurrently
    const [stats, clubs, achievements] = await Promise.all([
        fetchCaborDashboardStats(caborId),
        fetchCaborClubs(caborId),
        fetchCaborVerificationQueue(caborId)
    ]);

    // Serialize BigInt to string for Client Component
    const serializedClubs = clubs.map((club: any) => ({
        ...club,
        id: club.id.toString(),
    }));

    const serializedAchievements = achievements.map((item: any) => ({
        ...item,
        id: item.id.toString(),
    }));

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard {caborProfile.master_cabor.nama_cabor}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola data club dan verifikasi atlet
                        </p>
                    </div>
                    <div>
                        <ClubTokenGenerator
                            caborId={caborProfile.id.toString()}
                            isVerified={caborProfile.verification_status === 'VERIFIED'}
                        />
                    </div>
                </div>

                {/* Verification Alert */}
                <VerificationAlert
                    status={caborProfile.verification_status}
                    rejectionReason={caborProfile.rejection_reason}
                    skFileUrl={caborProfile.sk_file_url}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Club"
                        value={stats.total_club}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Total Atlet"
                        value={stats.total_athlete}
                        icon={Trophy}
                        color="green"
                    />
                    <StatCard
                        title="Menunggu Verifikasi"
                        value={stats.verification_queue}
                        icon={AlertTriangle}
                        color="yellow"
                    />
                </div>

                {/* Main Client View (Tabs & Tables) */}
                <CaborDashboardView clubs={serializedClubs} achievements={serializedAchievements} />
            </main>
        </div>
    );
}
