"use client";

import { useState, useEffect, useRef } from "react";
import {
    Building2,
    Upload,
    Printer,
    FileText,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Phone,
    MapPin,
    FileCheck,
    Globe,
    Mail,
    Hash,
    Sparkles,
    LayoutDashboard,
    Receipt,
    Image as ImageIcon
} from "lucide-react";
import { BrandingConfig, DEFAULT_BRANDING } from "@/lib/branding-types";

export default function BrandingPage() {
    const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [statusMessage, setStatusMessage] = useState("");
    const [previewMode, setPreviewMode] = useState<"thermal" | "a4" | "web">("thermal");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial branding
    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/branding");
            const data = await res.json();
            if (data.success && data.branding) {
                setBranding(data.branding);
            }
        } catch (err) {
            console.error("Failed to load branding:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            setSaving(true);
            setSaveStatus("idle");
            const res = await fetch("/api/branding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(branding),
            });
            const data = await res.json();
            if (data.success) {
                setBranding(data.branding);
                setSaveStatus("success");
                setStatusMessage("Branding settings saved successfully! All receipts and pages now use this identity.");
                setTimeout(() => setSaveStatus("idle"), 5000);
            } else {
                setSaveStatus("error");
                setStatusMessage(data.message || "Failed to save branding.");
            }
        } catch (err: any) {
            setSaveStatus("error");
            setStatusMessage(err.message || "Network error while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm("Reset branding to default settings?")) {
            setBranding(DEFAULT_BRANDING);
        }
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file (PNG, JPG, SVG, WebP).");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setBranding((prev) => ({
                    ...prev,
                    logo: event.target!.result as string,
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerTestPrint = () => {
        const printWindow = window.open("", "_blank", "width=380,height=700");
        if (!printWindow) {
            alert("Please allow popups to test print.");
            return;
        }

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Receipt - ${branding.businessName}</title>
                <style>
                    @page { margin: 0; size: 80mm auto; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
                        width: 72mm;
                        margin: 0 auto;
                        padding: 8px 4px;
                        color: #000;
                        font-size: 11px;
                        line-height: 1.3;
                    }
                    .text-center { text-align: center; }
                    .header-logo { max-height: 55px; max-width: 90%; object-fit: contain; margin-bottom: 4px; display: block; margin-left: auto; margin-right: auto; }
                    .biz-title { font-size: 15px; font-weight: 900; margin: 2px 0; text-transform: uppercase; }
                    .biz-sub { font-size: 10px; margin: 1px 0; }
                    .divider { border-top: 1px dashed #000; margin: 6px 0; }
                    .divider-double { border-top: 2px solid #000; margin: 6px 0; }
                    .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                    .item-name { font-weight: bold; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-top: 2px; }
                    .grand { font-size: 13px; font-weight: 900; }
                    .notes { font-size: 9px; line-height: 1.35; margin-top: 6px; white-space: pre-line; }
                    .footer-txt { font-size: 8.5px; opacity: 0.85; margin-top: 6px; white-space: pre-line; }
                </style>
            </head>
            <body>
                <div class="text-center">
                    ${branding.logo ? `<img src="${branding.logo}" class="header-logo" alt="${branding.businessName}" />` : ""}
                    <div class="biz-title">${branding.businessName}</div>
                    ${branding.description ? `<div class="biz-sub">${branding.description}</div>` : ""}
                    <div class="biz-sub">${branding.address}</div>
                    <div class="biz-sub">${branding.phoneNumbers}</div>
                </div>
                <div class="divider"></div>
                <div style="font-size: 10px; display: flex; justify-content: space-between;">
                    <span>TEST RECEIPT</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
                <div class="divider"></div>
                <div class="item-row">
                    <span class="item-name">Sample Diagnostic Service</span>
                    <span>1,500.00</span>
                </div>
                <div class="item-row" style="font-size: 10px; color: #444;">
                    <span>1 x 1,500.00</span>
                    <span></span>
                </div>
                <div class="divider"></div>
                <div class="total-row grand">
                    <span>NET TOTAL:</span>
                    <span>RS 1,500.00</span>
                </div>
                <div class="total-row">
                    <span>PAID:</span>
                    <span>RS 1,500.00</span>
                </div>
                <div class="divider"></div>
                <div class="text-center notes">
                    ${branding.receiptNote}
                </div>
                <div class="divider"></div>
                <div class="text-center footer-txt">
                    ${branding.others}
                </div>
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                            Store Branding & Print Identity
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Configure your business logo, address, phone numbers, receipt terms, and letterhead notes.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button
                        onClick={triggerTestPrint}
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span>Test Thermal Print</span>
                    </button>
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{saving ? "Saving..." : "Save Branding"}</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {saveStatus === "success" && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{statusMessage}</span>
                </div>
            )}
            {saveStatus === "error" && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shadow-xs">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Main Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Form Controls (7 Cols) */}
                <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
                    {/* 1. Logo & Identity Card */}
                    <div className="bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                <span>Logo & Brand Visuals</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">Prints on Receipts & Web Header</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            {/* Logo Preview Box */}
                            <div className="w-36 h-28 border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-2 relative group overflow-hidden shrink-0">
                                {branding.logo ? (
                                    <img
                                        src={branding.logo}
                                        alt="Store Logo"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/libertycollection.png";
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <ImageIcon className="w-8 h-8 mb-1" />
                                        <span className="text-[10px] font-semibold">No Logo</span>
                                    </div>
                                )}
                            </div>

                            {/* Logo Actions */}
                            <div className="space-y-3 flex-1 w-full">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Upload New Logo Image
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                        Recommended transparent PNG or high-contrast image (Max 2MB).
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleLogoFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shadow-xs"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Browse Image</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBranding((p) => ({ ...p, logo: "/libertycollection.png" }))}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
                                            title="Restore default logo"
                                        >
                                            <RotateCcw className="w-3 h-3 text-slate-500" />
                                            <span>Default</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Or Logo URL / Image Path
                                    </label>
                                    <input
                                        type="text"
                                        value={branding.logo}
                                        onChange={(e) => setBranding((p) => ({ ...p, logo: e.target.value }))}
                                        placeholder="/libertycollection.png or https://..."
                                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Business Details Card */}
                    <div className="bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span>General Information</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">Prints at top of bills</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Business Name */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Business / Store Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={branding.businessName}
                                    onChange={(e) => setBranding((p) => ({ ...p, businessName: e.target.value }))}
                                    placeholder="e.g. CGS Computers"
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                                />
                            </div>

                            {/* Description / Tagline */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Tagline / Business Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={branding.description}
                                    onChange={(e) => setBranding((p) => ({ ...p, description: e.target.value }))}
                                    placeholder="e.g. Computer Sales, Hardware & Repair Specialists"
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Shop / Office Address</span>
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={branding.address}
                                    onChange={(e) => setBranding((p) => ({ ...p, address: e.target.value }))}
                                    placeholder="e.g. Near Post Office Mandi Bahauddin"
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                                />
                            </div>

                            {/* Phone Numbers */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Contact Phone Numbers</span>
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={branding.phoneNumbers}
                                    onChange={(e) => setBranding((p) => ({ ...p, phoneNumbers: e.target.value }))}
                                    placeholder="e.g. 0343-8483919 / 0333-8483919"
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Email Address (Optional)</span>
                                    </div>
                                </label>
                                <input
                                    type="email"
                                    value={branding.email || ""}
                                    onChange={(e) => setBranding((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="e.g. cgscomputers@gmail.com"
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Receipt Note & Policies Card */}
                    <div className="bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <FileCheck className="w-4 h-4 text-blue-600" />
                                <span>Receipt Terms & Exchange Policy</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">Prints at bottom of receipt</span>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Receipt Note (Terms & Conditions)
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setBranding((p) => ({
                                                ...p,
                                                receiptNote:
                                                    "No item can be returned after sale.\nItems can be exchanged only within 7 days of purchase.\nReceipt must be presented for exchange.",
                                            }))
                                        }
                                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                                    >
                                        [Standard 7-Day Exchange]
                                    </button>
                                </div>
                            </div>
                            <textarea
                                rows={4}
                                value={branding.receiptNote}
                                onChange={(e) => setBranding((p) => ({ ...p, receiptNote: e.target.value }))}
                                placeholder="Enter return, exchange, or warranty conditions..."
                                className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                                Each new line in this box will print on a separate line on the customer receipt.
                            </p>
                        </div>

                        {/* Others / Footer Text */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Others (Footer Note, NTN, Developer / Queries)
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBranding((p) => ({
                                            ...p,
                                            others: "For queries: 0343-8483919 / 0333-8483919\nPowered By RapidTechPro",
                                        }))
                                    }
                                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                                >
                                    [Standard Query & Tech Credits]
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={branding.others}
                                onChange={(e) => setBranding((p) => ({ ...p, others: e.target.value }))}
                                placeholder="e.g. For queries: 0343-8483919 / 0333-8483919\nPowered By RapidTechPro"
                                className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
                        >
                            <RotateCcw className="w-4 h-4 text-slate-500" />
                            <span>Reset to Default</span>
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{saving ? "Saving Changes..." : "Save Branding Settings"}</span>
                        </button>
                    </div>
                </form>

                {/* Right Column: Live Multi-Format Preview (5 Cols) */}
                <div className="lg:col-span-5 space-y-4 sticky top-6">
                    {/* Preview Mode Switcher */}
                    <div className="bg-white border border-slate-200 p-1.5 shadow-xs flex items-center gap-1">
                        <button
                            onClick={() => setPreviewMode("thermal")}
                            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                previewMode === "thermal"
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>80mm Thermal</span>
                        </button>
                        <button
                            onClick={() => setPreviewMode("a4")}
                            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                previewMode === "a4"
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>A4 Invoice</span>
                        </button>
                        <button
                            onClick={() => setPreviewMode("web")}
                            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                previewMode === "web"
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Web Header</span>
                        </button>
                    </div>

                    {/* Preview Box Container */}
                    <div className="bg-slate-100 border border-slate-200 p-4 min-h-[560px] flex items-center justify-center overflow-x-auto">
                        {/* 1. Thermal Receipt Simulation */}
                        {previewMode === "thermal" && (
                            <div className="w-[280px] bg-white p-4 shadow-md border border-slate-300 text-slate-900 font-mono text-[11px] leading-tight select-none">
                                {/* Header */}
                                <div className="text-center space-y-1 mb-3">
                                    {branding.logo ? (
                                        <img
                                            src={branding.logo}
                                            alt={branding.businessName}
                                            className="h-12 mx-auto object-contain mb-1"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = "/libertycollection.png";
                                            }}
                                        />
                                    ) : null}
                                    <div className="font-extrabold text-sm uppercase tracking-tight text-black">
                                        {branding.businessName || "STORE NAME"}
                                    </div>
                                    {branding.description && (
                                        <div className="text-[9px] text-slate-600 leading-tight">
                                            {branding.description}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-700">{branding.address}</div>
                                    <div className="text-[10px] font-bold text-slate-900">{branding.phoneNumbers}</div>
                                </div>

                                <div className="border-t border-dashed border-slate-400 my-2" />

                                {/* Mock Metadata */}
                                <div className="text-[9.5px] space-y-0.5 text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Invoice: #INV-10928</span>
                                        <span>{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Counter: CASHIER-01</span>
                                        <span>Type: RETAIL</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-400 my-2" />

                                {/* Items Sample */}
                                <div className="space-y-1.5 text-[10px]">
                                    <div>
                                        <div className="font-bold flex justify-between">
                                            <span>Core i5 10th Gen Desktop</span>
                                            <span>45,000.00</span>
                                        </div>
                                        <div className="text-[9px] text-slate-500">1 x 45,000.00</div>
                                    </div>
                                    <div>
                                        <div className="font-bold flex justify-between">
                                            <span>Gaming Mechanical Keyboard</span>
                                            <span>3,500.00</span>
                                        </div>
                                        <div className="text-[9px] text-slate-500">1 x 3,500.00</div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-900 my-2" />

                                {/* Totals */}
                                <div className="space-y-1 text-[11px]">
                                    <div className="flex justify-between font-bold">
                                        <span>Subtotal:</span>
                                        <span>48,500.00</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-emerald-700">
                                        <span>Discount:</span>
                                        <span>- 500.00</span>
                                    </div>
                                    <div className="border-t-2 border-slate-900 my-1" />
                                    <div className="flex justify-between font-black text-xs text-black">
                                        <span>NET TOTAL:</span>
                                        <span>RS 48,000.00</span>
                                    </div>
                                    <div className="border-t-2 border-slate-900 my-1" />
                                    <div className="flex justify-between font-bold">
                                        <span>Paid Amount:</span>
                                        <span>48,000.00</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>Balance Due:</span>
                                        <span>0.00</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-400 my-2.5" />

                                {/* Receipt Note */}
                                <div className="text-center text-[9px] text-slate-700 whitespace-pre-line leading-relaxed">
                                    {branding.receiptNote || "No receipt notes configured."}
                                </div>

                                <div className="border-t border-dashed border-slate-400 my-2.5" />

                                {/* Others / Footer */}
                                <div className="text-center text-[8.5px] text-slate-500 whitespace-pre-line leading-tight">
                                    {branding.others || "Powered By RapidTechPro"}
                                </div>
                            </div>
                        )}

                        {/* 2. A4 Document Header Simulation */}
                        {previewMode === "a4" && (
                            <div className="w-[320px] sm:w-[360px] bg-white p-5 shadow-md border border-slate-300 text-slate-900 select-none">
                                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        {branding.logo ? (
                                            <img
                                                src={branding.logo}
                                                alt="Logo"
                                                className="w-12 h-12 object-contain"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = "/libertycollection.png";
                                                }}
                                            />
                                        ) : null}
                                        <div>
                                            <h3 className="font-extrabold text-sm uppercase text-slate-900 leading-tight">
                                                {branding.businessName}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {branding.description}
                                            </p>
                                            <p className="text-[9px] text-slate-600">{branding.address}</p>
                                            <p className="text-[9px] font-bold text-slate-800">{branding.phoneNumbers}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black uppercase text-blue-600 block">
                                            TAX INVOICE
                                        </span>
                                        <span className="text-[9px] text-slate-500 block">#INV-2026-081</span>
                                        <span className="text-[9px] text-slate-500 block">
                                            {new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Mock Table */}
                                <div className="border border-slate-200 mb-3 text-[9px]">
                                    <div className="bg-slate-100 flex font-bold p-1 border-b border-slate-200">
                                        <span className="flex-1">Description</span>
                                        <span className="w-12 text-center">Qty</span>
                                        <span className="w-16 text-right">Amount</span>
                                    </div>
                                    <div className="flex p-1 border-b border-slate-100">
                                        <span className="flex-1">Hardware Diagnostic & Maintenance</span>
                                        <span className="w-12 text-center">1</span>
                                        <span className="w-16 text-right font-semibold">2,500.00</span>
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="bg-slate-50 border border-slate-200 p-2 text-[8px] text-slate-600 leading-tight mb-2">
                                    <span className="font-bold text-slate-800 block mb-0.5">Terms & Conditions:</span>
                                    <p className="whitespace-pre-line">{branding.receiptNote}</p>
                                </div>

                                <div className="text-center text-[7.5px] text-slate-400 whitespace-pre-line">
                                    {branding.others}
                                </div>
                            </div>
                        )}

                        {/* 3. Web Header Simulation */}
                        {previewMode === "web" && (
                            <div className="w-full max-w-[340px] space-y-4 select-none">
                                {/* Top Header simulation */}
                                <div className="bg-white border border-slate-200 p-3 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        {branding.logo ? (
                                            <img
                                                src={branding.logo}
                                                alt="Logo"
                                                className="w-8 h-8 object-contain"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = "/libertycollection.png";
                                                }}
                                            />
                                        ) : null}
                                        <div>
                                            <div className="text-xs font-black text-slate-900 leading-tight">
                                                {branding.businessName}
                                            </div>
                                            <div className="text-[9px] text-slate-400">{branding.address}</div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                                        Active
                                    </span>
                                </div>

                                {/* Sidebar snippet simulation */}
                                <div className="bg-white border border-slate-200 p-4 shadow-sm space-y-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Sidebar Branding Preview
                                    </span>
                                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
                                        <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                            {branding.businessName?.charAt(0) || "C"}
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-slate-900 block leading-tight">
                                                {branding.businessName}
                                            </span>
                                            <span className="text-[9px] font-bold uppercase text-slate-500">
                                                {branding.phoneNumbers?.split("/")[0]?.trim() || "POS Terminal"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
