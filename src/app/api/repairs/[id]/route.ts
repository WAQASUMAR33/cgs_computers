import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const repair = await prisma.repair.findUnique({
            where: { id },
            include: {
                customer: true,
            },
        });

        if (!repair) {
            return NextResponse.json({ error: "Repair ticket not found" }, { status: 404 });
        }

        return NextResponse.json(repair);
    } catch (error: any) {
        console.error("Failed to fetch repair:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const current = await prisma.repair.findUnique({
            where: { id },
        });

        if (!current) {
            return NextResponse.json({ error: "Repair ticket not found" }, { status: 404 });
        }

        const updateData: any = {};

        if (body.customerName !== undefined) updateData.customerName = body.customerName;
        if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone;
        if (body.customerCnic !== undefined) updateData.customerCnic = body.customerCnic || null;
        if (body.customerAddress !== undefined) updateData.customerAddress = body.customerAddress || null;
        if (body.deviceType !== undefined) updateData.deviceType = body.deviceType;
        if (body.deviceBrand !== undefined) updateData.deviceBrand = body.deviceBrand || null;
        if (body.deviceModel !== undefined) updateData.deviceModel = body.deviceModel || null;
        if (body.serialNumber !== undefined) updateData.serialNumber = body.serialNumber || null;
        if (body.devicePassword !== undefined) updateData.devicePassword = body.devicePassword || null;
        if (body.accessoriesIncluded !== undefined) updateData.accessoriesIncluded = body.accessoriesIncluded || null;
        if (body.conditionNotes !== undefined) updateData.conditionNotes = body.conditionNotes || null;
        if (body.problemDescription !== undefined) updateData.problemDescription = body.problemDescription;
        if (body.diagnosticsNotes !== undefined) updateData.diagnosticsNotes = body.diagnosticsNotes || null;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.technicianName !== undefined) updateData.technicianName = body.technicianName || null;
        if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod || "CASH";
        if (body.notes !== undefined) updateData.notes = body.notes || null;

        if (body.expectedDate !== undefined) {
            updateData.expectedDate = body.expectedDate ? new Date(body.expectedDate) : null;
        }

        // Financial calculations
        const partCost = body.partCost !== undefined ? Number(body.partCost) : Number(current.partCost);
        const laborCost = body.laborCost !== undefined ? Number(body.laborCost) : Number(current.laborCost);
        const estimatedCost = body.estimatedCost !== undefined ? Number(body.estimatedCost) : Number(current.estimatedCost);
        
        let finalAmount = body.finalAmount !== undefined ? Number(body.finalAmount) : Number(current.finalAmount);
        if (body.finalAmount === undefined && (body.partCost !== undefined || body.laborCost !== undefined)) {
            finalAmount = partCost + laborCost;
        }

        const paidAmount = body.paidAmount !== undefined ? Number(body.paidAmount) : Number(current.paidAmount);
        const balance = Math.max(0, finalAmount - paidAmount);

        updateData.partCost = partCost;
        updateData.laborCost = laborCost;
        updateData.estimatedCost = estimatedCost;
        updateData.finalAmount = finalAmount;
        updateData.paidAmount = paidAmount;
        updateData.balance = balance;

        // Status progression timestamps
        if (body.status !== undefined) {
            updateData.status = body.status;

            if (body.status === "READY" && !current.completedDate) {
                updateData.completedDate = new Date();
            }
            if (body.status === "DELIVERED" && !current.deliveredDate) {
                updateData.deliveredDate = new Date();
                if (!current.completedDate) {
                    updateData.completedDate = new Date();
                }
            }
        }

        const updated = await prisma.repair.update({
            where: { id },
            data: updateData,
            include: {
                customer: true,
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Failed to update repair ticket:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.repair.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "Repair ticket deleted" });
    } catch (error: any) {
        console.error("Failed to delete repair:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
