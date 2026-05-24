"use client";

import { useState, useMemo } from "react";
import {
    Plus,
    Trash2,
    ShoppingCart,
    Link as LinkIcon,
    Image as ImageIcon,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ShoppingBag,
    TrendingDown,
    DollarSign,
    Wallet,
    Wand2,
    Loader2,
    Target,
    Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { toast } from "sonner";
import Image from "next/image";
import { useEffect } from "react";
import { fetchLinkMetadata } from "@/lib/actions/scraper";
import { savePlannerItems, getPlannerItems } from "@/lib/actions/planner";

// Helper: Extract name from URL slug
function extractNameFromUrl(url: string) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        const segments = path.split('/').filter(p => p.length > 0);
        // Find longest segment (usually the product slug)
        const slug = segments.sort((a, b) => b.length - a.length)[0];
        if (slug) {
            let name = slug.split('?')[0];
            if (name.includes('-i.')) name = name.substring(0, name.lastIndexOf('-i.')); // Shopee suffix removal
            name = name.replace(/-/g, ' ').replace(/_/g, ' ');
            return name.replace(/\b\w/g, c => c.toUpperCase()).substring(0, 60);
        }
    } catch { return null; }
    return null;
}

// Helper: Simple AI Classification
function classifyItem(name: string) {
    const n = name.toLowerCase();
    let category = "Lainnya";
    let priority = "Tersier (Keinginan)";
    let type = "Fisik";

    // Logic Deteksi Kategori
    if (n.match(/hp|ponsel|iphone|samsung|macbook|laptop|mouse|keyboard|monitor|tws|headset|charger|kamera/)) category = "Elektronik & Gadget";
    else if (n.match(/baju|kaos|celana|jaket|sepatu|sandal|tas|dompet|fashion/)) category = "Fashion";
    else if (n.match(/skincare|serum|wajah|sabun|shampoo|parfum|bodyshop/)) category = "Perawatan Diri";
    else if (n.match(/buku|kursus|course|ebook|webinar|kelas/)) { category = "Edukasi"; type = "Digital"; priority = "Sekunder (Upgrade Diri)"; }
    else if (n.match(/makanan|minuman|snack|kopi|roti/)) { category = "Makanan"; priority = "Sekunder"; }
    else if (n.match(/meja|kursi|lemari|rak|dekorasi|lampu|sprei/)) category = "Rumah Tangga";
    else if (n.match(/game|voucher|topup|diamond|steam|netflix|spotify/)) { category = "Hiburan"; type = "Digital"; }

    // Logic Prioritas Special
    if (n.match(/kerja|kantor|sekolah|kuliah|skripsi|bisnis/)) priority = "Produktivitas (Penting)";

    return { category, type, priority };
}

// Tipe Data untuk Barang Impian
interface DreamItem {
    id: string;
    name: string;
    price: number;
    url: string;
    imageUrl: string;
    platform: 'shopee' | 'tokopedia' | 'tiktok' | 'other';
    // AI Analysis Data
    aiCategory?: string;
    aiType?: string;
    aiPriority?: string;
    quantity: number;
    description?: string;
}

interface FinancialData {
    totalCash: number;
    monthlyIncome: number;
    monthlyExpense: number;
}

export default function PlannerClient({ financialData }: { financialData: FinancialData }) {
    // State items belanja
    const [items, setItems] = useState<DreamItem[]>([]);

    // Form States
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemUrl, setNewItemUrl] = useState("");
    const [newItemImage, setNewItemImage] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoadingLink, setIsLoadingLink] = useState(false);

    // Helper update item (for dialog)
    const updateItem = (id: string, updates: Partial<DreamItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        // Also update selectedItem if it matches
        if (selectedItem && selectedItem.id === id) {
            setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    // Planner Meta State
    const [plannerGoal, setPlannerGoal] = useState("Self Reward");

    // DB States
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DreamItem | null>(null);

    // --- LOGIC: Load Data from DB ---
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            setIsLoadingData(true);
            setIsLoaded(false);
            const res = await getPlannerItems(plannerGoal);
            if (isMounted) {
                if (res.data) {
                    setItems(res.data as DreamItem[]);
                } else {
                    setItems([]);
                }
                setIsLoaded(true);
            }
            setIsLoadingData(false);
        }

        load();
        return () => { isMounted = false; };
    }, [plannerGoal]);

    // --- LOGIC: Auto-Save Data to DB ---
    useEffect(() => {
        if (!isLoaded) return;

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            await savePlannerItems(items, plannerGoal);
            setIsSaving(false);
        }, 1500); // Debounce 1.5s

        return () => clearTimeout(timeoutId);
    }, [items, plannerGoal, isLoaded]);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await savePlannerItems(items, plannerGoal);
        setIsSaving(false);
        if (res.success) toast.success("Tersimpan! 💾");
    };

    // --- LOGIC: Auto-Fill Link (NEW) ---
    const handleAutoFillV2 = async () => {
        if (!newItemUrl) {
            toast.error("Masukkan link terlebih dahulu");
            return;
        }

        // 1. INSTANT CLIENT PARSE (Feedback Cepat)
        const instantName = extractNameFromUrl(newItemUrl);
        if (instantName) {
            setNewItemName(instantName);
            toast("Mendeteksi info produk...", { icon: "🔍" });
        } else {
            toast.loading("Menganalisis link...");
        }

        setIsLoadingLink(true);

        try {
            // 2. SERVER FETCH
            const data = await fetchLinkMetadata(newItemUrl);

            if (data.error) {
                console.warn("Scraper failed:", data.error);
                if (instantName) {
                    toast.success("Info dasar berhasil diambil dari URL!");
                } else {
                    toast.error("Gagal membaca link otomatis. Silakan isi manual.");
                }
            } else {
                if (data.title) setNewItemName(data.title.substring(0, 60));
                if (data.image) setNewItemImage(data.image);

                if (data.price) {
                    setNewItemPrice(data.price.toString());
                    toast.success("Berhasil mengambil data produk lengkap! ✨");
                } else {
                    // Logic Notifikasi Jujur
                    toast.warning("Harga Tidak Terdeteksi Otomatis", {
                        description: "Bot kami berusaha keras, tapi sistem keamanan toko ini sangat kuat. Mohon bantu ketik harga manual ya 🙏",
                        duration: 6000,
                    });
                }
            }
        } catch (e) {
            console.error(e);
            if (!instantName) toast.error("Gagal mengambil data.");
        } finally {
            setIsLoadingLink(false);
        }
    };

    // --- LOGIC: Auto-Fill Link ---
    // --- LOGIC: Auto-Fill Link ---
    const handleAutoFill = async () => {
        if (!newItemUrl) {
            toast.error("Masukkan link terlebih dahulu");
            return;
        }
        setIsLoadingLink(true);
        console.log("[AutoFill] Fetching:", newItemUrl);

        try {
            const data = await fetchLinkMetadata(newItemUrl);
            console.log("[AutoFill] Result:", data);

            if (data.error) {
                console.warn("[AutoFill] Server error:", data.error);

                // FALLBACK: Try parsing URL slug locally
                try {
                    const urlObj = new URL(newItemUrl);
                    // Shopee/Tokped logic simple slug extraction
                    // Shopee: /ProductName-i.shopid.itemid
                    // Tokopedia: /shopname/product-slug

                    const pathSegments = urlObj.pathname.split('/').filter(p => p.length > 0);
                    const lastSegment = pathSegments[pathSegments.length - 1]; // Often the slug or ID
                    const potentialSlug = pathSegments.find(s => s.length > 15 && s.includes('-')) || lastSegment;

                    if (potentialSlug && potentialSlug.includes('-')) {
                        // Cleanup slug: remove ID parts if possible (simple regex for end digits)
                        let cleanSlug = potentialSlug.split('.')[0]; // remove .123.456 (shopee)
                        cleanSlug = cleanSlug.replace(/-/g, ' ');
                        // Title Case
                        cleanSlug = cleanSlug.replace(/\b\w/g, l => l.toUpperCase());

                        setNewItemName(cleanSlug.substring(0, 50));
                        toast.warning("Link terproteksi. Mengambil Nama dari URL saja.");
                    } else {
                        toast.error(`Gagal baca link: ${data.error}`);
                    }
                } catch (err) {
                    toast.error("Link tidak valid atau terproteksi sistem.");
                }

            } else {
                if (data.title) {
                    const cleanTitle = data.title.length > 50 ? data.title.substring(0, 50) + "..." : data.title;
                    setNewItemName(cleanTitle);
                }
                if (data.image) setNewItemImage(data.image);
                if (data.price) setNewItemPrice(data.price.toString());
                toast.success("Data berhasil diambil dari Link! ✨");
            }
        } catch (e) {
            console.error("[AutoFill] Exception:", e);
            toast.error("Terjadi kesalahan system saat fetch link");
        } finally {
            setIsLoadingLink(false);
        }
    };

    // --- LOGIC: Tambah Item ---
    const handleAdd = () => {
        if (!newItemName || !newItemPrice) {
            toast.error("Nama dan Harga wajib diisi");
            return;
        }

        // 1. Sanitasi Harga (Fix NaN issue from "5.000.000")
        const cleanPrice = newItemPrice.toString().replace(/[Rp\.\,\s]/g, "");
        const numericPrice = Number(cleanPrice);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            toast.error("Format harga salah. Masukkan angka valid (cth: 500000)");
            return;
        }

        // Detect Platform
        let platform: DreamItem['platform'] = 'other';
        if (newItemUrl.includes('shopee')) platform = 'shopee';
        else if (newItemUrl.includes('tokopedia')) platform = 'tokopedia';
        else if (newItemUrl.includes('tiktok')) platform = 'tiktok';

        // 3. AI Analysis
        const analysis = classifyItem(newItemName);

        const newItem: DreamItem = {
            id: Date.now().toString(),
            name: newItemName,
            price: numericPrice,
            url: newItemUrl,
            imageUrl: newItemImage || "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2664&auto=format&fit=crop", // Placeholder
            platform,
            // Add Analysis
            aiCategory: analysis.category,
            aiType: analysis.type,
            aiPriority: analysis.priority,
            quantity: 1,
            description: ""
        };

        setItems([...items, newItem]);
        toast.success(`Barang simulasi ditambahkan!`, {
            description: `Kategori: ${analysis.category} (${analysis.priority})`
        });

        // Reset Form
        setNewItemName("");
        setNewItemPrice("");
        setNewItemUrl("");
        setNewItemImage("");
        setIsFormOpen(false);
    };

    const handleRemove = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    // --- LOGIC: Simulasi Keuangan ---
    const simulation = useMemo(() => {
        const totalShoppingCost = items.reduce((acc, curr) => acc + (curr.price * (curr.quantity || 1)), 0);
        const currentBalance = financialData.totalCash;
        const projectedBalance = currentBalance - totalShoppingCost;

        // Safety Metrics
        const impactRatio = (totalShoppingCost / currentBalance) * 100;
        const incomeRatio = (totalShoppingCost / financialData.monthlyIncome) * 100;

        let status: 'safe' | 'warning' | 'danger' = 'safe';
        let advice = "Belanjaan ini aman untuk keuanganmu.";

        if (projectedBalance < 0) {
            status = 'danger';
            advice = "BAHAYA! Saldo kamu tidak cukup untuk membeli semua ini. Jangan memaksakan diri atau berutang.";
        } else if (impactRatio > 50) {
            status = 'danger';
            advice = "Sangat Berisiko! Ini akan menghabiskan lebih dari setengah tabunganmu.";
        } else if (impactRatio > 30 || incomeRatio > 50) {
            status = 'warning';
            advice = "Hati-hati. Pembelian ini cukup besar. Pastikan kebutuhan pokok bulan ini sudah aman.";
        } else if (impactRatio < 10) {
            status = 'safe';
            advice = "Sangat Aman. Pembelian ini hanya dampak kecil pada total kekayaanmu. Go for it!";
        }

        return {
            totalShoppingCost,
            currentBalance,
            projectedBalance,
            impactRatio,
            status,
            advice
        };
    }, [items, financialData]);

    const formatRp = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-[1920px] mx-auto space-y-8">

                {/* HEADLINE */}
                <FadeIn>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent flex items-center gap-3">
                                <ShoppingBag className="w-8 h-8 text-pink-500" />
                                Budget Planner Impian
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Simulasikan belanja online-mu sebelum checkout. Pastikan dompet tetap aman! 🛍️
                            </p>
                        </div>
                        <Card className="bg-white dark:bg-zinc-900 border-l-4 border-l-emerald-500 shadow-sm">
                            <CardContent className="p-4 py-3 flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Saldo Saat Ini</p>
                                    <p className="text-lg font-bold text-emerald-600">Rp {formatRp(financialData.totalCash)}</p>
                                </div>
                                <Wallet className="w-8 h-8 text-emerald-100 fill-emerald-500" />
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: SHOPPING LIST (7 col) */}
                    <div className="md:col-span-7 space-y-6">

                        {/* PLANNER GOAL SETTING */}
                        <FadeIn delay={0.05}>
                            <Card className="border-none shadow-sm bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Target className="w-10 h-10 text-indigo-500 p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">Tujuan Planner Ini</Label>
                                            {isLoadingData && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                                        </div>
                                        <select
                                            className="w-full bg-transparent border-none text-lg font-bold p-0 focus:ring-0 text-foreground cursor-pointer outline-none"
                                            value={plannerGoal}
                                            onChange={(e) => setPlannerGoal(e.target.value)}
                                        >
                                            <option value="Self Reward">🎁 Self Reward / Hadiah Diri</option>
                                            <option value="Kamar Impian">🛏️ Kamar Impian / Setup Room</option>
                                            <option value="Kebutuhan Kerja">💼 Kebutuhan Kerja / Produktivitas</option>
                                            <option value="Upgrade Setup">💻 Upgrade Setup / Gadget</option>
                                            <option value="Kado Orang Lain">🎀 Kado untuk Orang Lain</option>
                                            <option value="Impian Jangka Panjang">🌟 Impian Jangka Panjang</option>
                                            <option value="Lainnya">📝 Keperluan Lainnya</option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving || isLoadingData}
                                        size="sm"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        {isSaving ? "Saving..." : "Simpan"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* INPUT CARD */}
                        <FadeIn delay={0.1}>
                            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b dark:border-zinc-800">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-blue-500" />
                                        Tambah Barang Impian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {/* Link Input First for Auto-Fill Convenience */}
                                    <div className="space-y-2">
                                        <Label>Link Produk (Paste link Shopee/Tokped di sini)</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-9"
                                                    placeholder="https://shopee.co.id/..."
                                                    value={newItemUrl}
                                                    onChange={e => setNewItemUrl(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                variant="secondary"
                                                className="shrink-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                onClick={handleAutoFillV2}
                                                disabled={isLoadingLink || !newItemUrl}
                                            >
                                                {isLoadingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                                {isLoadingLink ? "Fetching..." : "Auto-Fill"}
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Fitur Auto-Fill akan mencoba mengambil Nama & Gambar otomatis.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Barang</Label>
                                            <Input
                                                placeholder="Contoh: Sony WH-1000XM5"
                                                value={newItemName}
                                                onChange={e => setNewItemName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Harga (IDR)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                                                <Input
                                                    className="pl-9"
                                                    type="text"
                                                    placeholder="5.000.000"
                                                    value={newItemPrice}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, "");
                                                        setNewItemPrice(raw ? new Intl.NumberFormat("id-ID").format(Number(raw)) : "");
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>



                                    <div className="space-y-2">
                                        <Label>Link Gambar (Opsional)</Label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                placeholder="https://image-url.com/..."
                                                value={newItemImage}
                                                onChange={e => setNewItemImage(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Masukkan ke Keranjang Simulasi
                                    </Button>
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* LIST ITEMS */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                Keranjang Belanjaan
                                <Badge variant="secondary" className="rounded-full">{items.length}</Badge>
                            </h3>

                            {items.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-200 dark:border-zinc-800">
                                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">Keranjang masih kosong</p>
                                    <p className="text-sm text-slate-400">Tambahkan barang impianmu di atas</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <motion.div
                                                layout
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                onClick={() => setSelectedItem(item)}
                                                className="group cursor-pointer bg-white dark:bg-zinc-900 p-3 rounded-xl border hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md flex gap-4 items-center"
                                            >
                                                {/* Left: Square Image */}
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative border">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    {(item.quantity || 1) > 1 && (
                                                        <Badge className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm border-none text-white text-[10px] h-5 px-1.5 z-10">
                                                            {item.quantity}x
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Middle: Details */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground/90 leading-snug group-hover:text-blue-600 transition-colors">
                                                            {item.name}
                                                        </h4>
                                                    </div>

                                                    {/* Badges */}
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {item.platform === 'shopee' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none text-[9px] h-4 px-1" variant="outline">Shopee</Badge>}
                                                        {item.platform === 'tokopedia' && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none text-[9px] h-4 px-1" variant="outline">Tokopedia</Badge>}

                                                        {item.aiCategory && <span className="text-[10px] text-muted-foreground">• {item.aiCategory}</span>}
                                                    </div>

                                                    <div className="flex items-end gap-2 mt-1">
                                                        {item.price > 0 ? (
                                                            <p className="text-sm font-bold text-blue-600">Rp {formatRp(item.price * (item.quantity || 1))}</p>
                                                        ) : (
                                                            <div
                                                                className="text-xs font-bold text-rose-600 bg-rose-100 border border-rose-200 px-2 py-1 rounded cursor-pointer flex items-center gap-1 hover:bg-rose-200 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedItem(item);
                                                                }}
                                                            >
                                                                <AlertTriangle className="w-3 h-3" />
                                                                Isi Harga
                                                            </div>
                                                        )}

                                                        {(item.quantity || 1) > 1 && item.price > 0 && (
                                                            <span className="text-[10px] text-muted-foreground mb-0.5">(@ Rp {formatRp(item.price)})</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.url && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="text-slate-400 hover:text-blue-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(item.url, '_blank');
                                                            }}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemove(item.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* DETAIL DIALOG */}
                        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Detail Barang Impian</DialogTitle>
                                </DialogHeader>

                                {selectedItem && (
                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        {/* Visual Left */}
                                        <div className="space-y-4">
                                            <div className="relative aspect-square md:aspect-video rounded-xl overflow-hidden border bg-slate-100">
                                                <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {selectedItem.platform === 'shopee' && <Badge className="bg-orange-500 hover:bg-orange-600 cursor-pointer">Shopee</Badge>}
                                                {selectedItem.platform === 'tokopedia' && <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">Tokopedia</Badge>}
                                                {selectedItem.url && <a href={selectedItem.url} target="_blank" className="text-xs text-blue-500 underline flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Buka Link Original</a>}
                                            </div>
                                            {/* AI Analysis Info */}
                                            <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg text-xs space-y-1">
                                                <p><span className="font-semibold">Kategori:</span> {selectedItem.aiCategory || '-'}</p>
                                                <p><span className="font-semibold">Prioritas:</span> {selectedItem.aiPriority || '-'}</p>
                                            </div>
                                        </div>

                                        {/* Controls Right */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Nama Barang</Label>
                                                <Input value={selectedItem.name} readOnly className="font-bold bg-slate-50 border-none focus-visible:ring-0" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Harga Satuan</Label>
                                                    <div className="font-mono text-sm p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-md border border-transparent">
                                                        Rp {formatRp(selectedItem.price)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Jumlah (Qty)</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={selectedItem.quantity || 1}
                                                        onChange={(e) => updateItem(selectedItem.id, { quantity: parseInt(e.target.value) || 1 })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Catatan / Deskripsi Tambahan</Label>
                                                <Textarea
                                                    placeholder="Contoh: Warna Hitam, Ukuran XL, atau alasan beli..."
                                                    value={selectedItem.description || ""}
                                                    onChange={(e) => updateItem(selectedItem.id, { description: e.target.value })}
                                                    className="h-24 resize-none"
                                                />
                                            </div>

                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-900/50">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Estimasi</p>
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    Rp {formatRp(selectedItem.price * (selectedItem.quantity || 1))}
                                                </p>
                                            </div>

                                            <Button variant="destructive" className="w-full" onClick={() => {
                                                handleRemove(selectedItem.id);
                                                setSelectedItem(null);
                                            }}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Hapus Barang Ini
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* RIGHT COLUMN: SIMULATOR DASHBOARD (5 col) */}
                    <div className="md:col-span-5 space-y-6 sticky top-8">

                        <FadeIn delay={0.2}>
                            <Card className={`border-none shadow-xl overflow-hidden ${simulation.status === 'safe' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                                simulation.status === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                    'bg-gradient-to-br from-rose-500 to-red-600'
                                } text-white`}>
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-2 opacity-90">
                                        <TrendingDown className="w-5 h-5" />
                                        <span className="font-medium text-sm uppercase tracking-wider">Hasil Simulasi</span>
                                    </div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        {simulation.status === 'safe' && <><CheckCircle2 className="w-8 h-8" /> Aman Terkendali</>}
                                        {simulation.status === 'warning' && <><AlertTriangle className="w-8 h-8" /> Hati-hati!</>}
                                        {simulation.status === 'danger' && <><XCircle className="w-8 h-8" /> Bahaya!</>}
                                    </CardTitle>
                                    <CardDescription className="text-white/80 font-medium">
                                        {simulation.advice}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 bg-black/10 backdrop-blur-sm p-6">
                                    {/* SIMULATION BARS */}
                                    <div className="space-y-4">

                                        {/* Total Harga */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/80">Total Belanjaan</span>
                                                <span className="font-bold">Rp {formatRp(simulation.totalShoppingCost)}</span>
                                            </div>
                                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white"
                                                    style={{ width: `${Math.min(100, simulation.impactRatio)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Sisa Saldo */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/80">Estimasi Sisa Saldo</span>
                                                <span className={`font-bold ${simulation.projectedBalance < 0 ? "text-red-200" : "text-white"}`}>
                                                    Rp {formatRp(simulation.projectedBalance)}
                                                </span>
                                            </div>
                                            {/* Visualisasi sisa saldo */}
                                            <div className="h-4 bg-white/20 rounded-full overflow-hidden relative border border-white/30">
                                                {/* Bar Saldo Awal */}
                                                <div className="absolute top-0 left-0 h-full bg-white/40 w-full" />

                                                {/* Bar Pengurangan (Merah/Gelap) */}
                                                <div
                                                    className="absolute top-0 right-0 h-full bg-black/50 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, simulation.impactRatio)}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-white/70 text-right">
                                                Belanjaan ini memakai <span className="font-bold">{simulation.impactRatio.toFixed(1)}%</span> dari total saldomu.
                                            </p>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* DETAIL ANALYSIS */}
                        <FadeIn delay={0.3}>
                            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Analisis Masuk Akal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                                <Wallet className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Dana Tersedia</p>
                                                <p className="text-xs text-muted-foreground">Sebelum belanja</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-emerald-600">Rp {formatRp(financialData.totalCash)}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                                                <ShoppingCart className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Total Keranjang</p>
                                                <p className="text-xs text-muted-foreground">{items.length} Barang</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-rose-600">- Rp {formatRp(simulation.totalShoppingCost)}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between p-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${simulation.projectedBalance < 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Saldo Akhir</p>
                                                <p className="text-xs text-muted-foreground">Setelah checkout</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-lg ${simulation.projectedBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                            Rp {formatRp(simulation.projectedBalance)}
                                        </span>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/30 text-xs text-yellow-800 dark:text-yellow-200">
                                        💡 <span className="font-bold">Tips Cerdas:</span> Jika Rasio Belanja &gt; 30% dari saldo, pertimbangkan untuk menunda pembelian atau menabung dulu lewat fitur Goals.
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>

                    </div>
                </div>
            </div>
        </div>
    );
}
