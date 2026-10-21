"use client";

import { Sidebar, MobileNav } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Clock,
    ShoppingCart,
    Plus,
    LayoutDashboard,
    Package,
    Users,
    BookOpen,
    Wallet,
    Printer,
    ShieldCheck,
    Layers,
    Tag,
    Sparkles,
    Calendar,
    Search,
    Truck,
    Building2,
    BookMarked,
    Receipt,
    FileText,
    Wrench,
    ClipboardList,
    Cpu,
    ShieldAlert,
    ArrowLeft,
} from "lucide-react";
import { isRouteAllowed, getRoleBadge, ROLE_DEFINITIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const pageMeta: Record<string, { label: string; icon: any; desc: string }> = {
    "/dashboard": { label: "Dashboard", icon: LayoutDashboard, desc: "Executive business summary" },
    "/dashboard/pos": { label: "POS / Billing", icon: ShoppingCart, desc: "Point of sale & invoicing" },
    "/dashboard/demands": { label: "Item Demand Book", icon: ClipboardList, desc: "Customer special demands, low stock alerts & market requisitions" },
    "/dashboard/repairs": { label: "Repairs & Maintenance", icon: Wrench, desc: "Device repair tickets, diagnostic logs & claim receipts" },
    "/dashboard/spare-parts": { label: "Spare Parts Stock", icon: Cpu, desc: "Spare parts inventory, stock tracking & component movements" },
    "/dashboard/purchases": { label: "Purchases (Stock In)", icon: Truck, desc: "Supplier stock-in & purchase bills" },
    "/dashboard/products": { label: "Products", icon: Package, desc: "Inventory & catalog" },
    "/dashboard/categories": { label: "Categories", icon: Layers, desc: "Product categorization" },
    "/dashboard/brands": { label: "Brands", icon: Tag, desc: "Manufacturer & brands" },
    "/dashboard/customers": { label: "Customers", icon: Users, desc: "Customer accounts & credits" },
    "/dashboard/ledger": { label: "Customer Ledger", icon: BookOpen, desc: "Customer financial audit & statements" },
    "/dashboard/payments": { label: "Customer Payments", icon: Wallet, desc: "Cash & credit collection logs" },
    "/dashboard/suppliers": { label: "Suppliers", icon: Building2, desc: "Supplier accounts & vendor management" },
    "/dashboard/supplier-ledger": { label: "Supplier Ledger", icon: BookMarked, desc: "Supplier financial audit & statement" },
    "/dashboard/expenses": { label: "Expense Management", icon: Receipt, desc: "Operating expenses & dynamic headers" },
    "/dashboard/sales": { label: "Sales History", icon: Printer, desc: "Invoices & receipts" },
    "/dashboard/quotations": { label: "Quotations", icon: FileText, desc: "Price estimates & quotations" },
    "/dashboard/branding": { label: "Store Branding", icon: Building2, desc: "Business identity, logo & receipt print notes" },
    "/dashboard/admin": { label: "Admin Control", icon: ShieldCheck, desc: "User management & system" },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [branding, setBranding] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>("");
    const pathname = usePathname();

    useEffect(() => {
        // Fetch session
        fetch("/api/auth/session")
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated) {
                    setUser(data.user);
                }
            })
            .catch(() => {})
            .finally(() => setSessionLoading(false));

        // Fetch branding
        fetch("/api/branding")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.branding) {
                    setBranding(data.branding);
                }
            })
            .catch(() => {});

        // Clock updater
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
            setCurrentDate(
                now.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                })
            );
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const currentPage = pageMeta[pathname] || {
        label: pathname.split("/").pop() || "Dashboard",
        icon: LayoutDashboard,
        desc: "Management console",
    };
    const PageIcon = currentPage.icon;
    const roleBadge = getRoleBadge(user?.role);
    const allowed = user ? isRouteAllowed(user.role, pathname) : true;
    const canAccessPOS = isRouteAllowed(user?.role, "/dashboard/pos");

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                {/* Top Header */}
                <header className="h-18 border-b border-slate-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
                    {/* Left: Mobile Toggle & Page Title */}
                    <div className="flex items-center gap-3.5 min-w-0">
                        <MobileNav />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 hidden sm:flex">
                                <PageIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                                        {branding?.businessName || "CGS Computers"} /
                                    </span>
                                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate capitalize">
                                        {currentPage.label}
                                    </h1>
                                </div>
                                <span className="text-[11px] text-slate-500 hidden md:block">
                                    {currentPage.desc}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Real-time Date/Time & Quick Links & Profile */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Live Clock & Date */}
                        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                <span>{currentDate}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-blue-600 font-semibold">{currentTime}</span>
                            </div>
                        </div>

                        {/* POS Quick Button in Header (if user role is permitted and not currently on POS page) */}
                        {canAccessPOS && pathname !== "/dashboard/pos" && (
                            <Link
                                href="/dashboard/pos"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>New Sale (POS)</span>
                            </Link>
                        )}

                        {/* User Profile Pill with Role-based Badge */}
                        <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l sm:border-slate-200/80">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-xs font-bold text-slate-900 leading-tight">
                                    {user?.name || (sessionLoading ? "Authenticating..." : "System User")}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5",
                                    roleBadge.badgeBg,
                                    roleBadge.badgeColor,
                                    roleBadge.badgeBorder
                                )}>
                                    {roleBadge.name}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-full premium-gradient p-[2px] shadow-xs shrink-0">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <div className={cn(
                                        "w-full h-full flex items-center justify-center text-white font-bold text-sm",
                                        user?.role === "ADMIN" ? "bg-purple-600" :
                                        user?.role === "TECHNICIAN" ? "bg-amber-600" :
                                        user?.role === "ACCOUNTANT" ? "bg-blue-600" :
                                        "bg-emerald-600"
                                    )}>
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Viewport Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {!sessionLoading && user && !allowed ? (
                            /* Access Restricted Notice */
                            <div className="bg-white border border-rose-200 rounded-3xl p-8 md:p-12 shadow-sm text-center max-w-2xl mx-auto my-12 space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
                                    <p className="text-slate-500 text-sm">
                                        Your account role <span className="font-bold text-slate-800">({roleBadge.name})</span> is not authorized to access the <span className="font-semibold text-slate-800">{currentPage.label}</span> module.
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Please contact your system Administrator if you need permission for this module.
                                    </p>
                                </div>

                                <div className="pt-4 flex flex-wrap gap-3 justify-center">
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back to Dashboard</span>
                                    </Link>
                                    {isRouteAllowed(user.role, "/dashboard/pos") && (
                                        <Link
                                            href="/dashboard/pos"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>Go to POS / Billing</span>
                                        </Link>
                                    )}
                                    {isRouteAllowed(user.role, "/dashboard/repairs") && (
                                        <Link
                                            href="/dashboard/repairs"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shadow-sm"
                                        >
                                            <Wrench className="w-4 h-4" />
                                            <span>Go to Repairs</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
