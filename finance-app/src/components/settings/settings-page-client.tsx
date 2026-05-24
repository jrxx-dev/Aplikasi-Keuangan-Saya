"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    User, Users, Bell, Shield, Palette, Database, Globe, Smartphone, Mail, Lock,
    Eye, EyeOff, Save, Trash2, Download, Upload, Moon, Sun, Monitor, Zap,
    DollarSign, Calendar, AlertTriangle, CheckCircle2, Server, Terminal,
    Code, RefreshCw, LogOut, LayoutDashboard, Cpu, HardDrive,
    Briefcase, MapPin,
    Bot, BrainCircuit, Workflow, Link2, MessageSquare, Share2,
    Activity, Settings, Flag, Loader2, Copy
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useThemeColor } from "@/components/theme-color-manager";
import { DatabaseStatus } from "@/components/settings/database-status";
import { DatabaseMetrics } from "@/components/settings/database-metrics";
import { DatabaseAdvancedMonitoring } from "@/components/settings/database-advanced-monitoring";
import { DeveloperOptions } from "@/components/settings/developer-options";
import { DataStorageManager } from "@/components/settings/data-storage-manager";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { RolePermissions } from "@/components/settings/role-permissions";
import { UserManagement } from "@/components/settings/user-management";
import { disconnectTelegram } from "@/lib/actions/telegram";
import { updateProfile, updatePassword } from "@/lib/actions/update-profile";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/providers/language-provider";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    // Extended properties from metadata (optional chaining in usage)
    job?: string;
    location?: string;
    website?: string;
    phone?: string;
}

interface SettingsPageClientProps {
    user: User;
    providers: string[];
    telegramData?: {
        connected: boolean;
        username: string | null;
        chatId: string | null;
    } | null;
}


// Language Preference Selector Component
function LanguagePreferenceSelector() {
    const { language, setLanguage, t } = useLanguage();
    const [selectedLang, setSelectedLang] = useState<'id' | 'en'>(language);
    const [isSaving, setIsSaving] = useState(false);

    console.log("LanguagePreferenceSelector - Current language:", language, "Selected:", selectedLang);


    const handleSave = async () => {
        setIsSaving(true);

        try {
            await setLanguage(selectedLang);
            toast.success(
                selectedLang === 'id'
                    ? '✅ Bahasa berhasil diubah ke Indonesia'
                    : '✅ Language successfully changed to English',
                { duration: 3000 }
            );
        } catch (error) {
            toast.error('Gagal menyimpan preferensi bahasa');
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = selectedLang !== language;

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div
                    onClick={() => setSelectedLang('id')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedLang === 'id'
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                            : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🇮🇩</div>
                        <div>
                            <p className="font-semibold">Bahasa Indonesia</p>
                            <p className="text-xs text-muted-foreground">Indonesian</p>
                        </div>
                    </div>
                    {selectedLang === 'id' && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                </div>

                <div
                    onClick={() => setSelectedLang('en')}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedLang === 'en'
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                            : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🇬🇧</div>
                        <div>
                            <p className="font-semibold">English</p>
                            <p className="text-xs text-muted-foreground">English (US)</p>
                        </div>
                    </div>
                    {selectedLang === 'en' && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                </div>
            </div>

            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        {t('settings.unsavedChanges')}
                    </p>
                </motion.div>
            )}

            <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="w-full"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('settings.saving')}
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        {t('settings.saveChanges')}
                    </>
                )}
            </Button>
        </div>
    );
}


export function SettingsPageClient({ user, providers, telegramData }: SettingsPageClientProps) {
    const { theme, setTheme } = useTheme();
    const { color, setColor } = useThemeColor();
    const { t } = useLanguage();
    console.log("DEBUG USER:", user);

    const colorOptions = [
        { id: "default", label: "Indigo (Default)", class: "bg-indigo-500" },
        { id: "green", label: "Emerald", class: "bg-emerald-500" },
        { id: "violet", label: "Violet", class: "bg-violet-500" },
        { id: "rose", label: "Rose", class: "bg-rose-500" },
        { id: "orange", label: "Amber", class: "bg-orange-500" },
        { id: "sky", label: "Sky Blue", class: "bg-sky-500" },
        { id: "lime", label: "Neon Lime", class: "bg-lime-500" },
    ];

    // Dynamic Settings Navigation with i18n
    const navItems = [
        {
            category: t('settings.account'),
            items: [
                { id: "profile", label: t('settings.myProfile'), icon: User },
                { id: "security", label: t('settings.loginSecurity'), icon: Shield },
                { id: "notifications", label: t('settings.notifications'), icon: Bell },
                { id: "users", label: t('settings.userManagement'), icon: Users },
            ]
        },
        {
            category: t('settings.application'),
            items: [
                { id: "appearance", label: t('settings.appearanceTheme'), icon: Palette },
                { id: "preferences", label: t('settings.preferences'), icon: Globe },
            ]
        },
        {
            category: t('settings.systemBackend'),
            items: [
                { id: "data", label: t('settings.dataStorage'), icon: Database },
                { id: "system", label: t('settings.systemHealth'), icon: Server },
                { id: "roles", label: t('settings.rolePermissions'), icon: Shield },
                { id: "developer", label: t('settings.developerOptions'), icon: Code },
            ]
        },
        {
            category: t('settings.extensions'),
            items: [
                { id: "integrations", label: t('settings.integrations'), icon: Link2 },
                { id: "ai-assistant", label: t('settings.aiConfig'), icon: BrainCircuit },
            ]
        }
    ];

    const [activeTab, setActiveTab] = useState("profile");
    const [mounted, setMounted] = useState(false);

    // Initial hydration fix
    useEffect(() => setMounted(true), []);

    // --- STATES ---
    const [profileData, setProfileData] = useState({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "", // Cast as any temporarily if user type not fully synced
        bio: "Financial enthusiast exploring the future of wealth management.",
        job: "Senior Financial Manager",
        location: "Jakarta, Indonesia",
        website: "https://finance.my/me"
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        transactionAlerts: true,
        budgetAlerts: true,
        weeklyReport: true,
        monthlyReport: true
    });

    const [security, setSecurity] = useState({
        twoFactorEnabled: false,
        biometricEnabled: true,
        sessionTimeout: "30"
    });

    const [appConfig, setAppConfig] = useState({
        animationSpeed: "normal",
        reduceMotion: false,
        glassmorphism: true,
        fontType: "Parkinsans"
    });

    const [passwordData, setPasswordData] = useState({
        current: "",
        new: ""
    });

    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Preview & Dialog States
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const handleCopyId = async () => {
        try {
            if (!user?.id) {
                toast.error("ID User tidak ditemukan");
                return;
            }
            await navigator.clipboard.writeText(user.id);
            toast.success("ID berhasil disalin!");
        } catch (err) {
            console.error("Copy failed:", err);
            toast.error("Gagal menyalin ID");
        }
    };

    // 1. Handle File Selection -> Show Preview Dialog
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validasi ukuran (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar (Max 2MB)");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
        setIsPreviewOpen(true);

        // Reset input agar bisa pilih file yang sama jika dicancel
        event.target.value = "";
    };

    // 2. Confirm Upload -> Process to Server
    const confirmUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        // const toastId = toast.loading("Mengupload avatar..."); // Disable toast loading, use UI loading

        try {
            const supabase = createClient();
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload ke Bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, selectedFile);

            if (uploadError) {
                if (uploadError.message.includes("Bucket not found")) {
                    throw new Error("Bucket 'avatars' belum dibuat di Supabase Dashboard.");
                }
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update Profile Data
            const result = await updateProfile({ image: publicUrl });
            if (!result.success) throw new Error(result.error);

            // Update local state and refresh
            setProfileData(prev => ({ ...prev, image: publicUrl }));
            router.refresh();

            // Close preview, show success
            setIsPreviewOpen(false);
            setTimeout(() => setIsSuccessOpen(true), 300); // Delay sedikit untuk animasi

            // toast.success("Avatar berhasil diganti!", { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(`Gagal upload: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const cancelUpload = () => {
        setIsPreviewOpen(false);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    // --- HANDLERS ---
    const handleSave = async (section: string) => {
        if (section === 'Profil') {
            const promise = updateProfile({
                name: profileData.name,
                job: profileData.job,
                location: profileData.location,
                website: profileData.website,
                phone: profileData.phone,
                bio: profileData.bio
            });

            toast.promise(promise, {
                loading: 'Menyimpan profil...',
                success: () => {
                    router.refresh();
                    return 'Profil berhasil diperbarui!';
                },
                error: (err) => `Gagal update: ${err.message}`
            });
        }

        if (section === 'Password') {
            if (!passwordData.new || passwordData.new.length < 6) {
                toast.error("Password minimal 6 karakter");
                return;
            }

            const promise = updatePassword(passwordData.new);

            toast.promise(promise, {
                loading: 'Mengupdate password...',
                success: () => {
                    setPasswordData({ current: "", new: "" });
                    return 'Password berhasil diubah!';
                },
                error: (err) => `Gagal: ${err.message}`
            });
        }

        // Handling dummy saves for other sections
        if (section !== 'Profil' && section !== 'Password') {
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1000)),
                {
                    loading: `Menyimpan pengaturan ${section}...`,
                    success: `Pengaturan ${section} berhasil disimpan!`,
                    error: "Gagal menyimpan"
                }
            );
        }
    };

    if (!mounted) return null;

    return (
        // FIXED LAYOUT CONTAINER
        <div className="h-[calc(100vh-5rem)] flex flex-col p-4 lg:p-6 gap-4 max-w-[1600px] mx-auto w-full">

            {/* Sticky Header Area */}
            <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Control Center
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Kelola seluruh aspek aplikasi dari Frontend hingga Backend
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 gap-1.5 h-8 bg-white/50 backdrop-blur">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Online v2.4.0
                    </Badge>
                </div>
            </div>

            {/* Main Content Layout - Takes remaining height */}
            <Card className="flex-1 overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-3xl border-white/20 dark:border-white/10 shadow-2xl rounded-3xl grid grid-cols-12 relative isolate">

                {/* --- SIDEBAR (Independent Scroll) --- */}
                <aside className="col-span-12 md:col-span-3 lg:col-span-3 border-r border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 h-full overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        {navItems.map((group) => (
                            <div key={group.category} className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">
                                    {group.category}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                                                )}
                                            >
                                                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                                {item.label}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-pill"
                                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* User Mini Profile Bottom */}
                    <div className="p-4 mt-auto border-t border-white/10 bg-primary/5 mx-4 mb-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white/20">
                                <AvatarImage src={user.image} />
                                <AvatarFallback>JA</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* --- CONTENT AREA (Independent Scroll) --- */}
                <main className="col-span-12 md:col-span-9 lg:col-span-9 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8 max-w-4xl"
                        >
                            {/* --- TAB: PROFILE (ULTRA CLEAN DESIGN) --- */}
                            {activeTab === 'profile' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* 1. Hero Card: Modern Mesh Gradient */}
                                    <div className="relative group rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/5">

                                        {/* Banner Background */}
                                        <div className="h-56 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-400 opacity-90"></div>
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay brightness-100"></div>
                                            <div className="absolute top-0 right-0 p-24 bg-white opacity-20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                                            <div className="absolute bottom-0 left-0 p-32 bg-indigo-900 opacity-20 blur-3xl rounded-full -translate-x-10 translate-y-10"></div>

                                            {/* Badge Overlay */}
                                            <div className="absolute top-6 right-8 flex gap-3">
                                                <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
                                                    ✨ Pro Member
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-10 pb-10 relative">
                                            {/* Floating Avatar */}
                                            <div className="flex flex-col md:flex-row gap-6 items-start -mt-20">
                                                <div className="relative group/avatar">
                                                    <div className="absolute inset-0 bg-white/30 dark:bg-black/30 rounded-full blur-xl transform scale-105 group-hover/avatar:scale-110 transition-all duration-500"></div>
                                                    <Avatar
                                                        className="w-40 h-40 border-4 border-white dark:border-zinc-900 shadow-2xl cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <AvatarImage src={user.image} className="object-cover bg-white" />
                                                        <AvatarFallback className="text-5xl bg-zinc-100 text-zinc-400 font-thin">
                                                            {isUploading ? <Loader2 className="animate-spin text-indigo-500" /> : user.name?.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>

                                                        {/* Hover Upload Overlay */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                                                            <Upload className="w-8 h-8 text-white mb-1" />
                                                            <span className="text-[10px] text-white font-medium tracking-wider uppercase">Change</span>
                                                        </div>
                                                    </Avatar>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                    />
                                                    {/* Online Indicator */}
                                                    <div className="absolute bottom-4 right-4 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm" title="Active Now"></div>
                                                </div>

                                                {/* Profile Header Info */}
                                                <div className="pt-20 md:pt-24 flex-1">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                        <div>
                                                            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                                                                {profileData.name}
                                                            </h2>
                                                            <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                                                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-indigo-500" /> {profileData.job}</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {profileData.location}</span>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-3">
                                                            <Button
                                                                variant="outline"
                                                                className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 h-12 px-6"
                                                                onClick={() => window.open(profileData.website, '_blank')}
                                                            >
                                                                Link
                                                            </Button>
                                                            <Button
                                                                className="rounded-xl bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 h-12 px-8 font-semibold shadow-xl shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40"
                                                                onClick={() => handleSave('Profil')}
                                                            >
                                                                Simpan Perubahan
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Stats Grid - Inside Hero Card for cleaner look */}
                                        <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5 divide-x divide-slate-100 dark:divide-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
                                            <div className="p-4 flex flex-col items-center justify-center hover:bg-white/50 transition-colors cursor-default">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Status</span>
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Active</Badge>
                                            </div>
                                            <div className="p-4 flex flex-col items-center justify-center hover:bg-white/50 transition-colors cursor-default">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Joined</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-200">Dec 2023</span>
                                            </div>
                                            <div className="p-4 flex flex-col items-center justify-center hover:bg-white/50 transition-colors cursor-default">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Completion</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">85%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Main Content Grid */}
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                                        {/* Left Column: Form Fields */}
                                        <div className="xl:col-span-2 space-y-6">
                                            <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
                                                <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">Personal Details</CardTitle>
                                                            <CardDescription>Informasi dasar yang terlihat oleh publik.</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nama Lengkap</Label>
                                                        <Input
                                                            value={profileData.name}
                                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                            className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-base px-4"
                                                            placeholder="Nama Anda"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Pekerjaan</Label>
                                                        <Input
                                                            value={profileData.job}
                                                            onChange={(e) => setProfileData({ ...profileData, job: e.target.value })}
                                                            className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-base px-4"
                                                            placeholder="e.g. Designer"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Bio</Label>
                                                        <textarea
                                                            className="w-full min-h-[120px] rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-base p-4 resize-none outline-none dark:bg-white/5 dark:focus:bg-black/40"
                                                            value={profileData.bio}
                                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                            placeholder="Tell us a little bit about yourself..."
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
                                                <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                                                            <Smartphone className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">Contact Info</CardTitle>
                                                            <CardDescription>Bagaimana cara menghubungi Anda.</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                                                            <Input className="pl-12 h-12 rounded-xl bg-slate-100/50 border-transparent text-muted-foreground font-medium" value={profileData.email} disabled />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone</Label>
                                                        <div className="relative">
                                                            <Smartphone className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                                                value={profileData.phone}
                                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                                placeholder="+62"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Website</Label>
                                                        <div className="relative">
                                                            <Globe className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                                                value={profileData.website}
                                                                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                                                placeholder="https://"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Location</Label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                                                value={profileData.location}
                                                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                                placeholder="City, Country"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Right Column: Visual Widgets */}
                                        <div className="space-y-6">
                                            {/* Security Card */}
                                            <div className="p-1 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-cyan-500">
                                                <div className="bg-white dark:bg-zinc-900 rounded-[1.8rem] p-6 h-full relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 blur-3xl rounded-full"></div>
                                                    <Shield className="w-10 h-10 text-emerald-500 mb-4" />
                                                    <h3 className="text-lg font-bold">Account Secured</h3>
                                                    <p className="text-muted-foreground text-sm mb-4">Your account is protected with 256-bit encryption standard.</p>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg w-fit">
                                                        <CheckCircle2 className="w-3 h-3" /> No issues found
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connections Card */}
                                            <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Login Connections</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {(providers || []).map(p => (
                                                        <div key={p} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                            <div className="flex items-center gap-3">
                                                                {p === 'google' ? (
                                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform"><svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg></div>
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm"><Settings className="w-5 h-5" /></div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-200">{p}</span>
                                                                    <span className="text-[10px] text-muted-foreground">Connected</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        </div>
                                                    ))}
                                                    <Button variant="ghost" className="w-full text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 h-10 rounded-xl">
                                                        Connect Other Account
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- TAB: APPEARANCE (UI FRONTEND) --- */}
                            {activeTab === 'appearance' && (
                                <AppearanceSettings />
                            )}

                            {/* --- TAB: DATA & STORAGE --- */}
                            {activeTab === 'data' && (
                                <DataStorageManager />
                            )}

                            {/* --- TAB: SYSTEM & BACKEND --- */}
                            {activeTab === 'system' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">System Health & Backend</h2>
                                        <p className="text-muted-foreground">Monitoring status server, database, dan koneksi API.</p>
                                    </div>
                                    <Separator />

                                    <div className="space-y-6">
                                        <div className="md:col-span-2">
                                            <DatabaseStatus autoRefresh={true} refreshInterval={5000} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                                <Database className="w-4 h-4" />
                                                Database Metrics
                                            </h3>
                                            <DatabaseMetrics refreshInterval={5000} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <DatabaseAdvancedMonitoring />
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Terminal className="w-4 h-4" /> Recent System Logs</h3>
                                        <div className="bg-black/90 text-green-400 p-4 rounded-xl font-mono text-xs h-64 overflow-y-auto space-y-1 shadow-inner">
                                            <p>[System] <span className="text-gray-500">2024-12-25 14:00:01</span> Garbage collection started.</p>
                                            <p>[Auth] <span className="text-gray-500">2024-12-25 14:02:33</span> User login successful (ID: jeff).</p>
                                            <p>[API] <span className="text-gray-500">2024-12-25 14:05:12</span> GET /api/weather/bmkg - 200 OK (340ms).</p>
                                            <p>[System] <span className="text-gray-500">2024-12-25 14:10:00</span> Backup routine executed successfully.</p>
                                            <p>[Warn] <span className="text-yellow-500">2024-12-25 14:15:22</span> High memory usage detected on worker 2.</p>
                                            <p className="opacity-50 mt-2">// ... more logs available in /var/log/app</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: NOTIFIKASI --- */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Pusat Notifikasi</h2>
                                        <p className="text-muted-foreground">Pilih apa yang ingin Anda dengar dan kapan.</p>
                                    </div>
                                    <Separator />
                                    <Card>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Mapping notification toggles */}
                                            {Object.entries(notifications).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Terima notifikasi untuk {key.replace(/([A-Z])/g, ' $1').toLowerCase()}.
                                                        </p>
                                                    </div>
                                                    <Switch checked={value} onCheckedChange={(c) => setNotifications({ ...notifications, [key]: c })} />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* --- TAB: USER MANAGEMENT --- */}
                            {activeTab === 'users' && (
                                <UserManagement />
                            )}

                            {/* --- TAB: KEAMANAN --- */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Keamanan & Login</h2>
                                        <p className="text-muted-foreground">Lindungi akun Anda dengan lapisan keamanan tambahan.</p>
                                    </div>
                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-6 space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Lock className="w-5 h-5" /></div>
                                                <h3 className="font-semibold">Password & Autentikasi</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Password Baru</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        placeholder="Minimal 6 karakter"
                                                    />
                                                </div>
                                                <Button size="sm" className="w-full" onClick={() => handleSave("Password")}>Update Password</Button>
                                            </div>
                                        </Card>

                                        <Card className="p-6 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Shield className="w-5 h-5" /></div>
                                                <h3 className="font-semibold">Metode Login Tambahan</h3>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Two-Factor Auth (2FA)</Label>
                                                    <p className="text-xs text-muted-foreground">Verifikasi via Google Authenticator.</p>
                                                </div>
                                                <Switch checked={security.twoFactorEnabled} onCheckedChange={(c) => setSecurity({ ...security, twoFactorEnabled: c })} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Biometric Login</Label>
                                                    <p className="text-xs text-muted-foreground">Windows Hello / TouchID.</p>
                                                </div>
                                                <Switch checked={security.biometricEnabled} onCheckedChange={(c) => setSecurity({ ...security, biometricEnabled: c })} />
                                            </div>
                                        </Card>

                                        {/* Active Sessions */}
                                        <Card className="md:col-span-2 p-6">
                                            <h3 className="font-semibold mb-4">Sesi Perangkat Aktif</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border">
                                                    <div className="flex items-center gap-4">
                                                        <Monitor className="w-8 h-8 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium text-sm">Windows 11 PC (Current)</p>
                                                            <p className="text-xs text-muted-foreground">Chrome • Jakarta, ID • IP: 192.168.1.1</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Online</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border">
                                                    <div className="flex items-center gap-4">
                                                        <Smartphone className="w-8 h-8 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium text-sm">iPhone 15 Pro</p>
                                                            <p className="text-xs text-muted-foreground">Mobile App • 2 jam yang lalu</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100">Revoke</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}


                            {/* --- TAB: DATA (BACKUP & RESTORE) --- */}
                            {activeTab === 'data' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Manajemen Data</h2>
                                        <p className="text-muted-foreground">Kontrol penuh atas data finansial Anda: Backup, Restore, dan Reset.</p>
                                    </div>
                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Download className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-semibold text-blue-700 dark:text-blue-400">Export / Backup</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Unduh semua data transaksi, kategori, dan anggaran dalam format JSON terenkripsi.</p>
                                            <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-100 text-blue-700" onClick={() => handleSave("Export Data")}>
                                                Download Backup (.json)
                                            </Button>
                                        </Card>

                                        <Card className="p-6 border-amber-500/20 bg-amber-500/5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Upload className="w-5 h-5 text-amber-600" />
                                                <h3 className="font-semibold text-amber-700 dark:text-amber-400">Import / Restore</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Kembalikan data dari file backup sebelumnya. Data saat ini akan digabungkan.</p>
                                            <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-100 text-amber-700" onClick={() => handleSave("Import Data")}>
                                                Upload Backup File
                                            </Button>
                                        </Card>

                                        <Card className="md:col-span-2 p-6 border-red-500/20 bg-red-500/5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                                <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                                            </div>
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-red-200/50">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-red-900 dark:text-red-200">Reset Factory Data</p>
                                                    <p className="text-xs text-red-700/70">Menghapus semua transaksi dan mereset saldo ke 0. Akun tidak dihapus.</p>
                                                </div>
                                                <Button variant="destructive" size="sm">Reset Semua Data</Button>
                                            </div>
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 mt-4 bg-white/50 dark:bg-black/20 rounded-xl border border-red-200/50">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-red-900 dark:text-red-200">Hapus Akun Permanen</p>
                                                    <p className="text-xs text-red-700/70">Tindakan ini tidak dapat dibatalkan. Semua data akan hilang selamanya.</p>
                                                </div>
                                                <Button variant="destructive" size="sm">Hapus Akun Saya</Button>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: DEVELOPER --- */}
                            {activeTab === 'developer' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold font-mono">Developer Options</h2>
                                        <p className="text-muted-foreground">Advanced configurations for debugging and development.</p>
                                    </div>
                                    <Separator />

                                    <div className="grid gap-4">
                                        <Card className="p-4 bg-black text-green-400 font-mono text-xs border-green-900">
                                            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Code className="w-4 h-4" /> Environment Variables</h3>
                                            <div className="space-y-1 opacity-80">
                                                <p>NEXT_PUBLIC_APP_URL: "http://localhost:3000"</p>
                                                <p>NODE_ENV: "development"</p>
                                                <p>DATABASE_URL: "postgres://user:***@localhost:5432/finance"</p>
                                                <p>AUTH_SECRET: "********************************"</p>
                                                <p>ENABLE_BETA_FEATURES: "true"</p>
                                            </div>
                                        </Card>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="outline" className="justify-start gap-2">
                                                <RefreshCw className="w-4 h-4" /> Clear App Cache
                                            </Button>
                                            <Button variant="outline" className="justify-start gap-2">
                                                <Trash2 className="w-4 h-4" /> Purge Local Storage
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: INTEGRATIONS --- */}
                            {activeTab === 'integrations' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Integrasi Eksternal</h2>
                                        <p className="text-muted-foreground">Hubungkan aplikasi keuangan Anda dengan layanan favorit.</p>
                                    </div>
                                    <Separator />

                                    <div className="grid grid-cols-1 gap-6">
                                        {/* TELEGRAM CARD (CLEAN REDESIGN) */}
                                        <Card className="border overflow-hidden shadow-sm">
                                            <CardHeader className="border-b bg-gradient-to-br from-white via-sky-50 to-emerald-50 dark:from-slate-950 dark:via-sky-950/10 dark:to-emerald-950/10">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400">
                                                            <div className="w-8 h-8 flex items-center justify-center">
                                                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" /></svg>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <CardTitle>Telegram Bot</CardTitle>
                                                            <CardDescription>
                                                                Status: {telegramData?.connected ? <span className="text-emerald-500 font-bold">Connected</span> : "Not Connected"}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    {telegramData?.connected && (
                                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-6">
                                                {telegramData?.connected ? (
                                                    // CONNECTED VIEW
                                                    <div className="flex flex-col md:flex-row gap-6">
                                                        <div className="flex-1 space-y-4">
                                                            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg p-4 flex items-start gap-4">
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                                                <div>
                                                                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400">Terhubung dengan @{telegramData.username || "User"}</h4>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        Bot siap menerima perintah. Coba kirim pesan "Halo" ke bot.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium">Cara Menggunakan:</p>
                                                                <ul className="text-sm space-y-2 text-muted-foreground">
                                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> <code>Kopi 20rb</code> (Catat Pengeluaran)</li>
                                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> <code>/start</code> (Cek Menu)</li>
                                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> Tanya: "Berapa saldo saya?"</li>
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        <div className="md:w-px md:bg-border"></div>

                                                        <div className="md:w-1/3 flex flex-col justify-center gap-3">
                                                            <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`https://t.me/myfinancejefbot`, '_blank')}>
                                                                <Link2 className="w-4 h-4 mr-2" /> Buka Telegram
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start text-rose-500 hover:text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                                onClick={async () => {
                                                                    const loadingToast = toast.loading("Disconnecting...");
                                                                    const res = await disconnectTelegram();
                                                                    toast.dismiss(loadingToast);

                                                                    if (res.success) {
                                                                        toast.success("Telegram disconnected!");
                                                                        router.refresh();
                                                                    } else {
                                                                        toast.error(res.error || "Gagal memutuskan koneksi.");
                                                                    }
                                                                }}
                                                            >
                                                                <LogOut className="w-4 h-4 mr-2" /> Disconnect
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // NOT CONNECTED VIEW
                                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                                        <div className="flex-1 space-y-4">
                                                            <h4 className="font-medium">Keunggulan Integrasi:</h4>
                                                            <ul className="grid grid-cols-1 gap-2">
                                                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Zap className="w-4 h-4 text-amber-500" /> Input transaksi super cepat
                                                                </li>
                                                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <BrainCircuit className="w-4 h-4 text-purple-500" /> Analisa keuangan via AI chat
                                                                </li>
                                                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Bell className="w-4 h-4 text-rose-500" /> Notifikasi tagihan (Premium)
                                                                </li>
                                                            </ul>
                                                        </div>

                                                        <div className="flex-1 bg-muted/50 p-4 rounded-xl border space-y-4">
                                                            <div>
                                                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                                                    <Settings className="w-4 h-4" /> Setup Manual
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mb-3">
                                                                    Hubungkan akun dengan membuka bot dan klik Start.
                                                                </p>
                                                                <Button
                                                                    className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                                                                    onClick={() => window.open(`https://t.me/myfinancejefbot?start=${user.id}`, '_blank')}
                                                                >
                                                                    Connect Telegram
                                                                </Button>
                                                            </div>

                                                            <div className="pt-3 border-t">
                                                                <span className="text-xs font-mono text-muted-foreground block mb-1">Your User ID:</span>
                                                                <div className="flex gap-2">
                                                                    <Input readOnly value={user?.id} className="h-7 text-xs font-mono bg-background" />
                                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCopyId}>
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* OTHER INTEGRATIONS */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Google Drive */}
                                            <Card className="p-4 flex items-center justify-between border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer" onClick={() => toast.info("Google Drive Integration: Coming Soon!")}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white dark:bg-black rounded-xl border border-green-100 dark:border-green-900">
                                                        <HardDrive className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">Google Drive Backup</h3>
                                                        <p className="text-xs text-muted-foreground">Auto-backup database mingguan.</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="h-8 text-xs bg-white dark:bg-black">Connect</Button>
                                            </Card>

                                            {/* Notion Sync */}
                                            <Card className="p-4 flex items-center justify-between border-stone-500/20 bg-stone-500/5 hover:bg-stone-500/10 transition-colors cursor-pointer" onClick={() => toast.info("Notion Sync: Added to waitlist!")}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white dark:bg-black rounded-xl border border-stone-100 dark:border-stone-800">
                                                        <Share2 className="w-6 h-6 text-stone-800 dark:text-stone-200" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">Notion Sync</h3>
                                                        <p className="text-xs text-muted-foreground">Export laporan ke Notion Page.</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="h-8 text-xs bg-white dark:bg-black">Join Waitlist</Button>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: AI ASSISTANT --- */}
                            {activeTab === 'ai-assistant' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <Bot className="w-8 h-8 text-pink-500" />
                                            Otak Keuangan AI
                                        </h2>
                                        <p className="text-muted-foreground">Konfigurasi kepribadian dan kecerdasan asisten finansial Anda.</p>
                                    </div>
                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-6 md:col-span-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-500/20">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-4 max-w-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-pink-500 hover:bg-pink-600">Pro Feature</Badge>
                                                        <h3 className="font-bold text-xl">Persona Asisten</h3>
                                                    </div>
                                                    <p className="text-sm opacity-80">
                                                        Pilih gaya komunikasi asisten Anda. Apakah Anda suka yang tegas, santai, atau sangat detail?
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="secondary" className="bg-white/50 dark:bg-black/50">💼 Profesional</Button>
                                                        <Button size="sm" variant="outline" className="opacity-50">😎 Teman Santai</Button>
                                                        <Button size="sm" variant="outline" className="opacity-50">🤖 Data Robot</Button>
                                                    </div>
                                                </div>
                                                <BrainCircuit className="w-24 h-24 text-pink-500 opacity-20 hidden md:block" />
                                            </div>
                                        </Card>

                                        <Card className="p-6 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-5 h-5 text-yellow-500" />
                                                <h3 className="font-semibold">Tingkat Risiko Investasi</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground">AI akan memberikan saran berdasarkan profil risiko ini.</p>
                                            <Select defaultValue="moderate">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">🛡️ Konservatif (Aman)</SelectItem>
                                                    <SelectItem value="moderate">⚖️ Moderat (Seimbang)</SelectItem>
                                                    <SelectItem value="high">🚀 Agresif (High Return)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Card>

                                        <Card className="p-6 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Smartphone className="w-5 h-5 text-indigo-500" />
                                                <h3 className="font-semibold">Mode Interaksi</h3>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Voice Command</Label>
                                                    <p className="text-xs text-muted-foreground">Izinkan AI mendengar perintah suara.</p>
                                                </div>
                                                <Switch />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Auto-Analysis</Label>
                                                    <p className="text-xs text-muted-foreground">Analisis pengeluaran harian otomatis.</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: PREFERENCES --- */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight">{t('settings.preferences')}</h2>
                                        <p className="text-muted-foreground mt-1">{t('settings.preferencesDesc')}</p>
                                    </div>

                                    {/* Language Selection */}
                                    <Card className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-5 h-5 text-indigo-500" />
                                                <div>
                                                    <h3 className="font-semibold">{t('settings.languageSystem')}</h3>
                                                    <p className="text-sm text-muted-foreground">{t('settings.languageSystemDesc')}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <LanguagePreferenceSelector />
                                        </div>
                                    </Card>

                                    {/* Future: Currency Preference */}
                                    <Card className="p-6 opacity-50">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-5 h-5 text-green-500" />
                                                <div>
                                                    <h3 className="font-semibold">Mata Uang</h3>
                                                    <p className="text-sm text-muted-foreground">Pilih mata uang default (Coming Soon)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* --- TAB: ROLE & PERMISSIONS --- */}
                            {activeTab === 'roles' && (
                                <RolePermissions />
                            )}

                            {/* --- TAB: DEVELOPER OPTIONS --- */}
                            {activeTab === 'developer' && (
                                <DeveloperOptions />
                            )}

                        </motion.div>
                    </AnimatePresence>
                </main>
            </Card >

            {/* --- DIALOGS --- */}

            {/* 1. Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Preview Foto Profil</DialogTitle>
                        <DialogDescription>
                            Pastikan foto terlihat bagus sebelum disimpan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-muted/20 rounded-xl my-2 custom-scrollbar">
                        {previewUrl && (
                            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl">
                                <img src={previewUrl as string} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <Button variant="outline" onClick={cancelUpload}>Batal</Button>
                        <Button onClick={confirmUpload} disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengupload...</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Simpan Foto</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. Success Success Dialog */}
            <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <DialogContent className="sm:max-w-sm text-center">
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl">Berhasil Disimpan!</DialogTitle>
                        <DialogDescription className="text-center">
                            Foto profil Anda telah berhasil diperbarui dan tersimpan di server.
                        </DialogDescription>
                        <Button className="mt-4 w-full" onClick={() => setIsSuccessOpen(false)}>
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div >
    );
}
