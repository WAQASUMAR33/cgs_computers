import fs from "fs";
import path from "path";
import { BrandingConfig, DEFAULT_BRANDING } from "./branding-types";

export * from "./branding-types";

const CONFIG_PATH = path.join(process.cwd(), "branding-config.json");

export function getBrandingConfig(): BrandingConfig {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_BRANDING, ...parsed };
        }
    } catch (e) {
        console.error("Error reading branding config:", e);
    }
    return DEFAULT_BRANDING;
}

export function saveBrandingConfig(data: Partial<BrandingConfig>): BrandingConfig {
    try {
        const current = getBrandingConfig();
        const updated: BrandingConfig = {
            ...current,
            ...data,
            businessName: data.businessName?.trim() || current.businessName,
            address: data.address?.trim() ?? current.address,
            phoneNumbers: data.phoneNumbers?.trim() ?? current.phoneNumbers,
            receiptNote: data.receiptNote?.trim() ?? current.receiptNote,
            others: data.others?.trim() ?? current.others,
            logo: data.logo?.trim() || current.logo,
            description: data.description?.trim() ?? current.description,
            email: data.email?.trim() ?? current.email,
            website: data.website?.trim() ?? current.website,
            taxNumber: data.taxNumber?.trim() ?? current.taxNumber,
        };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
        return updated;
    } catch (e) {
        console.error("Error saving branding config:", e);
        throw e;
    }
}
