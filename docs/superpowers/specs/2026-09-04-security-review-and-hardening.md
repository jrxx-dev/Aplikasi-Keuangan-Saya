# Security Review + Hardening — FinanceMy

Tanggal: 2026-09-04
Branch: `security/harden-webhook-ssrf-tls-logs`
Basis: setelah PR #1 (`efe0350`)

## Temuan & status

| ID | Severity | Temuan | Status |
|----|----------|--------|--------|
| CRIT-01 | Critical | `/api/telegram` tanpa autentikasi webhook → forge update + account takeover via `/start <userId>` | **Fixed (parsial)** |
| HIGH-02 | High | SSRF di `fetchLinkMetadata` (scraper Planner) — `fetch(url)` tanpa validasi | **Fixed** |
| HIGH-03 | High | `NODE_TLS_REJECT_UNAUTHORIZED=0` mematikan verifikasi TLS seluruh proses | **Fixed (kode); user hapus di Vercel)** |
| MED-04 | Medium | `/logs` + `getAllLogs()` bocor log semua user ke user biasa | **Fixed** |
| MED-05 | Medium | Fungsi info `developer.ts` (`getEnvironmentInfo`, dll) tidak di-gate | **Fixed** |
| MED-06 | Medium | `/api/log-error` write DB tanpa auth (log flooding) | **Fixed** |
| LOW-07 | Low | `/api/resolve-log` IDOR (resolve log siapa saja) | **Fixed** |
| LOW-08 | Low | Registrasi terbuka + password 1 karakter | **Fixed (min 8); signup toggle = user)** |

## Detail perubahan

### CRIT-01 — `src/app/api/telegram/route.ts`
- Wajib header `x-telegram-bot-api-secret-token` = `TELEGRAM_WEBHOOK_SECRET`. Tanpa env → 503; tidak cocok → 403. Mematikan semua request webhook palsu.
- Pairing `/start <userId>`: validasi format UUID; tolak kalau akun sudah terhubung ke chat lain; tolak kalau chat sudah terhubung ke akun lain.
- **Sisa (follow-up)**: ganti `userId` mentah di deep link dengan pairing code acak sekali-pakai + expiry (butuh kolom baru di `user_settings`). Belum dikerjakan supaya tidak butuh migrasi DB.

### HIGH-02 — `src/lib/actions/scraper.ts`
- Wajib login.
- `assertPublicUrl()`: hanya http/https; tolak host yang resolve ke `10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16` (metadata cloud), `100.64/10`, loopback/ULA/link-local IPv6, `localhost`, `*.local`, `*.internal`.
- Redirect di-follow manual, tiap hop divalidasi ulang (maks 5).
- Timeout 12s, cap body 3MB, cek `content-type`, error tidak lagi bocor `error.message`.

### HIGH-03 — `.env.example`, `add-env-vars.sh`, `src/db/index.ts`, `.env` (lokal)
- `NODE_TLS_REJECT_UNAUTHORIZED` dihapus dari `.env`, `.env.example`, `add-env-vars.sh`.
- `db/index.ts`: strip `sslmode` dari URL; pakai CA Supabase kalau ada (`certs/supabase-ca.crt` atau env `SUPABASE_CA_CERT`) → `rejectUnauthorized: true`; kalau tidak ada → tetap konek + `console.warn` (tidak memblokir deploy).
- **Aksi user**: `vercel env rm NODE_TLS_REJECT_UNAUTHORIZED production`. Opsional: download CA dari Supabase Dashboard → Settings → Database → SSL, taruh di `finance-app/certs/supabase-ca.crt`.

### MED-04 — `src/app/(main)/logs/page.tsx`
Redirect ke `/dashboard` kalau `role !== "superadmin"`.

### MED-05 — `src/lib/actions/developer.ts`
`await requireAdmin()` ditambahkan ke `testDatabaseConnection`, `testAuthAPI`, `performHealthCheck`, `clearServerCache`, `getEnvironmentInfo`, `getCacheStats`.

### MED-06 — `src/app/api/log-error/route.ts`
Wajib session (kalau tidak → 200 tanpa nulis). Whitelist `level`, clip `action`/`message`/`userAgent`, batasi `metadata` 4KB.

### LOW-07 — `src/app/api/resolve-log/route.ts`
Wajib `role === "superadmin"` (403).

### LOW-08 — `src/app/sign-up/page.tsx` + `settings-page-client.tsx`
- Password min 8.
- Tab Settings `users`/`system`/`roles`/`developer` disembunyikan dari non-superadmin (server action sudah di-gate; ini kosmetik).
- **Kalau app memang personal**: matikan signup di Supabase (Auth → Providers → Email → disable "Enable sign-ups"), buat user manual.

## Belum di scope
- Pairing code Telegram sekali-pakai (butuh migrasi `user_settings`).
- Supabase RLS sebagai jaring pengaman lapis DB (semua isolasi masih di layer app).
- `src/app/api/auth/[...all]/route.ts` — `toNextJsHandler` di objek shim Supabase (bukan better-auth). Dead/error saat di-hit. Aman dihapus, belum dilakukan.
- Rate limiting umum (login, chat, telegram, scraper).

## WhatsApp bot
`whatsapp-web.js` TIDAK cocok dengan Vercel (butuh proses hidup terus + headless Chromium + disk persisten). Pilihan: WhatsApp Business Cloud API (webhook, resmi, jalan di Vercel) ATAU jalankan `whatsapp-web.js` di host terpisah 24/7 yang memanggil API app. Apa pun pilihannya: endpoint bot butuh shared secret (pola CRIT-01) + pairing pakai token acak, bukan `userId` mentah.
