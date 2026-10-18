"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Building2,
    Phone,
    MapPin,
    CreditCard,
    DollarSign,
    BookOpen,
    AlertCircle,
    X,
    CheckCircle2,
    Truck,
    ArrowUpRight,
    Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

interface SupplierItem {
    id: string;
    name: string;
    companyName: string | null;
    contact: string;
    email: string | null;
    address: string | null;
    cnic: string | null;
    balance: number | string;
    createdAt: string;
    _count?: {
        purchases: number;
    };
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<SupplierItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch("/api/suppliers");
            const data = await res.json();
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
            setFeedback({ type: "error", message: "Failed to load suppliers" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 4000);
        return () => clearTimeout(timer);
    }, [feedback]);

    const handleDelete = async () => {
        if (!deletingSupplier) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/suppliers/${deletingSupplier.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to delete supplier");
            }
            setFeedback({ type: "success", message: `Supplier "${deletingSupplier.name}" deleted successfully.` });
            setDeletingSupplier(null);
            fetchSuppliers();
        } catch (error: any) {
            setFeedback({ type: "error", message: error.message || "Failed to delete supplier" });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSuppliers = suppliers.filter((s) => {
        const q = search.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            (s.companyName && s.companyName.toLowerCase().includes(q)) ||
            s.contact.toLowerCase().includes(q) ||
            (s.cnic && s.cnic.toLowerCase().includes(q))
        );
    });

    const totalPayable = suppliers.reduce((sum, s) => sum + Math.max(0, Number(s.balance || 0)), 0);
    const suppliersWithPayables = suppliers.filter((s) => Number(s.balance || 0) > 0).length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Suppliers & Vendors
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Manage supplier trade accounts, procurement history, and payable balances.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link
                        href="/dashboard/purchases"
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span>Stock In / Purchase</span>
                    </Link>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setIsModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            {/* Notification Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "p-3.5 rounded-2xl border flex items-center justify-between shadow-xs",
                            feedback.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-rose-50 border-rose-200 text-rose-800"
                        )}
                    >
                        <div className="flex items-center gap-2.5 font-semibold text-xs">
                            {feedback.type === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span>{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100 p-1 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Total Registered Suppliers
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{suppliers.length}</h3>
                        <p className="text-xs text-slate-400 mt-1">Vendor trade partners</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Total Payables (To Pay)
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{formatCurrency(totalPayable)}</h3>
                        <p className="text-xs text-rose-700/70 mt-1 font-semibold">{suppliersWithPayables} suppliers pending settlement</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Wallet className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Purchase Invoices
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                            {suppliers.reduce((sum, s) => sum + (s._count?.purchases || 0), 0)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Stock-in procurement bills</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Truck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search suppliers by name, company, or phone..."
                            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-900 placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">
                                    Supplier / Company
                                </th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">
                                    Contact & Location
                                </th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">
                                    Purchases
                                </th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">
                                    Payable Balance
                                </th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-xs font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <span>Loading suppliers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-xs font-medium">
                                        <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-600 font-semibold">{search ? `No suppliers match "${search}"` : "No suppliers registered yet."}</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier) => {
                                    const hasPayable = Number(supplier.balance) > 0;
                                    return (
                                        <tr key={supplier.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                                                            {supplier.name}
                                                        </p>
                                                        {supplier.companyName && (
                                                            <p className="text-[11px] text-slate-400 font-medium">
                                                                {supplier.companyName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{supplier.contact}</span>
                                                </div>
                                                {supplier.address && (
                                                    <div className="flex items-center gap-1.5 text-slate-400 mt-0.5 text-[11px]">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="truncate max-w-xs">{supplier.address}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                                    {supplier._count?.purchases || 0} Bills
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span
                                                    className={cn(
                                                        "text-xs font-bold px-2.5 py-0.5 rounded-full inline-block border",
                                                        hasPayable
                                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    )}
                                                >
                                                    {formatCurrency(supplier.balance)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={`/dashboard/supplier-ledger?supplierId=${supplier.id}`}
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 transition-colors cursor-pointer"
                                                        title="View Supplier Ledger"
                                                    >
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setEditingSupplier(supplier);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                                                        title="Edit Supplier"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingSupplier(supplier)}
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200/60"
                                                        title="Delete Supplier"
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

            {/* Add / Edit Supplier Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <SupplierModal
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingSupplier(null);
                        }}
                        onSuccess={(message) => {
                            setIsModalOpen(false);
                            setEditingSupplier(null);
                            fetchSuppliers();
                            setFeedback({ type: "success", message });
                        }}
                        initialData={editingSupplier}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingSupplier && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setDeletingSupplier(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl z-10 space-y-4"
                        >
                            <div className="flex items-center gap-3 text-rose-600">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                            </div>

                            <p className="text-slate-600 text-sm">
                                Are you sure you want to delete supplier <strong className="text-slate-900">"{deletingSupplier.name}"</strong>?
                            </p>

                            {(deletingSupplier._count?.purchases || 0) > 0 && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex gap-2.5 items-start">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                                    <span>
                                        This supplier has <strong>{deletingSupplier._count?.purchases}</strong> linked purchase invoice(s). You must remove or detach the purchase bills before deleting this supplier.
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-2.5 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setDeletingSupplier(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <span>Deleting...</span>
                                    ) : (
                                        <span>Delete Supplier</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SupplierModal({
    onClose,
    onSuccess,
    initialData,
}: {
    onClose: () => void;
    onSuccess: (msg: string) => void;
    initialData: SupplierItem | null;
}) {
    const [name, setName] = useState(initialData?.name || "");
    const [companyName, setCompanyName] = useState(initialData?.companyName || "");
    const [contact, setContact] = useState(initialData?.contact || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [cnic, setCnic] = useState(initialData?.cnic || "");
    const [openingBalance, setOpeningBalance] = useState(
        initialData ? String(initialData.balance) : "0"
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Supplier name is required.");
            return;
        }
        if (!contact.trim()) {
            setError("Contact number is required.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const url = initialData ? `/api/suppliers/${initialData.id}` : "/api/suppliers";
            const method = initialData ? "PUT" : "POST";
            const payload: any = {
                name: name.trim(),
                companyName: companyName.trim() || null,
                contact: contact.trim(),
                email: email.trim() || null,
                address: address.trim() || null,
                cnic: cnic.trim() || null,
            };

            if (!initialData) {
                payload.openingBalance = Number(openingBalance) || 0;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to save supplier.");
            }

            onSuccess(initialData ? `Supplier "${data.name}" updated.` : `Supplier "${data.name}" added successfully.`);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
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
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {initialData ? "Edit Supplier Details" : "Register Supplier"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {initialData ? "Update vendor details" : "Register a new supplier or vendor"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Supplier Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Al-Raziq Hardware"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900 text-xs sm:text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Company / Brand Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Dell Wholesale Hub"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900 text-xs sm:text-sm"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Contact Phone <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="0300-1234567"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900 text-xs sm:text-sm"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                CNIC (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="34603-XXXXXXX-X"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-900 text-xs sm:text-sm"
                                value={cnic}
                                onChange={(e) => setCnic(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="vendor@example.com"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900 text-xs sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {!initialData && (
                            <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                    Opening Balance (RS)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900 text-xs sm:text-sm"
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Physical Address / Market Location
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Shop / Warehouse address..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900 resize-none text-xs"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
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
                            {submitting ? (
                                <span>Saving...</span>
                            ) : (
                                <span>{initialData ? "Update Supplier" : "Create Supplier"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
