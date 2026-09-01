import { createBrowserClient } from "@supabase/ssr";

const customFetch = (input: string | URL | Request, options?: RequestInit): Promise<Response> => {
  if (options?.headers) {
    const headers = options.headers as Record<string, string>;
    Object.keys(headers).forEach(key => {
      headers[key] = headers[key].replace(/[^\x00-\x7F]/g, '');
    });
  }
  return fetch(input, options);
};

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { fetch: customFetch },
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
    );
