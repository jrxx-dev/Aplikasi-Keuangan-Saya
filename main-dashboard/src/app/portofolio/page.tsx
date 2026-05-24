"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    Mail, MapPin, Phone, Globe, Download, Edit3, ExternalLink,
    X, Briefcase, GraduationCap, Code2,
    Star, Award, CheckCircle2, Zap, ArrowLeft
} from "lucide-react";

const ease: any = [0.76, 0, 0.24, 1];
const spring: any = { type: "spring", stiffness: 300, damping: 30 };

const fadeIn = (delay = 0): any => ({
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease, delay } }
});

// ─── MODAL TYPES ────────────────────────────────
type ModalData = {
    type: "skill" | "experience" | "education" | "project";
    data: any;
} | null;

// ─── PHOTO GRID ─────────────────────────────────
function PhotoGrid({ photos, label }: { photos: string[]; label: string }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] mb-3">{label}</p>
            <div className="space-y-2">
                {/* Top: full-width banner */}
                {photos[0] && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="w-full aspect-[16/7] rounded-2xl overflow-hidden bg-[#f0ede9]"
                    >
                        <img src={photos[0]} alt="photo 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </motion.div>
                )}
                {/* Bottom: two equal photos */}
                {photos.length > 1 && (
                    <div className="grid grid-cols-2 gap-2">
                        {photos.slice(1, 3).map((photo, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.16 + i * 0.08 }}
                                className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f0ede9]"
                            >
                                <img src={photo} alt={`photo ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── RAILWAY TIMELINE (zigzag alternating, like Microsoft reference) ──
function RailwayTimeline({ stops, terminalLabel }: {
    stops: { tag: string; year: string; label: string; desc: string; photo?: string }[];
    terminalLabel: string;
}) {
    // 5 different branch patterns: [width px, tip shape]
    const branches = [
        { w: 40, tip: "rounded-full", size: 8 },   // short  + circle
        { w: 80, tip: "rotate-45", size: 7 },   // long   + diamond
        { w: 56, tip: "rounded-none", size: 8 },   // medium + square
        { w: 96, tip: "rounded-full", size: 6 },   // xlong  + small circle
        { w: 24, tip: "rotate-45", size: 9 },   // xshort + big diamond
    ];

    return (
        <div className="relative px-2">
            {/* Center vertical rail */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#111] via-[#aaa] to-transparent z-0" />

            <div className="space-y-24">
                {stops.map((stop, i) => {
                    const isLeft = i % 2 === 0;
                    const b = branches[i % 5];
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + i * 0.11, duration: 0.5, ease }}
                            className="relative flex items-start min-h-[100px]"
                        >
                            {/* ── Center dot ── */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-3.5 w-4 h-4 rounded-full bg-[#111] border-[3px] border-white shadow-lg z-10" />

                            {/* ── Branch line ── */}
                            <div
                                className={`absolute top-[21px] h-[2px] bg-[#111] z-0 ${isLeft ? "right-[calc(50%+8px)]" : "left-[calc(50%+8px)]"
                                    }`}
                                style={{ width: `${b.w}px` }}
                            >
                                {/* Varied tip shape */}
                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 bg-[#111] ${b.tip} ${isLeft ? `-left-[${Math.floor(b.size / 2)}px]` : `-right-[${Math.floor(b.size / 2)}px]`
                                        }`}
                                    style={{ width: b.size, height: b.size }}
                                />
                            </div>

                            {isLeft ? (
                                /* ── LEFT entry ── */
                                <>
                                    <div
                                        className="flex flex-col items-end text-right"
                                        style={{ width: `calc(50% - ${b.w + 12}px)`, paddingRight: "12px" }}
                                    >
                                        <span className="text-[18px] font-black text-[#111] leading-none mb-2 tabular-nums">{stop.year}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#111] text-white px-3 py-1 rounded-full mb-3 whitespace-nowrap">{stop.label}</span>
                                        {stop.photo && (
                                            <motion.img
                                                initial={{ opacity: 0, x: -14 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.16 + i * 0.11 }}
                                                src={stop.photo}
                                                alt={stop.label}
                                                className="w-[240px] h-[160px] object-cover rounded-[1.25rem] shadow-xl mb-3 ml-auto hover:scale-[1.03] transition-transform duration-400 cursor-zoom-in"
                                            />
                                        )}
                                        <p className="text-[13px] text-[#555] leading-relaxed font-medium max-w-[260px]">{stop.desc}</p>
                                    </div>
                                    <div className="flex-1" />
                                </>
                            ) : (
                                /* ── RIGHT entry ── */
                                <>
                                    <div className="flex-1" />
                                    <div
                                        className="flex flex-col items-start text-left"
                                        style={{ width: `calc(50% - ${b.w + 12}px)`, paddingLeft: "12px" }}
                                    >
                                        <span className="text-[18px] font-black text-[#111] leading-none mb-2 tabular-nums">{stop.year}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#111] text-white px-3 py-1 rounded-full mb-3 whitespace-nowrap">{stop.label}</span>
                                        {stop.photo && (
                                            <motion.img
                                                initial={{ opacity: 0, x: 14 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.16 + i * 0.11 }}
                                                src={stop.photo}
                                                alt={stop.label}
                                                className="w-[240px] h-[160px] object-cover rounded-[1.25rem] shadow-xl mb-3 hover:scale-[1.03] transition-transform duration-400 cursor-zoom-in"
                                            />
                                        )}
                                        <p className="text-[13px] text-[#555] leading-relaxed font-medium max-w-[260px]">{stop.desc}</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    );
                })}

                {/* Terminal station */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 + stops.length * 0.11 }}
                    className="relative flex flex-col items-center gap-2 pt-2"
                >
                    <div className="w-6 h-6 rounded-full bg-[#111] border-[3px] border-white shadow-2xl z-10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#111]">{terminalLabel}</span>
                </motion.div>
            </div>
        </div>
    );
}

// ─── HORIZONTAL RAILWAY TIMELINE (Scrolling sideways) ──
function HorizontalRailwayTimeline({ stops, terminalLabel }: {
    stops: { tag: string; year: string; label: string; desc: string; photo?: string }[];
    terminalLabel: string;
}) {
    // 5 different branch patterns (vertical length, tip shape, tip size)
    const branches = [
        { h: 40, tip: "rounded-full", size: 8 },
        { h: 90, tip: "rotate-45", size: 7 },
        { h: 60, tip: "rounded-none", size: 8 },
        { h: 110, tip: "rounded-full", size: 6 },
        { h: 25, tip: "rotate-45", size: 9 },
    ];

    return (
        <div className="relative w-full h-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing pb-8 pt-10">
            <div className="relative flex items-center min-w-max pr-16 h-full">
                {/* Center horizontal rail */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-[#111] via-[#aaa] to-transparent z-0" />

                {stops.map((stop, i) => {
                    const isTop = i % 2 === 0;
                    const b = branches[i % 5];
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                            className="relative w-[210px] shrink-0 h-full flex items-center"
                        >
                            {/* Center dot on the horizontal line */}
                            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 rounded-full bg-[#111] border-[3px] border-white shadow-lg z-10" />

                            {/* Vertical branch line */}
                            <div
                                className={`absolute left-[23px] w-[2px] bg-[#111] z-0 ${isTop ? "bottom-[calc(50%+8px)]" : "top-[calc(50%+8px)]"
                                    }`}
                                style={{ height: `${b.h}px` }}
                            >
                                {/* Tip shape */}
                                <div
                                    className={`absolute left-1/2 -translate-x-1/2 bg-[#111] ${b.tip} ${isTop ? `-top-[${Math.floor(b.size / 2)}px]` : `-bottom-[${Math.floor(b.size / 2)}px]`
                                        }`}
                                    style={{ width: b.size, height: b.size }}
                                />
                            </div>

                            {/* Content Block */}
                            <div
                                className={`absolute left-0 w-full pr-8 ${isTop ? "bottom-[50%] flex flex-col justify-end" : "top-[50%] flex flex-col justify-start"
                                    }`}
                                style={isTop ? { paddingBottom: `${b.h + 16}px` } : { paddingTop: `${b.h + 16}px` }}
                            >
                                <span className="text-[14px] font-black text-[#111] leading-none mb-1.5 tabular-nums">{stop.year}</span>
                                <span className="inline-block w-fit text-[9px] font-black uppercase tracking-widest bg-[#111] text-white px-2.5 py-0.5 rounded-full mb-2 whitespace-nowrap">{stop.label}</span>
                                {stop.photo && (
                                    <motion.img
                                        initial={{ opacity: 0, y: isTop ? 10 : -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.16 + i * 0.1 }}
                                        src={stop.photo}
                                        alt={stop.label}
                                        className="w-[160px] h-[105px] object-cover rounded-[0.85rem] shadow-xl mb-2.5 hover:scale-[1.03] transition-transform duration-400 cursor-zoom-in"
                                    />
                                )}
                                <p className="text-[11.5px] text-[#555] leading-relaxed font-medium pr-2 max-w-[170px]">{stop.desc}</p>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Terminal station */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 + stops.length * 0.1 }}
                    className="relative shrink-0 flex items-center ml-4"
                >
                    <div className="w-6 h-6 rounded-full bg-[#111] border-[3px] border-white shadow-2xl z-10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="ml-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#111]">{terminalLabel}</span>
                </motion.div>
            </div>
        </div>
    );
}

// ─── BOTTOM SHEET MODAL ─────────────────────────
function ModalSheet({ modal, onClose }: { modal: ModalData; onClose: () => void }) {
    if (!modal) return null;

    const renderContent = () => {
        if (modal.type === "skill") {
            const s = modal.data;
            // Build proof stops from photos
            const proofStops = (s.photos || []).map((photo: string, i: number) => ({
                tag: i === 0 ? "Proof" : `Work ${i + 1}`,
                year: `${s.years}`,
                label: `${s.name} in action`,
                desc: i === 0 ? s.detail : `Additional proof of ${s.name} expertise.`,
                photo,
            }));
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#aaa] mb-1">{s.years} experience</p>
                            <h2 className="text-3xl font-black text-[#111] tracking-tight">{s.name}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-black text-[#111] leading-none">{s.pct}</p>
                            <p className="text-xs font-bold text-[#aaa] tracking-widest">/ 100</p>
                        </div>
                    </div>

                    {/* Animated skill bar */}
                    <div className="h-2 bg-[#f0ede9] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 0.15 }}
                            className="h-full bg-[#111] rounded-full"
                        />
                    </div>

                    {/* Timeline with photos */}
                    {proofStops.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] mb-3">Proof of Work</p>
                            <RailwayTimeline stops={proofStops} terminalLabel="Verified ✓" />
                        </div>
                    )}
                </div>
            );
        }

        if (modal.type === "experience") {
            const e = modal.data;
            // Build stops with embedded photo per achievement
            const stops = e.bullets.map((bullet: string, i: number) => ({
                tag: i === 0 ? "Key" : `Stop ${i + 1}`,
                year: e.period.split("—")[0]?.trim() || e.period.split(" ")[0],
                label: `Achievement ${i + 1}`,
                desc: bullet,
                photo: e.photos?.[i] ?? undefined,
            }));
            return (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#aaa] mb-1">Work Experience</p>
                            <h2 className="text-2xl font-black text-[#111] tracking-tight mb-1">{e.role}</h2>
                            <p className="text-sm font-bold text-[#999] uppercase tracking-widest">{e.company} &nbsp;·&nbsp; {e.period}</p>
                        </div>
                        {e.badge && (
                            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full mt-1">{e.badge}</span>
                        )}
                    </div>

                    {/* Center-split Microsoft-style timeline */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] mb-4">Journey at {e.company}</p>
                        <RailwayTimeline stops={stops} terminalLabel="End of journey" />
                    </div>

                    {/* Tech stack */}
                    <div className="pt-4 border-t border-[#f0ede9]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] mb-3">Technologies on this route</p>
                        <div className="flex flex-wrap gap-2">
                            {e.techUsed.map((t: string, i: number) => (
                                <motion.span
                                    key={t}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111] text-white rounded-xl"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                    {t}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (modal.type === "education") {
            const e = modal.data;
            const stops = [
                {
                    tag: "Campus",
                    year: "Year 1",
                    label: "Started Journey",
                    desc: e.activities[0] || "Enrolled and exploring campus life.",
                    photo: e.photos?.[0],
                },
                {
                    tag: "Academic",
                    year: "Year 2-3",
                    label: "Deep Dive",
                    desc: e.activities[1] || "Focusing on core subjects and projects.",
                    photo: e.photos?.[1],
                },
                {
                    tag: "Graduation",
                    year: "Final Year",
                    label: "Achieved Degree",
                    desc: e.activities[2] || `Graduated with ${e.gpa} GPA.`,
                    photo: e.photos?.[2],
                }
            ];
            return (
                <div className="flex flex-col h-full -mb-6">
                    <div className="shrink-0 mb-4 flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#aaa] mb-1">Education Journey</p>
                            <h2 className="text-2xl font-black text-[#111] tracking-tight mb-1">{e.degree}</h2>
                            <p className="text-sm font-bold text-[#999] uppercase tracking-widest">{e.school} &nbsp;·&nbsp; {e.period}</p>
                        </div>
                        <div className="text-right">
                            <div className="px-3 py-1.5 bg-[#111] text-white rounded-lg inline-block text-[11px] font-bold mb-1">{e.gpa} GPA</div>
                            <p className="text-[9px] font-black text-[#111] uppercase tracking-widest">{e.honors}</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 relative w-[100vw] -ml-8 px-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] absolute top-2 left-10 z-10">Academic Timeline</p>
                        <HorizontalRailwayTimeline stops={stops} terminalLabel="Graduated" />
                    </div>
                </div>
            );
        }

        if (modal.type === "project") {
            const p = modal.data;
            // Build horizontal stops based on project photos/tech
            const stops = (p.photos || []).map((photo: string, i: number) => ({
                tag: i === 0 ? "Launch" : `Phase ${i + 1}`,
                year: p.year,
                label: `Phase ${i + 1}`,
                desc: i === 0 ? p.desc.substring(0, 100) + "..." : `Implementing core features using ${p.tech[i % p.tech.length]}.`,
                photo: photo,
            }));

            return (
                <div className="flex flex-col h-full -mb-6">
                    {/* Header */}
                    <div className="shrink-0 mb-4">
                        <div className="flex justify-between items-start">
                            <div className="pr-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#aaa] mb-1">{p.label} · {p.year}</p>
                                <h2 className="text-2xl font-black text-[#111] tracking-tight">{p.title}</h2>
                            </div>
                            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-[#111] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-colors w-max shrink-0 mt-3">
                                <ExternalLink size={12} /> Live Tour
                            </a>
                        </div>
                        <p className="text-[12.5px] text-[#555] leading-relaxed font-medium mt-3 max-w-4xl line-clamp-2 pr-4">{p.desc}</p>
                    </div>

                    {/* The timeline */}
                    <div className="flex-1 min-h-0 relative w-[100vw] -ml-8 px-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] absolute top-2 left-10 z-10">Development Timeline</p>
                        <HorizontalRailwayTimeline stops={stops} terminalLabel="Deployed" />
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 pt-4 border-t border-[#f0ede9] mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbb] mb-2">Technologies Used</p>
                        <div className="flex flex-wrap gap-2">
                            {p.tech.map((t: string, i: number) => (
                                <span key={t} className="px-3 py-1 text-[10px] font-bold bg-[#111] text-white rounded-lg">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    const noVertScroll = modal.type === "education" || modal.type === "project";

    return (
        <AnimatePresence>
            {modal && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%", opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 30 }}
                        className={`fixed bottom-0 inset-x-0 z-[100] bg-white rounded-t-[2rem] shadow-2xl ${noVertScroll ? "flex flex-col h-[85vh] overflow-hidden" : "max-h-[92vh] overflow-y-auto"
                            }`}
                    >
                        <div className="shrink-0 sticky top-0 bg-white/90 backdrop-blur-xl pt-4 pb-3 px-8 flex items-center justify-between border-b border-[#f0ede9] z-10 rounded-t-[2rem]">
                            <div className="w-10 h-1 rounded-full bg-[#ddd] mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                            <div />
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f3f0] flex items-center justify-center hover:bg-[#eee] transition-colors relative z-20">
                                <X size={14} className="text-[#666]" />
                            </button>
                        </div>
                        <div className={`px-8 py-6 pb-14 ${noVertScroll ? "flex-1 overflow-hidden min-h-0" : ""}`}>
                            {renderContent()}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


// ─── DATA ───────────────────────────────────────
export const defaultSkills = [
    {
        name: "React / Next.js", pct: 95, years: "5 yrs",
        detail: "Expert-level React development including Server Components, Next.js App Router, advanced patterns like compound components, render props, and custom hooks. Built 20+ production apps.",
        photos: [
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
        ]
    },
    {
        name: "TypeScript", pct: 90, years: "4 yrs",
        detail: "Strict TypeScript across large codebases. Proficient in advanced types, generics, utility types, declaration merging, and building type-safe API layers.",
        photos: [
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
            "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&q=80",
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
        ]
    },
    {
        name: "Node.js / Express", pct: 82, years: "4 yrs",
        detail: "RESTful and GraphQL API design, middleware architecture, authentication flows (JWT/OAuth), background job queues, and real-time WebSocket servers.",
        photos: [
            "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80",
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
        ]
    },
    {
        name: "UI / UX Design", pct: 78, years: "4 yrs",
        detail: "End-to-end product design in Figma — from wireframes to interactive prototypes. Proficient in design systems, accessibility (WCAG 2.1), and user research.",
        photos: [
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
            "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80",
            "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&q=80",
        ]
    },
    {
        name: "PostgreSQL", pct: 75, years: "3 yrs",
        detail: "Complex query optimization, index strategies, schema design/migrations with Prisma and Drizzle. Experience with read replicas and connection pooling.",
        photos: [
            "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
        ]
    },
    {
        name: "Docker & DevOps", pct: 68, years: "2 yrs",
        detail: "Containerized deployments with Docker Compose, GitHub Actions CI/CD pipelines, Vercel/Railway deployments, and basic Kubernetes cluster management.",
        photos: [
            "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80",
            "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=400&q=80",
            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80",
        ]
    },
    {
        name: "Framer Motion", pct: 85, years: "3 yrs",
        detail: "Creating fluid, 60fps cinematic animations, scroll-driven aesthetics, and complex page transitions for high-end digital experiences.",
        photos: [
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
        ]
    },
    {
        name: "GraphQL & GraphOS", pct: 70, years: "2 yrs",
        detail: "Architecting federated graphs using Apollo Server schemas, resolving the N+1 problem efficiently, and optimizing client-side caching.",
        photos: [
            "https://images.unsplash.com/photo-1509966756634-9c23dd6e6d7c?w=600&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
            "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&q=80",
        ]
    },
];

export const defaultExperiences = [
    {
        period: "2023 — Present",
        role: "Senior Frontend Engineer",
        company: "TechFin Nusantara",
        badge: "Current",
        bullets: [
            "Rebuilt core trading dashboard in Next.js 14 — 50k+ real-time events/sec via WebSockets",
            "Improved LCP from 4.2 s → 1.1 s via SSR streaming, image optimization & code-splitting",
            "Led and mentored a cross-functional team of 6 engineers across 3 product squads",
            "Established frontend architecture standards adopted org-wide (200+ components)",
        ],
        techUsed: ["Next.js 14", "TypeScript", "WebSockets", "Framer Motion", "Tailwind CSS"],
        photos: [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
            "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80",
        ]
    },
    {
        period: "2020 — 2022",
        role: "Fullstack Developer",
        company: "Creative Studio Inc.",
        badge: null,
        bullets: [
            "Shipped 12 enterprise web applications for Fortune 500 clients across fintech & retail",
            "Integrated Stripe & Midtrans payment gateways — processing Rp 2 B+ monthly",
            "Built headless CMS framework now powering 8 active client microsites",
            "Reduced API response time by 60% through Redis caching and query optimization",
        ],
        techUsed: ["React", "Node.js", "PostgreSQL", "Prisma", "Stripe", "Redis"],
        photos: [
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80",
            "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80",
        ]
    },
    {
        period: "2018 — 2020",
        role: "Junior Web Developer",
        company: "Startup Hub",
        badge: null,
        bullets: [
            "Migrated 200k-line jQuery monolith to React — bundle −45%, TTI from 8 s → 1.8 s",
            "Authored 48-component internal design system, still in production today",
            "Facilitated bi-weekly design reviews bridging product and engineering teams",
        ],
        techUsed: ["React", "JavaScript", "SCSS", "Webpack", "Figma"],
        photos: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80",
            "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&q=80",
        ]
    },
    {
        period: "2017 — 2018",
        role: "Frontend Intern",
        company: "Digital Agency XYZ",
        badge: null,
        bullets: [
            "Assisted in developing pixel-perfect landing pages using HTML, CSS, and Vanilla JavaScript",
            "Optimized image assets and implemented lazy loading, improving page load times by 30%",
            "Conducted cross-browser compatibility testing for major projects",
        ],
        techUsed: ["HTML5", "CSS3", "JavaScript", "Photoshop", "Git"],
        photos: [
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
        ]
    },
];

export const defaultEducation = [
    {
        degree: "B.S. Computer Science",
        school: "University of Indonesia",
        period: "2014 — 2018",
        gpa: "3.87 / 4.0",
        honors: "Graduated with Honors",
        activities: ["President — Google Developer Student Club", "Research Assistant, HCI Lab", "Dean's List all 8 semesters"],
        photos: [
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80",
            "https://images.unsplash.com/photo-1627556704283-b813ea36b1a5?w=400&q=80",
        ]
    }
];

export const defaultRecognitions = [
    { year: "2023", title: "Best Fintech UI", org: "Product Hunt Golden Kitty" },
    { year: "2022", title: "Top Developer Award", org: "GitHub Stars Indonesia" },
    { year: "2021", title: "Honorable Mention", org: "Awwwards" },
    { year: "2020", title: "Hackathon Winner", org: "TechFin Nusantara" },
    { year: "2019", title: "Best Innovation", org: "GDSC Indonesia" },
];

export const defaultLanguages = [
    { lang: "Indonesian", level: "Native", pct: 100 },
    { lang: "English", level: "Professional", pct: 85 },
];

export const defaultPersonal = {
    firstName: "Jefri",
    lastName: "Doe",
    role: "SOFTWARE ENGINEER · DIGITAL CREATOR",
    tagline: "I build high-performance digital products at the intersection of engineering precision and design elegance. 6+ years helping companies ship products people love.",
    email: "hello@jefridoe.com",
    website: "jefridoe.dev",
    phone: "+62 812 3456 7890",
    location: "Jakarta, Indonesia",
    currentStatus: "Software Engineer di Tech Company",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com"
};

export const defaultProjects = [
    {
        num: "01",
        title: "FinanceMy App",
        label: "Fintech · Full-stack",
        tech: ["Next.js", "TypeScript", "Prisma", "Telegram API", "OpenAI"],
        desc: "Personal finance platform with AI expense categorisation, multi-account management, real-time dashboards, and Telegram bot integration for on-the-go entry.",
        year: "2024",
        photos: [
            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80",
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
        ]
    },
    {
        num: "02",
        title: "TradeFin Dashboard",
        label: "Real-time · React",
        tech: ["React", "WebSockets", "Node.js", "Redis", "Chart.js"],
        desc: "Institutional-grade trading terminal processing 50k+ market events/sec. Custom charting engine, live order book, and P&L tracking with sub-100ms latency.",
        year: "2023",
        photos: [
            "https://images.unsplash.com/photo-1642790551116-18a150d248a5?w=600&q=80",
            "https://images.unsplash.com/photo-1526628953301-3cd44ed21ead?w=400&q=80",
            "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&q=80",
        ]
    },
    {
        num: "03",
        title: "Osteria Digital",
        label: "Frontend · Motion",
        tech: ["Next.js", "Framer Motion", "GSAP", "Figma"],
        desc: "Award-winning restaurant site (Awwwards Honorable Mention) with parallax photography, cinematic scroll animations, and fully custom reservation system.",
        year: "2022",
        photos: [
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
        ]
    },
    {
        num: "04",
        title: "HealthAI Analytics",
        label: "AI/ML · Python",
        tech: ["Python", "TensorFlow", "React", "PostgreSQL", "AWS"],
        desc: "Predictive analytics dashboard for healthcare providers. Processed anonymized patient records to identify potential health risks with 94% accuracy.",
        year: "2022",
        photos: [
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
            "https://images.unsplash.com/photo-1551076805-e18690c5e45e?w=400&q=80",
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80",
        ]
    },
    {
        num: "05",
        title: "Nexus E-Commerce",
        label: "Full-stack · GraphQL",
        tech: ["Vue.js", "Node.js", "GraphQL", "Stripe", "MongoDB"],
        desc: "Headless e-commerce solution supporting generic multi-vendor marketplaces. Handles complex variant inventories, scalable search, and multi-currency checkouts.",
        year: "2021",
        photos: [
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80",
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&q=80",
        ]
    },
    {
        num: "06",
        title: "Blocksync Ledger",
        label: "Blockchain · Web3",
        tech: ["Solidity", "Ethers.js", "React", "Tailwind", "IPFS"],
        desc: "Decentralized application for securely tracking and verifying digital supply chains via Ethereum smart contracts with minimal gas consumption.",
        year: "2020",
        photos: [
            "https://images.unsplash.com/photo-1639762681485-074b7f4ec651?w=600&q=80",
            "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&q=80",
            "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&q=80",
        ]
    },
];


// ─── SKILL BAR ──────────────────────────────────
function SkillCard({ skill, delay, onOpen }: { skill: typeof defaultSkills[0]; delay: number; onOpen: (data: any) => void }) {
    return (
        <motion.div
            variants={fadeIn(delay)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onOpen({ type: "skill", data: skill })}
            className="overflow-hidden border border-[#eee] rounded-2xl bg-white hover:border-[#111] transition-colors duration-200 cursor-pointer shadow-sm p-5"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#111]">{skill.name}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#bbb]">{skill.years}</span>
                    <span className="text-xs font-black text-[#111]">{skill.pct}%</span>
                </div>
            </div>
            <div className="h-[3px] bg-[#f0ede9] rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: delay + 0.3 }}
                    className="h-full bg-[#111] rounded-full"
                />
            </div>
            <p className="text-[10px] font-bold text-[#ccc] mt-3 flex items-center gap-1">
                <span>Tap to view details</span>
                <ExternalLink size={9} />
            </p>
        </motion.div>
    );
}

// ─── EXPERIENCE CARD ────────────────────────────
function ExperienceCard({ exp, delay, onOpen }: { exp: typeof defaultExperiences[0]; delay: number; onOpen: (data: any) => void }) {
    return (
        <motion.div
            variants={fadeIn(delay)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen({ type: "experience", data: exp })}
            className="group flex flex-col justify-between h-full border border-white/10 rounded-[2rem] bg-[#1a1a1a] hover:bg-[#222] hover:border-white/30 transition-all duration-300 shadow-xl cursor-pointer p-8 relative overflow-hidden"
        >
            <div className="absolute -top-6 -right-6 text-[120px] font-black text-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                {exp.period.split("—")[0]?.trim() || exp.period.split(" ")[0]}
            </div>
            <div className="relative z-10 flex-1 flex flex-col items-start gap-4 mb-10">
                {exp.badge && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#111] bg-white px-3 py-1.5 rounded-full">{exp.badge}</span>
                )}
                <div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-2 group-hover:text-[#eee]">{exp.role}</h3>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{exp.company}</p>
                </div>
                <p className="text-[13px] text-white/40 font-medium line-clamp-3 leading-relaxed mt-2">{exp.bullets[0]}</p>
            </div>

            <div className="relative z-10 flex items-end justify-between border-t border-white/5 pt-5 mt-auto">
                <span className="text-[10px] font-black tracking-widest uppercase text-white/40">{exp.period}</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 group-hover:text-white transition-colors">
                    <span>See more</span>
                    <ExternalLink size={10} />
                </div>
            </div>
        </motion.div>
    );
}

// ─── EDUCATION CARD ─────────────────────────────
function EducationCard({ edu, delay, onOpen }: { edu: typeof defaultEducation[0]; delay: number; onOpen: (data: any) => void }) {
    return (
        <motion.div
            variants={fadeIn(delay)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onOpen({ type: "education", data: edu })}
            className="border border-[#eee] rounded-2xl bg-white hover:border-[#111] transition-colors duration-200 shadow-sm cursor-pointer p-6"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f5f3f0] flex items-center justify-center shrink-0">
                    <GraduationCap size={18} className="text-[#888]" />
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-black text-[#111] mb-1">{edu.degree}</h3>
                    <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-2">{edu.school}</p>
                    <p className="text-xs text-[#bbb] font-medium">{edu.gpa} GPA · {edu.honors}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-[#bbb]">{edu.period}</p>
                    <p className="text-[10px] font-bold text-[#ccc] mt-2 flex items-center gap-1 justify-end">
                        <span>See more</span>
                        <ExternalLink size={9} />
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── TRANSLATIONS ───────────────────────────────
const t = {
    id: {
        available: "Tersedia untuk Peluang",
        skills: "Keahlian",
        education: "Pendidikan",
        experience: "Pengalaman Kerja",
        projects: "Proyek Terpilih",
        recognition: "Penghargaan",
        gallery: "Galeri Foto",
        clickExpand: "klik untuk detail",
        hire: "Rekrut Saya",
        hireDesc: "Terbuka untuk freelance, full-time, atau kontrak.",
        contact: "Hubungi Saya",
        sendEmail: "Kirim Email",
        footer: "Tersedia untuk Freelance & Full-time",
        together: "Mari bekerja bersama.",
        tagline: "Saya membangun produk digital berkinerja tinggi di persimpangan presisi rekayasa dan keanggunan desain. 6+ tahun membantu perusahaan meluncurkan produk yang dicintai pengguna.",
        role: "Insinyur Perangkat Lunak · Full-stack",
        seeMore: "Lihat detail",
        resume: "Resume",
        years: "Tahun",
        clients: "Klien",
        hoverHint: "Hover untuk warna",
        languages: "Bahasa",
    },
    en: {
        available: "Open to Opportunities",
        skills: "Skills",
        education: "Education",
        experience: "Work Experience",
        projects: "Selected Projects",
        recognition: "Recognition",
        gallery: "Photo Gallery",
        clickExpand: "click to expand",
        hire: "Hire Me",
        hireDesc: "Open to freelance, full-time or contract engagements.",
        contact: "Get in touch",
        sendEmail: "Send Email",
        footer: "Available for Freelance & Full-time",
        together: "Let's work together.",
        tagline: "I build high-performance digital products at the intersection of engineering precision and design elegance. 6+ years helping companies ship products people love.",
        role: "Software Engineer · Full-stack",
        seeMore: "See more",
        resume: "Resume",
        years: "Years",
        clients: "Clients",
        hoverHint: "Hover for color",
        languages: "Languages",
    },
};

// ─── MAIN ───────────────────────────────────────
export default function Portfolio() {
    const [modal, setModal] = React.useState<{ type: "skill" | "experience" | "education" | "project"; data: any } | null>(null);
    const [lang, setLang] = React.useState<"id" | "en">("id");
    const [expandExp, setExpandExp] = React.useState(false);
    const [expandProj, setExpandProj] = React.useState(false);
    const [expandSkill, setExpandSkill] = React.useState(false);
    const [expandRec, setExpandRec] = React.useState(false);
    const tx = t[lang];
    const openModal = React.useCallback((data: any) => setModal(data), []);
    const closeModal = React.useCallback(() => setModal(null), []);

    // Load CMS Data
    const [isMounted, setIsMounted] = React.useState(false);
    const [pData, setPData] = React.useState({
        personal: defaultPersonal,
        skills: defaultSkills,
        experiences: defaultExperiences,
        education: defaultEducation,
        projects: defaultProjects,
        recognitions: defaultRecognitions,
        languages: defaultLanguages
    });

    React.useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("portfolioState");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPData(prev => ({
                    personal: parsed.personal || prev.personal,
                    skills: parsed.skills || prev.skills,
                    experiences: parsed.experiences || prev.experiences,
                    education: parsed.education || prev.education,
                    projects: parsed.projects || prev.projects,
                    recognitions: parsed.recognitions || prev.recognitions,
                    languages: parsed.languages || prev.languages
                }));
            } catch (e) { }
        }
    }, []);

    if (!isMounted) return null; // Avoid hydration mismatch

    const { personal, skills, experiences, education, projects, recognitions, languages } = pData;

    return (
        <div className="bg-[#f8f7f4] min-h-screen text-[#111] font-sans antialiased overflow-x-hidden selection:bg-black selection:text-white">
            <ModalSheet modal={modal} onClose={closeModal} />

            {/* ── HEADER ── */}
            <motion.header
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 border-b border-black/[0.07] bg-[#f8f7f4]/90 backdrop-blur-2xl"
            >
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center justify-center w-8 h-8 rounded-full border border-black/10 hover:border-black/30 bg-white hover:bg-[#f5f5f5] transition-all" title="Kembali ke Beranda">
                        <ArrowLeft size={14} className="text-[#555]" />
                    </a>
                    <div className="w-px h-4 bg-black/10 hidden sm:block mx-1"></div>
                    <div className="w-7 h-7 rounded-full bg-[#111] flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">{personal.firstName.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#999] hidden sm:block">{personal.firstName} {personal.lastName}</span>
                </div>
                <nav className="hidden md:flex items-center gap-1">
                    {[
                        lang === "id" ? "Tentang" : "About",
                        lang === "id" ? "Pengalaman" : "Experience",
                        lang === "id" ? "Proyek" : "Projects",
                        lang === "id" ? "Kontak" : "Contact",
                    ].map((n, idx) => (
                        <a key={n} href={`#${["about", "experience", "projects", "contact"][idx]}`}
                            className="px-4 py-2 text-xs font-semibold text-[#999] hover:text-[#111] rounded-lg hover:bg-white transition-all tracking-wide">
                            {n}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    {/* Language toggle in header */}
                    <button
                        onClick={() => setLang(l => l === "id" ? "en" : "id")}
                        className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#999] hover:text-[#111] border border-black/10 hover:border-black/30 rounded-lg transition-all"
                    >
                        <Globe size={10} />
                        <span>{lang === "id" ? "EN" : "ID"}</span>
                    </button>
                    <a href="/settings"
                        className="hidden md:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#999] hover:text-[#111] border border-black/10 hover:border-black/40 rounded-lg transition-all">
                        <Edit3 size={11} /> Edit
                    </a>
                    <a href="#"
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-[#111] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-lg shadow-black/10">
                        <Download size={11} strokeWidth={2.5} /> {tx.resume}
                    </a>
                </div>
            </motion.header>

            {/* ── HERO ── */}
            <section id="about" className="sticky top-0 pt-20 min-h-screen grid grid-cols-1 lg:grid-cols-2">

                {/* Left - Text */}
                <div className="relative flex flex-col justify-center px-8 md:px-16 py-24 pb-32 lg:py-32 lg:pb-8 isolate overflow-hidden">
                    {/* 🌟 Ultra-Professional Ambient Grid */}
                    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ repeat: Infinity, duration: 200, ease: "linear" }}
                            className="w-[200%] h-[200%] md:w-[150%] md:h-[150%] opacity-20 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px] [mask-image:radial-gradient(circle_at_center,black_10%,transparent_50%)]"
                        />
                        {/* Subtle glass reflection sweeping across */}
                        <motion.div
                            animate={{ x: ["-200%", "300%"] }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear", repeatDelay: 6 }}
                            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 skew-x-[-25deg]"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease, delay: 0.1 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="h-px w-8 bg-[#111]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#aaa]">Portfolio · 2025</span>
                    </motion.div>

                    <div className="overflow-hidden mb-2">
                        <motion.h1
                            initial={{ y: "110%" }} animate={{ y: 0 }}
                            transition={{ duration: 1, ease, delay: 0.15 }}
                            className="text-[clamp(4rem,9vw,8rem)] font-black leading-[0.88] tracking-[-0.04em] text-[#111]"
                        >
                            {personal.firstName}
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden mb-10">
                        <motion.h1
                            initial={{ y: "110%" }} animate={{ y: 0 }}
                            transition={{ duration: 1, ease, delay: 0.25 }}
                            className="text-[clamp(4rem,9vw,8rem)] font-black leading-[0.88] tracking-[-0.04em] text-[#111]/20"
                        >
                            {personal.lastName}
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease, delay: 0.4 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="h-px w-6 bg-[#aaa]" />
                        <p className="text-sm font-bold text-[#888] uppercase tracking-[0.18em]">{personal.role}</p>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease, delay: 0.5 }}
                        className="text-[15px] text-[#666] leading-[1.85] font-medium max-w-sm mb-10"
                    >
                        {personal.tagline}
                    </motion.p>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease, delay: 0.6 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
                    >
                        {[
                            { icon: <Mail size={12} />, val: personal.email, type: 'email' },
                            { icon: <Globe size={12} />, val: personal.website, type: 'link', link: personal.website.startsWith('http') ? personal.website : `https://${personal.website}` },
                            { icon: <Phone size={12} />, val: personal.phone, type: 'phone', link: `https://wa.me/${personal.phone.replace(/[\s+]/g, '')}` },
                            { icon: <MapPin size={12} />, val: personal.location, type: 'maps', link: `https://maps.google.com/?q=${encodeURIComponent(personal.location)}` },
                        ].map((c: any, i) => (
                            <a
                                key={i}
                                href={c.type === 'email' ? `mailto:${c.val}` : c.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 text-xs text-[#777] font-semibold hover:text-[#111] transition-colors hover:underline hover:underline-offset-4 w-fit"
                            >
                                <span className="text-[#bbb]">{c.icon}</span>{c.val}
                            </a>
                        ))}
                    </motion.div>

                    {/* Socials */}
                    {(personal.github || personal.linkedin || personal.instagram) && (
                        <motion.div
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease, delay: 0.65 }}
                            className="flex flex-wrap gap-4 mb-8"
                        >
                            {[
                                { name: "GitHub", url: personal.github },
                                { name: "LinkedIn", url: personal.linkedin },
                                { name: "Instagram", url: personal.instagram },
                            ].filter(s => s.url).map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[#999] hover:text-[#111] transition-colors underline-offset-4 hover:underline">
                                    {s.name}
                                </a>
                            ))}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 w-fit rounded-full border border-black/10 bg-white shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#777]">{tx.available}</span>
                        </div>
                        {personal.currentStatus && (
                            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 w-fit rounded-full border border-black/5 bg-[#111]/5 shadow-sm">
                                <Briefcase size={12} className="text-[#555]" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#555]">{personal.currentStatus}</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right – photo: always visible, grayscale→color on hover */}
                <div className="relative bg-[#ece9e4] overflow-hidden min-h-[55vh] lg:min-h-0 group">
                    <motion.img
                        initial={{ scale: 1.08, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.4, ease }}
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90"
                        alt="Jefri Doe Portrait"
                        className="w-full h-full object-cover object-[center_15%] absolute inset-0
                       grayscale group-hover:grayscale-0
                       scale-100 group-hover:scale-[1.02]
                       transition-all duration-700 ease-out min-h-[55vh] lg:h-screen"
                    />
                    {/* Gradient bottom so it blends perfectly into the background */}
                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#f8f7f4] via-[#f8f7f4]/50 to-transparent pointer-events-none" />

                    {/* Hover hint badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="absolute top-6 right-6 px-3 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/60 text-[10px] font-bold uppercase tracking-widest text-[#999] group-hover:opacity-0 transition-opacity duration-500"
                    >
                        {tx.hoverHint}
                    </motion.div>

                    {/* Stats */}
                    <div className="absolute bottom-0 inset-x-0 p-8 pb-28">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { num: "6+", label: tx.years },
                                { num: "30+", label: lang === "id" ? "Proyek" : "Projects" },
                                { num: "20+", label: tx.clients }
                            ].map((s, i) => (
                                <motion.div
                                    key={s.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease, delay: 0.7 + i * 0.1 }}
                                    className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl px-4 py-4 shadow-lg"
                                >
                                    <p className="text-2xl font-black text-[#111] leading-none mb-1">{s.num}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#999]">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section >

            {/* ── LAYERED BODY SECTIONS ── */}

            {/* ── LAYER 1: EXPERIENCE ── */}
            <section id="experience" className="relative z-20 bg-[#111] text-white pt-32 pb-40 rounded-t-[3rem] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t border-white/5">
                <div className="max-w-[1160px] mx-auto px-8 md:px-16">
                    <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-5 mb-16 lg:mb-20">
                        <div className="flex items-center gap-4">
                            <Briefcase size={24} className="text-white/50" />
                            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-none">{tx.experience}</h2>
                        </div>
                        <p className="text-white/50 font-medium text-[15px] max-w-xl leading-relaxed">
                            {lang === "id"
                                ? "Rekam jejak karier saya dalam membangun aplikasi berskala besar, memimpin tim, serta mendorong inovasi teknologi di berbagai perusahaan terkemuka."
                                : "A proven track record of architecting scalable applications, leading cross-functional teams, and driving technological innovation across top tech companies."}
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(expandExp ? experiences : experiences.slice(0, 3)).map((e, i) => <ExperienceCard key={e.company} exp={e} delay={i * 0.15} onOpen={openModal} />)}
                    </div>
                    {experiences.length > 3 && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setExpandExp(!expandExp)}
                                className="px-6 py-3 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {expandExp ? (lang === "id" ? "Tampilkan Lebih Sedikit" : "Show Less") : (lang === "id" ? "Lihat Semua Pengalaman" : "View All Experiences")}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── LAYER 2: PROJECTS & SKILLS ── */}
            <section id="projects" className="relative z-30 bg-[#ece9e4] text-[#111] pt-32 pb-40 rounded-t-[3rem] -mt-16 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-black/5">
                <div className="max-w-[1160px] mx-auto px-8 md:px-16">
                    {/* Projects */}
                    <div className="mb-32">
                        <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center gap-4 mb-20">
                            <Star size={24} className="text-[#999]" />
                            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-none">{tx.projects}</h2>
                        </motion.div>
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`}>
                            {(expandProj ? projects : projects.slice(0, 5)).map((p, i) => {
                                // Professional Asymmetric Bento Grid logic for the first 5 elements
                                const isFeatured = !expandProj && i === 0;
                                const gridClasses = !expandProj
                                    ? (i === 0 ? "md:col-span-2 lg:col-span-2" : "md:col-span-1 lg:col-span-1")
                                    : "";

                                return (
                                    <motion.div
                                        key={p.title}
                                        variants={fadeIn(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                        onClick={() => openModal({ type: "project", data: p })}
                                        className={`group flex flex-col p-8 md:p-10 rounded-[2.5rem] border border-[#dcd9d4] bg-[#fdfaf5] hover:bg-white hover:border-[#111]/30 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 cursor-pointer ${gridClasses}`}
                                    >
                                        <div className="flex justify-between items-start mb-16 lg:mb-24">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#999] bg-black/5 px-4 py-2 rounded-full border border-black/5 shadow-sm">{p.label}</span>
                                            <span className="text-xs font-black text-[#bbb] group-hover:text-[#111] transition-colors bg-white px-3 py-1 rounded-full border border-[#eee]">{p.year}</span>
                                        </div>
                                        <div className="mt-auto">
                                            <h3 className={`${isFeatured ? 'text-4xl md:text-5xl' : 'text-3xl'} font-black text-[#111] mb-5 tracking-tight group-hover:-translate-y-1 transition-transform duration-300`}>{p.title}</h3>
                                            <p className={`text-[#666] leading-[1.8] font-medium mb-8 ${isFeatured ? 'text-[15px] md:pr-12' : 'text-[13px] line-clamp-2'}`}>{p.desc}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {p.tech.map(t => (
                                                    <span key={t} className="text-[10px] font-bold tracking-wide text-[#777] px-3.5 py-1.5 rounded-xl bg-white border border-[#eae6e0] shadow-sm">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {projects.length > 5 && (
                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={() => setExpandProj(!expandProj)}
                                    className="px-8 py-4 rounded-full border border-black/15 text-[11px] font-black uppercase tracking-widest text-[#555] bg-black/5 hover:text-[#111] hover:bg-black/10 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {expandProj ? (lang === "id" ? "Sembunyikan Proyek Lain" : "Show Less") : (lang === "id" ? "Lihat Semua Proyek" : "View All Projects")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div id="skills">
                        <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-5 mb-16">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Code2 size={24} className="text-[#999]" />
                                    <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-black tracking-tight leading-none">{tx.skills}</h2>
                                </div>
                                <span className="text-[9px] font-bold text-[#ccc] ml-auto italic hidden sm:block">{tx.clickExpand}</span>
                            </div>
                            <p className="text-[#777] font-medium text-[14px] max-w-md leading-relaxed">
                                {lang === "id"
                                    ? "Berbagai teknologi dan bahasa pemrograman yang telah saya kuasai dan gunakan secara aktif dalam lingkungan produksi selama bertahun-tahun."
                                    : "Technologies and programming languages I have mastered and actively use to compose robust software architectures in production environments."}
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {(expandSkill ? skills : skills.slice(0, 6)).map((s, i) => <SkillCard key={s.name} skill={s} delay={i * 0.1} onOpen={openModal} />)}
                        </div>
                        {skills.length > 6 && (
                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={() => setExpandSkill(!expandSkill)}
                                    className="px-8 py-4 rounded-full border border-black/15 text-[11px] font-black uppercase tracking-widest text-[#555] bg-black/5 hover:text-[#111] hover:bg-black/10 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {expandSkill ? (lang === "id" ? "Sembunyikan Keahlian Lain" : "Show Less") : (lang === "id" ? "Lihat Semua Keahlian" : "View All Skills")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── LAYER 3: EDUCATION ── */}
            <section id="education" className="relative z-40 bg-white text-[#111] pt-32 pb-40 rounded-t-[3rem] -mt-16 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.05)] border-t border-black/5">
                <div className="max-w-[1160px] mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div>
                        <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-5 mb-16">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <GraduationCap size={24} className="text-[#999]" />
                                    <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-black tracking-tight leading-none">{tx.education}</h2>
                                </div>
                                <span className="text-[9px] font-bold text-[#ccc] ml-auto italic hidden sm:block">{tx.clickExpand}</span>
                            </div>
                            <p className="text-[#777] font-medium text-[14px] max-w-md leading-relaxed">
                                {lang === "id"
                                    ? "Fondasi akademis tempat saya memperoleh pemahaman mendalam tentang rekayasa perangkat lunak dan arsitektur sistem komputer modern."
                                    : "The academic foundation where I acquired a deep understanding of software engineering and modern computer systems architecture."}
                            </p>
                        </motion.div>
                        <div className="flex flex-col gap-4">
                            {education.slice(0, 1).map((e, i) => <EducationCard key={e.school} edu={e} delay={i * 0.15} onOpen={openModal} />)}
                        </div>
                    </div>
                    {/* Visual campus on right side */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
                        className="hidden lg:block relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5 min-h-[400px]"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                            alt="University Campus"
                            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 via-transparent to-transparent flex items-end p-10 pointer-events-none">
                            <div>
                                <h3 className="text-white text-2xl font-black mb-1.5 tracking-tight">University of Indonesia</h3>
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    {lang === "id" ? "Kampus Utama, Depok" : "Main Campus, Depok"}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── LAYER 4: RECOGNITION & LANGUAGES ── */}
            <section className="relative z-50 bg-[#f8f7f4] text-[#111] pt-32 pb-40 rounded-t-[3rem] -mt-16 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.03)] border-t border-white">
                <div className="max-w-[1160px] mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div>
                        <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center gap-4 mb-16">
                            <Award size={24} className="text-[#999]" />
                            <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-black tracking-tight leading-none">{tx.recognition}</h2>
                        </motion.div>
                        <div className="space-y-4">
                            {(() => {
                                return (expandRec ? recognitions : recognitions.slice(0, 3)).map((a: any, i: number) => (
                                    <motion.div key={a.title} variants={fadeIn(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                        className="flex items-center gap-6 p-6 md:p-8 rounded-3xl border border-[#eee] bg-white hover:border-[#111] transition-colors shadow-sm">
                                        <span className="text-sm font-black text-[#ccc] w-12 shrink-0">{a.year}</span>
                                        <div className="flex-1">
                                            <p className="text-lg font-black text-[#111]">{a.title}</p>
                                            <p className="text-sm text-[#aaa] font-bold mt-1">{a.org}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#f8f7f4] flex items-center justify-center">
                                            <Star size={14} className="text-[#bbb]" />
                                        </div>
                                    </motion.div>
                                ));
                            })()}
                        </div>
                        <div className="mt-12 flex justify-start">
                            <button
                                onClick={() => setExpandRec(!expandRec)}
                                className="px-8 py-3 rounded-full border border-black/15 text-[11px] font-black uppercase tracking-widest text-[#555] bg-black/5 hover:text-[#111] hover:bg-black/10 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {expandRec ? (lang === "id" ? "Sembunyikan" : "Show Less") : (lang === "id" ? "Semua Penghargaan" : "All Awards")}
                            </button>
                        </div>
                    </div>

                    <div>
                        <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center gap-4 mb-16">
                            <Globe size={24} className="text-[#999]" />
                            <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-black tracking-tight leading-none">{tx.languages}</h2>
                        </motion.div>
                        <div className="p-10 md:p-12 rounded-[2.5rem] bg-white border border-[#eee] shadow-sm">
                            {languages.map((l: any, i: number) => (
                                <motion.div key={l.lang} variants={fadeIn(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                    className="mb-8 last:mb-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-black text-[#111]">{l.lang}</span>
                                        <span className="text-xs font-black uppercase tracking-widest text-[#aaa] bg-[#f8f7f4] px-3 py-1.5 rounded-full">{l.level}</span>
                                    </div>
                                    <div className="h-1 bg-[#f0ede9] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${l.pct}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1], delay: 0.3 + i * 0.15 }}
                                            className="h-full bg-[#111] rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LAYER 5: PHOTO GALLERY ── */}
            <section id="gallery" className="relative z-[60] bg-[#111] text-white pt-32 pb-40 rounded-t-[3rem] -mt-16 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.3)] border-t border-white/10">
                <div className="max-w-[1160px] mx-auto px-8 md:px-16">
                    <motion.div variants={fadeIn()} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center gap-4 mb-20">
                        <Star size={24} className="text-white/50" />
                        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-none">{tx.gallery || "Galeri Foto"}</h2>
                    </motion.div>

                    {/* Masonry-style irregular grid for the photo gallery */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[300px]">
                        {[
                            {
                                src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
                                classes: "col-span-2 row-span-2"
                            },
                            {
                                src: "https://images.unsplash.com/photo-1552581234-26160f608093?w=600&q=80",
                                classes: "col-span-2 row-span-1"
                            },
                            {
                                src: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80",
                                classes: "col-span-1 row-span-1"
                            },
                            {
                                src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80",
                                classes: "col-span-1 row-span-1"
                            },
                            {
                                src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&q=80",
                                classes: "col-span-4 row-span-2 hidden md:block" // wide cinematic banner spanning the entire bottom
                            }
                        ].map((img, i) => (
                            <motion.div
                                key={i}
                                variants={fadeIn(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className={`rounded-[2rem] overflow-hidden relative group bg-white/5 ${img.classes}`}
                            >
                                <img
                                    src={img.src}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-110"
                                    alt="Gallery image"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm -translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        <ExternalLink size={16} className="text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer id="contact" className="bg-[#111] text-white mt-8">
                <div className="max-w-[1160px] mx-auto px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">{tx.footer}</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{tx.together}</h2>
                    </div>
                    <a href="mailto:hello@jefridoe.com"
                        className="flex items-center gap-2 px-7 py-4 bg-white text-[#111] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-colors shadow-2xl shadow-white/10">
                        <Mail size={13} /> {tx.sendEmail}
                    </a>
                </div>
                <div className="max-w-[1160px] mx-auto px-8 md:px-16 pb-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-white/25 font-medium">© 2025 Jefri Doe. Crafted with precision.</p>
                    <div className="flex gap-6">
                        {["GitHub", "LinkedIn", "Twitter"].map(s => (
                            <a key={s} href="#" className="text-[11px] font-bold uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors">{s}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div >
    );
}
