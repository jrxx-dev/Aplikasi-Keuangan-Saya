"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/finance/transaction-form"
import { useState } from "react"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transaksi",
  "/analytics": "Analitik",
  "/budgets": "Anggaran",
  "/goals": "Tujuan",
  "/paylater": "Paylater",
  "/reports": "Laporan",
  "/accounts": "Saldo",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = routeTitles[pathname] || "FinanceMy"
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/50 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-10">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
        <h1 className="text-base font-medium animate-in fade-in slide-in-from-left-2 duration-300">
          {title}
        </h1>

        {/* Quick Transaction Button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md rounded-full px-4 button-glow">
              <Plus className="w-4 h-4 mr-1.5" /> Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Catat Transaksi Baru</DialogTitle>
              <DialogDescription>Masukkan detail pengeluaran atau pemasukanmu.</DialogDescription>
            </DialogHeader>
            <TransactionForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}
