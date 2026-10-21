"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    BookOpen,
    Wallet,
    Printer,
    Settings,
    LogOut,
    ShieldCheck,
    Layers,
    Tag,
    X,
    Menu,
    Sparkles,
    Zap,
    ChevronRight,
    Store,
    Truck,
    Building2,
    BookMarked,
    Receipt,
    FileText,
    Wrench,
    ClipboardList,
    Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { isRouteAllowed, getRoleBadge } from "@/lib/permissions";

interface MenuItem {
    icon: any;
    label: string;
    href: string;
    badge?: string;
    adminOnly?: boolean;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        title: "OPERATIONS",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: ShoppingCart, label: "POS / Billing", href: "/dashboard/pos", badge: "POS" },
            { icon: ClipboardList, label: "Demand Book", href: "/dashboard/demands", badge: "NEW" },
            { icon: Wrench, label: "Repairs & Services", href: "/dashboard/repairs", badge: "M3" },
            { icon: Cpu, label: "Spare Parts Stock", href: "/dashboard/spare-parts", badge: "STOCK" },
            { icon: Truck, label: "Purchases (Stock In)", href: "/dashboard/purchases" },
        ],
    },
    {
        title: "CATALOG & STOCK",
        items: [
            { icon: Package, label: "Products", href: "/dashboard/products" },
            { icon: Layers, label: "Categories", href: "/dashboard/categories" },
            { icon: Tag, label: "Brands", href: "/dashboard/brands" },
        ],
    },
    {
        title: "FINANCE & ACCOUNTS",
        items: [
            { icon: Users, label: "Customers", href: "/dashboard/customers" },
            { icon: BookOpen, label: "Customer Ledger", href: "/dashboard/ledger" },
            { icon: Wallet, label: "Customer Payments", href: "/dashboard/payments" },
            { icon: Building2, label: "Suppliers", href: "/dashboard/suppliers" },
            { icon: BookMarked, label: "Supplier Ledger", href: "/dashboard/supplier-ledger" },
            { icon: Receipt, label: "Expenses", href: "/dashboard/expenses" },
            { icon: Printer, label: "Sales History", href: "/dashboard/sales" },
            { icon: FileText, label: "Quotations", href: "/dashboard/quotations" },
        ],
    },
    {
        title: "SYSTEM",
        items: [
            { icon: Building2, label: "Store Branding", href: "/dashboard/branding" },
            { icon: ShieldCheck, label: "Admin Control", href: "/dashboard/admin", adminOnly: true },
        ],
    },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [branding, setBranding] = useState<any>(null);

    useEffect(() => {
        fetch("/api/auth/session")
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated) {
                    setUser(data.user);
                }
            })
            .catch(() => {});

        fetch("/api/branding")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.branding) {
                    setBranding(data.branding);
                }
            })
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
            setLoggingOut(false);
        }
    };

    const roleBadge = getRoleBadge(user?.role);
    const canAccessPOS = isRouteAllowed(user?.role, "/dashboard/pos");

    return (
        <div className="flex flex-col h-full text-foreground select-none">
            {/* Branding Header */}
            <div className="p-5 pb-3">
                <Link
                    href="/dashboard"
                    onClick={onNavigate}
                    className="flex items-center gap-3 p-2 hover:bg-slate-100/80 transition-all group"
                >
                    <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-1">
                        {branding?.logo ? (
                            <img
                                src={branding.logo}
                                alt="Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.currentTarget as any).src = "/libertycollection.png";
                                }}
                            />
                        ) : (
                            <Store className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-extrabold tracking-tight leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                            {branding?.businessName || "CGS Computers"}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span className="text-[10px] font-semibold text-foreground/50 tracking-wide uppercase truncate">
                                {branding?.description?.slice(0, 22) || "POS & Service Hub"}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick POS Action CTA Button (only for roles allowed POS) */}
            {canAccessPOS && (
                <div className="px-5 mb-3">
                    <Link
                        href="/dashboard/pos"
                        onClick={onNavigate}
                        className="w-full py-2.5 px-4 rounded-full bg-primary text-white font-semibold text-sm flex items-center justify-between shadow-sm hover:shadow-md hover:bg-primary-hover active:scale-[0.98] transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Zap className="w-4 h-4 fill-white text-white group-hover:rotate-12 transition-transform" />
                            <span>Open POS Billing</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            )}

            {/* Navigation Menu (Filtered by User Role & Permissions) */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
                {menuSections.map((section) => {
                    // Filter items: must be allowed for the user's role
                    const visibleItems = section.items.filter((item) => {
                        if (!user) return !item.adminOnly;
                        return isRouteAllowed(user.role, item.href);
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.title} className="space-y-1">
                            <div className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {section.title}
                            </div>
                            {visibleItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            "relative flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 group cursor-pointer",
                                            isActive
                                                ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "p-1 rounded-lg transition-colors",
                                                    isActive
                                                        ? "text-blue-700"
                                                        : "text-slate-500 group-hover:text-slate-800"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span>{item.label}</span>
                                        </div>

                                        {item.badge && (
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                    isActive
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-100 text-blue-700"
                                                )}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Sidebar User Footer */}
            <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs",
                            user?.role === "ADMIN" ? "bg-gradient-to-br from-purple-600 to-indigo-600" :
                            user?.role === "TECHNICIAN" ? "bg-gradient-to-br from-amber-500 to-orange-600" :
                            user?.role === "ACCOUNTANT" ? "bg-gradient-to-br from-blue-600 to-cyan-600" :
                            "bg-gradient-to-br from-emerald-600 to-teal-600"
                        )}>
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                                {user?.name || "System User"}
                            </p>
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mt-0.5",
                                roleBadge.badgeBg,
                                roleBadge.badgeColor,
                                roleBadge.badgeBorder
                            )}>
                                {roleBadge.name}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-full text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                >
                    {loggingOut ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                            <span>Signing out...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden lg:flex flex-col h-full w-64 bg-white border-r border-slate-200/70 z-30 shrink-0 shadow-xs">
            <SidebarContent />
        </aside>
    );
}

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Open Navigation"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden animate-fade-in"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-72 bg-white rounded-r-3xl border-r border-slate-200/70 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors z-10 cursor-pointer"
                    title="Close Navigation"
                >
                    <X className="w-5 h-5" />
                </button>
                <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
        </>
    );
}
