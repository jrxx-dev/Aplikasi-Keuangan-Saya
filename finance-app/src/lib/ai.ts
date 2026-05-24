import { OpenRouter } from "@openrouter/sdk";

// Initialize OpenRouter Client
// Ensure OPENROUTER_API_KEY is defined in your .env
const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function getAICompletion(prompt: string, context?: string) {
    if (!process.env.OPENROUTER_API_KEY) {
        console.warn("OPENROUTER_API_KEY is not set. AI features will be disabled.");
        return "AI configuration missing. Please check your API Key.";
    }

    try {
        const stream = await client.chat.send({
            model: "xiaomi/mimo-v2-flash:free",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful, smart, and witty financial assistant named 'ChaiAi'. You help users manage their finances, give savings advice, and analyze spending patterns. Keep answers concise and motivating." + (context ? `\n\nContext: ${context}` : "")
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: false, // For now, we use non-streaming for simple function calls
        });

        const content = stream.choices[0]?.message?.content;
        return typeof content === "string" ? content : JSON.stringify(content) || "Maaf, saya tidak mengerti.";
    } catch (error) {
        console.error("AI Error:", error);
        return "Terjadi kesalahan pada sistem AI kami.";
    }
}

export async function streamAIResponse(prompt: string, onChunk: (chunk: string) => void) {
    if (!process.env.OPENROUTER_API_KEY) {
        onChunk("Konfigurasi API Key AI belum dipasang.");
        return;
    }

    try {
        const stream = await client.chat.send({
            model: "xiaomi/mimo-v2-flash:free",
            messages: [
                {
                    role: "system",
                    content: "Anda adalah asisten keuangan cerdas bernama ChaiAi."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: true,
            streamOptions: {
                includeUsage: true
            }
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                onChunk(content);
            }
        }
    } catch (error) {
        console.error("Stream Error:", error);
        onChunk("\n(Koneksi terputus...)");
    }
}

export async function analyzeProductHTML(htmlContent: string) {
    if (!process.env.OPENROUTER_API_KEY) return null;

    try {
        // Truncate HTML to save tokens but keep enough context (Head + Body Start)
        // Increased to 15000 to catch more JSON-LD or meta tags
        const truncated = htmlContent.substring(0, 15000);

        const completion = await client.chat.send({
            model: "google/gemini-2.0-flash-exp:free", // Use a smarter model for extraction
            messages: [
                {
                    role: "system",
                    content: `You are an expert HTML parser for e-commerce sites (Shopee, Tokopedia, TikTok Shop, etc.). 
                    Your job is to extract product details from raw HTML.
                    
                    Rules:
                    1. Return ONLY a valid JSON object. No markdown, no explanations.
                    2. Keys required: 'name' (string), 'price' (number, raw integer, no dots/commas), 'image' (string url).
                    3. For 'price': look for "price", "harga", "amount", "offers" in JSON-LD or meta tags. 
                       If you see "Rp 5.000.000", convert to 5000000. 
                       If multiple prices exist, prefer the main product price (not installment or discount info if valid main price exists).
                    4. If price is absolutely not found, set it to null.
                    5. If the page is a "Bot Challenge" or "Captcha" or "Login", return null.`
                },
                {
                    role: "user",
                    content: `Analyze this HTML and extract product info:\n\n${truncated}`
                }
            ]
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) return null;

        const textContent = typeof raw === 'string' ? raw : (Array.isArray(raw) ? (raw as any).map((r: any) => r.text || '').join('') : String(raw));

        // Clean markdown code blocks if present
        const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (e) {
        console.error("AI Parsing Error:", e);
        return null;
    }
}
