
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const userId = process.argv[2];

if (!userId) {
    console.error("❌ Mohon masukkan User ID sebagai argumen.");
    console.log("Contoh: npx tsx scripts/simulate-webhook.ts user_12345");
    process.exit(1);
}

const mockUpdate = {
    update_id: 123456789,
    message: {
        message_id: 1,
        from: {
            id: 999999999, // Fake Chat ID
            is_bot: false,
            first_name: "Test User",
            username: "test_user",
            language_code: "en"
        },
        chat: {
            id: 999999999, // Fake Chat ID
            first_name: "Test User",
            username: "test_user",
            type: "private"
        },
        date: 1678900000,
        text: `/start ${userId}`
    }
};

console.log(`🚀 Mengirim simulasi Webhook ke http://localhost:3000/api/telegram...`);
console.log(`Payload: /start ${userId}`);

fetch("http://localhost:3000/api/telegram", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(mockUpdate)
})
    .then(async (res) => {
        console.log(`📡 Status: ${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log("📄 Response:", data);

        if (res.ok) {
            console.log("\n✅ Simulasi Berhasil! Cek terminal server Next.js Anda (npm run dev).");
            console.log("Harusnya ada log '📨 TELEGRAM UPDATE RECEIVED'.");
            console.log("Dan cek apakah ada pesan error di sana.");
        } else {
            console.log("\n❌ Simulasi Gagal. Server mengembalikan error.");
        }
    })
    .catch((err) => {
        console.error("\n❌ Gagal menghubungi server:", err.message);
        console.log("Pastikan 'npm run dev' sedang berjalan di port 3000.");
    });
