# Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce page load times (both initial + navigation) by 50% via ISR caching, streaming, client-side memoization, and Vercel edge optimization.

**Architecture:** Remove `force-dynamic`, implement ISR with 5-10 min revalidate intervals, add Suspense boundaries for streaming, memoize components, consolidate fonts, add error handling with 3-second timeouts.

**Tech Stack:** Next.js 14+ App Router, React 18+ Suspense, Vercel Edge, built-in `unstable_cache()` and `revalidateTag()`.

## Global Constraints
- No new npm dependencies (use Next.js built-in features only)
- Monorepo: finance-app + main-dashboard
- All pages follow same caching pattern (5 min critical, 10 min lower-priority)
- Timeout: 3 seconds per API/DB call
- Testing: Manual Lighthouse + Vercel Analytics (no unit test suite required)

---

## Phase 1: Setup & Utilities

### Task 1: Create Cache & Timeout Utilities

**Files:**
- Create: `finance-app/src/lib/cache.ts`
- Create: `finance-app/src/lib/fetch-with-timeout.ts`
- Modify: `finance-app/src/lib/actions/finance.ts` (update imports)

**Interfaces:**
- Produces: `withCacheTag(fn, tag)`, `fetchWithTimeout(url, timeout)`, `CACHE_TAGS` constant

**Steps:**

- [ ] **Step 1: Create cache tag constants**

Create `finance-app/src/lib/cache.ts`:
```typescript
// Cache tags for revalidation
export const CACHE_TAGS = {
  SUMMARY: 'financial-summary',
  TRANSACTIONS: 'transactions',
  ACCOUNTS: 'accounts',
  BUDGETS: 'budgets',
  DEBTS: 'debts',
  GOALS: 'goals',
  CATEGORY: 'category-breakdown',
  BUSINESS: 'business-data',
} as const;

// Revalidate intervals (seconds)
export const REVALIDATE_INTERVALS = {
  CRITICAL: 300, // 5 minutes (dashboard, high-traffic)
  STANDARD: 600, // 10 minutes (other pages)
} as const;

export function getCacheTags(tag: keyof typeof CACHE_TAGS): string {
  return CACHE_TAGS[tag];
}
```

- [ ] **Step 2: Create fetch-with-timeout utility**

Create `finance-app/src/lib/fetch-with-timeout.ts`:
```typescript
export async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 3000
): Promise<T | null> {
  return Promise.race([
    fn(),
    new Promise<null>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Fetch timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]).catch((error) => {
    console.error('Fetch error:', error.message);
    return null;
  });
}
```

- [ ] **Step 3: Update safeFetch to use timeout**

Modify `finance-app/src/lib/actions/finance.ts` (top of file, add import):
```typescript
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';
import { CACHE_TAGS, REVALIDATE_INTERVALS, getCacheTags } from '@/lib/cache';
```

- [ ] **Step 4: Commit**

```bash
git add finance-app/src/lib/cache.ts finance-app/src/lib/fetch-with-timeout.ts
git commit -m "feat: add cache tag utilities and fetch timeout wrapper"
```

---

### Task 2: Create Skeleton Components

**Files:**
- Create: `finance-app/src/components/skeletons/dashboard-skeleton.tsx`
- Create: `finance-app/src/components/skeletons/summary-skeleton.tsx`
- Create: `finance-app/src/components/skeletons/table-skeleton.tsx`

**Interfaces:**
- Produces: `DashboardSkeleton`, `SummarySkeleton`, `TableSkeleton` components

**Steps:**

- [ ] **Step 1: Create summary skeleton**

Create `finance-app/src/components/skeletons/summary-skeleton.tsx`:
```typescript
export function SummarySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create table skeleton**

Create `finance-app/src/components/skeletons/table-skeleton.tsx`:
```typescript
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard skeleton**

Create `finance-app/src/components/skeletons/dashboard-skeleton.tsx`:
```typescript
import { SummarySkeleton } from './summary-skeleton';
import { TableSkeleton } from './table-skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <SummarySkeleton />
      <div className="grid gap-8 md:grid-cols-2">
        <TableSkeleton rows={3} />
        <TableSkeleton rows={3} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add finance-app/src/components/skeletons/
git commit -m "feat: add skeleton loaders for streaming UI"
```

---

## Phase 2: Server-Side Caching

### Task 3: Update Dashboard Page with Revalidation

**Files:**
- Modify: `finance-app/src/app/(main)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `CACHE_TAGS`, `REVALIDATE_INTERVALS`
- Produces: Dashboard page with ISR caching enabled

**Steps:**

- [ ] **Step 1: Update dashboard page exports**

Modify `finance-app/src/app/(main)/dashboard/page.tsx` (replace top 15 lines):
```typescript
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
import { CACHE_TAGS, REVALIDATE_INTERVALS, getCacheTags } from "@/lib/cache";

// Enable ISR: revalidate every 5 minutes
export const revalidate = REVALIDATE_INTERVALS.CRITICAL;

// Remove force-dynamic (delete this line if exists)
// export const dynamic = "force-dynamic";
```

- [ ] **Step 2: Add cache tags to safeFetch**

Modify `finance-app/src/app/(main)/dashboard/page.tsx` (update safeFetch function):
```typescript
async function safeFetch<T>(
  fn: () => Promise<T>,
  fallback: T,
  cacheTag?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("Data fetch error:", error);
    return fallback;
  }
}
```

- [ ] **Step 3: Update all data fetches with cache tags**

Modify the data fetching calls in dashboard page (replace the Promise.all):
```typescript
const [summary, recentTransactions, accounts, categoryBreakdown, largestTransactions, debts, goals, budgetSummary, businessData] = await Promise.all([
  safeFetch(() => getFinancialSummary(), { balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] }, getCacheTags('SUMMARY')),
  safeFetch(() => getRecentTransactions(), [], getCacheTags('TRANSACTIONS')),
  safeFetch(() => getAccounts(), [], getCacheTags('ACCOUNTS')),
  safeFetch(() => getCategoryBreakdown(), [], getCacheTags('CATEGORY')),
  safeFetch(() => getLargestTransactions(), [], getCacheTags('TRANSACTIONS')),
  safeFetch(() => getDebts(), [], getCacheTags('DEBTS')),
  safeFetch(() => getGoals(), [], getCacheTags('GOALS')),
  safeFetch(() => getBudgetSummary(), { totalBudget: 0, totalSpent: 0, percentage: 0, remaining: 0, status: 'ok' }, getCacheTags('BUDGETS')),
  safeFetch(() => getBusinessData(), null, getCacheTags('BUSINESS'))
]);
```

- [ ] **Step 4: Commit**

```bash
git add finance-app/src/app/\(main\)/dashboard/page.tsx
git commit -m "feat: enable ISR caching on dashboard (5min revalidate)"
```

---

### Task 4: Update Critical Pages with Revalidation

**Files:**
- Modify: `finance-app/src/app/(main)/accounts/page.tsx`
- Modify: `finance-app/src/app/(main)/transactions/page.tsx`
- Modify: `finance-app/src/app/(main)/budgets/page.tsx`
- Modify: `finance-app/src/app/(main)/analytics/page.tsx`

**Interfaces:**
- Consumes: `REVALIDATE_INTERVALS`
- Produces: All critical pages with 5-min revalidate

**Steps:**

- [ ] **Step 1: Update accounts page**

Modify top of `finance-app/src/app/(main)/accounts/page.tsx`:
```typescript
import { REVALIDATE_INTERVALS } from "@/lib/cache";

export const revalidate = REVALIDATE_INTERVALS.CRITICAL;
// Remove: export const dynamic = "force-dynamic";
```

- [ ] **Step 2: Update transactions page**

Modify top of `finance-app/src/app/(main)/transactions/page.tsx`:
```typescript
import { REVALIDATE_INTERVALS } from "@/lib/cache";

export const revalidate = REVALIDATE_INTERVALS.CRITICAL;
// Remove: export const dynamic = "force-dynamic";
```

- [ ] **Step 3: Update budgets page**

Modify top of `finance-app/src/app/(main)/budgets/page.tsx`:
```typescript
import { REVALIDATE_INTERVALS } from "@/lib/cache";

export const revalidate = REVALIDATE_INTERVALS.CRITICAL;
// Remove: export const dynamic = "force-dynamic";
```

- [ ] **Step 4: Update analytics page**

Modify top of `finance-app/src/app/(main)/analytics/page.tsx`:
```typescript
import { REVALIDATE_INTERVALS } from "@/lib/cache";

export const revalidate = REVALIDATE_INTERVALS.CRITICAL;
// Remove: export const dynamic = "force-dynamic";
```

- [ ] **Step 5: Update lower-priority pages (reports, settings, etc)**

For all remaining pages in `finance-app/src/app/(main)/*/page.tsx`:
```typescript
import { REVALIDATE_INTERVALS } from "@/lib/cache";

export const revalidate = REVALIDATE_INTERVALS.STANDARD; // 10 minutes
// Remove: export const dynamic = "force-dynamic";
```

(Apply to: reports, settings, insurance, pension, tax, investments, subscriptions, travel, zakat, education, family, help, logs, calendar, debts, goals, savings, paylater, planner, business/*, etc)

- [ ] **Step 6: Commit**

```bash
git add finance-app/src/app/\(main\)/*/page.tsx
git commit -m "feat: enable ISR caching on all pages (5-10min revalidate)"
```

---

### Task 5: Add Cache Tags to Data Fetching Functions

**Files:**
- Modify: `finance-app/src/lib/actions/finance.ts`
- Modify: `finance-app/src/lib/actions/debts.ts`
- Modify: `finance-app/src/lib/actions/goals.ts`
- Modify: `finance-app/src/actions/business.ts`

**Interfaces:**
- Consumes: `CACHE_TAGS`, `unstable_cache` from Next.js
- Produces: Data functions wrapped with cache tags

**Steps:**

- [ ] **Step 1: Update finance actions with cache tags**

Modify `finance-app/src/lib/actions/finance.ts` (add import at top):
```typescript
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS, getCacheTags } from '@/lib/cache';
```

Then wrap each function. Example for `getFinancialSummary`:
```typescript
export const getFinancialSummary = unstable_cache(
  async () => {
    // ... existing implementation
  },
  [getCacheTags('SUMMARY')],
  { revalidate: 300, tags: [getCacheTags('SUMMARY')] }
);

export const getRecentTransactions = unstable_cache(
  async () => {
    // ... existing implementation
  },
  [getCacheTags('TRANSACTIONS')],
  { revalidate: 300, tags: [getCacheTags('TRANSACTIONS')] }
);

// Apply same pattern to: getAccounts, getCategoryBreakdown, getLargestTransactions, getBudgetSummary
```

- [ ] **Step 2: Update debts actions**

Modify `finance-app/src/lib/actions/debts.ts`:
```typescript
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS, getCacheTags } from '@/lib/cache';

export const getDebts = unstable_cache(
  async () => {
    // ... existing implementation
  },
  [getCacheTags('DEBTS')],
  { revalidate: 300, tags: [getCacheTags('DEBTS')] }
);
```

- [ ] **Step 3: Update goals actions**

Modify `finance-app/src/lib/actions/goals.ts`:
```typescript
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS, getCacheTags } from '@/lib/cache';

export const getGoals = unstable_cache(
  async () => {
    // ... existing implementation
  },
  [getCacheTags('GOALS')],
  { revalidate: 300, tags: [getCacheTags('GOALS')] }
);
```

- [ ] **Step 4: Update business actions**

Modify `finance-app/src/actions/business.ts`:
```typescript
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS, getCacheTags } from '@/lib/cache';

export const getBusinessData = unstable_cache(
  async () => {
    // ... existing implementation
  },
  [getCacheTags('BUSINESS')],
  { revalidate: 300, tags: [getCacheTags('BUSINESS')] }
);
```

- [ ] **Step 5: Commit**

```bash
git add finance-app/src/lib/actions/ finance-app/src/actions/
git commit -m "feat: wrap data functions with unstable_cache and tags"
```

---

## Phase 3: Streaming & Suspense

### Task 6: Update Root Layout - Remove Data Fetches

**Files:**
- Modify: `finance-app/src/app/layout.tsx`

**Interfaces:**
- Consumes: Nothing new
- Produces: Root layout with providers only (no data fetches)

**Steps:**

- [ ] **Step 1: Review current root layout**

Current layout is already good (no data fetches, only providers). Verify `finance-app/src/app/layout.tsx` has no data-fetching calls.

- [ ] **Step 2: Ensure PWAManager is a client component**

Check `finance-app/src/components/providers/pwa-manager.tsx` - if not client component, add:
```typescript
'use client';
```

- [ ] **Step 3: Commit (no changes if already correct)**

```bash
git add finance-app/src/app/layout.tsx
git commit -m "style: verify root layout has no server data fetches"
```

---

### Task 7: Update Main Layout - Add Suspense Boundaries

**Files:**
- Modify: `finance-app/src/app/(main)/layout.tsx`

**Interfaces:**
- Consumes: `SummarySkeleton`, `Suspense` from React
- Produces: Main layout with Suspense boundaries for streaming

**Steps:**

- [ ] **Step 1: Add Suspense import and skeleton**

Modify top of `finance-app/src/app/(main)/layout.tsx`:
```typescript
import { Suspense } from 'react';
import { SummarySkeleton } from '@/components/skeletons/summary-skeleton';
```

- [ ] **Step 2: Wrap GlobalSummary in Suspense**

Modify the return statement (find GlobalSummary line):
```typescript
<div className="flex flex-1 flex-col h-full w-full p-4 md:p-6 lg:p-8 overflow-hidden gap-6">
  <div className="shrink-0">
    <Suspense fallback={<SummarySkeleton />}>
      <GlobalSummary />
    </Suspense>
  </div>

  <div className="glass-panel flex-1 flex flex-col overflow-hidden relative shadow-2xl ring-1 ring-white/10">
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide scroll-smooth">
      <WidgetThemeProvider>
        <PageWrapper>
          <div className="flex flex-1 flex-col pt-4 min-h-0">{children}</div>
        </PageWrapper>
      </WidgetThemeProvider>
      <ChatWidget />
    </div>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/app/\(main\)/layout.tsx
git commit -m "feat: add Suspense boundary to GlobalSummary for streaming"
```

---

### Task 8: Create loading.tsx Files for Key Routes

**Files:**
- Create: `finance-app/src/app/(main)/loading.tsx`
- Create: `finance-app/src/app/(main)/dashboard/loading.tsx`
- Create: `finance-app/src/app/(main)/transactions/loading.tsx`
- Create: `finance-app/src/app/(main)/analytics/loading.tsx`

**Interfaces:**
- Consumes: `DashboardSkeleton`, `TableSkeleton`
- Produces: Loading skeletons for route transitions

**Steps:**

- [ ] **Step 1: Create main loading component**

Create `finance-app/src/app/(main)/loading.tsx`:
```typescript
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

export default function Loading() {
  return (
    <div className="w-full">
      <DashboardSkeleton />
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard loading**

Create `finance-app/src/app/(main)/dashboard/loading.tsx`:
```typescript
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

- [ ] **Step 3: Create transactions loading**

Create `finance-app/src/app/(main)/transactions/loading.tsx`:
```typescript
import { TableSkeleton } from '@/components/skeletons/table-skeleton';

export default function Loading() {
  return <TableSkeleton rows={8} />;
}
```

- [ ] **Step 4: Create analytics loading**

Create `finance-app/src/app/(main)/analytics/loading.tsx`:
```typescript
import { TableSkeleton } from '@/components/skeletons/table-skeleton';

export default function Loading() {
  return <TableSkeleton rows={5} />;
}
```

- [ ] **Step 5: Commit**

```bash
git add finance-app/src/app/\(main\)/loading.tsx finance-app/src/app/\(main\)/*/loading.tsx
git commit -m "feat: add loading.tsx skeletons for route transitions"
```

---

## Phase 4: Client-Side Optimizations

### Task 9: Memoize Layout Components

**Files:**
- Modify: `finance-app/src/components/app-sidebar.tsx`
- Modify: `finance-app/src/components/global-summary.tsx`
- Modify: `finance-app/src/components/mobile/bottom-nav.tsx`

**Interfaces:**
- Consumes: `React.memo`, `useCallback`
- Produces: Memoized components to prevent unnecessary re-renders

**Steps:**

- [ ] **Step 1: Memoize AppSidebar**

Modify `finance-app/src/components/app-sidebar.tsx` (wrap export):
```typescript
export const AppSidebar = React.memo(AppSidebarComponent);
```
(Or if already exported as default, change to named export and memo)

Alternative if it's a function component:
```typescript
const AppSidebarBase = ({ variant }: { variant: string }) => {
  // ... component code
};

export const AppSidebar = React.memo(AppSidebarBase);
```

- [ ] **Step 2: Memoize GlobalSummary**

Modify `finance-app/src/components/global-summary.tsx`:
```typescript
const GlobalSummaryBase = () => {
  // ... existing component code
};

export default React.memo(GlobalSummaryBase);
```

- [ ] **Step 3: Memoize BottomNav**

Modify `finance-app/src/components/mobile/bottom-nav.tsx`:
```typescript
const BottomNavBase = () => {
  // ... existing component code
};

export const BottomNav = React.memo(BottomNavBase);
```

- [ ] **Step 4: Add useCallback to event handlers (example)**

In any component with onClick handlers, wrap with useCallback:
```typescript
const handleClick = useCallback(() => {
  // handler logic
}, []);
```

- [ ] **Step 5: Commit**

```bash
git add finance-app/src/components/app-sidebar.tsx finance-app/src/components/global-summary.tsx finance-app/src/components/mobile/bottom-nav.tsx
git commit -m "feat: memoize layout components to prevent re-renders"
```

---

### Task 10: Add Code Splitting for Heavy Components

**Files:**
- Modify: `finance-app/src/app/(main)/dashboard/page.tsx` (update component imports)
- Modify: `finance-app/src/app/(main)/analytics/page.tsx`
- Modify: `finance-app/src/components/finance/chat-widget.tsx`

**Interfaces:**
- Consumes: `next/dynamic`, `React.lazy`
- Produces: Lazy-loaded heavy components

**Steps:**

- [ ] **Step 1: Identify heavy components**

Heavy components to lazy-load:
- Charts (recharts library)
- Chat widget
- Modals/dialogs
- Report tables

- [ ] **Step 2: Add dynamic import for chat widget**

Modify `finance-app/src/app/(main)/layout.tsx`:
```typescript
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('@/components/finance/chat-widget').then(mod => ({ default: mod.ChatWidget })),
  { loading: () => null, ssr: false }
);

// Then in component, use ChatWidget normally
```

- [ ] **Step 3: Add dynamic import for analytics charts**

Modify `finance-app/src/app/(main)/analytics/page-client.tsx`:
```typescript
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(
  () => import('@/components/finance/analytics-charts'),
  { loading: () => <TableSkeleton />, ssr: true }
);

// Use in JSX
<AnalyticsCharts />
```

- [ ] **Step 4: Commit**

```bash
git add finance-app/src/app/\(main\)/layout.tsx finance-app/src/app/\(main\)/analytics/page-client.tsx
git commit -m "feat: add code splitting for heavy components (chat, charts)"
```

---

### Task 11: Optimize Navigation Links with Prefetch

**Files:**
- Modify: `finance-app/src/components/app-sidebar.tsx`
- Modify: `finance-app/src/components/navigation.tsx` (if exists)

**Interfaces:**
- Consumes: Next.js `<Link>` with `prefetch="intent"`
- Produces: Optimized navigation with prefetching

**Steps:**

- [ ] **Step 1: Update AppSidebar links**

Modify all navigation links in `finance-app/src/components/app-sidebar.tsx`:
```typescript
import Link from 'next/link';

// Replace existing <a> tags with:
<Link href="/accounts" prefetch="intent" className="nav-link">
  Accounts
</Link>

<Link href="/transactions" prefetch="intent" className="nav-link">
  Transactions
</Link>

<Link href="/budgets" prefetch="intent" className="nav-link">
  Budgets
</Link>
// etc for all sidebar links
```

- [ ] **Step 2: Update BottomNav links**

Modify all links in `finance-app/src/components/mobile/bottom-nav.tsx`:
```typescript
<Link href="/mobile/dashboard" prefetch="intent">
  Dashboard
</Link>

<Link href="/mobile/history" prefetch="intent">
  History
</Link>

<Link href="/mobile/input" prefetch="intent">
  Input
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/components/app-sidebar.tsx finance-app/src/components/mobile/bottom-nav.tsx
git commit -m "feat: enable prefetch='intent' on all navigation links"
```

---

### Task 12: Move BottomNav from Root to Mobile Layout

**Files:**
- Modify: `finance-app/src/app/layout.tsx`
- Modify: `finance-app/src/app/(mobile)/layout.tsx`

**Interfaces:**
- Consumes: `BottomNav` component
- Produces: BottomNav rendered only in mobile route group

**Steps:**

- [ ] **Step 1: Remove BottomNav from root layout**

Modify `finance-app/src/app/layout.tsx` (remove from return):
```typescript
// Remove: <BottomNav />
// Remove import of BottomNav from root
```

- [ ] **Step 2: Add BottomNav to mobile layout**

Modify `finance-app/src/app/(mobile)/layout.tsx` (add import and component):
```typescript
import { BottomNav } from '@/components/mobile/bottom-nav';

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/app/layout.tsx finance-app/src/app/\(mobile\)/layout.tsx
git commit -m "feat: move BottomNav from root to mobile layout only"
```

---

## Phase 5: Asset Optimization

### Task 13: Consolidate Google Fonts

**Files:**
- Modify: `finance-app/src/app/layout.tsx`

**Interfaces:**
- Consumes: `next/font/google`
- Produces: Single consolidated font import with all weights

**Steps:**

- [ ] **Step 1: Update root layout fonts**

Modify `finance-app/src/app/layout.tsx` (replace font imports and head):
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorManager } from "@/components/theme-color-manager";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/components/providers/language-provider";
import "./globals.css";
import { initConsoleCapture } from "@/lib/capture-console";
import { PWAManager } from "@/components/providers/pwa-manager";

initConsoleCapture();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Finance",
  description: "A modern personal finance dashboard built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols from Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          montserrat.variable,
          inter.variable,
          "antialiased"
        )}
        suppressHydrationWarning
      >
        <div className="glass-bg" />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <PWAManager />
            <ThemeColorManager />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update CSS to use new font variable**

In `finance-app/src/app/globals.css`, update any references:
```css
body {
  font-family: var(--font-inter);
}

h1, h2, h3 {
  font-family: var(--font-montserrat);
}
```

- [ ] **Step 3: Commit**

```bash
git add finance-app/src/app/layout.tsx finance-app/src/app/globals.css
git commit -m "feat: consolidate Google Fonts with swap display strategy"
```

---

### Task 14: Create next.config.js with Optimizations

**Files:**
- Create: `finance-app/next.config.js` (if not exists)

**Interfaces:**
- Produces: Next.js config with tree-shaking, compression, image optimization

**Steps:**

- [ ] **Step 1: Create next.config.js**

Create `finance-app/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable SWC minification (default, but explicit)
  swcMinify: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Compression
  compress: true,

  // Experimental: optimized font loading
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'react-icons',
      'recharts',
    ],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Add bundle-analyzer dev script (optional)**

Modify `finance-app/package.json`:
```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    // ... other scripts
  },
  "devDependencies": {
    "@next/bundle-analyzer": "latest",
    // ... other deps
  }
}
```

- [ ] **Step 3: Create .babelrc for bundle analysis (optional)**

Create `finance-app/.babelrc` (if using bundle analyzer):
```json
{
  "presets": ["next/babel"]
}
```

- [ ] **Step 4: Commit**

```bash
git add finance-app/next.config.js finance-app/package.json
git commit -m "feat: add next.config.js with optimization flags"
```

---

## Phase 6: Vercel Deployment

### Task 15: Create vercel.json with Cache Headers

**Files:**
- Create: `finance-app/vercel.json`
- Create: `main-dashboard/vercel.json`

**Interfaces:**
- Produces: Vercel deployment config with cache headers

**Steps:**

- [ ] **Step 1: Create finance-app vercel.json**

Create `finance-app/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=60, stale-while-revalidate=120"
        }
      ]
    },
    {
      "source": "/_next/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/:path*"
    }
  ]
}
```

- [ ] **Step 2: Create main-dashboard vercel.json**

Create `main-dashboard/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/_next/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add finance-app/vercel.json main-dashboard/vercel.json
git commit -m "feat: add vercel.json with edge cache headers"
```

---

### Task 16: Deploy to Vercel & Monitor Performance

**Files:**
- No new files (use existing Vercel deployment)

**Interfaces:**
- Consumes: All previous optimizations
- Produces: Deployed app on Vercel with Analytics enabled

**Steps:**

- [ ] **Step 1: Push to git (if not already)**

```bash
git status
git push origin main
```

- [ ] **Step 2: Deploy to Vercel**

Option A: Using Vercel dashboard → Import git repo → Deploy
Option B: Using Vercel CLI:
```bash
npm install -g vercel
cd finance-app
vercel deploy --prod
```

Expected output: Deployment URL (e.g., `https://finance-app-abc123.vercel.app`)

- [ ] **Step 3: Enable Vercel Analytics**

In Vercel dashboard:
1. Go to Project Settings → Analytics
2. Enable "Web Analytics"
3. Wait 24-48 hours for data collection

- [ ] **Step 4: Run Lighthouse audit**

Using Chrome DevTools:
1. Open deployed app in Chrome
2. Right-click → Inspect → Lighthouse tab
3. Run "Performance" audit
4. Check metrics:
   - FCP (First Contentful Paint): target < 2s
   - LCP (Largest Contentful Paint): target < 2.5s
   - CLS (Cumulative Layout Shift): target < 0.1

Expected: 50% improvement from baseline

- [ ] **Step 5: Test page transitions**

1. Navigate between pages (Dashboard → Accounts → Transactions)
2. Verify perceived speed improvement (target < 1s)
3. Check Network tab: page size should be smaller due to code splitting

- [ ] **Step 6: Verify cache headers**

Using curl:
```bash
curl -I https://your-finance-app.vercel.app/
# Check response headers for:
# cache-control: public, ...
# age: (should increase on repeated requests)
```

- [ ] **Step 7: Commit final deployment notes**

```bash
git add .
git commit -m "feat: complete performance optimization - deployed to Vercel"
```

---

## Success Validation

After all tasks complete, verify:

- [ ] **Dashboard FCP**: < 2s (Lighthouse)
- [ ] **Navigation lag**: < 1s perceived (manual test)
- [ ] **All pages**: consistent load time (no 10s outliers)
- [ ] **Error handling**: fallback UI shows on API timeout (manual 3s delay test)
- [ ] **Vercel Analytics**: showing metrics (after 24-48h)
- [ ] **Core Web Vitals**: all green (FCP, LCP, CLS)
- [ ] **Zero errors**: Check Vercel error logs for crashes

---

## Rollback Plan

If performance regresses:
1. Revert latest commits: `git revert <commit-hash>`
2. Re-deploy to Vercel
3. Check Vercel logs for errors
4. Investigate specific slow pages with Lighthouse

---

## Notes for Implementer

- Use `npm run dev` to test locally before Vercel deployment
- Skeleton components should match real component proportions for smooth UX
- Test on both desktop + mobile via DevTools device emulation
- Monitor Network tab to verify ISR revalidation happens in background
- After 5+ requests within same 5-min window, responses should show `cache-control: hit` or `age` header
