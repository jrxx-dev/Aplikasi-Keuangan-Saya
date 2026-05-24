"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Plus, Trash2, Tag, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/lib/actions/categories";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Category = {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
};

export function CategoryManager({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

    // Form states
    const [newCatName, setNewCatName] = useState("");
    const [newCatIcon, setNewCatIcon] = useState("📦");

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editIcon, setEditIcon] = useState("");

    useEffect(() => {
        if (open) {
            loadCategories();
        }
    }, [open]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data as Category[]);
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error('❌ Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newCatName.trim()) {
            toast.error('❌ Nama kategori tidak boleh kosong');
            return;
        }

        try {
            const result = await createCategory({
                name: newCatName,
                type: activeTab,
                icon: newCatIcon,
                color: "#6b7280"
            });

            if (result.success) {
                toast.success('✅ Kategori berhasil ditambahkan!');
                setNewCatName("");
                setNewCatIcon("📦");
                await loadCategories();
            } else {
                toast.error('❌ ' + (result.error || 'Gagal menambah kategori'));
            }
        } catch (error) {
            console.error('Failed to create category:', error);
            toast.error('❌ Terjadi kesalahan');
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditIcon(cat.icon);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editName.trim()) {
            toast.error('❌ Nama kategori tidak boleh kosong');
            return;
        }

        try {
            const result = await updateCategory({
                id,
                name: editName,
                icon: editIcon,
                color: "#6b7280"
            });

            if (result.success) {
                toast.success('✅ Kategori berhasil diupdate!');
                setEditingId(null);
                await loadCategories();
            } else {
                toast.error('❌ ' + (result.error || 'Gagal mengupdate kategori'));
            }
        } catch (error) {
            console.error('Failed to update category:', error);
            toast.error('❌ Terjadi kesalahan');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditIcon("");
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            const result = await deleteCategory(id);
            if (result.success) {
                toast.success('✅ Kategori berhasil dihapus!');
                await loadCategories();
            } else {
                toast.error('❌ ' + (result.error || 'Gagal menghapus kategori'));
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.error('❌ Terjadi kesalahan');
        }
    };

    const expenseCategories = categories.filter(cat => cat.type === "expense");
    const incomeCategories = categories.filter(cat => cat.type === "income");

    const renderCategoryItem = (cat: Category, bgColor: string) => {
        const isEditing = editingId === cat.id;

        if (isEditing) {
            return (
                <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-accent border-2 border-primary"
                >
                    <Input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-16 h-10 text-center text-xl"
                        maxLength={2}
                    />
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-10"
                        placeholder="Nama kategori"
                        autoFocus
                    />
                    <Button
                        size="sm"
                        onClick={() => handleSaveEdit(cat.id)}
                        className="bg-emerald-500 hover:bg-emerald-600"
                    >
                        Simpan
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                    >
                        Batal
                    </Button>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={cat.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors border"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${bgColor} text-white text-xl`}>
                        {cat.icon}
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                        onClick={() => handleEdit(cat)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                        onClick={() => handleDelete(cat.id, cat.name)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Settings2 className="w-4 h-4" />
                        Atur Kategori
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-indigo-500" />
                        Manajemen Kategori
                    </DialogTitle>
                    <DialogDescription>
                        Kelola kategori transaksi untuk pengeluaran dan pemasukan.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="expense" className="gap-2">
                            <span className="text-rose-500">💸</span>
                            Pengeluaran
                            <span className="ml-1 text-xs text-muted-foreground">({expenseCategories.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="income" className="gap-2">
                            <span className="text-emerald-500">💰</span>
                            Pemasukan
                            <span className="ml-1 text-xs text-muted-foreground">({incomeCategories.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="expense" className="space-y-4 mt-4">
                        {/* ADD FORM */}
                        <div className="flex flex-col gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-900">
                            <Label className="text-sm font-bold text-rose-700 dark:text-rose-400">Tambah Kategori Pengeluaran</Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Input
                                    placeholder="Nama kategori..."
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="h-9"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                                <Input
                                    placeholder="📦"
                                    value={newCatIcon}
                                    onChange={(e) => setNewCatIcon(e.target.value)}
                                    className="h-9 w-16 text-center text-xl"
                                    maxLength={2}
                                />
                            </div>
                            <Button onClick={handleAdd} disabled={!newCatName.trim()} size="sm" className="w-full bg-rose-500 hover:bg-rose-600">
                                <Plus className="w-4 h-4 mr-2" /> Tambah
                            </Button>
                        </div>

                        {/* CATEGORY LIST */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Daftar Kategori ({expenseCategories.length})</Label>
                            <ScrollArea className="h-[250px] rounded-md border p-2">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                        Memuat kategori...
                                    </div>
                                ) : expenseCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <p className="text-sm text-muted-foreground">Belum ada kategori pengeluaran</p>
                                        <p className="text-xs text-muted-foreground mt-1">Tambahkan kategori baru di atas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <AnimatePresence initial={false}>
                                            {expenseCategories.map((cat) => renderCategoryItem(cat, "bg-rose-500"))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="income" className="space-y-4 mt-4">
                        {/* ADD FORM */}
                        <div className="flex flex-col gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-900">
                            <Label className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Tambah Kategori Pemasukan</Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Input
                                    placeholder="Nama kategori..."
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="h-9"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                                <Input
                                    placeholder="💰"
                                    value={newCatIcon}
                                    onChange={(e) => setNewCatIcon(e.target.value)}
                                    className="h-9 w-16 text-center text-xl"
                                    maxLength={2}
                                />
                            </div>
                            <Button onClick={handleAdd} disabled={!newCatName.trim()} size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="w-4 h-4 mr-2" /> Tambah
                            </Button>
                        </div>

                        {/* CATEGORY LIST */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Daftar Kategori ({incomeCategories.length})</Label>
                            <ScrollArea className="h-[250px] rounded-md border p-2">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                        Memuat kategori...
                                    </div>
                                ) : incomeCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <p className="text-sm text-muted-foreground">Belum ada kategori pemasukan</p>
                                        <p className="text-xs text-muted-foreground mt-1">Tambahkan kategori baru di atas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <AnimatePresence initial={false}>
                                            {incomeCategories.map((cat) => renderCategoryItem(cat, "bg-emerald-500"))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Selesai</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
