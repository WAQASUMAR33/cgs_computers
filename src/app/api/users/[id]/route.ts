import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";
import { cookies } from "next/headers";

async function checkAdmin() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        if (!sessionCookie) return false;
        const session = JSON.parse(sessionCookie.value);
        return session && session.role === "ADMIN";
    } catch {
        return false;
    }
}

// GET single user
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

// PUT update user
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { username, password, name, role } = body;

        const updateData: any = {};
        if (username) updateData.username = username.trim();
        if (name) updateData.name = name.trim();

        if (role) {
            const validRoles = ["ADMIN", "SALESMAN", "TECHNICIAN", "ACCOUNTANT", "CASHIER"];
            if (validRoles.includes(role.toUpperCase())) {
                updateData.role = role.toUpperCase();
            }
        }

        // Only update password if provided
        if (password && password.trim() !== "") {
            updateData.password = createHash("sha256").update(password).digest("hex");
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 403 });
        }

        const { id } = await params;

        // Prevent deleting the last admin
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (targetUser?.role === "ADMIN") {
            const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
            if (adminCount <= 1) {
                return NextResponse.json({ error: "Cannot delete the only administrator account." }, { status: 400 });
            }
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
