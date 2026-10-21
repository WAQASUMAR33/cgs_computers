import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/spare-parts/[id]/stock
// Stock movement & adjustment endpoint
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            type, // "STOCK_IN", "STOCK_OUT", "USED_IN_REPAIR", "ADJUSTMENT", "RETURNED", "SCRAP"
            quantity, // positive number representing quantity to change or absolute value
            newAbsoluteStock, // if type === "ADJUSTMENT" and setting exact stock
            reference, // Repair Ticket #, PO #, Invoice #
            performedBy = "Technician",
            notes,
        } = body;

        const sparePart = await prisma.sparePart.findUnique({
            where: { id },
        });

        if (!sparePart) {
            return NextResponse.json({ error: "Spare part not found" }, { status: 404 });
        }

        const currentStock = sparePart.stock || 0;
        let changeQty = parseInt(quantity) || 0;
        let finalStock = currentStock;

        if (type === "ADJUSTMENT" && newAbsoluteStock !== undefined) {
            finalStock = parseInt(newAbsoluteStock) || 0;
            changeQty = finalStock - currentStock;
        } else if (type === "STOCK_IN" || type === "RETURNED") {
            changeQty = Math.abs(changeQty);
            finalStock = currentStock + changeQty;
        } else if (type === "STOCK_OUT" || type === "USED_IN_REPAIR" || type === "SCRAP") {
            changeQty = -Math.abs(changeQty);
            finalStock = currentStock + changeQty;
            if (finalStock < 0) {
                return NextResponse.json(
                    { error: `Insufficient stock! Current available stock is ${currentStock}.` },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json({ error: `Invalid stock movement type '${type}'` }, { status: 400 });
        }

        // Perform atomic update with log
        const result = await prisma.$transaction(async (tx: any) => {
            const updatedPart = await tx.sparePart.update({
                where: { id },
                data: {
                    stock: finalStock,
                },
            });

            const log = await tx.sparePartLog.create({
                data: {
                    sparePartId: id,
                    type: type || "STOCK_IN",
                    quantity: changeQty,
                    previousStock: currentStock,
                    newStock: finalStock,
                    reference: reference?.trim() || null,
                    performedBy: performedBy?.trim() || "User",
                    notes: notes?.trim() || null,
                },
            });

            return { part: updatedPart, log };
        });

        return NextResponse.json({
            success: true,
            sparePart: result.part,
            log: result.log,
        });
    } catch (error: any) {
        console.error("Stock adjustment error:", error);
        return NextResponse.json({ error: error.message || "Failed to adjust stock" }, { status: 500 });
    }
}
