import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const [
            total,
            received,
            diagnosing,
            inProgress,
            waitingForParts,
            ready,
            delivered,
            unrepairable,
            cancelled,
            financials,
        ] = await Promise.all([
            prisma.repair.count(),
            prisma.repair.count({ where: { status: "RECEIVED" } }),
            prisma.repair.count({ where: { status: "DIAGNOSING" } }),
            prisma.repair.count({ where: { status: "IN_PROGRESS" } }),
            prisma.repair.count({ where: { status: "WAITING_FOR_PARTS" } }),
            prisma.repair.count({ where: { status: "READY" } }),
            prisma.repair.count({ where: { status: "DELIVERED" } }),
            prisma.repair.count({ where: { status: "UNREPAIRABLE" } }),
            prisma.repair.count({ where: { status: "CANCELLED" } }),
            prisma.repair.aggregate({
                _sum: {
                    finalAmount: true,
                    paidAmount: true,
                    balance: true,
                },
            }),
        ]);

        const activeCount = received + diagnosing + inProgress + waitingForParts;

        return NextResponse.json({
            total,
            activeCount,
            received,
            diagnosing,
            inProgress,
            waitingForParts,
            ready,
            delivered,
            unrepairable,
            cancelled,
            totalRevenue: Number(financials._sum.finalAmount || 0),
            totalPaid: Number(financials._sum.paidAmount || 0),
            totalPendingBalance: Number(financials._sum.balance || 0),
        });
    } catch (error: any) {
        console.error("Failed to fetch repair stats:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
