"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    ShieldCheck,
    User,
    Users,
    Settings,
    Eye,
    Edit,
    Trash2,
    Plus,
    FileText,
    Database,
    Lock,
    Unlock,
    Crown,
    AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

// Permission types
type Permission = {
    id: string;
    name: string;
    description: string;
    category: 'transactions' | 'accounts' | 'budgets' | 'reports' | 'settings' | 'users';
};

type RolePermissions = {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
};

type Role = 'superadmin' | 'admin' | 'user';

const permissions: Permission[] = [
    // Transactions
    { id: 'transactions_view', name: 'View Transactions', description: 'Can view all transactions', category: 'transactions' },
    { id: 'transactions_create', name: 'Create Transactions', description: 'Can add new transactions', category: 'transactions' },
    { id: 'transactions_edit', name: 'Edit Transactions', description: 'Can modify existing transactions', category: 'transactions' },
    { id: 'transactions_delete', name: 'Delete Transactions', description: 'Can remove transactions', category: 'transactions' },

    // Accounts
    { id: 'accounts_view', name: 'View Accounts', description: 'Can view all accounts', category: 'accounts' },
    { id: 'accounts_create', name: 'Create Accounts', description: 'Can add new accounts', category: 'accounts' },
    { id: 'accounts_edit', name: 'Edit Accounts', description: 'Can modify accounts', category: 'accounts' },
    { id: 'accounts_delete', name: 'Delete Accounts', description: 'Can remove accounts', category: 'accounts' },

    // Budgets
    { id: 'budgets_view', name: 'View Budgets', description: 'Can view budgets', category: 'budgets' },
    { id: 'budgets_create', name: 'Create Budgets', description: 'Can create budgets', category: 'budgets' },
    { id: 'budgets_edit', name: 'Edit Budgets', description: 'Can modify budgets', category: 'budgets' },
    { id: 'budgets_delete', name: 'Delete Budgets', description: 'Can remove budgets', category: 'budgets' },

    // Reports
    { id: 'reports_view', name: 'View Reports', description: 'Can view financial reports', category: 'reports' },
    { id: 'reports_export', name: 'Export Reports', description: 'Can export reports', category: 'reports' },
    { id: 'reports_advanced', name: 'Advanced Analytics', description: 'Access to advanced analytics', category: 'reports' },

    // Settings
    { id: 'settings_view', name: 'View Settings', description: 'Can view app settings', category: 'settings' },
    { id: 'settings_edit', name: 'Edit Settings', description: 'Can modify app settings', category: 'settings' },
    { id: 'settings_system', name: 'System Settings', description: 'Can modify system settings', category: 'settings' },

    // Users (Admin only)
    { id: 'users_view', name: 'View Users', description: 'Can view all users', category: 'users' },
    { id: 'users_create', name: 'Create Users', description: 'Can add new users', category: 'users' },
    { id: 'users_edit', name: 'Edit Users', description: 'Can modify user details', category: 'users' },
    { id: 'users_delete', name: 'Delete Users', description: 'Can remove users', category: 'users' },
    { id: 'users_roles', name: 'Manage Roles', description: 'Can assign roles to users', category: 'users' },
];

const categoryIcons = {
    transactions: FileText,
    accounts: Database,
    budgets: Settings,
    reports: Eye,
    settings: Settings,
    users: Users,
};

const categoryColors = {
    transactions: 'from-blue-500 to-cyan-500',
    accounts: 'from-green-500 to-emerald-500',
    budgets: 'from-purple-500 to-pink-500',
    reports: 'from-orange-500 to-amber-500',
    settings: 'from-gray-500 to-slate-500',
    users: 'from-indigo-500 to-violet-500',
};

export function RolePermissions() {
    const [currentUserRole, setCurrentUserRole] = useState<Role>('user');
    const [selectedRole, setSelectedRole] = useState<Role>('user');
    const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    const { data: session } = authClient.useSession();

    useEffect(() => {
        // Load current user role from session/auth
        if (session?.user?.role) {
            setCurrentUserRole(session.user.role as Role);
        } else {
            const userRole = (localStorage.getItem('user_role') || 'user') as Role;
            setCurrentUserRole(userRole);
        }

        // Load permissions for selected role
        loadRolePermissions(selectedRole);
    }, [selectedRole, session]);

    const loadRolePermissions = (role: Role) => {
        // Load from localStorage (in production, this would be from API)
        const savedPermissions = localStorage.getItem(`permissions_${role}`);

        if (savedPermissions) {
            setRolePermissions(JSON.parse(savedPermissions));
        } else {
            // Set default permissions
            const defaults = getDefaultPermissions(role);
            setRolePermissions(defaults);
        }
    };

    const getDefaultPermissions = (role: Role): Record<string, boolean> => {
        const perms: Record<string, boolean> = {};

        permissions.forEach(permission => {
            if (role === 'superadmin') {
                // SuperAdmin has all permissions
                perms[permission.id] = true;
            } else if (role === 'admin') {
                // Admin has most permissions except user management
                perms[permission.id] = !permission.id.startsWith('users_roles');
            } else {
                // User has basic view/create permissions
                perms[permission.id] = permission.id.includes('view') ||
                    permission.id.includes('create') &&
                    permission.category !== 'users' &&
                    permission.category !== 'settings';
            }
        });

        return perms;
    };

    const togglePermission = (permissionId: string) => {
        if (currentUserRole !== 'superadmin') {
            toast.error("Access Denied", {
                description: "Only SuperAdmin can modify permissions"
            });
            return;
        }

        setRolePermissions(prev => ({
            ...prev,
            [permissionId]: !prev[permissionId]
        }));
    };

    const savePermissions = async () => {
        if (currentUserRole !== 'superadmin') {
            toast.error("Access Denied", {
                description: "Only SuperAdmin can save permissions"
            });
            return;
        }

        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage (in production, this would be API call)
        localStorage.setItem(`permissions_${selectedRole}`, JSON.stringify(rolePermissions));

        setIsSaving(false);
        toast.success("Permissions Updated", {
            description: `${selectedRole} permissions have been saved successfully`
        });
    };

    const resetToDefaults = () => {
        if (currentUserRole !== 'superadmin') {
            toast.error("Access Denied");
            return;
        }

        if (!confirm(`Reset ${selectedRole} permissions to defaults?`)) return;

        const defaults = getDefaultPermissions(selectedRole);
        setRolePermissions(defaults);

        toast.success("Reset Complete", {
            description: "Permissions restored to defaults"
        });
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const getRoleIcon = (role: Role) => {
        switch (role) {
            case 'superadmin': return Crown;
            case 'admin': return ShieldCheck;
            case 'user': return User;
        }
    };

    const getRoleColor = (role: Role) => {
        switch (role) {
            case 'superadmin': return 'from-yellow-500 to-orange-500';
            case 'admin': return 'from-blue-500 to-indigo-500';
            case 'user': return 'from-gray-500 to-slate-500';
        }
    };

    const canEdit = currentUserRole === 'superadmin';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Role & Permissions</h2>
                    <p className="text-muted-foreground">Manage access control for different user roles</p>
                </div>
                <Badge variant="outline" className="gap-2">
                    <Shield className="w-3 h-3" />
                    Your Role: <span className="font-bold capitalize">{currentUserRole}</span>
                </Badge>
            </div>
            <Separator />

            {/* Warning for non-superadmin */}
            {currentUserRole !== 'superadmin' && (
                <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">View Only Mode</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                You can view permissions but only SuperAdmin can modify them.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Role Selector */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Select Role to Configure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['superadmin', 'admin', 'user'] as Role[]).map((role) => {
                        const Icon = getRoleIcon(role);
                        const isSelected = selectedRole === role;

                        return (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "relative p-4 rounded-xl border-2 transition-all text-left",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-transparent bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn(
                                        "p-2 rounded-lg bg-gradient-to-br",
                                        getRoleColor(role)
                                    )}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold capitalize">{role}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {role === 'superadmin' && 'Full Access'}
                                            {role === 'admin' && 'Limited Access'}
                                            {role === 'user' && 'Basic Access'}
                                        </p>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Permissions Grid */}
            <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                    const Icon = categoryIcons[category as keyof typeof categoryIcons];
                    const colorClass = categoryColors[category as keyof typeof categoryColors];

                    return (
                        <Card key={category} className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn(
                                    "p-2 rounded-lg bg-gradient-to-br",
                                    colorClass
                                )}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold capitalize">{category}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {perms.map((permission) => {
                                    const isEnabled = rolePermissions[permission.id] || false;

                                    return (
                                        <div
                                            key={permission.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                                isEnabled
                                                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                                    : "bg-muted/30 border-transparent"
                                            )}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Label className="font-medium cursor-pointer">
                                                        {permission.name}
                                                    </Label>
                                                    {isEnabled ? (
                                                        <Unlock className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <Lock className="w-3 h-3 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {permission.description}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={isEnabled}
                                                onCheckedChange={() => togglePermission(permission.id)}
                                                disabled={!canEdit}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Action Buttons */}
            {canEdit && (
                <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                                    Save Changes
                                </h3>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                    Apply permission changes for {selectedRole} role
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetToDefaults}
                            >
                                Reset to Defaults
                            </Button>
                            <Button
                                size="sm"
                                onClick={savePermissions}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Permissions"}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
