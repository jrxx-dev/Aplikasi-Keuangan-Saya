"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Check, CircleDashed, Plus, Trash2, Edit2, GripVertical, Image as ImageIcon, ChevronDown, ChevronUp, ArrowRight, UserCircle, Info } from "lucide-react";
import { defaultPersonal, defaultSkills, defaultExperiences, defaultProjects, defaultEducation, defaultRecognitions, defaultLanguages } from "../portofolio/page";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })
};

function InputField({ label, desc, type = "text", value, onChange, placeholder, rows }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-slate-700">{label}</label>
            {desc && <p className="text-[11px] font-medium text-slate-400 mb-1">{desc}</p>}
            {type === "textarea" ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    rows={rows || 4}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none leading-relaxed"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
            )}
        </div>
    );
}

// Generic Array Input for things like bullets, tech, photos
function ArrayInput({ label, desc, values = [], onChange, placeholder, isImage = false, limit }: any) {
    return (
        <div className="mb-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="mb-4">
                <label className="text-[13px] font-bold text-slate-700 block">{label}</label>
                {desc && <p className="text-[11px] font-medium text-slate-400 mt-1">{desc}</p>}
            </div>
            <div className="space-y-3">
                {values.map((val: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                        {isImage && val ? (
                            <img src={val} alt="preview" className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-200 shadow-sm" />
                        ) : isImage ? (
                            <div className="w-11 h-11 bg-white rounded-xl shrink-0 border border-slate-200 flex items-center justify-center shadow-sm"><ImageIcon size={16} className="text-slate-300" /></div>
                        ) : null}
                        <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                                const newVals = [...values];
                                newVals[i] = e.target.value;
                                onChange(newVals);
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                            placeholder={placeholder}
                        />
                        <button onClick={() => onChange(values.filter((_: any, idx: number) => idx !== i))} className="p-3 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors shrink-0 outline-none">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {(!limit || values.length < limit) && (
                    <button
                        onClick={() => onChange([...values, ""])}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 mt-2 w-max"
                    >
                        <Plus size={16} /> Tambah {isImage ? "Gambar" : "Baris"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    type TabKey = "personal" | "skills" | "experiences" | "projects" | "education" | "recognitions" | "languages";
    const [activeTab, setActiveTab] = useState<TabKey>("personal");
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    const [pData, setPData] = useState<any>({
        personal: defaultPersonal,
        skills: defaultSkills,
        experiences: defaultExperiences,
        projects: defaultProjects,
        education: defaultEducation,
        recognitions: defaultRecognitions,
        languages: defaultLanguages
    });

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("portfolioState");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPData({
                    personal: parsed.personal || defaultPersonal,
                    skills: parsed.skills || defaultSkills,
                    experiences: parsed.experiences || defaultExperiences,
                    projects: parsed.projects || defaultProjects,
                    education: parsed.education || defaultEducation,
                    recognitions: parsed.recognitions || defaultRecognitions,
                    languages: parsed.languages || defaultLanguages
                });
            } catch (e) { }
        }
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        try {
            localStorage.setItem("portfolioState", JSON.stringify(pData));
            setTimeout(() => {
                setIsSaving(false);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            }, 800);
        } catch (error) {
            setIsSaving(false);
            alert("Gagal menyimpan data.");
        }
    };

    const toggleExpand = (id: string) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

    const updateItem = (tab: TabKey, index: number, field: string, value: any) => {
        const newData = { ...pData };
        newData[tab][index] = { ...newData[tab][index], [field]: value };
        setPData(newData);
    };

    const updatePersonal = (field: string, value: any) => {
        const newData = { ...pData };
        newData.personal = { ...newData.personal, [field]: value };
        setPData(newData);
    }

    const deleteItem = (tab: TabKey, index: number) => {
        if (!confirm("Hapus data ini secara permanen?")) return;
        const newData = { ...pData };
        newData[tab].splice(index, 1);
        setPData(newData);
    };

    const addItem = () => {
        const newData = { ...pData };
        if (activeTab === "skills") {
            newData.skills.unshift({ name: "Keahlian Baru", pct: 50, years: "1 yr", detail: "", photos: [] });
        } else if (activeTab === "experiences") {
            newData.experiences.unshift({ period: "2024 - Sekarang", role: "Jabatan Baru", company: "Nama Perusahaan", badge: "", bullets: [], techUsed: [], photos: [] });
        } else if (activeTab === "projects") {
            newData.projects.unshift({ num: "01", title: "Proyek Baru", label: "Kategori Web", tech: [], desc: "", year: "2024", photos: [] });
        } else if (activeTab === "education") {
            newData.education.unshift({ degree: "Gelar Baru", school: "Universitas/Instansi", period: "2020 - 2024", gpa: "", honors: "", activities: [], photos: [] });
        } else if (activeTab === "recognitions") {
            newData.recognitions.unshift({ year: "2024", title: "Penghargaan Baru", org: "Organisasi Pemberi" });
        } else if (activeTab === "languages") {
            newData.languages.unshift({ lang: "Bahasa Baru", level: "Beginner", pct: 10 });
        }
        setPData(newData);
        setExpandedIds({ ...expandedIds, [`${activeTab}-0`]: true }); // Auto expand new item
    };

    if (!isMounted) return null;

    const currentItems = activeTab !== "personal" ? (pData[activeTab] || []) : [];

    const TABS: { id: TabKey; label: string; desc: string }[] = [
        { id: "personal", label: "Profil/Hero Info", desc: "Ubah nama, logo inisial, email & tagline utama kamu disini." },
        { id: "experiences", label: "Pengalaman Kerja", desc: "Riwayat pekerjaan, perusahaan, dskripsi tugas dan foto bukti pengerjaan." },
        { id: "skills", label: "Kemampuan (Skills)", desc: "Daftar bahasa pemrograman, alat, dan keahlian spesifik." },
        { id: "projects", label: "Portofolio Proyek", desc: "Produk, sistem, atau fitur terbaik yang pernah kamu kerjakan." },
        { id: "education", label: "Riwayat Edukasi", desc: "Latar belakan akademik, kampus, nilai dan organisasi kampus." },
        { id: "recognitions", label: "Penghargaan", desc: "Daftar sertifikat, juara perlombaan, atau rekognisi publik." },
        { id: "languages", label: "Kefasihan Bahasa", desc: "Bahasa daerah, inggris dsb yang kamu kuasai." },
    ];

    const currentTabInfo = TABS.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-[#f1f3f5] text-[#111] font-sans selection:bg-[#ccc]">
            {/* STICKY HEADER ACTIONS */}
            <header className="w-full p-4 md:px-8 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <a href="/" className="font-bold text-lg tracking-tight text-slate-800">
                        Dasbor<span className="text-emerald-500">Edit</span>
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/portofolio" className="hidden sm:flex items-center gap-2 group px-5 py-2 rounded-xl text-slate-500 hover:text-black hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-widest">
                        Lihat Live Web <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                        className={`px-6 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm shadow-md ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                            isSaving ? 'bg-slate-200 text-slate-500 shadow-none' :
                                'bg-slate-900 text-white hover:bg-black hover:-translate-y-0.5 shadow-slate-900/20'
                            }`}
                    >
                        {isSaving ? <><CircleDashed size={16} className="animate-spin" /> ...</>
                            : isSaved ? <><Check size={16} /> Ya!</>
                                : <><Save size={16} /> Simpan Perubahan</>}
                    </button>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto px-6 md:px-8 pb-32 pt-10">

                {/* TABS NAVIGATION */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-grow sm:flex-grow-0 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB DESCRIPTION HELPER */}
                <div className="mb-8 p-5 bg-sky-50 text-sky-800 rounded-2xl border border-sky-100 flex items-start gap-4 shadow-sm">
                    <Info size={24} className="text-sky-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm mb-1">{currentTabInfo?.label}</h4>
                        <p className="text-[13px] leading-relaxed opacity-90">{currentTabInfo?.desc}</p>
                    </div>
                </div>

                {activeTab !== "personal" && (
                    <div className="mb-6 flex justify-end">
                        <button onClick={addItem} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20">
                            <Plus size={16} /> Tambah Data {currentTabInfo?.label}
                        </button>
                    </div>
                )}

                {/* --- 1. PERSONAL INFO SECTION --- */}
                {activeTab === "personal" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-10">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                            <UserCircle size={32} className="text-slate-400" />
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Identitas Utama (Hero)</h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Informasi ini akan muncul sangat besar di bagian paling atas website Anda.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
                                <InputField label="Nama Depan" desc="Nama Panggilan/Depan" value={pData.personal.firstName} onChange={(e: any) => updatePersonal("firstName", e.target.value)} placeholder="Contoh: Jefri" />
                                <InputField label="Nama Belakang" desc="Nama Klan/Belakang" value={pData.personal.lastName} onChange={(e: any) => updatePersonal("lastName", e.target.value)} placeholder="Contoh: Doe" />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-8">
                                <InputField label="Spesialisasi / Peran Anda" desc="Jabatan Profesional, dipisah dengan tanda koma atau titik raksasa (·)" value={pData.personal.role} onChange={(e: any) => updatePersonal("role", e.target.value)} placeholder="Contoh: SOFTWARE ENGINEER · ARTIST" />
                                <InputField type="textarea" rows={4} label="Deskripsi Diri (Tagline Singkat)" desc="Biografi atau kekuatan utama. Usahakan max. 2-3 kalimat menarik." value={pData.personal.tagline} onChange={(e: any) => updatePersonal("tagline", e.target.value)} placeholder="Tulis hal menarik tentang diri kamu..." />
                                <InputField label="Status Saat Ini (Opsional)" desc="Beri tahu pengunjung kamu sedang bekerja/kuliah di mana saat ini." value={pData.personal.currentStatus || ""} onChange={(e: any) => updatePersonal("currentStatus", e.target.value)} placeholder="Contoh: Bekerja di Google Indonesia" />
                            </div>

                            <InputField label="Alamat Email" desc="Email Bisnis / Pribadi utama Anda" type="email" value={pData.personal.email} onChange={(e: any) => updatePersonal("email", e.target.value)} />
                            <InputField label="No. Handphone" desc="Gunakan kode negara, misal: +62 812... (Akan langsung menuju WA)" value={pData.personal.phone} onChange={(e: any) => updatePersonal("phone", e.target.value)} />
                            <InputField label="Website Pribadi / Portofolio Lainnya" desc="Link rujukan selain web ini, ex: linkedin.com/in/kamu" value={pData.personal.website} onChange={(e: any) => updatePersonal("website", e.target.value)} />
                            <InputField label="Lokasi Residensial" desc="Kota, Negara Asal" value={pData.personal.location} onChange={(e: any) => updatePersonal("location", e.target.value)} />

                            <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-6">Sosial Media & Tautan (Opsional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="Tautan LinkedIn" desc="https://linkedin.com/..." value={pData.personal.linkedin || ""} onChange={(e: any) => updatePersonal("linkedin", e.target.value)} />
                                    <InputField label="Tautan GitHub" desc="https://github.com/..." value={pData.personal.github || ""} onChange={(e: any) => updatePersonal("github", e.target.value)} />
                                    <InputField label="Tautan Instagram" desc="https://instagram.com/..." value={pData.personal.instagram || ""} onChange={(e: any) => updatePersonal("instagram", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- ARRAY ITEMS SECTIONS --- */}
                {activeTab !== "personal" && (
                    <div className="space-y-6">
                        {currentItems.map((item: any, idx: number) => {
                            const itemId = `${activeTab}-${idx}`;
                            const isExpanded = expandedIds[itemId];
                            const title = item.role || item.name || item.title || item.degree || item.lang || (activeTab === "recognitions" ? item.title : `Data ${currentTabInfo?.label} ke-${idx + 1}`);
                            const subtitle = item.company || item.years || item.desc || item.school || item.org || item.level || "Ketuk untuk edit detail selengkapnya";

                            return (
                                <div key={idx} className="bg-white border text-left border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
                                    {/* Header / Trigger */}
                                    <button
                                        onClick={() => toggleExpand(itemId)}
                                        className={`w-full flex items-center justify-between p-6 transition-colors ${isExpanded ? "bg-slate-50 border-b border-slate-100" : "hover:bg-slate-50"}`}
                                    >
                                        <div className="flex items-center gap-5 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                                                <span className="text-sm font-black text-slate-600">{idx + 1}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-[17px] leading-tight">{title}</h3>
                                                <p className="text-[13px] text-slate-500 mt-1 line-clamp-1 font-medium">{subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div onClick={(e) => { e.stopPropagation(); deleteItem(activeTab, idx); }} className="p-2.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors outline-none" title="Hapus Data">
                                                <Trash2 size={18} />
                                            </div>
                                            <div className="p-2.5 text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Form Body */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-white p-6 md:p-8"
                                            >

                                                {/* 2. EXPERIENCES */}
                                                {activeTab === "experiences" && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                                <h5 className="text-xs font-bold text-amber-800 mb-1">Tips Mengisi:</h5>
                                                                <p className="text-[11px] text-amber-700 leading-relaxed">Berikan penjelasan detail tugas pada bagian "Poin Penjelasan" agar *Recruiter* lebih memahami skala kontribusi Anda.</p>
                                                            </div>
                                                            <InputField label="Jabatan di Perusahaan" desc="Peran Utama (ex: Senior UX Designer)" value={item.role} onChange={(e: any) => updateItem(activeTab, idx, "role", e.target.value)} />
                                                            <InputField label="Nama Perusahaan Bebekerja" desc="Kantor / Instansi tempat berkarir" value={item.company} onChange={(e: any) => updateItem(activeTab, idx, "company", e.target.value)} />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <InputField label="Rentang Waktu" desc="Tahun / Bulan spesifik (ex: 2021 - 2023)" value={item.period} onChange={(e: any) => updateItem(activeTab, idx, "period", e.target.value)} />
                                                                <InputField label="Label Badge" desc="Opsional (ex: Current, Kontrak)" value={item.badge || ""} onChange={(e: any) => updateItem(activeTab, idx, "badge", e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <ArrayInput label="Poin Penjelasan Pekerjaan" desc="Prestasi/Tugas dalam poin (bullets)" values={item.bullets} onChange={(val: any) => updateItem(activeTab, idx, "bullets", val)} placeholder="Tulis dampak pekerjaan Anda..." />
                                                            <ArrayInput label="Teknologi yang Dipakai" desc="Alat (Tools) / Bahasa program utama" values={item.techUsed} onChange={(val: any) => updateItem(activeTab, idx, "techUsed", val)} placeholder="Contoh: Figma, React..." />
                                                            <ArrayInput label="Galeri Foto Pekerjaan" desc="Tautan (URL) Foto Dokumentasi" values={item.photos} onChange={(val: any) => updateItem(activeTab, idx, "photos", val)} placeholder="https://..." isImage limit={3} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 3. SKILLS */}
                                                {activeTab === "skills" && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <InputField label="Nama Keahlian" desc="Nama Bahasa / Software (ex: Python, UI Design)" value={item.name} onChange={(e: any) => updateItem(activeTab, idx, "name", e.target.value)} />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <InputField label="Skor Penguasaan" type="number" desc="Nomor Angka 1-100" value={item.pct} onChange={(e: any) => updateItem(activeTab, idx, "pct", parseInt(e.target.value))} />
                                                                <InputField label="Durasi Pengalaman" desc="Contoh: 3 Tahun / 3 Yrs" value={item.years} onChange={(e: any) => updateItem(activeTab, idx, "years", e.target.value)} />
                                                            </div>
                                                            <InputField type="textarea" rows={6} label="Detail Keterampilan" desc="Jelaskan apa saja yang bisa Anda buat dengan alat/keahlian ini secara spesifik." value={item.detail} onChange={(e: any) => updateItem(activeTab, idx, "detail", e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <div className="mb-4 p-4 border border-slate-100 bg-slate-50 rounded-2xl shadow-sm">
                                                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Sertakan hingga maksimal 3 tautan URL gambar (portofolio) untuk membuktikan penerapan dari *skill*/keahlian ini.</p>
                                                            </div>
                                                            <ArrayInput label="Tautan Gambar Pendukung" desc="Visualisasi Hasil Karya" values={item.photos} onChange={(val: any) => updateItem(activeTab, idx, "photos", val)} placeholder="Masukan url foto/gambar https://..." isImage limit={3} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 4. PROJECTS */}
                                                {activeTab === "projects" && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-[80px_1fr] gap-4">
                                                                <InputField label="ID" desc="No Seri" value={item.num} onChange={(e: any) => updateItem(activeTab, idx, "num", e.target.value)} />
                                                                <InputField label="Judul Proyek" desc="Nama Aplikasi / Karya" value={item.title} onChange={(e: any) => updateItem(activeTab, idx, "title", e.target.value)} />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <InputField label="Tahun" desc="Tahun Mulai Rilis" value={item.year} onChange={(e: any) => updateItem(activeTab, idx, "year", e.target.value)} />
                                                                <InputField label="Industri/Kategori" desc="Tipe Hasil (ex: Web, Fintech)" value={item.label} onChange={(e: any) => updateItem(activeTab, idx, "label", e.target.value)} />
                                                            </div>
                                                            <InputField type="textarea" rows={4} label="Deskripsi / Masalah yang Diselesaikan" desc="Bercerita singkat soal target market atau fungsionalitas produk ini." value={item.desc} onChange={(e: any) => updateItem(activeTab, idx, "desc", e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <ArrayInput label="Teknologi Utama" desc="Library / Framework yang dipakai (tanpa versi)" values={item.tech} onChange={(val: any) => updateItem(activeTab, idx, "tech", val)} placeholder="Contoh: React Native" />
                                                            <ArrayInput label="Tangkapan Layar (Maks 3)" desc="Sistem otomatis mengubah jadi preview mewah" values={item.photos} onChange={(val: any) => updateItem(activeTab, idx, "photos", val)} placeholder="https://..." isImage limit={3} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 5. EDUCATION */}
                                                {activeTab === "education" && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <InputField label="Nama Gelar Akademik" desc="Tingkat Fakultas (ex: S1 Ilmu Komputer)" value={item.degree} onChange={(e: any) => updateItem(activeTab, idx, "degree", e.target.value)} />
                                                            <InputField label="Nama Institusi / Universitas" desc="Asal Kampus" value={item.school} onChange={(e: any) => updateItem(activeTab, idx, "school", e.target.value)} />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <InputField label="Tahun Tempuh (Periode)" desc="(ex: 2014 - 2018)" value={item.period} onChange={(e: any) => updateItem(activeTab, idx, "period", e.target.value)} />
                                                                <InputField label="Skor (IPK)" desc="Gunakan desimal (ex: 3.8/4.0)" value={item.gpa} onChange={(e: any) => updateItem(activeTab, idx, "gpa", e.target.value)} />
                                                            </div>
                                                            <InputField label="Prestasi Khusus (Honors)" desc="Gelar Kehormatan (Ex: Summa Cumlaude / Beasiswa Unggulan)" value={item.honors} onChange={(e: any) => updateItem(activeTab, idx, "honors", e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <ArrayInput label="Organisasi / Ekstrakulikuler" desc="Aktivitas penting yang mendemonstrasikan kepemimpinan" values={item.activities} onChange={(val: any) => updateItem(activeTab, idx, "activities", val)} placeholder="Ketua BEM Fakultas..." />
                                                            <ArrayInput label="Foto Gedung Institusi" desc="Sertakan satu atau dua foto representatif kampus Anda" values={item.photos} onChange={(val: any) => updateItem(activeTab, idx, "photos", val)} placeholder="https://..." isImage limit={3} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 6. RECOGNITIONS */}
                                                {activeTab === "recognitions" && (
                                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                                                        <InputField label="Dimenangkan Pada Tahun" desc="Tahun Pelaksanaan" value={item.year} onChange={(e: any) => updateItem(activeTab, idx, "year", e.target.value)} />
                                                        <div className="space-y-6">
                                                            <InputField label="Prestasi / Penghargaan yang Diraih" desc="Sertifikat Medali yang dimenangkan" value={item.title} onChange={(e: any) => updateItem(activeTab, idx, "title", e.target.value)} />
                                                            <InputField label="Instansi Pemberi Tanggung Jawab" desc="Vendor acara / Perusahaan penyelenggara kompetisi." value={item.org} onChange={(e: any) => updateItem(activeTab, idx, "org", e.target.value)} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 7. LANGUAGES */}
                                                {activeTab === "languages" && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                        <InputField label="Sebutkan Bahasa" desc="Bahasa yang Dikuasai" value={item.lang} onChange={(e: any) => updateItem(activeTab, idx, "lang", e.target.value)} placeholder="Contoh: English" />
                                                        <InputField label="Level Pengalaman Berbicara" desc="Asli(Native), Fluent(Lancar), Dasar" value={item.level} onChange={(e: any) => updateItem(activeTab, idx, "level", e.target.value)} />
                                                        <InputField type="number" label="Visual Persentase" desc="Skala 1-100 Bar" value={item.pct} onChange={(e: any) => updateItem(activeTab, idx, "pct", parseInt(e.target.value))} />
                                                    </div>
                                                )}

                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {currentItems.length === 0 && (
                            <div className="text-center flex flex-col items-center py-20 bg-white border border-slate-200 rounded-3xl text-slate-400 border-dashed shadow-sm">
                                <Plus size={40} className="text-slate-200 mb-3" />
                                <h4 className="font-bold text-slate-700 mb-1">Riwayat Masih Kosong</h4>
                                <p className="text-sm">Klik "Tambah Data Baru" di atas untuk menyisipkan identitas pertama.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
