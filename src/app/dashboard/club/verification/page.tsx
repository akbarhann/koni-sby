'use client';

import { ShieldAlert, Inbox } from 'lucide-react';

export default function VerificationPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inbox Verifikasi</h1>
                    <p className="text-sm text-gray-500">Daftar pengajuan prestasi yang perlu ditindaklanjuti.</p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-8">
                <div className="text-center py-12">
                    <div className="relative inline-block">
                        <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">Tidak ada pengajuan prestasi baru</h3>
                    <p className="mt-2 text-sm text-gray-500">Semua pengajuan prestasi dari atlet akan muncul di sini.</p>
                </div>
            </div>
        </div>
    );
}
