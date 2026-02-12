'use client';

import { Building, Save } from 'lucide-react';

export default function ClubSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profil & Pengaturan Club</h1>
                    <p className="text-sm text-gray-500">Perbarui informasi dasar club Anda.</p>
                </div>
                <button
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                >
                    <Save className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                    Simpan Perubahan
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6 space-y-6 opacity-60 pointer-events-none select-none relative">
                    {/* Overlay for visual effect */}
                    <div className="absolute inset-0 z-10"></div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">Nama Club</label>
                            <div className="mt-1">
                                <input type="text" className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50" value="Nama Club Anda" disabled />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Alamat Sekretariat</label>
                            <div className="mt-1">
                                <textarea rows={3} className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Alamat lengkap..."></textarea>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Ketua Club</label>
                            <div className="mt-1">
                                <input type="text" className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Sekretaris</label>
                            <div className="mt-1">
                                <input type="text" className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500 text-center italic">Form ini akan tersedia segera. Gunakan onboarding untuk pengaturan awal.</p>
                </div>
            </div>
        </div>
    );
}
