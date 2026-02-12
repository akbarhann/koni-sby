'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerClubAdmin } from '@/app/lib/actions';
import { Building, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mendaftarkan Club...
                </>
            ) : (
                <>
                    Daftar Club Baru
                    <ArrowRight className="w-4 h-4" />
                </>
            )}
        </button>
    );
}

interface RegisterClubFormProps {
    initialToken: string;
    caborName?: string;
}

export default function RegisterClubForm({ initialToken, caborName }: RegisterClubFormProps) {
    // Initial state for useFormState
    const initialState = {
        success: false,
        error: undefined,
        fieldErrors: undefined
    };

    const [state, dispatch] = useActionState(registerClubAdmin, initialState);

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // If registration is successful
    if (state.success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h1>
                    <p className="text-gray-600 mb-6">
                        Akun Club Anda telah berhasil dibuat dan diverifikasi otomatis via token.
                        Silakan login untuk melengkapi profil club.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Login Sekarang
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="mx-auto flex justify-center mb-4">
                    <Image
                        src="/img/logo/koni.svg"
                        alt="KONI Logo"
                        width={80}
                        height={80}
                        className="h-20 w-auto"
                    />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Daftar Akun Club {caborName && <span className="text-blue-600 block text-xl mt-1">{caborName}</span>}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-xl sm:px-10 border border-gray-100">
                    <form action={dispatch} className="space-y-5">
                        {/* Token Input (Hidden) */}
                        <input type="hidden" name="token" value={initialToken} />

                        {/* Nama Club */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Club <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="namaClub"
                                    placeholder="Nama Club Lengkap"
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${state.fieldErrors?.namaClub ? 'border-red-300' : 'border-gray-300'}`}
                                    required
                                />
                            </div>
                            {state.fieldErrors?.namaClub && (
                                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.namaClub}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="club@example.com"
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${state.fieldErrors?.email ? 'border-red-300' : 'border-gray-300'}`}
                                    required
                                />
                            </div>
                            {state.fieldErrors?.email && (
                                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${state.fieldErrors?.password ? 'border-red-300' : 'border-gray-300'}`}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {state.fieldErrors?.password && (
                                    <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Konfirmasi Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${state.fieldErrors?.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {state.fieldErrors?.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">{state.fieldErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Global Error Message */}
                        {state.error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Gagal Mendaftar</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{state.error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Sudah punya akun?
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Masuk ke login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
