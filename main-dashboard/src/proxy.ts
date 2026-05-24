import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const isAuth = request.cookies.has("finance_dashboard_auth");

    const rootPath = request.nextUrl.pathname;

    // allow public paths
    if (rootPath === "/login" || rootPath.startsWith("/portofolio") || rootPath.startsWith("/_next") || rootPath.startsWith("/api") || rootPath === "/favicon.ico") {
        return NextResponse.next();
    }

    if (!isAuth) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
