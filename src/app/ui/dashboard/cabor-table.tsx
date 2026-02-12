'use client';

import { useState } from 'react';
import { verifyCabor } from '@/app/lib/actions';
import { VerificationStatus } from '@prisma/client';
import {
    Check,
    Clock,
    ExternalLink,
    FileText,
    Loader2,
    ShieldCheck,
    Upload,
    User,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import CaborRejectionDialog from './cabor-rejection-dialog';

type CaborData = {
    id: string;
    nama_cabor: string;
    is_verified: boolean;
    profile: {
        id: string;
        verification_status: VerificationStatus;
        sk_file_url: string | null;
        sk_file_name: string | null;
        ad_art_file_url: string | null;
        ad_art_file_name: string | null;
        description: string | null;
        admin: {
            id: string;
            email: string;
            username: string;
        };
    } | null;
};

interface CaborTableProps {
    cabors: CaborData[];
}

export default function CaborTable({ cabors }: CaborTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (profileId: string) => {
        setLoadingId(profileId);
        setError(null);

        try {
            const result = await verifyCabor(profileId);
            if (result.success) {
                setSuccessId(profileId);
                setTimeout(() => setSuccessId(null), 3000);
            } else {
                setError(result.error || 'Gagal memverifikasi');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusBadge = (status: VerificationStatus | null) => {
        if (status === 'VERIFIED') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Terverifikasi
                </span>
            );
        }
        if (status === 'REJECTED') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Ditolak
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                <Clock className="w-3 h-3" />
                Pending
            </span>
        );
    };

    const getActionButton = (cabor: CaborData) => {
        if (!cabor.profile) {
            return (
                <span className="text-xs text-gray-400 italic">
                    Belum ada admin
                </span>
            );
        }

        const { id: profileId, verification_status, sk_file_url } = cabor.profile;

        // Already verified
        if (verification_status === 'VERIFIED' || successId === profileId) {
            return (
                <button
                    disabled
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg cursor-not-allowed"
                >
                    <Check className="w-3.5 h-3.5" />
                    Terverifikasi
                </button>
            );
        }

        // SK not uploaded yet
        if (!sk_file_url) {
            return (
                <button
                    disabled
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                    <Upload className="w-3.5 h-3.5" />
                    Menunggu SK
                </button>
            );
        }

        // Ready to verify
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleVerify(profileId)}
                    disabled={loadingId === profileId}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loadingId === profileId ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verifikasi
                        </>
                    )}
                </button>

                <CaborRejectionDialog
                    caborProfileId={profileId}
                    caborName={cabor.nama_cabor}
                    onSuccess={() => { }} // Revalidation is handled in action
                    trigger={
                        <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                        </button>
                    }
                />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {error && (
                <div className="p-3 m-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nama Cabor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Ketua / Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Dokumen SK
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Dokumen AD/ART
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cabors.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Belum ada data Cabor terdaftar.
                                </td>
                            </tr>
                        ) : (
                            cabors.map((cabor) => (
                                <tr key={cabor.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Nama Cabor */}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {cabor.nama_cabor}
                                        </div>
                                    </td>

                                    {/* Ketua / Admin */}
                                    <td className="px-6 py-4">
                                        {cabor.profile ? (
                                            <div className="flex items-start gap-2">
                                                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {cabor.profile.admin.username}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {cabor.profile.admin.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">
                                                Belum terdaftar
                                            </span>
                                        )}
                                    </td>

                                    {/* Dokumen SK */}
                                    <td className="px-6 py-4">
                                        {cabor.profile?.sk_file_url ? (
                                            <a
                                                href={cabor.profile.sk_file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Lihat PDF
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                                                <FileText className="w-4 h-4" />
                                                Belum Upload
                                            </span>
                                        )}
                                    </td>

                                    {/* Dokumen AD/ART */}
                                    <td className="px-6 py-4">
                                        {cabor.profile?.ad_art_file_url ? (
                                            <a
                                                href={cabor.profile.ad_art_file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Lihat PDF
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                                                <FileText className="w-4 h-4" />
                                                Belum Upload
                                            </span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        {cabor.profile
                                            ? getStatusBadge(successId === cabor.profile.id ? 'VERIFIED' : cabor.profile.verification_status)
                                            : getStatusBadge(null)
                                        }
                                    </td>

                                    {/* Aksi */}
                                    <td className="px-6 py-4 text-center">
                                        {getActionButton(cabor)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
