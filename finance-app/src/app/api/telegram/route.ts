import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userSettings, transactions, accounts, categories } from "@/db/schema/finance";
import { eq } from "drizzle-orm";
import { getAICompletion } from "@/lib/ai";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Helper to send message to Telegram
async function sendTelegramMessage(chatId: string, text: string) {
    if (!TELEGRAM_BOT_TOKEN) return;

    try {
        const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown",
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("❌ Telegram API Error:", JSON.stringify(data));
        } else {
            console.log("✅ Message sent to Telegram:", chatId);
        }
    } catch (error) {
        console.error("❌ Network Error sending to Telegram:", error);
    }
}

export async function POST(req: NextRequest) {
    if (!TELEGRAM_BOT_TOKEN) {
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    try {
        const update = await req.json();
        console.log("📨 TELEGRAM UPDATE RECEIVED:", JSON.stringify(update, null, 2));

        // 1. Validate Update Structure
        if (!update.message || !update.message.text) {
            console.log("⚠️ Ignoring update: No text message found.");
            return NextResponse.json({ ok: true });
        }

        const chatId = update.message.chat.id.toString();
        const text = String(update.message.text || "");
        const from = update.message.from;
        const username = from?.username || from?.first_name || "Friend"; // Priority: @username -> FirstName -> "Friend"

        console.log(`👤 From: ${username} (${chatId}) | Text: ${text}`);

        // 2. Pair Logic (Start Command)
        // Format: /start <userId>
        if (text.startsWith("/start")) {
            const parts = text.split(" ");
            if (parts.length > 1) {
                const userIdToPair = parts[1];

                // Save chatId to database
                await db.insert(userSettings).values({
                    userId: userIdToPair,
                    telegramChatId: chatId,
                    telegramUsername: username
                }).onConflictDoUpdate({
                    target: userSettings.userId,
                    set: { telegramChatId: chatId, telegramUsername: username }
                });

                await sendTelegramMessage(chatId, `✅ *Akun Berhasil Terhubung!*\n\nHalo ${username}, saya ChaiAi. Asisten keuangan pribadi Anda.\n\nSilakan tanya apapun, misal:\n_"Bagaimana cara hemat gaji UMR?"_\n\nAtau catat pengeluaran:\n_"Kopi 25rb"_`);
                return NextResponse.json({ ok: true });
            }
        }

        // 3. Ping Command (Public)
        if (text.toLowerCase() === "/ping" || text.toLowerCase() === "ping") {
            const processingTime = Date.now();
            const messageTime = (update.message.date || Math.floor(processingTime / 1000)) * 1000;
            const latency = Math.abs(processingTime - messageTime);

            await sendTelegramMessage(chatId, `Pong! 🏓\nServer Time: ${new Date().toLocaleTimeString('id-ID')}\nLatency: ~${latency}ms`);
            return NextResponse.json({ ok: true });
        }

        // 4. User Verification (Private Commands)
        const user = await db.query.userSettings.findFirst({
            where: eq(userSettings.telegramChatId, chatId)
        });

        if (!user) {
            // Check if user is trying to pair but forgot /start parsing
            await sendTelegramMessage(chatId, "🔒 Akun belum terhubung.\n\nSilakan buka menu Settings di FinanceMy dan klik tombol 'Buka @myfinancejefbot'.");
            return NextResponse.json({ ok: true });
        }

        // 4. Send "Typing..." action
        await fetch(`${TELEGRAM_API_URL}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action: "typing" }),
        });

        // 5. Transaction Parsing Logic
        // Regex: (Item Name) (Amount) OR (Amount) (Item Name)
        // Groups: 1=Item, 2=Amount OR 3=Amount, 4=Item
        const expenseRegex1 = /^(.+?)\s+(\d+(?:[.,]\d+)?(?:k|rb)?)$/i; // Item 50k
        const expenseRegex2 = /^(\d+(?:[.,]\d+)?(?:k|rb)?)\s+(.+)$/i; // 50k Item

        let match = text.match(expenseRegex1);
        let item, amountStr;

        if (match) {
            item = match[1].trim();
            amountStr = match[2];
        } else {
            match = text.match(expenseRegex2);
            if (match) {
                amountStr = match[1];
                item = match[2].trim();
            }
        }

        // Check if identified as transaction
        if (item && amountStr) {
            amountStr = amountStr.toLowerCase().replace(/,/g, '.');

            let multiplier = 1;
            if (amountStr.endsWith('k') || amountStr.endsWith('rb')) {
                multiplier = 1000;
                amountStr = amountStr.replace(/k|rb/, '');
            }

            const amount = parseFloat(amountStr) * multiplier;

            if (!isNaN(amount) && amount > 0) {
                // Find User's Default Account
                const userAccount = await db.query.accounts.findFirst({
                    where: eq(accounts.userId, user.userId),
                });

                if (!userAccount) {
                    await sendTelegramMessage(chatId, "⚠️ Anda belum memiliki akun (Dompet/Bank). Buat dulu di aplikasi web.");
                    return NextResponse.json({ ok: true });
                }

                // Find Default Category
                let category = await db.query.categories.findFirst();

                if (!category) {
                    await sendTelegramMessage(chatId, "⚠️ Belum ada Kategori. Buat minimal satu kategori di web.");
                    return NextResponse.json({ ok: true });
                }

                // Insert Transaction
                await db.insert(transactions).values({
                    id: crypto.randomUUID(),
                    accountId: userAccount.id,
                    categoryId: category.id,
                    type: "expense",
                    amount: amount.toString(),
                    description: item,
                    date: new Date(),
                    source: "telegram",
                });

                const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
                await sendTelegramMessage(chatId, `✅ *Transaksi Dicatat!*\n\n📝 Item: ${item}\n💰 Nominal: ${formattedAmount}\n💳 Akun: ${userAccount.name}\n📂 Kategori: ${category.name}`);
                return NextResponse.json({ ok: true });
            }
        }

        // 6. AI Processing (Fallback)
        // If not a transaction, ask AI
        console.log("🤖 Processing AI Response with Context...");

        // --- FETCH FINANCIAL CONTEXT ---
        const userAccounts = await db.query.accounts.findMany({
            where: eq(accounts.userId, user.userId)
        });

        const totalBalance = userAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
        const accountList = userAccounts.map(a => `- ${a.name}: Rp ${Number(a.balance).toLocaleString('id-ID')}`).join("\n");

        const now = new Date();
        const financialContext = `
        [REAL-TIME USER DATA]
        - Total Balance: Rp ${totalBalance.toLocaleString('id-ID')}
        - Accounts Details:\n${accountList}
        - Date: ${now.toLocaleDateString('id-ID')}
        
        [INSTRUCTION]
        You are ChaiAi, a smart financial assistant.
        - Use the data above to answer user questions about their balance/money.
        - If the balance is low (< 100k), warn them nicely.
        - Answer in Bahasa Indonesia. Keep it short and helpful.
        `;

        await sendTelegramMessage(chatId, "typing..."); // Send visual feedback

        try {
            const aiResponse = await getAICompletion(text, `User Name: ${username}. ${financialContext}`);
            console.log("📤 AI Response:", aiResponse);
            await sendTelegramMessage(chatId, aiResponse);
        } catch (aiError) {
            console.error("AI Error:", aiError);
            await sendTelegramMessage(chatId, "Maaf, otak AI saya sedang gangguan signal. Coba lagi nanti.");
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("❌ Telegram Webhook Fatal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "Telegram Webhook Active" });
}
