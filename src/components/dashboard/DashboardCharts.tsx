"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import {
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    ArrowUpRight,
    Layers,
    DollarSign,
    Receipt,
    Wallet,
    CheckCircle2,
    Activity,
    ShoppingBag
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface AnalyticsData {
    last7Days?: Array<{ label: string; fullDate: string; revenue: number; paid: number; orders: number }>;
    last30Days?: Array<{ label: string; fullDate: string; revenue: number; paid: number; orders: number }>;
    last6Months?: Array<{ label: string; monthYear: string; revenue: number; paid: number; orders: number }>;
    dayOfWeekData?: Array<{ day: string; revenue: number; orders: number }>;
    billTypeBreakdown?: Array<{ type: string; name: string; count: number; revenue: number; paid: number }>;
    categorySales?: Array<{ name: string; revenue: number; units: number }>;
    categoryInventory?: Array<{ name: string; productsCount: number; totalStock: number; totalValue: number }>;
    totalPaid?: number;
    totalOutstanding?: number;
}

interface DashboardChartsProps {
    analytics?: AnalyticsData;
    stats?: any;
}

const CATEGORY_COLORS = [
    "#2563eb", // Royal Blue
    "#10b981", // Emerald
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#f43f5e", // Rose
    "#06b6d4", // Cyan
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#64748b", // Slate
];

// Custom sleek tooltip for Recharts
const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 text-white p-3.5 shadow-xl border border-slate-700/50 backdrop-blur-md min-w-[180px] z-50">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {data.fullDate || data.monthYear || label}
                </p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs gap-3">
                        <span className="text-blue-400 font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-blue-500 rounded-xl inline-block" />
                            Revenue:
                        </span>
                        <span className="font-mono font-bold text-white">
                            {formatCurrency(data.revenue || 0)}
                        </span>
                    </div>
                    {data.paid !== undefined && (
                        <div className="flex items-center justify-between text-xs gap-3">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-xl inline-block" />
                                Collected:
                            </span>
                            <span className="font-mono font-bold text-white">
                                {formatCurrency(data.paid || 0)}
                            </span>
                        </div>
                    )}
                    {data.orders !== undefined && (
                        <div className="flex items-center justify-between text-xs gap-3 pt-1 border-t border-slate-800">
                            <span className="text-slate-400">Total Bills:</span>
                            <span className="font-mono font-bold text-slate-200">
                                {data.orders} {data.orders === 1 ? "invoice" : "invoices"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Custom sleek tooltip for Category Pie
const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        return (
            <div className="bg-slate-900/95 text-white p-3 shadow-xl border border-slate-700/50 backdrop-blur-md z-50">
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="w-2.5 h-2.5 rounded-xl"
                        style={{ backgroundColor: item.payload.fill || item.color }}
                    />
                    <span className="text-xs font-bold text-white">{item.name}</span>
                </div>
                <div className="text-xs text-slate-300 space-y-0.5">
                    <p>
                        Value: <span className="font-bold text-white">{formatCurrency(item.value)}</span>
                    </p>
                    {item.payload.units !== undefined && (
                        <p className="text-slate-400 text-[11px]">Units Sold: {item.payload.units}</p>
                    )}
                    {item.payload.totalStock !== undefined && (
                        <p className="text-slate-400 text-[11px]">In Stock: {item.payload.totalStock} units</p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export default function DashboardCharts({ analytics, stats }: DashboardChartsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [timeframe, setTimeframe] = useState<"7d" | "30d" | "6m">("7d");
    const [chartView, setChartView] = useState<"area" | "bar">("area");
    const [categoryMetric, setCategoryMetric] = useState<"sales" | "inventory">("sales");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Active time series dataset based on selected timeframe
    const currentTimelineData = useMemo(() => {
        if (!analytics) return [];
        let list: any[] = [];
        if (timeframe === "7d") list = analytics.last7Days || [];
        else if (timeframe === "30d") list = analytics.last30Days || [];
        else list = analytics.last6Months || [];

        return list.map((item) => ({
            ...item,
            fullDate: item.fullDate || item.monthYear || item.label,
        }));
    }, [analytics, timeframe]);

    // Timeline summary metrics
    const timelineMetrics = useMemo(() => {
        const data = currentTimelineData;
        const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const totalCollected = data.reduce((sum, item) => sum + (item.paid || 0), 0);
        const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
        const count = data.length || 1;
        const avgRevenue = Math.round(totalRevenue / count);

        // Find peak day
        let peakDay = data[0] || { label: "N/A", revenue: 0 };
        for (const item of data) {
            if ((item.revenue || 0) > (peakDay.revenue || 0)) {
                peakDay = item;
            }
        }

        return {
            totalRevenue,
            totalCollected,
            totalOrders,
            avgRevenue,
            peakDay,
        };
    }, [currentTimelineData]);

    // Category chart data
    const categoryChartData = useMemo(() => {
        if (!analytics) return [];
        if (categoryMetric === "sales") {
            const list = analytics.categorySales || [];
            if (list.length > 0) {
                return list.map((item, index) => ({
                    name: item.name,
                    value: item.revenue,
                    units: item.units,
                    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }));
            }
            // Fallback to category inventory if no category sales yet
            return (analytics.categoryInventory || []).map((item, index) => ({
                name: item.name,
                value: item.totalValue,
                totalStock: item.totalStock,
                fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            }));
        } else {
            return (analytics.categoryInventory || []).map((item, index) => ({
                name: item.name,
                value: item.totalStock,
                totalValue: item.totalValue,
                fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            }));
        }
    }, [analytics, categoryMetric]);

    // Calculate total collection vs outstanding ratio
    const totalSalesVol = Number(stats?.totalSales || 0);
    const totalCollectedVal = Number(analytics?.totalPaid || stats?.todayRevenue || 0);
    const totalReceivableVal = Number(stats?.totalReceivables || analytics?.totalOutstanding || 0);
    const collectionRate = totalSalesVol > 0 ? Math.min(100, Math.round((totalCollectedVal / totalSalesVol) * 100)) : 100;

    if (!isMounted) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[420px] bg-black/5 animate-pulse rounded-xl" />
                <div className="h-[420px] bg-black/5 animate-pulse rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Graphs Row: Revenue Timeline + Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Main Revenue Performance Graph (2 Columns) */}
                <div className="lg:col-span-2 rounded-2xl glass border border-black/5 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        {/* Header with Title and Control Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Sales Revenue Velocity</h3>
                                        <p className="text-xs text-foreground/50">Historical sales volume and cash collections</p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls: Timeframe & Chart Style Switcher */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Chart view switcher */}
                                <div className="flex items-center bg-black/5 p-0.5 rounded-xl border border-black/5">
                                    <button
                                        onClick={() => setChartView("area")}
                                        className={cn(
                                            "px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                            chartView === "area"
                                                ? "bg-white text-primary shadow-xs"
                                                : "text-foreground/60 hover:text-foreground"
                                        )}
                                        title="Smooth Area Chart"
                                    >
                                        Trend
                                    </button>
                                    <button
                                        onClick={() => setChartView("bar")}
                                        className={cn(
                                            "px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                            chartView === "bar"
                                                ? "bg-white text-primary shadow-xs"
                                                : "text-foreground/60 hover:text-foreground"
                                        )}
                                        title="Column Bar Chart"
                                    >
                                        Bars
                                    </button>
                                </div>

                                {/* Timeframe switcher */}
                                <div className="flex items-center bg-black/5 p-0.5 rounded-xl border border-black/5">
                                    <button
                                        onClick={() => setTimeframe("7d")}
                                        className={cn(
                                            "px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                            timeframe === "7d"
                                                ? "bg-primary text-white shadow-xs"
                                                : "text-foreground/60 hover:text-foreground"
                                        )}
                                    >
                                        7 Days
                                    </button>
                                    <button
                                        onClick={() => setTimeframe("30d")}
                                        className={cn(
                                            "px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                            timeframe === "30d"
                                                ? "bg-primary text-white shadow-xs"
                                                : "text-foreground/60 hover:text-foreground"
                                        )}
                                    >
                                        30 Days
                                    </button>
                                    <button
                                        onClick={() => setTimeframe("6m")}
                                        className={cn(
                                            "px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                            timeframe === "6m"
                                                ? "bg-primary text-white shadow-xs"
                                                : "text-foreground/60 hover:text-foreground"
                                        )}
                                    >
                                        6 Months
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Top Summary Stat Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3.5 bg-black/[0.02] border border-black/5">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Period Total</span>
                                <span className="text-base font-black text-foreground">
                                    {formatCurrency(timelineMetrics.totalRevenue)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Total Collected</span>
                                <span className="text-base font-black text-emerald-600">
                                    {formatCurrency(timelineMetrics.totalCollected)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Daily Average</span>
                                <span className="text-base font-black text-foreground">
                                    {formatCurrency(timelineMetrics.avgRevenue)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Invoices</span>
                                <span className="text-base font-black text-primary">
                                    {timelineMetrics.totalOrders} <span className="text-xs font-normal text-foreground/50">bills</span>
                                </span>
                            </div>
                        </div>

                        {/* Recharts Area / Bar Chart */}
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartView === "area" ? (
                                    <AreaChart
                                        data={currentTimelineData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0000000d" />
                                        <XAxis
                                            dataKey="label"
                                            stroke="#64748b"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={{ stroke: "#00000010" }}
                                            dy={5}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                                        />
                                        <Tooltip content={<CustomAreaTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#2563eb"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#revenueGrad)"
                                            name="Revenue"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="paid"
                                            stroke="#10b981"
                                            strokeWidth={1.5}
                                            strokeDasharray="4 4"
                                            fillOpacity={1}
                                            fill="url(#paidGrad)"
                                            name="Collected"
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart
                                        data={currentTimelineData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0000000d" />
                                        <XAxis
                                            dataKey="label"
                                            stroke="#64748b"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={{ stroke: "#00000010" }}
                                            dy={5}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                                        />
                                        <Tooltip content={<CustomAreaTooltip />} />
                                        <Bar dataKey="revenue" fill="#2563eb" radius={[0, 0, 0, 0]} name="Revenue" />
                                        <Bar dataKey="paid" fill="#10b981" radius={[0, 0, 0, 0]} name="Collected" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart Legend Footer */}
                    <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between text-xs text-foreground/60 gap-3">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-2.5 bg-blue-600 rounded-xl inline-block" />
                                Billed Revenue (Net Total)
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xl inline-block" />
                                Paid / Cash Collected
                            </span>
                        </div>
                        <span className="text-[11px] font-mono text-foreground/40">
                            Peak: {timelineMetrics.peakDay.label} ({formatCurrency(timelineMetrics.peakDay.revenue)})
                        </span>
                    </div>
                </div>

                {/* 2. Category Distribution Donut / Pie Chart (1 Column) */}
                <div className="rounded-2xl glass border border-black/5 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                                    <PieChartIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Category Share</h3>
                                    <p className="text-xs text-foreground/50">Revenue & catalog distribution</p>
                                </div>
                            </div>
                        </div>

                        {/* Toggle metric */}
                        <div className="flex items-center bg-black/5 p-0.5 rounded-xl border border-black/5 mb-4">
                            <button
                                onClick={() => setCategoryMetric("sales")}
                                className={cn(
                                    "flex-1 py-1 text-xs font-bold transition-all cursor-pointer",
                                    categoryMetric === "sales"
                                        ? "bg-white text-primary shadow-xs"
                                        : "text-foreground/60 hover:text-foreground"
                                )}
                            >
                                Sales Revenue
                            </button>
                            <button
                                onClick={() => setCategoryMetric("inventory")}
                                className={cn(
                                    "flex-1 py-1 text-xs font-bold transition-all cursor-pointer",
                                    categoryMetric === "inventory"
                                        ? "bg-white text-primary shadow-xs"
                                        : "text-foreground/60 hover:text-foreground"
                                )}
                            >
                                Stock Quantity
                            </button>
                        </div>

                        {/* Donut Chart */}
                        {categoryChartData.length === 0 ? (
                            <div className="h-[220px] flex flex-col items-center justify-center text-foreground/30 text-xs">
                                <Layers className="w-8 h-8 mb-2 opacity-50" />
                                <p>No category breakdown available</p>
                            </div>
                        ) : (
                            <div className="h-[220px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {categoryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                                        Categories
                                    </span>
                                    <span className="text-xl font-black text-foreground">
                                        {categoryChartData.length}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Top Category Legend List */}
                        <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                            {categoryChartData.map((cat, i) => {
                                const totalVal = categoryChartData.reduce((s, c) => s + c.value, 0) || 1;
                                const percent = Math.round((cat.value / totalVal) * 100);
                                return (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="w-2.5 h-2.5 rounded-xl shrink-0"
                                                style={{ backgroundColor: cat.fill }}
                                            />
                                            <span className="font-semibold text-foreground truncate text-xs">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className="font-mono font-bold text-foreground/80">
                                                {categoryMetric === "sales" ? formatCurrency(cat.value) : `${cat.value} pcs`}
                                            </span>
                                            <span className="text-[10px] font-mono text-foreground/40 w-8 text-right">
                                                {percent}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 text-center text-xs text-foreground/40 font-medium">
                        {categoryMetric === "sales" ? "Based on items sold to date" : "Based on active store inventory stock"}
                    </div>
                </div>
            </div>

            {/* Secondary Analytics Row: Day of Week Velocity & Payment Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3. Day of Week Sales Velocity (2 Columns) */}
                <div className="lg:col-span-2 rounded-2xl glass border border-black/5 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Weekly Sales Velocity</h3>
                                <p className="text-xs text-foreground/50">Sales distribution by day of the week to identify peak shopping days</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                            Operational Insights
                        </span>
                    </div>

                    {/* Bar Chart for Day of Week */}
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics?.dayOfWeekData || []}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0000000d" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#64748b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={{ stroke: "#00000010" }}
                                    dy={5}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900/95 text-white p-3 shadow-xl border border-slate-700/50 backdrop-blur-md z-50">
                                                    <p className="text-xs font-bold text-white mb-1">{data.day}</p>
                                                    <p className="text-xs text-emerald-400 font-mono font-bold">
                                                        Revenue: {formatCurrency(data.revenue)}
                                                    </p>
                                                    <p className="text-[11px] text-slate-300">
                                                        Orders: {data.orders} invoices
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#10b981" radius={[0, 0, 0, 0]} name="Sales Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="pt-3 mt-2 border-t border-black/5 flex items-center justify-between text-xs text-foreground/50">
                        <span>Helps schedule staffing, stock deliveries, and weekend promotions.</span>
                        <span className="font-semibold text-emerald-600">Mon - Sun Breakdown</span>
                    </div>
                </div>

                {/* 4. Payment Health & Bill Types (1 Column) */}
                <div className="rounded-2xl glass border border-black/5 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Financial Health</h3>
                                <p className="text-xs text-foreground/50">Collection efficiency & invoice types</p>
                            </div>
                        </div>

                        {/* Collection Progress Gauge */}
                        <div className="p-4 bg-black/[0.02] border border-black/5 mb-5">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="font-bold text-foreground/70">Collection Efficiency</span>
                                <span className="font-mono font-black text-emerald-600 text-sm">
                                    {collectionRate}%
                                </span>
                            </div>
                            <div className="w-full bg-black/10 h-3 rounded-xl overflow-hidden flex">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-700"
                                    style={{ width: `${collectionRate}%` }}
                                    title={`Paid: ${formatCurrency(totalCollectedVal)}`}
                                />
                                <div
                                    className="h-full bg-amber-500 transition-all duration-700"
                                    style={{ width: `${100 - collectionRate}%` }}
                                    title={`Outstanding: ${formatCurrency(totalReceivableVal)}`}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] mt-2.5">
                                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-xl inline-block" />
                                    Paid: {formatCurrency(totalCollectedVal)}
                                </span>
                                <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                                    <span className="w-2 h-2 bg-amber-500 rounded-xl inline-block" />
                                    Credit: {formatCurrency(totalReceivableVal)}
                                </span>
                            </div>
                        </div>

                        {/* Bill Types Breakdown */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-2">
                                Sales by Channel / Type
                            </span>
                            <div className="space-y-2">
                                {(analytics?.billTypeBreakdown || []).map((b, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-xl bg-black/[0.015] border border-black/5 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-bold text-xs text-foreground">{b.name}</p>
                                            <p className="text-[10px] text-foreground/50">{b.count} bills generated</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-xs text-foreground">
                                                {formatCurrency(b.revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs text-foreground/40">
                        <span>Receivables ledger sync</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
