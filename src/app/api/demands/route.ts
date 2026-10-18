import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/demands - List demands with filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";
        const status = searchParams.get("status") || "ALL";
        const type = searchParams.get("type") || "ALL";
        const priority = searchParams.get("priority") || "ALL";

        const where: any = {};

        if (status !== "ALL") where.status = status;
        if (type !== "ALL") where.type = type;
        if (priority !== "ALL") where.priority = priority;

        if (query) {
            where.OR = [
                { demandNumber: { contains: query } },
                { itemName: { contains: query } },
                { category: { contains: query } },
                { brand: { contains: query } },
                { customerName: { contains: query } },
                { customerPhone: { contains: query } },
                { supplierName: { contains: query } },
                { notes: { contains: query } },
            ];
        }

        if ((prisma as any).demand) {
            const demands = await (prisma as any).demand.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            contact: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            stock: true,
                            retailPrice: true,
                            costPrice: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return NextResponse.json(demands);
        }

        // Direct SQL fallback if Prisma runtime model not yet refreshed in memory
        let sql = "SELECT * FROM Demand WHERE 1=1";
        if (status !== "ALL") sql += ` AND status = '${status}'`;
        if (type !== "ALL") sql += ` AND type = '${type}'`;
        if (priority !== "ALL") sql += ` AND priority = '${priority}'`;
        if (query) {
            const q = query.replace(/'/g, "''");
            sql += ` AND (demandNumber LIKE '%${q}%' OR itemName LIKE '%${q}%' OR customerName LIKE '%${q}%' OR customerPhone LIKE '%${q}%')`;
        }
        sql += " ORDER BY createdAt DESC";
        const demands: any = await prisma.$queryRawUnsafe(sql);
        return NextResponse.json(demands);
    } catch (error: any) {
        console.error("Error fetching demands:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch demands" },
            { status: 500 }
        );
    }
}

// POST /api/demands - Create a new demand
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            itemName,
            category,
            brand,
            quantity = 1,
            targetPrice = 0,
            advancePaid = 0,
            type = "CUSTOMER_DEMAND",
            priority = "NORMAL",
            customerId,
            customerName,
            customerPhone,
            productId,
            supplierName,
            notes,
            expectedDate,
        } = body;

        if (!itemName || !itemName.trim()) {
            return NextResponse.json(
                { error: "Item name is required" },
                { status: 400 }
            );
        }

        const today = new Date();
        const datePrefix = `DMD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
        
        let countToday = 0;
        if ((prisma as any).demand) {
            countToday = await (prisma as any).demand.count({
                where: {
                    demandNumber: {
                        startsWith: datePrefix,
                    },
                },
            });
        } else {
            const rawCount: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM Demand WHERE demandNumber LIKE '${datePrefix}%'`);
            countToday = Number(rawCount[0]?.c || 0);
        }

        const demandNumber = `${datePrefix}-${String(countToday + 1).padStart(4, "0")}`;

        if ((prisma as any).demand) {
            const demand = await (prisma as any).demand.create({
                data: {
                    demandNumber,
                    itemName: itemName.trim(),
                    category: category || null,
                    brand: brand || null,
                    quantity: Number(quantity) || 1,
                    targetPrice: Number(targetPrice) || 0,
                    advancePaid: Number(advancePaid) || 0,
                    type: type || "CUSTOMER_DEMAND",
                    priority: priority || "NORMAL",
                    status: "PENDING",
                    customerId: customerId || null,
                    customerName: customerName || null,
                    customerPhone: customerPhone || null,
                    productId: productId || null,
                    supplierName: supplierName || null,
                    notes: notes || null,
                    expectedDate: expectedDate ? new Date(expectedDate) : null,
                },
                include: {
                    customer: true,
                    product: true,
                },
            });
            return NextResponse.json(demand, { status: 201 });
        }

        // Direct SQL insert fallback
        const id = 'dmd_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        await prisma.$queryRawUnsafe(`
            INSERT INTO Demand (id, demandNumber, itemName, category, brand, quantity, targetPrice, advancePaid, type, priority, status, customerId, customerName, customerPhone, productId, supplierName, notes, createdAt, updatedAt)
            VALUES (
                '${id}',
                '${demandNumber}',
                '${(itemName || '').replace(/'/g, "''")}',
                ${category ? `'${category.replace(/'/g, "''")}'` : 'NULL'},
                ${brand ? `'${brand.replace(/'/g, "''")}'` : 'NULL'},
                ${Number(quantity) || 1},
                ${Number(targetPrice) || 0},
                ${Number(advancePaid) || 0},
                '${type || 'CUSTOMER_DEMAND'}',
                '${priority || 'NORMAL'}',
                'PENDING',
                ${customerId ? `'${customerId}'` : 'NULL'},
                ${customerName ? `'${customerName.replace(/'/g, "''")}'` : 'NULL'},
                ${customerPhone ? `'${customerPhone.replace(/'/g, "''")}'` : 'NULL'},
                ${productId ? `'${productId}'` : 'NULL'},
                ${supplierName ? `'${supplierName.replace(/'/g, "''")}'` : 'NULL'},
                ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
                NOW(),
                NOW()
            )
        `);
        const created: any = await prisma.$queryRawUnsafe(`SELECT * FROM Demand WHERE id = '${id}'`);
        return NextResponse.json(created[0], { status: 201 });
    } catch (error: any) {
        console.error("Error creating demand:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create demand" },
            { status: 500 }
        );
    }
}
