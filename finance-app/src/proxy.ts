import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const customFetch = (input: string | URL | Request, options?: RequestInit): Promise<Response> => {
  if (options?.headers) {
    const headers = options.headers as Record<string, string>;
    Object.keys(headers).forEach(key => {
      headers[key] = headers[key].replace(/[^\x00-\x7F]/g, '');
    });
  }
  return fetch(input, options);
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

let response = NextResponse.next({
  request: {
    headers: request.headers,
  },
});

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: { fetch: customFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
                             );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
                             );
      },
    },
  }
  );

const {
  data: { user },
} = await supabase.auth.getUser();

const publicPaths = ["/", "/sign-in", "/sign-up", "/forgot-password"];

const isPublicPath = publicPaths.includes(path) ||
  path.startsWith("/auth/") ||
  path.startsWith("/api/");

if (!user && !isPublicPath) {
  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  return NextResponse.redirect(url);
}

return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
