"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const supabase = createClient();

export const signIn = {
    social: async ({ provider, redirectTo }: { provider: string, redirectTo?: string }) => {
        const queryParams: Record<string, string> = {};

        // Force consent screen to allow switching accounts
        if (provider === 'github' || provider === 'google') {
            queryParams.prompt = 'select_account';
        }

        return supabase.auth.signInWithOAuth({
            provider: provider as any,
            options: {
                redirectTo: redirectTo || `${window.location.origin}/dashboard`,
                queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined
            }
        });
    },
    email: async ({ email, password, rememberMe }: any) => {
        // Note: rememberMe is passed but currently default Supabase behavior (persistence) is used.
        // To implement session-only cookies, we would need to adjust cookie options dynamically.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true };
    }
};

export const signUp = {
    email: async ({ email, password, name }: any) => {
        return supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });
    }
};

export const signOut = async () => {
    return supabase.auth.signOut();
};

export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return { data: null };
    return {
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name,
                role: user.user_metadata?.role || 'user',
                image: user.user_metadata?.avatar_url,
            },
            session: data.session
        }
    };
};

export const useSession = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setSession({
                    user: {
                        id: data.session.user.id,
                        email: data.session.user.email,
                        name: data.session.user.user_metadata.full_name,
                        role: data.session.user.user_metadata.role || 'user',
                        image: data.session.user.user_metadata.avatar_url
                    },
                    session: data.session
                });
            } else {
                setSession(null);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession({
                    user: {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata.full_name,
                        role: session.user.user_metadata.role || 'user',
                        image: session.user.user_metadata.avatar_url
                    },
                    session: session
                });
            } else {
                setSession(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        data: session,
        isPending: loading,
        error: null
    };
};

export const authClient = {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession
};