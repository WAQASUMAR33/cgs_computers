import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                brand: true,
                supplier: true,
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();
        const updateData: any = {
            code: json.code,
            name: json.name,
            costPrice: json.costPrice,
            wholesalePrice: json.wholesalePrice,
            retailPrice: json.retailPrice,
            stock: parseInt(json.stock),
        };

        if (json.categoryId !== undefined) {
            updateData.category = json.categoryId ? { connect: { id: json.categoryId } } : { disconnect: true };
        }
        if (json.supplierId !== undefined) {
            updateData.supplier = json.supplierId ? { connect: { id: json.supplierId } } : { disconnect: true };
        }
        if (json.brandId !== undefined) {
            updateData.brand = json.brandId ? { connect: { id: json.brandId } } : { disconnect: true };
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                brand: true,
                supplier: true,
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Safely detach relations before deletion to preserve invoice/bill history
        await prisma.$transaction([
            prisma.saleItem.updateMany({
                where: { productId: id },
                data: { productId: null },
            }),
            prisma.saleReturnItem.updateMany({
                where: { productId: id },
                data: { productId: null },
            }),
            prisma.purchaseItem.updateMany({
                where: { productId: id },
                data: { productId: null },
            }),
            prisma.demand.updateMany({
                where: { productId: id },
                data: { productId: null },
            }),
            prisma.product.delete({
                where: { id },
            }),
        ]);

        return NextResponse.json({ success: true, message: "Product deleted successfully" });
    } catch (error: any) {
        console.error("Failed to delete product:", error);
        return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
    }
}
