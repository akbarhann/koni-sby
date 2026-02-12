'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitClubOnboarding } from '@/app/lib/actions/club-onboarding';
import { Plus, Trash2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
            {pending ? 'Menyimpan...' : 'Simpan Data & Lanjutkan'}
        </button>
    );
}

export default function ClubOnboardingForm({
    clubName,
    initialData,
}: {
    clubName: string;
    initialData?: any; // Use proper type if available, but any works for now to avoid type hell with Prisma types in client component
}) {
    const [state, dispatch] = useActionState(submitClubOnboarding, {});

    // Schedule State
    const [schedules, setSchedules] = useState<{ day: string; start: string; end: string }[]>(
        initialData?.jadwal_latihan ? JSON.parse(initialData.jadwal_latihan) : []
    );
    const [newSchedule, setNewSchedule] = useState({ day: 'Senin', start: '', end: '' });

    const addSchedule = () => {
        if (newSchedule.day && newSchedule.start && newSchedule.end) {
            setSchedules([...schedules, newSchedule]);
            setNewSchedule({ day: 'Senin', start: '', end: '' });
        }
    };

    const removeSchedule = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const isRejected = initialData?.verification_status === 'REJECTED';

    return (
        <form action={dispatch} className="space-y-6">
            {isRejected && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Pendaftaran Ditolak</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Alasan penolakan: <strong>{initialData.rejection_reason}</strong></p>
                                <p className="mt-1">Silakan perbaiki data di bawah ini dan ajukan kembali.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="nama_club" className="block text-sm font-medium text-gray-700">
                    Nama Club
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="nama_club"
                        id="nama_club"
                        value={clubName}
                        disabled
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-gray-100 text-gray-500"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="nama_ketua" className="block text-sm font-medium text-gray-700">
                    Nama Ketua
                </label>
                <div className="mt-1">
                    <input
                        id="nama_ketua"
                        name="nama_ketua"
                        type="text"
                        required
                        defaultValue={initialData?.nama_ketua || ''}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                </div>
                {state.fieldErrors?.nama_ketua && (
                    <p className="mt-2 text-sm text-red-600">{state.fieldErrors.nama_ketua[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="nama_sekretaris" className="block text-sm font-medium text-gray-700">
                    Nama Sekretaris
                </label>
                <div className="mt-1">
                    <input
                        id="nama_sekretaris"
                        name="nama_sekretaris"
                        type="text"
                        required
                        defaultValue={initialData?.nama_sekretaris || ''}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                </div>
                {state.fieldErrors?.nama_sekretaris && (
                    <p className="mt-2 text-sm text-red-600">{state.fieldErrors.nama_sekretaris[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="alamat_basecamp" className="block text-sm font-medium text-gray-700">
                    Alamat Sekretariat
                </label>
                <div className="mt-1">
                    <textarea
                        id="alamat_basecamp"
                        name="alamat_basecamp"
                        rows={3}
                        required
                        defaultValue={initialData?.alamat_basecamp || ''}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                </div>
                {state.fieldErrors?.alamat_basecamp && (
                    <p className="mt-2 text-sm text-red-600">{state.fieldErrors.alamat_basecamp[0]}</p>
                )}
            </div>

            {/* Dynamic Jadwal Latihan */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Jadwal Latihan</label>
                <input type="hidden" name="jadwal_latihan" value={JSON.stringify(schedules)} />

                <div className="mt-1 p-4 bg-gray-50 rounded-md border border-gray-300 space-y-4">
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Hari</label>
                            <select
                                value={newSchedule.day}
                                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            >
                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-2/3 flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Mulai</label>
                                <input
                                    type="time"
                                    value={newSchedule.start}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, start: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                            <span className="self-center pb-2 text-gray-500">-</span>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Selesai</label>
                                <input
                                    type="time"
                                    value={newSchedule.end}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, end: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addSchedule}
                                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex-shrink-0 h-[38px]"
                                title="Tambah Jadwal"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {schedules.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                <span className="text-sm text-gray-700">
                                    {s.day}, {s.start} - {s.end}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeSchedule(i)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {schedules.length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-2">Belum ada jadwal latihan yang ditambahkan.</p>
                        )}
                    </div>
                </div>
                {state.fieldErrors?.jadwal_latihan && (
                    <p className="mt-2 text-sm text-red-600">{state.fieldErrors.jadwal_latihan[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="lokasi_latihan" className="block text-sm font-medium text-gray-700">
                    Tempat Latihan
                </label>
                <div className="mt-1">
                    <input
                        id="lokasi_latihan"
                        name="lokasi_latihan"
                        type="text"
                        required
                        defaultValue={initialData?.lokasi_latihan || ''}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                </div>
                {state.fieldErrors?.lokasi_latihan && (
                    <p className="mt-2 text-sm text-red-600">{state.fieldErrors.lokasi_latihan[0]}</p>
                )}
            </div>

            {state.error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{state.error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                    {isRejected ? 'Ajukan Ulang / Resubmit' : 'Simpan Data & Lanjutkan'}
                </button>
            </div>
        </form>
    );
}
