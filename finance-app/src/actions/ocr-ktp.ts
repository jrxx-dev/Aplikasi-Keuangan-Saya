'use server';

import { OpenRouter } from "@openrouter/sdk";
import fs from "node:fs/promises";
import path from "node:path";

const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function extractKtpData(imagePath: string) {
    if (!process.env.OPENROUTER_API_KEY) {
        return { success: false, error: "API Key AI tidak ditemukan." };
    }

    try {
        // 1. Resolve file path
        // imagePath comes as "/uploads/customers/filename.jpg"
        const relativePath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
        const fullPath = path.join(process.cwd(), "public", relativePath);

        // 2. Read file and convert to base64
        const fileBuffer = await fs.readFile(fullPath);
        const base64Image = fileBuffer.toString("base64");
        const match = imagePath.match(/\.([^.]+)$/);
        const ext = match ? match[1].toLowerCase() : "jpeg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // 3. Call AI with Vision
        const completion = await client.chat.send({
            model: "google/gemini-2.0-flash-exp:free", // Capable vision model
            messages: [
                {
                    role: "system",
                    content: `You are an OCR expert for Indonesian KTP (ID Cards). 
Extract the following information from the image and return it as a CLEAN JSON object.
Fields required:
- nik (string)
- name (string)
- address (string) - Just the street/detail part
- rt_rw (string)
- village (string) - Desa/Kelurahan
- district (string) - Kecamatan
- regency (string) - Kabupaten/Kota
- province (string) - Provinsi

Rules:
1. Return ONLY JSON. No markdown formatting.
2. If a field is not clear, return empty string or null.
3. Correct any OCR errors based on common Indonesian names/places if obvious.`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Extract data from this KTP image."
                        },
                        {
                            type: "image_url",
                            imageUrl: {
                                url: dataUrl
                            }
                        }
                    ]
                }
            ]
        });

        const rawchoice = completion.choices[0]?.message;
        let rawContent = rawchoice?.content;

        if (!rawContent) {
            return { success: false, error: "Gagal membaca data dari AI." };
        }

        // Handle if content is array (OpenAI format sometimes)
        if (Array.isArray(rawContent)) {
            rawContent = rawContent.map(c => c.type === 'text' ? c.text : '').join('');
        }

        // Clean JSON
        const cleanJson = (rawContent as string)
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const data = JSON.parse(cleanJson);

        return { success: true, data };

    } catch (error) {
        console.error("OCR Error:", error);
        return { success: false, error: "Gagal memproses gambar KTP." };
    }
}
