import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Coba baca service role key dengan beberapa kemungkinan nama
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Error: Missing env variables.");
    console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Please provide an email address.");
        console.log("Usage: npx tsx scripts/promote-to-superadmin.ts <email>");
        process.exit(1);
    }

    console.log(`🔍 Looking for user with email: ${email}...`);

    // 1. Get User ID by Email (Admin only)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("❌ Error listing users:", listError.message);
        process.exit(1);
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
        console.error("❌ User not found! Please log in with this email first.");
        process.exit(1);
    }

    console.log(`✅ Found user: ${user.id}`);
    console.log(`🔄 Updating role to 'superadmin'...`);

    // 2. Update User Metadata
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
            user_metadata: {
                ...user.user_metadata,
                role: 'superadmin'
            }
        }
    );

    if (updateError) {
        console.error("❌ Failed to update role:", updateError.message);
    } else {
        console.log("🎉 SUCCESS! User is now a Super Admin.");
        console.log(`👤 Name: ${data.user.user_metadata.full_name}`);
        console.log(`🛡️ Role: ${data.user.user_metadata.role}`);
        console.log("\nPlease refresh your browser to see the changes.");
    }
}

main();
