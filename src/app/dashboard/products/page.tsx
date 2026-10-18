"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Filter,
    BarChart3,
    Box,
    ScanBarcode,
    Wallet,
    Building2,
    Package,
    AlertTriangle,
    CheckCircle2,
    X,
    Tag,
    Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import Barcode from "react-barcode";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [barcodeProduct, setBarcodeProduct] = useState<any>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/products${search ? `?query=${search}` : ""}`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await fetch("/api/suppliers");
            const data = await res.json();
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchCategories();
        fetchSuppliers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await fetch(`/api/products/${id}`, { method: "DELETE" });
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProducts = products.filter((p) => {
        if (selectedCategory === "ALL") return true;
        return p.categoryId === selectedCategory;
    });

    const lowStockCount = products.filter(p => Number(p.stock) <= 10).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.costPrice || 0) * Number(p.stock || 0)), 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Product Inventory & Catalog
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Manage inventory stock levels, cost & wholesale margins, and barcode labels.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => { setBarcodeProduct(null); setIsBarcodeModalOpen(true); }}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700 shadow-xs cursor-pointer"
                    >
                        <ScanBarcode className="w-4 h-4 text-blue-600" />
                        <span>Print Barcode Label</span>
                    </button>
                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Inventory KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catalog Products</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Box className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{products.length} Items</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">{categories.length} Categories • {suppliers.length} Suppliers</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Valuation (Cost)</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{formatCurrency(totalInventoryValue)}</p>
                    <p className="text-xs font-semibold text-emerald-700/70 mt-1">Total invested stock value</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{lowStockCount} Products</p>
                    <p className="text-xs font-semibold text-rose-700/70 mt-1">Requires stock reordering (≤ 10 units)</p>
                </div>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search product by name, model, code or barcode..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    <select
                        className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-800 transition-all"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Code</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Product Name</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Category</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Supplier</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">Cost</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">Wholesale</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">Retail</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">Stock</th>
                                <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-slate-400 text-xs font-semibold">Fetching inventory catalog...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-600 font-semibold">No products found</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Product" to add your first inventory item.</p>
                                    </td>
                                </tr>
                            ) : filteredProducts.map((product: any) => {
                                const stockVal = Number(product.stock);
                                const isLowStock = stockVal <= 10;
                                return (
                                    <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-700">
                                            <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                {product.code}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-slate-800 text-xs sm:text-sm">
                                            {product.name}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                                            {product.category?.name ? (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                    {product.category.name}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {product.supplier?.name ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    {product.supplier.name}
                                                </span>
                                            ) : product.brand?.name ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                                    {product.brand.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-medium text-slate-500">
                                            {formatCurrency(product.costPrice)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                                            {formatCurrency(product.wholesalePrice)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-blue-700">
                                            {formatCurrency(product.retailPrice)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className={cn(
                                                "inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border",
                                                isLowStock
                                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            )}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-center gap-1.5">
                                                <button
                                                    onClick={() => { setBarcodeProduct(product); setIsBarcodeModalOpen(true); }}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 transition-all cursor-pointer"
                                                    title="Print Barcode"
                                                >
                                                    <ScanBarcode className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer border border-slate-200/60"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer border border-slate-200/60"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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
                    <ProductModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => { setIsModalOpen(false); fetchProducts(); }}
                        initialData={editingProduct}
                        categories={categories}
                        suppliers={suppliers}
                    />
                )}
                {isBarcodeModalOpen && (
                    <BarcodeModal
                        onClose={() => setIsBarcodeModalOpen(false)}
                        product={barcodeProduct}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function BarcodeModal({ onClose, product }: { onClose: () => void, product: any }) {
    const [printData, setPrintData] = useState({
        name: product?.name || "",
        code: product?.code || "",
        price: product?.retailPrice || ""
    });

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=600,height=600');
        if (!printWindow) return;

        const barcodeElement = document.getElementById('barcode-preview')?.querySelector('svg');
        const barcodeSvg = barcodeElement ? barcodeElement.outerHTML : '';

        printWindow.document.write(`
            <html>
            <head>
                <title>Print Barcode</title>
                <style>
                    @page { size: 1.5in 1in; margin: 0; }
                    body {
                        margin: 0;
                        padding: 5px;
                        width: 1.5in;
                        height: 1in;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        font-family: sans-serif;
                        overflow: hidden;
                        box-sizing: border-box;
                    }
                    .logo { font-size: 8px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; text-align: center; line-height: 1; }
                    .name { font-size: 7px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-align: center; }
                    .price { font-size: 10px; font-weight: bold; margin-top: 2px; text-align: center; }
                    svg { width: 100% !important; height: auto !important; max-height: 35px; display: block; }
                </style>
            </head>
            <body>
                <div class="logo">CGS Computers</div>
                <div class="name">${printData.name}</div>
                ${barcodeSvg}
                <div class="price">RS ${Number(printData.price).toFixed(2)}</div>
                <script>
                    window.onload = () => { window.print(); window.close(); };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
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
                            <ScanBarcode className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Print Barcode Label</h3>
                            <p className="text-xs text-slate-500">Thermal barcode sticker format</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 text-xs">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Product Title</label>
                        <input
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900"
                            value={printData.name}
                            onChange={e => setPrintData({ ...printData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Barcode Code</label>
                            <input
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900"
                                value={printData.code}
                                onChange={e => setPrintData({ ...printData, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Retail Price</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold text-slate-900"
                                value={printData.price}
                                onChange={e => setPrintData({ ...printData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center gap-1.5" id="barcode-preview">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">CGS Computers</div>
                        <p className="text-[10px] text-center font-medium text-slate-600 max-w-[200px] truncate">{printData.name}</p>
                        <Barcode 
                            value={printData.code || "000000"} 
                            width={1.5}
                            height={40}
                            fontSize={12}
                            displayValue={true}
                            margin={0}
                        />
                        <p className="text-sm font-black text-slate-900">RS {Number(printData.price).toFixed(2)}</p>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                        <ScanBarcode className="w-4 h-4" />
                        <span>Print Sticker Label (1.5" x 1")</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ProductModal({ onClose, onSubmit, initialData, categories, suppliers }: { onClose: () => void, onSubmit: () => void, initialData: any, categories: any[], suppliers: any[] }) {
    const [formData, setFormData] = useState({
        code: initialData?.code || "",
        name: initialData?.name || "",
        costPrice: initialData?.costPrice || "",
        wholesalePrice: initialData?.wholesalePrice || "",
        retailPrice: initialData?.retailPrice || "",
        stock: initialData?.stock !== undefined ? String(initialData.stock) : "0",
        categoryId: initialData?.categoryId || initialData?.category?.id || "",
        supplierId: initialData?.supplierId || initialData?.supplier?.id || "",
        paidAmount: "",
        paymentMethod: "CASH",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const numericStock = parseInt(formData.stock) || 0;
    const numericCost = parseFloat(formData.costPrice) || 0;
    const totalInitialCost = Math.max(0, numericStock * numericCost);
    const currentSupplierBalance = Number(selectedSupplier?.balance || 0);
    const numericPaid = Math.max(0, parseFloat(formData.paidAmount) || 0);
    const projectedBalance = currentSupplierBalance + totalInitialCost - numericPaid;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const url = initialData ? `/api/products/${initialData.id}` : "/api/products";
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
            setLoading(false);
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
                className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl z-10"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{initialData ? "Edit Product Details" : "Register New Product"}</h3>
                            <p className="text-xs text-slate-500">Configure catalog specifications, pricing and supplier link</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3.5">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Product Code <span className="text-rose-500">*</span></label>
                            <input
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900 text-xs sm:text-sm"
                                placeholder="PROD-001"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Product Name <span className="text-rose-500">*</span></label>
                            <input
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900 text-xs sm:text-sm"
                                placeholder="Core i7 12700K / 16GB RAM..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800 text-xs"
                                value={formData.categoryId || ""}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">Select Category...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Supplier</label>
                            <select
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800 text-xs"
                                value={formData.supplierId || ""}
                                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                            >
                                <option value="">Select Supplier...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.companyName ? `(${s.companyName})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Initial Stock <span className="text-rose-500">*</span></label>
                            <input
                                type="number"
                                min="0"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900 text-xs sm:text-sm"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Cost Price (RS)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900 text-xs sm:text-sm"
                                placeholder="0.00"
                                value={formData.costPrice}
                                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Wholesale Price (RS)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900 text-xs sm:text-sm"
                                placeholder="0.00"
                                value={formData.wholesalePrice}
                                onChange={e => setFormData({ ...formData, wholesalePrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Retail Price (RS)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-slate-900 text-xs sm:text-sm"
                                placeholder="0.00"
                                value={formData.retailPrice}
                                onChange={e => setFormData({ ...formData, retailPrice: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Supplier Ledger Management Section */}
                    {selectedSupplier && !initialData && (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Supplier Ledger Link</p>
                                        <p className="text-[11px] text-slate-500">
                                            {selectedSupplier.name} • Current Balance:{" "}
                                            <span className="font-mono font-bold text-slate-900">
                                                {formatCurrency(currentSupplierBalance)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                {totalInitialCost > 0 && (
                                    <div className="text-left sm:text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Purchase Value
                                        </span>
                                        <span className="text-sm font-black text-emerald-700">
                                            {formatCurrency(totalInitialCost)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {totalInitialCost > 0 && (
                                <div className="pt-2 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                            Paid to Supplier Now (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={totalInitialCost}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-mono font-bold"
                                            placeholder="0.00 (Unpaid / Full Credit)"
                                            value={formData.paidAmount}
                                            onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                                        />
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paidAmount: "0" })}
                                                className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold hover:bg-amber-200 cursor-pointer"
                                            >
                                                On Credit (Rs. 0)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paidAmount: String(totalInitialCost) })}
                                                className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold hover:bg-emerald-200 cursor-pointer"
                                            >
                                                Pay Full ({formatCurrency(totalInitialCost)})
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                            Payment Method
                                        </label>
                                        <select
                                            disabled={!formData.paidAmount || Number(formData.paidAmount) <= 0}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium disabled:opacity-50"
                                            value={formData.paymentMethod}
                                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="BANK">Bank Transfer</option>
                                            <option value="ONLINE">Online Payment</option>
                                            <option value="CHEQUE">Cheque</option>
                                        </select>
                                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                                            <span>Projected Balance:</span>
                                            <span className="font-mono font-bold text-slate-900">
                                                {formatCurrency(projectedBalance)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer disabled:opacity-60"
                        >
                            {loading ? "Saving..." : initialData ? "Update Product" : "Save Product"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
