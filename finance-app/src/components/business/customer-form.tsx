"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload, MapPin, Save, X, Loader2, Search, Check, FileText, Camera, Sparkles, User, Wifi, Settings, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { createCustomer } from "@/actions/business-customer";
import { extractKtpData } from "@/actions/ocr-ktp";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPicker } from "./map-picker";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const formSchema = z.object({
    name: z.string().min(1, "Nama KTP wajib diisi"),
    nickname: z.string().optional(),
    nik: z.string().optional(),
    customerIdPrefix: z.string().min(1, "ID Pelanggan wajib diisi"),

    servicePackage: z.string().optional(),
    bandwidth: z.string().optional(),
    wifiSsid: z.string().optional(),
    wifiPassword: z.string().optional(),
    monthlyFee: z.coerce.number().default(0),
    installationDate: z.string().optional(),
    odpLocation: z.string().optional(),

    // Address
    address: z.string().optional(),
    village: z.string().min(1, "Pilih Desa"),
    // Fixed
    province: z.string(),
    regency: z.string(),
    district: z.string(),

    coordinate: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),

    ktpPhotoPath: z.string().optional(),
    homePhotoPath: z.string().optional(),
    notes: z.string().optional(),
});

export function CustomerForm({
    userId,
    initialData,
    open: controlledOpen,
    onOpenChange
}: {
    userId: string,
    initialData?: any,
    open?: boolean,
    onOpenChange?: (open: boolean) => void
}) {
    const [localOpen, setLocalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : localOpen;
    const setOpen = onOpenChange || setLocalOpen;

    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // Settings State (Persisted in LocalStorage)
    const [packages, setPackages] = useState<{ name: string, bandwidth: string, price: number }[]>([
        { name: 'Home 10M', bandwidth: '10 Mbps', price: 165000 },
        { name: 'Home 20M', bandwidth: '20 Mbps', price: 250000 },
        { name: 'Home 30M', bandwidth: '30 Mbps', price: 350000 },
        { name: 'Home 50M', bandwidth: '50 Mbps', price: 550000 },
    ]);

    // ODP List now stores village association: { village: 'Mekar Mukti', code: 'ODP-MKM-01' }
    const [odpList, setOdpList] = useState<{ village: string, code: string }[]>([
        { village: 'Mekar Mukti', code: 'ODP-MKM-01' },
        { village: 'Mekar Mukti', code: 'ODP-MKM-02' },
        { village: 'Tanjung', code: 'ODP-TNJ-01' }
    ]);

    useEffect(() => {
        const saved = localStorage.getItem('biz_settings_v1');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.packages) setPackages(parsed.packages);

                // Migration for legacy ODP list (string[]) to new format (object[])
                if (parsed.odpList) {
                    if (parsed.odpList.length > 0 && typeof parsed.odpList[0] === 'string') {
                        setOdpList(parsed.odpList.map((code: string) => ({ village: 'Umum', code: code })));
                    } else {
                        setOdpList(parsed.odpList);
                    }
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        }
    }, []);

    const updateSettings = (newPkgs: typeof packages, newOdps: typeof odpList) => {
        setPackages(newPkgs);
        setOdpList(newOdps);
        localStorage.setItem('biz_settings_v1', JSON.stringify({ packages: newPkgs, odpList: newOdps }));
    };

    const addPackage = (name: string, bandwidth: string, price: number) => {
        updateSettings([...packages, { name, bandwidth, price }], odpList);
        // Clear inputs
        (document.getElementById('new-pkg-name') as HTMLInputElement).value = '';
        (document.getElementById('new-pkg-bw') as HTMLInputElement).value = '';
        (document.getElementById('new-pkg-price') as HTMLInputElement).value = '';
    };

    const removePackage = (index: number) => {
        const newPkgs = [...packages];
        newPkgs.splice(index, 1);
        updateSettings(newPkgs, odpList);
    };

    const addOdp = (village: string, code: string) => {
        // Prevent duplicate codes
        if (!odpList.some(o => o.code === code)) {
            // Sort by village then code for better display
            const newList = [...odpList, { village, code }].sort((a, b) =>
                a.village.localeCompare(b.village) || a.code.localeCompare(b.code)
            );
            updateSettings(packages, newList);
        }
    };

    const removeOdp = (index: number) => {
        const newOdps = [...odpList];
        newOdps.splice(index, 1);
        updateSettings(packages, newOdps);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            nickname: "",
            nik: "",
            customerIdPrefix: "",
            servicePackage: "",
            bandwidth: "",
            wifiSsid: "",
            wifiPassword: "",
            monthlyFee: 0,
            installationDate: "",
            odpLocation: "",
            address: "",
            phone: "",
            email: "",
            province: "Bengkulu",
            regency: "Mukomuko",
            district: "Teras Terunjam",
            village: "",
            coordinate: "",
            ktpPhotoPath: "",
            homePhotoPath: "",
            notes: "",
        },
    });

    // Reset form when opening
    useEffect(() => {
        if (open) {
            if (initialData) {
                const idPrefix = initialData.customerId ? initialData.customerId.split('@')[0] : "";
                form.reset({
                    ...initialData,
                    customerIdPrefix: idPrefix,
                    province: initialData.province || "Bengkulu",
                    regency: initialData.regency || "Mukomuko",
                    district: initialData.district || "Teras Terunjam",
                    monthlyFee: Number(initialData.monthlyFee) || 0,
                });
            } else {
                form.reset({
                    name: "",
                    nickname: "",
                    nik: "",
                    customerIdPrefix: "",
                    servicePackage: "",
                    bandwidth: "",
                    wifiSsid: "",
                    wifiPassword: "",
                    monthlyFee: 0,
                    installationDate: "",
                    odpLocation: "",
                    address: "",
                    phone: "",
                    email: "",
                    province: "Bengkulu",
                    regency: "Mukomuko",
                    district: "Teras Terunjam",
                    village: "",
                    coordinate: "",
                    ktpPhotoPath: "",
                    homePhotoPath: "",
                    notes: "",
                });
            }
        }
    }, [open, initialData, form]);

    const handleUpload = async (file: File, field: "ktpPhotoPath" | "homePhotoPath") => {
        setIsUploading(field);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                form.setValue(field, data.url);
                toast.success("Foto berhasil diunggah");
            } else {
                toast.error("Gagal mengunggah foto");
            }
        } catch (e) {
            toast.error("Gagal mengunggah foto");
        } finally {
            setIsUploading(null);
        }
    };

    const handleScanKTP = async () => {
        const ktpPath = form.getValues("ktpPhotoPath");
        if (!ktpPath) {
            toast.error("Upload foto KTP terlebih dahulu!");
            return;
        }

        setIsScanning(true);
        try {
            const res = await extractKtpData(ktpPath);
            if (res.success && res.data) {
                const d = res.data;

                if (d.name) form.setValue("name", d.name);
                if (d.nik) form.setValue("nik", d.nik);
                if (d.address) form.setValue("address", d.address);

                // Fuzzy match or direct set for region
                // Assuming defaults are mostly correct (Mukomuko etc), but we can override if different
                // For Village, we need to be careful if it doesn't match Select values. 
                // Let's just set it and see.
                if (d.village) {
                    // Try to match specific known villages
                    if (d.village.toLowerCase().includes("tunggal")) form.setValue("village", "Tunggal Jaya");
                    else if (d.village.toLowerCase().includes("karang")) form.setValue("village", "Karang Jaya");
                    else if (d.village.toLowerCase().includes("mekar")) form.setValue("village", "Mekar Jaya");
                    // else form.setValue("village", d.village); // Might break select if not in list
                }

                toast.success("Data berhasil diekstrak dr KTP!");
            } else {
                toast.error("Gagal membaca KTP: " + res.error);
            }
        } catch (e) {
            toast.error("Terjadi kesalahan scanning.");
        } finally {
            setIsScanning(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const customerData = {
            ...values,
            customerId: `${values.customerIdPrefix}@runsnet.id`,
            monthlyFee: values.monthlyFee.toString(),
            installationDate: values.installationDate ? new Date(values.installationDate) : undefined,
        };

        try {
            const res = await createCustomer(userId, customerData);
            if (res.success) {
                toast.success(res.message);
                setOpen(false);
                form.reset();
            } else {
                toast.error(res.error);
            }
        } catch (e) {
            toast.error("Terjadi kesalahan");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Tambah Pelanggan</Button>
            </DialogTrigger>
            <DialogContent className="w-full h-full max-w-full sm:max-w-[90vw] sm:h-[90vh] flex flex-col p-0 gap-0 bg-slate-50/50">
                <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 rounded-t-lg shadow-sm z-10">
                    <div>
                        <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">Pendaftaran Pelanggan Baru</DialogTitle>
                        <DialogDescription className="text-slate-500 mt-1">Isi formulir lengkap untuk aktivasi pelanggan.</DialogDescription>
                    </div>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 overflow-hidden flex flex-col min-h-0"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const index = Array.prototype.indexOf.call(form, e.target);
                                const elements = form.querySelectorAll('input:not([type=hidden]), select, textarea, button[type=submit]');
                                for (let i = 0; i < elements.length; i++) {
                                    if (elements[i] === e.target) {
                                        const next = elements[i + 1] as HTMLElement;
                                        if (next) next.focus();
                                        break;
                                    }
                                }
                            }
                        }}
                    >

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                                {/* COL 1: IDENTITY (Width: 3/12) */}
                                <div className="col-span-12 lg:col-span-3 h-full">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 h-full flex flex-col gap-5 shadow-sm">

                                        <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-blue-200 shadow-sm">1</div>
                                            <h3 className="font-bold text-sm text-slate-800 tracking-tight">IDENTITAS</h3>
                                        </div>

                                        {/* KTP Card */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider ml-1">Foto KTP</label>
                                            <div className="relative aspect-[16/10] w-full bg-slate-50 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors group cursor-pointer">
                                                {form.watch("ktpPhotoPath") ? (
                                                    <Image src={form.getValues("ktpPhotoPath") || ""} alt="KTP" fill className="object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1">
                                                        <Camera className="w-6 h-6 mb-1 opacity-50" />
                                                        <span className="text-[9px] font-medium">Upload / Scan</span>
                                                    </div>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "ktpPhotoPath")}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={handleScanKTP}
                                                disabled={isScanning || !form.watch("ktpPhotoPath")}
                                                className="w-full h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
                                            >
                                                {isScanning ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                                                Auto-Fill Data
                                            </Button>
                                        </div>

                                        <div className="space-y-5 pt-2">
                                            <FormField control={form.control} name="nik" render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">NIK Identitas</FormLabel>
                                                    <FormControl><Input className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm" placeholder="160xxxxxxx" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Nama Lengkap</FormLabel>
                                                    <FormControl><Input className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm" placeholder="Sesuai KTP" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <div className="space-y-5">
                                                <FormField control={form.control} name="phone" render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">No. HP / WhatsApp</FormLabel>
                                                        <FormControl><Input className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm" placeholder="08xxx" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="email" render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Alamat Email</FormLabel>
                                                        <FormControl><Input className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm" placeholder="email@domain.com" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* COL 2: SERVICE (Width: 5/12) */}
                                <div className="col-span-12 lg:col-span-5 h-full">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 h-full flex flex-col gap-5 shadow-sm">

                                        <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-orange-200 shadow-sm">2</div>
                                                <h3 className="font-bold text-sm text-slate-800 tracking-tight">LAYANAN</h3>
                                            </div>

                                            {/* Smart Settings Trigger */}
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-600 gap-2 px-2 hover:bg-slate-50 transition-colors">
                                                        <Settings className="w-3.5 h-3.5" />
                                                        <span className="font-medium">Presets</span>
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent className="sm:max-w-md flex flex-col h-full p-0 gap-0">
                                                    <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-white">
                                                        <SheetTitle className="text-lg font-bold flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center"><Settings className="w-4 h-4" /></div>
                                                            Pengaturan Preset
                                                        </SheetTitle>
                                                        <SheetDescription>Atur template paket & lokasi ODP untuk input cepat.</SheetDescription>
                                                    </SheetHeader>

                                                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-8">
                                                        {/* Internet Packages Section */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tight">
                                                                    <Wifi className="w-4 h-4 text-blue-500" /> Paket Internet
                                                                </h4>
                                                                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-white">{packages.length} Paket</Badge>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-3">
                                                                {packages.map((pkg, i) => (
                                                                    <div key={i} className="group flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-1 ring-blue-100">
                                                                                {pkg.bandwidth.replace(/\D/g, '')}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-bold text-sm text-slate-800">{pkg.name}</div>
                                                                                <div className="text-xs font-medium text-slate-400">Rp {pkg.price.toLocaleString('id-ID')} /bln</div>
                                                                            </div>
                                                                        </div>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" onClick={() => removePackage(i)}>
                                                                            <Trash className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Add New Package */}
                                                            <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200">
                                                                <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Tambah Paket Baru</div>
                                                                <div className="grid grid-cols-12 gap-2">
                                                                    <div className="col-span-12 space-y-1">
                                                                        <label className="text-[10px] font-semibold text-slate-500">Nama Paket</label>
                                                                        <Input placeholder="Contoh: Super Speed 50" id="new-pkg-name" className="h-8 text-xs bg-slate-50 border-slate-200" />
                                                                    </div>
                                                                    <div className="col-span-5 space-y-1">
                                                                        <label className="text-[10px] font-semibold text-slate-500">Bandwidth</label>
                                                                        <Input placeholder="10 Mbps" id="new-pkg-bw" className="h-8 text-xs bg-slate-50 border-slate-200" />
                                                                    </div>
                                                                    <div className="col-span-7 space-y-1">
                                                                        <label className="text-[10px] font-semibold text-slate-500">Harga (Rp)</label>
                                                                        <Input placeholder="150000" type="number" id="new-pkg-price" className="h-8 text-xs bg-slate-50 border-slate-200" />
                                                                    </div>
                                                                    <Button size="sm" className="col-span-12 h-9 mt-2 w-full bg-slate-900 hover:bg-slate-800" onClick={() => {
                                                                        const name = (document.getElementById('new-pkg-name') as HTMLInputElement).value;
                                                                        const bw = (document.getElementById('new-pkg-bw') as HTMLInputElement).value;
                                                                        const price = (document.getElementById('new-pkg-price') as HTMLInputElement).value;
                                                                        if (name && bw && price) addPackage(name, bw, parseInt(price));
                                                                    }}>
                                                                        <Plus className="w-3.5 h-3.5 mr-1" /> Simpan Paket
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ODP Location Section */}
                                                        <div className="space-y-4 pt-4 border-t border-slate-200">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tight">
                                                                    <MapPin className="w-4 h-4 text-emerald-500" /> Database ODP
                                                                </h4>
                                                                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-white">{odpList.length} ODP</Badge>
                                                            </div>

                                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-semibold text-slate-500">Desa / Wilayah</label>
                                                                        <Input placeholder="Desa..." id="new-odp-village" className="h-8 text-xs bg-slate-50 border-slate-200" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-semibold text-slate-500">Kode ODP</label>
                                                                        <Input placeholder="ODP-..." id="new-odp-code" className="h-8 text-xs bg-slate-50 border-slate-200 uppercase" />
                                                                    </div>
                                                                </div>
                                                                <Button size="sm" className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-sm" onClick={() => {
                                                                    const village = (document.getElementById('new-odp-village') as HTMLInputElement).value;
                                                                    const code = (document.getElementById('new-odp-code') as HTMLInputElement).value;
                                                                    if (village && code) {
                                                                        addOdp(village, code);
                                                                        (document.getElementById('new-odp-village') as HTMLInputElement).value = ''; // keep village? maybe better to clear
                                                                        (document.getElementById('new-odp-code') as HTMLInputElement).value = '';
                                                                    }
                                                                }}>
                                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Simpan ODP
                                                                </Button>

                                                                {/* ODP List Grouped */}
                                                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2 pt-2">
                                                                    {Array.from(new Set(odpList.map(o => o.village))).map((village) => (
                                                                        <div key={village} className="space-y-1">
                                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">{village}</div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {odpList.filter(o => o.village === village).map((odp, i) => {
                                                                                    // Find original index
                                                                                    const originalIndex = odpList.findIndex(x => x === odp);
                                                                                    return (
                                                                                        <Badge key={i} variant="secondary" className="pl-2.5 pr-1 py-1 h-7 gap-1 cursor-default bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-colors group">
                                                                                            {odp.code}
                                                                                            <button type="button" onClick={() => {
                                                                                                // Quick Edit: Populate fields
                                                                                                (document.getElementById('new-odp-village') as HTMLInputElement).value = odp.village;
                                                                                                (document.getElementById('new-odp-code') as HTMLInputElement).value = odp.code;
                                                                                                // We can't easily switch to "Update" mode without state, so we remove and let user re-add
                                                                                                removeOdp(originalIndex);
                                                                                            }} className="hover:bg-white rounded-full p-0.5 text-emerald-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" title="Edit (Remove & Copy to Input)">
                                                                                                <Settings className="w-3 h-3" />
                                                                                            </button>
                                                                                            <button type="button" onClick={() => removeOdp(originalIndex)} className="hover:bg-white rounded-full p-0.5 text-emerald-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                                                                <X className="w-3 h-3" />
                                                                                            </button>
                                                                                        </Badge>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        </div>

                                        {/* Main Service Fields */}
                                        <div className="flex-1 space-y-6">
                                            <div className="p-5 bg-orange-50/50 rounded-xl border border-orange-100 space-y-5">
                                                <div className="grid grid-cols-2 gap-5">
                                                    <FormField control={form.control} name="servicePackage" render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-[11px] uppercase font-bold text-orange-600/70 tracking-wider">Pilih Paket</FormLabel>
                                                            <Select onValueChange={(val) => {
                                                                field.onChange(val);
                                                                const pkg = packages.find(p => p.name === val);
                                                                if (pkg) {
                                                                    form.setValue('bandwidth', pkg.bandwidth);
                                                                    form.setValue('monthlyFee', pkg.price);
                                                                }
                                                            }} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-10 bg-white border-orange-200 focus:ring-orange-200 text-sm"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {packages.map((p, i) => <SelectItem key={i} value={p.name}>{p.name}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="odpLocation" render={({ field }) => {
                                                        // Get current village to filter ODPs (Simple logic: if village selected, show top)
                                                        // Note: We need to trigger re-render when village changes. 
                                                        // Since we can't easily add form.watch here without refactor, we show all but sorted match first or grouped.
                                                        // Better: Show all, grouped by Village.
                                                        return (
                                                            <FormItem className="space-y-1.5">
                                                                <FormLabel className="text-[11px] uppercase font-bold text-orange-600/70 tracking-wider">Lokasi ODP</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-10 bg-white border-orange-200 focus:ring-orange-200 text-sm"><SelectValue placeholder="Pilih ODP..." /></SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="max-h-[200px]">
                                                                        {Array.from(new Set(odpList.map(o => o.village))).map((groupVillage) => (
                                                                            <div key={groupVillage}>
                                                                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 bg-slate-50">{groupVillage}</div>
                                                                                {odpList.filter(o => o.village === groupVillage).map((o, i) => (
                                                                                    <SelectItem key={`${groupVillage}-${i}`} value={o.code}>
                                                                                        {o.code}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </div>
                                                                        ))}
                                                                        {odpList.length === 0 && <div className="p-2 text-xs text-muted-foreground text-center">Belum ada ODP</div>}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        );
                                                    }} />
                                                </div>

                                                <div className="grid grid-cols-12 gap-5">
                                                    <FormField control={form.control} name="bandwidth" render={({ field }) => (
                                                        <FormItem className="col-span-4 space-y-1.5">
                                                            <FormLabel className="text-[11px] uppercase font-bold text-orange-600/70 tracking-wider">Speed</FormLabel>
                                                            <FormControl><Input className="h-10 bg-white/50 text-slate-500 border-orange-200 text-center font-bold text-sm" readOnly {...field} /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="monthlyFee" render={({ field }) => (
                                                        <FormItem className="col-span-8 space-y-1.5">
                                                            <FormLabel className="text-[11px] uppercase font-bold text-orange-600/70 tracking-wider">Tagihan Bulanan</FormLabel>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2.5 text-sm font-semibold text-orange-300">Rp</span>
                                                                <FormControl>
                                                                    <Input type="number" className="pl-9 h-10 font-bold text-lg text-orange-600 bg-white border-orange-200 focus:border-orange-500 shadow-sm" {...field} />
                                                                </FormControl>
                                                            </div>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </div>

                                            <div className="space-y-6 px-1">
                                                <FormField control={form.control} name="customerIdPrefix" render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">ID Pelanggan (PPPoE)</FormLabel>
                                                        <div className="flex rounded-lg shadow-sm">
                                                            <FormControl>
                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder="1001"
                                                                    className="h-11 text-lg font-mono font-bold border-slate-200 focus:border-blue-500 bg-white text-right pr-1 rounded-r-none rounded-l-lg border-r-0 flex-1 min-w-0"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                                        field.onChange(value);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <div className="h-11 px-4 bg-slate-100 border border-slate-200 rounded-r-lg flex items-center text-slate-500 text-sm font-medium font-mono shrink-0 select-none">
                                                                @runsnet.id
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 text-right">Preview: <span className="font-mono font-bold text-slate-600">{field.value ? field.value : '...'}@runsnet.id</span></div>
                                                    </FormItem>
                                                )} />

                                                <div className="bg-slate-50 rounded-xl p-5 border border-dashed border-slate-200">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Wifi className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Konfigurasi Wifi (Router)</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-5">
                                                        <FormField control={form.control} name="wifiSsid" render={({ field }) => (
                                                            <FormItem className="space-y-1.5">
                                                                <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Nama Wifi (SSID)</FormLabel>
                                                                <FormControl><Input placeholder="Contoh: KELUARGA_CEMARA" className="h-9 text-sm bg-white" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="wifiPassword" render={({ field }) => (
                                                            <FormItem className="space-y-1.5">
                                                                <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Password Wifi</FormLabel>
                                                                <FormControl><Input placeholder="Minimal 8 karakter" className="h-9 text-sm bg-white" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* COL 3: LOCATION (Width: 4/12) */}
                                <div className="col-span-12 lg:col-span-4 h-full">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 h-full flex flex-col gap-5 shadow-sm">

                                        <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-emerald-200 shadow-sm">3</div>
                                            <h3 className="font-bold text-sm text-slate-800 tracking-tight">LOKASI & INSTALASI</h3>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-5">
                                                <FormField control={form.control} name="village" render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Desa / Kelurahan</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-sm"><SelectValue placeholder="Pilih..." /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Tunggal Jaya">Tunggal Jaya</SelectItem>
                                                                <SelectItem value="Karang Jaya">Karang Jaya</SelectItem>
                                                                <SelectItem value="Mekar Jaya">Mekar Jaya</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="installationDate" render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Rencana Pasang</FormLabel>
                                                        <FormControl><Input type="date" className="h-10 text-sm bg-slate-50 border-slate-200" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>

                                            <FormField control={form.control} name="address" render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Alamat Lengkap</FormLabel>
                                                    <FormControl>
                                                        <textarea
                                                            className="w-full rounded-lg border border-slate-200 p-3 text-sm bg-slate-50 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 leading-relaxed"
                                                            placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name="coordinate" render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] uppercase font-bold text-slate-500">Titik Koordinat</FormLabel>
                                                    <FormControl>
                                                        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                                                            <div className="h-[150px] w-full bg-slate-100 relative">
                                                                <MapPicker value={field.value} onChange={field.onChange} />
                                                            </div>
                                                            <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <Input
                                                                        className="h-6 text-[10px] border-none bg-transparent text-slate-500 p-0 w-32 focus-visible:ring-0"
                                                                        placeholder="-2.xxxx, 101.xxxx"
                                                                        {...field}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <span className="text-[9px] text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Adjust Map</span>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )} />

                                            <div className="pt-2">
                                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                    <div className="h-10 w-10 bg-white rounded-md overflow-hidden shrink-0 border border-slate-100 relative shadow-sm">
                                                        {form.watch("homePhotoPath") ? (
                                                            <Image src={form.getValues("homePhotoPath") || ""} alt="Home" fill className="object-cover" />
                                                        ) : <div className="w-full h-full flex items-center justify-center"><Camera className="w-4 h-4 text-slate-300" /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">FOTO RUMAH (OPSIONAL)</label>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "homePhotoPath")}
                                                            className="h-6 text-[10px] file:text-[10px] file:py-0 file:h-full ps-0 border-none shadow-none bg-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTION */}
                        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0 rounded-b-lg">
                            <div className="text-xs text-slate-400">Pastikan data sudah benar sebelum simpan.</div>
                            <div className="flex gap-3">
                                <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="h-10 px-6 rounded-full text-slate-500 hover:bg-slate-100">Batal</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="h-10 px-8 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-200 mb-0">
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="w-4 h-4 mr-2" />}
                                    Simpan Data
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
