# Refactor Category Selection and Nominal Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Telegram bot to use session-based state for category selection and nominal input, removing the need for "Informasi Sistem" footers in force replies.

**Architecture:** 
1. Update `AWAITING_CATEGORY` handler to store `categoryId` in `SESSION_CACHE` and transition to `AWAITING_NOMINAL`.
2. Modify the `forceReplyMessage` for nominal input to remove the system footer.
3. Update the message handler to check `SESSION_CACHE` for `AWAITING_NOMINAL` step and process the transaction using session data.
4. Ensure `SESSION_CACHE.delete(chatId)` is called after successful transaction or cancellation.

**Tech Stack:** TypeScript, Deno, Supabase, Telegram Bot API

---

### Task 1: Update AWAITING_CATEGORY logic

**Files:**
- Modify: `telegram-bot/kode-telegram-bot.ts`

- [ ] **Step 1: Update the AWAITING_CATEGORY handler**
Update the logic to store `categoryId`, update `step` to `AWAITING_NOMINAL`, and send a clean `forceReplyMessage`.

```typescript
// Find this block in telegram-bot/kode-telegram-bot.ts
            if (session?.step === 'AWAITING_CATEGORY') {
                const { data: categories } = await supabase.from("categories").select("id, name").eq("type", session.type);
                const cat = categories?.find((c: any) => text.includes(c.name));

                if (!cat) {
                    await sendMessage(chatId, "⚠️ Kategori tidak valid.");
                    return new Response("OK");
                }

                // CHANGE STARTS HERE
                session.categoryId = cat.id;
                session.step = 'AWAITING_NOMINAL';
                SESSION_CACHE.set(chatId, session);

                const w = session.type === "expense" ? "📉 Pengeluaran" : "📈 Pemasukan";

                await forceReplyMessage(chatId,
                    `${w}\n${"─".repeat(28)}\n\n✅ Sumber dana & kategori sudah dipilih!\n\n📋 *Langkah 3 dari 3 — Input Nominal*\n\n👉 *Balas pesan ini* dengan format:\n\`[NOMINAL] [KETERANGAN]\`\n\n📌 Contoh:\n• \`50000 Makan siang\`\n• \`150000 Belanja\`\n\n⚠️ _Nominal tanpa titik/koma, hanya angka_`
                );
                // REMOVED: SESSION_CACHE.delete(chatId);
                return new Response("OK");
            }
```

- [ ] **Step 2: Commit changes**

```bash
git add telegram-bot/kode-telegram-bot.ts
git commit -m "feat(bot): update category selection to use session and transition to nominal input"
```

### Task 2: Implement AWAITING_NOMINAL handler

**Files:**
- Modify: `telegram-bot/kode-telegram-bot.ts`

- [ ] **Step 1: Add AWAITING_NOMINAL step handler**
Insert the handler before the existing `force_reply` logic to catch session-based nominal input.

```typescript
// Find the block: if (session?.step === 'AWAITING_CATEGORY') { ... }
// Add this AFTER it:

            if (session?.step === 'AWAITING_NOMINAL') {
                const inputParts = text.split(" ");
                const amount = parseInt(inputParts[0].replace(/[^0-9]/g, ''));

                if (isNaN(amount) || amount <= 0) {
                    await sendMessage(chatId, "❌ *Format Salah!*\n\nNominal harus berupa angka.\nContoh yang benar: `50000 Makan siang``);
                    return new Response("OK");
                }

                const loadingMsgId = await sendMessage(chatId, "📡 _Menghubungi server FinanceMy... Mohon tunggu sebentar._");

                const [accRes, catRes] = await Promise.all([
                    supabase.from("accounts").select("id, name, balance").eq("id", session.accountId).single(),
                    supabase.from("categories").select("id, name").eq("id", session.categoryId).single()
                ]);

                const accData = accRes.data;
                const catData = catRes.data;

                if (!accData || !catData) {
                    if (loadingMsgId) await deleteMessage(chatId, loadingMsgId);
                    SESSION_CACHE.delete(chatId);
                    await showInlineKeyboard(chatId,
                        "❌ *Sesi sudah berakhir.*\nSilakan mulai kembali dari Menu Utama.",
                        [[{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]]
                    );
                    return new Response("OK");
                }

                const description = inputParts.slice(1).join(" ").trim() || catData.name;
                const dtNow = new Date().toISOString();
                const parseType = session.type;
                const prevBal = parseFloat(accData.balance || "0");
                const newBal = parseType === "income" ? prevBal + amount : prevBal - amount;
                const newTrxId = generateUUID();

                await supabase.from("accounts").update({ balance: newBal }).eq("id", accData.id);
                const { error } = await supabase.from("transactions").insert({
                    id: newTrxId, type: parseType, amount, description, source: "telegram",
                    account_id: accData.id, category_id: catData.id,
                    date: dtNow, created_at: dtNow, updated_at: dtNow
                });

                if (error) {
                    if (loadingMsgId) await deleteMessage(chatId, loadingMsgId);
                    await sendMessage(chatId, `❌ *Gagal menyimpan ke database:*\n\`${error.message}\``);
                } else {
                    SESSION_CACHE.delete(chatId);
                    const icon = parseType === "expense" ? "💸" : "💰";
                    const label = parseType === "expense" ? "PENGELUARAN" : "PEMASUKAN";
                    const balDir = parseType === "expense" ? "Berkurang" : "Bertambah";

                    if (loadingMsgId) await deleteMessage(chatId, loadingMsgId);
                    // No need to delete reply_to_message here if we don't have its ID easily or if it's not crucial

                    await showInlineKeyboard(chatId,
                        `${icon} *TRANSAKSI BERHASIL DICATAT!*\n${DLINE}\n\n📋 *Detail Transaksi:*\n   Jenis    : *${label}*\n   Jumlah   : *${formatRupiah(amount)}*\n   Rekening : ${accData.name}\n   Kategori : ${catData.name}\n   Ket      : ${description}\n\n${LINE}\n💳 *Rekening ${accData.name}:*\n   Sebelum  : ${formatRupiah(getUsableBalance({ name: accData.name, balance: prevBal }))}\n   ${balDir}: ${formatRupiah(amount)}\n   *Sesudah  : ${formatRupiah(getUsableBalance({ name: accData.name, balance: newBal }))}*\n\n📅 ${formatTanggalPendek()} · ⏰ ${formatJam()} WIB`,
                        [
                            [{ text: "📎 Lampirkan Bukti Foto (Opsional)", callback_data: `ATTACH_RECEIPT#${newTrxId}` }]
                        ]
                    );
                }
                return new Response("OK");
            }
```

- [ ] **Step 2: Commit changes**

```bash
git add telegram-bot/kode-telegram-bot.ts
git commit -m "feat(bot): implement session-based nominal input handler"
```

### Task 3: Cleanup and Final Checks

**Files:**
- Modify: `telegram-bot/kode-telegram-bot.ts`

- [ ] **Step 1: Ensure "Batalkan" clears session**
Verify that "Batalkan" and other main menu triggers clear the session.

```typescript
// Find this block:
            const startTriggers = ["/start", "/menu", "halo", "hai", "hello", "hi", "menu", "start", "/help"];
            if (startTriggers.some(t => text.toLowerCase() === t) || text === "🏠 Beranda" || text === "❌ Batalkan") {
                SESSION_CACHE.delete(chatId);
                await showMainMenu(chatId, userId);
                return new Response("OK");
            }
```
It already exists, so no changes needed here unless it's missing "❌ Batalkan".

- [ ] **Step 2: (Optional) Cleanup legacy nominal input handler**
The legacy handler in `if (data.message.reply_to_message?.text)` can be kept for backward compatibility or removed if certain that all flows are now session-based. The task requested removing the dependency on parsing the footer, which we've done by adding the session-based handler first.

- [ ] **Step 3: Commit final changes**

```bash
git add telegram-bot/kode-telegram-bot.ts
git commit -m "refactor(bot): finalize session-based transaction flow"
```
