import { auth } from '@/auth';
import { getAllCaborData } from '@/app/lib/data';
import { SignOut } from '@/components/auth/signout-button';
import CaborTable from '@/app/ui/dashboard/cabor-table';
import {
    Shield,
    ArrowLeft,
    ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function KoniCaborPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="p-8 text-center text-red-600">
                Error: User session not found. Please login again.
            </div>
        );
    }

    // Fetch all Cabor data
    const cabors = await getAllCaborData();

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
                                <p className="text-xs text-gray-500">Panel Super Admin</p>
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
                {/* Back Link */}
                <Link
                    href="/dashboard/koni"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <ClipboardList className="w-8 h-8 text-red-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Manajemen & Verifikasi Cabor
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-11">
                        Kelola dan verifikasi cabang olahraga yang terdaftar di KONI Surabaya
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500 mb-1">Total Cabor</p>
                        <p className="text-2xl font-bold text-gray-900">{cabors.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500 mb-1">Terverifikasi</p>
                        <p className="text-2xl font-bold text-green-600">
                            {cabors.filter(c => c.profile?.verification_status === 'VERIFIED').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500 mb-1">Menunggu Verifikasi</p>
                        <p className="text-2xl font-bold text-amber-600">
                            {cabors.filter(c => c.profile && c.profile.verification_status === 'PENDING' && c.profile.sk_file_url).length}
                        </p>
                    </div>
                </div>

                {/* Cabor Table */}
                <CaborTable cabors={cabors} />
            </main>
        </div>
    );
}
