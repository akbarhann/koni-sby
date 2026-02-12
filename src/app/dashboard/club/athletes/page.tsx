import { Suspense } from 'react';
import { getAthletesByClub, type Athlete } from '@/app/lib/actions/athlete-actions';
import { AthleteFormDialog } from '@/components/dashboard/club/athlete-form-dialog';
import { AthleteImportDialog } from '@/components/dashboard/club/athlete-import-dialog';
import { AthleteActionsCell } from '@/components/dashboard/club/athlete-actions-cell';
import { Button } from '@/components/ui/button';
import { Users, Filter } from 'lucide-react';
import Search from '@/components/ui/search';
import Pagination from '@/components/ui/pagination';
import { AthleteFilter } from '@/components/dashboard/club/athlete-filter';

export const dynamic = 'force-dynamic';

export default async function AthleteManagementPage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        gender?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const gender = searchParams?.gender || 'all';

    const { athletes, totalPages, totalCount } = await getAthletesByClub(query, currentPage, gender);

    const itemsPerPage = 10;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);

    return (
        <div className="space-y-8 bg-gray-50/50 min-h-screen p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Atlet</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola data atlet, riwayat prestasi, dan informasi fisik klub Anda.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <AthleteImportDialog />
                    <AthleteFormDialog />
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar (Search, etc.) */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-center flex-1">
                        <div className="w-full sm:max-w-xs">
                            <Search placeholder="Cari nama atau NIK..." />
                        </div>
                        <div className="w-full sm:w-auto">
                            <AthleteFilter />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-right">
                        Total: <span className="font-semibold text-gray-900">{totalCount}</span> Atlet
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="h-10 px-6 py-3 align-middle font-medium text-xs text-gray-500 uppercase tracking-wider w-[180px]">
                                    NIK
                                </th>
                                <th className="h-10 px-6 py-3 align-middle font-medium text-xs text-gray-500 uppercase tracking-wider">
                                    Nama Lengkap
                                </th>
                                <th className="h-10 px-6 py-3 align-middle font-medium text-xs text-gray-500 uppercase tracking-wider w-[150px]">
                                    Gender
                                </th>
                                <th className="h-10 px-6 py-3 align-middle font-medium text-xs text-gray-500 uppercase tracking-wider w-[120px]">
                                    Usia
                                </th>
                                <th className="h-10 px-6 py-3 align-middle font-medium text-xs text-gray-500 uppercase tracking-wider w-[120px] text-right">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {athletes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="p-4 bg-gray-50 rounded-full border border-gray-100">
                                                <Users className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-base font-medium text-gray-900">
                                                {query ? 'Tidak ada data ditemukan' : 'Belum ada data atlet'}
                                            </h3>
                                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                                {query
                                                    ? `Tidak ada atlet yang cocok dengan pencarian "${query}"`
                                                    : 'Mulai tambahkan atlet ke dalam sistem untuk mengelola data mereka dengan lebih mudah.'
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                athletes.map((athlete: Athlete) => {
                                    const dob = new Date(athlete.tgl_lahir);
                                    const age = new Date().getFullYear() - dob.getFullYear();

                                    return (
                                        <tr
                                            key={athlete.id}
                                            className="transition-colors hover:bg-gray-50/80 group"
                                        >
                                            <td className="p-6 align-middle font-medium text-gray-900 font-mono text-xs tracking-wide">
                                                {athlete.nik}
                                            </td>
                                            <td className="p-6 align-middle text-gray-900 font-medium">
                                                {athlete.nama}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${athlete.jenis_kelamin === 'MALE'
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    : 'bg-pink-50 text-pink-700 border border-pink-100'
                                                    }`}>
                                                    {athlete.jenis_kelamin === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                                </span>
                                            </td>
                                            <td className="p-6 align-middle text-gray-600 text-sm">
                                                {age} Tahun
                                            </td>
                                            <td className="p-6 align-middle text-right">
                                                <AthleteActionsCell athlete={athlete} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > 0 && (
                    <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Menampilkan <strong>{startItem}-{endItem}</strong> dari <strong>{totalCount}</strong> data
                        </span>
                        <Pagination totalPages={totalPages} />
                    </div>
                )}

            </div>
        </div>
    );
}
