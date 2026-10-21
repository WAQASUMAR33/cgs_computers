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
    Truck,
    Cpu,
    Boxes,
    FileText,
    Calculator,
    ShieldCheck,
    MessageCircle,
    Building2,
    BookOpen,
    BookMarked,
    Eye,
    Archive,
    Check
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { getRoleBadge } from "@/lib/permissions";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    // Role view switcher (enabled for ADMIN to preview any role's dashboard)
    const [adminViewOverride, setAdminViewOverride] = useState<string | null>(null);

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
                    Loading role dashboard...
                </p>
            </div>
        );
    }

    const currentRole = (adminViewOverride || user?.role || "SALESMAN").toUpperCase();
    const isSalesman = currentRole === "SALESMAN" || currentRole === "CASHIER";
    const isTechnician = currentRole === "TECHNICIAN";
    const isAccountant = currentRole === "ACCOUNTANT";
    const isAdmin = currentRole === "ADMIN";

    return (
        <div className="space-y-6 pb-12 select-none">
            {/* If Admin, show a role view switcher tab bar */}
            {user?.role === "ADMIN" && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-2">
                            <Eye className="w-3.5 h-3.5 text-purple-600" />
                            Admin View Switcher:
                        </span>
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                            {[
                                { id: "ADMIN", label: "Executive (Admin)", color: "text-purple-700 font-bold" },
                                { id: "SALESMAN", label: "Sales Men View", color: "text-emerald-700 font-bold" },
                                { id: "TECHNICIAN", label: "Technician Lab", color: "text-amber-700 font-bold" },
                                { id: "ACCOUNTANT", label: "Accountant View", color: "text-blue-700 font-bold" },
                            ].map((tab) => {
                                const isCurrent = (adminViewOverride || "ADMIN") === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setAdminViewOverride(tab.id === "ADMIN" ? null : tab.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
                                            isCurrent
                                                ? "bg-white text-slate-900 font-bold shadow-xs"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        <span className={cn(isCurrent && tab.color)}>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    >
                        <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin text-blue-600")} />
                        <span>Sync</span>
                    </button>
                </div>
            )}

            {/* Render Role-Specific Dashboard */}
            {isTechnician && (
                <TechnicianDashboard data={data} user={user} onRefresh={handleRefresh} refreshing={refreshing} />
            )}

            {isSalesman && (
                <SalesmanDashboard data={data} user={user} onRefresh={handleRefresh} refreshing={refreshing} />
            )}

            {isAccountant && (
                <AccountantDashboard data={data} user={user} onRefresh={handleRefresh} refreshing={refreshing} />
            )}

            {isAdmin && (
                <AdminDashboard data={data} user={user} onRefresh={handleRefresh} refreshing={refreshing} />
            )}
        </div>
    );
}

// =========================================================================
// 1. SALES MEN DASHBOARD (Tailored for POS, Quick Invoicing, Demands)
// =========================================================================
function SalesmanDashboard({ data, user, onRefresh, refreshing }: any) {
    const stats = data?.stats || {};
    const recentSales = data?.recentSales || [];
    const topProducts = data?.topProducts || [];
    const pendingDemands = data?.demandStats?.recentDemands || [];

    return (
        <div className="space-y-6">
            {/* Salesmen Welcome Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                                Sales Counter & POS Terminal
                            </span>
                            <span className="text-emerald-100 text-xs font-semibold">Active Shift: {user?.name}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Sales & Counter Billing Hub
                        </h2>
                        <p className="text-sm text-emerald-100 max-w-xl">
                            Process customer checkouts, create official price quotations, and track special item demands.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/dashboard/pos"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-emerald-700 font-extrabold text-sm shadow-lg hover:shadow-xl hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                        >
                            <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
                            <span>Launch New POS Sale</span>
                        </Link>
                        <Link
                            href="/dashboard/quotations"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Quotations</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sales Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Sales Total</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                        Rs. {Number(stats.todaySalesTotal || 0).toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Gross sales generated today</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Cash Collected</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-blue-600">
                        Rs. {Number(stats.todayRevenue || 0).toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Paid directly at the counter</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Invoices</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-purple-600">{stats.todayInvoices || 0}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Invoices created today</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Demands</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-amber-600">{data?.demandStats?.pendingCount || 0}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Pending customer special requests</p>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                    href="/dashboard/pos"
                    className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-all group flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">New Sale</span>
                        <span className="text-[11px] text-emerald-700 font-medium">Barcode / POS</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/quotations"
                    className="p-4 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100/70 transition-all group flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Price Estimate</span>
                        <span className="text-[11px] text-blue-700 font-medium">Quotation Bill</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/demands"
                    className="p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100/70 transition-all group flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Demand Book</span>
                        <span className="text-[11px] text-amber-700 font-medium">Customer Request</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/products"
                    className="p-4 rounded-2xl bg-purple-50 border border-purple-200 hover:bg-purple-100/70 transition-all group flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Catalog Search</span>
                        <span className="text-[11px] text-purple-700 font-medium">Check Price & Stock</span>
                    </div>
                </Link>
            </div>

            {/* Split Tables: Today's Invoices & Pending Demands */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Counter Sales */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Recent Sales Invoices</h3>
                        </div>
                        <Link href="/dashboard/sales" className="text-xs font-semibold text-emerald-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {recentSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                                            No sales recorded yet today.
                                        </td>
                                    </tr>
                                ) : (
                                    recentSales.map((sale: any) => (
                                        <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono font-bold text-slate-900 block">{sale.billNumber}</span>
                                                <span className="text-[11px] text-slate-400">
                                                    {sale.customer?.name || "Cash Customer"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="font-bold text-slate-900 block">
                                                    Rs. {Number(sale.netTotal).toLocaleString()}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.2 rounded",
                                                    Number(sale.balance) <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {Number(sale.balance) <= 0 ? "Fully Paid" : `Bal: Rs. ${Number(sale.balance).toLocaleString()}`}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Demands Requiring Attention */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Special Item Demand Book</h3>
                        </div>
                        <Link href="/dashboard/demands" className="text-xs font-semibold text-amber-600 hover:underline">
                            Open Book
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {pendingDemands.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                                            No pending item demands recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingDemands.map((demand: any) => (
                                        <tr key={demand.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-bold text-slate-900 block">{demand.itemName}</span>
                                                <span className="text-[11px] text-slate-500">
                                                    For: {demand.customerName || "Customer"} ({demand.customerPhone || "No Phone"})
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    {demand.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =========================================================================
// 2. TECHNICIAN DASHBOARD (Tailored for Repairs, Diagnostics & Spares)
// =========================================================================
function TechnicianDashboard({ data, user, onRefresh, refreshing }: any) {
    const repairStats = data?.repairStats || {};
    const sparePartStats = data?.sparePartStats || {};
    const recentRepairs = repairStats.recentRepairs || [];
    const lowStockParts = sparePartStats.lowStockSpareParts || [];

    return (
        <div className="space-y-6">
            {/* Technician Lab Welcome Hero Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-amber-500/10 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                                Hardware Lab & Repair Center
                            </span>
                            <span className="text-amber-100 text-xs font-semibold">Specialist: {user?.name}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Hardware Lab & Technician Workspace
                        </h2>
                        <p className="text-sm text-amber-100 max-w-xl">
                            Manage hardware repair intake, diagnostic logs, spare parts usage, and device handovers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/dashboard/repairs"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-amber-700 font-extrabold text-sm shadow-lg hover:shadow-xl hover:bg-amber-50 active:scale-95 transition-all cursor-pointer"
                        >
                            <Wrench className="w-5 h-5 stroke-[2.5]" />
                            <span>New Repair Ticket</span>
                        </Link>
                        <Link
                            href="/dashboard/spare-parts"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                        >
                            <Cpu className="w-4 h-4" />
                            <span>Spare Parts Stock</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Technician Workshop KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Repair Jobs</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Wrench className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{repairStats.activeRepairs || 0}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Currently on workstation</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Waiting for Parts</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-rose-600">{repairStats.waitingForParts || 0}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Halted pending components</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ready for Delivery</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-emerald-600">{repairStats.readyForDelivery || 0}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Tested & ready for pickup</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Low Stock Spare Parts</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Cpu className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-purple-600">{sparePartStats.lowStockCount || 0}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Components needing restock</p>
                </div>
            </div>

            {/* Split Tables: Active Repair Tickets & Low Stock Spare Parts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Repairs Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-amber-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Workshop Repair Tickets</h3>
                        </div>
                        <Link href="/dashboard/repairs" className="text-xs font-semibold text-amber-600 hover:underline">
                            Open Lab
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {recentRepairs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                                            No active repairs in the workshop.
                                        </td>
                                    </tr>
                                ) : (
                                    recentRepairs.map((repair: any) => (
                                        <tr key={repair.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono font-bold text-blue-600 block">{repair.ticketNumber}</span>
                                                <span className="font-semibold text-slate-800 text-xs">
                                                    {repair.deviceBrand || ""} {repair.deviceModel || repair.deviceType}
                                                </span>
                                                <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                                    {repair.problemDescription || "No issue note"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border">
                                                    {repair.status}
                                                </span>
                                                <span className="text-[11px] text-slate-500 block mt-1">
                                                    Cust: {repair.customerName}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Spare Parts Alerts */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-purple-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Spare Parts Low Stock Alerts</h3>
                        </div>
                        <Link href="/dashboard/spare-parts" className="text-xs font-semibold text-purple-600 hover:underline">
                            Manage Inventory
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {lowStockParts.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                                            All spare parts healthy. No critical shortage!
                                        </td>
                                    </tr>
                                ) : (
                                    lowStockParts.map((part: any) => (
                                        <tr key={part.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-bold text-slate-900 block">{part.name}</span>
                                                <span className="text-[11px] text-slate-400">
                                                    SKU: {part.partNumber} • Bin: {part.location || "Not set"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    {part.stock || 0} Units Left
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =========================================================================
// 3. ACCOUNTANT DASHBOARD (Tailored for Expenses, Ledgers, Payables, Purchases)
// =========================================================================
function AccountantDashboard({ data, user, onRefresh, refreshing }: any) {
    const stats = data?.stats || {};
    const financialStats = data?.financialStats || {};
    const recentExpenses = financialStats.recentExpenses || [];
    const recentPurchases = financialStats.recentPurchases || [];

    return (
        <div className="space-y-6">
            {/* Accountant Welcome Hero Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                                Finance & Accounting Audit
                            </span>
                            <span className="text-blue-100 text-xs font-semibold">Accountant: {user?.name}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Financial Ledger & Accounts Console
                        </h2>
                        <p className="text-sm text-blue-100 max-w-xl">
                            Track daily operating expenses, reconcile customer & supplier debt ledgers, and manage vendor purchases.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/dashboard/expenses"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:shadow-xl hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                        >
                            <Receipt className="w-5 h-5 stroke-[2.5]" />
                            <span>Record Expense Voucher</span>
                        </Link>
                        <Link
                            href="/dashboard/purchases"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Purchase (Stock In)</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Financial Accounting KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Receivables</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <BookOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-rose-600">
                        Rs. {Number(stats.totalReceivables || 0).toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Pending payments due from customers</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Supplier Payables</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <BookMarked className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-amber-600">
                        Rs. {Number(financialStats.supplierPayables || 0).toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Owed to vendors for purchases</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Expenses</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-purple-600">
                        Rs. {Number(financialStats.thisMonthExpenses || 0).toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Rent, salaries & utility costs</p>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Purchase Stock-In</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                        Rs. {Number(financialStats.totalPurchases || 0).toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Vendor purchase bills volume</p>
                </div>
            </div>

            {/* Quick Accounting Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                    href="/dashboard/expenses"
                    className="p-4 rounded-2xl bg-purple-50 border border-purple-200 hover:bg-purple-100/70 transition-all flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Expenses</span>
                        <span className="text-[11px] text-purple-700 font-medium">Daily Outflows</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/ledger"
                    className="p-4 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100/70 transition-all flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Customer Ledger</span>
                        <span className="text-[11px] text-rose-700 font-medium">Audit Receivables</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/supplier-ledger"
                    className="p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100/70 transition-all flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <BookMarked className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Supplier Ledger</span>
                        <span className="text-[11px] text-amber-700 font-medium">Vendor Balances</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/purchases"
                    className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-all flex items-center gap-3.5"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">Purchases</span>
                        <span className="text-[11px] text-emerald-700 font-medium">Vendor Invoices</span>
                    </div>
                </Link>
            </div>

            {/* Split Tables: Recent Expenses & Recent Purchases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Operating Expenses */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-purple-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Recent Expense Vouchers</h3>
                        </div>
                        <Link href="/dashboard/expenses" className="text-xs font-semibold text-purple-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {recentExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                                            No expense vouchers recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    recentExpenses.map((exp: any) => (
                                        <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-bold text-slate-900 block">{exp.title}</span>
                                                <span className="text-[11px] text-slate-400">
                                                    Cat: {exp.category?.name || "General"} • {exp.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="font-bold text-rose-600 block">
                                                    Rs. {Number(exp.amount).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {new Date(exp.date).toLocaleDateString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Supplier Purchases */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Vendor Purchase Bills</h3>
                        </div>
                        <Link href="/dashboard/purchases" className="text-xs font-semibold text-emerald-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {recentPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                                            No purchase bills logged.
                                        </td>
                                    </tr>
                                ) : (
                                    recentPurchases.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono font-bold text-slate-900 block">{p.invoiceNumber}</span>
                                                <span className="text-[11px] text-slate-500">
                                                    {p.supplier?.companyName || p.supplier?.name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="font-bold text-slate-900 block">
                                                    Rs. {Number(p.netTotal).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-amber-600 font-medium">
                                                    Due: Rs. {Number(p.balance).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =========================================================================
// 4. ADMINISTRATOR EXECUTIVE OVERVIEW (Full System & Business Intelligence)
// =========================================================================
function AdminDashboard({ data, user, onRefresh, refreshing }: any) {
    const stats = data?.stats || {};
    const recentSales = data?.recentSales || [];
    const topProducts = data?.topProducts || [];
    const lowStockProducts = data?.lowStockProducts || [];
    const analytics = data?.analytics || {};

    return (
        <div className="space-y-8">
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
                        Executive Business Overview
                    </h2>
                    <p className="text-blue-100 text-sm mt-1 max-w-xl">
                        Monitor live sales volume, real-time inventory health, and cash collections at a glance.
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <button
                        onClick={onRefresh}
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
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {stats.totalInvoices || 0} Invoices
                        </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Net Sales</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                        Rs. {Number(stats.totalSales || 0).toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                        <span className="text-emerald-600 font-bold flex items-center">
                            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Live
                        </span>
                        <span>Across all store history</span>
                    </div>
                </div>

                {/* 2. Today's Revenue */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Today ({stats.todayInvoices || 0})
                        </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Today's Collections</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-emerald-600 tracking-tight">
                        Rs. {Number(stats.todayRevenue || 0).toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                        <span className="text-slate-400">Total Billed:</span>
                        <span className="font-bold text-slate-700">Rs. {Number(stats.todaySalesTotal || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* 3. Customer Receivables */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-rose-400 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                            {stats.customerCount || 0} Accounts
                        </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Receivables Due</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-rose-600 tracking-tight">
                        Rs. {Number(stats.totalReceivables || 0).toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                        <span className="text-rose-500 font-semibold">Credit Balance</span>
                        <Link href="/dashboard/ledger" className="text-blue-600 hover:underline ml-auto font-bold">
                            View Ledger →
                        </Link>
                    </div>
                </div>

                {/* 4. Products & Inventory */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                            <Package className="w-6 h-6" />
                        </div>
                        {stats.lowStockCount > 0 ? (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {stats.lowStockCount} Low
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Stock Healthy
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Catalog Varieties</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                        {stats.productCount || 0}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                        <span>{stats.categoryCount || 0} Categories</span>
                        <span>•</span>
                        <span>{stats.brandCount || 0} Brands</span>
                    </div>
                </div>
            </div>

            {/* Visual Analytics & Interactive Charts */}
            <DashboardCharts analytics={analytics} />

            {/* Bottom Split Section: Recent Invoices & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices Table */}
                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Sales Activity</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Real-time receipts generated at store counter</p>
                        </div>
                        <Link
                            href="/dashboard/sales"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                        >
                            <span>View All Sales</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                                    <th className="pb-3">Bill #</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3 text-right">Net Total</th>
                                    <th className="pb-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentSales.map((sale: any) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 font-mono font-bold text-slate-900">{sale.billNumber}</td>
                                        <td className="py-3">
                                            <span className="font-semibold text-slate-800 block">{sale.customer?.name}</span>
                                            <span className="text-[10px] text-slate-400">{sale.customer?.contact}</span>
                                        </td>
                                        <td className="py-3 text-right font-bold text-slate-900">
                                            Rs. {Number(sale.netTotal).toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right">
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                    Number(sale.balance) <= 0
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                                )}
                                            >
                                                {Number(sale.balance) <= 0 ? "Paid" : "Credit"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Best Selling Items</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Top products by unit volume</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {topProducts.map((p: any, i: number) => (
                            <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                        #{i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="font-bold text-slate-900 text-xs truncate block">{p.name}</span>
                                        <span className="text-[10px] text-slate-400">{p.category}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="font-bold text-slate-900 text-xs block">{p.sold} Units</span>
                                    <span className="text-[10px] text-slate-400">Rs. {p.revenue.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
