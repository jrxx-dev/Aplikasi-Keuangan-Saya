
require('dotenv').config({ path: '.env' });
const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN belum diset di .env");
    process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const result = JSON.parse(data);
        console.log("=== WEBHOOK STATUS ===");
        console.log(JSON.stringify(result, null, 2));
    });
}).on('error', (err) => {
    console.error("Error fetching webhook info:", err);
});
