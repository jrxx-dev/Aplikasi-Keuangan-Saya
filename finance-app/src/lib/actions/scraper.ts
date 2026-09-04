"use server";

import * as cheerio from 'cheerio';
import { isIP, BlockList } from 'node:net';
import { lookup } from 'node:dns/promises';
import { analyzeProductHTML } from '@/lib/ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// SSRF guard: reject hosts that resolve to non-public address space.
const privateRanges = new BlockList();
privateRanges.addSubnet('10.0.0.0', 8, 'ipv4');
privateRanges.addSubnet('172.16.0.0', 12, 'ipv4');
privateRanges.addSubnet('192.168.0.0', 16, 'ipv4');
privateRanges.addSubnet('127.0.0.0', 8, 'ipv4');
privateRanges.addSubnet('169.254.0.0', 16, 'ipv4'); // link-local (cloud metadata)
privateRanges.addSubnet('100.64.0.0', 10, 'ipv4'); // carrier-grade NAT
privateRanges.addSubnet('0.0.0.0', 8, 'ipv4');
privateRanges.addAddress('::1', 'ipv6');
privateRanges.addSubnet('fc00::', 7, 'ipv6'); // unique local
privateRanges.addSubnet('fe80::', 10, 'ipv6'); // link-local

function isBlockedIp(ip: string): boolean {
    const family = isIP(ip);
    if (family === 0) return true;
    return privateRanges.check(ip, family === 6 ? 'ipv6' : 'ipv4');
}

async function assertPublicUrl(raw: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return { ok: false, error: "Invalid URL" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { ok: false, error: "Only http/https URLs are allowed" };
    }
    const host = parsed.hostname.replace(/^\[|\]$/g, "");
    if (isIP(host)) {
        if (isBlockedIp(host)) return { ok: false, error: "URL points to a non-public address" };
    } else {
        if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
            return { ok: false, error: "URL points to a non-public address" };
        }
        try {
            const results = await lookup(host, { all: true });
            if (results.length === 0 || results.some((r) => isBlockedIp(r.address))) {
                return { ok: false, error: "URL points to a non-public address" };
            }
        } catch {
            return { ok: false, error: "Could not resolve host" };
        }
    }
    return { ok: true, url: parsed.toString() };
}

export async function fetchLinkMetadata(url: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return { error: "Unauthorized" };

        if (!url) return { error: "URL is empty" };

        const guard = await assertPublicUrl(url);
        if (!guard.ok) return { error: guard.error };
        const targetUrl = guard.url;

        console.log(`[Scraper] Executing Fetch (Mobile UA): ${targetUrl}`);

        // Revert to Mobile UA (Often less protected/simpler HTML)
        const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

        let html = "";
        let responseStatus = 0;

        try {
            // Follow redirects manually so every hop passes the SSRF guard.
            let current = targetUrl;
            let response: Response | null = null;
            for (let hop = 0; hop < 5; hop++) {
                const r = await fetch(current, {
                    headers: {
                        'User-Agent': UA,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'no-cache',
                    },
                    redirect: "manual",
                    signal: AbortSignal.timeout(12000),
                    next: { revalidate: 0 }
                });
                if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
                    const next = new URL(r.headers.get("location")!, current).toString();
                    const g = await assertPublicUrl(next);
                    if (!g.ok) return { error: g.error };
                    current = g.url;
                    continue;
                }
                response = r;
                break;
            }
            if (!response) return { error: "Too many redirects" };

            responseStatus = response.status;
            if (response.ok) {
                const contentType = response.headers.get("content-type") || "";
                if (contentType && !/(text\/html|application\/xhtml|text\/plain|application\/xml)/i.test(contentType)) {
                    return { error: "Unsupported content type" };
                }
                // Cap body size (~3MB) to avoid memory abuse.
                const buf = new Uint8Array(await response.arrayBuffer()).slice(0, 3 * 1024 * 1024);
                html = new TextDecoder().decode(buf);
            } else {
                console.warn(`[Scraper] HTTP Error: ${response.status}`);
            }
        } catch (e: any) {
            console.error("[Scraper] Fetch Failed:", e);
            return { error: "Connection failed" };
        }

        if (!html) return { error: `Failed to load page (Status: ${responseStatus})` };

        // --- PARSING ---
        const $ = cheerio.load(html);

        // Basic Metadata
        let title =
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            "";

        title = title
            .replace(/\| Shopee Indonesia/gi, "")
            .replace(/\| Tokopedia/gi, "")
            .replace(/^Jual /gi, "") // Remove starting "Jual"
            .trim();

        let image = $('meta[property="og:image"]').attr('content') || "";
        // Fallbacks
        if (!image || image.includes('blank') || image.includes('data:')) {
            image = $('img[data-testid="PDPMainImage"]').attr('src') || "";
            if (!image) image = $('div.product-image').find('img').attr('src') || "";
        }

        // Price Extraction
        let priceMatches: number[] = [];

        // 1. JSON-LD (Iterate all scripts)
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const raw = $(el).html();
                if (!raw) return;
                const json = JSON.parse(raw);

                const extract = (obj: any) => {
                    if (!obj) return;
                    if (obj['@type'] === 'Product') {
                        if ((!image || image === "") && obj.image) image = Array.isArray(obj.image) ? obj.image[0] : obj.image;
                        if ((!title || title.length < 5) && obj.name) title = obj.name;
                    }
                    if (obj.offers) {
                        const offs = Array.isArray(obj.offers) ? obj.offers : [obj.offers];
                        offs.forEach((o: any) => {
                            if (o.price) priceMatches.push(Number(o.price));
                            if (o.lowPrice) priceMatches.push(Number(o.lowPrice));
                            // Handle "price": "125000" types
                        });
                    }
                };
                if (Array.isArray(json)) json.forEach(extract);
                else extract(json);
            } catch { }
        });

        // 2. Meta Tags
        const ogPrice = $('meta[property="product:price:amount"]').attr('content') ||
            $('meta[property="og:price:amount"]').attr('content');
        if (ogPrice) priceMatches.push(Number(ogPrice));

        // 3. Fallback: Search for "format-rp" patterns in body text (Naive but sometimes works for SSR)
        // const bodyText = $('body').text();
        // const rpMatches = bodyText.match(/Rp\s?[\d\.]+/g);
        // if (rpMatches) ... (Too risky, might pick up unrelated numbers)

        priceMatches = priceMatches
            .filter(p => !isNaN(p) && p > 500)
            .sort((a, b) => b - a); // Sort HIGHEST first to avoid installment/DP low numbers? 
        // Actually Shopee often lists "original price" (high) and "sale price" (low). 
        // Let's stick to simple logic: usually the first match in JSON-LD is reliable.
        // Safety: If multiple, take the max? Or median? 
        // Let's take the *Min* above 500 (usually real price) if multiple exist, assuming others are "inflated before discount"?
        // Revert sort to Ascending (Low -> High)

        priceMatches.sort((a, b) => a - b);

        let finalPrice = priceMatches.length > 0 ? priceMatches[0] : null;

        // AI Fallback
        const isBotDetection = html.includes("robot") || html.includes("captcha") || title.includes("Bot Verification");

        let aiUsed = false;
        if (!finalPrice && !isBotDetection) {
            console.log("[Scraper] Price missing. Engaging AI...");
            const aiResult = await analyzeProductHTML(html);
            aiUsed = true;
            if (aiResult) {
                if (aiResult.price && Number(aiResult.price) > 500) finalPrice = Number(aiResult.price);
                if (aiResult.image && (!image || image.length < 10)) image = aiResult.image;
                if (aiResult.name && (!title || title.length < 5)) title = aiResult.name;
            }
        }

        // Platform
        let platform: 'shopee' | 'tokopedia' | 'tiktok' | 'other' = 'other';
        if (url.includes('shopee')) platform = 'shopee';
        else if (url.includes('tokopedia')) platform = 'tokopedia';
        else if (url.includes('tiktok')) platform = 'tiktok';

        return {
            title: title || "Produk",
            image,
            price: finalPrice,
            platform,
            isPriceHidden: !finalPrice,
            debug: `AI: ${aiUsed ? 'Active' : 'Idle'} | Found: ${finalPrice}`
        };

    } catch (error: any) {
        console.error("Scraper Critical Error:", error);
        return { error: "Server error while reading the link" };
    }
}
