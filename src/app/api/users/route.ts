import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";
import { cookies } from "next/headers";

// Helper to check admin permission
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

// GET all users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST create new user
export async function POST(request: Request) {
    try {
        // Enforce Admin role for creating users
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 403 });
        }

        const body = await request.json();
        const { username, password, name, role } = body;

        if (!username || !username.trim()) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        if (!password || !password.trim()) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        // Check if username already exists
        const existing = await prisma.user.findUnique({
            where: { username: username.trim() },
        });

        if (existing) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        // Valid roles: ADMIN, SALESMAN, TECHNICIAN, ACCOUNTANT, CASHIER
        const validRoles = ["ADMIN", "SALESMAN", "TECHNICIAN", "ACCOUNTANT", "CASHIER"];
        const selectedRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : "SALESMAN";

        // Hash password
        const hashedPassword = createHash("sha256").update(password).digest("hex");

        const user = await prisma.user.create({
            data: {
                username: username.trim(),
                password: hashedPassword,
                name: name?.trim() || username.trim(),
                role: selectedRole as any,
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
