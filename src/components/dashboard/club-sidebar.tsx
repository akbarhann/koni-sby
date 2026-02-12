'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShieldAlert, Settings, LogOut } from 'lucide-react';
import { signOutAction } from '@/app/lib/actions';

const navigation = [
    { name: 'Beranda', href: '/dashboard/club', icon: Home },
    { name: 'Manajemen Atlet', href: '/dashboard/club/athletes', icon: Users },
    { name: 'Verifikasi Prestasi', href: '/dashboard/club/verification', icon: ShieldAlert },
    { name: 'Pengaturan Club', href: '/dashboard/club/settings', icon: Settings },
];

export default function ClubSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
                <Image
                    src="/img/logo/koni.svg"
                    alt="Logo KONI"
                    width={180}
                    height={60}
                    className="h-16 w-auto"
                />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                    ? 'bg-red-50 text-red-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-gray-200 p-4">
                <form action={signOutAction}>
                    <button
                        type="submit"
                        className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <LogOut
                            className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                        />
                        Keluar
                    </button>
                </form>
            </div>
        </div>
    );
}
