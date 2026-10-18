"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Tag,
    Layers,
    Sparkles,
    Package,
    AlertCircle,
    X,
    CheckCircle2,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BrandItem {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        products: number;
    };
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<BrandItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
    const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const fetchBrands = async () => {
        try {
            const res = await fetch("/api/brands");
            const data = await res.json();
            setBrands(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch brands:", error);
            setFeedback({ type: "error", message: "Failed to load brands" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(null), 4000);
        return () => clearTimeout(timer);
    }, [feedback]);

    const handleDelete = async () => {
        if (!deletingBrand) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/brands/${deletingBrand.id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete brand");
            }
            setFeedback({ type: "success", message: `Brand "${deletingBrand.name}" was deleted successfully.` });
            setDeletingBrand(null);
            fetchBrands();
        } catch (error: any) {
            setFeedback({ type: "error", message: error.message || "Failed to delete brand" });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredBrands = brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalProducts = brands.reduce((sum, b) => sum + (b._count?.products || 0), 0);
    const activeBrandsCount = brands.filter(b => (b._count?.products || 0) > 0).length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Brand & Manufacturer Directory
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Organize hardware manufacturers, registered brand labels, and inventory affiliations.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingBrand(null);
                        setIsModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Brand</span>
                </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Brands</p>
                        <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900">{loading ? "..." : brands.length}</h3>
                        <p className="text-xs text-slate-400 mt-1">Catalog manufacturers</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Tag className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active in Stock</p>
                        <h3 className="text-2xl sm:text-3xl font-black mt-1 text-emerald-600">{loading ? "..." : activeBrandsCount}</h3>
                        <p className="text-xs text-slate-400 mt-1">Brands with current items</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Products</p>
                        <h3 className="text-2xl sm:text-3xl font-black mt-1 text-purple-600">{loading ? "..." : totalProducts}</h3>
                        <p className="text-xs text-slate-400 mt-1">Total products branded</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Package className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Feedback Alert */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3.5 rounded-2xl flex items-center gap-3 border text-xs font-semibold ${
                            feedback.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                    >
                        {feedback.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        )}
                        <span className="flex-1">{feedback.message}</span>
                        <button onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100 p-1 cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Bar */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search brands by brand name or manufacturer..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Brands Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Brand Name</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Linked Catalog</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider hidden md:table-cell">Created Date</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-slate-400 text-xs font-semibold">Loading brands...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-600 font-semibold">No brands found</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Brand" to register a manufacturer.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{brand.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">ID: {brand.id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                <Package className="w-3.5 h-3.5 text-blue-600" />
                                                <span>{brand._count?.products || 0} products</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{new Date(brand.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-center items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setEditingBrand(brand);
                                                        setIsModalOpen(true);
                                                    }}
                                                    title="Edit Brand"
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/60 cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingBrand(brand)}
                                                    title="Delete Brand"
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-200/60 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <BrandModal
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingBrand(null);
                        }}
                        onSuccess={(message) => {
                            setIsModalOpen(false);
                            setEditingBrand(null);
                            fetchBrands();
                            setFeedback({ type: "success", message });
                        }}
                        initialData={editingBrand}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingBrand && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setDeletingBrand(null)}
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
                                Are you sure you want to delete brand <strong className="text-slate-900">"{deletingBrand.name}"</strong>?
                            </p>

                            {(deletingBrand._count?.products || 0) > 0 && (
                                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex gap-2.5 items-start">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                    <span>
                                        This brand has <strong>{deletingBrand._count?.products}</strong> linked product(s).
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-2.5 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setDeletingBrand(null)}
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
                                    {isDeleting ? "Deleting..." : "Delete Brand"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BrandModal({
    onClose,
    onSuccess,
    initialData,
}: {
    onClose: () => void;
    onSuccess: (msg: string) => void;
    initialData: BrandItem | null;
}) {
    const [name, setName] = useState(initialData?.name || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Brand name is required.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const url = initialData ? `/api/brands/${initialData.id}` : "/api/brands";
            const method = initialData ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong saving the brand.");
            }

            onSuccess(initialData ? `Brand updated to "${data.name}".` : `Brand "${data.name}" created.`);
        } catch (err: any) {
            setError(err.message || "Failed to save brand");
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
                className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl z-10"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {initialData ? "Edit Brand Details" : "Register Brand"}
                            </h3>
                            <p className="text-xs text-slate-500">Manufacturer or hardware brand</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
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
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Brand Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            required
                            autoFocus
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900 text-xs sm:text-sm"
                            placeholder="e.g. Dell, HP, Apple, Asus, Lenovo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            {submitting ? "Saving..." : initialData ? "Update Brand" : "Create Brand"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
