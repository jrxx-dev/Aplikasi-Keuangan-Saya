// =============================================================================
// FinanceMy Ultimate Telegram Bot - v5.0 Premium UI Edition
// =============================================================================
// @ts-ignore - Supabase Edge Function uses Deno imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore - Supabase Edge Function uses Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Deklarasi global Deno agar TS tidak komplain
declare const Deno: any;

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_TOKEN") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
// Service role key untuk upload ke Supabase Storage (bypass RLS)
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);
// Client khusus storage dengan service key (agar bisa upload dari Edge Function)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);
const DEFAULT_ACCOUNT_ID = "56880bcf-481a-4646-a038-5daa2381b4d1";
let GLOBAL_USER_ID = "";
const UNDO_CACHE = new Map<string, any>();
const SESSION_CACHE = new Map<number, any>();

// ======================== HELPERS ========================
function getWIBDate(): Date {
    return new Date(Date.now() + 7 * 3600 * 1000); // Geser jam ke WIB (UTC+7)
}
function getWIBFirstDay(): string {
    const d = getWIBDate();
    // Kembalikan waktu murni UTC yang mencerminkan jam 00:00:00 WIB di tanggal 1.
    // 00:00 WIB = 17:00 UTC di hari sebelumnya (karena WIB adalah UTC+7).
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, -7, 0, 0, 0)).toISOString();
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function formatRupiah(n: number | string): string {
    const num = parseInt(String(n));
    return "Rp\u00A0" + (isNaN(num) ? "0" : num.toLocaleString("id-ID"));
}
function getUsableBalance(acc: any): number {
    const bal = parseFloat(String(acc.balance || "0"));
    if (acc.name && acc.name.toLowerCase().includes("bri")) {
        return Math.max(0, bal - 50000);
    }
    return bal;
}
function shortId(uuid: string): string { return uuid.split('-')[0]; }

// Format tanggal ke Indonesia (singkat)
function formatTanggal(dateStr?: string): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTanggalPendek(dateStr?: string): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// Format jam WIB
function formatJam(): string {
    return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}

// Garis pembatas
const LINE = "─".repeat(30);   // divider tipis
const DLINE = "═".repeat(30);   // divider tebal

// Progress bar visual (10 blok)
function progressBar(pct: number, length = 10): string {
    const clamped = Math.max(0, Math.min(100, pct));
    const filled = Math.round((clamped / 100) * length);
    return "█".repeat(filled) + "░".repeat(length - filled);
}

// Persentase label
function pctLabel(val: number, total: number): string {
    if (total <= 0) return "0%";
    return ((val / total) * 100).toFixed(1) + "%";
}

// Status keuangan berwarna
function healthBadge(savingRate: number): string {
    if (savingRate >= 30) return "🟢 SEHAT — Luar Biasa!";
    if (savingRate >= 15) return "🟡 CUKUP — Perlu Ditingkatkan";
    if (savingRate >= 0) return "� TIPIS — Perhatikan Pengeluaran";
    return "🔴 DEFISIT — Pengeluaran Melebihi Pemasukan!";
}

// Tipe ikon akun
function accIcon(type: string): string {
    if (type === "bank") return "🏦";
    if (type === "wallet") return "📱";
    return "💵";
}

// Tipe label transaksi
function trxLabel(type: string): { icon: string; label: string } {
    return type === "expense"
        ? { icon: "💸", label: "PENGELUARAN" }
        : { icon: "💰", label: "PEMASUKAN" };
}

// ======================== UPLOAD BUKTI FOTO KE SUPABASE STORAGE ========================
async function uploadReceiptPhoto(telegramFileId: string, transactionId: string): Promise<string | null> {
    try {
        // 1. Ambil path file dari Telegram
        const fileResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${telegramFileId}`);
        const fileData: any = await fileResp.json();
        if (!fileData.ok) return null;

        // 2. Download byte foto dari Telegram
        const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileData.result.file_path}`;
        const photoResp = await fetch(photoUrl);
        if (!photoResp.ok) return null;
        const photoBytes = await photoResp.arrayBuffer();

        // 3. Upload ke Supabase Storage bucket "receipts"
        const fileName = `receipts/${transactionId}.jpg`;
        const { error } = await supabaseAdmin.storage
            .from("receipts")
            .upload(fileName, photoBytes, { contentType: "image/jpeg", upsert: true });

        if (error) { console.error("Storage upload error:", error); return null; }

        // 4. Ambil public URL
        const { data: urlData } = supabaseAdmin.storage
            .from("receipts")
            .getPublicUrl(fileName);

        return urlData?.publicUrl || null;
    } catch (e) {
        console.error("uploadReceiptPhoto error:", e);
        return null;
    }
}

// ======================== OCR FOTO STRUK ========================
async function ocrStruk(photoUrl: string): Promise<{ amount: number; desc: string; items?: string } | null> {
    try {
        const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-image",
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: "Baca struk belanjaan ini. Deteksi: (1) TOTAL HARGA AKHIR, (2) NAMA TOKO/MERCHANT, (3) maksimal 3 item barang paling mahal.\n\nBalas HANYA dengan format JSON yang valid seperti ini (tidak ada teks lain):\n{\"total\":45000,\"toko\":\"Indomaret\",\"items\":\"Aqua 600ml, Roti Tawar, Indomie Goreng\"}\n\nJika bukan struk: {\"total\":0,\"toko\":\"Tidak Dikenal\",\"items\":\"\"}" },
                        { type: "image_url", image_url: { url: photoUrl } }
                    ]
                }]
            })
        });
        const result: any = await r.json();
        const raw = result.choices?.[0]?.message?.content?.trim() || "{}";
        // Coba parse JSON
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.total || parsed.total <= 0) return null;
        return { amount: parseInt(parsed.total), desc: parsed.toko || "Belanja Struk", items: parsed.items || "" };
    } catch { return null; }
}

// ======================== AI FINANCIAL ADVISOR ========================
async function askAIFinancial(chatId: number, question: string, userId: string) {
    // Kumpul data keuangan untuk konteks AI
    const now = getWIBDate();
    const firstDay = getWIBFirstDay();

    // Tarik data secara paralel tapi pastikan transaksi hanya milik akun user terkait
    const accRes = await supabase.from("accounts").select("id, name, balance, type").eq("user_id", userId);
    const accs = accRes.data || [];
    const accIds = accs.map((a: any) => a.id);

    const txsRes = await supabase.from("transactions").select("amount, type, description").in("account_id", accIds).gte("date", firstDay).limit(50);
    const txs = txsRes.data;

    let totalBal = 0;
    const accLines: string[] = [];
    accs?.forEach((a: any) => {
        const bal = getUsableBalance(a);
        totalBal += bal;
        let ext = "";
        if (a.name.toLowerCase().includes("bri")) ext = " (dipotong 50rb tertahan)";
        accLines.push(`  • ${a.name} [${a.type}]: ${formatRupiah(bal)}${ext}`);
    });

    let inc = 0, exp = 0, totalTrx = 0;
    const topExp: Record<string, number> = {};
    txs?.forEach((t: any) => {
        totalTrx++;
        const amt = parseFloat(t.amount);
        if (t.type === "income") inc += amt;
        else if (t.type === "expense") {
            exp += amt;
            const key = t.description || "Lainnya";
            topExp[key] = (topExp[key] || 0) + amt;
        }
    });

    const savingRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
    const topExpSorted = Object.entries(topExp).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topExpText = topExpSorted.map(([k, v]) => `  • ${k}: ${formatRupiah(v)}`).join("\n");
    const bulan = now.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }); // because now is WIB-shifted
    const hariKe = now.getUTCDate();
    const totalHari = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    const daysLeft = totalHari - hariKe;
    const expPerHari = hariKe > 0 ? exp / hariKe : 0;
    const proyeksiExp = expPerHari * totalHari;

    await sendMessage(chatId,
        `🤖 *FinanceAI sedang menganalisis keuangan Anda…*\n🔍 _Membaca ${totalTrx} transaksi bulan ${bulan}_`
    );

    const systemPrompt = `Kamu adalah "FinanceAI", asisten keuangan pribadi profesional yang cerdas, jujur, dan berbicara dalam bahasa Indonesia yang hangat dan lugas.

=== DATA KEUANGAN REAL-TIME (${bulan}) ===
Total Saldo Semua Akun: ${formatRupiah(totalBal)}
Rincian Akun:
${accLines.join("\n")}

Kinerja Bulan Ini (Hari ke-${hariKe} dari ${totalHari}):
  Pemasukan   : ${formatRupiah(inc)}
  Pengeluaran : ${formatRupiah(exp)}
  Sisa Bersih : ${formatRupiah(inc - exp)}
  Saving Rate : ${savingRate.toFixed(1)}%

Rata-rata pengeluaran/hari: ${formatRupiah(expPerHari)}
Proyeksi pengeluaran akhir bulan: ${formatRupiah(proyeksiExp)}
Sisa hari: ${daysLeft} hari

Top Pengeluaran Terbesar:
${topExpText || "  (Belum ada data pengeluaran)"}
========================================

CARA MENJAWAB:
1. Awali dengan emoji yang relevan
2. Gunakan *Bold* untuk angka dan poin penting
3. Berikan minimal 2 insight spesifik berdasarkan data nyata di atas
4. Tutup dengan 1 saran tindakan konkrit yang bisa dilakukan hari ini
5. Panjang jawaban: 5-8 baris, jangan terlalu pendek atau terlalu panjang
6. Jika kondisi keuangan buruk, tetap santun tapi jujur dan tegas`;

    try {
        const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-image",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ]
            })
        });
        const result: any = await r.json();
        const answer = result.choices?.[0]?.message?.content?.trim();

        if (answer) {
            await showInlineKeyboard(chatId,
                `🤖 *FinanceAI — Laporan Analisis Keuangan*
${DLINE}

${answer}

${LINE}
_📊 Data: ${bulan}  •  📅 ${formatTanggalPendek()}  •  ⏰ ${formatJam()} WIB_`,
                [
                    [{ text: "🔄 Tanya Topik Lain", callback_data: "MENU#ai" }],
                    [{ text: "📊 Lihat Laporan Bulanan", callback_data: "laporan_bulan_ini" }],
                    [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                ]
            );
        } else {
            await sendMessage(chatId, "❌ AI tidak bisa merespon saat ini. Silakan coba lagi dalam beberapa menit.");
        }
    } catch (e) {
        console.error("AI error:", e);
        await sendMessage(chatId, "❌ Koneksi ke server AI terputus. Periksa koneksi internet Anda.");
    }
}

// ======================== MAIN HANDLER ========================
serve(async (req: any) => {
    if (req.method !== "POST") return new Response("OK", { status: 200 });

    let cbId = "";
    let cbSuccess = true;

    try {
        const data = await req.json();

        // Siapkan cbID untuk ditangkap dan dibalas pada block finally
        if (data.callback_query?.id) {
            cbId = data.callback_query.id;
        }

        // 1. INFO LOADING (Typing action) - Muncul tulisan "bot is typing..." di bagian atas chat
        const chatIdLoading = data.message?.chat?.id || data.callback_query?.message?.chat?.id;
        if (chatIdLoading) {
            fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendChatAction`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatIdLoading, action: "typing" })
            }).catch(() => { }); // biarkan di background
        }

        // OPTIMASI: Cache userId agar tidak perlu query database tiap ada pesan masuk
        if (!GLOBAL_USER_ID) {
            const { data: defAcc } = await supabase.from("accounts").select("user_id").eq("id", DEFAULT_ACCOUNT_ID).single();
            GLOBAL_USER_ID = defAcc?.user_id || "";
        }
        const userId = GLOBAL_USER_ID;

        // ===================================================
        // FOTO → Bisa jadi: Bukti Transaksi ATAU OCR Struk
        // ===================================================
        if (data.message?.photo) {
            const chatId = data.message.chat.id;
            const photoArray = data.message.photo;
            const fileId = photoArray[photoArray.length - 1].file_id;
            const caption: string = data.message.caption || "";

            // --- CASE 1: Foto Bukti Transaksi ---
            // Deteksi dari: (a) reply ke pesan ATTACH_RECEIPT force_reply, atau (b) caption manual "BUKTI#..."
            const replyText: string = data.message.reply_to_message?.text || "";
            const replyReceiptMatch = replyText.match(/Informasi Sistem: attach_receipt \| ([a-f0-9\-]+)\)/);
            const captionBuktiMatch = caption.match(/BUKTI#([a-f0-9\-]+)/i);
            const buktiTrxId = replyReceiptMatch?.[1] || captionBuktiMatch?.[1] || null;

            if (buktiTrxId) {
                await sendMessage(chatId, `� *Mengunggah bukti foto ke cloud…*\n🔒 _Enkripsi & aman — mohon tunggu sebentar_`);

                const receiptUrl = await uploadReceiptPhoto(fileId, buktiTrxId);
                if (receiptUrl) {
                    await supabase.from("transactions")
                        .update({ receipt_url: receiptUrl, updated_at: new Date().toISOString() })
                        .eq("id", buktiTrxId);

                    await showInlineKeyboard(chatId,
                        `✅ *BUKTI FOTO BERHASIL TERSIMPAN!*\n${DLINE}\n\n� _Foto diunggah ke Supabase Storage._\n🔗 Tersedia di aplikasi FinanceMy\n📎 Tanda 📎 muncul di riwayat transaksi\n\n_ID: \`${buktiTrxId.substring(0, 8)}…\`_`,
                        [
                            [{ text: "📜 Lihat Riwayat", callback_data: "riwayat_trx" }],
                            [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                        ]
                    );
                } else {
                    await showInlineKeyboard(chatId,
                        `❌ *Gagal Upload Bukti Foto*\n${LINE}\n\nPenyebab kemungkinan:\n• Bucket 'receipts' belum dibuat di Supabase Storage\n• Secret SUPABASE_SERVICE_ROLE_KEY belum diset\n\n_Lihat file SETUP-BUKTI-FOTO.md_`,
                        [[{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]]
                    );
                }
                return new Response("OK");
            }

            // --- CASE 2: OCR Struk → Catat sebagai Pengeluaran ---
            await sendMessage(chatId,
                `📸 *Memindai Struk dengan AI…*\n${LINE}\n🔍 Mengirim ke Google Gemini Vision\n⏳ Mohon tunggu 3-5 detik…`
            );

            const fileResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`);
            const fileData: any = await fileResp.json();
            if (!fileData.ok) {
                await sendMessage(chatId, "❌ *Gagal mengambil gambar dari Telegram.*\nCoba kirim ulang foto tersebut.");
                return new Response("OK");
            }

            const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileData.result.file_path}`;
            const ocr = await ocrStruk(photoUrl);

            if (!ocr) {
                await showInlineKeyboard(chatId,
                    `❌ *AI Gagal Membaca Struk*\n${LINE}\n\n_Kemungkinan penyebab:_\n• Gambar terlalu buram atau gelap\n• Bukan foto struk belanjaan\n• Tulisan terlalu kecil/tidak jelas\n\n💡 *Tips:* Foto ulang dengan pencahayaan cukup dan kamera stabil.`,
                    [[{ text: "🔙 Kembali ke Menu Utama", callback_data: "BACK_MAIN" }]]
                );
                return new Response("OK");
            }

            const { data: accounts } = await supabase.from("accounts").select("id, name, type, balance").eq("user_id", userId);
            if (!accounts || accounts.length === 0) {
                await sendMessage(chatId, "❌ Belum ada akun/dompet. Tambahkan melalui aplikasi FinanceMy terlebih dahulu.");
                return new Response("OK");
            }

            const descEnc = encodeURIComponent(ocr.desc).substring(0, 40);
            const itemsText = ocr.items ? `\n🛒 _Item: ${ocr.items}_` : "";

            const accButtons = accounts.map((acc: any) => {
                const icon = acc.type === "bank" ? "🏦" : acc.type === "wallet" ? "📱" : "💵";
                return [{ text: `${icon} ${acc.name}  ·  Saldo ${formatRupiah(getUsableBalance(acc))}`, callback_data: `OCR_ACC#${shortId(acc.id)}#${ocr.amount}#${descEnc}` }];
            });

            await showInlineKeyboard(chatId,
                `✅ *STRUK BERHASIL DIBACA!*\n${DLINE}\n\n🏪 Merchant: *${ocr.desc}*\n💰 Total: *${formatRupiah(ocr.amount)}*${itemsText}\n📅 ${formatTanggalPendek()}\n\n${LINE}\n*Langkah 1\/2 — Pilih Sumber Dana:*\n👇 Dari rekening mana pembayarannya?`,
                [...accButtons, [{ text: "❌ Batalkan", callback_data: "CANCEL" }]]
            );
            return new Response("OK");
        }

        // ===================================================
        // PESAN TEKS
        // ===================================================
        if (data.message?.text) {
            const chatId = data.message.chat.id;
            const text = data.message.text.trim();

            const startTriggers = ["/start", "/menu", "halo", "hai", "hello", "hi", "menu", "start", "/help"];
            if (startTriggers.some(t => text.toLowerCase() === t) || text === "🏠 Beranda" || text === "❌ Batalkan") {
                SESSION_CACHE.delete(chatId);
                await showMainMenu(chatId, userId);
                return new Response("OK");
            }
            if (text === "🔄 Update DB") {
                SESSION_CACHE.delete(chatId);
                GLOBAL_USER_ID = "";
                UNDO_CACHE.clear();

                const pingId = await sendMessage(chatId, "🔄 _Menyinkronkan data dengan server..._");
                await showMainMenu(chatId, userId);
                if (pingId) await deleteMessage(chatId, pingId);
                return new Response("OK");
            }

            // AI Questions from Bottom Keyboard
            const aiQuestionMap: Record<string, string> = {
                "🏥 Analisis Kondisi Keuangan": "Analisis kondisi keuangan saya secara keseluruhan bulan ini. Sehatkah?",
                "💡 Tips Penghematan": "Berdasarkan data nyataku bulan ini, mana yang bisa ditekan?",
                "⚠️ Deteksi Pemborosan": "Apakah ada kategori yang saya terlalu berlebihan membelanjakan bulan ini?"
            };
            if (aiQuestionMap[text]) {
                await showMainMenu(chatId, userId);
                await askAIFinancial(chatId, aiQuestionMap[text], userId);
                return new Response("OK");
            }

            // --- SESSION-BASED KEYBOARD HANDLER ---
            const session = SESSION_CACHE.get(chatId);

            if (session?.step === 'AWAITING_ACCOUNT') {
                const { data: accounts } = await supabase.from("accounts").select("id, name").eq("user_id", userId);
                const acc = accounts?.find((a: any) => text.includes(a.name));

                if (!acc) {
                    await sendMessage(chatId, "⚠️ Rekening tidak valid. Mulai ulang transaksi.");
                    SESSION_CACHE.delete(chatId);
                    return new Response("OK");
                }

                session.accountId = acc.id;
                session.step = 'AWAITING_CATEGORY';
                SESSION_CACHE.set(chatId, session);

                const { data: categories } = await supabase.from("categories").select("id, name, icon").eq("type", session.type);
                if (!categories || categories.length === 0) {
                    await sendMessage(chatId, "❌ Belum ada kategori.");
                    await showMainMenu(chatId, userId);
                    SESSION_CACHE.delete(chatId);
                    return new Response("OK");
                }

                const catButtons: any[] = [];
                let row: any[] = [];
                categories.forEach((c: any) => {
                    row.push({ text: `${c.icon || "📂"} ${c.name}` });
                    if (row.length === 2) { catButtons.push(row); row = []; }
                });
                if (row.length > 0) catButtons.push(row);
                catButtons.push([{ text: "❌ Batalkan" }]);

                await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `✅ Rekening: *${acc.name}*\n\n📋 *Langkah 2 dari 3 — Kategori*\n👇 Pilih dari opsi di bawah:`,
                        parse_mode: "Markdown",
                        reply_markup: { keyboard: catButtons, resize_keyboard: true, is_persistent: true }
                    })
                });
                return new Response("OK");
            }

            if (session?.step === 'AWAITING_CATEGORY') {
                const { data: categories } = await supabase.from("categories").select("id, name").eq("type", session.type);
                const cat = categories?.find((c: any) => text.includes(c.name));

                if (!cat) {
                    await sendMessage(chatId, "⚠️ Kategori tidak valid.");
                    return new Response("OK");
                }

                const trTypeShort = session.type === "expense" ? "exp" : "inc";
                const w = session.type === "expense" ? "📉 Pengeluaran" : "📈 Pemasukan";
                const accShort = shortId(session.accountId);

                await forceReplyMessage(chatId,
                    `${w}\n${"─".repeat(28)}\n\n✅ Sumber dana & kategori sudah dipilih!\n\n📋 *Langkah 3 dari 3 — Input Nominal*\n\n👉 *Balas pesan ini* dengan format:\n\`[NOMINAL] [KETERANGAN]\`\n\n📌 Contoh:\n• \`50000 Makan siang\`\n• \`150000 Belanja\`\n\n⚠️ _Nominal tanpa titik/koma, hanya angka_\n\n_(Informasi Sistem: ${trTypeShort} | ${accShort} | ${shortId(cat.id)})_`
                );
                SESSION_CACHE.delete(chatId);
                return new Response("OK");
            }
            // --- END SESSION-BASED KEYBOARD HANDLER ---

            if (text === "💳 Info Saldo") {
                data.callback_query = { message: { chat: { id: chatId } }, id: "0", data: "MENU#saldo" };
            }
            if (text === "📊 Laporan") {
                data.callback_query = { message: { chat: { id: chatId } }, id: "0", data: "laporan_bulan_ini" };
            }
            if (text === "📜 Riwayat") {
                data.callback_query = { message: { chat: { id: chatId } }, id: "0", data: "riwayat_trx" };
            }
            if (text === "🤖 Tanya AI") {
                const keyboard = [
                    [{ text: "🏥 Analisis Kondisi Keuangan" }],
                    [{ text: "💡 Tips Penghematan" }],
                    [{ text: "⚠️ Deteksi Pemborosan" }],
                    [{ text: "❌ Batalkan" }]
                ];
                await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `🤖 *FinanceAI — v6.0*\n${DLINE}\nPilih menu di bawah, atau ketik langsung keluhan & pertanyaan Anda:`,
                        parse_mode: "Markdown",
                        reply_markup: { keyboard, resize_keyboard: true, is_persistent: true }
                    })
                });
                return new Response("OK");
            }

            if (data.callback_query && data.callback_query.data) {
                const pingId = await sendMessage(chatId, "📡 _Memuat data..._");
                // Fallthrough to callback handler!
            } else {

                // Tombol shortcut dari persistent keyboard bawah layar
                if (text === "💸 Pengeluaran" || text === "💵 Pemasukan") {
                    const trType = text === "💸 Pengeluaran" ? "expense" : "income";
                    SESSION_CACHE.set(chatId, { step: 'AWAITING_ACCOUNT', type: trType });

                    const { data: accounts } = await supabase.from("accounts").select("id, name, type").eq("user_id", userId);
                    if (!accounts || accounts.length === 0) { await sendMessage(chatId, "❌ Belum ada akun."); return new Response("OK"); }

                    const accButtons: any[] = [];
                    let row: any[] = [];
                    accounts.forEach((acc: any) => {
                        const icon = acc.type === "bank" ? "🏦" : acc.type === "wallet" ? "📱" : "💵";
                        row.push({ text: `${icon} ${acc.name}` });
                        if (row.length === 2) { accButtons.push(row); row = []; }
                    });
                    if (row.length > 0) accButtons.push(row);
                    accButtons.push([{ text: "❌ Batalkan" }]);

                    const word = trType === "expense" ? "📉 PENGELUARAN" : "📈 PEMASUKAN";
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: `${word} AKTIF\n${DLINE}\n\n📋 *Langkah 1 dari 3 — Sumber Dana*\n👇 Pilih dari opsi keyboard di bawah:`,
                            parse_mode: "Markdown",
                            reply_markup: { keyboard: accButtons, resize_keyboard: true, is_persistent: true }
                        })
                    });
                    return new Response("OK");
                }
            }

            // Force Reply Handlers
            if (data.message.reply_to_message?.text) {
                const repliedText = data.message.reply_to_message.text;

                // AI Chat
                if (repliedText.includes("Informasi Sistem: ai_chat)")) {
                    await askAIFinancial(chatId, text, userId);
                    return new Response("OK");
                }

                // Input Transaksi Manual
                const typeMatch = repliedText.match(/Informasi Sistem: (exp|inc) \| ([a-f0-9]+) \| ([a-f0-9]+)\)/);
                if (typeMatch) {
                    const [, trTypeShort, accShort, catShort] = typeMatch;
                    const inputParts = text.split(" ");
                    const amount = parseInt(inputParts[0].replace(/[^0-9]/g, ''));

                    if (isNaN(amount) || amount <= 0) {
                        await sendMessage(chatId, "❌ *Format Salah!*\n\nNominal harus berupa angka.\nContoh yang benar: `50000 Makan siang`");
                        return new Response("OK");
                    }

                    // PING POP-UP AGAR TIDAK TERLIHAT DELAY
                    const loadingMsgId = await sendMessage(chatId, "📡 _Menghubungi server FinanceMy... Mohon tunggu sebentar._");

                    const [accRes, catRes] = await Promise.all([
                        supabase.from("accounts").select("id, name, balance").ilike("id", `${accShort}%`).single(),
                        supabase.from("categories").select("id, name").ilike("id", `${catShort}%`).single()
                    ]);
                    const accData = accRes.data;
                    const catData = catRes.data;

                    if (!accData || !catData) {
                        if (loadingMsgId) await deleteMessage(chatId, loadingMsgId);
                        await showInlineKeyboard(chatId,
                            "❌ *Sesi sudah berakhir.*\nSilakan mulai kembali dari Menu Utama.",
                            [[{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]]
                        );
                        return new Response("OK");
                    }

                    const description = inputParts.slice(1).join(" ").trim() || catData.name;
                    const dtNow = new Date().toISOString();
                    const parseType = trTypeShort === "exp" ? "expense" : "income";
                    const prevBal = parseFloat(accData.balance || "0");
                    const newBal = parseType === "income" ? prevBal + amount : prevBal - amount;
                    const newTrxId = generateUUID(); // buat UUID terlebih dahulu

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
                        const icon = parseType === "expense" ? "💸" : "💰";
                        const label = parseType === "expense" ? "PENGELUARAN" : "PEMASUKAN";
                        const balDir = parseType === "expense" ? "Berkurang" : "Bertambah";

                        // BERSIHKAN CHAT: Hapus pesan pertanyaan sistem (force reply) dan jawaban user jika bisa, serta pop-up ping.
                        if (loadingMsgId) await deleteMessage(chatId, loadingMsgId);
                        if (data.message.reply_to_message?.message_id) await deleteMessage(chatId, data.message.reply_to_message.message_id);
                        if (data.message.message_id) await deleteMessage(chatId, data.message.message_id);

                        await showInlineKeyboard(chatId,
                            `${icon} *TRANSAKSI BERHASIL DICATAT!*\n${DLINE}\n\n📋 *Detail Transaksi:*\n   Jenis    : *${label}*\n   Jumlah   : *${formatRupiah(amount)}*\n   Rekening : ${accData.name}\n   Kategori : ${catData.name}\n   Ket      : ${description}\n\n${LINE}\n💳 *Rekening ${accData.name}:*\n   Sebelum  : ${formatRupiah(getUsableBalance({ name: accData.name, balance: prevBal }))}\n   ${balDir}: ${formatRupiah(amount)}\n   *Sesudah  : ${formatRupiah(getUsableBalance({ name: accData.name, balance: newBal }))}*\n\n📅 ${formatTanggalPendek()} · ⏰ ${formatJam()} WIB`,
                            [
                                [{ text: "📎 Lampirkan Bukti Foto (Opsional)", callback_data: `ATTACH_RECEIPT#${newTrxId}` }]
                            ]
                        );
                    }
                    return new Response("OK");
                }

                // Edit Transaksi
                const editMatch = repliedText.match(/Informasi Sistem: edit \| ([a-f0-9]+)\)/);
                if (editMatch) {
                    const trxShort = editMatch[1];
                    const inputParts = text.split(" ");
                    const amount = parseInt(inputParts[0].replace(/[^0-9]/g, ''));
                    if (isNaN(amount) || amount <= 0) {
                        await sendMessage(chatId, "❌ Nominal harus berupa angka.");
                        return new Response("OK");
                    }
                    const description = inputParts.slice(1).join(" ").trim() || "Di-edit via Telegram";
                    const { data: trData } = await supabase.from("transactions").select("id, type, amount, account_id").ilike("id", `${trxShort}%`).single();
                    if (trData) {
                        const { data: acc } = await supabase.from("accounts").select("balance, name").eq("id", trData.account_id).single();
                        let newBal = parseFloat(acc?.balance || "0");
                        if (acc) {
                            // Revert old
                            newBal = trData.type === "income" ? newBal - parseFloat(trData.amount) : newBal + parseFloat(trData.amount);
                            // Apply new
                            newBal = trData.type === "income" ? newBal + amount : newBal - amount;
                            await supabase.from("accounts").update({ balance: newBal }).eq("id", trData.account_id);
                        }
                        const { error } = await supabase.from("transactions").update({
                            amount, description, updated_at: new Date().toISOString()
                        }).eq("id", trData.id);

                        if (!error) {
                            if (data.message.reply_to_message?.message_id) await deleteMessage(chatId, data.message.reply_to_message.message_id);
                            if (data.message.message_id) await deleteMessage(chatId, data.message.message_id);

                            await showInlineKeyboard(chatId,
                                `♻️ *TRANSAKSI BERHASIL DIUBAH!*\n${"─".repeat(28)}\n\n${trData.type === "expense" ? "💸" : "💰"} *${formatRupiah(amount)}*\n📝 ${description}\n\n✅ Saldo *${acc?.name || "rekening"}* terkoreksi otomatis\n   → Saldo kini: *${formatRupiah(getUsableBalance({ name: acc?.name || "", balance: newBal }))}*`,
                                [
                                    [{ text: "📜 Lihat Riwayat", callback_data: "riwayat_trx" }]
                                ]
                            );
                        } else {
                            await sendMessage(chatId, `❌ Gagal edit: ${error.message}`);
                        }
                    }
                    return new Response("OK");
                }
            }

            // Jika bukan perintah yang dikenal, hapus chat balasan otomatis untuk menjaga ruang obrolan tetap bersih
            if (!data.callback_query) {
                if (data.message.message_id) {
                    await deleteMessage(chatId, data.message.message_id);
                }
                return new Response("OK");
            }
        }

        // ===================================================
        // CALLBACK QUERY
        // ===================================================
        if (data.callback_query) {
            const chatId = data.callback_query.message.chat.id;
            const callbackId = data.callback_query.id;
            const action = data.callback_query.data;

            // CANCEL
            if (action === "CANCEL" || action === "BACK_MAIN") {
                await showMainMenu(chatId, userId);
            }

            // MAIN MENU SHORTCUTS
            else if (action.startsWith("MENU#")) {
                const sub = action.split("#")[1];

                // === INFO SALDO LENGKAP ===
                if (sub === "saldo") {
                    const firstDay = getWIBFirstDay();
                    const accsRes = await supabase.from("accounts").select("id, name, balance, type").eq("user_id", userId).order("balance", { ascending: false });
                    const accountsData = accsRes.data || [];
                    const accIds = accountsData.map((a: any) => a.id);

                    const txsRes = await supabase.from("transactions").select("amount, type").in("account_id", accIds).gte("date", firstDay);
                    const txs = txsRes.data;

                    const total = accountsData.reduce((sum: number, acc: any) => sum + getUsableBalance(acc), 0);
                    let listText = "";
                    let inc = 0, exp = 0;
                    accountsData?.forEach((acc: any) => {
                        const balDisplay = getUsableBalance(acc);
                        const icon = acc.type === "bank" ? "🏦" : acc.type === "wallet" ? "📱" : "💵";
                        const maxBarTotal = total === 0 ? 1 : total;
                        const bar = progressBar(Math.min((balDisplay / maxBarTotal) * 100, 100), 8);

                        let tertahanText = "";
                        if (acc.name.toLowerCase().includes("bri")) {
                            tertahanText = "\n   🔒 _(Tertahan minimum: Rp 50.000)_";
                        }

                        listText += `${icon} *${acc.name}*\n   ${bar} ${formatRupiah(balDisplay)}${tertahanText}\n\n`;
                    });
                    txs?.forEach((t: any) => {
                        if (t.type === "income") inc += parseFloat(t.amount);
                        else if (t.type === "expense") exp += parseFloat(t.amount);
                    });

                    const savRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
                    const health = healthBadge(savRate / 100);

                    await showInlineKeyboard(chatId,
                        `💳 *PORTFOLIO KEUANGAN*\n${"═".repeat(28)}\n\n${listText}\n${"─".repeat(28)}\n💰 *Total Saldo: ${formatRupiah(total)}*\n\n📊 *Ringkasan Bulan Ini:*\n📈 Masuk: ${formatRupiah(inc)}\n📉 Keluar: ${formatRupiah(exp)}\n💡 Sisa: *${formatRupiah(inc - exp)}*\n\n🏥 Status: ${health}\n\n_📅 ${formatTanggal()} — ⏰ ${formatJam()} WIB_`,
                        [
                            [{ text: "📊 Lihat Laporan Lengkap", callback_data: "laporan_bulan_ini" }],
                            [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                        ]
                    );
                }

                // === PILIH JENIS TRANSAKSI ===
                else if (sub === "expense" || sub === "income") {
                    const trType = sub === "expense" ? "exp" : "inc";
                    const { data: accounts } = await supabase.from("accounts").select("id, name, type, balance").eq("user_id", userId);
                    if (!accounts || accounts.length === 0) { await sendMessage(chatId, "❌ Belum ada akun."); return new Response("OK"); }

                    const accButtons = accounts.map((acc: any) => {
                        const icon = acc.type === "bank" ? "🏦" : acc.type === "wallet" ? "📱" : "💵";
                        return [{ text: `${icon} ${acc.name}  ·  Saldo ${formatRupiah(getUsableBalance(acc))}`, callback_data: `A#${trType}#${shortId(acc.id)}` }];
                    });

                    const word = sub === "expense" ? "📉 CATAT PENGELUARAN" : "📈 CATAT PEMASUKAN";
                    const hint = sub === "expense" ? "Pilih dompet/rekening sumber pembayaran:" : "Pilih rekening tujuan masuknya dana:";
                    await showInlineKeyboard(chatId,
                        `${word}\n${"═".repeat(28)}\n\n📋 *Langkah 1 dari 3 — Sumber Dana*\n${hint}`,
                        [...accButtons, [{ text: "❌ Batalkan", callback_data: "BACK_MAIN" }]]
                    );
                }

                // === MENU AI ===
                else if (sub === "ai") {
                    await showInlineKeyboard(chatId,
                        `🤖 *FinanceAI — Asisten Keuangan Pribadi*\n${"═".repeat(28)}\n\n_Pilih topik analisis, atau ketik pertanyaan Anda sendiri:_`,
                        [
                            [{ text: "🏥 Analisis Kondisi Keuangan Saya", callback_data: "AI#analisis" }],
                            [{ text: "💡 Tips Hemat Berdasarkan Data Saya", callback_data: "AI#hemat" }],
                            [{ text: "📈 Prediksi Saldo Akhir Bulan Ini", callback_data: "AI#prediksi" }],
                            [{ text: "⚠️ Deteksi Pemborosan Saya", callback_data: "AI#boros" }],
                            [{ text: "✍️ Tanya dengan Kata-Kata Sendiri", callback_data: "AI#custom" }],
                            [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                        ]
                    );
                }
                // === UPDATE DATABASE (SYNC) ===
                else if (sub === "sync") {
                    // Paksa membuang cache User ID dan memuat ulan
                    GLOBAL_USER_ID = "";
                    UNDO_CACHE.clear();

                    // Ambil ulang
                    const { data: defAcc } = await supabase.from("accounts").select("user_id").eq("id", DEFAULT_ACCOUNT_ID).single();
                    GLOBAL_USER_ID = defAcc?.user_id || "";
                    const freshUserId = GLOBAL_USER_ID;

                    const accsRes = await supabase.from("accounts").select("id").eq("user_id", freshUserId);
                    const accIds = accsRes.data?.map((a: any) => a.id) || [DEFAULT_ACCOUNT_ID];

                    // Pastikan data yang kita hitung bener-bener akurat (gak nyangkut)
                    const { data: totalTxsRes } = await supabase.from("transactions").select("id", { count: 'exact', head: true }).in("account_id", accIds);
                    const count = totalTxsRes || 0;

                    await showInlineKeyboard(chatId,
                        `🔄 *SINKRONISASI DATABASE SELESAI*\n${DLINE}\n\n✅ Cache internal telah dibersihkan.\n✅ Koneksi ke Supabase berhasil diperbarui.\n✅ ID Pengguna berhasil divalidasi ulang.\n\n_Data di bot kini sudah 100% sama persis dengan Dashboard Aplikasi Web Anda._`,
                        [
                            [{ text: "🏠 Kembali ke Beranda", callback_data: "BACK_MAIN" }]
                        ]
                    );
                }

            }

            // AI QUESTIONS
            else if (action.startsWith("AI#")) {
                const topic = action.split("#")[1];
                const questionMap: Record<string, string> = {
                    "analisis": "Analisis kondisi keuangan saya bulan ini secara menyeluruh. Sehatkan? Apa kekuatan dan kelemahan dari pola keuangan saya?",
                    "hemat": "Berdasarkan data pengeluaran nyata saya bulan ini, mana yang paling bisa dihemat? Beri saran konkrit dengan angka.",
                    "prediksi": "Berdasarkan tren pemasukan dan pengeluaran saya, prediksi apakah saldo saya akan cukup sampai akhir bulan? Hitung dengan angka nyata.",
                    "boros": "Identifikasi apakah ada pola pemborosan dalam pengeluaran saya bulan ini. Apakah ada kategori yang pengeluarannya tidak wajar?"
                };
                if (topic === "custom") {
                    await forceReplyMessage(chatId,
                        `🤖 *Tanya FinanceAI Langsung*\n${"─".repeat(28)}\n\nAI memiliki akses ke semua data keuangan Anda secara real-time.\n\n💬 *Balas pesan ini dengan pertanyaan Anda:*\n\nContoh:\n• _"Apakah pengeluaran saya bulan ini normal?"_\n• _"Kapan sebaiknya saya mulai investasi?"_\n• _"Bagaimana cara saya mencapai tabungan 20%?"_\n\n_(Informasi Sistem: ai_chat)_`
                    );
                } else {
                    await askAIFinancial(chatId, questionMap[topic] || "Analisis kondisi keuangan saya.", userId);
                }
            }

            // ATTACH RECEIPT - Tombol Lampirkan Foto Bukti
            else if (action.startsWith("ATTACH_RECEIPT#")) {
                const trxId = action.split("#")[1];
                await forceReplyMessage(chatId,
                    `📎 *LAMPIRKAN BUKTI FOTO*\n${DLINE}\n\n` +
                    `� *Ikuti 3 langkah ini:*\n\n` +
                    `*1️⃣* Ketuk ikon 📎 *Klip/Lampiran* di sebelah kotak ketik\n` +
                    `*2️⃣* Pilih *"Foto & Video"* atau *"Kamera"*\n` +
                    `*3️⃣* Pilih fotonya → Kirim *(tanpa caption)*\n\n` +
                    `${LINE}\n` +
                    `💡 *Catatan penting:*\n` +
                    `Telegram tidak bisa membuka kamera otomatis dari tombol — ini batasan dari Telegram sendiri.\n` +
                    `Tapi jika Anda membalas pesan *ini* dengan foto, bukti akan tersimpan otomatis! ✅\n\n` +
                    `_(Informasi Sistem: attach_receipt | ${trxId})_`
                );
            }

            // TRANSAKSI: Pilih Akun → Tampilkan Kategori
            else if (action.startsWith("A#")) {
                const [, trType, accShort] = action.split("#");
                const fullType = trType === "exp" ? "expense" : "income";
                const { data: categories } = await supabase.from("categories").select("id, name, icon").eq("type", fullType);
                const catButtons = categories?.map((cat: any) => {
                    return [{ text: `${cat.icon || "📁"}  ${cat.name}`, callback_data: `C#${trType}#${accShort}#${shortId(cat.id)}` }];
                }) || [];

                const w = trType === "exp" ? "📉 CATAT PENGELUARAN" : "📈 CATAT PEMASUKAN";
                await showInlineKeyboard(chatId,
                    `${w}\n${"═".repeat(28)}\n\n📋 *Langkah 2 dari 3 — Kategori*\nPilih kategori yang paling sesuai:`,
                    [...catButtons, [{ text: "❌ Batalkan", callback_data: "BACK_MAIN" }]]
                );
            }

            // TRANSAKSI: Pilih Kategori → Force Reply Nominal
            else if (action.startsWith("C#")) {
                const [, trType, accShort, catShort] = action.split("#");
                const w = trType === "exp" ? "📉 Pengeluaran" : "📈 Pemasukan";
                await forceReplyMessage(chatId,
                    `${w}\n${"─".repeat(28)}\n\n✅ Sumber dana & kategori sudah dipilih!\n\n📋 *Langkah 3 dari 3 — Input Nominal*\n\n👉 *Balas pesan ini* dengan format:\n\`[NOMINAL] [KETERANGAN]\`\n\n📌 Contoh:\n• \`50000 Makan siang Warteg\`\n• \`150000 Belanja bulanan\`\n\n⚠️ _Nominal tanpa titik/koma, hanya angka_\n\n_(Informasi Sistem: ${trType} | ${accShort} | ${catShort})_`
                );
            }

            // OCR: Pilih Akun → Tampilkan Kategori
            else if (action.startsWith("OCR_ACC#")) {
                const [, accShort, amount, descEnc] = action.split("#");
                const desc = decodeURIComponent(descEnc || "Belanja Struk");
                const { data: categories } = await supabase.from("categories").select("id, name, icon").eq("type", "expense");
                const catButtons = categories?.map((cat: any) => {
                    return [{ text: `${cat.icon || "📁"}  ${cat.name}`, callback_data: `OCR_SAVE#${accShort}#${shortId(cat.id)}#${amount}#${encodeURIComponent(desc).substring(0, 40)}` }];
                }) || [];

                await showInlineKeyboard(chatId,
                    `🏷️ *KONFIRMASI STRUK*\n${"═".repeat(28)}\n\n✅ Sumber dana dipilih!\n\n💰 Total: *${formatRupiah(amount)}*\n🏪 Merchant: *${desc}*\n\n${"─".repeat(28)}\n*Langkah 2\/2 — Pilih Kategori:*\n👇 Jenis pengeluaran apa ini?`,
                    [...catButtons, [{ text: "❌ Batalkan", callback_data: "CANCEL" }]]
                );
            }

            // OCR: Pilih Kategori → SIMPAN
            else if (action.startsWith("OCR_SAVE#")) {
                const [, accShort, catShort, amountStr, descEnc] = action.split("#");
                const amount = parseInt(amountStr);
                const desc = decodeURIComponent(descEnc || "Belanja Struk");

                const [accRes, catRes] = await Promise.all([
                    supabase.from("accounts").select("id, name, balance").ilike("id", `${accShort}%`).single(),
                    supabase.from("categories").select("id, name").ilike("id", `${catShort}%`).single()
                ]);
                const accData = accRes.data;
                const catData = catRes.data;
                if (!accData || !catData) {
                    await showInlineKeyboard(chatId,
                        "❌ *Gagal menemukan akun/kategori.*\nSesi mungkin sudah berakhir. Silakan ulangi dengan mengirim foto struk baru.",
                        [[{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]]
                    );
                    return new Response("OK");
                }

                const prevBal = parseFloat(accData.balance || "0");
                const newBal = prevBal - amount;
                await supabase.from("accounts").update({ balance: newBal }).eq("id", accData.id);
                const dtNow = new Date().toISOString();
                const newTrxId = generateUUID();
                const { error } = await supabase.from("transactions").insert({
                    id: newTrxId, type: "expense", amount, description: desc,
                    source: "telegram", account_id: accData.id, category_id: catData.id,
                    date: dtNow, created_at: dtNow, updated_at: dtNow
                });

                if (error) {
                    await sendMessage(chatId, `❌ *Gagal Menyimpan ke Database*\n\`${error.message}\``);
                } else {
                    const balChangePct = prevBal > 0 ? (amount / prevBal * 100).toFixed(1) : "0";
                    await showInlineKeyboard(chatId,
                        `✅ *TRANSAKSI STRUK TERSIMPAN!*\n${DLINE}\n\n💸 Jenis: *PENGELUARAN*\n🏪 Merchant: *${desc}*\n🗂️ Kategori: ${catData.name}\n💳 Rekening: ${accData.name}\n\n💰 Jumlah: *${formatRupiah(amount)}*\n\n${LINE}\n📊 *Update Saldo ${accData.name}:*\n   Sebelum : ${formatRupiah(getUsableBalance({ name: accData.name, balance: prevBal }))}\n   Sesudah : *${formatRupiah(getUsableBalance({ name: accData.name, balance: newBal }))}*\n   Berkurang: -${balChangePct}%\n\n📅 ${formatTanggalPendek()} · ⏰ ${formatJam()} WIB\n\n📎 _Foto struk ini sudah tersimpan sebagai bukti transaksi._`,
                        [
                            [{ text: "📜 Lihat Riwayat", callback_data: "riwayat_trx" }],
                            [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                        ]
                    );
                }
            }

            // RIWAYAT TRANSAKSI
            else if (action === "riwayat_trx") {
                const accsRes = await supabase.from("accounts").select("id").eq("user_id", userId);
                const accIds = accsRes.data?.map((a: any) => a.id) || [DEFAULT_ACCOUNT_ID];

                const { data: history } = await supabase
                    .from("transactions")
                    .select("id, amount, description, type, date, account_id")
                    .in("account_id", accIds)
                    .order("date", { ascending: false })
                    .limit(5);

                if (!history || history.length === 0) {
                    await showInlineKeyboard(chatId,
                        `📜 *RIWAYAT TRANSAKSI*\n${"─".repeat(28)}\n\n_Belum ada transaksi yang tercatat._`,
                        [[{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]]
                    );
                    return new Response("OK");
                }

                let msg = `📜 *RIWAYAT 5 TRANSAKSI TERAKHIR*\n${DLINE}\n\n`;
                const historyButtons: any[] = [];

                history.forEach((t: any, i: number) => {
                    const icon = t.type === "expense" ? "📉" : "📈";
                    const tgl = new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                    const typeLabel = t.type === "expense" ? "Keluar" : "Masuk";
                    const receiptBadge = t.receipt_url ? " 📎" : "";
                    msg += `${i + 1}. ${icon} *${formatRupiah(t.amount)}*${receiptBadge}\n`;
                    msg += `   📝 ${t.description}\n`;
                    msg += `   📅 ${tgl} · ${typeLabel}\n\n`;
                    historyButtons.push([
                        { text: `✏️ Edit #${i + 1}`, callback_data: `EDIT#${shortId(t.id)}` },
                        { text: `🗑️ Hapus #${i + 1}`, callback_data: `DEL#${shortId(t.id)}` }
                    ]);
                });

                msg += `${"─".repeat(28)}\n_Tap tombol di bawah untuk edit\/hapus_`;
                historyButtons.push([{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]);
                await showInlineKeyboard(chatId, msg, historyButtons);
            }

            // EDIT TRANSAKSI
            else if (action.startsWith("EDIT#")) {
                const trxShort = action.split("#")[1];
                const { data: t } = await supabase.from("transactions").select("*").ilike("id", `${trxShort}%`).single();
                if (t) {
                    const tgl = new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                    await forceReplyMessage(chatId,
                        `✏️ *EDIT TRANSAKSI*\n${"─".repeat(28)}\n\n📌 *Data Sekarang:*\n   ${t.type === "expense" ? "📉" : "📈"} ${t.type === "expense" ? "Pengeluaran" : "Pemasukan"}\n   💰 ${formatRupiah(t.amount)}\n   📝 ${t.description}\n   📅 ${tgl}\n\n${"─".repeat(28)}\n👉 *Balas pesan ini* dengan data baru:\n\`[NOMINAL] [KETERANGAN BARU]\`\n\nContoh: \`75000 Makan malam bersama keluarga\`\n\n_(Informasi Sistem: edit | ${trxShort})_`
                    );
                } else {
                    await showInlineKeyboard(chatId, "❌ Transaksi tidak ditemukan atau sudah dihapus.",
                        [[{ text: "🔙 Kembali", callback_data: "riwayat_trx" }]]
                    );
                }
            }

            // HAPUS TRANSAKSI
            else if (action.startsWith("DEL#")) {
                const trxShort = action.split("#")[1];
                const { data: t } = await supabase.from("transactions").select("*").ilike("id", `${trxShort}%`).single();
                if (t) {
                    const { data: acc } = await supabase.from("accounts").select("balance, name").eq("id", t.account_id).single();
                    let newBal = 0;
                    if (acc) {
                        newBal = t.type === "income"
                            ? parseFloat(acc.balance) - parseFloat(t.amount)
                            : parseFloat(acc.balance) + parseFloat(t.amount);
                        await supabase.from("accounts").update({ balance: newBal }).eq("id", t.account_id);
                    }

                    // CACHE DATA SEBELUM DIHAPUS UTK FITUR UNDO
                    UNDO_CACHE.set(trxShort, t);
                    if (UNDO_CACHE.size > 50) {
                        const firstKey = UNDO_CACHE.keys().next().value;
                        if (firstKey) UNDO_CACHE.delete(firstKey);
                    }

                    const { error } = await supabase.from("transactions").delete().eq("id", t.id);
                    if (!error) {
                        await showInlineKeyboard(chatId,
                            `🗑️ *TRANSAKSI BERHASIL DIHAPUS*\n${"─".repeat(28)}\n\n📝 ${t.description}\n💰 ${formatRupiah(t.amount)}\n${t.type === "expense" ? "📉" : "📈"} ${t.type === "expense" ? "Pengeluaran" : "Pemasukan"}\n\n✅ Saldo ${acc?.name || "rekening"} *otomatis dikoreksi*\n   → Saldo kini: *${formatRupiah(getUsableBalance({ name: acc?.name || "", balance: newBal }))}*\n\n_Anda dapat membatalkan aksi ini jika tidak sengaja._`,
                            [
                                [{ text: "↩️ Batal Hapus / Undo", callback_data: `UNDO#${trxShort}` }],
                                [{ text: "📜 Lihat Riwayat", callback_data: "riwayat_trx" }],
                                [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                            ]
                        );
                    } else {
                        await sendMessage(chatId, `❌ Gagal menghapus: ${error.message}`);
                    }
                } else {
                    await showInlineKeyboard(chatId, "❌ Transaksi tidak ditemukan.",
                        [[{ text: "🔙 Kembali", callback_data: "riwayat_trx" }]]
                    );
                }
            }

            // UNDO HAPUS TRANSAKSI
            else if (action.startsWith("UNDO#")) {
                const trxShort = action.split("#")[1];
                const t = UNDO_CACHE.get(trxShort);

                if (!t) {
                    await showInlineKeyboard(chatId,
                        "❌ Sesi Undo telah berakhir atau data tidak ditemukan. Transaksi tetap terhapus.",
                        [[{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]]
                    );
                    return new Response("OK");
                }

                // Restore balance
                const { data: acc } = await supabase.from("accounts").select("balance, name").eq("id", t.account_id).single();
                let newBal = parseFloat(acc?.balance || "0");
                if (acc) {
                    newBal = t.type === "income" ? newBal + parseFloat(t.amount) : newBal - parseFloat(t.amount);
                    await supabase.from("accounts").update({ balance: newBal }).eq("id", t.account_id);
                }

                // Insert back transaction
                const { error } = await supabase.from("transactions").insert(t);

                if (!error) {
                    UNDO_CACHE.delete(trxShort); // Clean cache after success
                    await showInlineKeyboard(chatId,
                        `✅ *TRANSAKSI DIKEMBALIKAN (UNDO BERHASIL)*\n${DLINE}\n\n📝 ${t.description}\n💰 ${formatRupiah(t.amount)}\n${t.type === "expense" ? "📉" : "📈"} ${t.type === "expense" ? "Pengeluaran" : "Pemasukan"}\n\n💳 Saldo ${acc?.name || "rekening"} *telah dipulihkan*\n   → Saldo kini: *${formatRupiah(getUsableBalance({ name: acc?.name || "", balance: newBal }))}*`,
                        [
                            [{ text: "📜 Lihat Riwayat", callback_data: "riwayat_trx" }],
                            [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                        ]
                    );
                } else {
                    await sendMessage(chatId, `❌ Gagal melakukan Undo: ${error.message}`);
                }
            }

            // LAPORAN BULANAN
            else if (action === "laporan_bulan_ini") {
                const now = getWIBDate();
                const firstDay = getWIBFirstDay();
                const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

                const accsRes = await supabase.from("accounts").select("id").eq("user_id", userId);
                const accIds = accsRes.data?.map((a: any) => a.id) || [DEFAULT_ACCOUNT_ID];

                const { data: txs } = await supabase.from("transactions").select("amount, type, description").in("account_id", accIds).gte("date", firstDay);

                let inc = 0, exp = 0, totalTrx = 0;
                txs?.forEach((t: any) => {
                    totalTrx++;
                    if (t.type === "income") inc += parseFloat(t.amount);
                    else if (t.type === "expense") exp += parseFloat(t.amount);
                });

                const sisa = inc - exp;
                const savRate = inc > 0 ? (sisa / inc) * 100 : 0;
                const daysLeft = lastDay.getUTCDate() - now.getUTCDate();
                const expBar = inc > 0 ? progressBar((exp / inc) * 100) : progressBar(100);
                const health = healthBadge(savRate / 100);
                const bulan = now.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }); // TimeZone UTC krn shift WIB

                await showInlineKeyboard(chatId,
                    `📊 *LAPORAN KEUANGAN ${bulan.toUpperCase()}*\n${"═".repeat(28)}\n\n📈 *Pemasukan*\n   ${formatRupiah(inc)}\n\n📉 *Pengeluaran*\n   ${formatRupiah(exp)}\n   ${expBar} ${inc > 0 ? ((exp / inc) * 100).toFixed(0) : 0}% dari income\n\n${"─".repeat(28)}\n💡 *Sisa \/ Tabungan:*\n   *${formatRupiah(sisa)}* (${savRate.toFixed(1)}%)\n\n📋 Total Transaksi: ${totalTrx} transaksi\n📅 Sisa waktu: ${daysLeft} hari lagi\n🏥 Status: ${health}\n\n_📅 ${formatTanggal()}_`,
                    [
                        [{ text: "🤖 Minta Analisis AI", callback_data: "AI#analisis" }],
                        [{ text: "📜 Lihat Riwayat Transaksi", callback_data: "riwayat_trx" }],
                        [{ text: "🔙 Menu Utama", callback_data: "BACK_MAIN" }]
                    ]
                );
            }

            return new Response("OK");
        }

    } catch (err) {
        console.error("Error:", err);
        cbSuccess = false; // tandai bahwa terjadi gagal/error
    } finally {
        // SELALU EKSEKUSI DI AKHIR (Menghilangkan spinner tombol dan memberikan toast text selesai/gagal)
        if (cbId) {
            const loadingMsg = cbSuccess ? "✅ Memuat data selesai!" : "❌ Gagal memuat data!";
            answerCallbackQuery(cbId, loadingMsg).catch(() => { });
        }
    }
    return new Response("OK", { status: 200 });
});

// ======================== SHOW MAIN MENU ========================
async function showMainMenu(chatId: number, userId = "") {
    let quickInfo = "";
    if (userId) {
        const now = getWIBDate();
        const firstDay = getWIBFirstDay();

        const accsRes = await supabase.from("accounts").select("id, name, balance").eq("user_id", userId);
        const accs = accsRes.data || [];
        const accIds = accs.map((a: any) => a.id) || [DEFAULT_ACCOUNT_ID];

        const txsRes = await supabase.from("transactions").select("amount, type").in("account_id", accIds).gte("date", firstDay);
        const txs = txsRes.data;

        let total = 0;
        if (accs) total = accs.reduce((s: number, a: any) => s + getUsableBalance(a), 0);

        let inc = 0, exp = 0;
        if (txs) {
            txs.forEach((t: any) => {
                if (t.type === "income") inc += parseFloat(t.amount);
                else if (t.type === "expense") exp += parseFloat(t.amount);
            });
        }

        const savRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
        const health = healthBadge(savRate / 100);

        quickInfo = `\n\n💰 *Total Saldo:* ${formatRupiah(total)}\n\n� *Bulan Ini:*\n📈 Pemasukan: ${formatRupiah(inc)}\n📉 Pengeluaran: ${formatRupiah(exp)}\n💡 Tersisa: *${formatRupiah(inc - exp)}*\n🏥 Status: ${health}`;
    }

    // HANYA pasang Persistent Keyboard permanen di chat (dan menghapus semua menu inline/shortcut di ruang obrolan agar rapi)
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: `🏠 *FinanceMy Bot v6.0*\n${DLINE}${quickInfo}`,
            parse_mode: "Markdown",
            reply_markup: {
                keyboard: [
                    [{ text: "💸 Pengeluaran" }, { text: "💵 Pemasukan" }],
                    [{ text: "💳 Info Saldo" }, { text: "📊 Laporan" }, { text: "📜 Riwayat" }],
                    [{ text: "🏠 Beranda" }, { text: "🤖 Tanya AI" }, { text: "🔄 Update DB" }]
                ],
                resize_keyboard: true,
                is_persistent: true
            }
        })
    });
}

// ======================== API HELPERS ========================
async function showInlineKeyboard(chatId: number, text: string, keysArray: any[]) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", reply_markup: { inline_keyboard: keysArray } })
    });
}

async function forceReplyMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId, text, parse_mode: "Markdown",
            reply_markup: { force_reply: true, selective: true, input_field_placeholder: "Contoh: 50000 Makan siang..." }
        })
    });
}

async function sendMessage(chatId: number, text: string): Promise<number | null> {
    try {
        const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
        });
        const json: any = await r.json();
        return json.result?.message_id || null;
    } catch {
        return null;
    }
}

async function deleteMessage(chatId: number, messageId: number) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId })
        });
    } catch {
        // Abaikan jika pesan gagal dihapus (misal karena expired/hilang)
    }
}

async function answerCallbackQuery(cbId: string, text?: string) {
    const payload: any = { callback_query_id: cbId };
    if (text) payload.text = text; // Jika ada text, telegram akan menampilkan pesan popup toast sekilas

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
}

