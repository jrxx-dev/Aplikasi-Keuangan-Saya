import { LoadingCar } from "@/components/ui/loading-car";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
            <LoadingCar />
        </div>
    );
}
