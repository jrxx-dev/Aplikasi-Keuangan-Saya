import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
    console.log("Creating Super Admin via SignUp...");

    const { data, error } = await supabase.auth.signUp({
        email: "superadmin@finance.com",
        password: "admin2121",
        options: {
            data: {
                full_name: "Super Admin",
                role: "superadmin"
            }
        }
    });

    if (error) {
        console.error("❌ Error:", error.message);
    } else {
        console.log("✅ Admin created (Please check email if confirmation is enabled):", data.user?.id);
        console.log("Email: superadmin@finance.com");
        console.log("Pass: admin2121");
    }
    process.exit(0);
}

main();
