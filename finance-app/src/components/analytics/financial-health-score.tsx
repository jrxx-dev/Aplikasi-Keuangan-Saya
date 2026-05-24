"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    TrendingUp,
    Gem,
    Target,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";

interface HealthMetric {
    name: string;
    score: number;
    maxScore: number;
    status: "excellent" | "good" | "fair" | "poor";
    description: string;
    recommendation: string;
}

export function FinancialHealthScore() {
    // Mock data - replace with real calculations
    const overallScore = 75;

    const metrics: HealthMetric[] = [
        {
            name: "Dana Darurat",
            score: 85,
            maxScore: 100,
            status: "excellent",
            description: "Anda memiliki cadangan pengeluaran selama 5.2 bulan",
            recommendation: "Luar biasa! Pertahankan level ini untuk keamanan finansial."
        },
        {
            name: "Tingkat Tabungan",
            score: 70,
            maxScore: 100,
            status: "good",
            description: "Menabung 22% dari pendapatan bulanan",
            recommendation: "Progres bagus! Usahakan mencapai 30% untuk pembentukan kekayaan optimal."
        },
        {
            name: "Rasio Hutang vs Pendapatan",
            score: 60,
            maxScore: 100,
            status: "fair",
            description: "Pembayaran hutang mencapai 35% dari pendapatan",
            recommendation: "Pertimbangkan mengurangi hutang hingga di bawah 30% pendapatan."
        },
        {
            name: "Kontrol Pengeluaran",
            score: 55,
            maxScore: 100,
            status: "fair",
            description: "Pengeluaran meningkat 12% bulan lalu",
            recommendation: "Lacak dan kategorikan pengeluaran untuk menemukan area penghematan."
        },
        {
            name: "Diversifikasi Investasi",
            score: 40,
            maxScore: 100,
            status: "poor",
            description: "Portofolio investasi terbatas",
            recommendation: "Mulai bangun portofolio investasi yang terdiversifikasi."
        }
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-blue-600";
        if (score >= 40) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return "from-green-500 to-emerald-500";
        if (score >= 60) return "from-blue-500 to-indigo-500";
        if (score >= 40) return "from-yellow-500 to-orange-500";
        return "from-red-500 to-rose-500";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "excellent":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "good":
                return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            case "fair":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "poor":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-slate-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "excellent":
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Sangat Baik</Badge>;
            case "good":
                return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Baik</Badge>;
            case "fair":
                return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Cukup</Badge>;
            case "poor":
                return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Perlu Perbaikan</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="w-6 h-6 text-indigo-500" />
                            Skor Kesehatan Finansial
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Analisis komprehensif kesejahteraan finansial Anda
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Overall Score */}
                <div className="relative">
                    <Card className={`bg-gradient-to-br ${getScoreGradient(overallScore)} text-white border-none shadow-lg overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="w-32 h-32" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Skor Kesehatan Keseluruhan</p>
                            <div className="flex items-end gap-4 mb-4">
                                <h2 className="text-6xl font-black">{overallScore}</h2>
                                <span className="text-2xl font-bold mb-2">/100</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {overallScore >= 80 && (
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Kesehatan Finansial Sangat Baik
                                    </Badge>
                                )}
                                {overallScore >= 60 && overallScore < 80 && (
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Progres Baik
                                    </Badge>
                                )}
                                {overallScore < 60 && (
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Perlu Peningkatan
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-500" />
                        Rincian Kesehatan
                    </h3>

                    {metrics.map((metric, index) => (
                        <Card key={index} className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getStatusIcon(metric.status)}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-sm mr-1">{metric.name}</h4>
                                                {getStatusBadge(metric.status)}
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                                {metric.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                                            {metric.score}
                                        </p>
                                        <p className="text-xs text-slate-500">/{metric.maxScore}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Progress
                                        value={(metric.score / metric.maxScore) * 100}
                                        className="h-2"
                                        indicatorColor={
                                            metric.status === "excellent" ? "bg-green-500" :
                                                metric.status === "good" ? "bg-blue-500" :
                                                    metric.status === "fair" ? "bg-yellow-500" :
                                                        "bg-red-500"
                                        }
                                    />
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-500" />
                                            <span>{metric.recommendation}</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary Insight */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                <Gem className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Rekomendasi Utama</h4>
                                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-indigo-500 mt-0.5">•</span>
                                        <span>Fokus membangun portofolio investasi Anda untuk meningkatkan diversifikasi</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-indigo-500 mt-0.5">•</span>
                                        <span>Kurangi pembayaran hutang untuk membebaskan modal bagi tabungan dan investasi</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-indigo-500 mt-0.5">•</span>
                                        <span>Pertahankan dana darurat yang sudah sangat baik - ini adalah jaring pengaman finansial Anda</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
