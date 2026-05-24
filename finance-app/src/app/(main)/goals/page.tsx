import { getGoals } from "@/lib/actions/goals";
import { getAccounts } from "@/lib/actions/finance";
import GoalsPageClient from "./page-client";

export default async function GoalsPage() {
    const [goals, accounts] = await Promise.all([
        getGoals(),
        getAccounts()
    ]);
    return <GoalsPageClient initialGoals={goals} accounts={accounts} />;
}
