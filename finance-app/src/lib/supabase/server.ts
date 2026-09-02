import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const customFetch = (input: string | URL | Request, options?: RequestInit): Promise<Response> => {
  if (options?.headers) {
    const headers = options.headers as Record<string, string>;
    Object.keys(headers).forEach(key => {
      headers[key] = headers[key].replace(/[^\x00-\x7F]/g, '');
    });
  }
  return fetch(input, options);
};

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: customFetch },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
                                 );
          } catch {
            // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          }
        },
      },
    }
    );
};
