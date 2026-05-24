"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
    X, 
    CheckCircle2,
    Loader2
} from "lucide-react";
import { createTransaction } from "@/lib/actions/finance";
import { saveDebt } from "@/actions/business";
import { MoneyInput } from "@/components/ui/money-input";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface MobileInputClientProps {
    accounts: any[];
    categories: any[];
    recentTransactions: any[];
}

export function MobileInputClient({ accounts, categories, recentTransactions }: MobileInputClientProps) {
    const router = useRouter();
    const [type, setType] = useState<"expense" | "income" | "kasbon">("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [debtorName, setDebtorName] = useState("");
    const [kasbonCategory, setKasbonCategory] = useState<"kuota" | "voucher" | "other">("kuota");
    const [accountId, setAccountId] = useState(accounts[0]?.id || "");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    // Modals
    const [isScanOpen, setIsScanOpen] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const filteredCategories = categories.filter(c => c.type === type);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (type === "kasbon") {
            if (!amount || !debtorName) {
                toast.error("Lengkapi nama dan nominal");
                return;
            }
        } else {
            if (!amount || !accountId || !categoryId) {
                toast.error("Lengkapi data yang wajib");
                return;
            }
        }

        setIsLoading(true);
        try {
            const cleanAmount = amount.replace(/\D/g, "");
            
            if (type === "kasbon") {
                await saveDebt({
                    id: crypto.randomUUID(),
                    userId: "", // Handled by action
                    name: debtorName,
                    amount: cleanAmount,
                    description: description || `Kasbon ${kasbonCategory.toUpperCase()}`,
                    category: kasbonCategory,
                    type: "receivable",
                    status: "unpaid",
                    dueDate: new Date(date),
                });
                
                toast.success("Kasbon dicatat!", {
                    icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />
                });
            } else {
                const res = await createTransaction({
                    amount: cleanAmount,
                    description,
                    accountId,
                    categoryId,
                    type,
                    date: new Date(date),
                    source: "mobile"
                });

                if (res.success) {
                    toast.success("Catatan disimpan!", {
                        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    });
                } else {
                    throw new Error("Gagal menyimpan");
                }
            }
            
            router.push("/mobile/dashboard");
            router.refresh();
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Amount Input Area (Glassmorphism focus) */}
            <section className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 shadow-sm border border-primary/10">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    {type === "kasbon" ? "Nominal Kasbon" : "Nominal Transaksi"}
                </Label>
                <div className="flex items-center text-primary relative">
                    <span className="text-3xl font-black mr-2 opacity-50 transition-transform duration-300 transform origin-right">Rp</span>
                    <MoneyInput 
                        value={amount} 
                        onValueChange={setAmount} 
                        className="text-4xl font-black text-center border-none shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto w-full max-w-[240px] tabular-nums transition-transform duration-300" 
                        placeholder="0"
                        autoFocus
                    />
                </div>
            </section>

            {/* Transaction Type Selector - UPDATED TO 3 COLUMNS */}
            <section className="grid grid-cols-3 gap-2">
                <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${type === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-lg' : 'bg-surface-container-lowest dark:bg-slate-800 border-outline-variant/30 text-on-surface-variant opacity-60'}`}
                    onClick={() => setType('income')}
                >
                    <span className="material-symbols-outlined mb-1 text-2xl" style={{ fontVariationSettings: type === 'income' ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}>download</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Masuk</span>
                </motion.div>
                <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${type === 'expense' ? 'bg-rose-500/10 border-rose-500 text-rose-600 shadow-lg' : 'bg-surface-container-lowest dark:bg-slate-800 border-outline-variant/30 text-on-surface-variant opacity-60'}`}
                    onClick={() => setType('expense')}
                >
                    <span className="material-symbols-outlined mb-1 text-2xl" style={{ fontVariationSettings: type === 'expense' ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}>upload</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Keluar</span>
                </motion.div>
                <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${type === 'kasbon' ? 'bg-blue-500/10 border-blue-500 text-blue-600 shadow-lg' : 'bg-surface-container-lowest dark:bg-slate-800 border-outline-variant/30 text-on-surface-variant opacity-60'}`}
                    onClick={() => setType('kasbon')}
                >
                    <span className="material-symbols-outlined mb-1 text-2xl" style={{ fontVariationSettings: type === 'kasbon' ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}>account_balance_wallet</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Kasbon</span>
                </motion.div>
            </section>

            {/* Details Form Card */}
            <section className="glass-card p-6 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="space-y-5">
                    {type === "kasbon" ? (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2">Nama Pengutang (Kasbon)</Label>
                                <div className="relative group input-focus-ring">
                                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant z-10 text-xl group-focus-within:text-primary transition-colors">person</span>
                                    <Input 
                                        placeholder="Cth: Pak Budi" 
                                        value={debtorName} 
                                        onChange={e => setDebtorName(e.target.value)} 
                                        className="h-12 pl-12 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 border-outline-variant/30 text-sm font-bold" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2">Kategori Bisnis</Label>
                                <Select value={kasbonCategory} onValueChange={(v: any) => setKasbonCategory(v)}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant/30 text-sm font-bold px-4 input-focus-ring">
                                        <SelectValue placeholder="Pilih..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-outline-variant/20">
                                        <SelectItem value="kuota" className="rounded-xl">Kouta Internet</SelectItem>
                                        <SelectItem value="voucher" className="rounded-xl">Voucher WiFi</SelectItem>
                                        <SelectItem value="other" className="rounded-xl">Lain-lain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2 flex items-center gap-1">Kategori <span className="text-[9px] font-normal italic opacity-60">(Filter otomatis)</span></Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant/30 text-sm font-bold px-4 input-focus-ring">
                                        <SelectValue placeholder="Pilih Kategori..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-outline-variant/20">
                                        {filteredCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{cat.icon}</span>
                                                    <span>{cat.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2">Sumber/Tujuan Dana</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant/30 text-sm font-bold px-4 input-focus-ring">
                                        <SelectValue placeholder="Pilih Akun..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-outline-variant/20">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id} className="rounded-xl">{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {/* AI Quick Input */}
                    <div className="pt-1 space-y-2">
                        <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2">AI Quick Input</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="ai-btn-pulse h-12 rounded-2xl bg-primary-container/20 text-on-primary-container border-primary/20 gap-2 font-black text-[10px] uppercase tracking-wider hover:bg-primary-container/30 transition-all shadow-sm"
                                onClick={() => setIsScanOpen(true)}
                            >
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span> Scan Struk
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="ai-btn-pulse h-12 rounded-2xl bg-secondary-container/20 text-on-secondary-container border-secondary/20 gap-2 font-black text-[10px] uppercase tracking-wider shadow-sm"
                                onClick={() => setIsVoiceOpen(true)}
                            >
                                <span className="material-symbols-outlined text-[20px] animate-pulse">mic</span> Suara
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2">Tanggal</Label>
                        <div className="relative group input-focus-ring">
                            <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant z-10 text-xl group-focus-within:text-primary transition-colors">calendar_today</span>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 pl-12 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 border-outline-variant/30 text-sm font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-on-surface-variant uppercase ml-2">Catatan Tambahan</Label>
                        <div className="relative group input-focus-ring">
                            <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant z-10 text-xl group-focus-within:text-primary transition-colors">description</span>
                            <textarea 
                                placeholder="Cth: Makan siang bareng tim..." 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                className="w-full min-h-[100px] pl-12 pr-4 py-4 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 border-outline-variant/30 text-sm font-medium resize-none outline-none focus:ring-0" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Natural Bottom Save Button - Follows page flow */}
            <div className="pt-8 pb-12">
                <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={cn(
                        "w-full h-14 rounded-2xl text-[14px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden shadow-xl active:scale-[0.97]",
                        isLoading 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                            : "bg-primary text-white shadow-primary/30 hover:bg-primary/90"
                    )}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Menyimpan...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>save_as</span>
                            <span>Simpan Catatan</span>
                        </div>
                    )}
                    
                    {!isLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />}
                </Button>
            </div>

            {/* AI SCAN MODAL */}
            <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
                <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-3xl border-none p-0 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-900">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">photo_camera</span> Scan Struk
                        </DialogTitle>
                        <button onClick={() => setIsScanOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-3xl border-4 border-dashed border-primary/30 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                            <span className="material-symbols-outlined text-[64px] opacity-20">receipt_long</span>
                            <div className="absolute top-[20%] left-0 w-full h-1 bg-primary/40 animate-[scan_2.5s_linear_infinite]" />
                            <p className="absolute bottom-6 font-bold text-[10px] text-on-surface-variant text-center px-4 bg-white/80 py-1 rounded-full backdrop-blur-sm uppercase tracking-widest">Posisikan struk di dalam kotak</p>
                        </div>
                        <Button className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">photo_camera</span> Ambil Foto
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* VOICE MODAL */}
            <Dialog open={isVoiceOpen} onOpenChange={setIsVoiceOpen}>
                <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-3xl border-none p-0 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-900">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-500">mic</span> Input Suara
                        </DialogTitle>
                        <button onClick={() => setIsVoiceOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="py-12 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 relative z-10">
                                <span className="material-symbols-outlined text-[48px] animate-pulse">mic</span>
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-20" />
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-10 delay-300" />
                        </div>
                        <div className="flex gap-1.5 h-12 items-center">
                            {[1, 2, 3, 4, 5].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ scaleY: [1, 2.5, 1.2, 3, 1] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                    className="w-2 bg-indigo-500 rounded-full h-full" 
                                />
                            ))}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-black text-lg text-slate-800 dark:text-slate-100 animate-pulse uppercase tracking-tight">Mendengarkan...</p>
                            <p className="text-[12px] text-muted-foreground text-center px-10 italic leading-relaxed">"Tambahkan pengeluaran makan siang lima puluh ribu"</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
