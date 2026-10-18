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
    Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch(`/api/users/${id}`, { method: "DELETE" });
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter((u: any) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const adminCount = users.filter((u: any) => u.role === "ADMIN").length;
    const cashierCount = users.filter((u: any) => u.role === "CASHIER").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage system operators, cashiers, administrators, and security access.</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Users</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{users.length}</h3>
                    <p className="text-xs text-slate-400 mt-1">Authorized accounts</p>
                </div>
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Administrators</p>
                    <h3 className="text-2xl font-black text-purple-600 tracking-tight">{adminCount}</h3>
                    <p className="text-xs text-slate-400 mt-1">Full system privileges</p>
                </div>
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cashiers & Clerks</p>
                    <h3 className="text-2xl font-black text-blue-600 tracking-tight">{cashierCount}</h3>
                    <p className="text-xs text-slate-400 mt-1">Point of Sale access</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search users by name or username..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-slate-700">Accounts Registry</h3>
                    <span className="text-xs font-semibold text-slate-400">{filteredUsers.length} Users</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/75">
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Role</th>
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
                                            <p className="text-slate-400 text-xs font-medium">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        No users found matching "{search}".
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs",
                                                user.role === "ADMIN" ? "bg-gradient-to-br from-purple-600 to-indigo-600" : "bg-gradient-to-br from-blue-600 to-cyan-600"
                                            )}>
                                                {user.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <span className="font-semibold text-slate-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono font-medium">@{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border inline-flex items-center gap-1",
                                            user.role === "ADMIN"
                                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                        )}>
                                            {user.role === "ADMIN" && <ShieldCheck className="w-3 h-3 inline" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-1.5">
                                            <button
                                                onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                                                className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80 transition-all cursor-pointer"
                                                title="Edit user"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80 transition-all cursor-pointer"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <UserModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => { setIsModalOpen(false); fetchUsers(); }}
                        initialData={editingUser}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function UserModal({ onClose, onSubmit, initialData }: { onClose: () => void, onSubmit: () => void, initialData: any }) {
    const [formData, setFormData] = useState(initialData || {
        username: "",
        password: "",
        name: "",
        role: "CASHIER"
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
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">{initialData ? "Edit User Account" : "Create New User"}</h3>
                            <p className="text-xs text-slate-400">Configure credentials and permissions</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">✕</button>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-semibold text-slate-900 shadow-xs"
                                placeholder="e.g. Waqas Umar"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">Username <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-mono font-semibold text-slate-900 shadow-xs"
                                    placeholder="waqas"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">
                                Password {initialData && "(keep blank)"}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="password"
                                    required={!initialData}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-slate-900 shadow-xs"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">Account Role</label>
                        <div className="flex gap-2">
                            {["CASHIER", "ADMIN"].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                        formData.role === role
                                            ? role === "ADMIN"
                                                ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                                : "bg-blue-600 border-blue-600 text-white shadow-sm"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {role === "ADMIN" ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                    <span>{role}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
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
                            <span>{initialData ? "Update User" : "Create User"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
