import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
    console.log("Supabase URL:", supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching accounts...");
    const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*');

    if (accError) {
        console.error("Accounts error:", accError);
    } else {
        console.log("Accounts found:");
        console.log(JSON.stringify(accounts, null, 2));
    }

    console.log("\nFetching user settings...");
    const { data: settings, error: setError } = await supabase
        .from('user_settings')
        .select('*');

    if (setError) {
        console.error("Settings error:", setError);
    } else {
        console.log("Settings found:");
        console.log(JSON.stringify(settings, null, 2));
    }
}

main();
