import { MobileHeader } from "@/components/mobile/mobile-header";
import { getFinancialSummary, getRecentTransactions, getAccounts, getBudgetSummary } from "@/lib/actions/finance";
import { getBusinessData } from "@/actions/business";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { BalanceCarousel } from "@/components/mobile/balance-carousel";
import { AssetCards } from "@/components/mobile/asset-cards";
import { MobileDashboardChart } from "@/components/mobile/dashboard-chart";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import Loading from "../../loading";
import { 
    ArrowDownLeft, 
    ArrowUpRight, 
    Clock, 
    CreditCard, 
    Wallet, 
    ShoppingBag, 
    Utensils, 
    Bus, 
    Zap, 
    Plus,
    CheckCircle2,
    CalendarDays,
    BadgeDollarSign,
    UserCircle2,
    ChevronRight
} from "lucide-react";

export const dynamic = 'force-dynamic';

// Helper to get icon for category
const getCategoryIcon = (category: string | null, type: 'income' | 'expense' | 'receivable') => {
    const cat = category?.toLowerCase() || '';
    if (type === 'income') return ArrowDownLeft;
    if (type === 'receivable') return BadgeDollarSign;
    
    if (cat.includes('makan') || cat.includes('food') || cat.includes('kuliner')) return Utensils;
    if (cat.includes('belanja') || cat.includes('shop')) return ShoppingBag;
    if (cat.includes('transport') || cat.includes('ojek')) return Bus;
    if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('bill')) return Zap;
    
    return ArrowUpRight;
};

async function DashboardData() {
    // Fetch data in parallel for speed
    const [summary, recentTx, accounts, budgetSummary, businessData] = await Promise.all([
        getFinancialSummary(),
        getRecentTransactions(),
        getAccounts(),
        getBudgetSummary(),
        getBusinessData()
    ]);

    // Mapping real data to components
    const bankTotal = accounts.filter(a => a.type === 'bank').reduce((s, a) => s + parseFloat(a.balance), 0);
    const walletTotal = accounts.filter(a => a.type === 'wallet').reduce((s, a) => s + parseFloat(a.balance), 0);
    const cashTotal = accounts.filter(a => a.type === 'cash').reduce((s, a) => s + parseFloat(a.balance), 0);

    // Calculate remaining budget
    const totalRemainingBudget = budgetSummary?.totalBudget > 0 
        ? Math.max(0, budgetSummary.totalBudget - budgetSummary.totalSpent) 
        : 0;

    // Filter and sum Kasbon (receivables)
    const activeKasbon = businessData?.debts.filter(d => d.type === 'receivable' && d.status === 'unpaid') || [];
    const totalKasbon = activeKasbon.reduce((s, d) => s + parseFloat(d.amount), 0);

    return (
        <div className="flex flex-col gap-stack-lg">
            <div className="animate-entrance">
                <BalanceCarousel 
                    totalBalance={summary.balance} 
                    availableBalance={cashTotal + walletTotal} 
                    savingsBalance={bankTotal} 
                />
            </div>

            {/* Quick Insight Badge - Now Connected to real data */}
            <div className="flex items-center justify-between bg-primary-container/10 border border-primary-container/20 rounded-xl p-3 animate-entrance delay-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <span className="text-[14px] text-on-surface-variant font-medium">Sisa budget: <span className="text-primary font-black">{formatCurrency(totalRemainingBudget, true)}</span></span>
                </div>
                <Link href="/budgets" className="text-primary text-[10px] uppercase font-black hover:underline active:scale-95 transition-transform duration-200 tracking-widest">DETAIL</Link>
            </div>

            {/* Kasbon Bisnis Summary - NEW SECTION */}
            {totalKasbon > 0 && (
                <section className="animate-entrance delay-150">
                    <Link href="/business?view=debt">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <BadgeDollarSign className="w-24 h-24" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-80">Kasbon Bisnis Aktif</h3>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black">{activeKasbon.length}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black tabular-nums tracking-tight">
                                        {formatCurrency(totalKasbon, true)}
                                    </p>
                                    <p className="text-[11px] font-medium opacity-70 mt-1">
                                        Klik untuk detail atau kelola piutang
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* Total Balance Card (Asset Grid) */}
            <AssetCards 
                savings={bankTotal}
                wallet={walletTotal}
                investments={3000000} // Placeholder
                target={15000000} // Placeholder
                targetLabel="Liburan"
                targetProgress={83}
            />

            {/* Income/Expense Summary Bars */}
            <section className="grid grid-cols-2 gap-stack-md animate-entrance delay-300">
                <div className="bg-surface-container-low dark:bg-slate-800/50 rounded-xl p-stack-md flex flex-col gap-2 transition-all hover:bg-surface-container hover:scale-[1.02] hover:shadow-md active:scale-95 duration-300 cursor-pointer group border border-transparent hover:border-slate-200">
                    <div className="flex justify-between items-start">
                        <span className="text-[12px] font-bold text-on-surface-variant group-hover:text-primary-container transition-colors uppercase tracking-widest">Pemasukan</span>
                        <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-on-background">{formatCurrency(summary.income, true)}</span>
                        <span className="text-[10px] text-primary-container font-semibold">+12% vs target</span>
                    </div>
                    <div className="w-full bg-surface-variant dark:bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-primary-container h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-container-low dark:bg-slate-800/50 rounded-xl p-stack-md flex flex-col gap-2 transition-all hover:bg-surface-container hover:scale-[1.02] hover:shadow-md active:scale-95 duration-300 cursor-pointer group border border-transparent hover:border-slate-200">
                    <div className="flex justify-between items-start">
                        <span className="text-[12px] font-bold text-on-surface-variant group-hover:text-error transition-colors uppercase tracking-widest">Pengeluaran</span>
                        <div className="p-1 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-on-background">{formatCurrency(summary.expense, true)}</span>
                        <span className="text-[10px] text-rose-500 font-semibold">45% dari budget</span>
                    </div>
                    <div className="w-full bg-surface-variant dark:bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-rose-50 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>
            </section>

            {/* Weekly Analysis Chart (Functional Component) */}
            <MobileDashboardChart />

            {/* Recent Transactions */}
            <section className="pb-10 animate-entrance delay-500">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-[20px] font-bold text-on-background tracking-tight">Transaksi Terakhir</h2>
                    <Link href="/mobile/history" className="bg-primary-container/10 text-primary-container px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-primary-container/20 transition-all active:scale-95 duration-200">Lihat Semua</Link>
                </div>
                <div className="flex flex-col gap-3">
                    {recentTx.slice(0, 3).map((tx) => {
                        const isIncome = tx.type === 'income';
                        const CategoryIcon = getCategoryIcon(tx.category, tx.type as any);
                        
                        return (
                            <div key={tx.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center relative transition-transform duration-300 group-hover:rotate-6",
                                        isIncome 
                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                                    )}>
                                        <CategoryIcon className="w-6 h-6 stroke-[2.2px]" />
                                        
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md border border-slate-100 dark:border-slate-700">
                                            {isIncome ? (
                                                <Wallet className="w-3 h-3 text-blue-500" />
                                            ) : (
                                                <CreditCard className="w-3 h-3 text-indigo-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[15px] font-bold text-on-background tracking-tight truncate max-w-[140px] group-hover:text-primary transition-colors">
                                            {tx.description}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                12:30
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                                                {tx.category || 'KULINER'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={cn(
                                        "text-[16px] font-black tabular-nums tracking-tight",
                                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-on-background"
                                    )}>
                                        {isIncome ? '+' : '-'}{formatCurrency(Number(tx.amount), true)}
                                    </span>
                                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <CheckCircle2 className="w-3 h-3" /> Berhasil
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default async function MobileDashboard() {
    // Date formatting for header
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <main className="w-full max-w-md mx-auto relative pt-[88px] pb-12 px-container-padding-mobile font-inter">
            {/* TopAppBar */}
            <MobileHeader className="bg-white/80 dark:bg-on-background/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)] animate-entrance">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <p className="text-[14px] font-black text-on-surface tracking-tight">
                        {dateStr} <span className="mx-1 text-primary/30">|</span> {timeStr}
                    </p>
                </div>
            </MobileHeader>

            <Suspense fallback={<Loading />}>
                <DashboardData />
            </Suspense>
        </main>
    );
}
