# Performance Optimization Design
**Date:** 2026-09-02  
**Status:** Approved  
**Scope:** Next.js page navigation speed + data sync reliability

## Problem Statement
Finance app experiences slow page loads (both initial + navigation) across 40+ pages. Current implementation uses `force-dynamic` + `revalidate: 0` (no caching), causing 9 parallel data fetches on every request.

## Goals
1. **Reduce navigation lag** - perceivably fast transitions between pages
2. **Consistent performance** - all pages load uniformly (no slow outliers)
3. **Data reliability** - sync with database/API quickly, handle failures gracefully
4. **Vercel-ready** - leverage platform features for global edge caching

## Architecture

### 1. Caching Strategy
**Server-Side Revalidation:**
- Remove `force-dynamic` from all pages
- Dashboard + high-traffic pages: `revalidate: 300` (5 minutes)
- Lower-traffic pages (reports, settings): `revalidate: 600` (10 minutes)
- ISR (Incremental Static Regeneration) for background refresh

**On-Demand Invalidation:**
- When user submits form (create/update/delete), call `revalidateTag('financial-data')`
- Data fetching functions tagged with `unstable_cache()` or explicit cache tags
- Pattern: tag by data type (summary, transactions, budgets, etc)

**Fallback Handling:**
- Existing `safeFetch()` wrapper: keep fallback objects
- Timeout: 3 seconds per API/DB call
- Return stale data or fallback if timeout exceeded
- Client-side error boundary shows "Refresh" button for manual sync

### 2. Streaming & Progressive Rendering
**Layout Structure:**
- Root layout: providers only (no data fetching)
- Main layout: load `GlobalSummary` in Suspense boundary (critical, blocks page)
- Page: wrap non-critical components in Suspense (charts, tables, modals)
- Add `loading.tsx` for route transitions (skeleton loaders)

**Streaming Sequence:**
1. HTML shell renders immediately
2. Summary data streams (critical)
3. Charts + tables + chat widget stream in parallel (non-critical)
4. Client hydration happens in background

**Benefits:**
- Perceived load time drops 40-50%
- FCP (First Contentful Paint) improves dramatically
- LCP (Largest Contentful Paint) within Core Web Vitals

### 3. Client-Side Optimizations
**Component Memoization:**
- `React.memo()` for sidebar, navigation, static components
- `useCallback()` for event handlers (prevent child re-renders)
- Avoid inline objects/functions in props

**Code Splitting:**
- Lazy load chart libraries (recharts, etc) at page level
- Lazy load modals, dialogs, heavy feature components
- Dynamic imports with `next/dynamic` for below-fold content

**Navigation Optimization:**
- Replace standard `<a>` with `<Link prefetch="intent">`
- Prefetch triggered on link hover/visibility
- Reduces perceived latency on next page load

**Layout Restructuring:**
- Move `BottomNav` from root layout to client component in mobile layout only
- Prevents re-render on every page transition
- Conditional render based on route group

### 4. Asset Optimization
**Font Loading:**
- Consolidate to single `next/font/google` import in root
- Remove inline `<link>` tags for Inter + Material Symbols
- Use `display: swap` for all Google Fonts
- Subset to `latin` only (reduce payload)
- Load only weights used: 400, 500, 600, 700

**Build Optimization:**
- Enable tree-shaking in `next.config.js`
- Run bundle analyzer (`@next/bundle-analyzer`) post-deploy
- Identify and remove unused dependencies

### 5. Error Handling & Resilience
**Timeout & Fallback:**
- Each `safeFetch()` call: 3-second timeout
- If timeout: return fallback object
- UI shows loading skeleton until timeout, then fallback data

**Manual Refresh:**
- Add refresh button in page header (client component)
- onClick: call `revalidateTag()` + client-side refetch
- Shows toast notification: "Data refreshed" or error message

**Graceful Degradation:**
- Partial data OK (e.g., transactions load but budget fails)
- Don't block entire page on single API failure
- Show error card for failed section, rest of page functional

### 6. Vercel Deployment
**Edge Caching:**
- Vercel automatically caches `revalidate` intervals at edge
- Global CDN serves cached responses from nearest region
- Cache revalidation happens in background (stale-while-revalidate)

**Headers Configuration (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, s-maxage=60, stale-while-revalidate=120" }
      ]
    }
  ]
}
```

**Monitoring:**
- Enable Vercel Analytics for Core Web Vitals tracking
- Monitor FCP, LCP, CLS, TTFB
- Set baseline: current slow metrics → target 50% improvement

## Implementation Scope
- **Files to modify:** 15-20 (pages, layouts, components, config)
- **New files:** `loading.tsx` files, cache tag utilities
- **Dependencies:** No new packages (use built-in Next.js features)
- **Testing:** Manual Lighthouse audit + Vercel Analytics

## Success Criteria
- Dashboard FCP: < 2s (from current ~5-8s)
- Navigation between pages: < 1s (from current ~2-4s)
- Zero 404/timeout errors on Vercel
- Core Web Vitals: all green (FCP, LCP, CLS)

## Timeline
- Phase 1: Caching + revalidation setup (2-3 days)
- Phase 2: Streaming + Suspense boundaries (2-3 days)
- Phase 3: Client-side optimizations (2 days)
- Phase 4: Asset optimization + testing (2 days)
- Phase 5: Vercel deployment + monitoring (1 day)
