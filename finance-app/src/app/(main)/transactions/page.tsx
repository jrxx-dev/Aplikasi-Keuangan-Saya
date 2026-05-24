import { getAllTransactions } from "@/lib/actions/finance";
import TransactionsClient from "./page-client";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function TransactionsPage() {
    // Fetch all transactions from server
    const transactions = await getAllTransactions();

    // Pass data as props to Client Component
    return <TransactionsClient initialTransactions={transactions as any} />; // eslint-disable-line @typescript-eslint/no-explicit-any
}
