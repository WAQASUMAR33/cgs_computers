import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/spare-parts
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const brand = searchParams.get("brand") || "";
        const filter = searchParams.get("filter") || ""; // "low-stock", "out-of-stock", "in-stock"

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { partNumber: { contains: search } },
                { compatibleModels: { contains: search } },
                { location: { contains: search } },
            ];
        }

        if (category && category !== "ALL") {
            where.category = category;
        }

        if (brand && brand !== "ALL") {
            where.brand = brand;
        }

        const spareParts = await prisma.sparePart.findMany({
            where,
            include: {
                logs: {
                    take: 5,
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Compute metrics
        let totalItems = 0;
        let totalStockUnits = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalCostValuation = 0;
        let totalRetailValuation = 0;

        const allParts = await prisma.sparePart.findMany({
            select: {
                id: true,
                stock: true,
                minStockAlert: true,
                costPrice: true,
                sellingPrice: true,
            },
        });

        for (const item of allParts) {
            totalItems++;
            const stock = item.stock || 0;
            totalStockUnits += stock;
            const cost = Number(item.costPrice || 0);
            const sell = Number(item.sellingPrice || 0);
            totalCostValuation += stock * cost;
            totalRetailValuation += stock * sell;

            if (stock <= 0) {
                outOfStockCount++;
                lowStockCount++;
            } else if (stock <= (item.minStockAlert || 2)) {
                lowStockCount++;
            }
        }

        // Apply filter if specified
        let filteredResults = spareParts;
        if (filter === "low-stock") {
            filteredResults = spareParts.filter((p: any) => p.stock <= p.minStockAlert);
        } else if (filter === "out-of-stock") {
            filteredResults = spareParts.filter((p: any) => p.stock <= 0);
        } else if (filter === "in-stock") {
            filteredResults = spareParts.filter((p: any) => p.stock > 0);
        }

        return NextResponse.json({
            spareParts: filteredResults,
            metrics: {
                totalVarieties: totalItems,
                totalStockUnits,
                lowStockCount,
                outOfStockCount,
                totalCostValuation,
                totalRetailValuation,
            },
        });
    } catch (error: any) {
        console.error("Failed to fetch spare parts:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch spare parts" }, { status: 500 });
    }
}

// POST /api/spare-parts - Create new spare part
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            partNumber,
            name,
            category,
            brand,
            compatibleModels,
            location,
            stock = 0,
            minStockAlert = 2,
            costPrice = 0,
            sellingPrice = 0,
            condition = "NEW",
            supplierName,
            warranty,
            notes,
            performedBy = "Admin",
        } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Part name is required" }, { status: 400 });
        }

        // Auto-generate part number if not provided
        let finalPartNumber = partNumber?.trim();
        if (!finalPartNumber) {
            const count = await prisma.sparePart.count();
            finalPartNumber = `SP-${1000 + count + 1}`;
        }

        // Check uniqueness of partNumber
        const existing = await prisma.sparePart.findUnique({
            where: { partNumber: finalPartNumber },
        });

        if (existing) {
            return NextResponse.json({ error: `Part number '${finalPartNumber}' already exists.` }, { status: 400 });
        }

        const initialStock = parseInt(stock) || 0;

        const newSparePart = await prisma.$transaction(async (tx: any) => {
            const created = await tx.sparePart.create({
                data: {
                    partNumber: finalPartNumber,
                    name: name.trim(),
                    category: category || "General Spares",
                    brand: brand?.trim() || null,
                    compatibleModels: compatibleModels?.trim() || null,
                    location: location?.trim() || null,
                    stock: initialStock,
                    minStockAlert: parseInt(minStockAlert) || 2,
                    costPrice: parseFloat(costPrice) || 0,
                    sellingPrice: parseFloat(sellingPrice) || 0,
                    condition: condition || "NEW",
                    supplierName: supplierName?.trim() || null,
                    warranty: warranty?.trim() || null,
                    notes: notes?.trim() || null,
                },
            });

            // If initial stock > 0, log initial stock in
            if (initialStock > 0) {
                await tx.sparePartLog.create({
                    data: {
                        sparePartId: created.id,
                        type: "STOCK_IN",
                        quantity: initialStock,
                        previousStock: 0,
                        newStock: initialStock,
                        reference: "INITIAL_OPENING_STOCK",
                        performedBy,
                        notes: "Opening balance on registration",
                    },
                });
            }

            return created;
        });

        return NextResponse.json(newSparePart, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create spare part:", error);
        return NextResponse.json({ error: error.message || "Failed to create spare part" }, { status: 500 });
    }
}
