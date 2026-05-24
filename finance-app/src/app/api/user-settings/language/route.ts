import { NextRequest, NextResponse } from "next/server";
import { updateLanguagePreference, getLanguagePreference } from "@/lib/actions/user-settings";

export async function GET() {
    try {
        const result = await getLanguagePreference();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in GET /api/user-settings/language:", error);
        return NextResponse.json({ language: 'id' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { language } = body;

        if (!language || (language !== 'id' && language !== 'en')) {
            return NextResponse.json(
                { error: "Invalid language. Must be 'id' or 'en'" },
                { status: 400 }
            );
        }

        const result = await updateLanguagePreference(language);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in POST /api/user-settings/language:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
