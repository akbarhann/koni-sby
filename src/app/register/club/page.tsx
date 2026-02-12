import { Suspense } from 'react';
import RegisterClubForm from './register-club-form';
import { validateClubToken } from '@/app/lib/actions';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );
}

// Server Component
export default async function RegisterClubPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Await searchParams before access
    const { token } = await searchParams;
    const tokenStr = typeof token === 'string' ? token : '';
    let caborName = '';

    // If token exists, try to get Cabor name
    if (tokenStr) {
        try {
            const validation = await validateClubToken(tokenStr);
            if (validation.valid && validation.caborName) {
                caborName = validation.caborName;
            }
        } catch (error) {
            console.error('Error fetching cabor name:', error);
        }
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <RegisterClubForm initialToken={tokenStr} caborName={caborName} />
        </Suspense>
    );
}
