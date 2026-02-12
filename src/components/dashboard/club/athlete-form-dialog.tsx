'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, User, Calendar, Ruler, Phone, Save, Edit } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
import { AthleteFormSchema, type AthleteFormData } from '@/app/lib/zod/athlete-schema';
import { createAthlete, updateAthlete, type CreateAthleteState, type Athlete } from '@/app/lib/actions/athlete-actions';

// Ensure Athlete type matches what we need
type AthleteProp = Athlete; // We can refine this to Athlete type if imported correctly

interface AthleteFormDialogProps {
    athlete?: AthleteProp;
    trigger?: React.ReactNode;
}

export function AthleteFormDialog({ athlete, trigger }: AthleteFormDialogProps) {
    const isEditMode = !!athlete;
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        watch,
        setValue,
    } = useForm<AthleteFormData>({
        resolver: zodResolver(AthleteFormSchema),
        defaultValues: {
            nik: '',
            nama: '',
            tempat_lahir: '',
            jenis_kelamin: undefined,
            tinggi_badan: undefined,
            berat_badan: undefined,
            ukuran_baju: '',
            ukuran_sepatu: undefined,
            no_hp: '',
        },
    });

    // Reset/Prefill form when dialog opens or athlete changes
    useEffect(() => {
        if (open) {
            if (athlete) {
                // Pre-fill for edit
                setValue('nik', athlete.nik);
                setValue('nama', athlete.nama);
                setValue('tempat_lahir', athlete.tempat_lahir);
                setValue('tgl_lahir', athlete.tgl_lahir ? new Date(athlete.tgl_lahir) : new Date());
                setValue('jenis_kelamin', athlete.jenis_kelamin as any);
                setValue('tinggi_badan', athlete.tinggi_badan || undefined);
                setValue('berat_badan', athlete.berat_badan || undefined);
                setValue('ukuran_baju', athlete.ukuran_baju || '');
                setValue('ukuran_sepatu', athlete.ukuran_sepatu || undefined);
                setValue('no_hp', athlete.no_hp || '');
            } else {
                // Reset for create
                reset({
                    nik: '',
                    nama: '',
                    tempat_lahir: '',
                    jenis_kelamin: undefined,
                    tinggi_badan: undefined,
                    berat_badan: undefined,
                    ukuran_baju: '',
                    ukuran_sepatu: undefined,
                    no_hp: '',
                });
            }
            setServerError(null);
        }
    }, [open, athlete, reset, setValue]);

    const nikValue = watch('nik') || '';

    const onSubmit = async (data: AthleteFormData) => {
        setIsPending(true);
        setServerError(null);

        const formData = new FormData();
        // If editing, append ID
        if (isEditMode && athlete?.id) {
            formData.append('id', athlete.id);
        }

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        const initialState: CreateAthleteState = { success: false };

        let result;
        if (isEditMode) {
            result = await updateAthlete(initialState, formData);
        } else {
            result = await createAthlete(initialState, formData);
        }

        if (result.success) {
            setOpen(false);
            if (!isEditMode) reset(); // Only reset on create success
        } else {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    setError(field as keyof AthleteFormData, {
                        type: 'server',
                        message: messages[0],
                    });
                });
            }
            if (result.message) {
                setServerError(result.message);
            }
        }
        setIsPending(false);
    };

    const handleUppercase = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.toUpperCase();
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                {trigger || (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all">
                        <User className="mr-2 h-4 w-4" />
                        Tambah Atlet
                    </Button>
                )}
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-hidden">

                    <div className="flex flex-col space-y-1.5 border-b px-6 py-4 bg-gray-50/50">
                        <DialogPrimitive.Title className="text-xl font-bold leading-none tracking-tight text-gray-900 flex items-center gap-2">
                            {isEditMode ? (
                                <Edit className="h-5 w-5 text-blue-600" />
                            ) : (
                                <User className="h-5 w-5 text-blue-600" />
                            )}
                            {isEditMode ? 'Edit Data Atlet' : 'Tambah Data Atlet'}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-sm text-gray-500">
                            {isEditMode ? 'Perbarui informasi data atlet.' : 'Isi data atlet dengan lengkap dan benar sesuai KTP/KK.'}
                        </DialogPrimitive.Description>
                    </div>

                    {serverError && (
                        <div className="mx-6 mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 flex items-center gap-2">
                            ⚠️ {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-6 max-h-[85vh] overflow-y-auto">

                        {/* Section 1: NIK (Full Width) */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label htmlFor="nik" className="text-sm font-semibold text-gray-700">
                                    Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                                </label>
                                <span className={cn("text-xs", nikValue.length === 16 ? "text-green-600" : "text-gray-400")}>
                                    {nikValue.length}/16 digit
                                </span>
                            </div>
                            <input
                                id="nik"
                                maxLength={16}
                                className={cn(
                                    "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-mono tracking-wide",
                                    errors.nik && "border-red-500 focus:ring-red-500 bg-red-50"
                                )}
                                placeholder="16 digit angka..."
                                {...register('nik')}
                            />
                            {errors.nik && (
                                <p className="text-xs text-red-500 font-medium">{errors.nik.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Section 2: Identitas */}
                            <div className="space-y-4 rounded-lg bg-gray-50/80 p-4 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2 mb-2">
                                    Identitas
                                </h3>

                                <div className="space-y-2">
                                    <label htmlFor="nama" className="text-sm font-medium text-gray-700">
                                        Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="nama"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase",
                                            errors.nama && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="NAMA LENGKAP"
                                        {...register('nama')}
                                        onInput={handleUppercase}
                                    />
                                    {errors.nama && (
                                        <p className="text-xs text-red-500">{errors.nama.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="jenis_kelamin" className="text-sm font-medium text-gray-700">
                                        Jenis Kelamin <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="jenis_kelamin"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer",
                                            errors.jenis_kelamin && "border-red-500 focus:ring-red-500"
                                        )}
                                        {...register('jenis_kelamin')}
                                    >
                                        <option value="">- Pilih Gender -</option>
                                        <option value="MALE">Laki-laki</option>
                                        <option value="FEMALE">Perempuan</option>
                                    </select>
                                    {errors.jenis_kelamin && (
                                        <p className="text-xs text-red-500">{errors.jenis_kelamin.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="no_hp" className="text-sm font-medium text-gray-700">
                                        No. WhatsApp
                                    </label>
                                    <input
                                        id="no_hp"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="08..."
                                        {...register('no_hp')}
                                    />
                                </div>
                            </div>

                            {/* Section 3: Kelahiran */}
                            <div className="space-y-4 rounded-lg bg-gray-50/80 p-4 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2 mb-2">
                                    Kelahiran
                                </h3>

                                <div className="space-y-2">
                                    <label htmlFor="tempat_lahir" className="text-sm font-medium text-gray-700">
                                        Tempat Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="tempat_lahir"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase",
                                            errors.tempat_lahir && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="KOTA KELAHIRAN"
                                        {...register('tempat_lahir')}
                                        onInput={handleUppercase}
                                    />
                                    {errors.tempat_lahir && (
                                        <p className="text-xs text-red-500">{errors.tempat_lahir.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="tgl_lahir" className="text-sm font-medium text-gray-700">
                                        Tanggal Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="tgl_lahir"
                                        type="date"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                                            errors.tgl_lahir && "border-red-500 focus:ring-red-500"
                                        )}
                                        {...register('tgl_lahir', { valueAsDate: true })}
                                    />
                                    {errors.tgl_lahir && (
                                        <p className="text-xs text-red-500">{errors.tgl_lahir.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Fisik (4 Cols) */}
                        <div className="rounded-lg bg-gray-50/80 p-4 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2 mb-4">
                                Data Fisik
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Tinggi (cm)</label>
                                    <input
                                        type="number"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                                        placeholder="0"
                                        {...register('tinggi_badan')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Berat (kg)</label>
                                    <input
                                        type="number"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                                        placeholder="0"
                                        {...register('berat_badan')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Baju</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center cursor-pointer"
                                        {...register('ukuran_baju')}
                                    >
                                        <option value="">-</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Sepatu</label>
                                    <input
                                        type="number"
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                                        placeholder="0"
                                        {...register('ukuran_sepatu')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2"></div>

                        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>

                        <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
                            <DialogPrimitive.Close asChild>
                                <Button variant="outline" type="button" disabled={isPending} className="px-6 h-11 border-gray-300 text-gray-700 hover:bg-gray-50">
                                    Batal
                                </Button>
                            </DialogPrimitive.Close>
                            <Button type="submit" disabled={isPending} className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                                <Save className="w-4 h-4 mr-2" />
                                {isPending ? 'Menyimpan...' : (isEditMode ? 'Update Data' : 'Simpan Data')}
                            </Button>
                        </div>
                    </form>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
