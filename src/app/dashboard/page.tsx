"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    ArrowUpRight,
    ShoppingCart,
    Clock,
    Sparkles,
    AlertTriangle,
    Tag,
    Layers,
    Receipt,
    Wallet,
    Plus,
    RefreshCw,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Phone,
    Wrench,
    Truck
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, sessionRes] = await Promise.all([
                fetch("/api/stats"),
                fetch("/api/auth/session"),
            ]);
            const stats = await statsRes.json();
            const session = await sessionRes.json();

            setData(stats);
            if (session.authenticated) {
                setUser(session.user);
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-500 animate-pulse">
                    Loading CGS Computers POS dashboard...
                </p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentSales = data?.recentSales || [];
    const topProducts = data?.topProducts || [];
    const lowStockProducts = data?.lowStockProducts || [];
    const analytics = data?.analytics || {};

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header / Welcome Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 rounded-3xl text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                            Enterprise POS Hub
                        </span>
                        <span className="text-blue-100 text-xs">Live System Status</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Executive Overview
                    </h2>
                    <p className="text-blue-100 text-sm mt-1 max-w-xl">
                        Monitor live sales volume, real-time inventory health, and cash collections at a glance.
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 backdrop-blur-md"
                        title="Refresh statistics"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                        <span>Refresh</span>
                    </button>
                    <Link
                        href="/dashboard/pos"
                        className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                        <span>Open POS</span>
                    </Link>
                </div>
            </div>

            {/* Executive KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Sales */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {stats.totalInvoices || 0} Invoices
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales Volume</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                            {formatCurrency(stats.totalSales || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Lifetime net revenue generated
                        </p>
                    </div>
                </motion.div>

                {/* 2. Today's Collections */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Today ({stats.todayInvoices || 0})
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Collections</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1 tracking-tight">
                            {formatCurrency(stats.todayRevenue || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Billed today: {formatCurrency(stats.todaySalesTotal || 0)}
                        </p>
                    </div>
                </motion.div>

                {/* 3. Catalog & Low Stock */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-400 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
                            <Package className="w-6 h-6" />
                        </div>
                        {stats.lowStockCount > 0 ? (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {stats.lowStockCount} Low
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Stock Good
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Inventory</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                            {stats.productCount || 0}{" "}
                            <span className="text-sm font-semibold text-slate-400">Items</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Across {stats.categoryCount || 0} categories & {stats.brandCount || 0} brands
                        </p>
                    </div>
                </motion.div>

                {/* 4. Customer Receivables */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            {stats.customerCount || 0} Accounts
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Receivables</p>
                        <h3 className="text-2xl font-black text-amber-600 mt-1 tracking-tight">
                            {formatCurrency(stats.totalReceivables || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Total outstanding credit balance
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Link
                    href="/dashboard/pos"
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">New Sale (POS)</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Quick Billing</span>
                </Link>

                <Link
                    href="/dashboard/purchases"
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-sm transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Stock In</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Purchases</span>
                </Link>

                <Link
                    href="/dashboard/repairs"
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-sm transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Repair Ticket</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Device Service</span>
                </Link>

                <Link
                    href="/dashboard/products"
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-sm transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Add Product</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Catalog Entry</span>
                </Link>

                <Link
                    href="/dashboard/expenses"
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-400 hover:shadow-sm transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Record Expense</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Daily Expenses</span>
                </Link>

                <Link
                    href="/dashboard/ledger"
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-sm transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Customer Ledger</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Audits & Balances</span>
                </Link>
            </div>

            {/* Interactive Graphs and Analytics Section */}
            <DashboardCharts analytics={analytics} stats={stats} />

            {/* Middle Section: Recent Sales & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Sales Feed (2 Columns) */}
                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Recent Invoices</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Latest sales transactions and point-of-sale bills</p>
                            </div>
                            <Link
                                href="/dashboard/sales"
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                            >
                                <span>View all sales</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentSales.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 font-medium">
                                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50 stroke-[1.5]" />
                                    <p>No sales recorded yet.</p>
                                </div>
                            ) : (
                                recentSales.map((sale: any) => {
                                    const isPaid = Number(sale.balance) <= 0;
                                    return (
                                        <div
                                            key={sale.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-all gap-3"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {sale.customer?.name?.[0]?.toUpperCase() || "C"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900">
                                                        {sale.customer?.name || "Walk-in Customer"}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                        <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{sale.billNumber}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{sale.type?.toLowerCase()}</span>
                                                        <span>•</span>
                                                        <span>{new Date(sale.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                                <span className="font-black text-sm text-slate-900">
                                                    {formatCurrency(sale.netTotal)}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 border",
                                                        isPaid
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                                    )}
                                                >
                                                    {isPaid ? "Paid in Full" : `Credit (${formatCurrency(sale.balance)})`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                            Showing latest {recentSales.length} invoices
                        </span>
                        <Link
                            href="/dashboard/pos"
                            className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-700"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create New Bill</span>
                        </Link>
                    </div>
                </div>

                {/* Top Selling Products (1 Column) */}
                <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Top Products</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Most popular by units sold</p>
                            </div>
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <TrendingUp className="w-4 h-4" />
                            </span>
                        </div>

                        <div className="space-y-5">
                            {topProducts.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 font-medium">
                                    <Package className="w-10 h-10 mx-auto mb-2 opacity-50 stroke-[1.5]" />
                                    <p>No product sales data yet.</p>
                                </div>
                            ) : (
                                topProducts.map((prod: any, i: number) => {
                                    const maxSold = topProducts[0]?.sold || 1;
                                    const percentage = Math.round((prod.sold / maxSold) * 100);

                                    return (
                                        <div key={prod.id || i} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-5 h-5 rounded-md bg-slate-100 text-[10px] font-black flex items-center justify-center text-slate-600 shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <p className="font-bold text-slate-800 truncate text-xs sm:text-sm">
                                                        {prod.name}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-black text-blue-600 shrink-0 ml-2">
                                                    {prod.sold} sold
                                                </span>
                                            </div>

                                            {/* Progress Meter */}
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                                />
                                            </div>

                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                <span>Category: {prod.category}</span>
                                                <span className="font-semibold text-slate-600">Rev: {formatCurrency(prod.revenue)}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-slate-100 text-center">
                        <Link
                            href="/dashboard/products"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                            <span>Browse Product Inventory</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Low Stock Alert & Store Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Low Stock Alerts (2 Columns) */}
                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Inventory Alerts</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Products with low stock (10 units or less)</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/products"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <span>Manage stock</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {lowStockProducts.length === 0 ? (
                        <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-emerald-900">All Products are Well-Stocked!</p>
                            <p className="text-xs text-emerald-700 mt-0.5">No items are currently below the low-stock threshold.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {lowStockProducts.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between hover:bg-rose-50 transition-colors"
                                >
                                    <div className="min-w-0 pr-3">
                                        <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.code}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={cn(
                                            "inline-block px-2.5 py-1 rounded-full text-xs font-black",
                                            item.stock <= 0
                                                ? "bg-rose-600 text-white shadow-xs"
                                                : "bg-rose-100 text-rose-700 border border-rose-200"
                                        )}>
                                            {item.stock <= 0 ? "Out of Stock" : `${item.stock} left`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Access Store Stats */}
                <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Catalog Overview</h3>
                        <p className="text-xs text-slate-500 mb-6">Key catalog distribution breakdown</p>

                        <div className="space-y-3">
                            <Link
                                href="/dashboard/products"
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Products Catalog</span>
                                </div>
                                <span className="font-mono text-xs font-black text-slate-700">{stats.productCount || 0}</span>
                            </Link>

                            <Link
                                href="/dashboard/brands"
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Registered Brands</span>
                                </div>
                                <span className="font-mono text-xs font-black text-slate-700">{stats.brandCount || 0}</span>
                            </Link>

                            <Link
                                href="/dashboard/categories"
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Categories</span>
                                </div>
                                <span className="font-mono text-xs font-black text-slate-700">{stats.categoryCount || 0}</span>
                            </Link>

                            <Link
                                href="/dashboard/customers"
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Customers</span>
                                </div>
                                <span className="font-mono text-xs font-black text-slate-700">{stats.customerCount || 0}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-slate-100 text-center">
                        <Link
                            href="/dashboard/admin"
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5"
                        >
                            <span>Open Admin Controls</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
