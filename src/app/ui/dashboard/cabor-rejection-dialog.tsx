'use client';

import { useState } from 'react';
import { rejectCabor } from '@/app/lib/actions';
import { AlertTriangle, Loader2, XCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface CaborRejectionDialogProps {
    caborProfileId: string;
    caborName: string;
    onSuccess: () => void;
    trigger: React.ReactNode;
}

export default function CaborRejectionDialog({
    caborProfileId,
    caborName,
    onSuccess,
    trigger
}: CaborRejectionDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError('Alasan penolakan harus diisi.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await rejectCabor(caborProfileId, reason);
            if (result.success) {
                setOpen(false);
                setReason('');
                onSuccess();
            } else {
                setError(result.error || 'Gagal menolak verifikasi.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6 z-50 focus:outline-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <Dialog.Title className="text-lg font-bold text-gray-900">
                                Tolak Verifikasi
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-gray-500">
                                {caborName}
                            </Dialog.Description>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Alasan Penolakan
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900"
                                placeholder="Jelaskan mengapa dokumen tidak valid atau apa yang perlu diperbaiki..."
                                required
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !reason.trim()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menolak...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Tolak Verifikasi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                            aria-label="Close"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
