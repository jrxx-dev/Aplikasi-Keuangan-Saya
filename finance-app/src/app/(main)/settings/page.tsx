import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { userSettings } from "@/db/schema/finance";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/");
    }

    // Providers are managed by Supabase Auth
    const providers = ["email"];

    // Fetch User Settings for Telegram
    const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, session.user.id)
    });

    const telegramData = settings ? {
        connected: !!settings.telegramChatId,
        username: settings.telegramUsername,
        chatId: settings.telegramChatId
    } : null;

    return <SettingsPageClient user={session.user as any} providers={providers} telegramData={telegramData} />;
}
