'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, FileSpreadsheet, Upload, Download, FileUp, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/app/lib/utils';
import { importAthletes } from '@/app/lib/actions/athlete-import';

type ImportResult = {
    success: boolean;
    count: number;
    failed: number;
    message: string;
} | null;

export function AthleteImportDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ImportResult>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null); // Reset result when new file selected
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importAthletes(formData);
            setResult(res);
        } catch (error) {
            console.error(error);
            setResult({
                success: false,
                count: 0,
                failed: 0,
                message: 'Terjadi kesalahan sistem saat upload.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        // Reset state after transition
        setTimeout(() => {
            setFile(null);
            setResult(null);
        }, 300);
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-sm transition-all gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Import Excel
                </Button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-hidden">

                    {/* HEADER */}
                    <div className="flex flex-col space-y-1.5 border-b px-6 py-4 bg-gray-50/50">
                        <DialogPrimitive.Title className="text-xl font-bold leading-none tracking-tight text-gray-900 flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-green-600" />
                            {result ? 'Hasil Import Data' : 'Import Data Atlet dari Excel'}
                        </DialogPrimitive.Title>
                        {!result && (
                            <DialogPrimitive.Description className="text-sm text-gray-500">
                                Unggah file Excel berisi data atlet untuk import massal.
                            </DialogPrimitive.Description>
                        )}
                    </div>

                    <div className="px-6 py-4">
                        {!result ? (
                            /* UPLOAD VIEW */
                            <div className="space-y-6">
                                {/* Download Template Section */}
                                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                            <Download className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-blue-900">Download Template</h4>
                                            <p className="text-xs text-blue-700">
                                                Gunakan template ini agar format data sesuai dengan sistem.
                                            </p>
                                            <a
                                                href="https://docs.google.com/spreadsheets/d/e/2PACX-1vSzY86WmP59k48X8gFtDW4QrPfuA-INDGPH73ClDOK7ZYGSCiSg2vDYLB22h_LzgGyjZh9Y-dHkKSpd/pub?output=xlsx"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline mt-1"
                                            >
                                                Download Template Excel &rarr;
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* File Input Section */}
                                <div className="space-y-2">
                                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                                        Upload File Excel
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="dropzone-file"
                                            className={cn(
                                                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                                                file ? "border-green-300 bg-green-50" : "border-gray-300"
                                            )}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {file ? (
                                                    <>
                                                        <FileSpreadsheet className="w-8 h-8 mb-3 text-green-500" />
                                                        <p className="mb-2 text-sm text-green-700 font-medium">{file.name}</p>
                                                        <p className="text-xs text-green-500">{(file.size / 1024).toFixed(2)} KB</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                                                        <p className="text-xs text-gray-500">XLSX file only</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                id="dropzone-file"
                                                type="file"
                                                accept=".xlsx"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* RESULT VIEW */
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className={cn(
                                    "flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed",
                                    result.success && result.failed === 0 ? "bg-green-50 border-green-200" :
                                        result.success && result.failed > 0 ? "bg-yellow-50 border-yellow-200" :
                                            "bg-red-50 border-red-200"
                                )}>
                                    {result.success && result.failed === 0 ? (
                                        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                                    ) : result.success && result.failed > 0 ? (
                                        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-3" />
                                    ) : (
                                        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                                    )}

                                    <h3 className="text-lg font-bold text-gray-900">
                                        {result.success ? "Proses Selesai" : "Gagal Memproses File"}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 max-w-xs mx-auto">
                                        {result.message}
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                {result.success && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex flex-col items-center">
                                            <span className="text-green-600 font-medium text-sm">Berhasil Disimpan</span>
                                            <span className="text-3xl font-bold text-green-700">{result.count}</span>
                                        </div>
                                        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center">
                                            <span className="text-red-600 font-medium text-sm">Gagal/Format Salah</span>
                                            <span className="text-3xl font-bold text-red-700">{result.failed}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>

                    <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50/50">
                        {!result ? (
                            <>
                                <DialogPrimitive.Close asChild>
                                    <Button variant="outline" type="button" disabled={isLoading} className="px-4 h-10 border-gray-300 text-gray-700 hover:bg-gray-100">
                                        Batal
                                    </Button>
                                </DialogPrimitive.Close>
                                <Button
                                    type="button"
                                    disabled={isLoading || !file}
                                    onClick={handleUpload}
                                    className="px-6 h-10 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-colors"
                                >
                                    {isLoading ? 'Mengupload...' : 'Upload'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" type="button" onClick={handleReset} className="px-4 h-10 border-gray-300 text-gray-700 hover:bg-gray-100">
                                    Upload Lagi
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm transition-colors"
                                >
                                    Tutup
                                </Button>
                            </>
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
