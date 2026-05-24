"use client"

import * as React from "react"
import { Building2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"

export type CompanyInfo = {
    myCompanyName: string
    myCompanyDesc: string
    partnerName: string
    partnerDesc: string
}

interface BusinessSettingsViewProps {
    info: CompanyInfo
    setInfo?: React.Dispatch<React.SetStateAction<CompanyInfo>>
    onSave?: (info: CompanyInfo) => void
}

export function BusinessSettingsView({ info, setInfo, onSave }: BusinessSettingsViewProps) {
    // Local state for editing before save
    const [formData, setFormData] = React.useState<CompanyInfo>(info)

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = () => {
        if (onSave) {
            onSave(formData)
        } else if (setInfo) {
            setInfo(formData)
        }
        toast.success("Pengaturan Disimpan", {
            description: "Informasi bisnis telah diperbarui."
        })
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-xl">Profil Perusahaan & Mitra</CardTitle>
                    <CardDescription>
                        Informasi ini akan ditampilkan pada Laporan Keuangan dan Halaman Dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Section 1: My Company */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-lg">Perusahaan Utama (Anda)</h3>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="myCompanyName">Nama Entitas / PT</Label>
                                <Input
                                    id="myCompanyName"
                                    name="myCompanyName"
                                    value={formData.myCompanyName}
                                    onChange={handleChange}
                                    placeholder="Contoh: PT. NET SYNERGY INOVATE"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="myCompanyDesc">Deskripsi / Peran</Label>
                                <Textarea
                                    id="myCompanyDesc"
                                    name="myCompanyDesc"
                                    value={formData.myCompanyDesc}
                                    onChange={handleChange}
                                    placeholder="Contoh: Pemilik Infrastruktur Last-Mile & Manajemen Pelanggan."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Partner Company */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Building2 className="w-5 h-5 text-teal-600" />
                            <h3 className="font-semibold text-lg">Mitra Kerjasama</h3>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="partnerName">Nama Mitra / PT</Label>
                                <Input
                                    id="partnerName"
                                    name="partnerName"
                                    value={formData.partnerName}
                                    onChange={handleChange}
                                    placeholder="Contoh: PT. RUBYAN NETWORK SOLUTION"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="partnerDesc">Deskripsi / Peran</Label>
                                <Textarea
                                    id="partnerDesc"
                                    name="partnerDesc"
                                    value={formData.partnerDesc}
                                    onChange={handleChange}
                                    placeholder="Contoh: Penyedia Bandwidth Hulu & Core Network."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t p-6 flex justify-end">
                    <Button onClick={handleSave} className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Save className="w-4 h-4" />
                        Simpan Perubahan
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
