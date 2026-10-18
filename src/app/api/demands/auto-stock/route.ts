import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        // Find products with stock <= 2
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: {
                    lte: 2,
                },
            },
            include: {
                category: true,
                brand: true,
            },
            take: 50,
        });

        if (lowStockProducts.length === 0) {
            return NextResponse.json({
                message: "All products have sufficient stock. No low stock demands needed.",
                createdCount: 0,
            });
        }

        // Check which products already have an active demand
        let existingProductIds = new Set<string>();

        if ((prisma as any).demand) {
            const existingDemands = await (prisma as any).demand.findMany({
                where: {
                    productId: {
                        in: lowStockProducts.map((p: any) => p.id),
                    },
                    status: {
                        in: ["PENDING", "ORDERED"],
                    },
                },
                select: {
                    productId: true,
                },
            });
            existingProductIds = new Set(existingDemands.map((d: any) => d.productId));
        } else {
            const rawDemands: any = await prisma.$queryRawUnsafe(`
                SELECT productId FROM Demand WHERE status IN ('PENDING', 'ORDERED') AND productId IS NOT NULL
            `);
            existingProductIds = new Set(rawDemands.map((d: any) => d.productId));
        }

        const toCreate = lowStockProducts.filter((p: any) => !existingProductIds.has(p.id));

        if (toCreate.length === 0) {
            return NextResponse.json({
                message: "All low-stock items already have active demand orders logged.",
                createdCount: 0,
            });
        }

        const today = new Date();
        const datePrefix = `DMD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
        
        let currentCount = 0;
        if ((prisma as any).demand) {
            currentCount = await (prisma as any).demand.count({
                where: {
                    demandNumber: {
                        startsWith: datePrefix,
                    },
                },
            });
        } else {
            const rawCount: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM Demand WHERE demandNumber LIKE '${datePrefix}%'`);
            currentCount = Number(rawCount[0]?.c || 0);
        }

        let createdCount = 0;
        for (const prod of toCreate) {
            currentCount++;
            const demandNumber = `${datePrefix}-${String(currentCount).padStart(4, "0")}`;
            const targetQty = prod.stock <= 0 ? 5 : 3;

            if ((prisma as any).demand) {
                await (prisma as any).demand.create({
                    data: {
                        demandNumber,
                        itemName: prod.name,
                        category: prod.category?.name || null,
                        brand: prod.brand?.name || null,
                        quantity: targetQty,
                        targetPrice: Number(prod.costPrice || prod.retailPrice || 0),
                        advancePaid: 0,
                        type: "STOCK_LOW",
                        priority: prod.stock <= 0 ? "HIGH" : "NORMAL",
                        status: "PENDING",
                        productId: prod.id,
                        notes: `Automated stock replenishment alert. Current stock in shop: ${prod.stock} units.`,
                    },
                });
            } else {
                const id = 'dmd_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                await prisma.$queryRawUnsafe(`
                    INSERT INTO Demand (id, demandNumber, itemName, category, brand, quantity, targetPrice, advancePaid, type, priority, status, productId, notes, createdAt, updatedAt)
                    VALUES (
                        '${id}',
                        '${demandNumber}',
                        '${(prod.name || '').replace(/'/g, "''")}',
                        ${prod.category?.name ? `'${prod.category.name.replace(/'/g, "''")}'` : 'NULL'},
                        ${prod.brand?.name ? `'${prod.brand.name.replace(/'/g, "''")}'` : 'NULL'},
                        ${targetQty},
                        ${Number(prod.costPrice || prod.retailPrice || 0)},
                        0,
                        'STOCK_LOW',
                        '${prod.stock <= 0 ? "HIGH" : "NORMAL"}',
                        'PENDING',
                        '${prod.id}',
                        'Automated stock replenishment alert. Current stock in shop: ${prod.stock} units.',
                        NOW(),
                        NOW()
                    )
                `);
            }
            createdCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully created ${createdCount} stock demand requisitions.`,
            createdCount,
        });
    } catch (error: any) {
        console.error("Error creating auto stock demands:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate auto stock demands" },
            { status: 500 }
        );
    }
}
