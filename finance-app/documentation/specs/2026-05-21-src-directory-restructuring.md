# Design Spec: Folder Restructuring (Finance App)

**Date:** 2026-05-21
**Topic:** Moving core application code to a `src` directory to improve organization and import clarity.

## 1. Goal
Reorganize the `finance-app` directory structure by moving all source code into a `src/` directory. This aligns with Next.js best practices and provides a cleaner separation between application code and configuration files. It also simplifies the use of the `@/` import alias.

## 2. Proposed Changes

### 2.1 File & Directory Moves
The following directories and files will be moved from the root of `finance-app/` to `finance-app/src/`:

| Original Path | New Path |
|---------------|----------|
| `actions/` | `src/actions/` |
| `app/` | `src/app/` |
| `components/` | `src/components/` |
| `contexts/` | `src/contexts/` |
| `db/` | `src/db/` |
| `hooks/` | `src/hooks/` |
| `lib/` | `src/lib/` |
| `middleware.ts` | `src/middleware.ts` |

**Items staying in the root:**
- `public/` (Required by Next.js)
- `node_modules/`
- `scripts/`
- `documentation/`
- `drizzle/` (Migration files)
- Configuration files (`package.json`, `tsconfig.json`, `next.config.ts`, `drizzle.config.ts`, `.env`, etc.)

### 2.2 Configuration Updates

#### `tsconfig.json`
Update the `paths` configuration to point the `@/*` alias to the `src` folder.
```json
"paths": {
  "@/*": ["./src/*"]
}
```

#### `drizzle.config.ts`
Update the `schema` path.
```typescript
schema: './src/db/schema/*',
```

#### `eslint.config.mjs` (if necessary)
Review any path-based rules.

### 2.3 Import Path Verification
After moving the files, we need to ensure that internal imports still work. Since most imports likely use `@/`, updating `tsconfig.json` should handle the majority of cases. However, relative imports that cross the new `src` boundary may need adjustment.

## 3. Implementation Plan Summary
1. Create the `src` directory.
2. Move directories and files sequentially.
3. Update configuration files (`tsconfig.json`, `drizzle.config.ts`).
4. Run `npm run dev` and `npm run lint` to verify stability.
5. Check for any broken relative imports in `scripts/` that might reference moved folders.

## 4. Risks & Mitigations
- **Risk:** Broken relative imports in `scripts/` or `drizzle/` migrations.
  - **Mitigation:** Manually verify and update relative paths in root-level scripts.
- **Risk:** Next.js failing to find the `app` or `middleware` file.
  - **Mitigation:** Verify Next.js documentation for `src` directory support (it is natively supported).
