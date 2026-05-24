import { getAccounts, getAllTransactions, getCategories } from "@/lib/actions/finance";
import SavingsPageClient from "./page-client";

export default async function SavingsPage() {
    const [accounts, transactions, categories] = await Promise.all([
        getAccounts(),
        getAllTransactions(),
        getCategories()
    ]);

    return <SavingsPageClient accounts={accounts} transactions={transactions} categories={categories} />;
}
