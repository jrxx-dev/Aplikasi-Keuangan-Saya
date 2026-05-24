# Finance App `src` Directory Restructuring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the `finance-app` directory structure by moving all core application code into a `src/` directory for better organization and adherence to Next.js best practices.

**Architecture:** We will move core directories (`app`, `components`, `actions`, `contexts`, `db`, `hooks`, `lib`) and `middleware.ts` into a new `src` folder. Configuration files (`tsconfig.json`, `drizzle.config.ts`) will be updated to reflect the new paths.

**Tech Stack:** Next.js 15, TypeScript, Drizzle ORM.

---

### Task 1: Create `src` Directory and Move Core Folders

**Files:**
- Create: `finance-app/src/`
- Move: `finance-app/actions/`, `finance-app/app/`, `finance-app/components/`, `finance-app/contexts/`, `finance-app/db/`, `finance-app/hooks/`, `finance-app/lib/`, `finance-app/middleware.ts`

- [ ] **Step 1: Create the `src` directory**

Run: `mkdir -p finance-app/src`

- [ ] **Step 2: Move the directories and middleware file**

Run (PowerShell):
```powershell
Move-Item finance-app/actions finance-app/src/
Move-Item finance-app/app finance-app/src/
Move-Item finance-app/components finance-app/src/
Move-Item finance-app/contexts finance-app/src/
Move-Item finance-app/db finance-app/src/
Move-Item finance-app/hooks finance-app/src/
Move-Item finance-app/lib finance-app/src/
Move-Item finance-app/middleware.ts finance-app/src/
```

- [ ] **Step 3: Verify the moves**

Run: `ls finance-app/src`
Expected: `actions`, `app`, `components`, `contexts`, `db`, `hooks`, `lib`, `middleware.ts` are present.

### Task 2: Update Configuration Files

**Files:**
- Modify: `finance-app/tsconfig.json`
- Modify: `finance-app/drizzle.config.ts`

- [ ] **Step 1: Update `tsconfig.json` paths**

Modify `finance-app/tsconfig.json`:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 2: Update `drizzle.config.ts` schema path**

Modify `finance-app/drizzle.config.ts`:
```typescript
export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema/*',
    // ... rest
});
```

- [ ] **Step 3: Commit configuration changes**

Run: `git add finance-app/tsconfig.json finance-app/drizzle.config.ts`
Run: `git commit -m "chore: update config paths for src directory restructuring"`

### Task 3: Verification and Cleanup

**Files:**
- Test: Run development server and linting.

- [ ] **Step 1: Run Next.js linting**

Run: `cd finance-app && npm run lint`
Expected: Success (no new errors related to missing modules).

- [ ] **Step 2: Run development server**

Run: `cd finance-app && npm run dev` (briefly, then stop)
Expected: Server starts without "module not found" errors for basic app structure.

- [ ] **Step 3: Run Drizzle Kit check**

Run: `cd finance-app && npx drizzle-kit check`
Expected: Success (it can find the schema in the new location).

- [ ] **Step 4: Final commit for file moves**

Run: `git add finance-app/src`
Run: `git commit -m "refactor: move core application code to src directory"`
