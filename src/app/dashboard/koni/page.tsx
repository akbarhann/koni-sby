import { fetchKoniDashboardStats, fetchKoniInvitations, getPendingVerificationCount } from '@/app/lib/data';
import { auth } from '@/auth';
import TokenGenerator from '@/app/ui/dashboard/token-generator';
import VerificationAlert from '@/app/ui/dashboard/verification-alert';
import Link from 'next/link';
import Image from 'next/image';
import {
    Building2,
    Users,
    Trophy,
    Clock,
    Shield,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Building,
    ClipboardList
} from 'lucide-react';
import { SignOut } from '@/components/auth/signout-button';

// Helper function to format date
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        VERIFIED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        DRAFT: 'bg-gray-100 text-gray-800',
        SUBMITTED: 'bg-blue-100 text-blue-800',
    };

    const labels: Record<string, string> = {
        PENDING: 'Pending',
        VERIFIED: 'Terverifikasi',
        REJECTED: 'Ditolak',
        DRAFT: 'Draft',
        SUBMITTED: 'Menunggu',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
            {labels[status] || status}
        </span>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    color = 'red'
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    color?: 'red' | 'gold' | 'dark' | 'green';
}) {
    const colorStyles = {
        red: 'bg-koni-red/10 text-koni-red',
        gold: 'bg-koni-gold/20 text-yellow-700',
        dark: 'bg-koni-dark/10 text-koni-dark',
        green: 'bg-green-100 text-green-700',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-koni-dark">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

export default async function DashboardKoniPage() {
    const session = await auth();
    const stats = await fetchKoniDashboardStats();
    const invitations = await fetchKoniInvitations();
    const pendingVerificationCount = await getPendingVerificationCount();

    // Count pending verifications (active invitations not yet used)
    const pendingInvitations = invitations.filter(inv => inv.is_active && new Date(inv.expires_at) > new Date()).length;

    return (
        <div className="min-h-screen bg-koni-light">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
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
                                <h1 className="text-lg font-bold text-koni-dark">KONI Surabaya</h1>
                                <p className="text-xs text-gray-500">Super Admin Panel</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Halo, <span className="font-medium">{session?.user?.email}</span>
                            </span>
                            <SignOut />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-koni-dark">Dashboard Utama</h1>
                        <p className="mt-1 text-sm text-gray-500">Super Admin Area</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/dashboard/koni/cabor"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ClipboardList className="w-4 h-4" />
                            Data Cabor & Verifikasi
                        </Link>
                        <TokenGenerator />
                    </div>
                </div>

                {/* Pending Verification Alert */}
                <VerificationAlert count={pendingVerificationCount} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Cabor"
                        value={stats.total_cabor}
                        icon={Building2}
                        color="red"
                    />
                    <StatCard
                        title="Total Club"
                        value={stats.total_club}
                        icon={Users}
                        color="gold"
                    />
                    <StatCard
                        title="Total Atlet"
                        value={stats.total_athlete}
                        icon={Trophy}
                        color="dark"
                    />
                    <StatCard
                        title="Undangan Aktif"
                        value={pendingInvitations}
                        icon={Clock}
                        color="green"
                    />
                </div>

                {/* Recent Activity and Invitations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Club Registrations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-koni-dark flex items-center gap-2">
                                <Building className="w-5 h-5 text-koni-red" />
                                Pendaftaran Terbaru
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {stats.recent_activities.length > 0 ? (
                                stats.recent_activities.map((club) => (
                                    <div key={club.id.toString()} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-koni-gold/20 rounded-lg flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-yellow-700" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-koni-dark">{club.nama_club}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {club.parent_cabor?.master_cabor?.nama_cabor || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={club.verification_status} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-12 text-center text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Belum ada pendaftaran club</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Invitations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-koni-dark flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-koni-red" />
                                Riwayat Token Undangan
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {invitations.length > 0 ? (
                                invitations.slice(0, 5).map((invitation) => {
                                    const isExpired = new Date(invitation.expires_at) < new Date();
                                    const isUsed = !invitation.is_active;

                                    return (
                                        <div key={invitation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-mono font-medium text-koni-dark">
                                                        {invitation.token}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {invitation.deskripsi || 'Tanpa deskripsi'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {isUsed ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Digunakan
                                                        </span>
                                                    ) : isExpired ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Kadaluarsa
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                                            <Clock className="w-3 h-3" />
                                                            Aktif
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDate(invitation.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-6 py-12 text-center text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Belum ada token dibuat</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
