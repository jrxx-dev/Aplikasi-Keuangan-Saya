import { getDebts } from "@/lib/actions/debts";
import PaylaterPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function PaylaterPage() {
    const debts = await getDebts();
    return <PaylaterPageClient initialDebts={debts} />;
}
