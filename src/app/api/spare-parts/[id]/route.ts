import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/spare-parts/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const sparePart = await prisma.sparePart.findUnique({
            where: { id },
            include: {
                logs: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!sparePart) {
            return NextResponse.json({ error: "Spare part not found" }, { status: 404 });
        }

        return NextResponse.json(sparePart);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to fetch spare part" }, { status: 500 });
    }
}

// PUT /api/spare-parts/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            partNumber,
            name,
            category,
            brand,
            compatibleModels,
            location,
            minStockAlert,
            costPrice,
            sellingPrice,
            condition,
            supplierName,
            warranty,
            notes,
        } = body;

        const updated = await prisma.sparePart.update({
            where: { id },
            data: {
                partNumber: partNumber?.trim(),
                name: name?.trim(),
                category: category || "General Spares",
                brand: brand?.trim() || null,
                compatibleModels: compatibleModels?.trim() || null,
                location: location?.trim() || null,
                minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert) : undefined,
                costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
                sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
                condition: condition || undefined,
                supplierName: supplierName?.trim() || null,
                warranty: warranty?.trim() || null,
                notes: notes?.trim() || null,
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update spare part" }, { status: 500 });
    }
}

// DELETE /api/spare-parts/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.sparePart.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "Spare part deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete spare part" }, { status: 500 });
    }
}
