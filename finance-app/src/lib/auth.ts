import { createClient } from "@/lib/supabase/server";

export const auth = {
    api: {
        getSession: async ({ headers }: { headers: Headers }) => {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return null;
            }

            return {
                user: {
                    id: user.id,
                    email: user.email!,
                    emailVerified: !!user.email_confirmed_at,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
                    role: user.user_metadata?.role || "user",
                    image: user.user_metadata?.avatar_url || null,
                    createdAt: new Date(user.created_at),
                    updatedAt: new Date(user.updated_at || user.created_at),
                },
                session: {
                    id: 'supabase-session',
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 3600 * 1000 * 24), // Mock expiry
                    token: 'supabase-token',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ipAddress: '',
                    userAgent: ''
                }
            };
        },
        signUpEmail: async (params: { body: { email: string; password: string; name?: string } }) => {
            const supabase = await createClient();
            const { error, data } = await supabase.auth.signUp({
                email: params.body.email,
                password: params.body.password,
                options: {
                    data: {
                        full_name: params.body.name
                    }
                }
            });
            if (error) throw error;
            return { user: data.user };
        }
    }
};