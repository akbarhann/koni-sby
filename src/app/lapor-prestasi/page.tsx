'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Loader2, CheckCircle2 } from 'lucide-react';
import { authenticateAthlete, AuthAthleteState } from '@/app/lib/actions/auth-athlete';

const initialState: AuthAthleteState = {
    success: false,
    message: '',
};

function SubmitButton({ isValid }: { isValid: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || !isValid}
            className="w-full bg-koni-red text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-koni-red/20"
        >
            {pending ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                </>
            ) : (
                'MASUK & LAPOR'
            )}
        </button>
    );
}

export default function LaporPrestasiPage() {
    const [state, formAction] = useActionState(authenticateAthlete, initialState);
    const [nik, setNik] = useState('');

    // Client-side validation: NIK must be ~16 chars
    const isNikValid = nik.length >= 16;

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-koni-red/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-koni-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Header / Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <div className="relative w-24 h-24 mb-4 transition-transform group-hover:scale-105">
                            <Image
                                src="/img/logo/koni-1.svg"
                                alt="KONI Surabaya"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                            Gerbang <span className="text-koni-red">Prestasi</span>
                        </h2>
                        <p className="text-white/60 text-sm mt-2">
                            Portal Khusus Atlet KONI Surabaya
                        </p>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {!state.success ? (
                        <form action={formAction} className="space-y-6">
                            {/* Error Message */}
                            {state.message && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
                                    <p className="text-red-400 text-sm font-medium">{state.message}</p>
                                </div>
                            )}

                            {/* NIK Input */}
                            <div className="space-y-2">
                                <label htmlFor="nik" className="block text-sm font-bold text-white/80 uppercase tracking-wide">
                                    Nomor Induk Kependudukan (NIK)
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-koni-red to-koni-gold opacity-30 blur group-hover:opacity-60 transition duration-200 rounded-xl" />
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                                        <input
                                            id="nik"
                                            name="nik"
                                            type="text"
                                            maxLength={16}
                                            placeholder="Masukkan 16 digit NIK"
                                            value={nik}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, ''); // Numeric only
                                                setNik(val);
                                            }}
                                            className="w-full bg-neutral-900/90 border border-white/10 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-koni-gold transition-colors text-lg font-mono tracking-widest"
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-white/40 text-right">
                                    {nik.length}/16 Digits
                                </p>
                            </div>

                            {/* Date Input */}
                            <div className="space-y-2">
                                <label htmlFor="tgl_lahir" className="block text-sm font-bold text-white/80 uppercase tracking-wide">
                                    Tanggal Lahir
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-koni-gold to-koni-red opacity-30 blur group-hover:opacity-60 transition duration-200 rounded-xl" />
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 pointer-events-none" />
                                        <input
                                            id="tgl_lahir"
                                            name="tgl_lahir"
                                            type="date"
                                            className="w-full bg-neutral-900/90 border border-white/10 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-koni-gold transition-colors text-lg [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <SubmitButton isValid={isNikValid} />

                            <div className="text-center pt-2">
                                <Link href="/" className="text-white/40 text-sm hover:text-white transition-colors inline-flex items-center gap-2 group">
                                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        </form>
                    ) : (
                        // Success State
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-white uppercase mb-2">
                                    Selamat Datang!
                                </h3>
                                <p className="text-3xl font-bold text-koni-gold mb-1">
                                    {state.atlet?.nama}
                                </p>
                                <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-white/80 text-sm mt-2">
                                    {state.atlet?.club.nama_club}
                                </div>
                            </div>

                            <p className="text-white/60 text-sm px-4">
                                Sesi Anda telah diverifikasi. Silakan lanjutkan untuk melaporkan prestasi terbaru.
                            </p>

                            <div className="pt-4 space-y-3">
                                <button className="w-full bg-koni-gold text-koni-dark font-bold py-4 rounded-xl hover:bg-yellow-500 transition-all text-lg shadow-lg">
                                    LAPORKAN PRESTASI
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-transparent border border-white/10 text-white/60 font-bold py-3 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    KELUAR
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
