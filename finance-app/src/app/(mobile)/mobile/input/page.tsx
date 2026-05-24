import { MobileHeader } from "@/components/mobile/mobile-header";
import { MobileInputClient } from "@/components/mobile/mobile-input-client";
import { getAccounts, getCategories, getRecentTransactions } from "@/lib/actions/finance";
import Link from "next/link";
import { X } from "lucide-react";
import { Suspense } from "react";
import Loading from "../../loading";

export const dynamic = 'force-dynamic';

async function InputData() {
    const [accounts, categories, recentTx] = await Promise.all([
        getAccounts(),
        getCategories(),
        getRecentTransactions()
    ]);

    return (
        <MobileInputClient 
            accounts={accounts} 
            categories={categories} 
            recentTransactions={recentTx} 
        />
    );
}

export default async function MobileInput() {
    return (
        <main className="w-full max-w-md mx-auto relative px-4 pt-[88px]">
            <MobileHeader 
                title="Tambah Catatan" 
                leftAction="close" 
                rightAction="none" 
            />

            <Suspense fallback={<Loading />}>
                <InputData />
            </Suspense>
        </main>
    );
}
