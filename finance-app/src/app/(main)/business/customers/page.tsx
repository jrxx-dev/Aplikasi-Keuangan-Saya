import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomers } from "@/actions/business-customer";
import { CustomerList } from "@/components/business/customer-list";
import { CustomerForm } from "@/components/business/customer-form";
import { CustomerImport } from "@/components/business/excel-import";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Receipt, Building2, Landmark, TicketPercent } from "lucide-react";

export default async function CustomersPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");

    const { data: customersRaw = [] } = await getCustomers(session.user.id);
    const customers = JSON.parse(JSON.stringify(customersRaw)) as any[];

    // Filter Active Customers
    const activeCustomers = customers.filter((c: any) => c.status === "active");

    // Calculate Stats
    const totalCount = customers.length;
    const activeCount = activeCustomers.length;
    const inactiveCount = totalCount - activeCount;

    // Calculate Financials (Based on Monthly Fee of Active Customers)
    const totalTagihan = activeCustomers.reduce((acc: number, curr: any) => acc + (parseFloat(curr.monthlyFee) || 0), 0);

    // Tax Calculations (Inclusive)
    // Tagihan = DPP + PPN -> Tagihan = DPP + (DPP * 11%) -> Tagihan = DPP * 1.11
    const dpp = totalTagihan / 1.11;
    const ppn = totalTagihan - dpp;
    const bhp = dpp * 0.05; // BHP 5% from DPP

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            {/* Header & Stats Container */}
            <div className="flex flex-col gap-6">
                {/* Top Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Database Pelanggan</h1>
                        <p className="text-sm text-slate-500 mt-1">Monitor & kelola seluruh data pelanggan internet.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <CustomerImport userId={session.user.id} />
                        <CustomerForm userId={session.user.id} />
                    </div>
                </div>

                {/* Financial Breakdown Row (Matching Screenshot) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Card 1: TOTAL TAGIHAN (Blue) */}
                    <div className="relative overflow-hidden bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-600/20 text-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">TOTAL TAGIHAN</p>
                            <div className="text-xl font-bold leading-none mt-1">
                                Rp {totalTagihan.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <Receipt className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                    </div>

                    {/* Card 2: TOTAL DPP */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DPP</p>
                            <div className="text-xl font-bold text-slate-900 leading-none mt-1">
                                Rp {Math.round(dpp).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: PPN (11%) */}
                    <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center">
                            <Landmark className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">PPN (11%)</p>
                            <div className="text-xl font-bold text-rose-600 leading-none mt-1">
                                Rp {Math.round(ppn).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>

                    {/* Card 4: BHP (5%) */}
                    <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                            <TicketPercent className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">BHP (5%)</p>
                            <div className="text-xl font-bold text-amber-600 leading-none mt-1">
                                Rp {Math.round(bhp).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Count Stats (Secondary Row) */}
                {/* Active Customer Count Banner */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <UserCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-emerald-900">Total Pelanggan Aktif</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">{activeCount}</span>
                </div>
            </div>

            {/* Main Content */}
            <Card className="border-none shadow-sm bg-card">
                <CardHeader>
                    <CardTitle>Daftar Pelanggan</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerList data={customers || []} userId={session.user.id} />
                </CardContent>
            </Card>
        </div>
    );
}
