<html class="dark" lang="en"><head></head><body class="bg-background text-on-background antialiased min-h-screen pb-[140px]" style="overflow-x: hidden;">```html

<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tambah Catatan - Luminous Finance</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-tint": "#006c49",
                        "on-surface-variant": "#3c4a42",
                        "on-primary-fixed-variant": "#005236",
                        "error-container": "#ffdad6",
                        "surface-bright": "#f8f9ff",
                        "on-surface": "#0b1c30",
                        "inverse-on-surface": "#eaf1ff",
                        "on-tertiary-fixed-variant": "#783200",
                        "surface-container": "#e5eeff",
                        "surface": "#f8f9ff",
                        "on-tertiary": "#ffffff",
                        "secondary": "#0058be",
                        "primary-fixed": "#6ffbbe",
                        "outline": "#6c7a71",
                        "on-secondary-fixed": "#001a42",
                        "surface-variant": "#d3e4fe",
                        "on-primary": "#ffffff",
                        "outline-variant": "#bbcabf",
                        "on-secondary-fixed-variant": "#004395",
                        "tertiary-fixed": "#ffdbca",
                        "secondary-container": "#2170e4",
                        "on-error-container": "#93000a",
                        "error": "#ba1a1a",
                        "secondary-fixed": "#d8e2ff",
                        "on-tertiary-container": "#622700",
                        "surface-dim": "#cbdbf5",
                        "on-primary-container": "#00422b",
                        "background": "#f8f9ff",
                        "on-primary-fixed": "#002113",
                        "on-secondary-container": "#fefcff",
                        "on-secondary": "#ffffff",
                        "on-error": "#ffffff",
                        "surface-container-highest": "#d3e4fe",
                        "surface-container-low": "#eff4ff",
                        "inverse-surface": "#213145",
                        "primary-container": "#10b981",
                        "primary": "#006c49",
                        "secondary-fixed-dim": "#adc6ff",
                        "on-background": "#0b1c30",
                        "tertiary": "#9d4300",
                        "surface-container-high": "#dce9ff",
                        "tertiary-fixed-dim": "#ffb690",
                        "on-tertiary-fixed": "#341100",
                        "inverse-primary": "#4edea3",
                        "tertiary-container": "#ff7e2d",
                        "surface-container-lowest": "#ffffff",
                        "primary-fixed-dim": "#4edea3"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "stack-sm": "4px",
                        "container-padding-mobile": "20px",
                        "container-padding-desktop": "40px",
                        "base": "8px",
                        "stack-lg": "24px",
                        "stack-md": "12px",
                        "gutter": "16px"
                    },
                    "fontFamily": {
                        "body-sm": ["Inter"],
                        "body-lg": ["Inter"],
                        "numeric-xl": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"],
                        "display-lg": ["Inter"]
                    },
                    "fontSize": {
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "numeric-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "display-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
        body {
            -webkit-tap-highlight-color: transparent;
            min-height: max(884px, 100dvh);
        }
        
        /* Glassmorphism */
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 4px 20px rgba(33, 112, 228, 0.04);
            transition: all 0.3s ease;
        }
        
        .glass-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(33, 112, 228, 0.08);
        }
        
        /* Radio button styles */
        .transaction-type-radio:checked + label {
            background-color: var(--tw-colors-primary-container);
            color: var(--tw-colors-on-primary-container);
            border-color: var(--tw-colors-primary-container);
            transform: scale(1.02);
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15), 0 0 15px rgba(16, 185, 129, 0.2);
        }
        
        .expense-radio:checked + label {
             background-color: var(--tw-colors-error-container);
             color: var(--tw-colors-on-error-container);
             border-color: var(--tw-colors-error-container);
             box-shadow: 0 4px 12px rgba(186, 26, 26, 0.15), 0 0 15px rgba(186, 26, 26, 0.2);
        }

        /* Ambient background glow */
        .ambient-bg {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            background: 
                radial-gradient(circle at 15% 50%, rgba(33, 112, 228, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
            pointer-events: none;
        }

        /* Form field focus */
        .input-focus-ring {
            transition: all 0.3s ease;
        }
        .input-focus-ring:focus-within, .input-focus-ring:hover {
             border-color: var(--tw-colors-secondary-container);
             box-shadow: 0 2px 8px rgba(33, 112, 228, 0.1);
             transform: translateY(-1px);
        }
        .input-focus-ring:focus-within {
             animation: focusPulse 2s infinite ease-in-out;
        }

        /* Dropdown Animations */
        .dropdown-menu {
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dropdown-menu.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }

        /* Flash animation for selection */
        @keyframes flashSelected {
            0% { background-color: var(--tw-colors-primary-container); }
            100% { background-color: transparent; }
        }
        .flash-selection {
            animation: flashSelected 0.5s ease-out;
        }

        /* Modal Animations */
        .modal-overlay {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
        }
        .modal-overlay.active .modal-content {
            transform: scale(1) translateY(0);
            opacity: 1;
        }

        /* Animations */
        @media (prefers-reduced-motion: no-preference) {
            .stagger-reveal {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .stagger-reveal.revealed {
                opacity: 1;
                transform: translateY(0);
            }
            
            .animate-pulse-subtle {
                animation: pulseSubtle 3s infinite ease-in-out;
            }
            .btn-shimmer {
                position: relative;
                overflow: hidden;
            }
            .btn-shimmer::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    to bottom right,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.2) 50%,
                    rgba(255, 255, 255, 0) 100%
                );
                transform: rotate(30deg);
                animation: shimmer 3s infinite linear;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-effect 0.6s linear;
                background-color: rgba(255, 255, 255, 0.4);
                pointer-events: none;
            }
            
            .ai-btn-pulse {
                position: relative;
            }
            .ai-btn-pulse::before {
                content: '';
                position: absolute;
                inset: -2px;
                border-radius: inherit;
                background: linear-gradient(45deg, var(--tw-colors-primary-container), var(--tw-colors-secondary-container), var(--tw-colors-primary-container));
                z-index: -1;
                background-size: 200% 200%;
                animation: rotateGradient 3s linear infinite;
                opacity: 0.5;
            }

            .wave-bars span {
                animation: wave 1.2s ease-in-out infinite;
            }
            .wave-bars span:nth-child(1) { animation-delay: 0.0s; }
            .wave-bars span:nth-child(2) { animation-delay: 0.1s; }
            .wave-bars span:nth-child(3) { animation-delay: 0.2s; }
            .wave-bars span:nth-child(4) { animation-delay: 0.3s; }
            .wave-bars span:nth-child(5) { animation-delay: 0.4s; }

            .scan-line {
                animation: scanMove 2.5s linear infinite;
            }
        }

        @keyframes focusPulse {
            0%, 100% { box-shadow: 0 0 0 1px var(--tw-colors-secondary-container), 0 2px 8px rgba(33, 112, 228, 0.1); }
            50% { box-shadow: 0 0 0 2px var(--tw-colors-secondary-container), 0 4px 12px rgba(33, 112, 228, 0.2); }
        }
        @keyframes pulseSubtle {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        @keyframes shimmer {
            from { transform: translateX(-100%) rotate(30deg); }
            to { transform: translateX(100%) rotate(30deg); }
        }
        @keyframes ripple-effect {
            to { transform: scale(4); opacity: 0; }
        }
        @keyframes rotateGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes wave {
            0%, 100% { transform: scaleY(0.2); }
            50% { transform: scaleY(1); }
        }
        @keyframes scanMove {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
        }

    </style>
<div class="ambient-bg"></div>
<!-- Main Container -->
<main class="w-full max-w-md mx-auto px-container-padding-mobile pt-6 relative">
<!-- Header -->
<header class="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 z-40 flex items-center justify-between px-container-padding-mobile">
<button aria-label="Close" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all duration-200">
<span class="material-symbols-outlined text-on-surface" style='font-variation-settings: "FILL" 0;'>close</span>
</button>
<h1 class="font-headline-md text-headline-md font-bold text-on-surface text-center">Tambah Catatan</h1>
<div class="w-10"></div> <!-- Spacer for centering -->
</header>
<div class="mt-10"></div> <!-- Spacer for fixed header -->
<!-- Amount Input Area (Glassmorphism focus) -->
<section class="glass-card rounded-xl p-6 mb-stack-lg flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 stagger-reveal revealed">
<label class="font-label-md text-label-md text-on-surface-variant mb-stack-sm uppercase tracking-wider" for="amount">Nominal</label>
<div class="flex items-center text-primary relative">
<span class="font-numeric-xl text-numeric-xl mr-2 transition-transform duration-300 transform origin-right">Rp</span>
<input class="bg-transparent border-none outline-none font-numeric-xl text-numeric-xl text-center w-full max-w-[200px] text-primary placeholder:text-primary/30 p-0 focus:ring-0 transition-transform duration-300" data-target-value="500000" id="amount" inputmode="numeric" placeholder="0" type="text" value="0"/>
</div>
</section>
<!-- Transaction Type Selector -->
<section class="grid grid-cols-2 gap-4 mb-stack-lg">
<div class="relative stagger-reveal revealed">
<input checked="" class="transaction-type-radio sr-only peer" id="type_income" name="transaction_type" placeholder="on" type="radio" value=""/>
<label class="flex flex-col items-center justify-center p-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant cursor-pointer transition-all duration-300 glass-card hover:bg-surface-container-low hover:scale-105 active:scale-95" for="type_income">
<span class="material-symbols-outlined mb-2 transition-transform duration-300 peer-checked:scale-110" style='font-variation-settings: "FILL" 1;'>arrow_downward</span>
<span class="font-label-md text-label-md">Pemasukan</span>
</label>
</div>
<div class="relative stagger-reveal revealed">
<input class="transaction-type-radio expense-radio sr-only peer" id="type_expense" name="transaction_type" type="radio"/>
<label class="flex flex-col items-center justify-center p-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant cursor-pointer transition-all duration-300 glass-card hover:bg-surface-container-low hover:scale-105 active:scale-95" for="type_expense">
<span class="material-symbols-outlined mb-2 transition-transform duration-300 peer-checked:scale-110" style='font-variation-settings: "FILL" 1;'>arrow_upward</span>
<span class="font-label-md text-label-md">Pengeluaran</span>
</label>
</div>
</section>
<!-- Recent Transaction -->
<section class="mb-stack-lg stagger-reveal revealed">
<div class="flex items-center justify-between mb-stack-sm">
<h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Transaksi Terakhir</h3>
<button class="text-[10px] font-semibold text-primary uppercase hover:opacity-80 active:scale-95 transition-all">Lihat Semua</button>
</div>
<div class="glass-card rounded-xl overflow-hidden divide-y divide-outline-variant/10 transition-all duration-300">
<div class="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors cursor-pointer active:bg-surface-variant">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container transition-transform duration-300 hover:scale-110">
<span class="material-symbols-outlined text-[20px]" style='font-variation-settings: "FILL" 1;'>restaurant</span>
</div>
<div class="flex flex-col">
<span class="font-body-lg text-body-lg font-semibold text-on-surface">Makan Siang</span>
<span class="text-[10px] text-on-surface-variant">Hari ini, 12:30</span>
</div>
</div>
<span class="font-body-lg text-body-lg font-bold text-error">-Rp 45.000</span>
</div>
</div>
</section>
<!-- Details Form -->
<section class="space-y-stack-md glass-card p-6 rounded-xl stagger-reveal revealed">
<!-- Category Selector -->
<div class="flex flex-col gap-stack-sm relative dropdown-container">
<label class="font-label-md text-label-md text-on-surface-variant" for="category">Kategori <span class="text-[10px] font-normal italic opacity-70 ml-1">(Filter otomatis)</span></label>
<button class="dropdown-trigger input-focus-ring flex items-center justify-between w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-left transition-all hover:shadow-md active:scale-[0.98]" id="category" type="button">
<div class="flex items-center gap-3 selected-content">
<div class="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary-container icon-container transition-transform duration-300">
<span class="material-symbols-outlined text-[20px] icon-symbol" style='font-variation-settings: "FILL" 1;'>payments</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface selected-text">Gaji</span>
</div>
<span class="material-symbols-outlined text-on-surface-variant toggle-icon" style='font-variation-settings: "FILL" 0; transition: transform 0.3s; transform: rotate(0deg);'>expand_more</span>
</button>
<div class="dropdown-menu absolute left-0 right-0 top-full mt-2 z-50 glass-card rounded-xl overflow-hidden shadow-lg divide-y divide-outline-variant/10"><div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="1" data-icon="payments" data-value="Gaji">
<div class="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">payments</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Gaji</span>
</div><div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="0" data-icon="redeem" data-value="Bonus">
<div class="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">redeem</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Bonus</span>
</div><div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="0" data-icon="trending_up" data-value="Investasi">
<div class="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">trending_up</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Investasi</span>
</div><div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="0" data-icon="featured_seasonal" data-value="Hadiah">
<div class="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">featured_seasonal</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Hadiah</span>
</div></div>
</div>
<!-- Fund Source Selector -->
<div class="flex flex-col gap-stack-sm relative dropdown-container">
<label class="font-label-md text-label-md text-on-surface-variant" for="fund-source">Sumber/Tujuan Dana</label>
<button class="dropdown-trigger input-focus-ring flex items-center justify-between w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-left transition-all hover:shadow-md active:scale-[0.98]" id="fund-source" type="button">
<div class="flex items-center gap-3 selected-content">
<div class="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary icon-container transition-transform duration-300">
<span class="material-symbols-outlined text-[20px] icon-symbol" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface selected-text">Tabungan</span>
</div>
<span class="material-symbols-outlined text-on-surface-variant toggle-icon" style="transition: transform 0.3s; transform: rotate(0deg);">expand_more</span>
</button>
<div class="dropdown-menu absolute left-0 right-0 top-full mt-2 z-40 glass-card rounded-xl overflow-hidden shadow-lg divide-y divide-outline-variant/10">
<div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="1" data-icon="account_balance_wallet" data-value="Tabungan">
<div class="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Tabungan</span>
</div>
<div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="0" data-icon="account_balance" data-value="Dompet Digital">
<div class="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">account_balance</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Dompet Digital</span>
</div>
<div class="dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer" data-fill="0" data-icon="credit_card" data-value="Kartu Kredit">
<div class="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">credit_card</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface">Kartu Kredit</span>
</div>
</div>
</div>
<!-- AI Quick Input -->
<div class="flex flex-col gap-stack-sm">
<label class="font-label-md text-label-md text-on-surface-variant">AI Quick Input</label>
<div class="grid grid-cols-2 gap-3">
<button class="ai-btn-pulse flex items-center justify-center gap-2 p-3 bg-primary-container text-on-primary-container rounded-lg border border-primary/20 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200" id="btn-scan" type="button">
<span class="material-symbols-outlined text-[20px]">photo_camera</span>
<span class="font-label-md text-label-md uppercase tracking-wide">Scan Struk</span>
</button>
<button class="ai-btn-pulse flex items-center justify-center gap-2 p-3 bg-secondary-container text-on-secondary-container rounded-lg border border-secondary/20 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200" id="btn-suara" style="animation-delay: 1.5s;" type="button">
<span class="material-symbols-outlined text-[20px] animate-pulse">mic</span>
<span class="font-label-md text-label-md uppercase tracking-wide">Suara</span>
</button>
</div>
</div>
<!-- Date Selector -->
<div class="flex flex-col gap-stack-sm">
<label class="font-label-md text-label-md text-on-surface-variant" for="date">Tanggal</label>
<div class="input-focus-ring flex items-center w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg transition-all group">
<span class="material-symbols-outlined text-on-surface-variant mr-3 group-focus-within:text-secondary-container transition-colors">calendar_today</span>
<input class="bg-transparent border-none outline-none font-body-lg text-body-lg text-on-surface w-full p-0 focus:ring-0" id="date" type="date" value="2023-10-27"/>
</div>
</div>
<!-- Note Input -->
<div class="flex flex-col gap-stack-sm">
<label class="font-label-md text-label-md text-on-surface-variant" for="note">Catatan Tambahan</label>
<div class="input-focus-ring flex items-start w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg transition-all group">
<span class="material-symbols-outlined text-on-surface-variant mr-3 mt-1 group-focus-within:text-secondary-container transition-colors">description</span>
<textarea class="bg-transparent border-none outline-none font-body-lg text-body-lg text-on-surface w-full p-0 focus:ring-0 resize-none placeholder:text-on-surface-variant/50" id="note" placeholder="Cth: Makan siang bareng tim" rows="2">Makan siang di cafe</textarea>
</div>
</div>
</section>
<!-- Save Button Area -->
<div class="fixed bottom-[88px] left-0 w-full p-container-padding-mobile bg-gradient-to-t from-background via-background/90 to-transparent z-10 stagger-reveal revealed pointer-events-none">
<div class="pointer-events-auto">
<button class="btn-shimmer relative overflow-hidden w-full max-w-md mx-auto block h-12 bg-primary text-on-primary font-headline-md text-headline-md rounded-lg shadow-[0_4px_20px_rgba(33,112,228,0.2)] hover:shadow-[0_8px_25px_rgba(0,108,73,0.4)] hover:scale-[1.02] active:scale-[0.96] transition-all duration-300" id="save-btn">
                Simpan Catatan
            </button>
</div>
</div>
</main>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant/20 pb-safe z-40">
<div class="flex justify-around items-center h-[72px] max-w-md mx-auto">
<button class="flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined mb-1">dashboard</span>
<span class="text-[10px] font-medium">Dashboard</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full text-primary transition-colors relative">
<div class="absolute -top-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-[0_4px_12px_rgba(0,108,73,0.3)] border-4 border-background hover:scale-105 active:scale-95 transition-transform">
<span class="material-symbols-outlined text-2xl font-bold">add</span>
</div>
<span class="text-[10px] font-medium mt-6 text-primary">Tambah</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined mb-1">history</span>
<span class="text-[10px] font-medium">Riwayat</span>
</button>
</div>
</nav>
<!-- Scan Struk Modal -->
<div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" id="modal-scan">
<div class="modal-content w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
<div class="flex items-center justify-between p-4 border-b border-outline-variant/20">
<h2 class="font-headline-md text-headline-md font-bold text-on-surface">Scan Struk</h2>
<button class="close-modal w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant hover:bg-surface-container-high transition-colors text-on-surface">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="p-6 flex flex-col items-center justify-center bg-surface-container-lowest relative">
<div class="w-full aspect-[3/4] bg-surface-variant rounded-xl border-2 border-dashed border-primary/50 relative overflow-hidden flex items-center justify-center">
<!-- Viewfinder guides -->
<div class="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
<div class="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
<div class="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
<div class="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
<!-- Scanning line -->
<span class="material-symbols-outlined text-[64px] text-primary/30">receipt_long</span>
<p class="absolute bottom-6 font-body-sm text-body-sm text-on-surface-variant text-center px-4 bg-surface/80 py-1 rounded-full backdrop-blur-sm">Posisikan struk di dalam kotak</p>
</div>
<button class="mt-6 w-16 h-16 rounded-full bg-primary border-4 border-primary-container shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined text-[32px]">photo_camera</span>
</button>
</div>
</div>
</div>
<!-- Suara Modal -->
<div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" id="modal-suara">
<div class="modal-content w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
<div class="flex items-center justify-between p-4 border-b border-outline-variant/20">
<h2 class="font-headline-md text-headline-md font-bold text-on-surface">Input Suara</h2>
<button class="close-modal w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant hover:bg-surface-container-high transition-colors text-on-surface">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="p-8 flex flex-col items-center justify-center bg-surface-container-lowest min-h-[300px]">
<div class="w-24 h-24 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary relative mb-8 transition-transform duration-300 hover:scale-105">
<!-- Ripple background -->
<div class="absolute inset-0 rounded-full border-2 border-secondary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
<div class="absolute inset-0 rounded-full border-2 border-secondary/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-500"></div>
<span class="material-symbols-outlined text-[48px] z-10 animate-pulse">mic</span>
</div>
<div class="wave-bars flex items-center gap-2 h-12 mb-6">
<span class="w-2 bg-secondary rounded-full h-full block"></span>
<span class="w-2 bg-secondary rounded-full h-3/4 block"></span>
<span class="w-2 bg-secondary rounded-full h-1/2 block"></span>
<span class="w-2 bg-secondary rounded-full h-4/5 block"></span>
<span class="w-2 bg-secondary rounded-full h-full block"></span>
</div>
<p class="font-body-lg text-body-lg text-on-surface font-medium animate-pulse">Mendengarkan...</p>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-2 text-center">"Tambahkan pengeluaran makan siang lima puluh ribu"</p>
</div>
</div>
</div>
<script>
        // Check for prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Staggered reveal animation
        document.addEventListener('DOMContentLoaded', () => {
            const elements = document.querySelectorAll('.stagger-reveal');
            if (!prefersReducedMotion) {
                elements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, index * 100); // 0.1s increment
                });
            } else {
                elements.forEach(el => el.classList.add('revealed'));
            }

            // Counter Animation
            const amountInput = document.getElementById('amount');
            const targetValue = parseInt(amountInput.getAttribute('data-target-value'), 10);
            
            if (!prefersReducedMotion && targetValue > 0) {
                let startTimestamp = null;
                const duration = 1000; // 1 second animation
                
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    
                    // Easing function (easeOutExpo)
                    const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    
                    const currentValue = Math.floor(easeOutExpo * targetValue);
                    amountInput.value = currentValue.toLocaleString('id-ID');
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        amountInput.value = targetValue.toLocaleString('id-ID'); // Ensure final value is exact
                    }
                };
                window.requestAnimationFrame(step);
            } else {
                amountInput.value = targetValue.toLocaleString('id-ID');
            }
            
            // Dropdown Logic
            const dropdownContainers = document.querySelectorAll('.dropdown-container');
            
            dropdownContainers.forEach(container => {
                const trigger = container.querySelector('.dropdown-trigger');
                const menu = container.querySelector('.dropdown-menu');
                const toggleIcon = container.querySelector('.toggle-icon');
                const selectedText = container.querySelector('.selected-text');
                const iconSymbol = container.querySelector('.icon-symbol');
                const items = container.querySelectorAll('.dropdown-item');
                
                // Toggle menu on click
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Close other menus
                    dropdownContainers.forEach(otherContainer => {
                        if (otherContainer !== container) {
                            otherContainer.querySelector('.dropdown-menu').classList.remove('active');
                            otherContainer.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
                        }
                    });

                    const isActive = menu.classList.contains('active');
                    if (isActive) {
                        menu.classList.remove('active');
                        toggleIcon.style.transform = 'rotate(0deg)';
                    } else {
                        menu.classList.add('active');
                        toggleIcon.style.transform = 'rotate(180deg)';
                    }
                });

                // Handle item selection
                items.forEach(item => {
                    item.addEventListener('click', () => {
                        const value = item.getAttribute('data-value');
                        const icon = item.getAttribute('data-icon');
                        const fill = item.getAttribute('data-fill');

                        // Update trigger display
                        selectedText.textContent = value;
                        iconSymbol.textContent = icon;
                        iconSymbol.style.fontVariationSettings = `'FILL' ${fill}`;

                        // Close menu
                        menu.classList.remove('active');
                        toggleIcon.style.transform = 'rotate(0deg)';

                        // Flash selection effect
                        trigger.classList.add('flash-selection');
                        const iconContainer = trigger.querySelector('.icon-container');
                        iconContainer.classList.add('scale-110');
                        setTimeout(() => {
                            trigger.classList.remove('flash-selection');
                            iconContainer.classList.remove('scale-110');
                        }, 300);
                        
                        // Update active state in menu
                        items.forEach(i => {
                            i.classList.remove('bg-primary-container/10', 'border-l-4', 'border-primary');
                            const iIconContainer = i.querySelector('.w-8.h-8');
                            iIconContainer.classList.remove('bg-primary-container/20', 'bg-secondary-container/20');
                            iIconContainer.classList.add('bg-primary-container/10', 'bg-secondary-container/10');
                            const iText = i.querySelector('span.font-body-lg');
                            iText.classList.remove('font-semibold', 'text-primary');
                        });
                        
                        item.classList.add('bg-primary-container/10', 'border-l-4', 'border-primary');
                        const activeIconContainer = item.querySelector('.w-8.h-8');
                        activeIconContainer.classList.remove('bg-primary-container/10', 'bg-secondary-container/10');
                        activeIconContainer.classList.add(container.querySelector('.icon-container').classList.contains('text-primary') ? 'bg-primary-container/20' : 'bg-secondary-container/20');
                        const activeText = item.querySelector('span.font-body-lg');
                        activeText.classList.add('font-semibold', 'text-primary');
                    });
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', () => {
                dropdownContainers.forEach(container => {
                    const menu = container.querySelector('.dropdown-menu');
                    const toggleIcon = container.querySelector('.toggle-icon');
                    if (menu.classList.contains('active')) {
                        menu.classList.remove('active');
                        toggleIcon.style.transform = 'rotate(0deg)';
                    }
                });
            });

            // Modal Logic
            const btnScan = document.getElementById('btn-scan');
            const btnSuara = document.getElementById('btn-suara');
            const modalScan = document.getElementById('modal-scan');
            const modalSuara = document.getElementById('modal-suara');
            const closeBtns = document.querySelectorAll('.close-modal');
            const modalOverlays = document.querySelectorAll('.modal-overlay');

            function openModal(modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }

            function closeModal(modal) {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }

            btnScan.addEventListener('click', () => openModal(modalScan));
            btnSuara.addEventListener('click', () => openModal(modalSuara));

            closeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal-overlay');
                    if (modal) closeModal(modal);
                });
            });

            // Close on overlay click
            modalOverlays.forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        closeModal(overlay);
                    }
                });
            });
        });

        // Simple script to format number input as currency while typing
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', function(e) {
            // Remove non-numeric characters
            let value = this.value.replace(/[^0-9]/g, '');
            
            // Format with dot thousand separator
            if (value !== '') {
                value = parseInt(value, 10).toLocaleString('id-ID');
                this.value = value;
            }
        });

        // Add focus effect to nominal input container
        const nominalInput = document.getElementById('amount');
        const nominalContainer = nominalInput.closest('section');
        const currencySymbol = nominalContainer.querySelector('span.font-numeric-xl');

        nominalInput.addEventListener('focus', () => {
            nominalContainer.classList.add('shadow-lg', 'scale-[1.02]');
            nominalContainer.classList.remove('shadow-[0_4px_20px_rgba(33,112,228,0.04)]');
            nominalContainer.style.borderColor = 'var(--tw-colors-secondary-container)';
            currencySymbol.classList.add('scale-110', 'text-secondary-container');
        });

        nominalInput.addEventListener('blur', () => {
            nominalContainer.classList.remove('shadow-lg', 'scale-[1.02]');
            nominalContainer.classList.add('shadow-[0_4px_20px_rgba(33,112,228,0.04)]');
            nominalContainer.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            currencySymbol.classList.remove('scale-110', 'text-secondary-container');
        });

        // Ripple Effect on Save Button
        const saveBtn = document.getElementById('save-btn');
        saveBtn.addEventListener('click', function(e) {
            if (prefersReducedMotion) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            // Force green ripple for success feel
            ripple.style.backgroundColor = 'rgba(16, 185, 129, 0.6)';
            
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x - size/2}px`;
            ripple.style.top = `${y - size/2}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    </script>
<script>
        document.addEventListener('DOMContentLoaded', () => {
            const incomeRadio = document.getElementById('type_income');
            const expenseRadio = document.getElementById('type_expense');
            const categoryDropdownMenu = document.querySelector('#category').nextElementSibling;
            
            const incomeCategories = [
                { value: 'Gaji', icon: 'payments', fill: '1' },
                { value: 'Bonus', icon: 'redeem', fill: '0' },
                { value: 'Investasi', icon: 'trending_up', fill: '0' },
                { value: 'Hadiah', icon: 'featured_seasonal', fill: '0' }
            ];

            const expenseCategories = [
                { value: 'Makanan & Minuman', icon: 'restaurant', fill: '1' },
                { value: 'Transportasi', icon: 'directions_car', fill: '0' },
                { value: 'Belanja', icon: 'shopping_bag', fill: '0' },
                { value: 'Hiburan', icon: 'sports_esports', fill: '0' }
            ];

            function updateCategoryOptions(type) {
                const categories = type === 'income' ? incomeCategories : expenseCategories;
                categoryDropdownMenu.innerHTML = '';
                
                categories.forEach(cat => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer';
                    item.setAttribute('data-fill', cat.fill);
                    item.setAttribute('data-icon', cat.icon);
                    item.setAttribute('data-value', cat.value);
                    
                    item.innerHTML = `\n                        <div class="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container">\n                            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' ${cat.fill};">${cat.icon}</span>\n                        </div>\n                        <span class="font-body-lg text-body-lg text-on-surface">${cat.value}</span>\n                    `;
                    
                    item.addEventListener('click', () => {
                        const trigger = document.getElementById('category');
                        trigger.querySelector('.selected-text').textContent = cat.value;
                        const iconSymbol = trigger.</script></body></html>