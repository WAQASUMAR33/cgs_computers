"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    User,
    Phone,
    CreditCard,
    MapPin,
    Edit,
    Users,
    BookOpen,
    ShoppingCart,
    X,
    Wallet
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`/api/customers${search ? `?query=${search}` : ""}`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const totalReceivable = customers.reduce((sum, c) => sum + (Number(c.balance) > 0 ? Number(c.balance) : 0), 0);
    const inCreditCount = customers.filter(c => Number(c.balance) > 0).length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Customers & Accounts
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Client relationship management, contact details, and account credit auditing.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Customer</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{customers.length} Accounts</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Active store customers</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Receivables</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{formatCurrency(totalReceivable)}</p>
                    <p className="text-xs font-semibold text-rose-700/70 mt-1">Cumulative balance owed</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accounts With Due</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{inCreditCount} Customers</p>
                    <p className="text-xs font-semibold text-amber-700/70 mt-1">Pending payment settlements</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search customer by name, contact phone, or CNIC..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Customer Name</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Contact</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">CNIC</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">Balance</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Address</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <span className="text-xs font-semibold text-slate-400">Loading customer directory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-600 font-semibold">No customers found</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Customer" to register your first client.</p>
                                    </td>
                                </tr>
                            ) : customers.map((customer: any) => {
                                const hasDue = Number(customer.balance) > 0;
                                return (
                                    <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {customer.name?.[0]?.toUpperCase() || "C"}
                                                </div>
                                                <span className="font-bold text-slate-800 text-xs sm:text-sm">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 font-medium">{customer.contact || "—"}</td>
                                        <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{customer.cnic || "—"}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className={cn(
                                                "inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border",
                                                hasDue
                                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            )}>
                                                {formatCurrency(customer.balance)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 max-w-[200px] truncate">{customer.address || "—"}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-center items-center gap-1.5">
                                                <Link
                                                    href={`/dashboard/ledger?customerId=${customer.id}`}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 transition-all"
                                                    title="View Customer Ledger"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/60 cursor-pointer"
                                                    title="Edit Details"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <CustomerModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => { setIsModalOpen(false); fetchCustomers(); }}
                        initialData={editingCustomer}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CustomerModal({ onClose, onSubmit, initialData }: { onClose: () => void, onSubmit: () => void, initialData: any }) {
    const [formData, setFormData] = useState(initialData || {
        name: "",
        contact: "",
        cnic: "",
        balance: "0",
        address: ""
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const url = initialData ? `/api/customers/${initialData.id}` : "/api/customers";
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
            setSubmitting(false);
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
                className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl z-10"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{initialData ? "Edit Customer Account" : "Register Customer"}</h3>
                            <p className="text-xs text-slate-500">Contact details and opening financial balance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Customer Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900 text-xs sm:text-sm"
                                placeholder="e.g. Muhammad Ali"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Contact Number <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900 text-xs sm:text-sm"
                                    placeholder="0300-1234567"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                CNIC (Optional)
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-900 text-xs sm:text-sm"
                                    placeholder="35201-XXXXXXX-X"
                                    value={formData.cnic}
                                    onChange={e => setFormData({ ...formData, cnic: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Opening Balance (RS)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-sm text-slate-900"
                            value={formData.balance}
                            onChange={e => setFormData({ ...formData, balance: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Positive balance indicates customer owes money to your store.</p>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Address / Area Location
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                rows={2}
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900 resize-none text-xs"
                                placeholder="Street, Market, Mandi Bahauddin..."
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : initialData ? "Update Customer" : "Save Customer"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
