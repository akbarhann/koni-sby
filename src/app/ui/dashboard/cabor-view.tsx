'use client';

import { useState } from 'react';
import {
    Trophy,
    AlertCircle,
    Search,
    FileText,
    ChevronRight,
    Building,
    User,
    MapPin
} from 'lucide-react';
import ClubVerificationList from '@/components/dashboard/cabor/club-verification-list';

// Types for props
type Club = {
    id: string;
    nama_club: string;
    nama_ketua: string | null;
    alamat_basecamp: string | null;
    jadwal_latihan: string | null;
    lokasi_latihan: string | null;
    user: {
        email: string;
        username: string;
    };
    created_at?: Date;
    verification_status: string;
};

type Achievement = {
    id: string;
    nama_kejuaraan: string;
    tingkat: string;
    peringkat: number;
    tahun: number;
    verification_status: string;
    athlete: {
        nama_lengkap: string;
        club: {
            nama_club: string;
        };
    };
};

interface CaborDashboardViewProps {
    clubs: Club[];
    achievements: Achievement[];
}

export default function CaborDashboardView({ clubs, achievements }: CaborDashboardViewProps) {
    const [activeTab, setActiveTab] = useState<'verification' | 'clubs'>('verification');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);

    // Helper to parse schedule
    const parseSchedule = (jsonString: string | null) => {
        if (!jsonString) return [];
        try {
            return JSON.parse(jsonString) as { day: string; start: string; end: string }[];
        } catch (e) {
            return [];
        }
    };

    // Filter logic
    const filteredAchievements = achievements.filter(item =>
        item.nama_kejuaraan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.athlete.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.athlete.club.nama_club.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClubs = clubs.filter(club =>
        club.nama_club.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter pending clubs for verification
    const pendingClubs = clubs.filter(c => c.verification_status === 'PENDING');

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('verification'); setSearchQuery(''); }}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                            ${activeTab === 'verification'
                                ? 'border-yellow-500 text-yellow-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Antrian Verifikasi
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === 'verification' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-900'
                            }`}>
                            {achievements.length + pendingClubs.length}
                        </span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('clubs'); setSearchQuery(''); }}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                            ${activeTab === 'clubs'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        <Building className="w-4 h-4" />
                        Data Club
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === 'clubs' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                            }`}>
                            {clubs.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={activeTab === 'verification' ? "Cari antrian (Kejuaraan, Atlet, Club)..." : "Cari club (Nama, Email)..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'verification' && (
                    <div className="space-y-8">
                        {/* 1. Pending Club Verifications */}
                        {pendingClubs.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Building className="w-5 h-5 text-gray-500" />
                                    Verifikasi Club Baru
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                        {pendingClubs.length}
                                    </span>
                                </h3>
                                <ClubVerificationList clubs={pendingClubs} />
                            </div>
                        )}

                        {/* 2. Pending Achievements Verifications */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-gray-500" />
                                Verifikasi Prestasi Atlet
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                    {filteredAchievements.length}
                                </span>
                            </h3>

                            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                                {filteredAchievements.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kejuaraan</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atlet / Club</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Aksi</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredAchievements.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                                <Trophy className="h-5 w-5 text-yellow-600" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{item.nama_kejuaraan}</div>
                                                                <div className="text-xs text-gray-500">Juara {item.peringkat} - {item.tahun}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{item.athlete.nama_lengkap}</div>
                                                        <div className="text-xs text-gray-500">{item.athlete.club.nama_club}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {item.tingkat}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.verification_status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                                                                item.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {item.verification_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1">
                                                            Review <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto h-12 w-12 text-gray-300" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada antrian verifikasi prestasi.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'clubs' && (
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                        {filteredClubs.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Club</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun Admin</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClubs.map((club) => (
                                        <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Building className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{club.nama_club}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{club.user.username}</div>
                                                <div className="text-sm text-gray-500">{club.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${club.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {club.verification_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedClub(club)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <Building className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada club terdaftar.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Club Details Modal */}
            {selectedClub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Building className="w-6 h-6 text-blue-600" />
                                {selectedClub.nama_club}
                            </h3>
                            <button
                                onClick={() => setSelectedClub(null)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Status Section */}
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Status Verifikasi</p>
                                    <span className={`px-2 py-1 mt-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${selectedClub.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                            selectedClub.verification_status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {selectedClub.verification_status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Bergabung Sejak</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedClub.created_at ? new Date(selectedClub.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        }) : '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Organization Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Informasi Organisasi</h4>
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-xs text-gray-500">Ketua Club</dt>
                                            <dd className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {selectedClub.nama_ketua || '-'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-500">Alamat Basecamp</dt>
                                            <dd className="text-sm text-gray-900 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                {selectedClub.alamat_basecamp || '-'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Kontak Admin</h4>
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-xs text-gray-500">Username</dt>
                                            <dd className="text-sm font-medium text-gray-900">{selectedClub.user.username}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{selectedClub.user.email}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Training Details */}
                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Informasi Latihan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Lokasi Latihan</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {selectedClub.lokasi_latihan || 'Belum diisi'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Jadwal Latihan</p>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                                            {parseSchedule(selectedClub.jadwal_latihan).length > 0 ? (
                                                parseSchedule(selectedClub.jadwal_latihan).map((s, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="font-medium text-gray-700">{s.day}</span>
                                                        <span className="text-gray-600">{s.start} - {s.end}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">Tidak ada jadwal</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setSelectedClub(null)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
