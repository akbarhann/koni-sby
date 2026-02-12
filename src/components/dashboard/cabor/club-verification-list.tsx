'use client';

import { useState } from 'react';
import { approveClub, rejectClub } from '@/app/lib/actions/cabor-club-verify';
import {
    CheckCircle,
    XCircle,
    Building,
    User,
    MapPin,
    AlertCircle,
    Loader2
} from 'lucide-react';

type PendingClub = {
    id: string;
    nama_club: string;
    nama_ketua: string | null;
    alamat_basecamp: string | null;
    jadwal_latihan: string | null;
    lokasi_latihan: string | null;
    verification_status: string;
    user: {
        email: string;
        username: string;
    };
};

export default function ClubVerificationList({ clubs }: { clubs: PendingClub[] }) {
    const [isRejecting, setIsRejecting] = useState<string | null>(null); // Club ID being rejected
    const [isApproving, setIsApproving] = useState<string | null>(null); // Club ID being approved
    const [rejectReason, setRejectReason] = useState('');
    const [loading, setLoading] = useState<string | null>(null); // Club ID being processed
    const [expandedClubId, setExpandedClubId] = useState<string | null>(null); // Club ID showing details

    const toggleDetails = (clubId: string) => {
        setExpandedClubId(expandedClubId === clubId ? null : clubId);
    };

    const handleApprove = (clubId: string) => {
        setIsApproving(clubId);
    };

    const confirmApprove = async () => {
        if (!isApproving) return;
        setLoading(isApproving);
        const res = await approveClub(isApproving);
        if (!res.success) {
            alert(res.error || 'Gagal menyetujui club.');
        }
        setLoading(null);
        setIsApproving(null);
    };

    const handleReject = async () => {
        if (!isRejecting || !rejectReason.trim()) return;
        setLoading(isRejecting);
        const res = await rejectClub(isRejecting, rejectReason);
        if (!res.success) {
            alert(res.error || 'Gagal menolak club.');
        }
        setLoading(null);
        setIsRejecting(null);
        setRejectReason('');
    };

    // Helper to parse schedule
    const parseSchedule = (jsonString: string | null) => {
        if (!jsonString) return [];
        try {
            return JSON.parse(jsonString) as { day: string; start: string; end: string }[];
        } catch (e) {
            return [];
        }
    };

    if (clubs.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada antrian</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Semua club telah diverifikasi.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
                <div key={club.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300">
                    <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1" title={club.nama_club}>
                                        {club.nama_club}
                                    </h3>
                                    <p className="text-xs text-gray-500">{club.user.email}</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                {club.verification_status}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 mt-0.5 text-gray-400" />
                                <span>Ketua: {club.nama_ketua || '-'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                <span className="line-clamp-2">{club.alamat_basecamp || '-'}</span>
                            </div>
                        </div>

                        {/* Expandable Details Section */}
                        {expandedClubId === club.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lokasi Latihan</p>
                                    <p className="text-sm text-gray-700">{club.lokasi_latihan || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Jadwal Latihan</p>
                                    <div className="space-y-1">
                                        {parseSchedule(club.jadwal_latihan).length > 0 ? (
                                            parseSchedule(club.jadwal_latihan).map((s, idx) => (
                                                <div key={idx} className="text-sm text-gray-700 flex justify-between">
                                                    <span>{s.day}</span>
                                                    <span className="text-gray-500">{s.end}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Tidak ada jadwal</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => toggleDetails(club.id)}
                            className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
                        >
                            {expandedClubId === club.id ? 'Sembunyikan Detail' : 'Lihat Detail'}
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${expandedClubId === club.id ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-2">
                        <button
                            onClick={() => handleApprove(club.id)}
                            disabled={loading === club.id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading === club.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" /> Terima
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setIsRejecting(club.id)}
                            disabled={loading === club.id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4" /> Tolak
                        </button>
                    </div>
                </div>
            ))}

            {/* Approval Dialog */}
            {isApproving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Terima Club?</h3>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Apakah Anda yakin ingin menerima club ini sebagai anggota resmi KONI?
                            <br />
                            <span className="font-medium text-gray-900">
                                {clubs.find(c => c.id === isApproving)?.nama_club}
                            </span>
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setIsApproving(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmApprove}
                                disabled={loading !== null}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 w-full flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Terima Club'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Dialog */}
            {isRejecting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Tolak Club</h3>
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Silakan masukkan alasan penolakan untuk club <span className="font-medium text-gray-900">{clubs.find(c => c.id === isRejecting)?.nama_club}</span>.
                        </p>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            placeholder="Contoh: Dokumen legalitas tidak lengkap..."
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => { setIsRejecting(null); setRejectReason(''); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || loading !== null}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 w-full flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Penolakan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
