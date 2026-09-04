import { NextRequest, NextResponse } from "next/server";
import { createLog } from "@/lib/actions/logs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ALLOWED_LEVELS = new Set(["info", "warning", "error", "success"]);
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Only logged-in users can write client error logs (prevents anonymous log flooding).
        if (!session?.user) {
            return NextResponse.json({ success: true });
        }

        const body = await request.json();
        const { level, action, message, metadata } = body;

        let safeMetadata: Record<string, unknown> = {};
        try {
            safeMetadata = JSON.parse(JSON.stringify(metadata ?? {}));
            if (JSON.stringify(safeMetadata).length > 4000) safeMetadata = { truncated: true };
        } catch {
            safeMetadata = {};
        }

        // Log to database
        await createLog({
            userId: session.user.id,
            level: ALLOWED_LEVELS.has(level) ? level : "error",
            action: clip(action, 100) || "client_error",
            message: clip(message, 1000) || "Unknown error",
            metadata: safeMetadata,
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
            userAgent: clip(request.headers.get("user-agent"), 400)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to log error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
