'use client';

import { useState } from 'react';
import { createClubInvitation } from '@/app/lib/actions';
import {
    Plus,
    Copy,
    Check,
    AlertCircle,
    Loader2,
    X,
    Ticket
} from 'lucide-react';

export default function ClubTokenGenerator({ caborId, isVerified }: { caborId: string, isVerified: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedToken(null);

        try {
            const result = await createClubInvitation(caborId);

            if (result.success && result.token) {
                setGeneratedToken(result.token);
            } else {
                setError(result.error || 'Gagal membuat token club.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (generatedToken) {
            await navigator.clipboard.writeText(generatedToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setGeneratedToken(null);
        setError(null);
    };

    if (!isVerified) {
        return (
            <div className="relative group">
                <button
                    disabled
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium shadow-sm cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Buat Token Club
                </button>
                <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Menunggu verifikasi Admin KONI. Dokumen (SK & AD/ART) harus diverifikasi terlebih dahulu.
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm 
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Buat Token Club
            </button>

            {/* Modal Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={handleClose}
                >
                    {/* Modal Content */}
                    <div
                        className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Ticket className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Token Registrasi Club
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {!generatedToken ? (
                                <>
                                    <p className="text-gray-600">
                                        Token ini akan digunakan oleh pengurus club untuk mendaftarkan akun mereka.
                                    </p>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-medium">Masa Berlaku: 7 Hari</p>
                                            <p className="mt-1">Pastikan token segera diberikan kepada pengurus club.</p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg animate-in slide-in-from-top-2">
                                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-center py-2">
                                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 animate-in zoom-in duration-300">
                                            <Check className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">Token Berhasil Dibuat!</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Bagikan token ini kepada pengurus club yang akan mendaftar.
                                        </p>
                                    </div>

                                    {/* Token Display */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <code className="relative text-xl font-mono font-bold text-blue-600 tracking-wider">
                                            {generatedToken}
                                        </code>
                                        <button
                                            onClick={handleCopy}
                                            className={`relative p-2 rounded-lg transition-all duration-200 border ${copied
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200 shadow-sm'
                                                }`}
                                            title={copied ? 'Tersalin!' : 'Salin token'}
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-xs text-center text-gray-400">
                                        Token berlaku hingga 7 hari kedepan
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
                            {!generatedToken ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg 
                                            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm 
                                            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                            disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Buat Token
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm 
                                        hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                                >
                                    Selesai
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
