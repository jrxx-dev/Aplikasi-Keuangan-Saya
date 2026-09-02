import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
  error,
} = await supabase.auth.getUser();

console.log(
  "[proxy]",
  path,
  "hasEnvUrl=" + !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  "hasEnvKey=" + !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "cookies=" + request.cookies.getAll().map((c) => c.name).join("|"),
  "user=" + (user ? user.id : "null"),
  "error=" + (error ? error.message + " status=" + error.status : "none")
  );

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
