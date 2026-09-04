import { ErrorLogsClient } from "@/components/logs/error-logs-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllLogs } from "@/lib/actions/logs";

export const dynamic = "force-dynamic";

export default async function ErrorLogsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/");
    }

    // Logs are app-wide and contain other users' IPs / financial metadata.
    if (session.user.role !== "superadmin") {
        redirect("/dashboard");
    }

    // Fetch all logs from database (no limit)
    const { logs } = await getAllLogs();

    return <ErrorLogsClient initialLogs={logs as any} />;
}
