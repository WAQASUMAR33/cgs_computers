export type UserRole = "ADMIN" | "SALESMAN" | "TECHNICIAN" | "ACCOUNTANT" | "CASHIER";

export interface RoleDefinition {
    id: UserRole;
    name: string;
    description: string;
    badgeColor: string;
    badgeBg: string;
    badgeBorder: string;
    allowedRoutes: string[];
}

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
    ADMIN: {
        id: "ADMIN",
        name: "Administrator",
        description: "Unrestricted access to all modules, financial ledgers, system settings & user security.",
        badgeColor: "text-purple-700",
        badgeBg: "bg-purple-50",
        badgeBorder: "border-purple-200",
        allowedRoutes: [
            "/dashboard",
            "/dashboard/pos",
            "/dashboard/demands",
            "/dashboard/repairs",
            "/dashboard/spare-parts",
            "/dashboard/purchases",
            "/dashboard/products",
            "/dashboard/categories",
            "/dashboard/brands",
            "/dashboard/customers",
            "/dashboard/ledger",
            "/dashboard/payments",
            "/dashboard/suppliers",
            "/dashboard/supplier-ledger",
            "/dashboard/expenses",
            "/dashboard/sales",
            "/dashboard/quotations",
            "/dashboard/branding",
            "/dashboard/admin",
        ],
    },
    SALESMAN: {
        id: "SALESMAN",
        name: "Sales Men",
        description: "Point of Sale (POS), customer invoices, price quotations, demand requests & product catalog.",
        badgeColor: "text-emerald-700",
        badgeBg: "bg-emerald-50",
        badgeBorder: "border-emerald-200",
        allowedRoutes: [
            "/dashboard",
            "/dashboard/pos",
            "/dashboard/demands",
            "/dashboard/products",
            "/dashboard/customers",
            "/dashboard/payments",
            "/dashboard/sales",
            "/dashboard/quotations",
        ],
    },
    CASHIER: {
        id: "CASHIER",
        name: "Cashier (Legacy)",
        description: "POS billing, customer sales, quotations, demand book & customer registry.",
        badgeColor: "text-emerald-700",
        badgeBg: "bg-emerald-50",
        badgeBorder: "border-emerald-200",
        allowedRoutes: [
            "/dashboard",
            "/dashboard/pos",
            "/dashboard/demands",
            "/dashboard/products",
            "/dashboard/customers",
            "/dashboard/payments",
            "/dashboard/sales",
            "/dashboard/quotations",
        ],
    },
    TECHNICIAN: {
        id: "TECHNICIAN",
        name: "Technician",
        description: "Device repair tickets, diagnostic logs, claim receipts, spare parts inventory & parts requisition.",
        badgeColor: "text-amber-700",
        badgeBg: "bg-amber-50",
        badgeBorder: "border-amber-200",
        allowedRoutes: [
            "/dashboard",
            "/dashboard/repairs",
            "/dashboard/spare-parts",
            "/dashboard/demands",
            "/dashboard/products",
        ],
    },
    ACCOUNTANT: {
        id: "ACCOUNTANT",
        name: "Accountant",
        description: "Daily operating expenses, customer/supplier ledgers, purchase bills, payment collections & financial audit.",
        badgeColor: "text-blue-700",
        badgeBg: "bg-blue-50",
        badgeBorder: "border-blue-200",
        allowedRoutes: [
            "/dashboard",
            "/dashboard/expenses",
            "/dashboard/ledger",
            "/dashboard/payments",
            "/dashboard/suppliers",
            "/dashboard/supplier-ledger",
            "/dashboard/purchases",
            "/dashboard/products",
            "/dashboard/categories",
            "/dashboard/brands",
            "/dashboard/customers",
            "/dashboard/sales",
            "/dashboard/quotations",
            "/dashboard/spare-parts",
        ],
    },
};

export interface ModulePermission {
    title: string;
    section: string;
    path: string;
    allowedRoles: UserRole[];
    description: string;
}

export const MODULE_PERMISSIONS_LIST: ModulePermission[] = [
    // Operations
    { title: "Dashboard", section: "Operations", path: "/dashboard", allowedRoles: ["ADMIN", "SALESMAN", "TECHNICIAN", "ACCOUNTANT", "CASHIER"], description: "Business summary & key activity indicators" },
    { title: "POS / Billing", section: "Operations", path: "/dashboard/pos", allowedRoles: ["ADMIN", "SALESMAN", "CASHIER"], description: "Point of sale, barcode scan & customer invoicing" },
    { title: "Demand Book", section: "Operations", path: "/dashboard/demands", allowedRoles: ["ADMIN", "SALESMAN", "TECHNICIAN", "CASHIER"], description: "Customer item demands, market procurement & shortage alerts" },
    { title: "Repairs & Services", section: "Operations", path: "/dashboard/repairs", allowedRoles: ["ADMIN", "TECHNICIAN"], description: "Hardware ticketing, diagnostic logs, service jobs & delivery" },
    { title: "Spare Parts Stock", section: "Operations", path: "/dashboard/spare-parts", allowedRoles: ["ADMIN", "TECHNICIAN", "ACCOUNTANT"], description: "Spare parts inventory, stock tracking & component movements" },
    { title: "Purchases (Stock In)", section: "Operations", path: "/dashboard/purchases", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Supplier purchase bills, stock-in entries & wholesale orders" },

    // Catalog & Stock
    { title: "Products", section: "Catalog & Stock", path: "/dashboard/products", allowedRoles: ["ADMIN", "SALESMAN", "TECHNICIAN", "ACCOUNTANT", "CASHIER"], description: "Inventory items, retail/cost prices & barcodes" },
    { title: "Categories", section: "Catalog & Stock", path: "/dashboard/categories", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Inventory category hierarchy" },
    { title: "Brands", section: "Catalog & Stock", path: "/dashboard/brands", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Manufacturers and hardware brand registry" },

    // Finance & Accounts
    { title: "Customers", section: "Finance & Accounts", path: "/dashboard/customers", allowedRoles: ["ADMIN", "SALESMAN", "ACCOUNTANT", "CASHIER"], description: "Customer accounts, contact directory & credit limits" },
    { title: "Customer Ledger", section: "Finance & Accounts", path: "/dashboard/ledger", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Customer debit/credit statements & account reconciliation" },
    { title: "Customer Payments", section: "Finance & Accounts", path: "/dashboard/payments", allowedRoles: ["ADMIN", "SALESMAN", "ACCOUNTANT", "CASHIER"], description: "Cash and online debt collection receipts" },
    { title: "Suppliers", section: "Finance & Accounts", path: "/dashboard/suppliers", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Vendor contact directory & payable balances" },
    { title: "Supplier Ledger", section: "Finance & Accounts", path: "/dashboard/supplier-ledger", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Vendor debit/credit audit & statement history" },
    { title: "Expense Management", section: "Finance & Accounts", path: "/dashboard/expenses", allowedRoles: ["ADMIN", "ACCOUNTANT"], description: "Shop operating expenses & dynamic expense headers" },
    { title: "Sales History", section: "Finance & Accounts", path: "/dashboard/sales", allowedRoles: ["ADMIN", "SALESMAN", "ACCOUNTANT", "CASHIER"], description: "Past invoice archive, returns & receipts printing" },
    { title: "Quotations", section: "Finance & Accounts", path: "/dashboard/quotations", allowedRoles: ["ADMIN", "SALESMAN", "ACCOUNTANT", "CASHIER"], description: "Customer price estimations & formal proposals" },

    // System
    { title: "Store Branding", section: "System", path: "/dashboard/branding", allowedRoles: ["ADMIN"], description: "Shop identity, thermal printer header, logo & receipt notes" },
    { title: "Admin Control", section: "System", path: "/dashboard/admin", allowedRoles: ["ADMIN"], description: "User accounts, multi-role security & permission audit" },
];

export function isRouteAllowed(role: string | undefined | null, pathname: string): boolean {
    if (!role) return false;
    const cleanRole = role.toUpperCase();
    if (cleanRole === "ADMIN") return true;

    const roleDef = ROLE_DEFINITIONS[cleanRole];
    if (!roleDef) return false;

    // Check if the current pathname matches an allowed route
    return roleDef.allowedRoutes.some((route) => {
        if (route === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(route);
    });
}

export function getRoleBadge(role: string | undefined | null) {
    const clean = (role || "SALESMAN").toUpperCase();
    return (
        ROLE_DEFINITIONS[clean] || {
            id: clean as UserRole,
            name: clean,
            description: "",
            badgeColor: "text-slate-700",
            badgeBg: "bg-slate-100",
            badgeBorder: "border-slate-200",
            allowedRoutes: [],
        }
    );
}
