'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { registerCaborAdmin, RegistrationState } from '@/app/lib/actions';
import { AlertCircle, CheckCircle2, Loader2, ChevronDown, Plus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Helper function to convert string to Title Case
function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

type CaborOption = {
    id: string;
    name: string;
};

interface CaborRegistrationFormProps {
    existingCabors: CaborOption[];
}

export default function CaborRegistrationForm({ existingCabors }: CaborRegistrationFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [formState, formAction, isPending] = useActionState<RegistrationState | undefined, FormData>(
        registerCaborAdmin,
        undefined
    );

    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedCabor, setSelectedCabor] = useState<string>('');
    const [newCaborName, setNewCaborName] = useState<string>('');

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            router.push('/invite/cabor');
        }
    }, [token, router]);

    useEffect(() => {
        if (formState?.success) {
            setShowSuccess(true);
        }
    }, [formState]);

    // Handle new Cabor name input with Title Case enforcement
    const handleNewCaborChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const titleCased = toTitleCase(e.target.value);
        setNewCaborName(titleCased);
    };

    // Get the final Cabor name to submit
    const getFinalCaborName = (): string => {
        if (selectedCabor === 'NEW') {
            return newCaborName;
        }
        // Find the selected cabor's name
        const found = existingCabors.find((c) => c.id === selectedCabor);
        return found?.name || '';
    };

    if (showSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-koni-light">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border-t-4 border-green-500 animate-slide-up text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-koni-dark">Pendaftaran Berhasil!</h1>
                    <p className="mt-2 text-gray-600">
                        Akun Cabang Olahraga Anda telah berhasil dibuat. Silakan login untuk melanjutkan.
                    </p>
                    <Link
                        href="/login"
                        className="mt-6 inline-flex items-center justify-center gap-2 py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            bg-koni-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-red transition-colors"
                    >
                        Masuk ke Akun
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-koni-light py-12">
            <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg border-t-4 border-koni-red animate-slide-up">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto flex justify-center mb-4">
                        <Image
                            src="/img/logo/koni.svg"
                            alt="KONI Logo"
                            width={80}
                            height={80}
                            className="h-20 w-auto"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-koni-dark">Daftarkan Cabang Olahraga</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Lengkapi data berikut untuk mendaftarkan akun admin Cabor.
                    </p>
                </div>

                {/* Form */}
                <form action={formAction} className="space-y-5">
                    {/* Hidden Token */}
                    <input type="hidden" name="token" value={token} />
                    {/* Hidden Cabor Name - the actual value sent to server */}
                    <input type="hidden" name="namaCabor" value={getFinalCaborName()} />

                    {/* Cabor Selection */}
                    <div>
                        <label htmlFor="caborSelect" className="block text-sm font-medium text-koni-dark">
                            Nama Cabang Olahraga <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1">
                            <select
                                id="caborSelect"
                                name="caborId"
                                value={selectedCabor}
                                onChange={(e) => {
                                    setSelectedCabor(e.target.value);
                                    if (e.target.value !== 'NEW') {
                                        setNewCaborName('');
                                    }
                                }}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm text-koni-dark
                                    focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>
                                    Pilih Cabang Olahraga...
                                </option>
                                {existingCabors.map((cabor) => (
                                    <option key={cabor.id} value={cabor.id}>
                                        {cabor.name}
                                    </option>
                                ))}
                                <option value="NEW">+ Tambah Cabor Baru</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {formState?.fieldErrors?.namaCabor && (
                            <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.namaCabor}</p>
                        )}
                    </div>

                    {/* New Cabor Name Input - Only shown when "Tambah Cabor Baru" is selected */}
                    {selectedCabor === 'NEW' && (
                        <div className="animate-slide-up">
                            <label htmlFor="newCaborName" className="block text-sm font-medium text-koni-dark">
                                Nama Cabor Baru <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    id="newCaborName"
                                    name="newCaborName"
                                    type="text"
                                    value={newCaborName}
                                    onChange={handleNewCaborChange}
                                    placeholder="Masukkan Nama Cabor Baru (misal: Sepak Bola)"
                                    className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                                        focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                                    required={selectedCabor === 'NEW'}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Format otomatis: Title Case (misal: &quot;sepak bola&quot; → &quot;Sepak Bola&quot;)
                            </p>
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-koni-dark">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Biarkan kosong untuk menggunakan email"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                                focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-koni-dark">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@cabor.org"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                                focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                            required
                        />
                        {formState?.fieldErrors?.email && (
                            <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-koni-dark">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimal 6 karakter"
                                className="block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                                    focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-koni-dark"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {formState?.fieldErrors?.password && (
                            <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-koni-dark">
                            Konfirmasi Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Ulangi password"
                                className="block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                                    focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-koni-dark"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {formState?.fieldErrors?.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* General Error Message */}
                    {formState?.error && (
                        <div className="flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            <p>{formState.error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending || (selectedCabor === 'NEW' && !newCaborName.trim())}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            bg-koni-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-red 
                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Mendaftarkan...
                            </>
                        ) : (
                            'Daftar Sekarang'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-koni-red hover:underline">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
