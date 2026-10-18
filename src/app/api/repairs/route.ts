import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");

        const where: any = {};

        if (status && status !== "ALL") {
            where.status = status;
        }

        if (priority && priority !== "ALL") {
            where.priority = priority;
        }

        if (query) {
            where.OR = [
                { ticketNumber: { contains: query } },
                { customerName: { contains: query } },
                { customerPhone: { contains: query } },
                { deviceModel: { contains: query } },
                { deviceBrand: { contains: query } },
                { serialNumber: { contains: query } },
            ];
        }

        const repairs = await prisma.repair.findMany({
            where,
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(repairs);
    } catch (error: any) {
        console.error("Failed to fetch repairs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customerId,
            customerName,
            customerPhone,
            customerCnic,
            customerAddress,
            deviceType = "Laptop",
            deviceBrand,
            deviceModel,
            serialNumber,
            devicePassword,
            accessoriesIncluded,
            conditionNotes,
            problemDescription,
            diagnosticsNotes,
            priority = "NORMAL",
            estimatedCost = 0,
            partCost = 0,
            laborCost = 0,
            finalAmount = 0,
            paidAmount = 0,
            paymentMethod = "CASH",
            technicianName,
            expectedDate,
            notes,
        } = body;

        if (!customerName || !customerPhone || !problemDescription) {
            return NextResponse.json(
                { error: "Customer name, phone, and problem description are required." },
                { status: 400 }
            );
        }

        // Generate Ticket Number (REP-YYYY-XXXX)
        const year = new Date().getFullYear();
        const count = await prisma.repair.count({
            where: {
                ticketNumber: {
                    startsWith: `REP-${year}-`,
                },
            },
        });
        const ticketNumber = `REP-${year}-${String(count + 1).padStart(4, "0")}`;

        const partsPlusLabor = Number(partCost) + Number(laborCost);
        const calcFinal = finalAmount > 0 
            ? Number(finalAmount) 
            : (partsPlusLabor > 0 ? partsPlusLabor : Number(estimatedCost) || 0);
        const calcPaid = Number(paidAmount) || 0;
        const calcBalance = Math.max(0, calcFinal - calcPaid);

        const repairData: any = {
            ticketNumber,
            customerName,
            customerPhone,
            customerCnic: customerCnic || null,
            customerAddress: customerAddress || null,
            deviceType: deviceType || "Laptop",
            deviceBrand: deviceBrand || null,
            deviceModel: deviceModel || null,
            serialNumber: serialNumber || null,
            devicePassword: devicePassword || null,
            accessoriesIncluded: accessoriesIncluded || null,
            conditionNotes: conditionNotes || null,
            problemDescription,
            diagnosticsNotes: diagnosticsNotes || null,
            status: "RECEIVED",
            priority: priority || "NORMAL",
            estimatedCost: Number(estimatedCost) || 0,
            partCost: Number(partCost) || 0,
            laborCost: Number(laborCost) || 0,
            finalAmount: calcFinal,
            paidAmount: calcPaid,
            balance: calcBalance,
            paymentMethod: paymentMethod || "CASH",
            technicianName: technicianName || null,
            expectedDate: expectedDate ? new Date(expectedDate) : null,
            notes: notes || null,
        };

        if (customerId) {
            repairData.customer = {
                connect: { id: customerId },
            };
        }

        const repair = await prisma.repair.create({
            data: repairData,
            include: {
                customer: true,
            },
        });

        return NextResponse.json(repair, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create repair ticket:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
