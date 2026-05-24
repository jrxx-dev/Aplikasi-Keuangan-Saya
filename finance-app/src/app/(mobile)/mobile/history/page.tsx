import { MobileHeader } from "@/components/mobile/mobile-header";
import { getAllTransactions } from "@/lib/actions/finance";
import { MobileHistoryClient } from "@/components/mobile/mobile-history-client";
import { Suspense } from "react";
import Loading from "../../loading";

export const dynamic = 'force-dynamic';

async function HistoryData() {
    const transactions = await getAllTransactions();
    return <MobileHistoryClient transactions={transactions} />;
}

export default async function MobileHistory() {
    return (
        <main className="w-full max-w-md mx-auto relative px-4 pt-[88px] font-inter">
            {/* TopAppBar: menu | Riwayat Transaksi | search */}
            <MobileHeader 
                title="Riwayat Transaksi" 
                rightAction="search" 
                leftAction="menu" 
            />
            
            <Suspense fallback={<Loading />}>
                <HistoryData />
            </Suspense>
        </main>
    );
}
