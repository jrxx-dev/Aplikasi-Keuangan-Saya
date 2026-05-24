
import { fetchLinkMetadata } from '../lib/actions/scraper';

async function test() {
    console.log("Testing scraper...");
    const url = "https://www.google.com"; // Test with a safe URL first
    try {
        const result = await fetchLinkMetadata(url);
        console.log("Result:", result);
    } catch (error) {
        console.error("CRASH:", error);
    }
}

test();
