import { NextRequest, NextResponse } from "next/server";
import { getBrandingConfig, saveBrandingConfig, BrandingConfig } from "@/lib/branding";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const config = getBrandingConfig();
        return NextResponse.json({
            success: true,
            branding: config,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to load branding" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let logo = body.logo;

        // If logo is a base64 data URL, optionally save it as an image file in public/uploads
        if (logo && typeof logo === "string" && logo.startsWith("data:image/")) {
            try {
                const matches = logo.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
                if (matches) {
                    const ext = matches[1].replace("+xml", "");
                    const base64Data = matches[2];
                    const uploadsDir = path.join(process.cwd(), "public", "uploads");
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    const filename = `brand-logo-${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`;
                    const filePath = path.join(uploadsDir, filename);
                    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
                    logo = `/uploads/${filename}`;
                }
            } catch (imgErr) {
                console.error("Failed to extract base64 logo to file, retaining string:", imgErr);
            }
        }

        const updated = saveBrandingConfig({
            businessName: body.businessName,
            description: body.description,
            address: body.address,
            phoneNumbers: body.phoneNumbers,
            receiptNote: body.receiptNote,
            others: body.others,
            logo: logo,
            email: body.email,
            website: body.website,
            taxNumber: body.taxNumber,
        });

        return NextResponse.json({
            success: true,
            message: "Branding configuration saved successfully",
            branding: updated,
        });
    } catch (error: any) {
        console.error("Error saving branding:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to save branding" },
            { status: 500 }
        );
    }
}
