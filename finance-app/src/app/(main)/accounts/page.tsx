"use client";

import { useState, useEffect } from "react";
import { getAccounts, deleteAccount } from "@/lib/actions/finance";
import { AccountManager } from "@/components/finance/account-manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, Gem, Smartphone, MoreVertical, Coins, TrendingUp, Eye, EyeOff, Trash2, Edit, Plus, History, ArrowDownRight, ArrowUpRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    theme?: string | null;
}

export function getUsableBalance(acc: Account): number {
    const bal = parseFloat(acc.balance || "0");
    if (acc.name && acc.name.toLowerCase().includes("bri")) {
        return Math.max(0, bal - 50000);
    }
    return bal;
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
    const [hideBalances, setHideBalances] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        async function fetchAccounts() {
            try {
                const data = await getAccounts();
                setAccounts(data);
            } catch (error) {
                console.error("Failed to fetch accounts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAccounts();
    }, []);

    // Fetch transactions for history
    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await fetch('/api/transactions');
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            }
        }
        if (showHistoryDialog) {
            fetchTransactions();
        }
    }, [showHistoryDialog]);

    const totalBalance = accounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0);
    const formatCurrency = (amount: number) => {
        if (hideBalances) return "Rp ••••••";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
    };

    const handleDeleteClick = (accountId: string) => {
        setAccountToDelete(accountId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!accountToDelete) return;

        try {
            const result = await deleteAccount(accountToDelete);
            if (result.success) {
                toast.success("Akun berhasil dihapus");
                setAccounts(accounts.filter(a => a.id !== accountToDelete));
                setDeleteDialogOpen(false);
                setAccountToDelete(null);
            } else {
                toast.error("Gagal menghapus akun");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        }
    };

    const bankAccounts = accounts.filter(a => a.type === 'bank');
    const walletAccounts = accounts.filter(a => a.type === 'wallet');
    const cashAccounts = accounts.filter(a => a.type === 'cash');

    const bankTotal = bankAccounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0);
    const walletTotal = walletAccounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0);
    const cashTotal = cashAccounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Memuat akun...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                        Saldo & Akun
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola semua sumber dana dan rekening Anda di sini.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowHistoryDialog(true)}
                        className="gap-2"
                    >
                        <History className="w-4 h-4" />
                        Riwayat Saldo
                    </Button>
                    <AccountManager />
                </div>
            </motion.div>

            {/* Total Balance Card - REDESIGNED */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="relative overflow-hidden border-none shadow-2xl">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-600"></div>

                    {/* Glassmorphism Overlay */}
                    <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>

                    {/* Decorative Circles */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                    <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <CardTitle className="text-white/90 font-medium text-sm uppercase tracking-wider">
                                    Total Kekayaan Bersih
                                </CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setHideBalances(!hideBalances)}
                                className="text-white/80 hover:text-white hover:bg-white/20"
                            >
                                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <motion.div
                            key={hideBalances ? 'hidden' : 'visible'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-white mb-2"
                        >
                            {formatCurrency(totalBalance)}
                        </motion.div>
                        <div className="flex items-center gap-2 text-white/70">
                            <Gem className="w-4 h-4" />
                            <p className="text-sm">
                                Terhitung dari <span className="font-semibold text-white">{accounts.length}</span> akun terdaftar
                            </p>
                        </div>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="text-xs text-white/70 mb-1">Bank</div>
                                <div className="text-sm font-bold text-white">{formatCurrency(bankTotal)}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="text-xs text-white/70 mb-1">E-Wallet</div>
                                <div className="text-sm font-bold text-white">{formatCurrency(walletTotal)}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="text-xs text-white/70 mb-1">Tunai</div>
                                <div className="text-sm font-bold text-white">{formatCurrency(cashTotal)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Accounts List */}
            <div className="space-y-8">
                {/* BANK ACCOUNTS */}
                {bankAccounts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/40 dark:text-blue-400">
                                    <Gem className="w-5 h-5" />
                                </span>
                                Bank Accounts
                            </h2>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(bankTotal)}</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {bankAccounts.map((account, index) => (
                                    <AccountCardItem
                                        key={account.id}
                                        account={account}
                                        onEdit={() => handleEdit(account)}
                                        onDelete={() => handleDeleteClick(account.id)}
                                        hideBalance={hideBalances}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* E-WALLETS */}
                {walletAccounts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/40 dark:text-purple-400">
                                    <Smartphone className="w-5 h-5" />
                                </span>
                                E-Wallets & Digital
                            </h2>
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(walletTotal)}</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {walletAccounts.map((account, index) => (
                                    <AccountCardItem
                                        key={account.id}
                                        account={account}
                                        onEdit={() => handleEdit(account)}
                                        onDelete={() => handleDeleteClick(account.id)}
                                        hideBalance={hideBalances}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* CASH */}
                {cashAccounts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/40 dark:text-emerald-400">
                                    <Banknote className="w-5 h-5" />
                                </span>
                                Tunai (Cash)
                            </h2>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(cashTotal)}</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {cashAccounts.map((account, index) => (
                                    <AccountCardItem
                                        key={account.id}
                                        account={account}
                                        onEdit={() => handleEdit(account)}
                                        onDelete={() => handleDeleteClick(account.id)}
                                        hideBalance={hideBalances}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* EMPTY STATE */}
                {accounts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full text-center py-16 bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border-dashed border-2"
                    >
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                            <Gem className="relative h-16 w-16 mx-auto text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Belum ada akun</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Tambahkan akun bank atau dompet digital Anda untuk mulai mencatat keuangan dengan lebih terorganisir.
                        </p>
                        <AccountManager />
                    </motion.div>
                )}
            </div>

            {/* EDIT DIALOG */}
            <AccountManager
                accountToEdit={editingAccount}
                open={!!editingAccount}
                onOpenChange={(open) => {
                    if (!open) setEditingAccount(null);
                }}
            />

            {/* DELETE CONFIRMATION DIALOG */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus akun ini? <strong>Semua transaksi yang terkait dengan akun ini juga akan dihapus.</strong> Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* BALANCE HISTORY DIALOG */}
            <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <History className="w-6 h-6 text-primary" />
                            Riwayat Perubahan Saldo
                        </DialogTitle>
                        <DialogDescription>
                            Lihat riwayat kapan dan dari mana saldo masuk ke setiap akun Anda
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {accounts.map((account) => {
                            // Filter transactions for this account
                            const accountTransactions = transactions.filter(
                                (t) => t.accountId === account.id
                            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                            if (accountTransactions.length === 0) return null;

                            return (
                                <div key={account.id} className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                {account.type === 'bank' && <Gem className="w-5 h-5 text-primary" />}
                                                {account.type === 'wallet' && <Smartphone className="w-5 h-5 text-primary" />}
                                                {account.type === 'cash' && <Banknote className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{account.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {accountTransactions.length} transaksi
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Saldo Saat Ini</p>
                                            <p className="text-xl font-bold text-primary">
                                                Rp {parseFloat(account.balance).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                                        {accountTransactions.slice(0, 10).map((transaction, idx) => {
                                            const isIncome = transaction.type === 'income';
                                            const date = new Date(transaction.date);

                                            return (
                                                <motion.div
                                                    key={transaction.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex gap-3 relative"
                                                >
                                                    {/* Timeline dot */}
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isIncome
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-rose-500 text-white'
                                                        }`}>
                                                        {isIncome ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 bg-card border rounded-lg p-3 hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge variant={isIncome ? "default" : "destructive"} className="text-xs">
                                                                        {isIncome ? 'Masuk' : 'Keluar'}
                                                                    </Badge>
                                                                    {transaction.category && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {transaction.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="font-medium text-sm">
                                                                    {transaction.description || 'Tanpa keterangan'}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>
                                                                        {date.toLocaleDateString('id-ID', {
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'
                                                                    }`}>
                                                                    {isIncome ? '+' : '-'} Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        {accountTransactions.length > 10 && (
                                            <p className="text-xs text-center text-muted-foreground py-2">
                                                Menampilkan 10 dari {accountTransactions.length} transaksi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {transactions.length === 0 && (
                            <div className="text-center py-12">
                                <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground">Belum ada riwayat transaksi</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AccountCardItem({
    account,
    onEdit,
    onDelete,
    hideBalance,
    index
}: {
    account: Account,
    onEdit: () => void,
    onDelete: () => void,
    hideBalance: boolean,
    index: number
}) {
    const balance = getUsableBalance(account);
    const formattedBalance = hideBalance ? "Rp ••••••" : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(balance);
    const isBri = account.name.toLowerCase().includes("bri");

    const getIcon = () => {
        switch (account.type) {
            case 'bank': return <Gem className="h-5 w-5" />;
            case 'wallet': return <Smartphone className="h-5 w-5" />;
            default: return <Coins className="h-5 w-5" />;
        }
    };

    const getGradient = () => {
        switch (account.type) {
            case 'bank': return "from-blue-500 to-blue-600";
            case 'wallet': return "from-purple-500 to-purple-600";
            default: return "from-emerald-500 to-emerald-600";
        }
    };

    const getTypeLabel = () => {
        switch (account.type) {
            case 'bank': return "Bank Account";
            case 'wallet': return "E-Wallet";
            default: return "Cash / Tunai";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
        >
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
                {/* Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient()}`}></div>

                {/* Action Menu */}
                <div className="absolute right-2 top-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Akun
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Akun
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient()} shadow-lg`}>
                        <div className="text-white">
                            {getIcon()}
                        </div>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold">{account.name}</CardTitle>
                        <CardDescription className="text-xs">{getTypeLabel()}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mt-2">
                        <motion.div
                            key={hideBalance ? 'hidden' : 'visible'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
                        >
                            {formattedBalance}
                        </motion.div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="font-mono">IDR</span>
                            <span>•</span>
                            <span className="uppercase">{account.type}</span>
                        </p>
                        {isBri && (
                            <p className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                                <span>🔒</span> Saldo tertahan Rp 50.000
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
