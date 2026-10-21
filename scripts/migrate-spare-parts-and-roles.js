const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "db-config.json");
if (!process.env.DATABASE_URL && fs.existsSync(configPath)) {
    try {
        const c = JSON.parse(fs.readFileSync(configPath, "utf8"));
        const pass = c.password ? `:${c.password}` : "";
        process.env.DATABASE_URL = `mysql://${c.username}${pass}@${c.server}:${c.port}/${c.database}`;
    } catch (e) {}
}

const prisma = new PrismaClient();

async function migrate() {
    console.log("Applying database migrations for Multi-User Roles and Spare Parts Management...");
    try {
        // 1. Update User role ENUM
        console.log("1. Updating User role ENUM column...");
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE \`User\` MODIFY COLUMN \`role\` ENUM('ADMIN', 'SALESMAN', 'TECHNICIAN', 'ACCOUNTANT', 'CASHIER') NOT NULL DEFAULT 'SALESMAN';
            `);
            console.log("✓ User role ENUM updated successfully (ADMIN, SALESMAN, TECHNICIAN, ACCOUNTANT, CASHIER).");
        } catch (e) {
            console.log("Notice on User role ENUM:", e.message);
        }

        // 2. Create SparePart table
        console.log("2. Creating SparePart table...");
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`SparePart\` (
                \`id\` VARCHAR(191) NOT NULL,
                \`partNumber\` VARCHAR(191) NOT NULL,
                \`name\` VARCHAR(191) NOT NULL,
                \`category\` VARCHAR(191) NOT NULL,
                \`brand\` VARCHAR(191) NULL,
                \`compatibleModels\` VARCHAR(191) NULL,
                \`location\` VARCHAR(191) NULL,
                \`stock\` INT NOT NULL DEFAULT 0,
                \`minStockAlert\` INT NOT NULL DEFAULT 2,
                \`costPrice\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                \`sellingPrice\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                \`condition\` ENUM('NEW', 'USED', 'REFURBISHED', 'PULL') NOT NULL DEFAULT 'NEW',
                \`supplierName\` VARCHAR(191) NULL,
                \`warranty\` VARCHAR(191) NULL,
                \`notes\` TEXT NULL,
                \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                UNIQUE INDEX \`SparePart_partNumber_key\`(\`partNumber\`),
                PRIMARY KEY (\`id\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        console.log("✓ SparePart table ready.");

        // 3. Create SparePartLog table
        console.log("3. Creating SparePartLog table...");
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`SparePartLog\` (
                \`id\` VARCHAR(191) NOT NULL,
                \`sparePartId\` VARCHAR(191) NOT NULL,
                \`type\` ENUM('STOCK_IN', 'STOCK_OUT', 'USED_IN_REPAIR', 'ADJUSTMENT', 'RETURNED', 'SCRAP') NOT NULL DEFAULT 'STOCK_IN',
                \`quantity\` INT NOT NULL,
                \`previousStock\` INT NOT NULL,
                \`newStock\` INT NOT NULL,
                \`reference\` VARCHAR(191) NULL,
                \`performedBy\` VARCHAR(191) NULL,
                \`notes\` TEXT NULL,
                \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                PRIMARY KEY (\`id\`),
                INDEX \`SparePartLog_sparePartId_idx\`(\`sparePartId\`),
                CONSTRAINT \`SparePartLog_sparePartId_fkey\` FOREIGN KEY (\`sparePartId\`) REFERENCES \`SparePart\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        console.log("✓ SparePartLog table ready.");

        console.log("\n✅ Multi-User Roles & Spare Parts migration successfully completed!");
    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
