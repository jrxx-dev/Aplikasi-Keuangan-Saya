"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Home, Wallet, User, FileText, Settings, Calendar, NotebookPen } from "lucide-react";

// Kurva Easing Premium
const smoothEase = [0.22, 1, 0.36, 1] as const;

// Animasi gambar garis yang jauh lebih pelan dan elegan
const drawTransition = (dur = 1.5, delay = 0) => ({
  duration: dur,
  delay: delay,
  ease: smoothEase
});

// Animasi memudar masuk (fade + blur) yang sangat bersih
const fadeTransition = (dur = 1, delay = 0) => ({
  duration: dur,
  delay: delay,
  ease: smoothEase
});

const scenes = [
  {
    id: "experiences",
    kicker: "We shape digital (and magical)...",
    title: "Experiences.",
    svg: (
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-[380px] max-h-[380px] stroke-slate-900 fill-none mx-auto" style={{ strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }}>

        {/* === SCENE 1: Reading on a Chair === */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5)} d="M 80 380 L 420 380" strokeWidth={5} className="stroke-slate-300" /> {/* Garis Lantai Halus */}

        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5, 0.2)} d="M 180 380 L 160 250 M 320 380 L 340 250" />
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5, 0.4)} d="M 140 250 C 140 300 360 300 360 250" strokeWidth={5} />

        {/* Character Reading */}
        <motion.circle initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={fadeTransition(2, 0.8)} cx="250" cy="120" r="30" className="fill-slate-900 stroke-none" />
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5, 1)} d="M 250 160 C 250 200 230 240 250 280" strokeWidth={10} />

        {/* Huge Newspaper */}
        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(2, 1.2)} className="fill-white stroke-slate-900" strokeWidth={3} d="M 130 180 L 250 230 L 370 180 L 250 130 Z" />
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1, 1.8)} d="M 250 130 L 250 230" strokeWidth={3} />

        {/* Texts */}
        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(1, 2)} d="M 170 170 L 230 190 M 180 180 L 240 200 M 190 190 L 230 205" strokeWidth={2} className="stroke-slate-400" />
        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(1, 2.2)} d="M 330 170 L 270 190 M 320 180 L 260 200 M 310 190 L 270 205" strokeWidth={2} className="stroke-slate-400" />

        {/* Hands */}
        <motion.path initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={fadeTransition(1.5, 2.4)} d="M 140 200 C 120 200 120 230 140 230 Z" className="fill-slate-900 stroke-none" />
        <motion.path initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={fadeTransition(1.5, 2.4)} d="M 360 200 C 380 200 380 230 360 230 Z" className="fill-slate-900 stroke-none" />

        {/* Floating Accents */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fadeTransition(3, 2.5)}>
          <motion.g transform="translate(88, 88)" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
            <rect x="-8" y="-8" width="16" height="16" rx="4" className="fill-slate-900 stroke-none" />
          </motion.g>
          <motion.circle cx="420" cy="120" r="8" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="fill-slate-900 stroke-none" />
        </motion.g>

      </svg>
    )
  },
  {
    id: "workspaces",
    kicker: "We build productive (and beautiful)...",
    title: "Workspaces.",
    svg: (
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-[380px] max-h-[380px] stroke-slate-900 fill-none mx-auto" style={{ strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }}>

        {/* === SCENE 2: The Modern Workspace === */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5)} d="M 50 380 L 450 380" strokeWidth={5} className="stroke-slate-300" />

        {/* Legs */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5, 0.2)} d="M 120 380 L 120 480 M 380 380 L 380 480" strokeWidth={5} />

        {/* Monitor */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1, 0.5)} d="M 250 380 L 250 320" strokeWidth={10} />
        <motion.g transform="translate(250, 380)" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={fadeTransition(1, 0.7)}>
          <path d="M -50 0 L 50 0" strokeWidth={6} />
        </motion.g>

        <motion.rect initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(2, 1)} x="120" y="150" width="260" height="170" rx="8" className="fill-white" strokeWidth={4} />

        {/* Chart */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(2, 1.8)} className="stroke-slate-300" strokeWidth={6} d="M 160 280 L 210 230 L 260 260 L 320 200" />
        <motion.circle initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={fadeTransition(1, 2.5)} cx="320" cy="200" r="5" className="fill-slate-900 stroke-none" />

        {/* Lamp */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5, 0.8)} d="M 80 380 L 100 230 L 150 180" strokeWidth={4} />
        <motion.g transform="translate(140, 180)" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={fadeTransition(1, 1.5)}>
          <path className="fill-slate-900 stroke-none" d="M -10 -30 L 40 -50 L 50 -10 L 0 10 Z" />
        </motion.g>

        {/* Light Beam (Sangat Halus) */}
        <motion.path initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.3, 0.6] }} transition={{ duration: 4, repeat: Infinity, delay: 2.5, ease: "easeInOut" }} className="stroke-[#f8e1a8] mix-blend-multiply" strokeWidth={20} strokeLinecap="butt" d="M 170 190 L 200 320" />

        {/* Minimalist Plant */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1, 1.2)} className="fill-white" d="M 400 380 L 390 320 L 430 320 L 420 380 Z" />
        <motion.g transform="translate(410, 320)" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={fadeTransition(1.5, 1.8)} className="fill-slate-900 stroke-none">
          <path d="M 0 0 C -40 -80 10 -110 0 0 Z" />
          <path d="M 0 0 C 40 -80 60 -60 0 0 Z" />
          <path d="M 0 0 C -20 -50 20 -50 0 0 Z" />
        </motion.g>
      </svg>
    )
  },
  {
    id: "routines",
    kicker: "We structure daily (and healthy)...",
    title: "Routines.",
    svg: (
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-[380px] max-h-[380px] stroke-slate-900 fill-none mx-auto" style={{ strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }}>

        {/* === SCENE 3: Clock & Routine === */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5)} d="M 60 380 L 440 380" strokeWidth={5} className="stroke-slate-300" />

        {/* Clock */}
        <motion.circle initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(2, 0.5)} cx="250" cy="240" r="130" strokeWidth={6} className="fill-white" />
        <motion.circle initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={fadeTransition(1, 1)} cx="250" cy="240" r="8" className="fill-slate-900 stroke-none" />

        <motion.g transform="translate(250, 240)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={fadeTransition(1.5, 1.2)} strokeWidth={4} className="stroke-slate-400">
          <line x1="0" y1="-115" x2="0" y2="-100" />
          <line x1="0" y1="115" x2="0" y2="100" />
          <line x1="-115" y1="0" x2="-100" y2="0" />
          <line x1="115" y1="0" x2="100" y2="0" />
        </motion.g>

        {/* Native CSS rotation on pure standard SVG g tag - Bulletproof React compatibility */}
        <g style={{ transformOrigin: "250px 240px", animation: "spin 60s linear infinite" }}>
          <line x1="250" y1="240" x2="250" y2="180" className="stroke-slate-900" strokeWidth={8} strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: "250px 240px", animation: "spin 5s linear infinite" }}>
          <line x1="250" y1="240" x2="250" y2="150" className="stroke-slate-900" strokeWidth={5} strokeLinecap="round" />
        </g>

        {/* CSS Keyframes declaration inline just for this spin */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />

        {/* Coffee Cup */}
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1.5, 0.5)} className="fill-white" strokeWidth={4} d="M 120 380 L 160 380 L 170 320 C 170 330 110 330 110 320 Z" />
        <motion.ellipse initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={fadeTransition(1, 1.8)} cx="140" cy="320" rx="30" ry="6" className="fill-white" strokeWidth={3} />
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1, 1.5)} d="M 166 335 C 196 335 196 365 158 365" strokeWidth={4} />

        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.7, 0], y: [0, -10, -25] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} d="M 130 300 C 110 270 150 240 130 210" strokeWidth={2} className="stroke-slate-300" />
        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.7, 0], y: [0, -10, -25] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }} d="M 150 305 C 130 275 170 245 150 215" strokeWidth={2} className="stroke-slate-300" />

        {/* Notebooks */}
        <motion.rect initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(1.5, 1.2)} x="320" y="364" width="90" height="16" rx="2" className="fill-white" strokeWidth={3} />
        <motion.rect initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={drawTransition(1, 1.5)} x="330" y="352" width="70" height="12" rx="2" className="fill-white" strokeWidth={3} />
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={drawTransition(1, 2)} d="M 340 348 L 390 320" strokeWidth={4} />
        <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fadeTransition(0.5, 2.8)} d="M 390 320 L 400 312" strokeWidth={2} />

      </svg>
    )
  }
];

export default function ExactHelloMondayClone() {
  const [index, setIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Interval dibuat lebih santai (7 detik) agar terasa bernapas & tidak buru-buru
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % scenes.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#fcfaf9] h-screen w-screen text-[#0d0c0c] flex flex-col selection:bg-[#f4dbe0] overflow-hidden relative">

      {/* 1. HEADER MINIMALIS (Fixed w/ overlay integration) */}
      <header className={`fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-[100] transition-colors duration-500 pointer-events-auto ${isMenuOpen ? 'text-white' : 'mix-blend-difference text-white'}`}>
        <a href="#" className="font-bold text-xl tracking-tight hover:opacity-70 transition-opacity">
          DailyActivity
        </a>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center justify-center border-none bg-transparent cursor-pointer hover:scale-105 transition-transform z-[110]">
          {isMenuOpen ? <X strokeWidth={1.5} className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <Menu strokeWidth={1.5} className="w-6 h-6 md:w-7 md:h-7 text-white" />}
        </button>
      </header>

      {/* 2. OVERLAY NAVIGATION MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 95% 5%)" }}
            animate={{ opacity: 1, clipPath: "circle(200% at 95% 5%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 95% 5%)", transition: { duration: 0.8 } }}
            transition={{ duration: 1, ease: smoothEase }}
            className="fixed inset-0 w-full h-full bg-[#0d0c0c] z-[90] flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="flex flex-col w-full max-w-5xl px-8">
              <motion.span
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xs md:text-sm tracking-[0.3em] font-medium uppercase text-slate-500 mb-8 md:mb-12 block"
              >
                Module Selection
              </motion.span>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 pt-2 md:pt-4 w-full max-w-[1400px] mx-auto">
                <MenuOverlayCard title="Home" category="Dashboard Utama" icon={<Home strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="/dashboard" delay={0.2} />
                <MenuOverlayCard title="FinanceApp" category="Keuangan" icon={<Wallet strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="http://localhost:3000" delay={0.3} />
                <MenuOverlayCard title="Profil" category="Akun" icon={<User strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="/profile" delay={0.4} />
                <MenuOverlayCard title="Portofolio" category="CV & Resume" icon={<FileText strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="/portofolio" delay={0.5} />
                <MenuOverlayCard title="Settingan" category="Pengaturan" icon={<Settings strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="/settings" delay={0.6} />
                <MenuOverlayCard title="RutinApp" category="Produktivitas" icon={<Calendar strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="#" delay={0.7} />
                <MenuOverlayCard title="NoteApp" category="Catatan" icon={<NotebookPen strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />} url="#" delay={0.8} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center h-full w-full relative pt-12 md:pt-0 overflow-hidden">
        <div className="w-full max-w-[1200px] flex flex-col items-center justify-center relative">

          {/* SVG Frame (Sangat Mulus dengan Filter Blur Premium Apple/HelloMonday) */}
          <div className="w-full h-[40vh] min-h-[300px] md:min-h-[400px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={"svg-" + scenes[index].id}
                initial={{ opacity: 0, filter: "blur(12px)", scale: 0.95 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(15px)", scale: 1.05 }}
                transition={{ duration: 1.2, ease: smoothEase }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {scenes[index].svg}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text Frame (Juga tersinkronisasi mulus menggunakan blur) */}
          <div className="w-full h-[30vh] md:h-[35vh] flex flex-col items-center relative mt-4 md:mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={"text-" + scenes[index].id}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
                transition={{ duration: 1.2, ease: smoothEase }}
                className="absolute inset-0 flex flex-col items-center justify-start text-center px-4"
              >
                <p className="font-sans text-xs md:text-sm text-slate-500 tracking-[0.3em] font-medium uppercase mb-6 md:mb-8">
                  {scenes[index].kicker}
                </p>

                <h1 className="font-serif text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[11rem] leading-[0.85] tracking-tight text-[#0d0c0c] flex items-center mix-blend-multiply">
                  {scenes[index].title}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

    </div>
  );
}

function MenuOverlayCard({ title, category, icon, url, delay }: { title: string, category: string, icon: React.ReactNode, url: string, delay: number }) {
  return (
    <motion.a
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay, ease: smoothEase }}
      href={url}
      className="group block relative border border-slate-800 rounded-2xl p-5 md:p-6 hover:border-slate-500 transition-all duration-500 overflow-hidden bg-[#0a0a0a]"
    >
      <div className="absolute inset-0 w-full h-full z-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-2xl" />

      <div className="relative z-10 flex flex-col h-full gap-8">
        <div className="flex justify-between items-start">
          <div className="text-white group-hover:text-black transition-colors duration-500">
            {icon}
          </div>
          <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:rotate-0 transition-all duration-700 text-black group-hover:bg-black group-hover:text-white group-hover:border-black">
            <ArrowUpRight size={20} strokeWidth={1.5} />
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800 group-hover:border-slate-300 transition-colors duration-500">
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-sans font-semibold text-slate-500 group-hover:text-slate-600 transition-colors duration-500 block mb-2">
            {category}
          </span>
          <h3 className="text-lg md:text-2xl font-serif leading-none tracking-tight text-white group-hover:text-black transition-colors duration-500">
            {title}
          </h3>
        </div>
      </div>
    </motion.a>
  );
}
