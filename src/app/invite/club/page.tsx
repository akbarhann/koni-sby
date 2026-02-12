'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateClubToken } from '@/app/lib/actions';
import { AlertCircle, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export default function InviteClubPage() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsValidating(true);

        try {
            const result = await validateClubToken(token.trim());

            if (result.valid) {
                router.push(`/onboarding/club?token=${encodeURIComponent(token.trim())}&cabor=${encodeURIComponent(result.caborName || '')}`);
            } else {
                setError(result.error || 'Token tidak valid.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-koni-light">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border-t-4 border-koni-gold animate-slide-up">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-koni-gold/20 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="w-8 h-8 text-koni-gold" />
                    </div>
                    <h1 className="text-2xl font-bold text-koni-dark">Verifikasi Kode Pendaftaran</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Masukkan kode pendaftaran dari Cabang Olahraga untuk mendaftarkan Club Anda.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-koni-dark">
                            Kode Pendaftaran Club
                        </label>
                        <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            placeholder="Contoh: PSSI-X2Y4"
                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark font-mono tracking-wider text-center text-lg
                                focus:outline-none focus:border-koni-gold focus:ring-1 focus:ring-koni-gold"
                            required
                            maxLength={30}
                            autoComplete="off"
                            autoFocus
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isValidating || !token.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-koni-dark 
                            bg-koni-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-gold 
                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Memvalidasi...
                            </>
                        ) : (
                            <>
                                Validasi Token
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    Belum punya kode? Hubungi pengurus Cabang Olahraga Anda untuk mendapatkan akses.
                </p>
            </div>
        </div>
    );
}
