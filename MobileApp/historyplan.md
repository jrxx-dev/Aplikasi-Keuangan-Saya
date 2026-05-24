<!DOCTYPE html>

<html class="dark" lang="id"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Riwayat Transaksi - Financial Vitality</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-variant": "#d3e4fe",
                        "inverse-surface": "#213145",
                        "tertiary-fixed-dim": "#ffb690",
                        "on-tertiary-container": "#622700",
                        "error-container": "#ffdad6",
                        "on-error": "#ffffff",
                        "on-tertiary-fixed": "#341100",
                        "on-primary": "#ffffff",
                        "background": "#f8f9ff",
                        "secondary-container": "#2170e4",
                        "surface-container": "#e5eeff",
                        "outline": "#6c7a71",
                        "on-surface": "#0b1c30",
                        "on-secondary": "#ffffff",
                        "primary": "#006c49",
                        "on-secondary-container": "#fefcff",
                        "on-primary-container": "#00422b",
                        "primary-container": "#10b981",
                        "on-secondary-fixed": "#001a42",
                        "on-error-container": "#93000a",
                        "surface-container-high": "#dce9ff",
                        "secondary-fixed-dim": "#adc6ff",
                        "surface": "#f8f9ff",
                        "secondary-fixed": "#d8e2ff",
                        "error": "#ba1a1a",
                        "surface-container-highest": "#d3e4fe",
                        "on-secondary-fixed-variant": "#004395",
                        "surface-tint": "#006c49",
                        "surface-dim": "#cbdbf5",
                        "inverse-primary": "#4edea3",
                        "inverse-on-surface": "#eaf1ff",
                        "primary-fixed": "#6ffbbe",
                        "tertiary-container": "#ff7e2d",
                        "on-background": "#0b1c30",
                        "surface-container-low": "#eff4ff",
                        "on-surface-variant": "#3c4a42",
                        "tertiary-fixed": "#ffdbca",
                        "on-primary-fixed-variant": "#005236",
                        "on-primary-fixed": "#002113",
                        "primary-fixed-dim": "#4edea3",
                        "on-tertiary-fixed-variant": "#783200",
                        "outline-variant": "#bbcabf",
                        "secondary": "#0058be",
                        "on-tertiary": "#ffffff",
                        "tertiary": "#9d4300",
                        "surface-container-lowest": "#ffffff",
                        "surface-bright": "#f8f9ff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "stack-sm": "4px",
                        "container-padding-desktop": "40px",
                        "stack-lg": "24px",
                        "gutter": "16px",
                        "stack-md": "12px",
                        "container-padding-mobile": "20px",
                        "base": "8px"
                    },
                    "fontFamily": {
                        "body-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "numeric-xl": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"],
                        "body-sm": ["Inter"]
                    },
                    "fontSize": {
                        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "display-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "numeric-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
                    }
                }
            }
        }
    </script>
<style>
        body {
            background-color: theme('colors.background');
            color: theme('colors.on-background');
        }
        .dark body {
            background-color: #0b1c30; /* Dark background */
            color: #eaf1ff;
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .glass-panel {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .ambient-shadow {
            box-shadow: 0 4px 20px rgba(0, 88, 190, 0.04);
        }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col font-body-lg text-body-lg">
<!-- TopAppBar -->
<header class="bg-surface/80 dark:bg-[#0b1c30]/80 backdrop-blur-xl fixed top-0 w-full z-40 border-b border-outline-variant/20 dark:border-white/10 shadow-sm flex justify-between items-center px-container-padding-mobile h-16 w-full md:hidden">
<button class="text-on-surface dark:text-on-secondary hover:bg-surface-container-high/50 dark:hover:bg-white/10 transition-colors p-2 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="menu">menu</span>
</button>
<h1 class="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-secondary truncate flex-1 text-center">Riwayat Transaksi</h1>
<button class="text-on-surface dark:text-on-secondary hover:bg-surface-container-high/50 dark:hover:bg-white/10 transition-colors p-2 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="search">search</span>
</button>
</header>
<!-- Desktop Nav (Hidden on Mobile) -->
<nav class="hidden md:flex bg-surface/60 backdrop-blur-xl fixed top-0 w-full z-40 border-b border-white/20 shadow-sm h-16 items-center px-container-padding-desktop justify-between">
<h1 class="font-headline-md text-headline-md font-bold text-primary">Financial Vitality</h1>
<div class="flex gap-gutter items-center">
<a class="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-4 py-2 rounded-full" href="#">Dashboard</a>
<a class="font-label-md text-label-md bg-primary-container text-on-primary-container hover:text-primary transition-colors px-4 py-2 rounded-full" href="#">Riwayat</a>
</div>
<button class="text-primary p-2 rounded-full flex items-center justify-center hover:bg-surface-container-high/50 transition-colors">
<span class="material-symbols-outlined">search</span>
</button>
</nav>
<!-- Main Content Canvas -->
<main class="flex-1 w-full max-w-3xl mx-auto px-container-padding-mobile md:px-0 pt-24 md:pt-28 pb-32">
<!-- Search and Filters Area -->
<section class="mb-stack-lg space-y-stack-md">
<!-- Search Bar -->
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-on-surface-variant dark:text-outline-variant">search</span>
</div>
<input class="block w-full pl-10 pr-3 py-3 border border-outline-variant dark:border-outline/50 rounded-lg bg-surface-container-lowest dark:bg-inverse-surface focus:ring-primary focus:border-primary sm:text-body-sm transition-colors text-on-surface dark:text-on-secondary placeholder-on-surface-variant dark:placeholder-outline-variant ambient-shadow font-body-sm text-body-sm" placeholder="Cari transaksi..." type="text"/>
</div>
<!-- Chips Filter (Horizontal Scroll) -->
<div class="flex overflow-x-auto hide-scrollbar gap-base pb-2">
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-primary text-on-primary shadow-sm hover:bg-surface-tint transition-colors">
        Hari
    </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50">
        Minggu
    </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50">
        Bulan
    </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50">
        Tahun
    </button>
</div><div class="flex overflow-x-auto hide-scrollbar gap-base py-2">
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-primary text-on-primary shadow-sm hover:bg-surface-tint transition-colors flex items-center gap-1">
                    Semua
                </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">arrow_downward</span> Pemasukan
                </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">arrow_upward</span> Pengeluaran
                </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">calendar_month</span> Januari
                </button>
<button class="whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary hover:bg-surface-container-high dark:hover:bg-inverse-surface/80 transition-colors border border-outline-variant/30 dark:border-outline/50 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">category</span> Kategori
                </button>
</div>
</section>
<!-- Transaction List -->
<section class="space-y-stack-lg">
<!-- Date Group: Hari Ini -->
<div class="space-y-stack-md">
<h2 class="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant px-2">Hari Ini</h2>
<div class="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl ambient-shadow p-2 space-y-1">
<!-- Item 1 -->
<div class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors cursor-pointer transaction-item">
<div class="flex items-center gap-gutter">
<div class="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary-fixed-dim icon-container">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">shopping_bag</span>
</div>
<div class="flex flex-col gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-title">Grocery Store</span>
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant transaction-time-method">09:41 AM • Kartu Debit</span>
</div>
</div>
<div class="flex flex-col items-end gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-amount">- Rp 450.000</span>
<span class="px-2 py-0.5 rounded-full bg-surface-variant dark:bg-secondary-container text-on-surface-variant dark:text-on-secondary font-label-md text-[10px] transaction-category">Shopping</span>
</div>
</div>
<!-- Divider -->
<div class="h-[1px] w-full bg-outline-variant/20 dark:bg-outline/20 mx-auto max-w-[95%]"></div>
<!-- Item 2 -->
<div class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors cursor-pointer transaction-item">
<div class="flex items-center gap-gutter">
<div class="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary-fixed-dim icon-container">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">restaurant</span>
</div>
<div class="flex flex-col gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-title">Coffee Shop</span>
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant transaction-time-method">07:30 AM • QRIS</span>
</div>
</div>
<div class="flex flex-col items-end gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-amount">- Rp 55.000</span>
<span class="px-2 py-0.5 rounded-full bg-tertiary-fixed dark:bg-tertiary text-on-tertiary-fixed dark:text-on-tertiary font-label-md text-[10px] transaction-category">Food</span>
</div>
</div>
</div>
</div>
<!-- Date Group: 23 Okt 2023 -->
<div class="space-y-stack-md">
<h2 class="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant px-2">23 Okt 2023</h2>
<div class="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl ambient-shadow p-2 space-y-1">
<!-- Item 3 (Income) -->
<div class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors cursor-pointer transaction-item">
<div class="flex items-center gap-gutter">
<div class="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-fixed-dim icon-container">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">payments</span>
</div>
<div class="flex flex-col gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-title">Gaji Bulanan</span>
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant transaction-time-method">08:00 AM • Transfer Masuk</span>
</div>
</div>
<div class="flex flex-col items-end gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-primary dark:text-inverse-primary transaction-amount">+ Rp 15.000.000</span>
<div class="flex items-center gap-1 transaction-status">
<div class="w-2 h-2 rounded-full bg-primary dark:bg-inverse-primary status-dot"></div>
<span class="font-label-md text-[10px] text-on-surface-variant dark:text-outline-variant status-text">Berhasil</span>
</div>
</div>
</div>
<!-- Divider -->
<div class="h-[1px] w-full bg-outline-variant/20 dark:bg-outline/20 mx-auto max-w-[95%]"></div>
<!-- Item 4 (Pending) -->
<div class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors cursor-pointer transaction-item">
<div class="flex items-center gap-gutter">
<div class="w-12 h-12 rounded-full bg-surface-variant/50 dark:bg-surface-variant/20 flex items-center justify-center text-on-surface-variant dark:text-outline-variant icon-container">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">directions_car</span>
</div>
<div class="flex flex-col gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-title">Taksi Online</span>
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant transaction-time-method">19:45 PM • Kartu Kredit</span>
</div>
</div>
<div class="flex flex-col items-end gap-stack-sm">
<span class="font-body-lg text-body-lg font-semibold text-on-surface dark:text-on-secondary transaction-amount">- Rp 120.000</span>
<div class="flex items-center gap-1 transaction-status">
<div class="w-2 h-2 rounded-full bg-tertiary dark:bg-tertiary-fixed-dim status-dot"></div>
<span class="font-label-md text-[10px] text-tertiary dark:text-tertiary-fixed-dim status-text">Pending</span>
</div>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- BottomNavBar -->
<nav class="bg-surface/80 dark:bg-[#0b1c30]/80 backdrop-blur-xl fixed bottom-0 w-full z-40 border-t border-outline-variant/20 dark:border-white/10 shadow-[0_-4px_20px_0_rgba(0,0,0,0.1)] flex justify-around items-center h-20 pb-safe w-full px-base md:hidden">
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-inverse-primary active:scale-90 transition-transform w-20">
<span class="material-symbols-outlined mb-1" data-icon="dashboard">dashboard</span>
<span class="font-label-md text-label-md">Dashboard</span>
</button>
<button class="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full w-14 h-14 shadow-md hover:bg-surface-tint active:scale-90 transition-transform -mt-6 ring-4 ring-surface dark:ring-[#0b1c30]">
<span class="material-symbols-outlined text-[28px]">add</span>
</button>
<button class="flex flex-col items-center justify-center text-primary dark:text-inverse-primary active:scale-90 transition-transform w-20">
<span class="material-symbols-outlined mb-1" data-icon="history" style="font-variation-settings: 'FILL' 1;">history</span>
<span class="font-label-md text-label-md font-bold">Riwayat</span>
</button>
</nav>
<!-- Transaction Details Modal -->
<div class="fixed inset-0 z-50 hidden flex items-center justify-end flex-col sm:justify-center px-container-padding-mobile pb-safe" id="transaction-modal">
<div class="absolute inset-0 bg-[#0b1c30]/60 backdrop-blur-sm transition-opacity" id="modal-backdrop" onclick="closeModal()"></div>
<div class="relative w-full max-w-sm bg-surface-container-lowest dark:bg-inverse-surface rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden z-10 transform translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 transition-all duration-300" id="modal-content">
<div class="p-6 space-y-6">
<div class="flex justify-between items-start">
<div class="w-12 h-12 rounded-full flex items-center justify-center" id="modal-icon-container">
<span class="material-symbols-outlined" id="modal-icon" style="font-variation-settings: 'FILL' 1;">receipt</span>
</div>
<button class="text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-on-secondary transition-colors p-1 rounded-full hover:bg-surface-variant/50 dark:hover:bg-white/10" onclick="closeModal()">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="space-y-1">
<h3 class="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-secondary" id="modal-title">Transaksi</h3>
<p class="font-display-lg text-[32px] leading-[40px] font-bold" id="modal-amount">- Rp 0</p>
</div>
<div class="space-y-4 pt-2">
<div class="flex justify-between items-center py-2 border-b border-outline-variant/20 dark:border-outline/20">
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant">Status</span>
<div class="flex items-center gap-1" id="modal-status-container">
<div class="w-2 h-2 rounded-full bg-primary dark:bg-inverse-primary" id="modal-status-dot"></div>
<span class="font-label-md text-label-md dark:text-outline-variant" id="modal-status">Berhasil</span>
</div>
</div>
<div class="flex justify-between items-center py-2 border-b border-outline-variant/20 dark:border-outline/20">
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant">Waktu</span>
<span class="font-body-sm text-body-sm font-semibold text-on-surface dark:text-on-secondary" id="modal-time">00:00 AM</span>
</div>
<div class="flex justify-between items-center py-2 border-b border-outline-variant/20 dark:border-outline/20">
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant">Metode</span>
<span class="font-body-sm text-body-sm font-semibold text-on-surface dark:text-on-secondary" id="modal-method">Cash</span>
</div>
<div class="flex justify-between items-center py-2 border-b border-outline-variant/20 dark:border-outline/20" id="modal-category-container">
<span class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant">Kategori</span>
<span class="px-2 py-0.5 rounded-full font-label-md text-[10px]" id="modal-category">Kategori</span>
</div>
</div>
</div>
<div class="p-4 bg-surface dark:bg-[#0b1c30] border-t border-outline-variant/20 dark:border-outline/20">
<button class="w-full py-3 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary transition-colors" onclick="closeModal()">Tutup</button>
</div>
</div>
</div>
<script>
function openModal(item) {
    const modal = document.getElementById('transaction-modal');
    const modalContent = document.getElementById('modal-content');
    
    // Extract info
    const title = item.querySelector('.transaction-title').innerText;
    const timeMethodStr = item.querySelector('.transaction-time-method').innerText;
    const [time, method] = timeMethodStr.split(' • ');
    
    const amountEl = item.querySelector('.transaction-amount');
    const amount = amountEl.innerText;
    const isIncome = amount.includes('+');
    
    const categoryEl = item.querySelector('.transaction-category');
    const statusEl = item.querySelector('.transaction-status');
    
    const iconContainer = item.querySelector('.icon-container');
    const icon = iconContainer.querySelector('.material-symbols-outlined').innerText;
    const iconClasses = Array.from(iconContainer.classList).filter(c => c.startsWith('bg-') || c.startsWith('text-'));
    
    // Populate modal
    document.getElementById('modal-title').innerText = title;
    
    const modalAmount = document.getElementById('modal-amount');
    modalAmount.innerText = amount;
    modalAmount.className = `font-headline-lg text-headline-lg font-bold ${isIncome ? 'text-primary dark:text-inverse-primary' : 'text-on-surface dark:text-on-secondary'}`;
    
    document.getElementById('modal-time').innerText = time;
    document.getElementById('modal-method').innerText = method;
    
    const mCatCont = document.getElementById('modal-category-container');
    const mCat = document.getElementById('modal-category');
    if (categoryEl) {
        mCatCont.style.display = 'flex';
        mCat.innerText = categoryEl.innerText;
        mCat.className = categoryEl.className;
    } else {
        mCatCont.style.display = 'none';
    }
    
    const mStatusCont = document.getElementById('modal-status-container');
    const mStatus = document.getElementById('modal-status');
    const mStatusDot = document.getElementById('modal-status-dot');
    
    if (statusEl) {
        const textEl = statusEl.querySelector('.status-text');
        const dotEl = statusEl.querySelector('.status-dot');
        mStatus.innerText = textEl.innerText;
        mStatus.className = textEl.className;
        mStatusDot.className = dotEl.className;
    } else {
        mStatus.innerText = 'Berhasil';
        mStatus.className = 'font-label-md text-label-md text-on-surface-variant dark:text-outline-variant';
        mStatusDot.className = 'w-2 h-2 rounded-full bg-primary dark:bg-inverse-primary';
    }
    
    const mIconCont = document.getElementById('modal-icon-container');
    mIconCont.className = `w-12 h-12 rounded-full flex items-center justify-center ${iconClasses.join(' ')}`;
    document.getElementById('modal-icon').innerText = icon;
    
    modal.classList.remove('hidden');
    // Allow reflow
    void modal.offsetWidth;
    modalContent.classList.remove('translate-y-full', 'sm:scale-95', 'opacity-0');
    modalContent.classList.add('translate-y-0', 'sm:scale-100', 'opacity-100');
}

function closeModal() {
    const modal = document.getElementById('transaction-modal');
    const modalContent = document.getElementById('modal-content');
    
    modalContent.classList.remove('translate-y-0', 'sm:scale-100', 'opacity-100');
    modalContent.classList.add('translate-y-full', 'sm:scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.transaction-item');
    items.forEach(item => {
        item.addEventListener('click', function() {
            openModal(this);
        });
    });
});
</script>
</body></html>