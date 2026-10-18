"use client";

import { useState, useEffect } from "react";
import {
    Receipt,
    Search,
    Plus,
    Trash2,
    Edit,
    Calendar,
    Filter,
    DollarSign,
    Layers,
    Tag,
    X,
    CheckCircle2,
    AlertCircle,
    Printer,
    ArrowDownRight,
    Building,
    FileText,
    TrendingDown,
    Settings2,
    ChevronDown,
    RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";

interface ExpenseCategory {
    id: string;
    name: string;
    description: string | null;
    expenseCount: number;
    totalSpent: number;
}

interface ExpenseItem {
    id: string;
    voucherNumber: string;
    categoryId: string;
    title: string;
    amount: number | string;
    date: string;
    paymentMethod: string;
    paidTo: string | null;
    notes: string | null;
    category?: {
        id: string;
        name: string;
    };
}

export default function ExpensesPage() {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Modals
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [deletingExpense, setDeletingExpense] = useState<ExpenseItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const loadCategories = async () => {
        try {
            const res = await fetch("/api/expenses/categories");
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error loading categories:", e);
        }
    };

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategoryFilter !== "ALL") params.append("categoryId", selectedCategoryFilter);
            if (paymentMethodFilter !== "ALL") params.append("paymentMethod", paymentMethodFilter);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if (search.trim()) params.append("search", search.trim());

            const res = await fetch(`/api/expenses?${params.toString()}`);
            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error loading expenses:", e);
            setFeedback({ type: "error", message: "Failed to load expenses" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadExpenses();
        }, 200);
        return () => clearTimeout(timer);
    }, [selectedCategoryFilter, paymentMethodFilter, startDate, endDate, search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadExpenses();
    };

    const handleDeleteExpense = async () => {
        if (!deletingExpense) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/expenses/${deletingExpense.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete");

            setFeedback({ type: "success", message: "Expense voucher deleted successfully" });
            setDeletingExpense(null);
            loadExpenses();
            loadCategories();
        } catch (e: any) {
            setFeedback({ type: "error", message: e.message || "Failed to delete expense" });
        } finally {
            setIsDeleting(false);
        }
    };

    // Voucher Print Formatter
    const printExpenseVoucher = (exp: ExpenseItem) => {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;

        const voucherHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Payment Voucher - ${exp.voucherNumber}</title>
                <style>
                    @page { size: A5 landscape; margin: 10mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 11px; color: #0f172a; margin: 0; padding: 15px; background: white; }
                    .box { border: 1.5px solid #0f172a; padding: 16px; border-radius: 8px; position: relative; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 14px; }
                    .title h1 { margin: 0; font-size: 20px; font-weight: 900; }
                    .title p { margin: 2px 0; font-size: 10px; color: #64748b; }
                    .meta { text-align: right; }
                    .meta h2 { margin: 0 0 4px 0; font-size: 16px; color: #2563eb; font-weight: 800; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
                    .row { display: flex; border-bottom: 1px dashed #cbd5e1; padding: 5px 0; }
                    .row .label { width: 130px; font-weight: 600; color: #475569; }
                    .amount-box { border: 1.5px solid #0f172a; background: #f8fafc; padding: 10px 15px; font-size: 15px; font-weight: 900; display: flex; justify-content: space-between; margin: 15px 0; border-radius: 6px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 10px; }
                </style>
            </head>
            <body>
                <div class="box">
                    <div class="header">
                        <div class="title">
                            <h1>CGS COMPUTERS</h1>
                            <p>Near Post Office Mandi Bahauddin • 0343-8483919 / 0333-8483919</p>
                        </div>
                        <div class="meta">
                            <h2>EXPENSE VOUCHER</h2>
                            <div>Voucher #: <strong>${exp.voucherNumber}</strong></div>
                            <div>Date: <strong>${new Date(exp.date).toLocaleDateString()}</strong></div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="row"><span class="label">Expense Category:</span> <span><strong>${exp.category?.name || "General"}</strong></span></div>
                        <div class="row"><span class="label">Payment Method:</span> <span><strong>${exp.paymentMethod}</strong></span></div>
                        <div class="row"><span class="label">Paid To:</span> <span>${exp.paidTo || "—"}</span></div>
                        <div class="row"><span class="label">Description / Title:</span> <span><strong>${exp.title}</strong></span></div>
                    </div>

                    ${exp.notes ? `<div style="font-size:11px; color:#475569; margin-bottom:10px;"><strong>Notes:</strong> ${exp.notes}</div>` : ""}

                    <div class="amount-box">
                        <span>TOTAL AMOUNT PAID:</span>
                        <span>RS ${Number(exp.amount).toFixed(2)}</span>
                    </div>

                    <div class="signatures">
                        <div>Prepared By: ___________________</div>
                        <div>Received By: ___________________</div>
                        <div>Authorized Signature: ___________________</div>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(voucherHTML);
        printWindow.document.close();
    };

    // Metric stats
    const totalExpensesSum = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const todayStr = new Date().toISOString().split("T")[0];
    const todayExpensesSum = expenses
        .filter((e) => e.date.startsWith(todayStr))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Expense Management
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Track operational expenditures, utilities, shop upkeep, and dynamic expense headers.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Settings2 className="w-4 h-4 text-blue-600" />
                        <span>Expense Categories</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingExpense(null);
                            setIsExpenseModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Record Expense</span>
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
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Total Recorded Expenses
                    </p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{formatCurrency(totalExpensesSum)}</h3>
                        <span className="text-xs font-semibold text-slate-400">{expenses.length} vouchers</span>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Today's Operating Expenses
                    </p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{formatCurrency(todayExpensesSum)}</h3>
                        <span className="text-xs font-semibold text-amber-700/70">Today's Total</span>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Active Expense Headers
                    </p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{categories.length}</h3>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            Dynamic Categories
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter & Categories Tabs */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                        onClick={() => setSelectedCategoryFilter("ALL")}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                            selectedCategoryFilter === "ALL"
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200/70"
                        )}
                    >
                        All Categories ({categories.reduce((s, c) => s + c.expenseCount, 0)})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryFilter(cat.id)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5",
                                selectedCategoryFilter === cat.id
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                    : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200/70"
                            )}
                        >
                            <span>{cat.name}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full",
                                selectedCategoryFilter === cat.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                            )}>
                                {cat.expenseCount}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search & Date Filter Bar */}
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search title, voucher, paid to..."
                            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div>
                        <select
                            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                            value={paymentMethodFilter}
                            onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        >
                            <option value="ALL">All Payment Methods</option>
                            <option value="CASH">Cash</option>
                            <option value="BANK">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="ONLINE">Online</option>
                        </select>
                    </div>

                    <div>
                        <input
                            type="date"
                            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Start Date"
                        />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                        />
                        {(startDate || endDate || search || selectedCategoryFilter !== "ALL" || paymentMethodFilter !== "ALL") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                    setSearch("");
                                    setSelectedCategoryFilter("ALL");
                                    setPaymentMethodFilter("ALL");
                                }}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Expenses List Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider">Voucher #</th>
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider">Category / Header</th>
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider">Title & Paid To</th>
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider">Date</th>
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider text-center">Method</th>
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider text-right">Amount</th>
                                <th className="px-5 py-3.5 font-bold uppercase text-slate-500 text-[11px] tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <span>Loading expenses...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-600 font-semibold">No expense records found</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Record Expense" to add your first operating voucher.</p>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-5 py-3.5 font-mono font-bold text-xs text-blue-700">
                                            <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                {exp.voucherNumber}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-full inline-block border border-blue-100">
                                                {exp.category?.name || "General"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-bold text-slate-800 text-xs sm:text-sm">{exp.title}</p>
                                            {exp.paidTo && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Paid to: <strong className="text-slate-600">{exp.paidTo}</strong>
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                                                {exp.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-rose-600 text-xs sm:text-sm">
                                            {formatCurrency(exp.amount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => printExpenseVoucher(exp)}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 transition-colors cursor-pointer"
                                                    title="Print Payment Voucher"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingExpense(exp);
                                                        setIsExpenseModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                                                    title="Edit Expense"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingExpense(exp)}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200/60"
                                                    title="Delete Expense"
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

            {/* Add / Edit Expense Modal */}
            <AnimatePresence>
                {isExpenseModalOpen && (
                    <ExpenseModal
                        categories={categories}
                        onClose={() => {
                            setIsExpenseModalOpen(false);
                            setEditingExpense(null);
                        }}
                        onSuccess={(message) => {
                            setIsExpenseModalOpen(false);
                            setEditingExpense(null);
                            loadExpenses();
                            loadCategories();
                            setFeedback({ type: "success", message });
                        }}
                        initialData={editingExpense}
                    />
                )}
            </AnimatePresence>

            {/* Category Management Modal */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <CategoryManagementModal
                        categories={categories}
                        onClose={() => setIsCategoryModalOpen(false)}
                        onUpdate={() => {
                            loadCategories();
                            loadExpenses();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingExpense && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeletingExpense(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-4 z-10"
                        >
                            <div className="flex items-center gap-3 text-rose-600">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                            </div>

                            <p className="text-slate-600 text-sm">
                                Are you sure you want to delete expense voucher <strong className="text-slate-900">#{deletingExpense.voucherNumber}</strong> for {formatCurrency(deletingExpense.amount)}?
                            </p>

                            <div className="flex gap-2.5 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setDeletingExpense(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteExpense}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Delete Voucher"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ExpenseModal({
    categories,
    onClose,
    onSuccess,
    initialData,
}: {
    categories: ExpenseCategory[];
    onClose: () => void;
    onSuccess: (msg: string) => void;
    initialData: ExpenseItem | null;
}) {
    const [categoryId, setCategoryId] = useState(
        initialData?.categoryId || (categories.length > 0 ? categories[0].id : "")
    );
    const [title, setTitle] = useState(initialData?.title || "");
    const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
    const [date, setDate] = useState(
        initialData
            ? new Date(initialData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
    );
    const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || "CASH");
    const [paidTo, setPaidTo] = useState(initialData?.paidTo || "");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [customVoucherNumber, setCustomVoucherNumber] = useState(initialData?.voucherNumber || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId) {
            setError("Please select an expense category.");
            return;
        }
        if (!title.trim()) {
            setError("Title / purpose is required.");
            return;
        }
        const amt = Number(amount);
        if (!amt || amt <= 0) {
            setError("Please enter a valid amount greater than 0.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const url = initialData ? `/api/expenses/${initialData.id}` : "/api/expenses";
            const method = initialData ? "PUT" : "POST";
            const payload = {
                categoryId,
                title: title.trim(),
                amount: amt,
                date,
                paymentMethod,
                paidTo: paidTo.trim() || null,
                notes: notes.trim() || null,
                customVoucherNumber: customVoucherNumber.trim() || null,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to save expense");
            }

            onSuccess(initialData ? `Expense updated successfully.` : `Expense voucher recorded successfully.`);
        } catch (err: any) {
            setError(err.message || "Failed to save");
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
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {initialData ? "Edit Expense Voucher" : "Record Expense Voucher"}
                            </h3>
                            <p className="text-xs text-slate-500">Add operational store expenditure</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1.5">
                                Expense Category <span className="text-rose-500">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1.5">
                                Amount (RS) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="e.g. 5000"
                                className="w-full px-3 py-2 font-bold text-sm rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1.5">
                            Expense Purpose / Description <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Electricity Bill, Tea for Guests, Packaging bags"
                            className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1.5">Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1.5">Payment Method</label>
                            <select
                                className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="CASH">Cash</option>
                                <option value="BANK">Bank Transfer</option>
                                <option value="CHEQUE">Cheque</option>
                                <option value="ONLINE">Online</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1.5">Paid To</label>
                            <input
                                type="text"
                                placeholder="Person or Vendor"
                                className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                                value={paidTo}
                                onChange={(e) => setPaidTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Remarks / Receipt Note</label>
                        <textarea
                            rows={2}
                            placeholder="Additional details or receipt reference..."
                            className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 text-slate-900 transition-all"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : initialData ? "Update Voucher" : "Record Expense"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function CategoryManagementModal({
    categories,
    onClose,
    onUpdate,
}: {
    categories: ExpenseCategory[];
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        setError("");
        try {
            const url = editingId ? `/api/expenses/categories/${editingId}` : "/api/expenses/categories";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save category");

            setName("");
            setDescription("");
            setEditingId(null);
            onUpdate();
        } catch (err: any) {
            setError(err.message || "Failed to save");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (cat: ExpenseCategory) => {
        if (cat.expenseCount > 0) {
            alert(`Cannot delete category with ${cat.expenseCount} existing expense voucher(s).`);
            return;
        }
        if (!confirm(`Are you sure you want to delete header "${cat.name}"?`)) return;

        try {
            const res = await fetch(`/api/expenses/categories/${cat.id}`, { method: "DELETE" });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to delete");
            }
            onUpdate();
        } catch (err: any) {
            alert(err.message || "Failed to delete category");
        }
    };

    const startEdit = (cat: ExpenseCategory) => {
        setEditingId(cat.id);
        setName(cat.name);
        setDescription(cat.description || "");
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
                className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5 z-10"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Dynamic Expense Headers</h3>
                            <p className="text-xs text-slate-500">Manage custom expense categories</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Add/Edit Form */}
                <form onSubmit={handleSaveCategory} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                    <div className="font-bold text-slate-800">
                        {editingId ? "Edit Category Header" : "Add New Category Header"}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            required
                            placeholder="Category Name e.g. Generator Fuel"
                            className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-900"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Optional Description"
                            className="w-full px-3 py-2 font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-900"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setName("");
                                    setDescription("");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 cursor-pointer"
                            >
                                Cancel Edit
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : editingId ? "Update Header" : "Add Header"}
                        </button>
                    </div>
                </form>

                {/* Categories List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl custom-scrollbar text-xs">
                    {categories.map((cat) => (
                        <div key={cat.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-bold text-slate-800">{cat.name}</p>
                                <p className="text-[11px] text-slate-400">
                                    {cat.expenseCount} vouchers • Spent: {formatCurrency(cat.totalSpent)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => startEdit(cat)}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                                    title="Edit"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-all cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
