import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface VerificationAlertProps {
    count: number;
}

export default function VerificationAlert({ count }: VerificationAlertProps) {
    // Don't render if no pending verifications
    if (count === 0) {
        return null;
    }

    return (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-800">
                            Perhatian: Verifikasi Cabor Pending
                        </h3>
                        <p className="text-sm text-amber-700 mt-0.5">
                            Ada <span className="font-bold">{count} Cabor</span> menunggu verifikasi data.
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/koni/cabor"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
                >
                    Lihat Daftar Verifikasi
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
