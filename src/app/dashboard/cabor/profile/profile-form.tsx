'use client';

import { useState, useEffect } from 'react';
import { updateCaborProfile } from '@/app/lib/actions';
import {
    Save,
    Loader2,
    Check,
    AlertCircle,
    Building,
    Mail,
    Phone,
    FileText,
    ExternalLink,
    RefreshCw,
    Globe,
    Facebook,
    Instagram,
    Youtube,
    Users,
    Briefcase,
    Trophy,
    Calendar,
    Target,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import PdfUploadButton from '@/app/ui/pdf-upload-button';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';

// --- ZOD SCHEMAS ---

const scheduleSchema = z.object({
    day: z.string().min(1, "Hari harus dipilih"),
    start: z.string().min(1, "Jam mulai harus diisi"),
    end: z.string().min(1, "Jam selesai harus diisi")
});

// We create a single schema for the whole form, but we can trigger validation partially
const profileSchema = z.object({
    // Step 1: Identitas
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    alamat_sekretariat: z.string().min(5, "Alamat minimal 5 karakter"),
    email_resmi: z.string().email("Email tidak valid"),
    nomor_telepon: z.string().min(4, "Nomor telepon minimal 4 karakter"),
    facebook_url: z.string().optional().or(z.literal('')),
    instagram_url: z.string().optional().or(z.literal('')),
    website_url: z.string().optional().or(z.literal('')),
    youtube_url: z.string().optional().or(z.literal('')),

    // Step 2: Operasional
    org_structure: z.string().min(10, "Struktur organisasi minimal 10 karakter"),
    facilities: z.string().min(10, "Sarana prasarana minimal 10 karakter"),
    training_location: z.string().min(5, "Lokasi latihan minimal 5 karakter"),
    training_schedule: z.array(scheduleSchema).optional(), // Handled separately via state, but good to have in schema
    development_program: z.string().min(10, "Program pembinaan minimal 10 karakter"),
    achievements: z.string().min(10, "Prestasi minimal 10 karakter"),

    // Step 3: SDM
    total_referees: z.coerce.number().min(0),
    total_coaches: z.coerce.number().min(0),
    total_athletes_manual: z.coerce.number().min(0),

    // Step 4: Legalitas
    sk_start_date: z.string().optional(),
    sk_end_date: z.string().optional(),
    // Files are handled via state/hidden inputs usually, or we just validate state
    // We won't strictly validate files in Zod here as they are uploaded async, 
    // but we will check state before submitting step 4 if strict mode.
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileData = {
    id: string;
    nama_cabor: string;
    // ... all other fields from page.tsx ...
    [key: string]: any;
};

interface ProfileFormProps {
    profile: ProfileData;
    isEditMode: boolean;
}

const STEPS = [
    { id: 0, label: 'Identitas', icon: Building },
    { id: 1, label: 'Operasional', icon: Users },
    { id: 2, label: 'Data SDM', icon: Briefcase },
    { id: 3, label: 'Legalitas', icon: FileText },
];

export default function ProfileForm({ profile, isEditMode }: ProfileFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // File State
    const [skFileUrl, setSkFileUrl] = useState(profile.sk_file_url || '');
    const [skFileName, setSkFileName] = useState(profile.sk_file_name || '');
    const [adArtFileUrl, setAdArtFileUrl] = useState(profile.ad_art_file_url || '');
    const [adArtFileName, setAdArtFileName] = useState(profile.ad_art_file_name || '');

    // Initialize Form
    const {
        register,
        control,
        handleSubmit,
        trigger,
        formState: { errors },
        setValue,
        watch
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            description: profile.description || '',
            alamat_sekretariat: profile.alamat_sekretariat || '',
            email_resmi: profile.email_resmi || '',
            nomor_telepon: profile.nomor_telepon || '',
            facebook_url: profile.facebook_url || '',
            instagram_url: profile.instagram_url || '',
            website_url: profile.website_url || '',
            youtube_url: profile.youtube_url || '',
            org_structure: profile.org_structure || '',
            facilities: profile.facilities || '',
            training_location: profile.training_location || '',
            development_program: profile.development_program || '',
            achievements: profile.achievements || '',
            total_referees: profile.total_referees || 0,
            total_coaches: profile.total_coaches || 0,
            total_athletes_manual: profile.total_athletes_manual || 0,

            training_schedule: profile.training_schedule ? JSON.parse(profile.training_schedule) : [],
            sk_start_date: profile.sk_start_date || '',
            sk_end_date: profile.sk_end_date || '',
        }
    });

    // Schedule Array Management
    const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
        control,
        name: "training_schedule"
    });
    const [newSchedule, setNewSchedule] = useState({ day: 'Senin', start: '', end: '' });


    // --- NAVIGATION LOGIC ---

    const validateStep = async (step: number) => {
        let fieldsToValidate: (keyof ProfileFormValues)[] = [];
        switch (step) {
            case 0: // Identitas
                fieldsToValidate = ['description', 'alamat_sekretariat', 'email_resmi', 'nomor_telepon'];
                break;
            case 1: // Operasional
                fieldsToValidate = ['org_structure', 'facilities', 'training_location', 'development_program', 'achievements'];
                break;
            case 2: // SDM
                fieldsToValidate = ['total_referees', 'total_coaches', 'total_athletes_manual'];
                break;
            case 3: // Legalitas
                // Custom check for files if needed, or just let them save empty
                break;
        }

        if (fieldsToValidate.length > 0) {
            const isValid = await trigger(fieldsToValidate);
            return isValid;
        }
        return true;
    };

    const nextStep = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const jumpToStep = async (step: number) => {
        if (isEditMode) {
            setCurrentStep(step);
        } else {
            // Sequential check
            if (step < currentStep) {
                setCurrentStep(step);
            } else {
                // Trying to go forward: validate current step first? 
                // Actually requirement says: "If isEditMode === false: Tabs for future steps are DISABLED"
                // So we don't need to handle forward jump here, disabling UI is enough.
            }
        }
    };


    // --- SUBMISSION ---

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        setSuccess(false);
        setError(null);

        const formData = new FormData();
        // Append all text fields
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'training_schedule') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        });

        // Append Files manually managed in state
        if (skFileUrl) {
            formData.append('sk_file_url', skFileUrl);
            formData.append('sk_file_name', skFileName);
        }
        if (adArtFileUrl) {
            formData.append('ad_art_file_url', adArtFileUrl);
            formData.append('ad_art_file_name', adArtFileName);
        }

        try {
            const result = await updateCaborProfile(formData);
            if (result.success) {
                setSuccess(true);
                // Redirect to dashboard after 1.5s
                setTimeout(() => {
                    router.push('/dashboard/cabor');
                }, 1500);
            } else {
                setError(result.error || 'Gagal menyimpan perubahan.');
            }
        } catch (err) {
            setError('Terjadi kesalahan server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to add schedule
    const handleAddScheduleLocal = () => {
        if (newSchedule.day && newSchedule.start && newSchedule.end) {
            appendSchedule(newSchedule);
            setNewSchedule({ day: 'Senin', start: '', end: '' });
        }
    };

    return (
        <div className="flex flex-col min-h-[600px]">
            {/* STEPPER HEADER */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-20">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === index;
                        const isCompleted = currentStep > index;
                        const isClickable = isEditMode || isCompleted;

                        return (
                            <button
                                key={step.id}
                                disabled={!isClickable && !isActive}
                                onClick={() => jumpToStep(index)}
                                className={cn(
                                    "flex flex-col items-center gap-2 group min-w-[80px]",
                                    (!isClickable && !isActive) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                    isActive ? "bg-blue-600 border-blue-600 text-white shadow-md scale-110" :
                                        isCompleted ? "bg-green-100 border-green-500 text-green-700" :
                                            "bg-gray-50 border-gray-200 text-gray-400"
                                )}>
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold",
                                    isActive ? "text-blue-600" :
                                        isCompleted ? "text-green-700" :
                                            "text-gray-400"
                                )}>
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ERROR / SUCCESS MESSAGES */}
            <div className="p-6 pb-0">
                {success && (
                    <div className="flex items-center gap-2 p-3 text-sm text-green-800 bg-green-100 rounded-lg animate-in slide-in-from-top-2">
                        <Check className="w-4 h-4" />
                        <p>Profil berhasil disimpan!</p>
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-100 rounded-lg animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-6">
                <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">

                    {/* STEP 1: IDENTITAS */}
                    <div className={cn("space-y-6", currentStep !== 0 && "hidden")}>
                        <div className="border-b pb-2 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Identitas & Kontak</h2>
                            <p className="text-sm text-gray-500">Informasi dasar mengenai Cabor Anda.</p>
                        </div>

                        <div className="grid gap-6">
                            {/* Nama Cabor - Read Only */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Cabor</label>
                                <input type="text" value={profile.nama_cabor} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deskripsi Singkat <span className="text-red-500">*</span></label>
                                    <textarea
                                        {...register('description')}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Jelaskan secara singkat tentang Cabor ini..."
                                    />
                                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Alamat Sekretariat <span className="text-red-500">*</span></label>
                                    <textarea
                                        {...register('alamat_sekretariat')}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Alamat lengkap sekretariat..."
                                    />
                                    {errors.alamat_sekretariat && <p className="text-xs text-red-500">{errors.alamat_sekretariat.message}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Resmi <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            {...register('email_resmi')}
                                            type="email"
                                            className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors.email_resmi && <p className="text-xs text-red-500">{errors.email_resmi.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nomor Telepon / WA <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            {...register('nomor_telepon')}
                                            type="tel"
                                            className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors.nomor_telepon && <p className="text-xs text-red-500">{errors.nomor_telepon.message}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Facebook</label>
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input {...register('facebook_url')} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://facebook.com/..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Instagram</label>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input {...register('instagram_url')} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://instagram.com/..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input {...register('website_url')} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">YouTube</label>
                                    <div className="relative">
                                        <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input {...register('youtube_url')} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://youtube.com/..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: OPERASIONAL */}
                    <div className={cn("space-y-6", currentStep !== 1 && "hidden")}>
                        <div className="border-b pb-2 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Informasi Operasional</h2>
                            <p className="text-sm text-gray-500">Detail kegiatan dan fasilitas.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Struktur Organisasi <span className="text-red-500">*</span></label>
                                <textarea {...register('org_structure')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Susunan pengurus..." />
                                {errors.org_structure && <p className="text-xs text-red-500">{errors.org_structure.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sarana & Prasarana <span className="text-red-500">*</span></label>
                                <textarea {...register('facilities')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Fasilitas yang dimiliki..." />
                                {errors.facilities && <p className="text-xs text-red-500">{errors.facilities.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lokasi Latihan Puslatcab <span className="text-red-500">*</span></label>
                                <input {...register('training_location')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Lokasi utama..." />
                                {errors.training_location && <p className="text-xs text-red-500">{errors.training_location.message}</p>}
                            </div>

                            {/* Dynamic Schedule */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="font-medium text-sm mb-2 block">Jadwal Latihan</label>
                                <div className="flex gap-2 mb-4 items-end">
                                    <div className="flex-1">
                                        <select
                                            value={newSchedule.day}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        >
                                            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <input type="time" value={newSchedule.start} onChange={(e) => setNewSchedule({ ...newSchedule, start: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <input type="time" value={newSchedule.end} onChange={(e) => setNewSchedule({ ...newSchedule, end: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                    </div>
                                    <button type="button" onClick={handleAddScheduleLocal} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Tambah</button>
                                </div>

                                <div className="space-y-2">
                                    {scheduleFields.map((field, index) => (
                                        <div key={field.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                            <span className="text-sm font-medium w-24">{field.day}</span>
                                            <span className="text-sm text-gray-600">{field.start} - {field.end}</span>
                                            <button type="button" onClick={() => removeSchedule(index)} className="text-red-500 text-xs hover:underline">Hapus</button>
                                        </div>
                                    ))}
                                    {scheduleFields.length === 0 && <p className="text-xs text-gray-400 italic text-center">Belum ada jadwal.</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Program Pembinaan <span className="text-red-500">*</span></label>
                                <textarea {...register('development_program')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Program jangka pendek/panjang..." />
                                {errors.development_program && <p className="text-xs text-red-500">{errors.development_program.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prestasi <span className="text-red-500">*</span></label>
                                <textarea {...register('achievements')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Prestasi yang pernah diraih..." />
                                {errors.achievements && <p className="text-xs text-red-500">{errors.achievements.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: SDM */}
                    <div className={cn("space-y-6", currentStep !== 2 && "hidden")}>
                        <div className="border-b pb-2 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Sumber Daya Manusia</h2>
                            <p className="text-sm text-gray-500">Statistik jumlah personil.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <label className="block text-sm font-medium mb-2">Jumlah Wasit</label>
                                <input {...register('total_referees')} type="number" className="w-full text-center text-xl font-bold px-3 py-2 border rounded-lg" min="0" />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <label className="block text-sm font-medium mb-2">Jumlah Pelatih</label>
                                <input {...register('total_coaches')} type="number" className="w-full text-center text-xl font-bold px-3 py-2 border rounded-lg" min="0" />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                <label className="block text-sm font-medium mb-2">Atlet</label>
                                <input {...register('total_athletes_manual')} type="number" className="w-full text-center text-xl font-bold px-3 py-2 border rounded-lg" min="0" />
                            </div>
                        </div>
                    </div>

                    {/* STEP 4: LEGALITAS */}
                    <div className={cn("space-y-6", currentStep !== 3 && "hidden")}>
                        <div className="border-b pb-2 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Dokumen Legalitas</h2>
                            <p className="text-sm text-gray-500">Upload SK dan AD/ART.</p>
                        </div>

                        {/* DATE FIELDS */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Masa Bhakti (Mulai)</label>
                                <input
                                    type="date"
                                    {...register('sk_start_date')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Masa Bhakti (Selesai)</label>
                                <input
                                    type="date"
                                    {...register('sk_end_date')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* SK UPLOAD */}
                            <div className="border rounded-xl p-4 shadow-sm bg-white">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="text-blue-600" /> SK Kepengurusan
                                </h3>
                                {skFileUrl ? (
                                    <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Check className="text-green-600 w-4 h-4" />
                                            <span className="text-sm text-blue-900 truncate max-w-[150px]">{skFileName}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={skFileUrl} target="_blank" className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 font-medium">Lihat</a>
                                            <button type="button" onClick={() => setSkFileUrl('')} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Hapus</button>
                                        </div>
                                    </div>
                                ) : (
                                    <PdfUploadButton onUploadComplete={(url, name) => { setSkFileUrl(url); setSkFileName(name); }} label="Upload SK" />
                                )}
                            </div>

                            {/* AD/ART UPLOAD */}
                            <div className="border rounded-xl p-4 shadow-sm bg-white">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="text-purple-600" /> AD/ART
                                </h3>
                                {adArtFileUrl ? (
                                    <div className="bg-purple-50 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Check className="text-green-600 w-4 h-4" />
                                            <span className="text-sm text-purple-900 truncate max-w-[150px]">{adArtFileName}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={adArtFileUrl} target="_blank" className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 font-medium">Lihat</a>
                                            <button type="button" onClick={() => setAdArtFileUrl('')} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Hapus</button>
                                        </div>
                                    </div>
                                ) : (
                                    <PdfUploadButton onUploadComplete={(url, name) => { setAdArtFileUrl(url); setAdArtFileName(name); }} label="Upload AD/ART" />
                                )}
                            </div>
                        </div>
                    </div>


                    {/* FOOTER ACTIONS */}
                    <div className="flex items-center justify-between pt-6 border-t mt-8">
                        {currentStep > 0 ? (
                            <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                                <ArrowLeft className="w-4 h-4" /> Kembali
                            </Button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        <div className="flex gap-3">
                            {/* SAVE BUTTON: Free Simpan button if Edit Mode, else only on last step */}
                            {(isEditMode || currentStep === 3) && (
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Perubahan
                                </Button>
                            )}

                            {/* NEXT BUTTON */}
                            {currentStep < 3 && (
                                <Button type="button" onClick={nextStep} className="gap-2">
                                    Selanjutnya <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
