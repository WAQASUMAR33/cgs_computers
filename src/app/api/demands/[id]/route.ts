import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/demands/[id]
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if ((prisma as any).demand) {
            const demand = await (prisma as any).demand.findUnique({
                where: { id },
                include: { customer: true, product: true },
            });
            if (!demand) {
                return NextResponse.json({ error: "Demand not found" }, { status: 404 });
            }
            return NextResponse.json(demand);
        }

        const raw: any = await prisma.$queryRawUnsafe(`SELECT * FROM Demand WHERE id = '${id}'`);
        if (!raw || raw.length === 0) {
            return NextResponse.json({ error: "Demand not found" }, { status: 404 });
        }
        return NextResponse.json(raw[0]);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch demand" },
            { status: 500 }
        );
    }
}

// PATCH /api/demands/[id] - Update demand status, notes, quantity, etc.
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const updateData: any = {};

        if (body.itemName !== undefined) updateData.itemName = body.itemName;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.brand !== undefined) updateData.brand = body.brand;
        if (body.quantity !== undefined) updateData.quantity = Number(body.quantity);
        if (body.targetPrice !== undefined) updateData.targetPrice = Number(body.targetPrice);
        if (body.advancePaid !== undefined) updateData.advancePaid = Number(body.advancePaid);
        if (body.type !== undefined) updateData.type = body.type;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.status !== undefined) {
            updateData.status = body.status;
            if (body.status === "FULFILLED") {
                updateData.fulfilledDate = new Date();
            }
        }
        if (body.customerId !== undefined) updateData.customerId = body.customerId;
        if (body.customerName !== undefined) updateData.customerName = body.customerName;
        if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone;
        if (body.supplierName !== undefined) updateData.supplierName = body.supplierName;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.expectedDate !== undefined) {
            updateData.expectedDate = body.expectedDate ? new Date(body.expectedDate) : null;
        }

        if ((prisma as any).demand) {
            const updated = await (prisma as any).demand.update({
                where: { id },
                data: updateData,
                include: { customer: true, product: true },
            });
            return NextResponse.json(updated);
        }

        // Direct SQL update fallback
        const setClauses: string[] = [];
        if (updateData.status) setClauses.push(`status = '${updateData.status}'`);
        if (updateData.priority) setClauses.push(`priority = '${updateData.priority}'`);
        if (updateData.quantity !== undefined) setClauses.push(`quantity = ${updateData.quantity}`);
        if (updateData.targetPrice !== undefined) setClauses.push(`targetPrice = ${updateData.targetPrice}`);
        if (updateData.advancePaid !== undefined) setClauses.push(`advancePaid = ${updateData.advancePaid}`);
        if (updateData.notes !== undefined) setClauses.push(`notes = '${(updateData.notes || '').replace(/'/g, "''")}'`);
        if (updateData.itemName) setClauses.push(`itemName = '${updateData.itemName.replace(/'/g, "''")}'`);
        if (updateData.status === "FULFILLED") setClauses.push("fulfilledDate = NOW()");
        setClauses.push("updatedAt = NOW()");

        await prisma.$queryRawUnsafe(`UPDATE Demand SET ${setClauses.join(', ')} WHERE id = '${id}'`);
        const updated: any = await prisma.$queryRawUnsafe(`SELECT * FROM Demand WHERE id = '${id}'`);
        return NextResponse.json(updated[0]);
    } catch (error: any) {
        console.error("Error updating demand:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update demand" },
            { status: 500 }
        );
    }
}

// DELETE /api/demands/[id]
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if ((prisma as any).demand) {
            await (prisma as any).demand.delete({ where: { id } });
            return NextResponse.json({ success: true, message: "Demand deleted successfully" });
        }

        await prisma.$queryRawUnsafe(`DELETE FROM Demand WHERE id = '${id}'`);
        return NextResponse.json({ success: true, message: "Demand deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting demand:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete demand" },
            { status: 500 }
        );
    }
}
