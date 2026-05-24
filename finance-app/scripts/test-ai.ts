
import { getAICompletion, analyzeProductHTML } from '../lib/ai';

async function test() {
    console.log("Testing AI...");
    try {
        const result = await analyzeProductHTML("<html><body><h1>Test</h1></body></html>");
        console.log("Analyze result:", result);
    } catch (e) {
        console.error("AI Crash:", e);
    }
}

test();
