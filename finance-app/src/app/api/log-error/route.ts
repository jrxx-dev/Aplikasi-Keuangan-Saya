import { NextRequest, NextResponse } from "next/server";
import { createLog } from "@/lib/actions/logs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        const body = await request.json();
        const { level, action, message, metadata } = body;

        // Log to database
        await createLog({
            userId: session?.user?.id || undefined,
            level: level || "error",
            action: action || "client_error",
            message: message || "Unknown error",
            metadata: metadata || {},
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
            userAgent: request.headers.get("user-agent") || undefined
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to log error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
