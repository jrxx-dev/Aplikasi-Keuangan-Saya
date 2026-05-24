import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getFinancialSummary,
    getRecentTransactions,
    getCategoryBreakdown,
    getFinancialAnalytics,
    getAccounts
} from "@/lib/actions/finance";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
    console.log("Chat API POST (OpenRouter SDK - Mimo)");
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { messages } = body;

        // --- 1. PREPARE CONTEXT ---
        const [summary, recentTransactions, categoryBreakdown, analytics, userAccounts] = await Promise.all([
            getFinancialSummary().catch(() => ({ balance: 0, income: 0, expense: 0 })),
            getRecentTransactions().catch(() => []),
            getCategoryBreakdown().catch(() => ({})),
            getFinancialAnalytics().catch(() => ({})),
            getAccounts().catch(() => [])
        ]);

        const context = `
        Context Date: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        
        FINANCIAL DATA:
        - Net Worth: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.balance)}
        - Income (Month): ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.income)}
        - Expense (Month): ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.expense)}
        
        ACCOUNTS:
        ${userAccounts.map((acc: any, idx: number) => `${idx + 1}. [ID: ${acc.id}] ${acc.name} (${acc.type}): ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(acc.balance))}`).join('\n        ')}
        
        RECENT TRANSACTIONS (Gunakan ID untuk update/delete):
        ${recentTransactions.map((t: any) => `- [ID: ${t.id}] [${new Date(t.date).toISOString().split('T')[0]}] ${t.description} (${t.category || 'Tanpa Kategori'}): ${t.type === 'income' ? '+' : '-'}${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(t.amount))}`).join('\n        ')}
        `;

        const systemInstruction = `Anda adalah FinanceMy AI, asisten keuangan pribadi yang handal.
        Tugas: Analisis keuangan, catat transaksi, dan bantu kelola saldo user secara akurat.
        
        DATA USER TERBARU:
        ${context}

        PANDUAN OPERASI:
        1. ANALISIS: Jika user bertanya tentang kondisi keuangan, gunakan DATA USER di atas untuk menjawab secara detail dan profesional.
        2. TRANSAKSI: Jika user ingin mencatat, merubah, atau menghapus transaksi dan datanya cukup, JANGAN MEMINTA KONFIRMASI ULANG. Langsung kerjakan dan sertakan tag ACTION di akhir pesan.
        3. FORMAT ACTION (WAJIB di akhir pesan, JSON mentah tanpa markdown):
           :::ACTION:{"action": "create"|"update_balance"|"delete"|"update"|"delete_account"|"update_account", "data": {...}, "targetIds": ["..."]}:::
        
        SKEMA DATA ACTION:
        - create: {"action": "create", "data": {"type": "expense"|"income", "amount": number, "description": "nama", "account": "nama_akun"}}
        - update: {"action": "update", "targetIds": ["ID_TRANSAKSI"], "criteria": {"description": "...", "date": "YYYY-MM-DD", "amount": 0}, "data": {"amount": number, "description": "nama", "type": "income"|"expense"}}
        - delete: {"action": "delete", "targetIds": ["ID_TRANSAKSI"], "criteria": {"description": "...", "date": "YYYY-MM-DD", "amount": 0}}
        - update_balance (Penyesuaian Saldo): {"action": "update_balance", "data": {"account": "nama_akun", "balance": number}}
        - update_account: {"action": "update_account", "data": {"id": "ID_AKUN", "name": "nama baru", "balance": number, "type": "bank"|"cash"|"wallet"}}
        - delete_account: {"action": "delete_account", "data": {"id": "ID_AKUN"}}

        PENTING: 
        - Selalu gunakan Mata Uang Rupiah (IDR).
        - Gunakan 'targetIds' jika ID tersedia di RECENT TRANSACTIONS.
        - JIKA ID TIDAK DITEMUKAN: Gunakan 'criteria' (description, date, amount) untuk mencari transaksi tersebut.
        - 'criteria' hanya digunakan jika 'targetIds' kosong.
        - Jangan berikan markdown (\`\`\`json) di dalam tag ACTION. Letakkan tag tersebut secara mentah di akhir teks.
        `;

        // Helper to clean history for AI (remove ACTION tags and thinking blocks)
        const cleanMessageContent = (content: string) => {
            return content
                .replace(/:::ACTION:[\s\S]*?:::/g, "") // Remove action tags
                .replace(/\*Thinking\.\.\.\*[\s\S]*?\n\n/g, "") // Remove thinking blocks
                .trim();
        };

        const formattedMessages = [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({
                role: m.role,
                content: cleanMessageContent(m.content)
            })).filter((m: any) => m.content && m.content.length > 0)
        ];

        console.log("🚀 [SERVER] Sending request to OpenRouter (Mimo)...");
        // console.log("Context Data Length:", context.length);

        try {
            const stream = await openrouter.chat.send({
                model: "xiaomi/mimo-v2-flash:free",
                messages: formattedMessages,
                stream: true,
                streamOptions: {
                    includeUsage: true
                }
            });

            console.log("✅ [SERVER] Stream started successfully");

            const responseStream = new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder();
                    try {
                        for await (const chunk of stream) {
                            if (!chunk || !chunk.choices || chunk.choices.length === 0) continue;

                            const content = chunk.choices[0].delta?.content || "";
                            const reasoning = (chunk.choices[0].delta as any)?.reasoning || "";

                            if (content || reasoning) {
                                const sseMessage = `data: ${JSON.stringify({
                                    choices: [{
                                        delta: {
                                            content,
                                            reasoning
                                        }
                                    }]
                                })}\n\n`;
                                controller.enqueue(encoder.encode(sseMessage));
                            }
                        }
                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (err) {
                        console.error("❌ [SERVER] Stream Loop Error:", err);
                        controller.error(err);
                    }
                }
            });

            return new Response(responseStream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });

        } catch (apiError: any) {
            console.error("❌ [SERVER] OpenRouter SDK .chat.send error:", apiError);
            throw apiError;
        }

    } catch (error: any) {
        console.error("🔥 [SERVER] Chat API Global Error:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            status: error.status
        });
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error.toString()
        }, { status: error.status || 500 });
    }
}
