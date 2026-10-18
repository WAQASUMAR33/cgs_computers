"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function QuotationsPage() {
    const router = useRouter();
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const res = await fetch("/api/sales?type=QUOTATION");
            const data = await res.json();
            setQuotations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quotation?")) return;
        try {
            const res = await fetch(`/api/sales/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchQuotations();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenInPOS = (id: string) => {
        router.push(`/dashboard/pos?quotationId=${id}`);
    };

    const filteredQuotations = quotations.filter((q: any) =>
        q.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalQuoteValue = quotations.reduce((sum: number, q: any) => sum + Number(q.netTotal || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Quotations & Estimates</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage price estimates and convert them directly into customer sales bills.</p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Quotations</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{quotations.length}</h3>
                    <p className="text-xs text-slate-400 mt-1">Estimates issued</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Estimated Value</p>
                    <h3 className="text-2xl font-black text-blue-600 tracking-tight">{formatCurrency(totalQuoteValue)}</h3>
                    <p className="text-xs text-slate-400 mt-1">Cumulative quotation sum</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search quotations by quote # or customer name..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Quotations Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-slate-700">Quotations Registry</h3>
                    <span className="text-xs font-semibold text-slate-400">{filteredQuotations.length} Found</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/75">
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Quote #</th>
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Total Amount</th>
                                <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Convert / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            <span className="text-xs font-medium">Loading quotations...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        No quotations found.
                                    </td>
                                </tr>
                            ) : filteredQuotations.map((q: any) => (
                                <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{q.billNumber}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{new Date(q.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-900">{q.customer?.name || "Walk-in Customer"}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-sm">
                                        {formatCurrency(q.netTotal)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenInPOS(q.id)}
                                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                                title="Convert to Sale in POS"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                <span>Convert to Sale</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                title="Delete Quotation"
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
        </div>
    );
}
