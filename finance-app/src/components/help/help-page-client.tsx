"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    HelpCircle,
    Mail,
    MessageSquare,
    Phone,
    Video,
    Keyboard,
    FileText,
    Send,
    Search,
    PlayCircle,
    Lightbulb,
    Zap,
    CheckCircle2,
    ExternalLink,
    Book,
    GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface User {
    name: string;
    email: string;
}

const faqs = [
    {
        category: "Dasar",
        questions: [
            {
                q: "Bagaimana cara menambahkan transaksi?",
                a: "Buka halaman Transaksi, klik tombol 'Tambah Transaksi', pilih jenis (pemasukan/pengeluaran), isi detail transaksi, dan klik Simpan."
            },
            {
                q: "Bagaimana cara membuat anggaran?",
                a: "Buka halaman Anggaran, klik 'Buat Anggaran Baru', pilih kategori, tentukan jumlah anggaran dan periode, lalu klik Simpan."
            },
            {
                q: "Bagaimana cara menambah akun/saldo?",
                a: "Buka halaman Saldo, klik 'Tambah Akun', pilih jenis akun (Cash/Bank/E-wallet), masukkan nama dan saldo awal, pilih warna tema, lalu Simpan."
            }
        ]
    },
    {
        category: "Fitur Lanjutan",
        questions: [
            {
                q: "Bagaimana cara mengatur tujuan keuangan?",
                a: "Buka halaman Tujuan, klik 'Tambah Tujuan Baru', isi nama tujuan, target jumlah, deadline, dan Simpan. Anda bisa track progress secara berkala."
            },
            {
                q: "Bagaimana cara melihat laporan keuangan?",
                a: "Buka halaman Laporan untuk melihat ringkasan keuangan bulanan/tahunan. Anda bisa filter berdasarkan periode dan kategori."
            },
            {
                q: "Bagaimana cara custom dashboard?",
                a: "Di halaman Dashboard, klik tombol 'Atur Tata Letak'. Anda bisa drag & drop widget, resize ukuran, dan save layout sesuai preferensi."
            }
        ]
    },
    {
        category: "Keamanan",
        questions: [
            {
                q: "Apakah data saya aman?",
                a: "Ya, semua data dienkripsi dan disimpan dengan aman. Kami menggunakan protokol keamanan standar industri."
            },
            {
                q: "Bagaimana cara mengubah password?",
                a: "Buka Pengaturan > Keamanan, masukkan password lama, password baru, konfirmasi password baru, lalu klik Ubah Password."
            },
            {
                q: "Apa itu Two-Factor Authentication?",
                a: "2FA adalah lapisan keamanan tambahan. Setiap login, Anda perlu kode verifikasi dari app authenticator selain password."
            }
        ]
    },
    {
        category: "Troubleshooting",
        questions: [
            {
                q: "Transaksi saya tidak muncul?",
                a: "Coba refresh halaman. Jika masih tidak muncul, check filter tanggal dan kategori. Pastikan Anda memilih 'Semua' untuk melihat semua transaksi."
            },
            {
                q: "Saldo tidak akurat?",
                a: "Buka halaman Saldo dan verifikasi setiap akun. Pastikan semua transaksi tercatat dengan benar. Gunakan fitur 'Rekonsiliasi' jika perlu."
            },
            {
                q: "Widget tidak menampilkan data?",
                a: "Pastikan Anda sudah menambahkan data (transaksi, anggaran, dll). Beberapa widget memerlukan data minimal untuk ditampilkan. Coba refresh browser."
            }
        ]
    }
];

const tutorials = [
    {
        title: "Getting Started",
        description: "Panduan lengkap untuk memulai menggunakan FinanceMy",
        duration: "10 menit",
        icon: GraduationCap,
        steps: [
            "Setup akun dan profil",
            "Tambah akun/saldo pertama",
            "Catat transaksi pertama",
            "Buat anggaran bulanan",
            "Explore dashboard"
        ]
    },
    {
        title: "Manajemen Transaksi",
        description: "Cara efektif mencatat dan mengelola transaksi",
        duration: "8 menit",
        icon: FileText,
        steps: [
            "Tambah transaksi cepat",
            "Kategorisasi transaksi",
            "Edit & hapus transaksi",
            "Filter & search transaksi",
            "Export data transaksi"
        ]
    },
    {
        title: "Budgeting",
        description: "Membuat dan mengelola anggaran keuangan",
        duration: "12 menit",
        icon: Lightbulb,
        steps: [
            "Buat anggaran per kategori",
            "Set target bulanan",
            "Monitor progress",
            "Alert & notifikasi",
            "Review & adjust"
        ]
    },
    {
        title: "Analytics & Reports",
        description: "Analisis keuangan dan generate laporan",
        duration: "15 menit",
        icon: Book,
        steps: [
            "Dashboard overview",
            "Chart & visualisasi",
            "Filter berdasarkan periode",
            "Export laporan",
            "Share insights"
        ]
    }
];

const shortcuts = [
    { keys: "Ctrl + K", description: "Quick command palette" },
    { keys: "Ctrl + N", description: "Tambah transaksi baru" },
    { keys: "Ctrl + S", description: "Simpan perubahan" },
    { keys: "Ctrl + F", description: "Search/filter" },
    { keys: "Esc", description: "Close modal/dialog" },
];

export function HelpPageClient({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState("faq");
    const [searchQuery, setSearchQuery] = useState("");
    const [supportForm, setSupportForm] = useState({
        subject: "",
        message: ""
    });

    const handleSendSupport = () => {
        if (!supportForm.subject || !supportForm.message) {
            toast.error("Mohon isi subject dan pesan");
            return;
        }

        // Simulate sending support request
        toast.success("Pesan terkirim! Kami akan segera merespons.");
        setSupportForm({ subject: "", message: "" });
    };

    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            q =>
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <HelpCircle className="w-8 h-8 text-primary" />
                    Pusat Bantuan
                </h1>
                <p className="text-muted-foreground">
                    Temukan jawaban, pelajari fitur, dan dapatkan dukungan
                </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            FAQ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {faqs.reduce((acc, cat) => acc + cat.questions.length, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Pertanyaan umum</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Tutorial
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tutorials.length}</div>
                        <p className="text-xs text-muted-foreground">Video panduan</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Keyboard className="w-4 h-4" />
                            Shortcuts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shortcuts.length}</div>
                        <p className="text-xs text-muted-foreground">Keyboard shortcuts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24/7</div>
                        <p className="text-xs text-muted-foreground">Response time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="faq" className="gap-2">
                        <HelpCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">FAQ</span>
                    </TabsTrigger>
                    <TabsTrigger value="tutorials" className="gap-2">
                        <PlayCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Tutorial</span>
                    </TabsTrigger>
                    <TabsTrigger value="shortcuts" className="gap-2">
                        <Keyboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Shortcuts</span>
                    </TabsTrigger>
                    <TabsTrigger value="support" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Support</span>
                    </TabsTrigger>
                </TabsList>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div>
                                    <CardTitle>Frequently Asked Questions</CardTitle>
                                    <CardDescription>
                                        Temukan jawaban untuk pertanyaan umum
                                    </CardDescription>
                                </div>
                                <div className="relative w-full sm:w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari pertanyaan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredFaqs.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        Tidak ada hasil untuk "{searchQuery}"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredFaqs.map((category, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <Badge variant="outline">{category.category}</Badge>
                                            </h3>
                                            <Accordion type="single" collapsible className="w-full">
                                                {category.questions.map((item, qIdx) => (
                                                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                                                        <AccordionTrigger className="text-left">
                                                            {item.q}
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            <p className="text-muted-foreground">{item.a}</p>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                            {idx < filteredFaqs.length - 1 && <Separator className="mt-6" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tutorials Tab */}
                <TabsContent value="tutorials" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Tutorial & Panduan</CardTitle>
                            <CardDescription>
                                Pelajari cara menggunakan FinanceMy step by step
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tutorials.map((tutorial, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                            <CardHeader>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <tutorial.icon className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-base">
                                                            {tutorial.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-sm mt-1">
                                                            {tutorial.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <PlayCircle className="w-4 h-4" />
                                                        <span>{tutorial.duration}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className="space-y-2">
                                                        {tutorial.steps.map((step, stepIdx) => (
                                                            <div
                                                                key={stepIdx}
                                                                className="flex items-center gap-2 text-sm"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                <span>{step}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button className="w-full mt-4" variant="outline">
                                                        <PlayCircle className="w-4 h-4 mr-2" />
                                                        Tonton Tutorial
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shortcuts Tab */}
                <TabsContent value="shortcuts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Keyboard Shortcuts</CardTitle>
                            <CardDescription>
                                Gunakan shortcut untuk navigasi lebih cepat
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {shortcuts.map((shortcut, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <span className="text-sm">{shortcut.description}</span>
                                        <Badge variant="secondary" className="font-mono">
                                            {shortcut.keys}
                                        </Badge>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-6" />

                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    Pro Tips
                                </h4>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                    <li>• Gunakan Tab untuk navigasi antar field di form</li>
                                    <li>• Tekan Enter untuk submit form aktif</li>
                                    <li>• Gunakan arrow keys untuk navigasi di dropdown</li>
                                    <li>• Tekan / untuk quick search di halaman</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Support Tab */}
                <TabsContent value="support" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hubungi Kami</CardTitle>
                                <CardDescription>
                                    Berbagai cara untuk mendapatkan bantuan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">Email Support</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            support@financemy.com
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Response time: 24 jam
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                                    <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">Live Chat</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Chat dengan tim support
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Available: Senin - Jumat, 9AM - 5PM
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">Phone Support</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            +62 812 3456 7890
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Senin - Jumat, 9AM - 5PM WIB
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Useful Links</h4>
                                    <div className="space-y-2">
                                        <a
                                            href="#"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Documentation
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Community Forum
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Status Page
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Support Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Kirim Pesan</CardTitle>
                                <CardDescription>
                                    Ada pertanyaan? Kami siap membantu
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Topik pertanyaan Anda"
                                            value={supportForm.subject}
                                            onChange={(e) =>
                                                setSupportForm({ ...supportForm, subject: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Pesan</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Jelaskan pertanyaan atau masalah Anda..."
                                            rows={8}
                                            value={supportForm.message}
                                            onChange={(e) =>
                                                setSupportForm({ ...supportForm, message: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                                        <p>
                                            Pesan akan dikirim dari: <strong>{user.email}</strong>
                                        </p>
                                    </div>

                                    <Button onClick={handleSendSupport} className="w-full">
                                        <Send className="w-4 h-4 mr-2" />
                                        Kirim Pesan
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
