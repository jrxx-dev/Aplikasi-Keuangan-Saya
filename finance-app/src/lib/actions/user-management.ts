"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Initialize Admin Client with Service Role Key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "superadmin") {
        throw new Error("Unauthorized: hanya superadmin yang boleh mengakses fitur ini");
    }
    return session.user;
}

export async function getUsers() {
    try {
        await requireSuperAdmin();
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error("Error fetching users:", error);
            throw new Error(error.message);
        }

        // Transform Supabase user to our UI format
        return users.map(user => ({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
            email: user.email || "",
            role: (user.user_metadata?.role || "user") as 'superadmin' | 'admin' | 'user',
            status: (user as any).banned_until ? 'suspended' : (user.email_confirmed_at ? 'active' : 'inactive'),
            createdAt: new Date(user.created_at).toISOString().split('T')[0],
            lastLogin: user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString()
                : undefined
        }));

    } catch (error) {
        console.error("Server Action Failed:", error);
        return [];
    }
}

// ... existing methods

export async function createUser(data: { email: string; password?: string; name: string; role: string; phone?: string }) {
    try {
        await requireSuperAdmin();
        const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password || "finance123", // Default password if empty
            email_confirm: true,
            user_metadata: {
                full_name: data.name,
                role: data.role,
                phone: data.phone
            }
        });

        if (error) throw error;
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(userId: string, role: string) {
    try {
        await requireSuperAdmin();
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role }
        });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        await requireSuperAdmin();
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
