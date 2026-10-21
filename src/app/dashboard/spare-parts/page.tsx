"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Cpu,
    Boxes,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    History,
    SlidersHorizontal,
    PackageCheck,
    CheckCircle2,
    XCircle,
    Building2,
    Tag,
    Layers,
    DollarSign,
    RefreshCw,
    X,
    ClipboardList,
    Wrench,
    Archive,
    RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "Screens & Displays",
    "Batteries",
    "Keyboards",
    "Motherboards & ICs",
    "RAM & Memory",
    "Storage (SSD/HDD)",
    "Cooling Fans & Heatsinks",
    "Power Adapters & DC Jacks",
    "Cables & Connectors",
    "Hinges & Casings",
    "Tools & Consumables",
    "General Spares",
];

const BRANDS = [
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Apple",
    "Toshiba",
    "Samsung",
    "Universal / Multi-brand",
    "Other",
];

const CONDITIONS = [
    { id: "NEW", label: "Brand New", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "REFURBISHED", label: "Refurbished", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "USED", label: "Used / Tested", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "PULL", label: "Original Pull", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

export default function SparePartsPage() {
    const [spareParts, setSpareParts] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>({
        totalVarieties: 0,
        totalStockUnits: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalCostValuation: 0,
        totalRetailValuation: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedBrand, setSelectedBrand] = useState("ALL");
    const [activeTab, setActiveTab] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK">("ALL");

    // Modals
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<any>(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockTargetPart, setStockTargetPart] = useState<any>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyTargetPart, setHistoryTargetPart] = useState<any>(null);

    const fetchSpareParts = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams();
            if (search) query.set("search", search);
            if (selectedCategory !== "ALL") query.set("category", selectedCategory);
            if (selectedBrand !== "ALL") query.set("brand", selectedBrand);

            const res = await fetch(`/api/spare-parts?${query.toString()}`);
            const data = await res.json();
            if (res.ok) {
                setSpareParts(data.spareParts || []);
                if (data.metrics) setMetrics(data.metrics);
            }
        } catch (error) {
            console.error("Failed to load spare parts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSpareParts();
        }, 200);
        return () => clearTimeout(timeout);
    }, [search, selectedCategory, selectedBrand]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete spare part "${name}"?`)) return;
        try {
            const res = await fetch(`/api/spare-parts/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchSpareParts();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter by tab
    const filteredParts = useMemo(() => {
        return spareParts.filter((item) => {
            const stock = item.stock || 0;
            const minAlert = item.minStockAlert || 2;
            if (activeTab === "LOW_STOCK") return stock <= minAlert && stock > 0;
            if (activeTab === "OUT_OF_STOCK") return stock <= 0;
            if (activeTab === "IN_STOCK") return stock > 0;
            return true;
        });
    }, [spareParts, activeTab]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                            Inventory & Workshop
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                        Spare Parts Stock Management
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Keep track of component inventory, hardware compatibility, rack bins & service usage logs.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => fetchSpareParts()}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-xs"
                        title="Refresh stock list"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-blue-600")} />
                    </button>
                    <button
                        onClick={() => {
                            setEditingPart(null);
                            setIsAddEditModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Spare Part</span>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Varieties</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Cpu className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900">{metrics.totalVarieties}</h3>
                        <span className="text-xs text-slate-400">Parts</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Cataloged component SKUs</p>
                </div>

                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stock On-Hand</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Boxes className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-emerald-600">{metrics.totalStockUnits}</h3>
                        <span className="text-xs text-slate-400">Units</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Physical components in stock</p>
                </div>

                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Low Stock / Shortage</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-amber-600">{metrics.lowStockCount}</h3>
                        <span className="text-xs text-slate-400">Alerts</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Below minimum threshold</p>
                </div>

                <div className="p-4 md:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Valuation</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-xl font-black text-slate-900">
                            Rs. {Number(metrics.totalCostValuation).toLocaleString()}
                        </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Retail value: Rs. {Number(metrics.totalRetailValuation).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Filter Bar & Tabs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by part number, name, compatible models, or rack location..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Brand Filter */}
                    <select
                        className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                        <option value="ALL">All Brands</option>
                        {BRANDS.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto custom-scrollbar">
                    {[
                        { id: "ALL", label: "All Spare Parts", count: spareParts.length },
                        {
                            id: "LOW_STOCK",
                            label: "Low Stock Alert",
                            count: spareParts.filter((p) => p.stock <= p.minStockAlert && p.stock > 0).length,
                            alert: true,
                        },
                        {
                            id: "OUT_OF_STOCK",
                            label: "Out of Stock",
                            count: spareParts.filter((p) => p.stock <= 0).length,
                            danger: true,
                        },
                        {
                            id: "IN_STOCK",
                            label: "In Stock (Healthy)",
                            count: spareParts.filter((p) => p.stock > 0).length,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                    activeTab === tab.id
                                        ? "bg-white/20 text-white"
                                        : tab.alert
                                        ? "bg-amber-100 text-amber-800"
                                        : tab.danger
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-slate-200 text-slate-700"
                                )}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Spare Parts Registry Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold uppercase tracking-wider text-xs text-slate-700">Spare Parts Inventory</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                        Showing {filteredParts.length} of {spareParts.length} parts
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/75">
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Part Info</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Compatibility</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Rack / Location</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Stock Level</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Cost / Selling</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Quick Adjust</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-7 h-7 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-slate-400 text-xs font-medium">Loading spare parts catalog...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredParts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <Cpu className="w-8 h-8 text-slate-300" />
                                            <p>No spare parts found.</p>
                                            <button
                                                onClick={() => {
                                                    setEditingPart(null);
                                                    setIsAddEditModalOpen(true);
                                                }}
                                                className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                                            >
                                                + Add your first spare part record
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredParts.map((part) => {
                                    const stock = part.stock || 0;
                                    const minAlert = part.minStockAlert || 2;
                                    const isOut = stock <= 0;
                                    const isLow = stock > 0 && stock <= minAlert;
                                    const cond = CONDITIONS.find((c) => c.id === part.condition) || CONDITIONS[0];

                                    return (
                                        <tr key={part.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Part Info */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                                            {part.partNumber}
                                                        </span>
                                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", cond.color)}>
                                                            {cond.label}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-slate-900 text-sm">{part.name}</span>
                                                    <span className="text-[11px] text-slate-500 mt-0.5">
                                                        Category: <span className="font-medium text-slate-700">{part.category}</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Compatibility */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col space-y-0.5 max-w-[200px]">
                                                    {part.brand && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                                                            <Tag className="w-3 h-3 text-slate-400" />
                                                            {part.brand}
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] text-slate-500 truncate" title={part.compatibleModels || "Universal"}>
                                                        {part.compatibleModels || "Universal / Generic"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Location */}
                                            <td className="px-5 py-4">
                                                {part.location ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                                                        <Archive className="w-3 h-3 text-slate-400" />
                                                        {part.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not set</span>
                                                )}
                                            </td>

                                            {/* Stock Level */}
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span
                                                        className={cn(
                                                            "px-3 py-1 rounded-full text-xs font-black tracking-tight border inline-flex items-center gap-1.5",
                                                            isOut
                                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                : isLow
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        )}
                                                    >
                                                        {isOut && <XCircle className="w-3 h-3" />}
                                                        {isLow && <AlertTriangle className="w-3 h-3" />}
                                                        {!isOut && !isLow && <CheckCircle2 className="w-3 h-3" />}
                                                        {stock} Units
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        Min alert: {minAlert}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Cost / Selling */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-slate-900 text-xs">
                                                        Rs. {Number(part.sellingPrice || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        Cost: Rs. {Number(part.costPrice || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Quick Stock Movement CTA */}
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setStockTargetPart(part);
                                                        setIsStockModalOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shadow-2xs"
                                                >
                                                    <Boxes className="w-3.5 h-3.5" />
                                                    <span>Adjust</span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setHistoryTargetPart(part);
                                                            setIsHistoryModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer"
                                                        title="Stock Movement Logs"
                                                    >
                                                        <History className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPart(part);
                                                            setIsAddEditModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80 transition-all cursor-pointer"
                                                        title="Edit details"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(part.id, part.name)}
                                                        className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80 transition-all cursor-pointer"
                                                        title="Delete part"
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

            {/* Modals */}
            <AnimatePresence>
                {/* Add / Edit Modal */}
                {isAddEditModalOpen && (
                    <AddEditSparePartModal
                        initialData={editingPart}
                        onClose={() => setIsAddEditModalOpen(false)}
                        onSuccess={() => {
                            setIsAddEditModalOpen(false);
                            fetchSpareParts();
                        }}
                    />
                )}

                {/* Stock Adjustment Modal */}
                {isStockModalOpen && stockTargetPart && (
                    <StockAdjustmentModal
                        part={stockTargetPart}
                        onClose={() => setIsStockModalOpen(false)}
                        onSuccess={() => {
                            setIsStockModalOpen(false);
                            fetchSpareParts();
                        }}
                    />
                )}

                {/* Stock History Audit Drawer */}
                {isHistoryModalOpen && historyTargetPart && (
                    <StockHistoryModal
                        part={historyTargetPart}
                        onClose={() => setIsHistoryModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// =========================================================================
// ADD / EDIT SPARE PART MODAL
// =========================================================================
function AddEditSparePartModal({
    initialData,
    onClose,
    onSuccess,
}: {
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        partNumber: initialData?.partNumber || "",
        name: initialData?.name || "",
        category: initialData?.category || CATEGORIES[0],
        brand: initialData?.brand || "Dell",
        compatibleModels: initialData?.compatibleModels || "",
        location: initialData?.location || "",
        stock: initialData ? initialData.stock : 1,
        minStockAlert: initialData ? initialData.minStockAlert : 2,
        costPrice: initialData ? initialData.costPrice : "",
        sellingPrice: initialData ? initialData.sellingPrice : "",
        condition: initialData?.condition || "NEW",
        supplierName: initialData?.supplierName || "",
        warranty: initialData?.warranty || "3 Months",
        notes: initialData?.notes || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const url = initialData ? `/api/spare-parts/${initialData.id}` : "/api/spare-parts";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save spare part");

            onSuccess();
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
                className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                {initialData ? "Edit Spare Part" : "Register New Spare Part"}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {initialData ? "Update part specifications and pricing" : "Add component to workshop inventory"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Part Number & Condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Part SKU / Code <span className="text-slate-400 text-[10px]">(Leave blank to auto-generate)</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-mono font-semibold"
                                placeholder="e.g. SP-1025 or Screen-15.6-FHD"
                                value={formData.partNumber}
                                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Condition</label>
                            <select
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-semibold cursor-pointer"
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            >
                                {CONDITIONS.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Part Name */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                            Part Name / Description <span className="text-rose-500">*</span>
                        </label>
                        <input
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-semibold text-slate-900"
                            placeholder="e.g. Dell Latitude 5400 Screen 14.0 FHD IPS 30-Pin"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Component Category</label>
                            <select
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-semibold cursor-pointer"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Hardware Brand</label>
                            <select
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-semibold cursor-pointer"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            >
                                {BRANDS.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Compatible Models & Rack Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Compatible Laptop / Device Models</label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-medium"
                                placeholder="e.g. Latitude 5400, 5410, Inspiron 3511"
                                value={formData.compatibleModels}
                                onChange={(e) => setFormData({ ...formData, compatibleModels: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Rack / Bin Location</label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none font-mono"
                                placeholder="e.g. Rack A - Shelf 3, Drawer 12"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Stock & Alert */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                {initialData ? "Current Stock" : "Opening Stock"}
                            </label>
                            <input
                                type="number"
                                min="0"
                                disabled={!!initialData}
                                className={cn(
                                    "w-full px-3 py-2 rounded-xl border font-bold text-center",
                                    initialData ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "bg-white border-slate-200 focus:border-blue-600"
                                )}
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            />
                            {initialData && <span className="text-[10px] text-slate-400 block mt-0.5 text-center">Use 'Adjust' to change</span>}
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Min Alert Level</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-bold text-center"
                                value={formData.minStockAlert}
                                onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Cost Price (Rs.)</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-bold text-slate-900"
                                placeholder="0"
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Selling / Job Price (Rs.)</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-bold text-emerald-600"
                                placeholder="0"
                                value={formData.sellingPrice}
                                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Supplier & Warranty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Supplier / Vendor Source</label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none"
                                placeholder="e.g. Hafeez Center Importer, Tech Wholesale"
                                value={formData.supplierName}
                                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Warranty Term</label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none"
                                placeholder="e.g. 3 Months Replacement, Checking Warranty"
                                value={formData.warranty}
                                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1">Internal Notes</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-none text-xs"
                            placeholder="Pin count, testing procedure, pinout notes or origin..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : null}
                            <span>{initialData ? "Save Changes" : "Register Spare Part"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// =========================================================================
// STOCK ADJUSTMENT MODAL (STOCK IN / OUT / REPAIR USAGE / SCRAP)
// =========================================================================
function StockAdjustmentModal({
    part,
    onClose,
    onSuccess,
}: {
    part: any;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [actionType, setActionType] = useState<"STOCK_IN" | "USED_IN_REPAIR" | "STOCK_OUT" | "ADJUSTMENT" | "SCRAP" | "RETURNED">("STOCK_IN");
    const [quantity, setQuantity] = useState<number | string>(1);
    const [targetAbsoluteStock, setTargetAbsoluteStock] = useState<number | string>(part.stock || 0);
    const [reference, setReference] = useState("");
    const [performedBy, setPerformedBy] = useState("Technician");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const currentStock = part.stock || 0;

    const projectedStock = useMemo(() => {
        const qty = parseInt(String(quantity)) || 0;
        if (actionType === "ADJUSTMENT") {
            return parseInt(String(targetAbsoluteStock)) || 0;
        }
        if (actionType === "STOCK_IN" || actionType === "RETURNED") {
            return currentStock + Math.abs(qty);
        }
        return currentStock - Math.abs(qty);
    }, [actionType, quantity, targetAbsoluteStock, currentStock]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const body: any = {
                type: actionType,
                reference,
                performedBy,
                notes,
            };

            if (actionType === "ADJUSTMENT") {
                body.newAbsoluteStock = parseInt(String(targetAbsoluteStock)) || 0;
            } else {
                body.quantity = parseInt(String(quantity)) || 1;
            }

            const res = await fetch(`/api/spare-parts/${part.id}/stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to adjust stock");

            onSuccess();
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
                className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Boxes className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Stock Adjustment</h3>
                            <p className="text-xs text-slate-400">
                                {part.name} ({part.partNumber})
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                        <span className="text-slate-500 font-medium block">Current Available Stock</span>
                        <span className="text-lg font-black text-slate-900">{currentStock} Units</span>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-500 font-medium block">Projected After Action</span>
                        <span className={cn(
                            "text-lg font-black",
                            projectedStock < 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                            {projectedStock} Units
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Action Selector */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">Stock Movement Action</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                                { id: "STOCK_IN", label: "Stock In (+)", icon: ArrowUpRight, color: "text-emerald-600" },
                                { id: "USED_IN_REPAIR", label: "Used in Repair (-)", icon: Wrench, color: "text-amber-600" },
                                { id: "STOCK_OUT", label: "Counter Sale (-)", icon: ArrowDownRight, color: "text-blue-600" },
                                { id: "ADJUSTMENT", label: "Set Exact Count", icon: SlidersHorizontal, color: "text-purple-600" },
                                { id: "SCRAP", label: "Defect / Scrap (-)", icon: Trash2, color: "text-rose-600" },
                                { id: "RETURNED", label: "Return In (+)", icon: RotateCcw, color: "text-teal-600" },
                            ].map((action) => {
                                const Icon = action.icon;
                                const isSelected = actionType === action.id;
                                return (
                                    <button
                                        key={action.id}
                                        type="button"
                                        onClick={() => setActionType(action.id as any)}
                                        className={cn(
                                            "p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer font-semibold",
                                            isSelected
                                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                        )}
                                    >
                                        <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : action.color)} />
                                        <span className="text-[11px] leading-tight">{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity Input */}
                    {actionType === "ADJUSTMENT" ? (
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                New Exact Stock Count <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-bold text-slate-900 text-base"
                                value={targetAbsoluteStock}
                                onChange={(e) => setTargetAbsoluteStock(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Quantity to {actionType === "STOCK_IN" || actionType === "RETURNED" ? "Add" : "Deduct"} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-bold text-slate-900 text-base"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Reference & Performed By */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Reference # <span className="text-slate-400 font-normal">(Ticket #, Invoice, PO)</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-mono font-medium"
                                placeholder="e.g. REP-2026-0012 or PO-884"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">Operator / Technician</label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 font-medium"
                                placeholder="e.g. Technician Ali"
                                value={performedBy}
                                onChange={(e) => setPerformedBy(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1">Notes / Reason</label>
                        <input
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs"
                            placeholder="Reason for movement, supplier delivery note, or customer repair note..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || projectedStock < 0}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : null}
                            <span>Apply Movement</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// =========================================================================
// STOCK HISTORY AUDIT MODAL
// =========================================================================
function StockHistoryModal({
    part,
    onClose,
}: {
    part: any;
    onClose: () => void;
}) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/spare-parts/${part.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.logs) {
                    setLogs(data.logs);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [part.id]);

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
                className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl max-h-[85vh] flex flex-col"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Stock Movement Audit Trail</h3>
                            <p className="text-xs text-slate-400">
                                {part.name} • <span className="font-mono text-blue-600 font-semibold">{part.partNumber}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar text-xs">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-slate-400">Loading audit history...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No stock movement recorded yet for this spare part.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log) => {
                                const isPositive = log.quantity > 0;
                                return (
                                    <div
                                        key={log.id}
                                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white transition-colors shadow-2xs"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold",
                                                    isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}
                                            >
                                                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                                        {log.type.replace(/_/g, " ")}
                                                    </span>
                                                    {log.reference && (
                                                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                                            {log.reference}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    By: <span className="font-semibold text-slate-700">{log.performedBy || "System"}</span>
                                                    {log.notes && <span> • {log.notes}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span
                                                className={cn(
                                                    "font-black text-sm block",
                                                    isPositive ? "text-emerald-600" : "text-rose-600"
                                                )}
                                            >
                                                {isPositive ? `+${log.quantity}` : log.quantity} Units
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {log.previousStock} → {log.newStock} on {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
