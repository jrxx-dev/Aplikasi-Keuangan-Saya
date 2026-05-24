import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { logId, action } = body;

        if (!logId || !action) {
            return NextResponse.json(
                { success: false, message: "Missing logId or action" },
                { status: 400 }
            );
        }

        if (action === "resolve") {
            await db.update(logs)
                .set({
                    resolved: true,
                    resolvedAt: new Date(),
                    resolvedBy: session.user.id
                })
                .where(eq(logs.id, logId));

            return NextResponse.json({
                success: true,
                message: "Log marked as resolved"
            });
        } else if (action === "unresolve") {
            await db.update(logs)
                .set({
                    resolved: false,
                    resolvedAt: null,
                    resolvedBy: null
                })
                .where(eq(logs.id, logId));

            return NextResponse.json({
                success: true,
                message: "Log marked as unresolved"
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid action" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Failed to update log:", error);
        return NextResponse.json(
            { success: false, message: String(error) },
            { status: 500 }
        );
    }
}
