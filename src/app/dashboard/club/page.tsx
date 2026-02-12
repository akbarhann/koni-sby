
import { auth } from "@/auth";
import { SignOut } from "@/components/auth/signout-button";
import { fetchClubProfile } from "@/app/lib/data";
import {
    AlertTriangle,
    ShieldCheck,
    ShieldAlert,
    CheckCircle,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardClubPage() {
    const session = await auth();

    if (!session?.user?.id) return null;

    const clubProfile = await fetchClubProfile(session.user.id);

    // If no profile, they should be redirected to onboarding (middleware/layout should handle this, 
    // but just in case, we can show a message or redirect)
    if (!clubProfile) {
        redirect('/dashboard/club/onboarding'); // Assuming this exists or handled by layout
    }

    const { verification_status, rejection_reason } = clubProfile;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard Club: {clubProfile.nama_club}
                </h1>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                    <SignOut />
                </div>
            </div>

            {/* PENDING ALERT */}
            {verification_status === 'PENDING' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ShieldAlert className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-800">
                                Pendaftaran Sedang Diverifikasi
                            </h3>
                            <p className="mt-1 text-yellow-700">
                                Data pendaftaran Anda sedang diperiksa oleh Admin Cabor (<strong>{clubProfile.parent_cabor?.verification_status === 'VERIFIED' ? 'Cabor Terverifikasi' : 'Admin Cabor'}</strong>).
                                Mohon tunggu proses verifikasi 1x24 jam. Anda akan menerima notifikasi jika status berubah.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECTED ALERT */}
            {verification_status === 'REJECTED' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">
                                    Pendaftaran Ditolak
                                </h3>
                                <div className="mt-2 space-y-2">
                                    <p className="text-red-700">
                                        Maaf, pendaftaran club Anda ditolak dengan alasan berikut:
                                    </p>
                                    <div className="p-3 bg-white border border-red-200 rounded-lg text-red-900 font-medium italic">
                                        "{rejection_reason || 'Tidak ada alasan spesifik.'}"
                                    </div>
                                    <p className="text-sm text-red-600 mt-2">
                                        Silakan perbaiki data Anda dan ajukan kembali.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/club/settings"
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Perbaiki Data
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* VERIFIED DASHBOARD (Normal Content) */}
            {verification_status === 'VERIFIED' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">Akun Terverifikasi</h3>
                            <p className="text-green-700">Club Anda resmi terdaftar dan aktif.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Placeholder Widgets */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Total Atlet</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{clubProfile.athletes?.length || 0}</p>
                        </div>
                        {/* Add more widgets here */}
                    </div>
                </div>
            )}
        </div>
    );
}
