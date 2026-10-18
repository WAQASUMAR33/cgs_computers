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
    ClipboardList
} from "lucide-react";

const pageMeta: Record<string, { label: string; icon: any; desc: string }> = {
    "/dashboard": { label: "Dashboard", icon: LayoutDashboard, desc: "Executive business summary" },
    "/dashboard/pos": { label: "POS / Billing", icon: ShoppingCart, desc: "Point of sale & invoicing" },
    "/dashboard/demands": { label: "Item Demand Book", icon: ClipboardList, desc: "Customer special demands, low stock alerts & market requisitions" },
    "/dashboard/repairs": { label: "Repairs & Maintenance", icon: Wrench, desc: "Device repair tickets, diagnostic logs & claim receipts" },
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
            .catch(() => {});

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

                        {/* POS Quick Button in Header (if not on POS page) */}
                        {pathname !== "/dashboard/pos" && (
                            <Link
                                href="/dashboard/pos"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>New Sale (POS)</span>
                            </Link>
                        )}

                        {/* User Profile Pill */}
                        <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l sm:border-slate-200/80">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-xs font-bold text-slate-900 leading-tight">
                                    {user?.name || "Loading..."}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">
                                    {user?.role || "CASHIER"}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-full premium-gradient p-[2px] shadow-xs shrink-0">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
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
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
