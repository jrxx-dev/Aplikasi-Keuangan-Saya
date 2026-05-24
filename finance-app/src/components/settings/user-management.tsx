"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    MoreHorizontal,
    Search,
    UserPlus,
    Shield,
    Briefcase,
    Loader2,
    Mail,
    Calendar,
    User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getUsers, updateUserRole, createUser, deleteUser } from "@/lib/actions/user-management";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

type Role = 'superadmin' | 'admin' | 'user';
type UserStatus = 'active' | 'inactive' | 'suspended';

type UserAccount = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    status: UserStatus;
    lastLogin?: string;
    createdAt: string;
};

export function UserManagement() {
    const { data: session } = authClient.useSession();
    const currentUserRole = (session?.user?.role as Role) || 'user';

    const [users, setUsers] = useState<UserAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<Role | 'all'>('all');

    // Dialog States
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as Role,
        phone: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            const typedData = data.map(u => ({
                ...u,
                status: u.status as UserStatus
            }));
            setUsers(typedData);
        } catch (error) {
            toast.error("Gagal memuat data user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Mohon lengkapi Nama, Email, dan Password");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone
            });

            if (!result.success) throw new Error(result.error);

            await loadUsers();
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("User Berhasil Dibuat", {
                description: `${formData.name} kini terdaftar.`
            });
        } catch (error: any) {
            toast.error("Gagal Membuat User", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);

        try {
            if (formData.role !== selectedUser.role) {
                const result = await updateUserRole(selectedUser.id, formData.role);
                if (!result.success) throw new Error(result.error);
            }
            // Future: Update other fields logic here

            await loadUsers();
            setIsEditDialogOpen(false);
            resetForm();
            toast.success("User Diupdate", { description: "Role user berhasil diubah." });
        } catch (error: any) {
            toast.error("Update Gagal", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        // Optimistic UI update
        const previousUsers = [...users];
        setUsers(users.filter(u => u.id !== userToDelete.id));

        const deletedUserName = userToDelete.name; // Keep ref for toast
        setUserToDelete(null); // Close modal

        try {
            const result = await deleteUser(userToDelete.id);
            if (!result.success) throw new Error(result.error);

            toast.success("User Dihapus Permanen", {
                description: `Akun ${deletedUserName} telah dihapus dari sistem.`
            });
        } catch (error: any) {
            setUsers(previousUsers); // Revert on failure
            toast.error("Gagal Menghapus", { description: error.message });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'user', phone: '' });
        setSelectedUser(null);
    };

    const openEditDialog = (user: UserAccount) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            phone: user.phone || ''
        });
        setIsEditDialogOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case 'superadmin': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-sm';
            case 'admin': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'user': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Kelola akses dan role pengguna aplikasi.</p>
                </div>
                {currentUserRole === 'superadmin' && (
                    <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl transition-all hover:scale-105 active:scale-95">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Tambah User Baru</DialogTitle>
                                <DialogDescription>
                                    Buat akun baru secara manual. Password default bisa diganti user nantinya.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nama Lengkap</Label>
                                        <Input
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(val: Role) => setFormData({ ...formData, role: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="superadmin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="Min 6 karakter"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Batal</Button>
                                <Button onClick={handleCreateUser} disabled={isSubmitting} className="bg-indigo-600">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                    Buat Akun
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4 border-none shadow-sm bg-muted/40 rounded-xl">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari user (nama atau email)..."
                            className="pl-9 bg-background border-none shadow-sm rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={filterRole} onValueChange={(v: any) => setFilterRole(v)}>
                            <SelectTrigger className="w-[140px] bg-background border-none shadow-sm rounded-lg">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Modern User List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Memuat data pengguna...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Tidak ada user ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 group bg-white dark:bg-zinc-900 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg",
                                            user.role === 'superadmin' ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-500/20' :
                                                user.role === 'admin' ? 'bg-gradient-to-br from-indigo-400 to-cyan-600 shadow-indigo-500/20' :
                                                    'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/20'
                                        )}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-base">{user.name}</h3>
                                                <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-5 rounded-full capitalize", getRoleBadgeColor(user.role))}>
                                                    {user.role}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                                <div className="flex items-center gap-1 hidden sm:flex">
                                                    <Calendar className="w-3 h-3" /> Bergabung: {user.createdAt}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pl-16 sm:pl-0">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg text-xs font-medium">
                                            <div className={cn("w-2 h-2 rounded-full",
                                                user.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                                                    user.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
                                            )} />
                                            <span className="capitalize">{user.status}</span>
                                        </div>

                                        {currentUserRole === 'superadmin' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                        <Briefcase className="w-4 h-4 mr-2" />
                                                        Ubah Role
                                                    </DropdownMenuItem>
                                                    {user.role !== 'superadmin' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setUserToDelete(user)}
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                                            >
                                                                <Shield className="w-4 h-4 mr-2" />
                                                                Hapus User
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogDescription>
                            Ubah hak akses untuk {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Role Akses</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val: Role) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User (Basic)</SelectItem>
                                    <SelectItem value="admin">Admin (Manager)</SelectItem>
                                    <SelectItem value="superadmin">Super Admin (Full)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleEditUser} disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Akun Permanen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus akun <strong>{userToDelete?.name}</strong>.
                            <br />
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Ya, Hapus Sekarang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
