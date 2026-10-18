import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        let total = 0, pending = 0, ordered = 0, arrived = 0, fulfilled = 0, cancelled = 0, urgent = 0;

        if ((prisma as any).demand) {
            [
                total,
                pending,
                ordered,
                arrived,
                fulfilled,
                cancelled,
                urgent,
            ] = await Promise.all([
                (prisma as any).demand.count(),
                (prisma as any).demand.count({ where: { status: "PENDING" } }),
                (prisma as any).demand.count({ where: { status: "ORDERED" } }),
                (prisma as any).demand.count({ where: { status: "ARRIVED" } }),
                (prisma as any).demand.count({ where: { status: "FULFILLED" } }),
                (prisma as any).demand.count({ where: { status: "CANCELLED" } }),
                (prisma as any).demand.count({ where: { priority: "URGENT", status: { in: ["PENDING", "ORDERED"] } } }),
            ]);
        } else {
            const counts: any = await prisma.$queryRawUnsafe(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'ORDERED' THEN 1 ELSE 0 END) as ordered,
                    SUM(CASE WHEN status = 'ARRIVED' THEN 1 ELSE 0 END) as arrived,
                    SUM(CASE WHEN status = 'FULFILLED' THEN 1 ELSE 0 END) as fulfilled,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
                    SUM(CASE WHEN priority = 'URGENT' AND status IN ('PENDING', 'ORDERED') THEN 1 ELSE 0 END) as urgent
                FROM Demand
            `);
            if (counts && counts[0]) {
                const c = counts[0];
                total = Number(c.total || 0);
                pending = Number(c.pending || 0);
                ordered = Number(c.ordered || 0);
                arrived = Number(c.arrived || 0);
                fulfilled = Number(c.fulfilled || 0);
                cancelled = Number(c.cancelled || 0);
                urgent = Number(c.urgent || 0);
            }
        }

        const lowStockProducts = await prisma.product.count({ where: { stock: { lte: 2 } } });

        return NextResponse.json({
            total,
            pending,
            ordered,
            arrived,
            fulfilled,
            cancelled,
            urgent,
            lowStockProducts,
        });
    } catch (error: any) {
        console.error("Error fetching demand stats:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
