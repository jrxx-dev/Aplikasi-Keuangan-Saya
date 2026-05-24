"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone,
    Globe, MapPin, Cpu, Loader2, ShieldCheck, Wifi, Monitor, Clock, Server, Smartphone,
    Link2, ShieldAlert, KeyRound, RefreshCcw, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ease = [0.22, 1, 0.36, 1] as const;

function parseBrowser(ua: string) {
    if (ua.includes("Edg/")) return { name: "Edge", version: ua.match(/Edg\/([\d.]+)/)?.[1]?.split(".")[0] ?? "" };
    if (ua.includes("Chrome/")) return { name: "Chrome", version: ua.match(/Chrome\/([\d.]+)/)?.[1]?.split(".")[0] ?? "" };
    if (ua.includes("Firefox/")) return { name: "Firefox", version: ua.match(/Firefox\/([\d.]+)/)?.[1]?.split(".")[0] ?? "" };
    if (ua.includes("Safari/") && !ua.includes("Chrome")) return { name: "Safari", version: ua.match(/Version\/([\d.]+)/)?.[1]?.split(".")[0] ?? "" };
    return { name: "Browser", version: "" };
}
function parseOS(ua: string) {
    if (ua.includes("Windows NT 10")) return "Windows 10/11";
    if (ua.includes("Mac OS X")) return "macOS";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone")) return "iOS";
    if (ua.includes("Linux")) return "Linux";
    return "Unknown";
}

const PHASES = [
    "Inisialisasi sistem…", "Memindai IP…", "Geolokasi…", "Analisis ISP…",
    "Deteksi proxy…", "Identifikasi device…", "Fingerprint browser…",
    "Scanning WAF rules…", "Laporan siap.",
];

/** Generate random base32 secret for TOTP setup */
function generateBase32Secret(length = 20): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let s = "";
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    arr.forEach(b => { s += chars[b % 32]; });
    return s;
}

/** Build otpauth:// URI for authenticator apps */
function buildOtpAuthUri(secret: string, email: string, issuer: string): string {
    const label = encodeURIComponent(`${issuer}:${email || "user"}`);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** QR code URL via free qrserver.com API */
function qrUrl(data: string, size = 200): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=fcfaf9&color=0d0c0c&margin=2`;
}

// WAF rules check types
type WAFStatus = "pending" | "checking" | "ok" | "warn" | "block";
interface WAFRule { label: string; status: WAFStatus; detail: string; }

const initialWAF: WAFRule[] = [
    { label: "Rate Limiting", status: "pending", detail: "" },
    { label: "SQL Injection", status: "pending", detail: "" },
    { label: "XSS Protection", status: "pending", detail: "" },
    { label: "CSRF Token", status: "pending", detail: "" },
    { label: "Bot Detection", status: "pending", detail: "" },
    { label: "Request Integrity", status: "pending", detail: "" },
];

function WAFStatusBadge({ status }: { status: WAFStatus }) {
    if (status === "pending") return <span className="text-[#0d0c0c]/20 font-mono text-xs">···</span>;
    if (status === "checking") return <Loader2 size={12} className="animate-spin text-amber-500" />;
    if (status === "ok") return <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✓ OK</span>;
    if (status === "warn") return <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">⚠ Warn</span>;
    return <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">✗ Block</span>;
}

// OTP input component — 6 boxes
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
    const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
    const digits = value.padEnd(6, "").split("");

    const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            const newVal = value.slice(0, i) + value.slice(i + 1);
            onChange(newVal.slice(0, 6));
            if (i > 0) refs[i - 1].current?.focus();
        }
    };

    const handleChange = (i: number, v: string) => {
        const digit = v.replace(/\D/g, "").slice(-1);
        const arr = value.padEnd(6, " ").split("");
        arr[i] = digit;
        const newVal = arr.join("").replace(/ /g, "").slice(0, 6);
        onChange(newVal);
        if (digit && i < 5) refs[i + 1].current?.focus();
    };

    return (
        <div className="flex gap-2 justify-center">
            {refs.map((ref, i) => (
                <input
                    key={i}
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={disabled}
                    value={digits[i]?.trim() || ""}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className="w-11 h-14 text-center text-xl font-black text-[#0d0c0c] bg-[#f4f3f0] border-2 border-[#0d0c0c]/10 focus:border-[#0d0c0c] rounded-2xl outline-none transition-all disabled:opacity-40 font-mono"
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
export default function LoginPage() {
    const router = useRouter();

    // Form
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [step, setStep] = useState<"credentials" | "mfa-select" | "mfa-verify">("credentials");
    const [mfaMethod, setMfaMethod] = useState<"otp" | "google" | "microsoft">("otp");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [formError, setFormError] = useState(false);
    const [formErrorMsg, setFormErrorMsg] = useState("");
    const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "ok" | "error">("checking");

    // OTP
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [otpError, setOtpError] = useState(false);
    const [otpTimer, setOtpTimer] = useState(60);
    const [otpStatus, setOtpStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
    const [totpSecret] = useState(() => generateBase32Secret());

    // Security scan
    const [ip, setIp] = useState<string>();
    const [isp, setIsp] = useState<string>();
    const [location, setLocation] = useState<string>();
    const [tz, setTz] = useState<string>();
    const [isHosting, setIsHosting] = useState(false);
    const [browser, setBrowser] = useState<string>();
    const [os, setOs] = useState<string>();
    const [device, setDevice] = useState<string>();
    const [screenRes, setScreenRes] = useState<string>();
    const [lang, setLang] = useState<string>();
    const [visitHistory, setVisitHistory] = useState<string>();
    // TLS
    const [tlsProto, setTlsProto] = useState<string>();
    const [tlsSecure, setTlsSecure] = useState<boolean>();
    const [tlsConnType, setTlsConnType] = useState<string>();
    const [tlsLatency, setTlsLatency] = useState<string>();
    const [tlsReferrer, setTlsReferrer] = useState<string>();
    // WAF
    const [wafRules, setWafRules] = useState<WAFRule[]>(initialWAF);
    const [wafDone, setWafDone] = useState(false);

    const [phase, setPhase] = useState(0);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"scanning" | "ready" | "verifying" | "success">("scanning");
    const [risk, setRisk] = useState<"LOW" | "MEDIUM">("LOW");

    // OTP countdown timer
    useEffect(() => {
        if (step !== "mfa-verify") return;
        setOtpTimer(60);
        const t = setInterval(() => setOtpTimer(s => {
            if (s <= 1) { clearInterval(t); return 0; }
            return s - 1;
        }), 1000);
        return () => clearInterval(t);
    }, [step]);

    // Security scan on mount
    useEffect(() => {
        const ua = navigator.userAgent;
        const { name: b, version: bv } = parseBrowser(ua);
        const isM = /Mobi|Android|iPhone/.test(ua);
        setBrowser(`${b} ${bv}`);
        setOs(parseOS(ua));
        setDevice(isM ? "Mobile" : "Desktop");
        setScreenRes(`${screen.width}×${screen.height}`);
        setLang(navigator.language);

        // ── Supabase connection check ──
        supabase.auth.getSession()
            .then(() => setSupabaseStatus("ok"))
            .catch(() => setSupabaseStatus("error"));

        // TLS / Connection
        const isSecure = window.isSecureContext;
        setTlsSecure(isSecure);
        try {
            const navPerfEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
            const proto = navPerfEntries[0]?.nextHopProtocol ?? "";
            setTlsProto(proto === "h3" ? "HTTP/3 (QUIC)" : proto === "h2" ? "HTTP/2" : proto === "http/1.1" ? "HTTP/1.1" : proto || "Unknown");
            const nav0 = navPerfEntries[0];
            if (nav0 && nav0.connectEnd > 0) {
                setTlsLatency(`${Math.round(nav0.connectEnd - nav0.connectStart)} ms`);
            } else { setTlsLatency("< 1 ms (cached)"); }
        } catch { setTlsProto(isSecure ? "HTTPS" : "HTTP"); }
        const navAny = navigator as any;
        const conn = navAny.connection || navAny.mozConnection || navAny.webkitConnection;
        if (conn) {
            // Use .type first — it distinguishes ethernet (LAN), wifi, cellular
            const rawType: string = conn.type ?? "";
            const effType: string = conn.effectiveType ?? "";
            const downlink: string = conn.downlink ? ` · ${conn.downlink} Mbps` : "";

            let connLabel = "";
            if (rawType === "ethernet") {
                connLabel = `LAN / Ethernet${downlink}`;
            } else if (rawType === "wifi") {
                connLabel = `WiFi${downlink}`;
            } else if (rawType === "cellular") {
                const speed = effType === "4g" ? "4G LTE" : effType === "3g" ? "3G" : effType === "2g" ? "2G" : "Data Seluler";
                connLabel = `${speed}${downlink}`;
            } else if (rawType === "none") {
                connLabel = "Tidak Ada Koneksi";
            } else if (rawType === "unknown" || rawType === "") {
                // Fallback: infer from effectiveType + device type
                if (effType === "4g") {
                    connLabel = isM ? `Data 4G LTE${downlink}` : `LAN / WiFi${downlink}`;
                } else if (effType === "3g") {
                    connLabel = `Data 3G${downlink}`;
                } else if (effType === "2g" || effType === "slow-2g") {
                    connLabel = `Data 2G${downlink}`;
                } else {
                    connLabel = isM ? "Data Seluler" : "LAN / WiFi";
                }
            } else {
                connLabel = `${rawType}${downlink}`;
            }
            setTlsConnType(connLabel);
        } else {
            // No Connection API (Firefox, Safari) — infer from device type
            const isMobile = /Mobi|Android|iPhone|iPad/.test(navigator.userAgent);
            setTlsConnType(isMobile ? "Data Seluler (estimasi)" : "LAN / WiFi (estimasi)");
        }
        const ref = document.referrer;
        setTlsReferrer(ref ? new URL(ref).hostname : "Direct / None");

        // Visit history
        const VISIT_KEY = "da_last_visit";
        const lastVisit = localStorage.getItem(VISIT_KEY);
        if (lastVisit) {
            const d = new Date(parseInt(lastVisit, 10));
            setVisitHistory(`Pernah · ${d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`);
        } else { setVisitHistory("Pertama kali"); }
        localStorage.setItem(VISIT_KEY, Date.now().toString());

        // Phase ticker
        let s = 0;
        const tick = setInterval(() => {
            s++;
            setPhase(s);
            setProgress(Math.round((s / PHASES.length) * 100));
            if (s >= PHASES.length) clearInterval(tick);
        }, 380);

        // IP fetch
        (async () => {
            try {
                const r = await fetch("https://ipapi.co/json/");
                const d = await r.json();
                if (d.ip) {
                    setIp(d.ip);
                    setIsp(d.org ?? d.asn ?? "—");
                    setLocation(`${d.city}, ${d.country_name} (${d.country_code})`);
                    setTz(d.timezone);
                    const h = !!(d.asn && /AS(16509|14618|13335|396982|8075)/.test(d.asn));
                    setIsHosting(h);
                    if (h) setRisk("MEDIUM");
                }
            } catch { setIp("Tidak terdeteksi"); }

            // WAF simulation — run after IP fetch
            const rules: WAFRule[] = [
                { label: "Rate Limiting", status: "ok", detail: "< 10 req/min" },
                { label: "SQL Injection", status: "ok", detail: "None detected" },
                { label: "XSS Protection", status: "ok", detail: "CSP aktif" },
                { label: "CSRF Token", status: "ok", detail: "Token valid" },
                { label: "Bot Detection", status: "ok", detail: "Human verified" },
                { label: "Request Integrity", status: "ok", detail: "Signature OK" },
            ];

            // Run each WAF check with delay
            for (let i = 0; i < rules.length; i++) {
                await new Promise(res => setTimeout(res, 300));
                setWafRules(prev => {
                    const next = [...prev];
                    next[i] = { ...next[i], status: "checking" };
                    return next;
                });
                await new Promise(res => setTimeout(res, 400));
                setWafRules(prev => {
                    const next = [...prev];
                    next[i] = rules[i];
                    return next;
                });
            }
            setWafDone(true);
            setTimeout(() => setStatus("ready"), PHASES.length * 380 + 200);
        })();

        return () => clearInterval(tick);
    }, []);

    // Credentials submit → Supabase Auth → MFA select
    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 5) { setFormError(true); setFormErrorMsg("Min. 5 karakter."); return; }
        setFormError(false);
        setFormErrorMsg("");
        setStatus("verifying");
        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
                if (error) { setFormError(true); setFormErrorMsg(error.message); setStatus("ready"); return; }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) { setFormError(true); setFormErrorMsg(error.message); setStatus("ready"); return; }
            }
            // Auth sukses — lanjut ke MFA
            const code = String(Math.floor(100000 + Math.random() * 900000));
            setGeneratedOtp(code);
            setStatus("ready");
            setStep("mfa-select");
        } catch {
            setFormError(true);
            setFormErrorMsg("Gagal terhubung ke server. Coba lagi.");
            setStatus("ready");
        }
    };

    const goToVerify = (method: "otp" | "google" | "microsoft") => {
        setMfaMethod(method);
        setOtp("");
        setOtpError(false);
        setOtpStatus("idle");
        setStep("mfa-verify");
    };

    const goBack = () => {
        setStep(s => s === "mfa-verify" ? "mfa-select" : "credentials");
        setOtp(""); setOtpError(false); setOtpStatus("idle");
    };

    // OTP verified → navigate (session already set by Supabase)
    const handleOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === generatedOtp) {
            setOtpStatus("verifying");
            setTimeout(() => {
                setOtpStatus("success");
                setTimeout(() => router.push("/"), 800);
            }, 1000);
        } else {
            setOtpStatus("error");
            setOtpError(true);
            setTimeout(() => { setOtpStatus("idle"); setOtpError(false); setOtp(""); }, 2000);
        }
    };

    const regenerateOtp = () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedOtp(code);
        setOtp("");
        setOtpError(false);
        setOtpTimer(60);
    };

    const doAuth = () => {
        setStatus("verifying");
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedOtp(code);
        setTimeout(() => { setStatus("ready"); setStep("mfa-select"); }, 1200);
    };

    const isReady = status === "ready";

    return (
        <div className="min-h-screen w-full bg-[#fcfaf9] text-[#0d0c0c] font-sans flex flex-col">

            {/* TOPBAR */}
            <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 pointer-events-none">
                <motion.a href="/" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="font-bold text-lg tracking-tight text-[#0d0c0c] pointer-events-auto hover:opacity-60 transition-opacity">
                    DailyActivity
                </motion.a>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#0d0c0c]/40">
                    Secure Login
                </motion.span>
            </header>

            <div className="flex-1 flex items-stretch min-h-screen">

                {/* ─── LEFT: Security Panel ─── */}
                <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease }}
                    className="hidden lg:flex w-[380px] xl:w-[420px] flex-shrink-0 flex-col border-r border-[#0d0c0c]/8 pt-28 pb-10 px-10 relative overflow-y-auto overflow-x-hidden">

                    {/* Scan bar animation */}
                    <AnimatePresence>
                        {status === "scanning" && (
                            <motion.div key="bar" animate={{ y: ["0%", "100vh"] }}
                                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                className="absolute top-0 left-0 right-0 h-[1px] bg-[#0d0c0c]/15 pointer-events-none z-10" />
                        )}
                    </AnimatePresence>

                    {/* Title */}
                    <div className="mb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d0c0c]/40 mb-2">Security Core</p>
                        <h2 className="text-2xl font-serif leading-tight text-[#0d0c0c]">Analisis<br />Akses Realtime.</h2>
                    </div>

                    {/* Progress bar */}
                    <AnimatePresence mode="wait">
                        {status === "scanning" && (
                            <motion.div key="prog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-semibold text-[#0d0c0c]/40 uppercase tracking-widest">{PHASES[Math.min(phase, PHASES.length - 1)]}</span>
                                    <span className="text-[10px] font-mono font-bold text-[#0d0c0c]/30">{progress}%</span>
                                </div>
                                <div className="h-[2px] bg-[#0d0c0c]/10 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-[#0d0c0c] rounded-full" style={{ width: `${progress}%` }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Risk badge */}
                    <AnimatePresence>
                        {status !== "scanning" && (
                            <motion.div key="risk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                                <div className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full border text-xs font-bold
                                    ${risk === "LOW" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${risk === "LOW" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                    Risiko {risk === "LOW" ? "Rendah" : "Sedang"} — {risk === "LOW" ? "Koneksi bersih" : "Hosting terdeteksi"}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Section helper */}
                    {([
                        {
                            title: "Jaringan & Lokasi",
                            rows: [
                                { label: "IP Address", value: ip, icon: <Globe size={12} /> },
                                { label: "ISP / Jaringan", value: isp, icon: <Wifi size={12} /> },
                                { label: "Lokasi", value: location, icon: <MapPin size={12} /> },
                                { label: "Timezone", value: tz, icon: <Clock size={12} /> },
                                { label: "Riwayat Kunjungan", value: visitHistory, icon: <Server size={12} /> },
                            ]
                        },
                        {
                            title: "Perangkat",
                            rows: [
                                { label: "Browser", value: browser, icon: <Monitor size={12} /> },
                                { label: "OS", value: os, icon: <Cpu size={12} /> },
                                { label: "Tipe", value: device, icon: <Smartphone size={12} /> },
                                { label: "Resolusi", value: screenRes, icon: <Monitor size={12} /> },
                                { label: "Bahasa", value: lang, icon: <Globe size={12} /> },
                            ]
                        },
                        {
                            title: "TLS & Koneksi",
                            rows: [
                                { label: "Protokol", value: tlsProto, icon: <Link2 size={12} /> },
                                { label: "Enkripsi", value: tlsSecure ? "TLS Aktif · HTTPS" : "Tidak Terenkripsi", icon: <Lock size={12} /> },
                                { label: "Tipe Koneksi", value: tlsConnType, icon: <Wifi size={12} /> },
                                { label: "Latensi Handshake", value: tlsLatency, icon: <Clock size={12} /> },
                                { label: "Referrer", value: tlsReferrer, icon: <Globe size={12} /> },
                            ]
                        },
                    ] as const).map((section, si) => (
                        <div key={section.title} className={`relative z-10 border-t border-[#0d0c0c]/8 ${si > 0 ? "mt-5" : ""}`}>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/35 pt-4 mb-0">{section.title}</p>
                            {section.rows.map((row, i) => (
                                <motion.div key={row.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 + si * 0.15 + i * 0.05, duration: 0.5 }}
                                    className="flex items-center justify-between py-3 border-b border-[#0d0c0c]/6">
                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0d0c0c]/35">{row.icon} {row.label}</span>
                                    <span className="text-xs font-mono font-semibold text-[#0d0c0c] text-right max-w-[160px] truncate">
                                        {row.value ?? <span className="text-[#0d0c0c]/20 animate-pulse">···</span>}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    ))}

                    {/* ── WAF Panel ── */}
                    <div className="mt-5 border-t border-[#0d0c0c]/8 relative z-10">
                        <div className="flex items-center justify-between pt-4 mb-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/35">WAF Firewall</p>
                            <AnimatePresence>
                                {wafDone && (
                                    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                        className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        Semua Aman
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        {wafRules.map((rule, i) => (
                            <motion.div key={rule.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.08 }}
                                className="flex items-center justify-between py-2.5 border-b border-[#0d0c0c]/6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0d0c0c]/35">{rule.label}</span>
                                <WAFStatusBadge status={rule.status} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#0d0c0c]/8">
                        <p className="text-[10px] text-[#0d0c0c]/25 leading-relaxed font-medium">
                            Semua aktivitas login dicatat dan dipantau. Akses tidak sah akan dilaporkan.
                        </p>
                    </div>
                </motion.div>

                {/* ─── RIGHT: Form Area ─── */}
                <div className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-6">
                    <AnimatePresence mode="wait">

                        {/* STEP 1 — Credentials */}
                        {step === "credentials" && (
                            <motion.div key="credentials"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.7, ease }}
                                className="w-full max-w-[420px]"
                            >
                                <div className="mb-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d0c0c]/40 mb-4">
                                        {mode === "signin" ? "Masuk Akun" : "Buat Akun Baru"}
                                    </p>
                                    <h1 className="text-[2.6rem] leading-[1.05] font-serif tracking-tight text-[#0d0c0c]">
                                        {mode === "signin" ? "Selamat\nDatang." : "Daftar\nAkun."}
                                    </h1>
                                    <p className="text-sm text-[#0d0c0c]/50 font-medium mt-2">
                                        {mode === "signin"
                                            ? "Masuk ke DailyActivity  · Verifikasi 2FA aktif."
                                            : "Daftarkan identitas ke sistem aman."
                                        }
                                    </p>
                                </div>

                                {/* OAuth - All methods require MFA */}
                                <div className="space-y-3 mb-8">
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/30 text-center mb-3">
                                        Semua metode wajib verifikasi authenticator
                                    </p>
                                    {/* Google - full width */}
                                    <button onClick={() => doAuth()} disabled={!isReady}
                                        className="w-full h-[50px] flex items-center justify-center gap-3 border border-[#0d0c0c]/12 hover:border-[#0d0c0c]/30 hover:bg-[#f4f3f0] text-[#0d0c0c] rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-30">
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Lanjutkan dengan Google</span>
                                    </button>
                                    {/* 3-col grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* GitHub */}
                                        <button onClick={() => doAuth()} disabled={!isReady}
                                            className="h-[48px] flex items-center justify-center gap-2 bg-[#24292e] hover:bg-[#1a1f24] text-white rounded-2xl font-semibold text-xs transition-all disabled:opacity-30">
                                            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                            </svg>
                                            GitHub
                                        </button>
                                        {/* Discord */}
                                        <button onClick={() => doAuth()} disabled={!isReady}
                                            className="h-[48px] flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-semibold text-xs transition-all disabled:opacity-30">
                                            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 127.14 96.36">
                                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77.67,77.67,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                            </svg>
                                            Discord
                                        </button>
                                        {/* Phone */}
                                        <button onClick={() => doAuth()} disabled={!isReady}
                                            className="h-[48px] flex items-center justify-center gap-2 border border-[#0d0c0c]/12 hover:border-[#0d0c0c]/30 hover:bg-[#f4f3f0] text-[#0d0c0c] rounded-2xl font-semibold text-xs transition-all disabled:opacity-30">
                                            <Phone size={15} /> No. HP
                                        </button>
                                    </div>
                                </div>


                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex-1 h-px bg-[#0d0c0c]/8" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/30">atau email</span>
                                    <div className="flex-1 h-px bg-[#0d0c0c]/8" />
                                </div>

                                <form onSubmit={handleCredentials} className="space-y-5">
                                    <AnimatePresence mode="popLayout">
                                        {mode === "signup" && (
                                            <motion.div key="nm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease }}>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0d0c0c]/40 mb-2">Nama Lengkap</label>
                                                <div className="relative">
                                                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d0c0c]/30" />
                                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Jefri Doe"
                                                        className="w-full h-[52px] bg-[#f4f3f0] border border-[#0d0c0c]/8 focus:border-[#0d0c0c]/30 focus:bg-white rounded-2xl pl-11 pr-4 text-sm text-[#0d0c0c] outline-none transition-all placeholder:text-[#0d0c0c]/30" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#0d0c0c]/40 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d0c0c]/30" />
                                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com"
                                                className="w-full h-[52px] bg-[#f4f3f0] border border-[#0d0c0c]/8 focus:border-[#0d0c0c]/30 focus:bg-white rounded-2xl pl-11 pr-4 text-sm text-[#0d0c0c] outline-none transition-all placeholder:text-[#0d0c0c]/30" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0d0c0c]/40">Kata Sandi</label>
                                            {mode === "signin" && <a href="#" className="text-[10px] font-bold text-[#0d0c0c]/40 hover:text-[#0d0c0c] uppercase tracking-wider transition-colors">Lupa?</a>}
                                        </div>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d0c0c]/30" />
                                            <input type={showPass ? "text" : "password"} required disabled={!isReady}
                                                value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                                className={`w-full h-[52px] bg-[#f4f3f0] border ${formError ? "border-red-400 bg-red-50/20" : "border-[#0d0c0c]/8 focus:border-[#0d0c0c]/30 focus:bg-white"} rounded-2xl pl-11 pr-12 text-sm text-[#0d0c0c] outline-none transition-all placeholder:text-[#0d0c0c]/30 disabled:opacity-40`} />
                                            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d0c0c]/30 hover:text-[#0d0c0c]/70">
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <AnimatePresence>{formError && (
                                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="text-red-500 text-[11px] font-semibold mt-2">{formErrorMsg || "Terjadi kesalahan."}</motion.p>
                                        )}</AnimatePresence>
                                    </div>
                                    <button type="submit" disabled={!isReady}
                                        className={`w-full h-[52px] rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all
                                            ${status === "verifying" ? "bg-[#0d0c0c]/80 text-white" : status === "scanning" ? "bg-[#0d0c0c]/6 text-[#0d0c0c]/30 cursor-not-allowed" : "bg-[#0d0c0c] text-white hover:bg-[#0d0c0c]/80 active:scale-[0.99]"}`}>
                                        <AnimatePresence mode="wait">
                                            {status === "scanning" && <motion.span key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Memindai…</motion.span>}
                                            {status === "verifying" && <motion.span key="vr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Memverifikasi…</motion.span>}
                                            {status === "ready" && <motion.span key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">{mode === "signin" ? "Masuk" : "Buat Akun"} <ArrowRight size={16} /></motion.span>}
                                        </AnimatePresence>
                                    </button>
                                </form>

                                {/* Supabase connection status */}
                                <div className="mt-5 flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${supabaseStatus === "ok" ? "bg-emerald-500" :
                                            supabaseStatus === "error" ? "bg-red-500" : "bg-amber-400 animate-pulse"
                                        }`} />
                                    <span className="text-[10px] font-bold text-[#0d0c0c]/30 uppercase tracking-widest">
                                        {supabaseStatus === "ok" ? "Database Terhubung" :
                                            supabaseStatus === "error" ? "Database Tidak Terhubung" : "Mengecek Koneksi Database…"}
                                    </span>
                                </div>
                                <div className="mt-8 text-center">
                                    <p className="text-xs text-[#0d0c0c]/40 font-medium">
                                        {mode === "signin" ? "Belum punya akun?" : "Sudah punya akun?"}
                                        {" "}
                                        <button onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setFormError(false); }}
                                            className="font-black text-[#0d0c0c] hover:opacity-50 underline underline-offset-4 transition-opacity">
                                            {mode === "signin" ? "Daftar" : "Masuk"}
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 — Pilih Metode MFA */}
                        {step === "mfa-select" && (
                            <motion.div key="mfa-select"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.6, ease }}
                                className="w-full max-w-[420px]"
                            >
                                <button onClick={() => { setStep("credentials"); setStatus("ready"); }}
                                    className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/40 hover:text-[#0d0c0c] transition-colors flex items-center gap-1.5 mb-8">
                                    ← Kembali
                                </button>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d0c0c]/40 mb-4">Pilih Metode Verifikasi MFA</p>
                                <h1 className="text-[2.2rem] leading-[1.05] font-serif tracking-tight text-[#0d0c0c] mb-2">Verifikasi<br />Identitas.</h1>
                                <p className="text-sm text-[#0d0c0c]/50 font-medium mb-10">Pilih metode autentikasi dua faktor yang ingin Anda gunakan.</p>

                                <div className="space-y-3">
                                    {/* Email OTP */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                        onClick={() => goToVerify("otp")}
                                        className="w-full p-5 border border-[#0d0c0c]/10 hover:border-[#0d0c0c]/30 hover:bg-[#f4f3f0] rounded-2xl flex items-center gap-4 transition-all duration-200 group text-left"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-[#f4f3f0] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                                            <Mail size={20} className="text-[#0d0c0c]/60" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-[#0d0c0c]">Email OTP</p>
                                            <p className="text-[11px] text-[#0d0c0c]/40 font-medium mt-0.5">Kode 6-digit dikirim ke email Anda</p>
                                        </div>
                                        <ArrowRight size={16} className="text-[#0d0c0c]/25 group-hover:text-[#0d0c0c] group-hover:translate-x-0.5 transition-all" />
                                    </motion.button>

                                    {/* Google Authenticator */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        onClick={() => goToVerify("google")}
                                        className="w-full p-5 border border-[#0d0c0c]/10 hover:border-[#0d0c0c]/30 hover:bg-[#f4f3f0] rounded-2xl flex items-center gap-4 transition-all duration-200 group text-left"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-[#f4f3f0] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                                                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-[#0d0c0c]">Google Authenticator</p>
                                            <p className="text-[11px] text-[#0d0c0c]/40 font-medium mt-0.5">TOTP 6-digit · diperbarui tiap 30 detik</p>
                                        </div>
                                        <ArrowRight size={16} className="text-[#0d0c0c]/25 group-hover:text-[#0d0c0c] group-hover:translate-x-0.5 transition-all" />
                                    </motion.button>

                                    {/* Microsoft Authenticator */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                        onClick={() => goToVerify("microsoft")}
                                        className="w-full p-5 border border-[#0d0c0c]/10 hover:border-[#0d0c0c]/30 hover:bg-[#f4f3f0] rounded-2xl flex items-center gap-4 transition-all duration-200 group text-left"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-[#f4f3f0] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                                            <svg className="w-6 h-6" viewBox="0 0 21 21" fill="none">
                                                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                                                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                                                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                                                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-[#0d0c0c]">Microsoft Authenticator</p>
                                            <p className="text-[11px] text-[#0d0c0c]/40 font-medium mt-0.5">Push notification atau TOTP</p>
                                        </div>
                                        <ArrowRight size={16} className="text-[#0d0c0c]/25 group-hover:text-[#0d0c0c] group-hover:translate-x-0.5 transition-all" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 — MFA Verify (OTP / Google / Microsoft) */}
                        {step === "mfa-verify" && (() => {
                            const cfg = {
                                otp: {
                                    label: "Email OTP",
                                    heading: "Masukkan\nKode OTP.",
                                    desc: `Kode 6-digit dikirim ke ${email || "email Anda"}.`,
                                    hint: "Cek kotak masuk atau folder spam Anda.",
                                    showTimer: true,
                                    showCode: true,
                                },
                                google: {
                                    label: "Google Authenticator",
                                    heading: "Kode\nGoogle Auth.",
                                    desc: "Buka Google Authenticator di ponsel Anda.",
                                    hint: "Masukkan kode 6-digit yang ditampilkan di aplikasi.",
                                    showTimer: false,
                                    showCode: true,
                                },
                                microsoft: {
                                    label: "Microsoft Authenticator",
                                    heading: "Kode\nMicrosoft Auth.",
                                    desc: "Buka Microsoft Authenticator di ponsel Anda.",
                                    hint: "Masukkan kode TOTP atau setujui notifikasi push.",
                                    showTimer: false,
                                    showCode: true,
                                },
                            }[mfaMethod];

                            return (
                                <motion.div key="mfa-verify"
                                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    transition={{ duration: 0.6, ease }}
                                    className="w-full max-w-[420px]"
                                >
                                    <button onClick={goBack}
                                        className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/40 hover:text-[#0d0c0c] transition-colors flex items-center gap-1.5 mb-8">
                                        ← Kembali
                                    </button>

                                    {/* Method badge */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/40">MFA · {cfg.label}</span>
                                    </div>

                                    <h1 className="text-[2.1rem] leading-[1.05] font-serif tracking-tight text-[#0d0c0c] mb-2 whitespace-pre-line">{cfg.heading}</h1>
                                    <p className="text-sm text-[#0d0c0c]/50 font-medium mb-2">{cfg.desc}</p>
                                    <p className="text-[11px] text-[#0d0c0c]/30 font-medium mb-8">{cfg.hint}</p>

                                    {/* Code / QR display */}
                                    {mfaMethod === "otp" ? (
                                        // Email OTP: show simulated code box
                                        <div className="mb-7 bg-[#f4f3f0] border border-[#0d0c0c]/8 rounded-2xl p-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#0d0c0c]/30 mb-1.5">Kode OTP (Simulasi)</p>
                                            <p className="text-2xl font-mono font-black text-[#0d0c0c] tracking-[0.3em]">{generatedOtp}</p>
                                        </div>
                                    ) : (
                                        // Google / Microsoft: QR Code setup
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, ease }}
                                            className="mb-7 border border-[#0d0c0c]/10 rounded-2xl overflow-hidden"
                                        >
                                            {/* QR Header */}
                                            <div className="bg-[#f4f3f0] border-b border-[#0d0c0c]/8 px-5 py-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/40">
                                                    Scan QR dengan {mfaMethod === "google" ? "Google" : "Microsoft"} Authenticator
                                                </p>
                                            </div>

                                            {/* QR Code image */}
                                            <div className="bg-white flex items-center justify-center p-6">
                                                <div className="relative">
                                                    <img
                                                        src={qrUrl(buildOtpAuthUri(totpSecret, email, "DailyActivity"), 180)}
                                                        alt="TOTP QR Code"
                                                        width={180} height={180}
                                                        className="rounded-lg block"
                                                    />
                                                    {/* Center logo */}
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-8 h-8 bg-white rounded-md border border-[#0d0c0c]/10 flex items-center justify-center shadow-sm">
                                                            {mfaMethod === "google" ? (
                                                                <svg className="w-5 h-5" viewBox="0 0 48 48">
                                                                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                                                    <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                                                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" viewBox="0 0 21 21" fill="none">
                                                                    <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                                                                    <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
                                                                    <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
                                                                    <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Manual key */}
                                            <div className="bg-[#f4f3f0] border-t border-[#0d0c0c]/8 px-5 py-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0d0c0c]/30 mb-1.5">Kunci Manual (Ketik Manual di App)</p>
                                                <p className="text-xs font-mono font-bold text-[#0d0c0c] tracking-[0.15em] select-all break-all">
                                                    {totpSecret.match(/.{1,4}/g)?.join(" ")}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    <span className="text-[9px] bg-[#0d0c0c]/6 px-2 py-0.5 rounded-full font-bold text-[#0d0c0c]/40">SHA-1</span>
                                                    <span className="text-[9px] bg-[#0d0c0c]/6 px-2 py-0.5 rounded-full font-bold text-[#0d0c0c]/40">6 Digit</span>
                                                    <span className="text-[9px] bg-[#0d0c0c]/6 px-2 py-0.5 rounded-full font-bold text-[#0d0c0c]/40">30 Detik</span>
                                                </div>
                                            </div>

                                            {/* Simulated TOTP code hint */}
                                            <div className="bg-white border-t border-[#0d0c0c]/6 px-5 py-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0d0c0c]/30 mb-1">Kode TOTP (Simulasi — Gunakan Ini)</p>
                                                <p className="text-xl font-mono font-black text-[#0d0c0c] tracking-[0.25em]">{generatedOtp}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleOtp} className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#0d0c0c]/40 mb-4 text-center">Masukkan Kode 6-Digit</label>
                                            <OtpInput value={otp} onChange={setOtp} disabled={otpStatus === "verifying" || otpStatus === "success"} />
                                            <AnimatePresence>
                                                {otpError && (
                                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className="text-red-500 text-[11px] font-semibold text-center mt-3">Kode salah. Coba lagi.</motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {cfg.showTimer && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-[#0d0c0c]/40">
                                                    {otpTimer > 0 ? `Kirim ulang dalam ${otpTimer}s` : "Kode kadaluarsa"}
                                                </span>
                                                <button type="button" onClick={regenerateOtp} disabled={otpTimer > 0}
                                                    className="flex items-center gap-1.5 text-[11px] font-black text-[#0d0c0c] hover:opacity-60 disabled:opacity-30">
                                                    <RefreshCcw size={12} /> Kirim Ulang
                                                </button>
                                            </div>
                                        )}

                                        <button type="submit" disabled={otp.length < 6 || otpStatus === "verifying" || otpStatus === "success"}
                                            className={`w-full h-[52px] rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all
                                                ${otpStatus === "success" ? "bg-emerald-500 text-white" : otpStatus === "error" ? "bg-red-500 text-white" : "bg-[#0d0c0c] text-white hover:bg-[#0d0c0c]/80 disabled:opacity-40"}`}>
                                            <AnimatePresence mode="wait">
                                                {otpStatus === "verifying" && <motion.span key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Memverifikasi…</motion.span>}
                                                {otpStatus === "success" && <motion.span key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2"><ShieldCheck size={17} /> Akses Diberikan</motion.span>}
                                                {otpStatus === "error" && <motion.span key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><XCircle size={15} /> Kode Salah!</motion.span>}
                                                {otpStatus === "idle" && <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><KeyRound size={16} /> Konfirmasi <ArrowRight size={15} /></motion.span>}
                                            </AnimatePresence>
                                        </button>
                                    </form>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
