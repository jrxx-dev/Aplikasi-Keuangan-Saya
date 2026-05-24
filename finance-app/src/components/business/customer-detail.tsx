"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
    MapPin,
    Phone,
    Mail,
    User,
    CheckCircle2,
    XCircle,
    ImageIcon,
    Map,
    Router,
    CalendarDays,
    Activity,
    Building2
} from "lucide-react";

interface CustomerDetailProps {
    customer: any | null; // Replace 'any' with your DB Type
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CustomerDetail({ customer, open, onOpenChange }: CustomerDetailProps) {
    if (!customer) return null;

    const isActive = customer.status === 'active';
    const installDate = customer.installationDate ? new Date(customer.installationDate) : null;

    // Duration since install
    const daysInstalled = installDate
        ? Math.floor((new Date().getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[600px] p-0 gap-0 border-l border-border bg-slate-50/50">
                <SheetTitle className="sr-only">Detail Pelanggan</SheetTitle>
                <ScrollArea className="h-full w-full">

                    {/* Soft Header with Village Focus */}
                    <div className="bg-gradient-to-b from-white to-blue-50/30 px-6 pt-12 pb-8 border-b border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-4">

                            {/* Status Pill */}
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                                {isActive ? "Status Aktif" : "Non-Aktif / Suspend"}
                            </div>

                            {/* Name & Village */}
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800">{customer.name}</h2>
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Building2 className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium text-lg text-blue-600">
                                        Desa {customer.village || "Tidak Diketahui"}
                                    </span>
                                </div>
                            </div>

                            {/* Quick badges */}
                            <div className="flex flex-wrap justify-center gap-2">
                                <Badge variant="outline" className="bg-white/50 border-slate-200 text-slate-600 font-normal">
                                    ID: {customer.customerId}
                                </Badge>
                                <Badge variant="outline" className="bg-white/50 border-slate-200 text-slate-600 font-normal">
                                    {customer.servicePackage || "Regular"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <Tabs defaultValue="location" className="w-full space-y-6">
                            <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl">
                                <TabsTrigger
                                    value="location"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 text-slate-500 bg-transparent shadow-none"
                                >
                                    Lokasi & Data Teknis
                                </TabsTrigger>
                                <TabsTrigger
                                    value="profile"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 text-slate-500 bg-transparent shadow-none"
                                >
                                    Profil & Kontak
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB 1: LOCATION & TECHNICAL (The Map!) */}
                            <TabsContent value="location" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                                {/* 1. The MAP - Prominent */}
                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white">
                                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            Titik Lokasi Rumah
                                        </h3>
                                        {customer.coordinate && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${customer.coordinate}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                Buka App Maps <Map className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="w-full h-64 bg-slate-100 relative">
                                        {customer.coordinate ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                title="Customer Location"
                                                scrolling="no"
                                                src={`https://maps.google.com/maps?q=${customer.coordinate}&z=17&output=embed`}
                                                className="filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                                            ></iframe>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                                                <Map className="w-8 h-8 opacity-20" />
                                                <span className="text-sm">Koordinat tidak tersedia</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50 text-xs text-slate-500 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {customer.address || "Alamat detail belum diisi"}
                                    </div>
                                </div>

                                {/* 2. Technical / ODP Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">ODP / Jaringan</span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                            <Router className="w-4 h-4 text-indigo-500" />
                                            {customer.odpLocation || "-"}
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Masa Langganan</span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                            <CalendarDays className="w-4 h-4 text-emerald-500" />
                                            {daysInstalled > 0 ? `${daysInstalled} Hari` : "Baru"}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. House Photo */}
                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-4 space-y-3">
                                    <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-slate-400" />
                                        Foto Rumah (Visual)
                                    </h3>
                                    <div className="aspect-video relative rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                        {customer.homePhotoPath ? (
                                            <Image src={customer.homePhotoPath} alt="Rumah" fill className="object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                                <span className="text-xs">Tidak ada foto</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </TabsContent>

                            {/* TAB 2: PROFILE & CONTACT */}
                            <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                                {/* 1. Account & Wifi Access (New Request) */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
                                    <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                        <Router className="w-4 h-4 text-orange-500" />
                                        Akses Internet & Wifi
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center text-sm">
                                            <span className="text-orange-700/70">Nama Wifi (SSID)</span>
                                            <span className="font-semibold text-orange-800">{customer.wifiSsid || "-"}</span>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center text-sm">
                                            <span className="text-orange-700/70">Password Wifi</span>
                                            <span className="font-semibold text-orange-800 font-mono">{customer.wifiPassword || "-"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Contact Info */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs text-slate-400 block">WhatsApp / Telepon</span>
                                            <span className="font-medium text-slate-700">{customer.phone || "-"}</span>
                                        </div>
                                        {customer.phone && (
                                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-100 hover:bg-blue-50" asChild>
                                                <a href={`https://wa.me/${customer.phone.replace(/^0/, '62').replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                                                    Chat WA
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs text-slate-400 block">Email Address</span>
                                            <span className="font-medium text-slate-700">{customer.email || "-"}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs text-slate-400 block">Tagihan Bulanan</span>
                                            <span className="font-medium text-slate-700">Rp {parseInt(customer.monthlyFee || "0").toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Identity (NIK & KTP) */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                                    <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        Identitas Pelanggan
                                    </h3>

                                    {/* NIK Display */}
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nomor Induk Kependudukan (NIK)</span>
                                        <span className="text-lg font-mono font-medium text-slate-700 tracking-wide">{customer.nik || "-"}</span>
                                    </div>

                                    <div className="aspect-video relative rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                        {customer.ktpPhotoPath ? (
                                            <Image src={customer.ktpPhotoPath} alt="KTP" fill className="object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                                                <User className="w-8 h-8 opacity-20" />
                                                <span className="text-xs">Tidak ada scan KTP</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Notes */}
                                {customer.notes && (
                                    <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-4 space-y-2">
                                        <h3 className="font-semibold text-yellow-800 text-sm flex items-center gap-2">
                                            Catatan Tambahan
                                        </h3>
                                        <p className="text-sm text-yellow-700 leading-relaxed">
                                            {customer.notes}
                                        </p>
                                    </div>
                                )}

                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
