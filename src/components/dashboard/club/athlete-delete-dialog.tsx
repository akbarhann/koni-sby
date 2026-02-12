'use client';

import { useState } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteAthlete } from '@/app/lib/actions/athlete-actions';
import { cn } from '@/app/lib/utils'; // Assuming cn utility exists

interface AthleteDeleteDialogProps {
    athleteId: string;
    athleteName: string;
    trigger?: React.ReactNode;
}

export function AthleteDeleteDialog({ athleteId, athleteName, trigger }: AthleteDeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAthlete(athleteId);
            if (result.success) {
                setOpen(false);
                // Ideally show toast here
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Gagal menghapus data');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <AlertDialogPrimitive.Trigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                )}
            </AlertDialogPrimitive.Trigger>
            <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                            Hapus Data Atlet?
                        </AlertDialogPrimitive.Title>
                        <AlertDialogPrimitive.Description className="text-sm text-gray-500">
                            Apakah Anda yakin ingin menghapus data atlet <strong>{athleteName}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogPrimitive.Description>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <AlertDialogPrimitive.Cancel asChild>
                            <Button variant="outline" disabled={isDeleting}>Batal</Button>
                        </AlertDialogPrimitive.Cancel>
                        <AlertDialogPrimitive.Action asChild>
                            <Button
                                variant="destructive"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete();
                                }}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </Button>
                        </AlertDialogPrimitive.Action>
                    </div>
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}
