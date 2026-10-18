import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Total sales metrics
        const salesData = await prisma.sale.aggregate({
            _sum: {
                netTotal: true,
                paidAmount: true,
                balance: true,
            },
            _count: {
                id: true,
            },
        });

        // 2. Total customers count and total customer balances (receivables)
        const customerStats = await prisma.customer.aggregate({
            _count: { id: true },
            _sum: { balance: true },
        });

        // 3. Total products count & low stock count (< 10 units)
        const productCount = await prisma.product.count();
        const lowStockCount = await prisma.product.count({
            where: {
                stock: { lte: 10 },
            },
        });

        // 4. Low stock products list (top 5 lowest stock)
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: { lte: 10 },
            },
            orderBy: { stock: "asc" },
            take: 5,
            select: {
                id: true,
                code: true,
                name: true,
                stock: true,
                retailPrice: true,
                category: { select: { name: true } },
            },
        });

        // 5. Total Categories & Brands count
        const categoryCount = await prisma.category.count();
        const brandCount = await prisma.brand.count();

        // 6. Today's collections
        const todaySales = await prisma.sale.aggregate({
            where: {
                date: { gte: today },
            },
            _sum: {
                paidAmount: true,
                netTotal: true,
            },
            _count: {
                id: true,
            },
        });

        // 7. Recent sales with customer details
        const recentSales = await prisma.sale.findMany({
            take: 6,
            orderBy: { date: "desc" },
            include: {
                customer: {
                    select: {
                        name: true,
                        contact: true,
                    },
                },
            },
        });

        // 8. Top selling products based on sale items
        const topProducts = await prisma.saleItem.groupBy({
            by: ["productId"],
            _sum: {
                quantity: true,
                subtotal: true,
            },
            take: 5,
            orderBy: {
                _sum: {
                    quantity: "desc",
                },
            },
        });

        // Enrich top products with names and prices
        const topProductsEnriched = await Promise.all(
            topProducts.map(async (item: any) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: {
                        name: true,
                        code: true,
                        retailPrice: true,
                        category: { select: { name: true } },
                    },
                });
                return {
                    id: item.productId,
                    name: product?.name || "Unknown Product",
                    code: product?.code || "",
                    category: product?.category?.name || "General",
                    sold: item._sum.quantity || 0,
                    revenue: Number(item._sum.subtotal || 0),
                };
            })
        );

        // ==========================================
        // 9. TIME SERIES & CHART ANALYTICS
        // ==========================================
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Fetch sales within the last 6 months for trend charts
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const periodSales = await prisma.sale.findMany({
            where: {
                date: { gte: sixMonthsAgo },
            },
            select: {
                date: true,
                netTotal: true,
                paidAmount: true,
                balance: true,
                type: true,
            },
            orderBy: { date: "asc" },
        });

        // Helper to format date string YYYY-MM-DD
        const toDateKey = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        // --- Last 7 Days Timeline ---
        const last7DaysMap = new Map<string, { label: string; fullDate: string; revenue: number; paid: number; orders: number }>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            const dayName = dayNames[d.getDay()];
            const dayNum = d.getDate();
            last7DaysMap.set(key, {
                label: `${dayName} ${dayNum}`,
                fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                revenue: 0,
                paid: 0,
                orders: 0,
            });
        }

        // --- Last 30 Days Timeline ---
        const last30DaysMap = new Map<string, { label: string; fullDate: string; revenue: number; paid: number; orders: number }>();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            last30DaysMap.set(key, {
                label: `${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()}`,
                fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                revenue: 0,
                paid: 0,
                orders: 0,
            });
        }

        // --- Last 6 Months Timeline ---
        const last6MonthsMap = new Map<string, { label: string; monthYear: string; revenue: number; paid: number; orders: number }>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            last6MonthsMap.set(key, {
                label: monthNames[d.getMonth()],
                monthYear: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                revenue: 0,
                paid: 0,
                orders: 0,
            });
        }

        // --- Day of Week Breakdown (Sunday to Saturday) ---
        const dayOfWeekData = dayNames.map((name) => ({
            day: name,
            revenue: 0,
            orders: 0,
        }));

        // Populate timelines with sales data
        periodSales.forEach((sale: any) => {
            const sDate = new Date(sale.date);
            const dateKey = toDateKey(sDate);
            const monthKey = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, "0")}`;
            const net = Number(sale.netTotal || 0);
            const paid = Number(sale.paidAmount || 0);

            // 7 days
            if (last7DaysMap.has(dateKey)) {
                const item = last7DaysMap.get(dateKey)!;
                item.revenue += net;
                item.paid += paid;
                item.orders += 1;
            }

            // 30 days
            if (last30DaysMap.has(dateKey)) {
                const item = last30DaysMap.get(dateKey)!;
                item.revenue += net;
                item.paid += paid;
                item.orders += 1;
            }

            // 6 months
            if (last6MonthsMap.has(monthKey)) {
                const item = last6MonthsMap.get(monthKey)!;
                item.revenue += net;
                item.paid += paid;
                item.orders += 1;
            }

            // Day of week
            const dayIdx = sDate.getDay();
            if (dayOfWeekData[dayIdx]) {
                dayOfWeekData[dayIdx].revenue += net;
                dayOfWeekData[dayIdx].orders += 1;
            }
        });

        // Convert maps to arrays
        const last7Days = Array.from(last7DaysMap.values());
        const last30Days = Array.from(last30DaysMap.values());
        const last6Months = Array.from(last6MonthsMap.values());

        // --- Bill Types Breakdown (Retail, Wholesale, Quotation) ---
        const allSalesByType = await prisma.sale.groupBy({
            by: ["type"],
            _count: { id: true },
            _sum: { netTotal: true, paidAmount: true },
        });

        const billTypeBreakdown = allSalesByType.map((item: any) => ({
            type: item.type,
            name: item.type === "RETAIL" ? "Retail Sales" : item.type === "WHOLESALE" ? "Wholesale" : "Quotation",
            count: item._count.id || 0,
            revenue: Number(item._sum.netTotal || 0),
            paid: Number(item._sum.paidAmount || 0),
        }));

        // --- Category Sales Breakdown ---
        const categorySaleItems = await prisma.saleItem.findMany({
            select: {
                quantity: true,
                subtotal: true,
                product: {
                    select: {
                        category: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        const categorySalesMap = new Map<string, { name: string; revenue: number; units: number }>();
        categorySaleItems.forEach((item: any) => {
            const catName = item.product?.category?.name || "Uncategorized";
            const existing = categorySalesMap.get(catName) || { name: catName, revenue: 0, units: 0 };
            existing.revenue += Number(item.subtotal || 0);
            existing.units += item.quantity || 0;
            categorySalesMap.set(catName, existing);
        });

        const categorySales = Array.from(categorySalesMap.values()).sort((a: any, b: any) => b.revenue - a.revenue);

        // --- Category Inventory Distribution (Total items in store per category) ---
        const categoriesWithProductCount = await prisma.category.findMany({
            select: {
                name: true,
                products: {
                    select: {
                        stock: true,
                        retailPrice: true,
                    },
                },
            },
        });

        const categoryInventory = categoriesWithProductCount.map((cat: any) => {
            const totalStock = cat.products.reduce((acc: number, p: any) => acc + (p.stock || 0), 0);
            const totalValue = cat.products.reduce((acc: number, p: any) => acc + (p.stock || 0) * Number(p.retailPrice || 0), 0);
            return {
                name: cat.name,
                productsCount: cat.products.length,
                totalStock,
                totalValue,
            };
        }).sort((a: any, b: any) => b.totalStock - a.totalStock);

        return NextResponse.json({
            stats: {
                totalSales: Number(salesData._sum.netTotal || 0),
                totalInvoices: salesData._count.id || 0,
                todayRevenue: Number(todaySales._sum.paidAmount || 0),
                todaySalesTotal: Number(todaySales._sum.netTotal || 0),
                todayInvoices: todaySales._count.id || 0,
                customerCount: customerStats._count.id || 0,
                totalReceivables: Number(customerStats._sum.balance || 0),
                productCount,
                lowStockCount,
                categoryCount,
                brandCount,
            },
            recentSales,
            topProducts: topProductsEnriched,
            lowStockProducts,
            analytics: {
                last7Days,
                last30Days,
                last6Months,
                dayOfWeekData,
                billTypeBreakdown,
                categorySales,
                categoryInventory,
                totalPaid: Number(salesData._sum.paidAmount || 0),
                totalOutstanding: Number(salesData._sum.balance || 0),
            },
        });
    } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
