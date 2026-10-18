"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Filter,
    Tags,
    Layers,
    X,
    Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" });
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalCategoryProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Product Categories
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Group inventory items into structured classifications and catalog headers.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Categories</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{categories.length}</h3>
                        <p className="text-xs text-slate-400 mt-1">Classification groups</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categorized Products</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{totalCategoryProducts}</h3>
                        <p className="text-xs text-slate-400 mt-1">Catalog items assigned</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Package className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search categories by name..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Category Name</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Assigned Products</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-slate-400 text-xs font-semibold">Loading categories...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-600 font-semibold">No categories found</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Category" to create a new category.</p>
                                    </td>
                                </tr>
                            ) : filteredCategories.map((category: any) => (
                                <tr key={category.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                {category.name?.[0]?.toUpperCase() || "C"}
                                            </div>
                                            <span className="font-bold text-slate-800 text-xs sm:text-sm">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                                            {category._count?.products || 0} Products
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex justify-center gap-1.5">
                                            <button
                                                onClick={() => { setEditingCategory(category); setIsModalOpen(true); }}
                                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/60 cursor-pointer"
                                                title="Edit Category"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-200/60 cursor-pointer"
                                                title="Delete Category"
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
                    <CategoryModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => { setIsModalOpen(false); fetchCategories(); }}
                        initialData={editingCategory}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CategoryModal({ onClose, onSubmit, initialData }: { onClose: () => void, onSubmit: () => void, initialData: any }) {
    const [formData, setFormData] = useState(initialData || {
        name: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const url = initialData ? `/api/categories/${initialData.id}` : "/api/categories";
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
                className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 md:p-8 overflow-hidden shadow-2xl z-10"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{initialData ? "Edit Category" : "New Category"}</h3>
                            <p className="text-xs text-slate-500">Classification label for inventory products</p>
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
                            Category Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900 text-xs sm:text-sm"
                            placeholder="e.g. Graphic Cards, Laptops, Keyboards..."
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                            {submitting ? "Saving..." : initialData ? "Update Category" : "Create Category"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
