"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LayoutDashboard, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export type BusinessPageConfig = {
    showAssets: boolean
    showIncome: boolean
    showDebt: boolean
    showAI: boolean
}

interface BusinessPageSettingsProps {
    config: BusinessPageConfig
    setConfig?: React.Dispatch<React.SetStateAction<BusinessPageConfig>>
    onSave?: (config: BusinessPageConfig) => void
}

export function BusinessPageSettingsView({ config, setConfig, onSave }: BusinessPageSettingsProps) {

    const handleToggle = (key: keyof BusinessPageConfig) => {
        const newVal = !config[key]
        const newConfig = { ...config, [key]: newVal }

        if (onSave) {
            onSave(newConfig)
        } else if (setConfig) {
            setConfig(prev => ({
                ...prev,
                [key]: newVal
            }))
        }

        toast.success("Tampilan Diperbarui", {
            description: newVal ? "Fitur ditampilkan." : "Fitur disembunyikan."
        })
    }

    return (
        <Card className="max-w-2xl border-indigo-100 dark:border-indigo-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    Pengaturan Halaman Bisnis
                </CardTitle>
                <CardDescription>
                    Atur visibilitas tab dan module pada halaman dashboard bisnis Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="showAssets" className="font-semibold flex items-center gap-2">
                            Aset & Penyusutan
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Tampilkan tab manajemen aset (Router, Server) dan hitungan penyusutan.
                        </span>
                    </div>
                    <Switch
                        id="showAssets"
                        checked={config.showAssets}
                        onCheckedChange={() => handleToggle("showAssets")}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="showIncome" className="font-semibold flex items-center gap-2">
                            Pemasukan Lain
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Tampilkan tab untuk input pemasukan tambahan/insidental.
                        </span>
                    </div>
                    <Switch
                        id="showIncome"
                        checked={config.showIncome}
                        onCheckedChange={() => handleToggle("showIncome")}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="showDebt" className="font-semibold flex items-center gap-2">
                            Hutang Usaha
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Tampilkan manajemen hutang dan kewajiban pembayaran bulanan.
                        </span>
                    </div>
                    <Switch
                        id="showDebt"
                        checked={config.showDebt}
                        onCheckedChange={() => handleToggle("showDebt")}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="showAI" className="font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            Analisis AI & Strategi
                        </Label>
                        <span className="text-xs text-indigo-600/80 dark:text-indigo-300/80">
                            Fitur canggih untuk diagnosis kesehatan bisnis otomatis.
                        </span>
                    </div>
                    <Switch
                        id="showAI"
                        checked={config.showAI}
                        onCheckedChange={() => handleToggle("showAI")}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
