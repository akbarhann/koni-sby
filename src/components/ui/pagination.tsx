'use client';

import { Button } from '@/components/ui/button';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (pageNumber: number) => {
        replace(createPageURL(pageNumber));
    };

    return (
        <div className="flex gap-1">
            <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
            >
                Prev
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            >
                Next
            </Button>
        </div>
    );
}
