import { Suspense } from 'react';
import CaborRegistrationForm from './cabor-registration-form';
import { getAllCaborNames } from '@/app/lib/data';
import { Loader2 } from 'lucide-react';

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-koni-light">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-koni-red animate-spin" />
                <p className="text-gray-600">Memuat data...</p>
            </div>
        </div>
    );
}

// Server component that fetches data
async function OnboardingContent() {
    const existingCabors = await getAllCaborNames();

    return <CaborRegistrationForm existingCabors={existingCabors} />;
}

export default function OnboardingCaborPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <OnboardingContent />
        </Suspense>
    );
}
