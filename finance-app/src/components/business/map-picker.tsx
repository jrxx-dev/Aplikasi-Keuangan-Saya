'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const MapPickerInternal = dynamic(
    () => import('./map-picker-internal'),
    {
        loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
        ssr: false
    }
);

export function MapPicker({ value, onChange }: { value?: string, onChange: (val: string) => void }) {
    return <MapPickerInternal value={value} onChange={onChange} />;
}
