"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ShieldCheck,
    User,
    Lock,
    UserCircle,
    Shield,
    Wrench,
    Calculator,
    ShoppingCart,
    Check,
    X as XIcon,
    Layers,
    Info,
    KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    ROLE_DEFINITIONS,
    MODULE_PERMISSIONS_LIST,
    getRoleBadge,
    UserRole
} from "@/lib/permissions";

const ROLE_OPTIONS = [
    {
        id: "ADMIN",
        name: "Administrator",
        title: "Full Administrator",
        desc: "Unrestricted access to all modules, financial ledgers, system settings & user accounts.",
        icon: ShieldCheck,
        color: "text-purple-600",
        activeBorder: "border-purple-600 bg-purple-50/50",
    },
    {
        id: "SALESMAN",
        name: "Sales Men",
        title: "Sales Men / Billing",
        desc: "Point of Sale (POS), customer invoices, price quotations, demand requests & product catalog.",
        icon: ShoppingCart,
        color: "text-emerald-600",
        activeBorder: "border-emerald-600 bg-emerald-50/50",
    },
    {
        id: "TECHNICIAN",
        name: "Technician",
        title: "Hardware Technician",
        desc: "Repairs & services, diagnostic notes, spare parts stock management & demand book.",
        icon: Wrench,
        color: "text-amber-600",
        activeBorder: "border-amber-600 bg-amber-50/50",
    },
    {
        id: "ACCOUNTANT",
        name: "Accountant",
        title: "Finance & Accountant",
        desc: "Daily expenses, customer/supplier ledgers, purchase bills, payment collection & audit.",
        icon: Calculator,
        color: "text-blue-600",
        activeBorder: "border-blue-600 bg-blue-50/50",
    },
];

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [activeTab, setActiveTab] = useState<"USERS" | "MATRIX">("USERS");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string, username: string) => {
        if (!confirm(`Are you sure you want to delete user account "${username}"?`)) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Failed to delete user");
                return;
            }
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    // Filter users
    const filteredUsers = users.filter((u: any) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase());

        let matchesRole = true;
        if (roleFilter !== "ALL") {
            if (roleFilter === "SALESMAN") {
                matchesRole = u.role === "SALESMAN" || u.role === "CASHIER";
            } else {
                matchesRole = u.role === roleFilter;
            }
        }

        return matchesSearch && matchesRole;
    });

    const adminCount = users.filter((u: any) => u.role === "ADMIN").length;
    const salesmanCount = users.filter((u: any) => u.role === "SALESMAN" || u.role === "CASHIER").length;
    const technicianCount = users.filter((u: any) => u.role === "TECHNICIAN").length;
    const accountantCount = users.filter((u: any) => u.role === "ACCOUNTANT").length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                            Security & Access Control
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                        User Roles & Module Permissions
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Configure user accounts for Administrators, Sales Men, Technicians, and Accountants with granular access rules.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setIsModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create User</span>
                </button>
            </div>

            {/* Quick Metrics for all 4 Roles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Administrators</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-purple-600">{adminCount}</h3>
                        <span className="text-xs text-slate-400">Users</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Full system privilege</p>
                </div>

                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sales Men</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-emerald-600">{salesmanCount}</h3>
                        <span className="text-xs text-slate-400">Users</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">POS Billing & Invoicing</p>
                </div>

                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Technicians</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Wrench className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-amber-600">{technicianCount}</h3>
                        <span className="text-xs text-slate-400">Users</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Repairs & Spare Parts Stock</p>
                </div>

                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accountants</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calculator className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-blue-600">{accountantCount}</h3>
                        <span className="text-xs text-slate-400">Users</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Expenses & Financial Ledgers</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
                <button
                    onClick={() => setActiveTab("USERS")}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                        activeTab === "USERS"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                >
                    <UserCircle className="w-4 h-4" />
                    <span>Users Registry ({users.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab("MATRIX")}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                        activeTab === "MATRIX"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                >
                    <Layers className="w-4 h-4" />
                    <span>Role Permissions Matrix</span>
                </button>
            </div>

            {activeTab === "USERS" ? (
                <>
                    {/* Filter and Search Bar */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search users by full name or username..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles ({users.length})</option>
                            <option value="ADMIN">Administrator ({adminCount})</option>
                            <option value="SALESMAN">Sales Men ({salesmanCount})</option>
                            <option value="TECHNICIAN">Technician ({technicianCount})</option>
                            <option value="ACCOUNTANT">Accountant ({accountantCount})</option>
                        </select>
                    </div>

                    {/* Users Registry Table */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-700">Accounts Registry</h3>
                            <span className="text-xs font-semibold text-slate-400">
                                Showing {filteredUsers.length} of {users.length} Users
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200/80 bg-slate-50/75">
                                        <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Role & Permissions</th>
                                        <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-7 h-7 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                                    <p className="text-slate-400 text-xs font-medium">Loading user accounts...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                                                No users found matching "{search}".
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user: any) => {
                                            const roleBadge = getRoleBadge(user.role);
                                            const isSuperAdmin = user.role === "ADMIN";

                                            return (
                                                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={cn(
                                                                    "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs",
                                                                    user.role === "ADMIN"
                                                                        ? "bg-gradient-to-br from-purple-600 to-indigo-600"
                                                                        : user.role === "TECHNICIAN"
                                                                        ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                                        : user.role === "ACCOUNTANT"
                                                                        ? "bg-gradient-to-br from-blue-600 to-cyan-600"
                                                                        : "bg-gradient-to-br from-emerald-600 to-teal-600"
                                                                )}
                                                            >
                                                                {user.name?.[0]?.toUpperCase() || "U"}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-slate-900 block">{user.name}</span>
                                                                <span className="text-[11px] text-slate-400">ID: {user.id.slice(-6)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 font-mono font-medium">
                                                        @{user.username}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border inline-flex items-center gap-1.5",
                                                                    roleBadge.badgeBg,
                                                                    roleBadge.badgeColor,
                                                                    roleBadge.badgeBorder
                                                                )}
                                                            >
                                                                {user.role === "ADMIN" && <ShieldCheck className="w-3.5 h-3.5" />}
                                                                {user.role === "TECHNICIAN" && <Wrench className="w-3.5 h-3.5" />}
                                                                {user.role === "ACCOUNTANT" && <Calculator className="w-3.5 h-3.5" />}
                                                                {(user.role === "SALESMAN" || user.role === "CASHIER") && <ShoppingCart className="w-3.5 h-3.5" />}
                                                                {roleBadge.name}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 max-w-xs truncate">
                                                                {roleBadge.description}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(user);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80 transition-all cursor-pointer"
                                                                title="Edit user"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id, user.username)}
                                                                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80 transition-all cursor-pointer"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* Role Permissions Matrix */
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs space-y-4">
                    <div className="p-6 border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Module Access Control Matrix</h3>
                                <p className="text-xs text-slate-400">
                                    Reference table showing module authorization by role across the entire POS system.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto p-4 pt-0">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/75">
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Module</th>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Section</th>
                                    <th className="px-4 py-3 font-bold text-purple-700 uppercase tracking-wider text-center">
                                        Administrator
                                    </th>
                                    <th className="px-4 py-3 font-bold text-emerald-700 uppercase tracking-wider text-center">
                                        Sales Men
                                    </th>
                                    <th className="px-4 py-3 font-bold text-amber-700 uppercase tracking-wider text-center">
                                        Technician
                                    </th>
                                    <th className="px-4 py-3 font-bold text-blue-700 uppercase tracking-wider text-center">
                                        Accountant
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MODULE_PERMISSIONS_LIST.map((mod) => {
                                    const hasAdmin = mod.allowedRoles.includes("ADMIN");
                                    const hasSales = mod.allowedRoles.includes("SALESMAN");
                                    const hasTech = mod.allowedRoles.includes("TECHNICIAN");
                                    const hasAcct = mod.allowedRoles.includes("ACCOUNTANT");

                                    return (
                                        <tr key={mod.path} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{mod.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{mod.path}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                    {mod.section}
                                                </span>
                                            </td>
                                            {/* Admin */}
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-700">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            </td>
                                            {/* Salesman */}
                                            <td className="px-4 py-3 text-center">
                                                {hasSales ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                                                        <XIcon className="w-3.5 h-3.5 stroke-[2]" />
                                                    </span>
                                                )}
                                            </td>
                                            {/* Technician */}
                                            <td className="px-4 py-3 text-center">
                                                {hasTech ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                                                        <XIcon className="w-3.5 h-3.5 stroke-[2]" />
                                                    </span>
                                                )}
                                            </td>
                                            {/* Accountant */}
                                            <td className="px-4 py-3 text-center">
                                                {hasAcct ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                                                        <XIcon className="w-3.5 h-3.5 stroke-[2]" />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Create / Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <UserModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => {
                            setIsModalOpen(false);
                            fetchUsers();
                        }}
                        initialData={editingUser}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// =========================================================================
// USER CREATE / EDIT MODAL WITH 4-ROLE SELECTION CARDS
// =========================================================================
function UserModal({
    onClose,
    onSubmit,
    initialData,
}: {
    onClose: () => void;
    onSubmit: () => void;
    initialData: any;
}) {
    // Normalize role if legacy CASHIER
    const initialRole = initialData?.role === "CASHIER" ? "SALESMAN" : initialData?.role || "SALESMAN";

    const [formData, setFormData] = useState({
        username: initialData?.username || "",
        password: "",
        name: initialData?.name || "",
        role: initialRole,
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const url = initialData ? `/api/users/${initialData.id}` : "/api/users";
            const method = initialData ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            onSubmit();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                {initialData ? "Edit User Account" : "Create New User Account"}
                            </h3>
                            <p className="text-xs text-slate-400">Configure credentials & role permissions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Full Name */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-semibold text-slate-900 shadow-xs"
                                placeholder="e.g. Waqas Umar"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Username & Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">
                                Username <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-mono font-semibold text-slate-900 shadow-xs"
                                    placeholder="waqas"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">
                                Password {initialData && <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}
                                {!initialData && <span className="text-rose-500"> *</span>}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="password"
                                    required={!initialData}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-slate-900 shadow-xs"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Multi-User Role Selection Cards */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-2">
                            Select Assigned Role & Module Permissions <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {ROLE_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = formData.role === opt.id;

                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => setFormData({ ...formData, role: opt.id })}
                                        className={cn(
                                            "p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2",
                                            isSelected
                                                ? opt.activeBorder
                                                : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs",
                                                        isSelected ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                    isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300"
                                                )}
                                            >
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : null}
                            <span>{initialData ? "Update User Account" : "Create User"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
