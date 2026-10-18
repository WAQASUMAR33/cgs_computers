import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        const products = await prisma.product.findMany({
            where: query ? {
                OR: [
                    { name: { contains: query } },
                    { code: { contains: query } },
                ],
            } : {},
            include: {
                category: true,
                brand: true,
                supplier: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const costPrice = Number(json.costPrice) || 0;
        const retailPrice = Number(json.retailPrice) || 0;
        const wholesalePrice = json.wholesalePrice !== undefined && json.wholesalePrice !== null 
            ? Number(json.wholesalePrice) 
            : (retailPrice || costPrice);
        const stock = parseInt(json.stock) || 0;
        const supplierId = json.supplierId || null;
        const paidAmount = Math.max(0, Number(json.paidAmount) || 0);
        const paymentMethod = json.paymentMethod || "CASH";

        const productData: any = {
            code: json.code?.trim(),
            name: json.name?.trim(),
            costPrice,
            wholesalePrice,
            retailPrice,
            stock,
        };

        if (json.categoryId) {
            productData.category = { connect: { id: json.categoryId } };
        }
        if (supplierId) {
            productData.supplier = { connect: { id: supplierId } };
        }
        if (json.brandId) {
            productData.brand = { connect: { id: json.brandId } };
        }

        // 1. Create the product
        const product = await prisma.product.create({
            data: productData,
            include: {
                category: true,
                brand: true,
                supplier: true,
            },
        });

        // 2. Perform Supplier Ledger Management if supplier is selected and stock & cost > 0
        if (supplierId && stock > 0 && costPrice > 0) {
            try {
                const supplier = await prisma.supplier.findUnique({
                    where: { id: supplierId },
                });

                if (supplier) {
                    const currentBalance = Number(supplier.balance || 0);
                    const totalCost = stock * costPrice;
                    const balanceAfterCredit = currentBalance + totalCost;

                    // A. Credit entry: stock bought from supplier (increases payable)
                    await prisma.supplierLedger.create({
                        data: {
                            supplierId: supplier.id,
                            date: new Date(),
                            description: `Initial Stock Registration: ${product.name} (${stock} pcs @ Rs. ${costPrice})`,
                            debit: 0,
                            credit: totalCost,
                            balance: balanceAfterCredit,
                        },
                    });

                    // B. If immediate payment was paid to supplier
                    let finalBalance = balanceAfterCredit;
                    if (paidAmount > 0) {
                        finalBalance = balanceAfterCredit - paidAmount;

                        const payment = await prisma.supplierPayment.create({
                            data: {
                                supplierId: supplier.id,
                                amount: paidAmount,
                                date: new Date(),
                                method: paymentMethod,
                                remarks: `Payment for initial stock of ${product.name}`,
                            },
                        });

                        await prisma.supplierLedger.create({
                            data: {
                                supplierId: supplier.id,
                                paymentId: payment.id,
                                date: new Date(),
                                description: `Payment for Initial Stock: ${product.name}`,
                                debit: paidAmount,
                                credit: 0,
                                balance: finalBalance,
                            },
                        });
                    }

                    // C. Update the supplier's payable balance
                    await prisma.supplier.update({
                        where: { id: supplier.id },
                        data: { balance: finalBalance },
                    });
                }
            } catch (ledgerError) {
                console.error("Error updating supplier ledger:", ledgerError);
            }
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Failed to create product:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Product code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
    }
}
