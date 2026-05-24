import { Car } from "lucide-react";

export function LoadingCar() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] bg-slate-50 dark:bg-zinc-950">
            <div className="relative w-64 h-32 flex flex-col items-center justify-end">

                {/* Car Animation Wrapper */}
                <div className="absolute bottom-4 animate-drive-infinite">
                    <div className="relative">
                        {/* Car Body */}
                        <div className="relative z-10 bg-indigo-500 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
                            <Car className="w-12 h-12" strokeWidth={1.5} />
                        </div>

                        {/* Motion Lines (Wind/Speed) */}
                        <div className="absolute -left-6 top-2 space-y-1 opacity-50">
                            <div className="w-4 h-0.5 bg-indigo-400 rounded-full animate-pulse" />
                            <div className="w-6 h-0.5 bg-indigo-400 rounded-full animate-pulse delay-75" />
                            <div className="w-3 h-0.5 bg-indigo-400 rounded-full animate-pulse delay-150" />
                        </div>
                    </div>
                </div>

                {/* Road */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent rounded-full mt-2 relative overflow-hidden">
                    {/* Road dashed lines moving opposite */}
                    <div className="absolute inset-0 flex justify-around animate-road-move">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-8 h-full bg-white dark:bg-black/30 transform skew-x-12" />
                        ))}
                    </div>
                </div>

                {/* Dust particles behind car */}
                <div className="absolute bottom-4 left-10 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-ping opacity-75 duration-1000" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-ping opacity-50 delay-300 duration-1000" />
                </div>
            </div>

            {/* Text */}
            <div className="text-center mt-6 space-y-1 animate-pulse">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                    Otw Menjemput Data...
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                    Mohon tunggu sebentar ya 🚗💨
                </p>
            </div>

            <style>{`
                @keyframes drive-infinite {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-1px) rotate(0.5deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(-1px) rotate(-0.5deg); }
                }
                .animate-drive-infinite {
                    animation: drive-infinite 0.5s ease-in-out infinite;
                }
                @keyframes road-move {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-road-move {
                    animation: road-move 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
