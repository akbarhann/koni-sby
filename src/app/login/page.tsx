
'use client';

import { useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authenticate, verifyTokenAndRedirect } from '@/app/lib/actions';
import { AlertCircle, ArrowLeft, KeyRound, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const {
        register,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    );

    const [showPassword, setShowPassword] = useState(false);

    const [view, setView] = useState<'LOGIN' | 'TOKEN'>('LOGIN');

    // Token Registration Logic
    const router = useRouter();
    const [token, setToken] = useState('');
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    const handleVerifyToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) return;

        setVerifying(true);
        setTokenError(null);

        try {
            const result = await verifyTokenAndRedirect(token.trim());
            if (result.valid && result.redirectUrl) {
                router.push(result.redirectUrl);
            } else {
                setTokenError(result.error || 'Token tidak valid.');
            }
        } catch (error) {
            setTokenError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-koni-light p-4">
            <div className="w-full max-w-md">
                {/* Back to Home Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-koni-red mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Beranda
                </Link>

                {/* Login Card */}
                <div className="p-8 bg-white rounded-lg shadow-lg border-t-4 border-koni-red">
                    <div className="mb-6 text-center">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/img/logo/koni.svg"
                                alt="KONI Logo"
                                width={120}
                                height={120}
                                className="h-24 w-auto"
                            />
                        </div>
                    </div>

                    {view === 'LOGIN' ? (
                        <>
                            <form action={formAction} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-koni-dark">Email Address</label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="admin@koni-surabaya.go.id"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                      focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-status-error">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-koni-dark">Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            {...register('password')}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-koni-dark
                          focus:outline-none focus:border-koni-red focus:ring-1 focus:ring-koni-red"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-koni-dark"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-status-error">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-koni-red hover:text-red-700">
                                            Lupa password?
                                        </a>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        <p>{errorMessage}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isPending}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    bg-koni-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koni-red disabled:opacity-50"
                                >
                                    {isPending ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">atau</span>
                                </div>
                            </div>

                            {/* Switch to Token View Button */}
                            <button
                                type="button"
                                onClick={() => setView('TOKEN')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <KeyRound className="w-4 h-4" />
                                Masukkan Token Registrasi
                            </button>
                        </>
                    ) : (
                        /* Token Registration View */
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <form onSubmit={handleVerifyToken} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-koni-dark mb-1">Kode Token</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <KeyRound className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => {
                                                setToken(e.target.value);
                                                setTokenError(null);
                                            }}
                                            placeholder="Tempel Kode Token Anda disini..."
                                            className={`block w-full pl-10 pr-3 py-2 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-koni-red focus:border-koni-red
                                            ${tokenError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
                                            autoFocus
                                        />
                                    </div>
                                    {tokenError && (
                                        <p className="mt-2 text-xs text-red-600 text-left flex items-start gap-1">
                                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            {tokenError}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying || !token.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {verifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memeriksa Token...
                                        </>
                                    ) : (
                                        <>
                                            Lanjutkan Pendaftaran
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView('LOGIN')}
                                    className="w-full text-sm text-red-600 hover:text-koni-red font-medium"
                                >
                                    Kembali ke Login
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
