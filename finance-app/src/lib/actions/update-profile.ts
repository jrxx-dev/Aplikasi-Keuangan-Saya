"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(data: { name?: string; bio?: string; email?: string; image?: string; job?: string; location?: string; website?: string; phone?: string }) {
    const supabase = await createClient();

    const updates: any = {
        data: {}
    };

    if (data.name) updates.data.full_name = data.name;
    if (data.bio) updates.data.bio = data.bio;
    if (data.image) updates.data.avatar_url = data.image; // Support avatar update
    // Email update requires separate handling typically, but let's try direct update (might send confirmation)
    if (data.email) updates.email = data.email;

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updatePassword(password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
