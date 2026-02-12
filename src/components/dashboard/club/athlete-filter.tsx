'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function AthleteFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentGender = searchParams.get('gender') || 'all';

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (value && value !== 'all') {
            params.set('gender', value);
        } else {
            params.delete('gender');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Select
            value={currentGender}
            onValueChange={handleFilterChange}
        >
            <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Filter Gender" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Semua Gender</SelectItem>
                <SelectItem value="MALE">Laki-laki</SelectItem>
                <SelectItem value="FEMALE">Perempuan</SelectItem>
            </SelectContent>
        </Select>
    );
}
