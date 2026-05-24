export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto px-6">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary animate-pulse">payments</span>
                </div>
            </div>
            <p className="mt-4 text-sm font-bold text-on-surface-variant animate-pulse tracking-widest uppercase">Memuat...</p>
        </div>
    );
}