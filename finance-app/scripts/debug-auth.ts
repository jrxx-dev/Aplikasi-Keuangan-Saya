
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
    const email = `test-${Date.now()}@debug.com`;
    const password = "password123";
    console.log("Attempting Signup:", email);

    const { data, error } = await supabase.auth.signUp({
        email, password
    });

    if (error) {
        console.error("❌ Signup Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Signup Success:", data.user?.id);
    }
}

test();
