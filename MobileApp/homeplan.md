<!DOCTYPE html>

<html lang="id" style=""><head></head><body class="bg-background text-on-background font-body-sm pb-24 md:pb-0">
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Vitality Finance - Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "surface-bright": "#f8f9ff",
                      "on-primary-container": "#00422b",
                      "surface-dim": "#cbdbf5",
                      "surface-container-highest": "#d3e4fe",
                      "on-tertiary-fixed-variant": "#783200",
                      "inverse-primary": "#4edea3",
                      "tertiary-container": "#ff7e2d",
                      "tertiary-fixed-dim": "#ffb690",
                      "on-secondary": "#ffffff",
                      "on-background": "#0b1c30",
                      "surface-variant": "#d3e4fe",
                      "on-error-container": "#93000a",
                      "on-error": "#ffffff",
                      "inverse-surface": "#213145",
                      "primary-fixed": "#6ffbbe",
                      "on-primary-fixed": "#002113",
                      "on-primary": "#ffffff",
                      "secondary-fixed-dim": "#adc6ff",
                      "on-secondary-fixed-variant": "#004395",
                      "outline-variant": "#bbcabf",
                      "primary-fixed-dim": "#4edea3",
                      "surface-container-low": "#eff4ff",
                      "secondary-fixed": "#d8e2ff",
                      "outline": "#6c7a71",
                      "secondary-container": "#2170e4",
                      "secondary": "#0058be",
                      "surface-container-lowest": "#ffffff",
                      "inverse-on-surface": "#eaf1ff",
                      "surface-container": "#e5eeff",
                      "primary-container": "#10b981",
                      "on-secondary-fixed": "#001a42",
                      "on-secondary-container": "#fefcff",
                      "background": "#f8f9ff",
                      "surface-tint": "#006c49",
                      "on-tertiary-fixed": "#341100",
                      "tertiary-fixed": "#ffdbca",
                      "on-surface": "#0b1c30",
                      "on-tertiary-container": "#622700",
                      "tertiary": "#9d4300",
                      "error-container": "#ffdad6",
                      "error": "#ba1a1a",
                      "primary": "#006c49",
                      "on-tertiary": "#ffffff",
                      "surface-container-high": "#dce9ff",
                      "on-primary-fixed-variant": "#005236",
                      "on-surface-variant": "#3c4a42",
                      "surface": "#f8f9ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "container-padding-mobile": "20px",
                      "base": "8px",
                      "stack-md": "12px",
                      "container-padding-desktop": "40px",
                      "stack-lg": "24px",
                      "gutter": "16px",
                      "stack-sm": "4px"
              },
              "fontFamily": {
                      "body-sm": ["Inter"],
                      "label-md": ["Inter"],
                      "headline-md": ["Inter"],
                      "display-lg": ["Inter"],
                      "numeric-xl": ["Inter"],
                      "headline-lg": ["Inter"],
                      "headline-lg-mobile": ["Inter"],
                      "body-lg": ["Inter"]
              },
              "fontSize": {
                      "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                      "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                      "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                      "display-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "numeric-xl": ["36px", {"lineHeight": "44px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
                      "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
                      "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
              }
            }
          }
        }
      </script>
<style>
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.outline {
          font-variation-settings: 'FILL' 0;
        }
        
        /* Glassmorphism utilities */
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 20px rgba(33, 112, 228, 0.04);
        }
        
        /* Ambient Shadows */
        .ambient-shadow {
            box-shadow: 0 4px 20px rgba(33, 112, 228, 0.04);
        }
        
        /* Entrance Animations */
        @keyframes fadeSlideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Shimmer Animation */
        @keyframes shimmer {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(150%); }
        }
        
        .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transform: translateX(-150%);
            animation: shimmer 3s infinite cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 5;
        }

        /* SVG Chart Animations */
        @keyframes drawPath {
            to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @media (prefers-reduced-motion: no-preference) {
            .animate-entrance {
                opacity: 0;
                animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .delay-100 { animation-delay: 100ms; }
            .delay-200 { animation-delay: 200ms; }
            .delay-300 { animation-delay: 300ms; }
            .delay-400 { animation-delay: 400ms; }
            .delay-500 { animation-delay: 500ms; }

            .animate-draw {
                stroke-dasharray: 1500;
                stroke-dashoffset: 1500;
                animation: drawPath 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                animation-delay: 0.4s;
            }
            .animate-fade-in {
                opacity: 0;
                animation: fadeIn 1.5s ease-out forwards;
                animation-delay: 0.8s;
            }
        }
        
        /* Floating Animation */
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        
        /* Pulse Animation */
        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(0, 108, 73, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(0, 108, 73, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 108, 73, 0); }
        }

        @media (prefers-reduced-motion: no-preference) {
            .animate-float {
                animation: float 4s ease-in-out infinite;
            }
            .animate-pulse-ring {
                animation: pulse-ring 2s infinite;
            }
        }

        /* Bar chart animation */
        @keyframes growUp {
            from { height: 0; opacity: 0; }
            to { height: var(--target-height); opacity: 1; }
        }
        @media (prefers-reduced-motion: no-preference) {
            .bar-animate {
                height: 0;
                animation: growUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
        }
        @media (prefers-reduced-motion: reduce) {
             .bar-animate {
                height: var(--target-height);
             }
             .animate-entrance {
                 opacity: 1;
             }
             .animate-draw {
                 stroke-dasharray: none;
                 stroke-dashoffset: 0;
             }
             .animate-fade-in {
                 opacity: 1;
             }
        }
        
        /* Hide scrollbar for horizontal scroll */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<!-- TopAppBar -->
<header class="bg-white/60 dark:bg-on-background/60 backdrop-blur-md fixed top-0 w-full z-50 shadow-[0_4px_20px_rgba(33,112,228,0.04)] transition-all duration-300 animate-entrance">
<div class="flex items-center justify-between px-container-padding-mobile h-16 w-full max-w-md mx-auto"><div class="flex items-center gap-2 text-on-surface">
<span class="material-symbols-outlined text-[18px] text-primary">schedule</span>
<p class="font-body-sm font-semibold tracking-wide">
    Senin, 24 Oktober 2023 <span class="mx-1 text-outline-variant">|</span> 14:30
  </p>
</div>
<button class="w-8 h-8 flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all active:scale-90 duration-200">
<span class="material-symbols-outlined outline text-[24px]">notifications</span>
</button></div>
</header>
<!-- Main Content Canvas -->
<main class="w-full max-w-md mx-auto px-container-padding-mobile pt-[88px] flex flex-col gap-stack-lg">
<!-- Total Saldo Card -->
<section class="bg-primary text-on-primary rounded-2xl relative overflow-hidden shadow-lg animate-entrance shimmer-effect flex flex-col cursor-grab active:cursor-grabbing" id="saldo-card">
<!-- Decorative Background Elements (Shared) -->
<div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none z-0"></div>
<div class="absolute bottom-0 left-0 w-32 h-32 bg-primary-fixed/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none z-0"></div>
<!-- Carousel Wrapper -->
<div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar relative z-10 w-full" id="saldo-slider" style="scroll-behavior: smooth;">
<!-- Slide 1: TOTAL SALDO SEMUA -->
<div class="min-w-full w-full shrink-0 snap-center p-stack-lg flex flex-col gap-1">
<span class="font-label-md text-on-primary/80 uppercase tracking-wider">TOTAL SALDO SEMUA</span>
<h2 class="font-display-lg font-bold">Rp 12.450.000</h2>
<div class="flex items-center gap-2 mt-2">
<div class="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-on-primary">
<span class="material-symbols-outlined text-[12px]">trending_up</span>
          +4.2%
        </div>
<span class="font-body-sm text-[12px] text-on-primary/80">dari bulan lalu</span>
</div>
</div>
<!-- Slide 2: SALDO TERSEDIA -->
<div class="min-w-full w-full shrink-0 snap-center p-stack-lg flex flex-col gap-1">
<span class="font-label-md text-on-primary/80 uppercase tracking-wider">SALDO TERSEDIA</span>
<h2 class="font-display-lg font-bold">Rp 4.250.000</h2>
<div class="flex items-center gap-2 mt-2">
<div class="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-on-primary">
<span class="material-symbols-outlined text-[12px]">trending_up</span>
          +1.5%
        </div>
<span class="font-body-sm text-[12px] text-on-primary/80">dari bulan lalu</span>
</div>
</div>
<!-- Slide 3: TOTAL TABUNGAN -->
<div class="min-w-full w-full shrink-0 snap-center p-stack-lg flex flex-col gap-1">
<span class="font-label-md text-on-primary/80 uppercase tracking-wider">TOTAL TABUNGAN</span>
<h2 class="font-display-lg font-bold">Rp 8.200.000</h2>
<div class="flex items-center gap-2 mt-2">
<div class="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-on-primary">
<span class="material-symbols-outlined text-[12px]">trending_up</span>
          +1.2%
        </div>
<span class="font-body-sm text-[12px] text-on-primary/80">dari bulan lalu</span>
</div>
</div>
</div>
<!-- Pagination Indicator -->
<div class="flex justify-center gap-1.5 pb-4 relative z-10" id="saldo-pagination">
<div class="w-1.5 h-1.5 rounded-full bg-white transition-all duration-300"></div>
<div class="w-1.5 h-1.5 rounded-full bg-white/30 transition-all duration-300"></div>
<div class="w-1.5 h-1.5 rounded-full bg-white/30 transition-all duration-300"></div>
</div>
</section>
<!-- Quick Insight Badge -->
<div class="flex items-center justify-between bg-primary-container/10 border border-primary-container/20 rounded-lg p-3 animate-entrance delay-100">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary-container text-[18px]">lightbulb</span>
<span class="font-body-lg text-on-surface-variant">Sisa budget bulan ini: <span class="text-primary font-bold">Rp 3.5M</span></span>
</div>
<button class="text-primary text-[10px] uppercase font-bold hover:underline active:scale-95 transition-transform duration-200">ATUR</button>
</div>
<!-- Total Balance Card (Glassmorphism) -->
<section class="flex flex-col gap-stack-md">
<div class="grid grid-cols-2 gap-stack-md animate-entrance delay-200">
<!-- Tabungan -->
<div class="bg-surface-container-lowest p-3 rounded-xl border border-surface-variant flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:scale-95 relative overflow-hidden cursor-pointer">
<div class="absolute top-0 right-0 w-6 h-6 bg-primary/5 rounded-bl-full"></div>
<div class="flex items-center gap-1 text-primary-container mb-1">
<span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
<span class="font-label-md text-[10px] uppercase">Tabungan</span>
</div>
<span class="font-body-lg text-base font-bold">Rp 8.2M</span>
<div class="flex items-center justify-between mt-1">
<span class="text-[10px] text-primary-container font-semibold">+1.2%</span>
<span class="text-[8px] text-outline flex items-center gap-0.5">Bank Central</span>
</div>
</div>
<!-- E-Wallet -->
<div class="bg-surface-container-lowest p-3 rounded-xl border border-surface-variant flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:scale-95 relative overflow-hidden cursor-pointer">
<div class="absolute top-0 right-0 w-6 h-6 bg-secondary/5 rounded-bl-full"></div>
<div class="flex items-center gap-1 text-secondary mb-1">
<span class="material-symbols-outlined text-[16px]">account_balance</span>
<span class="font-label-md text-[10px] uppercase">E-Wallet</span>
</div>
<span class="font-body-lg text-base font-bold">Rp 1.2M</span>
<div class="flex items-center justify-between mt-1">
<span class="text-[10px] text-primary-container font-semibold">+5.4%</span>
<span class="text-[8px] text-outline flex items-center gap-0.5">G-Pay</span>
</div>
</div>
<!-- Investasi -->
<div class="bg-surface-container-lowest p-3 rounded-xl border border-surface-variant flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:scale-95 relative overflow-hidden cursor-pointer">
<div class="absolute top-0 right-0 w-6 h-6 bg-tertiary/5 rounded-bl-full"></div>
<div class="flex items-center gap-1 text-tertiary mb-1">
<span class="material-symbols-outlined text-[16px]">trending_up</span>
<span class="font-label-md text-[10px] uppercase">Investasi</span>
</div>
<span class="font-body-lg text-base font-bold">Rp 3.0M</span>
<div class="flex items-center justify-between mt-1">
<span class="text-[10px] text-error font-semibold">-0.8%</span>
<span class="text-[8px] text-outline flex items-center gap-0.5">Stocks</span>
</div>
</div>
<!-- Target (New Widget) -->
<div class="bg-surface-container-lowest p-3 rounded-xl border border-surface-variant flex flex-col gap-1 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:scale-95 relative overflow-hidden cursor-pointer">
<div class="absolute top-0 right-0 w-6 h-6 bg-primary-container/5 rounded-bl-full"></div>
<div class="flex items-center gap-1 text-primary mb-1">
<span class="material-symbols-outlined text-[16px]">track_changes</span>
<span class="font-label-md text-[10px] uppercase">Target</span>
</div>
<span class="font-body-lg text-base font-bold">Rp 15.0M</span>
<div class="flex items-center justify-between mt-1">
<span class="text-[10px] text-primary-container font-semibold">83%</span>
<span class="text-[8px] text-outline flex items-center gap-0.5">Liburan</span>
</div>
</div>
</div>
</section><section class="grid grid-cols-2 gap-stack-md animate-entrance delay-300">
<div class="bg-surface-container-low rounded-xl p-stack-md flex flex-col gap-2 transition-all hover:bg-surface-container hover:scale-[1.02] hover:shadow-md active:scale-95 duration-300 cursor-pointer group">
<div class="flex justify-between items-start">
<span class="font-label-md text-on-surface-variant group-hover:text-primary-container transition-colors">Pemasukan</span>
<span class="material-symbols-outlined text-primary-container text-[20px] transition-transform group-hover:scale-110 duration-300">trending_up</span>
</div>
<div class="flex flex-col">
<span class="font-body-lg text-lg font-bold text-on-background">Rp 5.200k</span>
<span class="text-[10px] text-primary-container font-semibold">+12% vs target</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-1.5 mt-1">
<div class="bg-primary-container h-1.5 rounded-full" style="width: 85%"></div>
</div>
</div>
<div class="bg-surface-container-low rounded-xl p-stack-md flex flex-col gap-2 transition-all hover:bg-surface-container hover:scale-[1.02] hover:shadow-md active:scale-95 duration-300 cursor-pointer group">
<div class="flex justify-between items-start">
<span class="font-label-md text-on-surface-variant group-hover:text-error transition-colors">Pengeluaran</span>
<span class="material-symbols-outlined text-error text-[20px] transition-transform group-hover:scale-110 duration-300">trending_down</span>
</div>
<div class="flex flex-col">
<span class="font-body-lg text-lg font-bold text-on-background">Rp 2.450k</span>
<span class="text-[10px] text-error font-semibold">45% dari budget</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-1.5 mt-1">
<div class="bg-error h-1.5 rounded-full" style="width: 45%"></div>
</div>
</div>
</section>
<!-- Weekly Expense Chart (Bento Style Component) -->
<section class="bg-surface-container-lowest rounded-xl p-stack-md ambient-shadow flex flex-col gap-stack-md animate-entrance delay-400 relative border border-surface-variant/50 transition-all hover:shadow-lg duration-300">
<div class="flex justify-between items-center mb-2">
<h2 class="font-headline-md text-headline-md text-on-background">Analisis Keuangan</h2>
<div class="relative group">
<button class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-surface-variant rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container active:scale-95 transition-all duration-200" id="expense-dropdown-btn">
<span>Mingguan</span>
<span class="material-symbols-outlined text-[18px]">expand_more</span>
</button>
<div class="absolute right-0 top-full mt-2 w-32 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 overflow-hidden" id="expense-dropdown-menu">
<a class="block px-4 py-2 text-on-surface-variant font-body-sm hover:bg-primary-container/10 hover:text-primary transition-colors" href="#">Mingguan</a>
<a class="block px-4 py-2 text-on-surface-variant font-body-sm hover:bg-primary-container/10 hover:text-primary transition-colors" href="#">Bulanan</a>
<a class="block px-4 py-2 text-on-surface-variant font-body-sm hover:bg-primary-container/10 hover:text-primary transition-colors" href="#">Tahunan</a>
</div>
</div>
</div>
<!-- Smooth Line Chart SVG -->
<div class="relative h-48 w-full group cursor-crosshair" id="chart-container">
<svg class="w-full h-full overflow-visible" id="chart-svg" preserveaspectratio="none" viewbox="0 0 320 140">
<defs>
<lineargradient id="income-gradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#10b981" stop-opacity="0.25"></stop>
<stop offset="100%" stop-color="#10b981" stop-opacity="0"></stop>
</lineargradient>
<lineargradient id="expense-gradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#0058be" stop-opacity="0.15"></stop>
<stop offset="100%" stop-color="#0058be" stop-opacity="0"></stop>
</lineargradient>
<filter height="140%" id="glow-income" width="140%" x="-20%" y="-20%">
<fegaussianblur result="blur" stddeviation="1.5"></fegaussianblur>
<fecomposite in="SourceGraphic" in2="blur" operator="over"></fecomposite>
</filter>
<filter height="140%" id="glow-expense" width="140%" x="-20%" y="-20%">
<fegaussianblur result="blur" stddeviation="1.5"></fegaussianblur>
<fecomposite in="SourceGraphic" in2="blur" operator="over"></fecomposite>
</filter>
</defs>
<!-- Grid Lines -->
<g class="opacity-60" stroke="#d3e4fe" stroke-dasharray="3 3" stroke-width="1">
<line x1="25" x2="320" y1="20" y2="20"></line>
<line x1="25" x2="320" y1="55" y2="55"></line>
<line x1="25" x2="320" y1="90" y2="90"></line>
<line x1="25" x2="320" y1="125" y2="125"></line>
</g>
<!-- Y Axis Labels -->
<g class="fill-on-surface-variant text-[10px] font-medium font-label-md">
<text x="0" y="24">6M</text>
<text x="0" y="59">4M</text>
<text x="0" y="94">2M</text>
<text x="0" y="129">0</text>
</g>
<!-- X Axis Labels -->
<g class="fill-on-surface-variant text-[10px] font-medium font-label-md text-center" text-anchor="middle">
<text x="25" y="142">Sen</text>
<text x="74" y="142">Sel</text>
<text x="123" y="142">Rab</text>
<text x="172" y="142">Kam</text>
<text x="221" y="142">Jum</text>
<text x="270" y="142">Sab</text>
<text x="319" y="142">Min</text>
</g>
<!-- Income Area -->
<path class="animate-fade-in" d="M25,125 C45,100 65,40 123,55 C160,65 190,30 221,45 C250,55 290,20 319,35 L319,125 L25,125 Z" fill="url(#income-gradient)"></path>
<!-- Expense Area -->
<path class="animate-fade-in" d="M25,125 C50,110 70,80 123,90 C160,95 190,60 221,75 C250,85 290,45 319,55 L319,125 L25,125 Z" fill="url(#expense-gradient)"></path>
<!-- Income Line -->
<path class="animate-draw" d="M25,125 C45,100 65,40 123,55 C160,65 190,30 221,45 C250,55 290,20 319,35" fill="none" filter="url(#glow-income)" stroke="#10b981" stroke-linecap="round" stroke-width="2.5"></path>
<!-- Expense Line -->
<path class="animate-draw" d="M25,125 C50,110 70,80 123,90 C160,95 190,60 221,75 C250,85 290,45 319,55" fill="none" filter="url(#glow-expense)" stroke="#0058be" stroke-linecap="round" stroke-width="2.5"></path>
<!-- Interactive Elements (shown on hover via JS) -->
<g class="transition-opacity duration-200 opacity-0 group-hover:opacity-100" id="interactive-group">
<!-- Vertical Guide Line -->
<line class="opacity-40" id="guide-line" stroke="#6c7a71" stroke-dasharray="4 4" stroke-width="1" x1="172" x2="172" y1="15" y2="125"></line>
<!-- Data Points -->
<circle class="drop-shadow-md" cx="172" cy="37" fill="#10b981" id="point-income" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
<circle class="drop-shadow-md" cx="172" cy="67" fill="#0058be" id="point-expense" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
</g>
</svg>
<!-- Floating Tooltip -->
<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-inverse-surface text-inverse-on-surface p-2.5 rounded-xl shadow-xl text-xs flex flex-col gap-1.5 min-w-[120px]" id="chart-tooltip">
<span class="font-label-md border-b border-surface-variant/20 pb-1.5 mb-0.5 text-white" id="tooltip-day">Kamis</span>
<div class="flex items-center justify-between gap-4">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-primary-container"></span>
<span class="text-white/80 font-body-sm">Pemasukan</span>
</div>
<span class="font-bold text-primary-fixed-dim" id="tooltip-income">Rp 4.2M</span>
</div>
<div class="flex items-center justify-between gap-4">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-secondary"></span>
<span class="text-white/80 font-body-sm">Pengeluaran</span>
</div>
<span class="font-bold text-secondary-fixed-dim" id="tooltip-expense">Rp 2.8M</span>
</div>
</div>
</div>
<div class="flex justify-between items-center mt-2 border-t border-surface-variant/50 pt-4"><div class="flex items-center gap-6">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 bg-primary-container rounded-full"></span>
<span class="font-label-md text-label-md text-on-surface-variant/80 tracking-wide">Pemasukan</span>
</div>
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 bg-secondary rounded-full"></span>
<span class="font-label-md text-label-md text-on-surface-variant/80 tracking-wide">Pengeluaran</span>
</div>
</div>
<a class="font-label-md text-primary-container hover:text-primary active:scale-95 transition-all duration-200 flex items-center gap-1 group/btn" href="#">Detail <span class="material-symbols-outlined text-[14px] transition-transform group-hover/btn:translate-x-0.5">arrow_forward_ios</span></a></div>
</section>
<!-- Recent Transactions -->
<section class="flex flex-col gap-stack-md mb-8 animate-entrance delay-500">
<div class="flex justify-between items-center"><h2 class="font-headline-md text-headline-md text-on-background">Transaksi Terakhir</h2>
<button class="bg-primary-container/10 text-primary-container px-3 py-1.5 rounded-full font-label-md text-label-md hover:bg-primary-container/20 transition-all active:scale-95 duration-200">Lihat Semua</button></div>
<div class="flex flex-col gap-stack-md">
<!-- Transaction Item 1 -->
<div class="bg-surface-container-lowest border border-surface-variant/50 rounded-xl p-stack-md flex items-center justify-between ambient-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"><div class="flex items-center gap-stack-md">
<div class="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center relative">
<span class="material-symbols-outlined">restaurant_menu</span>
<div class="absolute -bottom-1 -right-1 bg-white dark:bg-on-background rounded-full p-0.5 shadow-sm border border-surface-variant">
<span class="material-symbols-outlined text-[12px] text-secondary">credit_card</span>
</div>
</div>
<div class="flex flex-col gap-1">
<span class="font-body-lg text-on-background font-semibold">Makan Siang</span>
<div class="flex items-center gap-2">
<span class="font-body-sm text-on-surface-variant">Hari ini, 12:30</span>
<span class="px-1.5 py-0.5 bg-surface-variant/50 rounded text-[10px] text-on-surface-variant uppercase font-semibold">KULINER</span>
</div>
</div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-body-lg text-on-background font-bold">-Rp 45.000</span>
<span class="text-[10px] text-primary-container font-semibold flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">check_circle</span> Berhasil</span>
</div>
</div>
<!-- Transaction Item 2 -->
<div class="bg-surface-container-lowest border border-surface-variant/50 rounded-xl p-stack-md flex items-center justify-between ambient-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"><div class="flex items-center gap-stack-md">
<div class="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center relative">
<span class="material-symbols-outlined">commute</span>
<div class="absolute -bottom-1 -right-1 bg-white dark:bg-on-background rounded-full p-0.5 shadow-sm border border-surface-variant">
<span class="material-symbols-outlined text-[12px] text-primary-container">account_balance_wallet</span>
</div>
</div>
<div class="flex flex-col gap-1">
<span class="font-body-lg text-on-background font-semibold">Transportasi</span>
<div class="flex items-center gap-2">
<span class="font-body-sm text-on-surface-variant">Kemarin, 08:15</span>
<span class="px-1.5 py-0.5 bg-surface-variant/50 rounded text-[10px] text-on-surface-variant uppercase font-semibold">TRANSPORT</span>
</div>
</div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-body-lg text-on-background font-bold">-Rp 25.000</span>
<span class="text-[10px] text-primary-container font-semibold flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">check_circle</span> Berhasil</span>
</div>
</div>
<!-- Transaction Item 3 -->
<div class="bg-surface-container-lowest border border-surface-variant/50 rounded-xl p-stack-md flex items-center justify-between ambient-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"><div class="flex items-center gap-stack-md">
<div class="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center relative">
<span class="material-symbols-outlined">local_mall</span>
<div class="absolute -bottom-1 -right-1 bg-white dark:bg-on-background rounded-full p-0.5 shadow-sm border border-surface-variant">
<span class="material-symbols-outlined text-[12px] text-tertiary">payments</span>
</div>
</div>
<div class="flex flex-col gap-1">
<span class="font-body-lg text-on-background font-semibold">Belanja Bulanan</span>
<div class="flex items-center gap-2">
<span class="font-body-sm text-on-surface-variant">24 Okt, 15:40</span>
<span class="px-1.5 py-0.5 bg-surface-variant/50 rounded text-[10px] text-on-surface-variant uppercase font-semibold">BELANJA</span>
</div>
</div>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-body-lg text-on-background font-bold">-Rp 450.000</span>
<span class="text-[10px] text-outline font-semibold flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">pending</span> Pending</span>
</div>
</div>
</div>
</section>
</main>
<!-- BottomNavBar (Mobile Only) -->
<nav class="md:hidden bg-white/80 dark:bg-on-background/80 backdrop-blur-lg fixed bottom-0 w-full z-50 border-t border-surface-variant/50 shadow-[0_-4px_20px_rgba(33,112,228,0.04)] transition-all duration-300">
<div class="flex justify-around items-center w-full max-w-md mx-auto pb-safe pt-2 px-2 h-20">
<!-- Dashboard (Active) -->
<button class="flex flex-col items-center justify-center text-primary-container dark:text-primary-fixed-dim bg-primary-container/10 dark:bg-primary-container/10 rounded-xl px-4 py-2 hover:bg-primary-container/20 transition-all active:scale-90 duration-200 w-1/3">
<span class="material-symbols-outlined text-[24px]">dashboard</span>
<span class="font-label-md text-label-md mt-1">Dashboard</span>
</button>
<!-- Tambah (FAB style embedded) -->
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant px-4 py-2 hover:text-primary-container dark:hover:text-primary-fixed-dim hover:bg-surface-variant/20 rounded-xl transition-all active:scale-90 duration-200 relative w-1/3">
<div class="absolute -top-3 bg-primary text-on-primary rounded-full p-2 shadow-lg shadow-primary/30 flex items-center justify-center transform transition-transform hover:scale-110 animate-pulse-ring">
<span class="material-symbols-outlined text-[24px]">add</span>
</div>
<span class="font-label-md text-label-md mt-5">Tambah</span>
</button>
<!-- Riwayat -->
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant px-4 py-2 hover:text-primary-container dark:hover:text-primary-fixed-dim hover:bg-surface-variant/20 rounded-xl transition-all active:scale-90 duration-200 w-1/3">
<span class="material-symbols-outlined outline text-[24px]">receipt_long</span>
<span class="font-label-md text-label-md mt-1">Riwayat</span>
</button>
</div>
</nav>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const slider = document.getElementById('saldo-slider');
        const dots = document.getElementById('saldo-pagination').children;
        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse/Touch events for dragging
        const startDrag = (e) => {
            isDown = true;
            slider.style.scrollBehavior = 'auto';
            slider.style.scrollSnapType = 'none'; // Temporarily disable snap during drag
            startX = e.type.includes('mouse') ? e.pageX - slider.offsetLeft : e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const stopDrag = () => {
            isDown = false;
            slider.style.scrollBehavior = 'smooth';
            slider.style.scrollSnapType = 'x mandatory'; // Re-enable snap
            
            // Snap to nearest slide
            const slideWidth = slider.clientWidth;
            const scrollPos = slider.scrollLeft;
            const targetSlide = Math.round(scrollPos / slideWidth);
            slider.scrollTo({
                left: targetSlide * slideWidth,
                behavior: 'smooth'
            });
        };

        const dragging = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.type.includes('mouse') ? e.pageX - slider.offsetLeft : e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            slider.scrollLeft = scrollLeft - walk;
        };

        if(slider) {
            slider.addEventListener('mousedown', startDrag);
            slider.addEventListener('mouseleave', stopDrag);
            slider.addEventListener('mouseup', stopDrag);
            slider.addEventListener('mousemove', dragging);

            slider.addEventListener('touchstart', startDrag, {passive: true});
            slider.addEventListener('touchend', stopDrag);
            slider.addEventListener('touchcancel', stopDrag);
        }
    });
</script></body></html>