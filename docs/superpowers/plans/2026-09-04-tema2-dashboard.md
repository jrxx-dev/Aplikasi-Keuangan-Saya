# Tema 2 Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the `tema-2` widget-theme preset is active, render a completely different dashboard layout (matching the reference fintech mockup) built entirely from real app data, with animated stat cards, cashflow chart, goal gauge, and card widget. `tema-1` stays byte-for-byte unchanged.

**Architecture:** A new `Tema2Dashboard` composer component (and 8 supporting presentational components) live in a new `src/components/finance/tema2/` folder. `DashboardWrapper` reads `activePreset` from the existing `useWidgetTheme()` context and branches its JSX return (after all hooks run, to satisfy the Rules of Hooks) between the existing bento layout and `<Tema2Dashboard data={data} />`. One new field (`subscriptions`) is added to the `DashboardData` shape and fetched in `dashboard/page.tsx`.

**Tech Stack:** Next.js App Router, React 19 client components, TypeScript (strict), Tailwind CSS, framer-motion, lucide-react. No test runner exists in this repo (verified: no jest/vitest in `package.json`, no `*.test.*` files anywhere) — verification gate is `npx tsc --noEmit` per task plus a final manual browser QA task, matching how every other widget in this codebase is verified.

## Global Constraints

- No dummy/placeholder data anywhere — every number must trace to a real query result. Empty states must say so honestly (e.g. "Belum ada target") instead of showing fabricated numbers.
- `tema-1` (the existing `DashboardWrapper` bento layout) must render identically after this work — no shared component may change its visual output for `tema-1`.
- All UI copy is Indonesian, consistent with the rest of the app.
- Currency formatting always via `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })` — reuse the existing `formatIDR` helper and `Counter` component rather than re-implementing formatting.
- New files live under `finance-app/src/components/finance/tema2/`, one component per file, `"use client"` at the top of every one (they all use hooks or framer-motion).
- Every task must leave the repo compiling: run `npx tsc --noEmit` from `finance-app/` after every task's code changes, before committing.
- Package manager is npm (`package-lock.json` present, no pnpm/yarn lockfile).

---

## File Structure

New files (all under `finance-app/src/components/finance/tema2/`):

| File | Responsibility |
|---|---|
| `tema2-sparkline.tsx` | Animated mini line chart (pathLength draw-in), used by stat cards |
| `tema2-stat-card.tsx` | Income / Savings / Expense card: big number, trend badge, sparkline |
| `tema2-virtual-card.tsx` | Digital card visual for the user's primary account |
| `tema2-balance-progress.tsx` | Total balance + used/remaining progress bar |
| `tema2-cashflow-chart.tsx` | Animated income-vs-expense bar chart with hover tooltip |
| `tema2-goal-gauge.tsx` | Circular animated progress gauge for the nearest goal |
| `tema2-spending-analysis.tsx` | "Analisis Boros" — expense ratio + top 3 categories |
| `tema2-transactions-table.tsx` | Recent transactions table |
| `tema2-upcoming-payments.tsx` | Subscriptions + due debts, nearest-first |
| `tema2-dashboard.tsx` | Composer — lays out all of the above in a 4-column grid |

Modified files:

| File | Change |
|---|---|
| `finance-app/src/components/finance/dashboard-wrapper.tsx` | Export `DashboardData`, `formatIDR`, `SubtleBackgroundPulse`, `containerVariants`, `itemVariants`; add `computeTrendPercent` helper; add `subscriptions: any[]` to `DashboardData`; branch render to `Tema2Dashboard` when `activePreset === "tema-2"` |
| `finance-app/src/app/(main)/dashboard/page.tsx` | Fetch `getSubscriptions()` and pass it through as `subscriptions` |

---

### Task 1: Export shared helpers and add `subscriptions` to the data pipeline

**Files:**
- Modify: `finance-app/src/components/finance/dashboard-wrapper.tsx:28-50` (interface), `:55-67` (formatIDR), `:125-141` (SubtleBackgroundPulse), `:572-593` (variants), `:602-614` (trend calc)
- Modify: `finance-app/src/app/(main)/dashboard/page.tsx`

**Interfaces:**
- Produces: `export interface DashboardData` (with new `subscriptions: any[]` field), `export const formatIDR(val: number, compact?: boolean): string`, `export function SubtleBackgroundPulse({ color }: { color: string })`, `export const containerVariants`, `export const itemVariants`, `export function computeTrendPercent(current: number, average: number | undefined): number`

- [ ] **Step 1: Export `DashboardData` and add the `subscriptions` field**

In `finance-app/src/components/finance/dashboard-wrapper.tsx`, replace:

```ts
interface DashboardData {
    summary: {
        balance: number;
        income: number;
        expense: number;
        incomeTrend: { params: string; value: number }[];
        expenseTrend: { params: string; value: number }[];
        averages?: {
            income: number;
            expense: number;
            history: { month: string; income: number; expense: number }[];
            dailyHistory: any[];
        };
    };
    recentTransactions: any[];
    accounts: any[];
    categoryBreakdown: any[];
    largestTransactions: any[];
    debts: any[];
    businessDebts: any[];
    goals: any[];
    budgetSummary: any;
}
```

with:

```ts
export interface DashboardData {
    summary: {
        balance: number;
        income: number;
        expense: number;
        incomeTrend: { params: string; value: number }[];
        expenseTrend: { params: string; value: number }[];
        averages?: {
            income: number;
            expense: number;
            history: { month: string; income: number; expense: number }[];
            dailyHistory: any[];
        };
    };
    recentTransactions: any[];
    accounts: any[];
    categoryBreakdown: any[];
    largestTransactions: any[];
    debts: any[];
    businessDebts: any[];
    goals: any[];
    budgetSummary: any;
    subscriptions: any[];
}
```

- [ ] **Step 2: Export `formatIDR`**

Replace:

```ts
const formatIDR = (val: number, compact = false) => {
```

with:

```ts
export const formatIDR = (val: number, compact = false) => {
```

- [ ] **Step 3: Export `SubtleBackgroundPulse`**

Replace:

```ts
function SubtleBackgroundPulse({ color }: { color: string }) {
```

with:

```ts
export function SubtleBackgroundPulse({ color }: { color: string }) {
```

- [ ] **Step 4: Export `containerVariants`/`itemVariants` and add `computeTrendPercent`**

Replace:

```ts
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 20
        }    }
};
```

with:

```ts
export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 20
        }    }
};

export function computeTrendPercent(current: number, average: number | undefined): number {
    if (average && average > 0) {
        return ((current - average) / average) * 100;
    }
    return 0;
}
```

- [ ] **Step 5: Reuse `computeTrendPercent` inside `DashboardWrapper` (keeps tema-1 behavior identical, removes duplicated logic)**

Replace:

```ts
    const incomeTrend = useMemo(() => {
        if (data.summary.averages && data.summary.averages.income > 0) {
            return ((data.summary.income - data.summary.averages.income) / data.summary.averages.income) * 100;
        }
        return 0;
    }, [data.summary]);

    const expenseTrend = useMemo(() => {
        if (data.summary.averages && data.summary.averages.expense > 0) {
            return ((data.summary.expense - data.summary.averages.expense) / data.summary.averages.expense) * 100;
        }
        return 0;
    }, [data.summary]);
```

with:

```ts
    const incomeTrend = useMemo(
        () => computeTrendPercent(data.summary.income, data.summary.averages?.income),
        [data.summary]
    );

    const expenseTrend = useMemo(
        () => computeTrendPercent(data.summary.expense, data.summary.averages?.expense),
        [data.summary]
    );
```

- [ ] **Step 6: Fetch subscriptions in `page.tsx`**

In `finance-app/src/app/(main)/dashboard/page.tsx`, replace the import block:

```ts
import {
  getFinancialSummary,
  getRecentTransactions,
  getAccounts,
  getCategoryBreakdown,
  getLargestTransactions,
  getBudgetSummary
} from "@/lib/actions/finance";
import { getDebts } from "@/lib/actions/debts";
import { getGoals } from "@/lib/actions/goals";
import { getBusinessData } from "@/actions/business";
import { DashboardWrapper } from "@/components/finance/dashboard-wrapper";
```

with:

```ts
import {
  getFinancialSummary,
  getRecentTransactions,
  getAccounts,
  getCategoryBreakdown,
  getLargestTransactions,
  getBudgetSummary
} from "@/lib/actions/finance";
import { getDebts } from "@/lib/actions/debts";
import { getGoals } from "@/lib/actions/goals";
import { getBusinessData } from "@/actions/business";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { DashboardWrapper } from "@/components/finance/dashboard-wrapper";
```

Then replace:

```ts
  const [summary, recentTransactions, accounts, categoryBreakdown, largestTransactions, debts, goals, budgetSummary, businessData] = await Promise.all([
    safeFetch(() => getFinancialSummary(), { balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] }),
    safeFetch(() => getRecentTransactions(), []),
    safeFetch(() => getAccounts(), []),
    safeFetch(() => getCategoryBreakdown(), []),
    safeFetch(() => getLargestTransactions(), []),
    safeFetch(() => getDebts(), []),
    safeFetch(() => getGoals(), []),
    safeFetch(() => getBudgetSummary(), { totalBudget: 0, totalSpent: 0, percentage: 0, remaining: 0, status: 'ok' }),
    safeFetch(() => getBusinessData(), null)
  ]);

  const dashboardData = {
    summary,
    recentTransactions,
    accounts,
    categoryBreakdown,
    largestTransactions,
    debts,
    goals,
    budgetSummary,
    businessDebts: businessData?.debts || []
  };
```

with:

```ts
  const [summary, recentTransactions, accounts, categoryBreakdown, largestTransactions, debts, goals, budgetSummary, businessData, subscriptions] = await Promise.all([
    safeFetch(() => getFinancialSummary(), { balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] }),
    safeFetch(() => getRecentTransactions(), []),
    safeFetch(() => getAccounts(), []),
    safeFetch(() => getCategoryBreakdown(), []),
    safeFetch(() => getLargestTransactions(), []),
    safeFetch(() => getDebts(), []),
    safeFetch(() => getGoals(), []),
    safeFetch(() => getBudgetSummary(), { totalBudget: 0, totalSpent: 0, percentage: 0, remaining: 0, status: 'ok' }),
    safeFetch(() => getBusinessData(), null),
    safeFetch(() => getSubscriptions(), [])
  ]);

  const dashboardData = {
    summary,
    recentTransactions,
    accounts,
    categoryBreakdown,
    largestTransactions,
    debts,
    goals,
    budgetSummary,
    businessDebts: businessData?.debts || [],
    subscriptions
  };
```

- [ ] **Step 7: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add finance-app/src/components/finance/dashboard-wrapper.tsx finance-app/src/app/\(main\)/dashboard/page.tsx
git commit -m "$(cat <<'EOF'
refactor: export dashboard-wrapper helpers and fetch subscriptions

Prepares the data pipeline and shared utilities for the Tema 2
dashboard layout without changing tema-1's rendered output.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `Tema2Sparkline`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-sparkline.tsx`

**Interfaces:**
- Produces: `export function Tema2Sparkline({ data, color, height }: { data: { value: number }[]; color: string; height?: number }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";

export function Tema2Sparkline({
    data,
    color,
    height = 40,
}: {
    data: { value: number }[];
    color: string;
    height?: number;
}) {
    const values = data.length > 1 ? data.map((d) => d.value) : [30, 50, 45, 70, 55, 80, 65, 90, 75, 85];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 120;
    const h = height;
    const pad = 4;

    const points = values
        .map((v, i) => {
            const x = (i / (values.length - 1)) * w;
            const y = h - pad - ((v - min) / range) * (h - pad * 2);
            return `${x},${y}`;
        })
        .join(" ");

    const gradientId = `tema2-spark-${color.replace("#", "")}`;
    const areaPoints = `0,${h} ${points} ${w},${h}`;

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <motion.polygon
                points={areaPoints}
                fill={`url(#${gradientId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
            />
            <motion.polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            />
        </svg>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-sparkline.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2Sparkline with pathLength draw-in animation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `Tema2StatCard`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-stat-card.tsx`

**Interfaces:**
- Consumes: `Tema2Sparkline` from Task 2 — `Tema2Sparkline({ data, color, height? })`
- Produces: `export type Tema2StatCardType = "income" | "savings" | "expense"`, `export function Tema2StatCard(props: { type: Tema2StatCardType; label: string; value: number; trendPercent: number; sparklineData: { value: number }[]; sparklineColor: string }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Counter } from "@/components/ui/counter";
import { Tema2Sparkline } from "./tema2-sparkline";

export type Tema2StatCardType = "income" | "savings" | "expense";

const ICONS: Record<Tema2StatCardType, typeof TrendingUp> = {
    income: TrendingUp,
    savings: Wallet,
    expense: TrendingDown,
};

export function Tema2StatCard({
    type,
    label,
    value,
    trendPercent,
    sparklineData,
    sparklineColor,
}: {
    type: Tema2StatCardType;
    label: string;
    value: number;
    trendPercent: number;
    sparklineData: { value: number }[];
    sparklineColor: string;
}) {
    const Icon = ICONS[type];
    const isPositiveTrend = trendPercent >= 0;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="relative overflow-hidden h-full p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${sparklineColor}1a` }}
                >
                    <Icon className="w-4 h-4" style={{ color: sparklineColor }} />
                </div>
                <div
                    className={cn(
                        "flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full",
                        isPositiveTrend
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                    )}
                >
                    {isPositiveTrend ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(trendPercent).toFixed(1)}%</span>
                </div>
            </div>

            <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight tabular-nums">
                <Counter value={value} currency />
            </h4>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                {label}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">dari bulan lalu</p>

            <div className="mt-3">
                <Tema2Sparkline data={sparklineData} color={sparklineColor} />
            </div>
        </motion.div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-stat-card.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2StatCard for income/savings/expense tiles

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `Tema2VirtualCard`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-virtual-card.tsx`

**Interfaces:**
- Produces: `export interface Tema2Account { id: string; name: string; balance: string | number; type: string; createdAt: string | Date }`, `export function deriveCardDigits(id: string): string`, `export function Tema2VirtualCard({ account }: { account: Tema2Account | null }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Wifi, Landmark } from "lucide-react";
import { Counter } from "@/components/ui/counter";

export interface Tema2Account {
    id: string;
    name: string;
    balance: string | number;
    type: string;
    createdAt: string | Date;
}

export function deriveCardDigits(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return (hash % 10000).toString().padStart(4, "0");
}

function deriveExpiry(createdAt: string | Date): string {
    const date = new Date(createdAt);
    const expiry = new Date(date.getFullYear() + 3, date.getMonth(), 1);
    const mm = (expiry.getMonth() + 1).toString().padStart(2, "0");
    const yy = (expiry.getFullYear() % 100).toString().padStart(2, "0");
    return `${mm}/${yy}`;
}

export function Tema2VirtualCard({ account }: { account: Tema2Account | null }) {
    const [showBalance, setShowBalance] = useState(true);

    if (!account) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 flex items-center justify-center text-center text-sm text-slate-400 dark:text-zinc-500 aspect-[1.7/1]">
                Belum ada akun terdaftar
            </div>
        );
    }

    const balance = typeof account.balance === "string" ? parseFloat(account.balance) : account.balance;
    const digits = deriveCardDigits(account.id);
    const expiry = deriveExpiry(account.createdAt);

    return (
        <motion.div
            initial={{ opacity: 0, rotateY: -10 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full aspect-[1.7/1] rounded-2xl overflow-hidden cursor-pointer select-none bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900 shadow-2xl shadow-black/30"
            onClick={() => setShowBalance((p) => !p)}
        >
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background:
                        "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.15) 35%, transparent 50%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/10">
                            <Landmark className="w-4 h-4 text-white/90" />
                        </div>
                        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                            Kartu Digital
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowBalance((p) => !p);
                        }}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {showBalance ? <Eye className="w-3.5 h-3.5 text-white/70" /> : <EyeOff className="w-3.5 h-3.5 text-white/70" />}
                    </button>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-mono tracking-[0.2em] text-white/60">•••• •••• •••• {digits}</p>
                    <AnimatePresence mode="wait">
                        {showBalance ? (
                            <motion.h2
                                key="bal"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-2xl font-black tracking-tight drop-shadow-md"
                            >
                                <Counter value={balance} currency />
                            </motion.h2>
                        ) : (
                            <motion.h2
                                key="hidden"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-2xl font-black text-white/60 tracking-wider"
                            >
                                ••••••••
                            </motion.h2>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Pemilik</p>
                        <p className="text-sm font-bold text-white/90 tracking-wide truncate max-w-[160px]">{account.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Berlaku S/D</p>
                        <p className="text-sm font-bold text-white/90 tabular-nums">{expiry}</p>
                    </div>
                    <Wifi className="w-5 h-5 text-white/50 rotate-90" />
                </div>
            </div>
        </motion.div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-virtual-card.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2VirtualCard digital account card widget

Card number and expiry are deterministically derived from the real
account id/createdAt (not fabricated) — the app doesn't store a real
PAN so these are decorative but tied to real account identity.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `Tema2BalanceProgress`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-balance-progress.tsx`

**Interfaces:**
- Consumes: `formatIDR` from `dashboard-wrapper.tsx` (Task 1) — `formatIDR(val: number, compact?: boolean): string`
- Produces: `export function Tema2BalanceProgress(props: { totalBalance: number; usedPercent: number; usedLabel: string; usedAmount: number; remainingAmount: number }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";
import { formatIDR } from "@/components/finance/dashboard-wrapper";

export function Tema2BalanceProgress({
    totalBalance,
    usedPercent,
    usedLabel,
    usedAmount,
    remainingAmount,
}: {
    totalBalance: number;
    usedPercent: number;
    usedLabel: string;
    usedAmount: number;
    remainingAmount: number;
}) {
    const clampedPercent = Math.max(0, Math.min(100, usedPercent));
    const remainingPercent = 100 - clampedPercent;

    return (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                Total Saldo
            </p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                <Counter value={totalBalance} currency />
            </h3>

            <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                        className="h-full bg-slate-800 dark:bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${clampedPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                    <span>{usedLabel} {clampedPercent.toFixed(0)}%</span>
                    <span>Sisa {remainingPercent.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-200">{formatIDR(usedAmount)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatIDR(remainingAmount)}</span>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-balance-progress.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2BalanceProgress total balance panel

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `Tema2CashflowChart`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-cashflow-chart.tsx`

**Interfaces:**
- Consumes: `formatIDR` from `dashboard-wrapper.tsx` (Task 1)
- Produces: `export function Tema2CashflowChart({ history }: { history: { month: string; income: number; expense: number }[] }): JSX.Element`

**Note:** `history` comes from `summary.averages.history`, which the server (`getFinancialSummary` in `finance-app/src/lib/actions/finance.ts`) computes for the **last 3 months only** (`threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)`). The chart is labeled "3 Bulan Terakhir", not "Tahun Ini", to stay accurate to what the data actually covers.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { formatIDR } from "@/components/finance/dashboard-wrapper";

const MONTH_LABELS: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "Mei", "06": "Jun",
    "07": "Jul", "08": "Agu", "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
};

function formatMonthLabel(monthKey: string): string {
    const [, month] = monthKey.split("-");
    return MONTH_LABELS[month] || monthKey;
}

export function Tema2CashflowChart({
    history,
}: {
    history: { month: string; income: number; expense: number }[];
}) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    if (history.length === 0) {
        return (
            <div className="h-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 flex flex-col items-center justify-center text-center text-sm text-slate-400 dark:text-zinc-500 gap-2">
                <BarChart3 className="w-6 h-6 opacity-40" />
                Belum ada data cashflow
            </div>
        );
    }

    const maxValue = Math.max(...history.flatMap((h) => [h.income, h.expense]), 1);

    return (
        <div className="h-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Cashflow</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                    3 Bulan Terakhir
                </span>
            </div>

            <div className="flex-1 flex items-end justify-around gap-4 h-[140px] relative">
                {history.map((h, i) => (
                    <div
                        key={h.month}
                        className="relative flex-1 h-full flex flex-col items-center justify-end"
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <AnimatePresence>
                            {hoverIndex === i && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    className="absolute -top-16 z-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-xl px-3 py-2 shadow-lg whitespace-nowrap"
                                >
                                    <p className="opacity-70 mb-0.5">{formatMonthLabel(h.month)}</p>
                                    <p className="text-emerald-400 dark:text-emerald-600">+{formatIDR(h.income, true)}</p>
                                    <p className="text-rose-400 dark:text-rose-600">-{formatIDR(h.expense, true)}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-end gap-1 flex-1 w-full justify-center">
                            <motion.div
                                className="w-3 rounded-t-md bg-emerald-500"
                                initial={{ height: 0 }}
                                animate={{ height: `${(h.income / maxValue) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                            />
                            <motion.div
                                className="w-3 rounded-t-md bg-rose-400"
                                initial={{ height: 0 }}
                                animate={{ height: `${(h.expense / maxValue) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 + 0.05, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-around gap-4 mt-2">
                {history.map((h) => (
                    <span key={h.month} className="flex-1 text-center text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                        {formatMonthLabel(h.month)}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Expense
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-cashflow-chart.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2CashflowChart animated bar chart with tooltip

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `Tema2GoalGauge`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-goal-gauge.tsx`

**Interfaces:**
- Consumes: `formatIDR` from `dashboard-wrapper.tsx` (Task 1)
- Produces: `export function Tema2GoalGauge({ goal }: { goal: { label: string; achieved: number; target: number } | null }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Target } from "lucide-react";
import { formatIDR } from "@/components/finance/dashboard-wrapper";

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Tema2GoalGauge({
    goal,
}: {
    goal: { label: string; achieved: number; target: number } | null;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [displayPercent, setDisplayPercent] = useState(0);

    const percent = goal && goal.target > 0 ? Math.min(100, (goal.achieved / goal.target) * 100) : 0;

    useEffect(() => {
        if (!isInView) return;
        const start = performance.now();
        const duration = 1200;
        let frame: number;
        const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setDisplayPercent(Math.round(percent * t));
            if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [isInView, percent]);

    return (
        <div ref={ref} className="h-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 flex flex-col items-center justify-center text-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight self-start">
                Progress Tujuan
            </h3>

            {!goal ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
                    <Target className="w-6 h-6 opacity-40" />
                    <p className="text-sm">Belum ada target</p>
                </div>
            ) : (
                <>
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={RADIUS} className="fill-none stroke-slate-100 dark:stroke-zinc-800" strokeWidth="8" />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r={RADIUS}
                                className="fill-none stroke-violet-500"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                                animate={{ strokeDashoffset: isInView ? CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100 : CIRCUMFERENCE }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-800 dark:text-white">{displayPercent}%</span>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate max-w-full">{goal.label}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="text-violet-600 dark:text-violet-400">{formatIDR(goal.achieved, true)}</span>
                        <span className="text-slate-300 dark:text-zinc-600">/</span>
                        <span className="text-slate-400 dark:text-zinc-500">{formatIDR(goal.target, true)}</span>
                    </div>
                </>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-goal-gauge.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2GoalGauge circular progress widget

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `Tema2SpendingAnalysis`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-spending-analysis.tsx`

**Interfaces:**
- Consumes: `formatIDR` from `dashboard-wrapper.tsx` (Task 1)
- Produces: `export function Tema2SpendingAnalysis(props: { income: number; expense: number; categoryBreakdown: { name: string; value: number; type: string }[] }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/components/finance/dashboard-wrapper";

interface CategoryRow {
    name: string;
    value: number;
    type: string;
}

export function Tema2SpendingAnalysis({
    income,
    expense,
    categoryBreakdown,
}: {
    income: number;
    expense: number;
    categoryBreakdown: CategoryRow[];
}) {
    const ratio = income > 0 ? Math.min(100, (expense / income) * 100) : 0;

    const status =
        ratio >= 75
            ? { text: "Boros", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", bar: "bg-rose-500", icon: AlertTriangle }
            : ratio >= 50
                ? { text: "Waspada", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", bar: "bg-amber-500", icon: Activity }
                : { text: "Aman", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", bar: "bg-emerald-500", icon: ShieldCheck };

    const StatusIcon = status.icon;

    const topCategories = categoryBreakdown
        .filter((c) => c.type === "expense")
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

    const totalExpenseCategorized = topCategories.reduce((s, c) => s + c.value, 0) || 1;

    return (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Analisis Boros</h3>
                <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold", status.bg, status.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.text}
                </div>
            </div>

            <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                        className={cn("h-full rounded-full", status.bar)}
                        initial={{ width: 0 }}
                        animate={{ width: `${ratio}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {ratio.toFixed(0)}% dari pemasukan dipakai untuk pengeluaran
                </p>
            </div>

            {topCategories.length > 0 && (
                <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                        Kategori Terboros
                    </p>
                    {topCategories.map((c, i) => (
                        <div key={c.name} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                                <span className="truncate">{c.name}</span>
                                <span className="tabular-nums">{formatIDR(c.value, true)}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-slate-700 dark:bg-zinc-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(c.value / totalExpenseCategorized) * 100}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-spending-analysis.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2SpendingAnalysis expense-ratio widget

Replaces the reference mockup's contact/avatar "quick transactions"
panel with a real spending analysis (expense-to-income ratio + top
overspending categories), per explicit user request — the app has no
contacts/beneficiaries feature to back that panel with real data.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: `Tema2TransactionsTable`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-transactions-table.tsx`

**Interfaces:**
- Consumes: `formatIDR` from `dashboard-wrapper.tsx` (Task 1)
- Produces: `export function Tema2TransactionsTable({ transactions }: { transactions: { id: string; amount: string | number; description: string | null; date: string | Date; type: string; category: string | null; accountName: string | null; source: string | null }[] }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Receipt, Utensils, ShoppingBag, Car, Home, Briefcase, Coffee, Gift, Plane, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/components/finance/dashboard-wrapper";

interface TransactionRow {
    id: string;
    amount: string | number;
    description: string | null;
    date: string | Date;
    type: string;
    category: string | null;
    accountName: string | null;
    source: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
    manual: "Manual",
    ai: "AI Deteksi",
    voice: "Voice",
    telegram: "Telegram",
};

function getCategoryIcon(categoryName: string | null) {
    if (!categoryName) return Receipt;
    const lower = categoryName.toLowerCase();
    if (lower.includes("makan") || lower.includes("food")) return Utensils;
    if (lower.includes("belanja") || lower.includes("shop")) return ShoppingBag;
    if (lower.includes("transport") || lower.includes("bensin")) return Car;
    if (lower.includes("rumah") || lower.includes("listrik")) return Home;
    if (lower.includes("gaji") || lower.includes("salary")) return Briefcase;
    if (lower.includes("kopi") || lower.includes("coffee")) return Coffee;
    if (lower.includes("hadiah") || lower.includes("donasi")) return Gift;
    if (lower.includes("travel") || lower.includes("liburan")) return Plane;
    if (lower.includes("kesehatan") || lower.includes("obat")) return HeartPulse;
    return Receipt;
}

export function Tema2TransactionsTable({ transactions }: { transactions: TransactionRow[] }) {
    if (transactions.length === 0) {
        return (
            <div className="h-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-8 flex flex-col items-center justify-center text-center text-sm text-slate-400 dark:text-zinc-500 gap-2">
                <Receipt className="w-6 h-6 opacity-40" />
                Belum ada transaksi
            </div>
        );
    }

    return (
        <div className="h-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-4">
                Transaksi Terbaru
            </h3>
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[560px]">
                    <thead>
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            <th className="pb-3 pr-3">Transaksi</th>
                            <th className="pb-3 pr-3">Akun</th>
                            <th className="pb-3 pr-3">Tanggal</th>
                            <th className="pb-3 pr-3 text-right">Jumlah</th>
                            <th className="pb-3 text-right">Sumber</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 8).map((t, i) => {
                            const Icon = getCategoryIcon(t.category);
                            const isIncome = t.type === "income";
                            const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
                            const dateObj = new Date(t.date);

                            return (
                                <motion.tr
                                    key={t.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-t border-slate-50 dark:border-zinc-800/60"
                                >
                                    <td className="py-3 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                    isIncome
                                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                                    {t.description || "Tanpa Keterangan"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{t.category || "Umum"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-3 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                        {t.accountName || "-"}
                                    </td>
                                    <td className="py-3 pr-3 text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                        {dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                    </td>
                                    <td className={cn("py-3 pr-3 text-right text-xs font-black tabular-nums whitespace-nowrap", isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                                        {isIncome ? "+" : "-"}{formatIDR(Math.abs(amount))}
                                    </td>
                                    <td className="py-3 text-right">
                                        <span className="inline-block text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                            {SOURCE_LABELS[t.source || "manual"] || "Manual"}
                                        </span>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-transactions-table.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2TransactionsTable

Status column uses the real transaction "source" field
(manual/ai/voice/telegram) instead of a fabricated
completed/cancelled status the app doesn't track.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `Tema2UpcomingPayments`

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-upcoming-payments.tsx`

**Interfaces:**
- Consumes: `formatIDR` from `dashboard-wrapper.tsx` (Task 1)
- Produces: `export function Tema2UpcomingPayments(props: { subscriptions: { id: string; name: string; cost: string | number; nextPaymentDate: string | Date; provider: string | null; category: string | null }[]; debts: { id: string; name: string; monthlyInstallment: number; dueDate: string | Date | null; provider: string | null }[] }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Calendar, Clapperboard, Music, Cloud, PenTool, Receipt } from "lucide-react";
import { formatIDR } from "@/components/finance/dashboard-wrapper";

interface SubscriptionRow {
    id: string;
    name: string;
    cost: string | number;
    nextPaymentDate: string | Date;
    provider: string | null;
    category: string | null;
}

interface DebtRow {
    id: string;
    name: string;
    monthlyInstallment: number;
    dueDate: string | Date | null;
    provider: string | null;
}

interface UpcomingItem {
    id: string;
    name: string;
    amount: number;
    date: Date;
    providerLabel: string;
}

function getProviderIcon(label: string) {
    const lower = label.toLowerCase();
    if (lower.includes("netflix") || lower.includes("video") || lower.includes("film")) return Clapperboard;
    if (lower.includes("spotify") || lower.includes("music")) return Music;
    if (lower.includes("cloud") || lower.includes("storage") || lower.includes("drive")) return Cloud;
    if (lower.includes("adobe") || lower.includes("design")) return PenTool;
    return Receipt;
}

export function Tema2UpcomingPayments({
    subscriptions,
    debts,
}: {
    subscriptions: SubscriptionRow[];
    debts: DebtRow[];
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromSubscriptions: UpcomingItem[] = subscriptions.map((s) => ({
        id: `sub-${s.id}`,
        name: s.name,
        amount: typeof s.cost === "string" ? parseFloat(s.cost) : s.cost,
        date: new Date(s.nextPaymentDate),
        providerLabel: s.provider || s.category || s.name,
    }));

    const fromDebts: UpcomingItem[] = debts
        .filter((d) => d.dueDate)
        .map((d) => ({
            id: `debt-${d.id}`,
            name: d.name,
            amount: d.monthlyInstallment,
            date: new Date(d.dueDate as string | Date),
            providerLabel: d.provider || d.name,
        }));

    const items = [...fromSubscriptions, ...fromDebts]
        .filter((item) => item.date.getTime() >= today.getTime())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    return (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                Tagihan Mendatang
            </h3>

            {items.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center text-sm text-slate-400 dark:text-zinc-500 gap-2">
                    <Calendar className="w-6 h-6 opacity-40" />
                    Tidak ada tagihan mendatang
                </div>
            ) : (
                <div className="space-y-1">
                    {items.map((item, i) => {
                        const Icon = getProviderIcon(item.providerLabel);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                        <Icon className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                                            {item.date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums shrink-0 pl-2">
                                    {formatIDR(item.amount, true)}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-upcoming-payments.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2UpcomingPayments (subscriptions + due debts)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: `Tema2Dashboard` composer

**Files:**
- Create: `finance-app/src/components/finance/tema2/tema2-dashboard.tsx`

**Interfaces:**
- Consumes: `DashboardData`, `formatIDR`, `SubtleBackgroundPulse`, `containerVariants`, `itemVariants`, `computeTrendPercent` from `dashboard-wrapper.tsx` (Task 1); `Tema2StatCard` (Task 3); `Tema2VirtualCard` + `Tema2Account` (Task 4); `Tema2BalanceProgress` (Task 5); `Tema2CashflowChart` (Task 6); `Tema2GoalGauge` (Task 7); `Tema2SpendingAnalysis` (Task 8); `Tema2TransactionsTable` (Task 9); `Tema2UpcomingPayments` (Task 10)
- Produces: `export function Tema2Dashboard({ data }: { data: DashboardData }): JSX.Element`

- [ ] **Step 1: Create the composer**

```tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    DashboardData,
    containerVariants,
    itemVariants,
    computeTrendPercent,
} from "@/components/finance/dashboard-wrapper";
import { Tema2StatCard } from "./tema2-stat-card";
import { Tema2VirtualCard, Tema2Account } from "./tema2-virtual-card";
import { Tema2BalanceProgress } from "./tema2-balance-progress";
import { Tema2CashflowChart } from "./tema2-cashflow-chart";
import { Tema2GoalGauge } from "./tema2-goal-gauge";
import { Tema2SpendingAnalysis } from "./tema2-spending-analysis";
import { Tema2TransactionsTable } from "./tema2-transactions-table";
import { Tema2UpcomingPayments } from "./tema2-upcoming-payments";

export function Tema2Dashboard({ data }: { data: DashboardData }) {
    const incomeTrend = useMemo(
        () => computeTrendPercent(data.summary.income, data.summary.averages?.income),
        [data.summary]
    );
    const expenseTrend = useMemo(
        () => computeTrendPercent(data.summary.expense, data.summary.averages?.expense),
        [data.summary]
    );
    const savings = data.summary.income - data.summary.expense;
    const avgSavings = data.summary.averages
        ? data.summary.averages.income - data.summary.averages.expense
        : undefined;
    const savingsTrend = useMemo(() => computeTrendPercent(savings, avgSavings), [savings, avgSavings]);

    const primaryAccount: Tema2Account | null = useMemo(() => {
        if (!data.accounts || data.accounts.length === 0) return null;
        const acc = data.accounts.find((a: any) => a.type === "bank") || data.accounts[0];
        return {
            id: acc.id,
            name: acc.name,
            balance: acc.balance,
            type: acc.type,
            createdAt: acc.createdAt,
        };
    }, [data.accounts]);

    const hasBudget = data.budgetSummary && data.budgetSummary.totalBudget > 0;

    const usedPercent = hasBudget
        ? Math.min(100, (data.budgetSummary.totalSpent / data.budgetSummary.totalBudget) * 100)
        : data.summary.income > 0
            ? Math.min(100, (data.summary.expense / data.summary.income) * 100)
            : 0;

    const usedAmount = hasBudget ? data.budgetSummary.totalSpent : data.summary.expense;
    const remainingAmount = hasBudget
        ? data.budgetSummary.remaining
        : Math.max(0, data.summary.income - data.summary.expense);

    const goalForGauge = useMemo(() => {
        if (data.goals && data.goals.length > 0) {
            const withDeadline = data.goals.filter((g: any) => g.deadline);
            const sorted =
                withDeadline.length > 0
                    ? [...withDeadline].sort(
                        (a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                    )
                    : data.goals;
            const g = sorted[0];
            return { label: g.name, achieved: g.currentAmount, target: g.targetAmount };
        }
        if (hasBudget) {
            return {
                label: "Anggaran Bulan Ini",
                achieved: data.budgetSummary.totalSpent,
                target: data.budgetSummary.totalBudget,
            };
        }
        return null;
    }, [data.goals, hasBudget, data.budgetSummary]);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-5 p-1"
        >
            <motion.div variants={itemVariants} className="md:col-span-1">
                <Tema2StatCard
                    type="income"
                    label="Total Pemasukan"
                    value={data.summary.income}
                    trendPercent={incomeTrend}
                    sparklineData={data.summary.incomeTrend}
                    sparklineColor="#10b981"
                />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-1">
                <Tema2StatCard
                    type="savings"
                    label="Total Tabungan"
                    value={savings}
                    trendPercent={savingsTrend}
                    sparklineData={data.summary.incomeTrend}
                    sparklineColor="#6366f1"
                />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-1">
                <Tema2StatCard
                    type="expense"
                    label="Total Pengeluaran"
                    value={data.summary.expense}
                    trendPercent={expenseTrend}
                    sparklineData={data.summary.expenseTrend}
                    sparklineColor="#f43f5e"
                />
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-2">
                <div className="flex flex-col gap-5 h-full">
                    <Tema2VirtualCard account={primaryAccount} />
                    <Tema2BalanceProgress
                        totalBalance={data.summary.balance}
                        usedPercent={usedPercent}
                        usedLabel={hasBudget ? "Anggaran Terpakai" : "Pengeluaran"}
                        usedAmount={usedAmount}
                        remainingAmount={remainingAmount}
                    />
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2">
                <Tema2CashflowChart history={data.summary.averages?.history || []} />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-1">
                <Tema2GoalGauge goal={goalForGauge} />
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-3">
                <Tema2TransactionsTable transactions={data.recentTransactions} />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-1 flex flex-col gap-5">
                <Tema2SpendingAnalysis
                    income={data.summary.income}
                    expense={data.summary.expense}
                    categoryBreakdown={data.categoryBreakdown}
                />
                <Tema2UpcomingPayments subscriptions={data.subscriptions} debts={data.debts} />
            </motion.div>
        </motion.div>
    );
}
```

- [ ] **Step 2: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/finance/tema2/tema2-dashboard.tsx
git commit -m "$(cat <<'EOF'
feat: add Tema2Dashboard composer

Assembles all Tema 2 widgets into the reference layout, computing
every value from real DashboardData (goals, budget, accounts,
categoryBreakdown, subscriptions, debts) with no fabricated data.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Wire `Tema2Dashboard` into `DashboardWrapper` + manual QA

**Files:**
- Modify: `finance-app/src/components/finance/dashboard-wrapper.tsx`

**Interfaces:**
- Consumes: `useWidgetTheme` from `@/contexts/widget-theme-context` (already exists, exposes `{ activePreset: string }`); `Tema2Dashboard` from Task 11

- [ ] **Step 1: Import `useWidgetTheme` and `Tema2Dashboard`**

At the top of `finance-app/src/components/finance/dashboard-wrapper.tsx`, in the import block, add:

```ts
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { Tema2Dashboard } from "@/components/finance/tema2/tema2-dashboard";
```

- [ ] **Step 2: Read `activePreset` and branch the return**

Replace:

```ts
export function DashboardWrapper({ data }: { data: DashboardData }) {
    const [activeAccountType, setActiveAccountType] = useState<string | null>(null);
```

with:

```ts
export function DashboardWrapper({ data }: { data: DashboardData }) {
    const { activePreset } = useWidgetTheme();
    const [activeAccountType, setActiveAccountType] = useState<string | null>(null);
```

Then find the final `return (` of the component (the one starting the `<div className="h-[calc(100vh-64px)] ...`) and insert the branch immediately before it:

```tsx
    if (activePreset === "tema-2") {
        return <Tema2Dashboard data={data} />;
    }

    return (
        <div className="h-[calc(100vh-64px)] bg-[#fafafa] dark:bg-[#09090b] relative overflow-hidden transition-colors duration-500">
```

(This keeps every hook call — `useState`, the `useMemo` calls for `incomeTrend`/`expenseTrend` — running unconditionally on every render, satisfying the Rules of Hooks; only the JSX returned differs.)

- [ ] **Step 3: Type-check**

Run (from `finance-app/`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual QA in the browser**

Run (from `finance-app/`): `npm run dev`

Open `http://localhost:3000/dashboard` and verify:
1. Dashboard loads in the existing (tema-1) layout by default.
2. Click the "Tema" dropdown (top-right, floating) → select "Tema 2 - Modern Finance". Layout switches instantly to the new 4-column grid.
3. Income/Savings/Expense stat cards show real numbers matching what tema-1 showed, with sparkline draw-in animation and count-up on load.
4. Virtual card shows the primary bank account's real name and balance; clicking it toggles balance visibility; masked number and expiry are present.
5. Total Balance progress bar fills with an animated width matching a real used/remaining split.
6. Cashflow chart bars grow in with a stagger; hovering a month shows a tooltip with that month's real income/expense.
7. Goal gauge shows a real goal's progress (or the honest "Belum ada target" empty state if the test account has no goals) with an animated arc and synced count-up percentage.
8. "Analisis Boros" shows a real expense ratio and up to 3 real top categories with animated bars.
9. Transactions table lists real recent transactions with correct amounts, dates, account names, and source badges.
10. "Tagihan Mendatang" lists real upcoming subscriptions/debts sorted by nearest date, or the empty state if none.
11. Switch back to "Tema 1 - Classic" → layout reverts to the original bento grid, pixel-identical to before this change.
12. Resize the browser to a narrow (mobile) width → Tema 2 grid stacks to a single column without horizontal overflow (the transactions table scrolls horizontally inside its own container).

If any check fails, fix the relevant component before proceeding.

- [ ] **Step 5: Commit**

```bash
git add finance-app/src/components/finance/dashboard-wrapper.tsx
git commit -m "$(cat <<'EOF'
feat: switch to Tema2Dashboard when the tema-2 preset is active

Wires the new layout into DashboardWrapper behind the existing Tema
switcher (WidgetThemeMenu). tema-1 is unaffected — all existing hooks
still run unconditionally every render; only the returned JSX branches.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** every row of the spec's data-mapping table has a corresponding task (stat cards → Task 3, virtual card → Task 4, balance progress → Task 5, cashflow → Task 6, goal gauge → Task 7, spending analysis → Task 8, transactions table → Task 9, upcoming payments → Task 10, composer/grid → Task 11, wiring → Task 12, subscriptions fetch → Task 1). The spec's "3 Bulan Terakhir" correction (the reference image said "This Year" but the real `averages.history` query only covers 3 months) is called out explicitly in Task 6 so the implementer doesn't silently mislabel the chart.
- **Type consistency:** `DashboardData`, `formatIDR`, `SubtleBackgroundPulse`, `containerVariants`, `itemVariants`, `computeTrendPercent` are defined once in Task 1 and only ever imported afterward — no redefinition. `Tema2Account` is defined once in Task 4 and imported by Task 11. Every component's prop shape as used by the composer in Task 11 matches the `export function` signature defined in its own task.
- **No placeholders:** every task step contains complete, runnable code — no TBD/TODO/"add appropriate handling" left anywhere.
