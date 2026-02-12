'use client';

import { useState } from 'react';
import { createKoniInvitation } from '@/app/lib/actions';
import {
    Plus,
    Copy,
    Check,
    AlertCircle,
    Loader2,
    X,
    Ticket
} from 'lucide-react';

export default function TokenGenerator() {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedToken(null);

        try {
            const result = await createKoniInvitation(description);

            if (result.success && result.token) {
                setGeneratedToken(result.token);
            } else {
                setError(result.error || 'Gagal membuat token.');
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
        setDescription('');
        setGeneratedToken(null);
        setError(null);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-koni-red text-white rounded-lg font-medium shadow-sm 
                    hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-red transition-colors"
            >
                <Plus className="w-4 h-4" />
                Buat Token Cabor
            </button>

            {/* Modal Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    {/* Modal Content */}
                    <div
                        className="bg-white rounded-lg shadow-xl w-full max-w-md animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-koni-red" />
                                <h2 className="text-lg font-semibold text-koni-dark">
                                    Buat Token Undangan
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 space-y-4">
                            {!generatedToken ? (
                                <>
                                    <p className="text-sm text-gray-600">
                                        Token ini akan digunakan untuk mendaftarkan Admin Cabang Olahraga baru.
                                        Token berlaku selama 24 jam.
                                    </p>

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-koni-dark mb-1"
                                        >
                                            Deskripsi (Opsional)
                                        </label>
                                        <input
                                            id="description"
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Contoh: Untuk pendaftaran PANAHAN"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 text-koni-dark
                                                focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                            <Check className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Token berhasil dibuat! Salin dan bagikan kepada Admin Cabor.
                                        </p>
                                    </div>

                                    {/* Token Display */}
                                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between gap-3">
                                        <code className="text-lg font-mono font-bold text-koni-dark tracking-wider">
                                            {generatedToken}
                                        </code>
                                        <button
                                            onClick={handleCopy}
                                            className={`p-2 rounded-md transition-colors ${copied
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-white hover:bg-gray-200 text-gray-600'
                                                }`}
                                            title={copied ? 'Tersalin!' : 'Salin token'}
                                        >
                                            {copied ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">
                                        Token ini hanya bisa digunakan satu kali dan berlaku 24 jam.
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
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
                                            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-red"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-koni-red text-white rounded-md font-medium shadow-sm 
                                            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-red 
                                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Membuat...
                                            </>
                                        ) : (
                                            <>
                                                <Ticket className="w-4 h-4" />
                                                Buat Token
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-koni-dark text-white rounded-md font-medium shadow-sm 
                                        hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-dark transition-colors"
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
