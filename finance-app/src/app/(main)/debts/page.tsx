import { getDebts } from "@/lib/actions/debts";
import { getAccounts } from "@/lib/actions/finance";
import DebtsPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
    const debts = await getDebts();
    const accounts = await getAccounts();
    return <DebtsPageClient initialDebts={debts} accounts={accounts} />;
}
