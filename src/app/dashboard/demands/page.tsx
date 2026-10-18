"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ClipboardList,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    PackageCheck,
    Truck,
    X,
    Printer,
    MessageCircle,
    User,
    Smartphone,
    ShoppingBag,
    Calendar,
    DollarSign,
    RefreshCw,
    LayoutGrid,
    List,
    Sparkles,
    Filter,
    Edit3,
    Trash2,
    ChevronDown,
    ArrowUpRight,
    Send,
    Tag,
    Layers,
    Building2,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; border: string; badge: string; icon: any }
> = {
    PENDING: {
        label: "Pending Order",
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-300",
        badge: "bg-amber-100 text-amber-900 border-amber-300",
        icon: Clock,
    },
    ORDERED: {
        label: "Ordered (In Transit)",
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-300",
        badge: "bg-blue-100 text-blue-900 border-blue-300",
        icon: Truck,
    },
    ARRIVED: {
        label: "Arrived (Ready)",
        bg: "bg-purple-50",
        text: "text-purple-800",
        border: "border-purple-300",
        badge: "bg-purple-100 text-purple-900 border-purple-300",
        icon: PackageCheck,
    },
    FULFILLED: {
        label: "Fulfilled / Delivered",
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-300",
        badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: "Cancelled",
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-300",
        badge: "bg-slate-100 text-slate-800 border-slate-300",
        icon: AlertCircle,
    },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    URGENT: { label: "Urgent", color: "bg-rose-600 text-white" },
    HIGH: { label: "High", color: "bg-amber-500 text-white" },
    NORMAL: { label: "Normal", color: "bg-blue-600 text-white" },
    LOW: { label: "Low", color: "bg-slate-500 text-white" },
};

const TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
    CUSTOMER_DEMAND: { label: "Customer Demand", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    STOCK_LOW: { label: "Low Stock Alert", badge: "bg-rose-50 text-rose-700 border-rose-200" },
    MARKET_PURCHASE: { label: "Market Requisition", badge: "bg-slate-100 text-slate-700 border-slate-300" },
};

export default function DemandsPage() {
    // Data states
    const [demands, setDemands] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total: 0,
        pending: 0,
        ordered: 0,
        arrived: 0,
        fulfilled: 0,
        cancelled: 0,
        urgent: 0,
        lowStockProducts: 0,
    });
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [branding, setBranding] = useState<any>({
        businessName: "CGS COMPUTERS",
        address: "Near Post Office Mandi Bahauddin",
        phoneNumbers: "0343-8483919 / 0333-8483919",
        logo: "/images/cgs_logo.png",
        receiptNote: "Demanded goods subject to market availability.",
        others: "RapidTechPro POS System",
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDemand, setSelectedDemand] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoStockLoading, setIsAutoStockLoading] = useState(false);

    // Create form state
    const [formData, setFormData] = useState({
        itemName: "",
        category: "",
        brand: "",
        quantity: 1,
        targetPrice: "",
        advancePaid: "",
        type: "CUSTOMER_DEMAND",
        priority: "NORMAL",
        customerId: "",
        customerName: "",
        customerPhone: "",
        productId: "",
        supplierName: "",
        notes: "",
        expectedDate: "",
    });

    // Edit form state
    const [editData, setEditData] = useState<any>({});

    // Fetch Demands & Stats
    const fetchDemands = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append("query", searchQuery);
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (typeFilter !== "ALL") params.append("type", typeFilter);
            if (priorityFilter !== "ALL") params.append("priority", priorityFilter);

            const [demandsRes, statsRes] = await Promise.all([
                fetch(`/api/demands?${params.toString()}`),
                fetch("/api/demands/stats"),
            ]);

            if (demandsRes.ok) {
                const data = await demandsRes.json();
                setDemands(data);
            }
            if (statsRes.ok) {
                const s = await statsRes.json();
                setStats(s);
            }
        } catch (error) {
            console.error("Failed to load demands:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetch("/api/branding")
            .then((res) => res.json())
            .then((data) => {
                if (data && (data.branding || data.businessName)) {
                    setBranding(data.branding || data);
                }
            })
            .catch(() => {});

        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setCustomers(data);
            })
            .catch(() => {});

        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setProducts(data);
            })
            .catch(() => {});
    }, []);

    // Debounced search / filter trigger
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDemands();
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, typeFilter, priorityFilter]);

    // Handle Create Demand
    const handleCreateDemand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.itemName.trim()) {
            alert("Please enter the demanded item name");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/demands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsCreateOpen(false);
                resetCreateForm();
                fetchDemands();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to create demand"}`);
            }
        } catch (error) {
            console.error("Create demand failed:", error);
            alert("Network error creating demand entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quick Status Update
    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/demands/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchDemands();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDemand) return;

        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/demands/${selectedDemand.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                setIsEditOpen(false);
                setSelectedDemand(null);
                fetchDemands();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to update demand"}`);
            }
        } catch (error) {
            console.error("Failed to update demand:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete
    const handleDeleteDemand = async (id: string) => {
        if (!confirm("Are you sure you want to delete this demand record?")) return;

        try {
            const res = await fetch(`/api/demands/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchDemands();
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Handle Auto-Stock Replenishment Scan
    const handleAutoStock = async () => {
        try {
            setIsAutoStockLoading(true);
            const res = await fetch("/api/demands/auto-stock", { method: "POST" });
            const data = await res.json();
            alert(data.message || "Auto-stock scan completed");
            fetchDemands();
        } catch (error) {
            console.error("Auto-stock failed:", error);
            alert("Failed to run auto-stock scan.");
        } finally {
            setIsAutoStockLoading(false);
        }
    };

    const resetCreateForm = () => {
        setFormData({
            itemName: "",
            category: "",
            brand: "",
            quantity: 1,
            targetPrice: "",
            advancePaid: "",
            type: "CUSTOMER_DEMAND",
            priority: "NORMAL",
            customerId: "",
            customerName: "",
            customerPhone: "",
            productId: "",
            supplierName: "",
            notes: "",
            expectedDate: "",
        });
    };

    // WhatsApp Message
    const openWhatsApp = (demand: any) => {
        const phone = demand.customerPhone || demand.customer?.contact;
        if (!phone) {
            alert("No customer phone number recorded for this demand.");
            return;
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("0")
            ? "92" + cleanPhone.slice(1)
            : cleanPhone;

        let message = `*Assalam-o-Alaikum ${demand.customerName || "Customer"}*,\n\n`;
        if (demand.status === "ARRIVED") {
            message += `Good news! Your demanded item *${demand.itemName}* has arrived at *${branding.businessName}*.\n\n`;
            message += `📋 *Demand #:* ${demand.demandNumber}\n`;
            message += `📦 *Quantity:* ${demand.quantity}\n`;
            if (Number(demand.advancePaid) > 0) {
                message += `💵 *Advance Paid:* Rs. ${Number(demand.advancePaid).toLocaleString()}\n`;
            }
            message += `\n📍 *Shop Location:* ${branding.address}\n📞 *Contact:* ${branding.phoneNumbers}\n\nPlease visit our shop to collect your item. Thank you!`;
        } else {
            message += `This is an update regarding your demand for *${demand.itemName}* (Ref: ${demand.demandNumber}):\n`;
            message += `Status: *${STATUS_CONFIG[demand.status]?.label || demand.status}*\n\n`;
            message += `📍 *${branding.businessName}* - ${branding.phoneNumbers}`;
        }

        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
    };

    // Print 80mm Market Requisition Sheet
    const printMarketDemandSheet = () => {
        const activeDemands = demands.filter((d) => d.status === "PENDING" || d.status === "ORDERED");
        if (activeDemands.length === 0) {
            alert("No active pending or ordered demands to print.");
            return;
        }

        const printWindow = window.open("", "_blank", "width=380,height=700");
        if (!printWindow) {
            alert("Please allow popups to print sheet");
            return;
        }

        const logoUrl = branding?.logo
            ? branding.logo.startsWith("http") || branding.logo.startsWith("data:")
                ? branding.logo
                : window.location.origin + branding.logo
            : "";

        const totalItemsQty = activeDemands.reduce((sum, d) => sum + Number(d.quantity || 1), 0);

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Market Purchase Demand Sheet</title>
    <style>
        @page { size: 80mm auto; margin: 3mm; }
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, -apple-system, sans-serif;
            font-size: 10px;
            width: 72mm;
            margin: 0 auto;
            padding: 2px;
            color: #000;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .header { text-align: center; margin-bottom: 6px; }
        .header img { height: 75px; max-width: 100%; object-fit: contain; margin: 0 auto 3px auto; display: block; }
        .biz-title { font-size: 14px; font-weight: 900; margin: 2px 0; }
        .badge {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 2px 6px;
            font-weight: 900;
            font-size: 10px;
            text-transform: uppercase;
            margin: 4px 0 2px 0;
        }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .divider-double { border-top: 2px dashed #000; margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; margin: 5px 0; }
        th { font-weight: 900; font-size: 9px; padding: 3px 1px; border-bottom: 1.5px solid #000; text-transform: uppercase; }
        td { padding: 4px 1px; font-size: 9px; vertical-align: top; border-bottom: 1px dashed #ccc; }
        .total-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; margin: 3px 0; }
        .footer { text-align: center; margin-top: 8px; font-size: 8px; }
    </style>
</head>
<body>
    <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="${branding.businessName}" />` : ""}
        <div class="biz-title">${branding.businessName.toUpperCase()}</div>
        <p style="margin: 1px 0; font-size: 9px;">${branding.address}</p>
        <p style="margin: 1px 0; font-size: 9px;">Phone: ${branding.phoneNumbers}</p>
        <div class="badge">MARKET PURCHASE DEMAND SHEET</div>
    </div>
    <div class="divider"></div>
    <div style="font-size: 9.5px; display: flex; justify-content: space-between;">
        <span>Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
        <span>Items: <strong>${activeDemands.length}</strong></span>
    </div>
    <div class="divider"></div>
    <table>
        <thead>
            <tr>
                <th style="text-align: left; width: 55%;">ITEM / SPECS</th>
                <th class="text-center" style="width: 15%;">QTY</th>
                <th class="text-right" style="width: 30%;">BUDGET</th>
            </tr>
        </thead>
        <tbody>
            ${activeDemands.map((d, i) => `
                <tr>
                    <td style="text-align: left;">
                        <strong>${i + 1}. ${d.itemName}</strong>
                        ${d.brand || d.category ? `<br><small style="color: #444;">${[d.brand, d.category].filter(Boolean).join(' • ')}</small>` : ''}
                        ${d.priority === 'URGENT' ? '<br><span style="font-weight: 900; color: #000;">[URGENT]</span>' : ''}
                        ${d.customerName ? `<br><small style="color: #666;">For: ${d.customerName}</small>` : ''}
                    </td>
                    <td class="text-center" style="font-weight: 900; font-size: 10px;">${d.quantity}</td>
                    <td class="text-right">${Number(d.targetPrice) > 0 ? `Rs. ${Number(d.targetPrice).toLocaleString()}` : '—'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    <div class="divider-double"></div>
    <div class="total-row">
        <span>TOTAL UNITS NEEDED:</span>
        <span>${totalItemsQty} Qty</span>
    </div>
    <div class="divider-double"></div>
    <div class="footer">
        <p style="font-weight: 700;">Purchase requisition generated for market stock supply.</p>
        <p style="margin-top: 2px;">Powered by ${branding.others || "RapidTechPro"}</p>
    </div>
    <script>
        window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
        };
    </script>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 select-none">
            {/* ==================================================== */}
            {/* HERO BANNER: Material Design 3 Expressive Zero-Radius */}
            {/* ==================================================== */}
            <div className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-8 shadow-md border-b-2 border-blue-600">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/30 text-blue-300 text-xs font-black tracking-wider uppercase border border-blue-500/40">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Procurement & Customer Demand Management</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                            Item Demands & Requisitions
                        </h1>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
                            Log out-of-stock customer requests, monitor low inventory alerts, and print 80mm thermal demand sheets for wholesale market purchasing.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={handleAutoStock}
                            disabled={isAutoStockLoading}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>{isAutoStockLoading ? "Scanning..." : "Auto Low-Stock"}</span>
                        </button>

                        <button
                            onClick={printMarketDemandSheet}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-amber-400" />
                            <span>Print 80mm Sheet</span>
                        </button>

                        <button
                            onClick={() => {
                                resetCreateForm();
                                setIsCreateOpen(true);
                            }}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Demand Entry</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================================================== */}
            {/* KPI METRIC CARDS                                     */}
            {/* ==================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider">Total Demands</span>
                        <ClipboardList className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Logged requests & requisitions</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-amber-600 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Pending Market Order</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pending}</div>
                    <p className="text-[10px] text-amber-700 font-semibold mt-1">Awaiting wholesale order</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-purple-600 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Arrived in Shop</span>
                        <PackageCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-purple-600">{stats.arrived}</div>
                    <p className="text-[10px] text-purple-700 font-semibold mt-1">Ready for customer notification</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-rose-600 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Critical Stock Alerts</span>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600">{stats.lowStockProducts}</div>
                    <p className="text-[10px] text-rose-700 font-semibold mt-1">Products at ≤ 2 inventory</p>
                </div>
            </div>

            {/* ==================================================== */}
            {/* TOOLBAR & FILTERS                                    */}
            {/* ==================================================== */}
            <div className="bg-white p-4 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by Item, Customer, Phone, or Demand #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 text-slate-900"
                        />
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200 self-start md:self-auto">
                        <button
                            onClick={() => setViewMode("table")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all",
                                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <List className="w-3.5 h-3.5" />
                            <span>Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all",
                                viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Kanban</span>
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mr-1">Status:</span>
                    {["ALL", "PENDING", "ORDERED", "ARRIVED", "FULFILLED", "CANCELLED"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={cn(
                                "px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer",
                                statusFilter === st
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {st === "ALL" ? "All Status" : STATUS_CONFIG[st]?.label || st}
                        </button>
                    ))}

                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-auto mr-1">Priority:</span>
                    {["ALL", "URGENT", "HIGH", "NORMAL", "LOW"].map((pr) => (
                        <button
                            key={pr}
                            onClick={() => setPriorityFilter(pr)}
                            className={cn(
                                "px-2 py-1 text-[10px] font-bold border transition-all cursor-pointer",
                                priorityFilter === pr
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {pr}
                        </button>
                    ))}
                </div>
            </div>

            {/* ==================================================== */}
            {/* TABLE VIEW                                           */}
            {/* ==================================================== */}
            {viewMode === "table" && (
                <div className="bg-white border border-slate-200 shadow-xs overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                <th className="p-3.5">Demand #</th>
                                <th className="p-3.5">Item & Specs</th>
                                <th className="p-3.5">Type</th>
                                <th className="p-3.5 text-center">Qty</th>
                                <th className="p-3.5 text-right">Target Price</th>
                                <th className="p-3.5 text-right">Advance Paid</th>
                                <th className="p-3.5">Customer / Contact</th>
                                <th className="p-3.5">Priority</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-slate-500 font-semibold">
                                        Loading demand records...
                                    </td>
                                </tr>
                            ) : demands.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-12 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                                            <p className="font-bold text-slate-700">No demands found</p>
                                            <p className="text-slate-400 text-xs">
                                                Create your first customer demand or run the auto low-stock scan.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                demands.map((demand) => (
                                    <tr key={demand.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-3.5 font-mono font-bold text-slate-900 text-xs">
                                            {demand.demandNumber}
                                            <div className="text-[10px] font-normal text-slate-400">
                                                {new Date(demand.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900">{demand.itemName}</div>
                                            {(demand.brand || demand.category) && (
                                                <div className="text-[10px] text-slate-500 font-medium">
                                                    {[demand.brand, demand.category].filter(Boolean).join(" • ")}
                                                </div>
                                            )}
                                            {demand.notes && (
                                                <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                                                    {demand.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            <span
                                                className={cn(
                                                    "inline-block px-2 py-0.5 text-[10px] font-bold border",
                                                    TYPE_CONFIG[demand.type]?.badge || "bg-slate-100 text-slate-700"
                                                )}
                                            >
                                                {TYPE_CONFIG[demand.type]?.label || demand.type}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center font-black text-sm text-slate-900">
                                            {demand.quantity}
                                        </td>
                                        <td className="p-3.5 text-right font-bold text-slate-900">
                                            {Number(demand.targetPrice) > 0 ? `Rs. ${Number(demand.targetPrice).toLocaleString()}` : "—"}
                                        </td>
                                        <td className="p-3.5 text-right font-bold text-emerald-600">
                                            {Number(demand.advancePaid) > 0 ? `Rs. ${Number(demand.advancePaid).toLocaleString()}` : "—"}
                                        </td>
                                        <td className="p-3.5">
                                            {demand.customerName ? (
                                                <div>
                                                    <div className="font-bold text-slate-900">{demand.customerName}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono">
                                                        {demand.customerPhone || "—"}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Shop Stock Demand</span>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            <span
                                                className={cn(
                                                    "inline-block px-2 py-0.5 text-[9px] font-black uppercase",
                                                    PRIORITY_CONFIG[demand.priority]?.color || "bg-slate-200 text-slate-800"
                                                )}
                                            >
                                                {demand.priority}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <select
                                                value={demand.status}
                                                onChange={(e) => handleStatusChange(demand.id, e.target.value)}
                                                className={cn(
                                                    "text-[10px] font-bold px-2 py-1 border cursor-pointer focus:outline-none",
                                                    STATUS_CONFIG[demand.status]?.badge
                                                )}
                                            >
                                                {Object.keys(STATUS_CONFIG).map((k) => (
                                                    <option key={k} value={k}>
                                                        {STATUS_CONFIG[k].label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {(demand.customerPhone || demand.customer?.contact) && (
                                                    <button
                                                        onClick={() => openWhatsApp(demand)}
                                                        title="Notify Customer via WhatsApp"
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedDemand(demand);
                                                        setEditData(demand);
                                                        setIsEditOpen(true);
                                                    }}
                                                    title="Edit Demand"
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDemand(demand.id)}
                                                    title="Delete Demand"
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
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
            )}

            {/* ==================================================== */}
            {/* KANBAN BOARD VIEW                                    */}
            {/* ==================================================== */}
            {viewMode === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {["PENDING", "ORDERED", "ARRIVED", "FULFILLED", "CANCELLED"].map((statusKey) => {
                        const colDemands = demands.filter((d) => d.status === statusKey);
                        const cfg = STATUS_CONFIG[statusKey];

                        return (
                            <div key={statusKey} className="bg-slate-50 border border-slate-200 p-3 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black uppercase text-slate-800">{cfg.label}</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-white border border-slate-300 text-[10px] font-bold text-slate-700">
                                        {colDemands.length}
                                    </span>
                                </div>

                                <div className="space-y-2.5 min-h-[300px]">
                                    {colDemands.length === 0 ? (
                                        <div className="text-center py-8 text-[11px] text-slate-400 font-semibold italic">
                                            No demands in this state
                                        </div>
                                    ) : (
                                        colDemands.map((demand) => (
                                            <div
                                                key={demand.id}
                                                className="bg-white p-3 border border-slate-200 shadow-xs space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="text-[10px] font-mono font-bold text-slate-500">
                                                        {demand.demandNumber}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "px-1.5 py-0.2 text-[8px] font-black uppercase",
                                                            PRIORITY_CONFIG[demand.priority]?.color
                                                        )}
                                                    >
                                                        {demand.priority}
                                                    </span>
                                                </div>

                                                <div className="font-bold text-slate-900 text-xs">{demand.itemName}</div>

                                                <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                    <span>Qty: <strong>{demand.quantity}</strong></span>
                                                    {Number(demand.targetPrice) > 0 && (
                                                        <span>Rs. {Number(demand.targetPrice).toLocaleString()}</span>
                                                    )}
                                                </div>

                                                {demand.customerName && (
                                                    <div className="bg-slate-50 p-1.5 border border-slate-100 text-[10px]">
                                                        <div className="font-bold text-slate-800">{demand.customerName}</div>
                                                        <div className="text-slate-500 font-mono text-[9px]">{demand.customerPhone}</div>
                                                    </div>
                                                )}

                                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                    <select
                                                        value={demand.status}
                                                        onChange={(e) => handleStatusChange(demand.id, e.target.value)}
                                                        className="text-[9px] font-bold border border-slate-200 p-1 bg-white cursor-pointer"
                                                    >
                                                        {Object.keys(STATUS_CONFIG).map((k) => (
                                                            <option key={k} value={k}>
                                                                {STATUS_CONFIG[k].label}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <div className="flex items-center gap-1">
                                                        {(demand.customerPhone || demand.customer?.contact) && (
                                                            <button
                                                                onClick={() => openWhatsApp(demand)}
                                                                className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                                                            >
                                                                <MessageCircle className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDemand(demand);
                                                                setEditData(demand);
                                                                setIsEditOpen(true);
                                                            }}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 border border-blue-200"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ==================================================== */}
            {/* CREATE DEMAND MODAL                                  */}
            {/* ==================================================== */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white max-w-xl w-full p-6 shadow-2xl relative space-y-4 my-8 border border-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                                <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                                    New Item Demand Entry
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDemand} className="space-y-4 text-xs">
                            {/* Type selector */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: "CUSTOMER_DEMAND", label: "Customer Request" },
                                    { key: "STOCK_LOW", label: "Low Stock Demand" },
                                    { key: "MARKET_PURCHASE", label: "Market Purchase" },
                                ].map((t) => (
                                    <button
                                        type="button"
                                        key={t.key}
                                        onClick={() => setFormData({ ...formData, type: t.key })}
                                        className={cn(
                                            "py-2 px-2 text-center font-bold border transition-all cursor-pointer text-[11px]",
                                            formData.type === t.key
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                                        )}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Item Name */}
                            <div>
                                <label className="block font-black uppercase text-[10px] text-slate-600 mb-1">
                                    Item / Product Demanded *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dell Latitude 5420 Charger 65W Type-C"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            {/* Category & Brand */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Category / Type
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Chargers / Laptops / GPU"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dell / HP / Lenovo / Asus"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Quantity, Target Price, Advance Paid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Quantity Needed *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Target Budget (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.targetPrice}
                                        onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Advance Paid (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.advancePaid}
                                        onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Customer Details */}
                            {formData.type === "CUSTOMER_DEMAND" && (
                                <div className="p-3 bg-slate-50 border border-slate-200 space-y-3">
                                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                                        Customer Contact Information
                                    </span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold text-[10px] text-slate-500 mb-1">
                                                Customer Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Usman Ali"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-[10px] text-slate-500 mb-1">
                                                WhatsApp / Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 0343-8483919"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Priority & Expected Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Urgency / Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High Priority</option>
                                        <option value="URGENT">Urgent (Customer Waiting)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Target Sourced Supplier (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Hafeez Centre / Al-Rehman"
                                        value={formData.supplierName}
                                        onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                    Notes / Specifications / Details
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Original company charger required, pin must be blue tip."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Demand Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* EDIT DEMAND MODAL                                    */}
            {/* ==================================================== */}
            {isEditOpen && selectedDemand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white max-w-lg w-full p-6 shadow-2xl relative space-y-4 my-8 border border-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                                Edit Demand: {selectedDemand.demandNumber}
                            </h3>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-black uppercase text-[10px] text-slate-600 mb-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.itemName || ""}
                                    onChange={(e) => setEditData({ ...editData, itemName: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editData.quantity || 1}
                                        onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={editData.status || "PENDING"}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    >
                                        {Object.keys(STATUS_CONFIG).map((k) => (
                                            <option key={k} value={k}>
                                                {STATUS_CONFIG[k].label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Target Budget (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        value={editData.targetPrice || ""}
                                        onChange={(e) => setEditData({ ...editData, targetPrice: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                        Advance Paid (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        value={editData.advancePaid || ""}
                                        onChange={(e) => setEditData({ ...editData, advancePaid: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-[10px] text-slate-600 mb-1">
                                    Notes & Specs
                                </label>
                                <textarea
                                    rows={2}
                                    value={editData.notes || ""}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
                                >
                                    {isSubmitting ? "Updating..." : "Update Demand"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
