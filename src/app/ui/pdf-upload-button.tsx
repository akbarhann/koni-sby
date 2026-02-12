'use client';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";

interface PdfUploadButtonProps {
    onUploadComplete: (url: string, fileName: string) => void;
    label?: string;
}

export default function PdfUploadButton({ onUploadComplete, label = "Upload PDF" }: PdfUploadButtonProps) {
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            <UploadButton<OurFileRouter, "pdfUploader">
                endpoint="pdfUploader"
                onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                        setError(null);
                        onUploadComplete(res[0].ufsUrl, res[0].name);
                    }
                }}
                onUploadError={(error: Error) => {
                    if (error.message.includes("FileSizeMismatch") || error.message.includes("1MB")) {
                        setError("File terlalu besar! Maksimal 1MB.");
                    } else if (error.message.includes("Unauthorized")) {
                        setError("Anda tidak memiliki izin untuk upload.");
                    } else {
                        setError("Gagal upload: " + error.message);
                    }
                }}
                appearance={{
                    button:
                        "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-uploading:cursor-not-allowed ut-uploading:bg-blue-400 bg-blue-600 rounded-lg px-4 py-2 text-white font-medium transition-colors after:bg-blue-700",
                    container: "w-full flex flex-col items-center gap-2",
                    allowedContent: "text-xs text-gray-500",
                }}
                content={{
                    button({ ready, isUploading }) {
                        if (isUploading) return "Mengupload...";
                        if (ready) return (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                {label}
                            </span>
                        );
                        return "Memuat...";
                    },
                    allowedContent: "PDF, maksimal 1MB",
                }}
            />

            {error && (
                <div className="flex items-center gap-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
