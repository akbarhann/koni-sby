'use client';

import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AthleteFormDialog } from './athlete-form-dialog';
import { AthleteDeleteDialog } from './athlete-delete-dialog';
import { type Athlete } from '@/app/lib/actions/athlete-actions';

interface AthleteActionsCellProps {
    athlete: Athlete;
}

export function AthleteActionsCell({ athlete }: AthleteActionsCellProps) {
    return (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AthleteFormDialog
                athlete={athlete}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                }
            />
            <AthleteDeleteDialog
                athleteId={athlete.id}
                athleteName={athlete.nama}
            />
        </div>
    );
}
