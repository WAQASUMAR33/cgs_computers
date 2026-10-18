"use client";

import { useState, useEffect, useRef } from "react";
import {
    Wrench,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    PackageCheck,
    Truck,
    X,
    Printer,
    MessageCircle,
    User,
    Smartphone,
    Laptop,
    Monitor,
    Cpu,
    Calendar,
    DollarSign,
    FileText,
    Key,
    ShieldAlert,
    Check,
    ChevronDown,
    ArrowRight,
    Edit3,
    Trash2,
    RefreshCw,
    LayoutGrid,
    List,
    Sparkles,
    ShieldCheck,
    ChevronRight,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEVICE_TYPES = [
    { label: "Laptop", icon: Laptop },
    { label: "Desktop PC", icon: Monitor },
    { label: "MacBook / iMac", icon: Cpu },
    { label: "LCD / LED Monitor", icon: Monitor },
    { label: "Printer / Scanner", icon: Printer },
    { label: "Motherboard", icon: Cpu },
    { label: "Graphics Card (GPU)", icon: Cpu },
    { label: "Power Supply (PSU)", icon: Cpu },
    { label: "Hard Drive / SSD", icon: Cpu },
    { label: "Other Device", icon: Wrench },
];

const DEVICE_BRANDS = [
    "Dell",
    "HP",
    "Lenovo",
    "Apple",
    "Asus",
    "Acer",
    "MSI",
    "Samsung",
    "LG",
    "Canon",
    "Epson",
    "Custom Build",
    "Other",
];

const ACCESSORIES_OPTIONS = [
    "Power Adapter / Charger",
    "Laptop Bag / Sleeve",
    "Power Cable",
    "VGA / HDMI Cable",
    "Mouse / Keyboard",
    "Original Box",
    "None",
];

const STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; border: string; badge: string; icon: any }
> = {
    RECEIVED: {
        label: "Received",
        bg: "bg-blue-50/80",
        text: "text-blue-700",
        border: "border-blue-200",
        badge: "bg-blue-100 text-blue-800",
        icon: Clock,
    },
    DIAGNOSING: {
        label: "Diagnosing",
        bg: "bg-purple-50/80",
        text: "text-purple-700",
        border: "border-purple-200",
        badge: "bg-purple-100 text-purple-800",
        icon: Wrench,
    },
    WAITING_FOR_PARTS: {
        label: "Waiting Parts",
        bg: "bg-amber-50/80",
        text: "text-amber-700",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-800",
        icon: AlertCircle,
    },
    IN_PROGRESS: {
        label: "In Progress",
        bg: "bg-indigo-50/80",
        text: "text-indigo-700",
        border: "border-indigo-200",
        badge: "bg-indigo-100 text-indigo-800",
        icon: Wrench,
    },
    READY: {
        label: "Ready for Pickup",
        bg: "bg-emerald-50/80",
        text: "text-emerald-700",
        border: "border-emerald-200",
        badge: "bg-emerald-100 text-emerald-800",
        icon: PackageCheck,
    },
    DELIVERED: {
        label: "Delivered & Closed",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
        badge: "bg-slate-200 text-slate-800",
        icon: CheckCircle2,
    },
    UNREPAIRABLE: {
        label: "Unrepairable",
        bg: "bg-rose-50/80",
        text: "text-rose-700",
        border: "border-rose-200",
        badge: "bg-rose-100 text-rose-800",
        icon: AlertCircle,
    },
    CANCELLED: {
        label: "Cancelled",
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-200",
        badge: "bg-gray-200 text-gray-700",
        icon: X,
    },
};

const KANBAN_STAGES = [
    { key: "RECEIVED", label: "Received", icon: Clock, color: "blue" },
    { key: "DIAGNOSING", label: "Diagnosing", icon: Wrench, color: "purple" },
    { key: "IN_PROGRESS", label: "In Progress", icon: Cpu, color: "indigo" },
    { key: "READY", label: "Ready for Pickup", icon: PackageCheck, color: "emerald" },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2, color: "slate" },
];

const PRIORITY_CONFIG: Record<string, { label: string; badge: string }> = {
    LOW: { label: "Low", badge: "bg-slate-100 text-slate-700 border-slate-200" },
    NORMAL: { label: "Normal", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    HIGH: { label: "High", badge: "bg-amber-100 text-amber-800 border-amber-300 font-bold" },
    URGENT: { label: "Urgent", badge: "bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse" },
};

export default function RepairsPage() {
    const [repairs, setRepairs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<any>(null);
    const [branding, setBranding] = useState<any>({
        businessName: "CGS COMPUTERS",
        description: "Hardware, Laptops, Desktops, CCTV & IT Equipment Solutions",
        address: "Near Post Office Mandi Bahauddin",
        phoneNumbers: "0343-8483919 / 0333-8483919",
        receiptNote: "1. Please present this original claim slip when receiving your device.\n2. Checking warranty 7 days after delivery.\n3. Shop not responsible for data loss. Please back up data.\n4. Unclaimed devices after 30 days are subject to disposal.",
        others: "RapidTechPro POS & Repair System",
        logo: "/images/cgs_logo.png"
    });

    // Create Form State
    const [formData, setFormData] = useState({
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerCnic: "",
        customerAddress: "",
        deviceType: "Laptop",
        deviceBrand: "Dell",
        deviceModel: "",
        serialNumber: "",
        devicePassword: "",
        accessoriesIncluded: [] as string[],
        conditionNotes: "",
        problemDescription: "",
        diagnosticsNotes: "",
        priority: "NORMAL",
        estimatedCost: "",
        partCost: "",
        laborCost: "",
        finalAmount: "",
        paidAmount: "",
        paymentMethod: "CASH",
        technicianName: "",
        expectedDate: "",
        notes: "",
    });

    // Edit/Update Form State
    const [editData, setEditData] = useState<any>({});

    const printRef = useRef<HTMLDivElement>(null);

    // Fetch repairs & stats
    const fetchRepairs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append("query", searchQuery);
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (priorityFilter !== "ALL") params.append("priority", priorityFilter);

            const [repairsRes, statsRes] = await Promise.all([
                fetch(`/api/repairs?${params.toString()}`),
                fetch("/api/repairs/stats"),
            ]);

            if (repairsRes.ok) {
                const data = await repairsRes.json();
                setRepairs(data);
            }
            if (statsRes.ok) {
                const s = await statsRes.json();
                setStats(s);
            }
        } catch (error) {
            console.error("Failed to load repairs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch store branding
    useEffect(() => {
        fetch("/api/branding")
            .then((res) => res.json())
            .then((data) => {
                if (data && (data.branding || data.businessName)) {
                    setBranding(data.branding || data);
                }
            })
            .catch(() => {});
    }, []);

    // Fetch customer list for intake dropdown
    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setCustomers(data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRepairs();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, priorityFilter]);

    // Handle Customer Selection in Intake
    const handleCustomerSelect = (customerId: string) => {
        const found = customers.find((c) => c.id === customerId);
        if (found) {
            setFormData((prev) => ({
                ...prev,
                customerId: found.id,
                customerName: found.name,
                customerPhone: found.contact,
                customerCnic: found.cnic || "",
                customerAddress: found.address || "",
            }));
        } else {
            setFormData((prev) => ({ ...prev, customerId: "" }));
        }
    };

    // Toggle Accessory checkbox
    const toggleAccessory = (acc: string) => {
        setFormData((prev) => {
            const exists = prev.accessoriesIncluded.includes(acc);
            if (exists) {
                return {
                    ...prev,
                    accessoriesIncluded: prev.accessoriesIncluded.filter((a) => a !== acc),
                };
            } else {
                return {
                    ...prev,
                    accessoriesIncluded: [...prev.accessoriesIncluded, acc],
                };
            }
        });
    };

    // Handle Create Submit
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                accessoriesIncluded: formData.accessoriesIncluded.join(", "),
            };

            const res = await fetch("/api/repairs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const created = await res.json();
                setIsCreateOpen(false);
                resetCreateForm();
                fetchRepairs();
                setSelectedRepair(created);
                setIsPrintOpen(true);
                printThermalRepairBill(created);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to create repair ticket"}`);
            }
        } catch (error) {
            console.error("Create repair failed:", error);
            alert("Network error creating repair ticket.");
        }
    };

    const resetCreateForm = () => {
        setFormData({
            customerId: "",
            customerName: "",
            customerPhone: "",
            customerCnic: "",
            customerAddress: "",
            deviceType: "Laptop",
            deviceBrand: "Dell",
            deviceModel: "",
            serialNumber: "",
            devicePassword: "",
            accessoriesIncluded: [],
            conditionNotes: "",
            problemDescription: "",
            diagnosticsNotes: "",
            priority: "NORMAL",
            estimatedCost: "",
            partCost: "",
            laborCost: "",
            finalAmount: "",
            paidAmount: "",
            paymentMethod: "CASH",
            technicianName: "",
            expectedDate: "",
            notes: "",
        });
    };

    // Open Edit Modal
    const openEditModal = (repair: any) => {
        setSelectedRepair(repair);
        setEditData({
            ...repair,
            expectedDate: repair.expectedDate
                ? new Date(repair.expectedDate).toISOString().split("T")[0]
                : "",
        });
        setIsEditOpen(true);
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/repairs/${selectedRepair.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                setIsEditOpen(false);
                fetchRepairs();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to update ticket"}`);
            }
        } catch (error) {
            console.error("Update repair failed:", error);
        }
    };

    // Quick Status Progression from card / row
    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case "RECEIVED":
                return "DIAGNOSING";
            case "DIAGNOSING":
                return "IN_PROGRESS";
            case "WAITING_FOR_PARTS":
                return "IN_PROGRESS";
            case "IN_PROGRESS":
                return "READY";
            case "READY":
                return "DELIVERED";
            default:
                return null;
        }
    };

    const handleQuickStatusChange = async (repairId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/repairs/${repairId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchRepairs();
            }
        } catch (error) {
            console.error("Quick status change failed:", error);
        }
    };

    // Delete Repair Ticket
    const handleDelete = async (repairId: string) => {
        if (!confirm("Are you sure you want to delete this repair ticket?")) return;
        try {
            const res = await fetch(`/api/repairs/${repairId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchRepairs();
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // 80mm Thermal Receipt Generator for Repair Bill
    const printThermalRepairBill = (repairToPrint?: any) => {
        const repair = repairToPrint || selectedRepair;
        if (!repair) return;

        const printWindow = window.open("", "_blank", "width=380,height=700");
        if (!printWindow) {
            alert("Please allow popups to print receipt");
            return;
        }

        const bizName = branding?.businessName || "CGS COMPUTERS";
        const bizAddress = branding?.address || "Near Post Office Mandi Bahauddin";
        const bizPhones = branding?.phoneNumbers || "0343-8483919 / 0333-8483919";
        const receiptNotes = branding?.receiptNote ? branding.receiptNote.replace(/\n/g, '<br>') : "1. Please present this original claim slip when receiving your device.<br>2. Checking warranty 7 days after delivery.<br>3. Shop not responsible for data loss.<br>4. Unclaimed devices after 30 days subject to disposal.";
        const footerOthers = branding?.others ? branding.others.replace(/\n/g, '<br>') : "Thank You For Choosing Us!";
        const logoUrl = branding?.logo ? (branding.logo.startsWith('http') || branding.logo.startsWith('data:') ? branding.logo : window.location.origin + branding.logo) : '';

        const totalBill = Number(repair.finalAmount || repair.estimatedCost || 0);
        const advancePaid = Number(repair.paidAmount || 0);
        const balanceDue = Number(repair.balance !== undefined ? repair.balance : (totalBill - advancePaid));

        const thermalHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Repair Receipt - ${repair.ticketNumber}</title>
    <style>
        @page { size: 80mm auto; margin: 3mm; }
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, -apple-system, sans-serif;
            font-size: 10px;
            width: 72mm;
            margin: 0 auto;
            padding: 2px 2px;
            color: #000;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: 700; }
        .bolder { font-weight: 900; }
        .header { text-align: center; margin-bottom: 5px; }
        .header img { max-height: 75px; max-width: 90%; object-fit: contain; margin: 0 auto 3px auto; display: block; }
        .biz-title { font-size: 14px; font-weight: 900; letter-spacing: 0.5px; margin: 2px 0; }
        .header p { margin: 1px 0; font-size: 8.5px; font-weight: 600; }
        .badge-title {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 2px 8px;
            font-weight: 900;
            font-size: 10px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin: 4px 0 2px 0;
        }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .divider-double { border-top: 2px dashed #000; margin: 5px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 9.5px; }
        .info-row span:first-child { color: #222; font-weight: 600; }
        .info-row span:last-child { font-weight: 800; text-align: right; max-width: 60%; word-break: break-word; }
        .section-box { border: 1px solid #000; padding: 4px 6px; margin: 4px 0; }
        .section-title { font-weight: 900; font-size: 9.5px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px; }
        .total-row { display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; font-weight: 700; }
        .total-row.grand { font-size: 13px; font-weight: 900; }
        .footer { text-align: center; margin-top: 6px; font-size: 8px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 22px; padding: 0 4px; }
        .sign-col { text-align: center; width: 45%; }
        .sign-line { border-top: 1px solid #000; margin-bottom: 2px; }
    </style>
</head>
<body>
    <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="${bizName}" />` : ''}
        <div class="biz-title">${bizName.toUpperCase()}</div>
        <p>${bizAddress}</p>
        <p>Phone: ${bizPhones}</p>
        <div class="badge-title">REPAIR CLAIM / JOB SHEET</div>
    </div>

    <div class="divider"></div>

    <div class="info-row">
        <span>Ticket Number:</span>
        <span class="bolder" style="font-size: 12px; font-family: monospace;">${repair.ticketNumber}</span>
    </div>
    <div class="info-row">
        <span>Date & Time:</span>
        <span>${new Date(repair.receivedDate || repair.createdAt || Date.now()).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
    </div>
    <div class="info-row">
        <span>Status:</span>
        <span style="text-transform: uppercase;">${STATUS_CONFIG[repair.status]?.label || repair.status}</span>
    </div>
    <div class="info-row">
        <span>Priority:</span>
        <span>${repair.priority || 'NORMAL'}</span>
    </div>

    <div class="divider"></div>

    <div class="section-box">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span>Name:</span><span>${repair.customerName}</span></div>
        <div class="info-row"><span>Phone:</span><span>${repair.customerPhone}</span></div>
        ${repair.customerAddress ? `<div class="info-row"><span>Address:</span><span>${repair.customerAddress}</span></div>` : ''}
    </div>

    <div class="section-box">
        <div class="section-title">Device Specifications</div>
        <div class="info-row"><span>Device:</span><span>${repair.deviceBrand || ''} ${repair.deviceModel || repair.deviceType}</span></div>
        ${repair.serialNumber ? `<div class="info-row"><span>Serial/Tag:</span><span>${repair.serialNumber}</span></div>` : ''}
        ${repair.accessoriesIncluded ? `<div class="info-row"><span>Accessories:</span><span>${Array.isArray(repair.accessoriesIncluded) ? repair.accessoriesIncluded.join(', ') : repair.accessoriesIncluded}</span></div>` : ''}
        ${repair.conditionNotes ? `<div class="info-row"><span>Physical Cond:</span><span>${repair.conditionNotes}</span></div>` : ''}
    </div>

    <div class="section-box">
        <div class="section-title">Reported Fault / Problem</div>
        <div style="font-size: 9.5px; font-weight: 700; padding: 2px 0; word-break: break-word;">
            ${repair.problemDescription || 'Diagnosis & Repair Servicing'}
        </div>
    </div>

    <div class="divider"></div>

    <div class="total-row">
        <span>Estimated / Total Bill:</span>
        <span>Rs. ${totalBill.toFixed(2)}</span>
    </div>
    <div class="total-row">
        <span>Advance Paid:</span>
        <span>Rs. ${advancePaid.toFixed(2)}</span>
    </div>
    <div class="divider-double"></div>
    <div class="total-row grand">
        <span>BALANCE PAYABLE:</span>
        <span>Rs. ${balanceDue.toFixed(2)}</span>
    </div>
    <div class="divider-double"></div>

    <div class="footer">
        <p style="font-weight: 800; text-decoration: underline; margin-bottom: 3px;">TERMS & CONDITIONS</p>
        <div style="text-align: left; font-size: 7.5px; line-height: 1.35; font-weight: 500;">
            ${receiptNotes}
        </div>
        <div class="signatures">
            <div class="sign-col">
                <div class="sign-line"></div>
                <div style="font-size: 8px; font-weight: 700;">Customer Signature</div>
            </div>
            <div class="sign-col">
                <div class="sign-line"></div>
                <div style="font-size: 8px; font-weight: 700;">CGS Technician Stamp</div>
            </div>
        </div>
        <div class="divider" style="margin-top: 10px;"></div>
        <p style="font-size: 8px; font-weight: 700; margin-top: 2px;">${footerOthers}</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
        };
    </script>
</body>
</html>`;

        printWindow.document.write(thermalHTML);
        printWindow.document.close();
    };

    // Print Claim Ticket (Triggers 80mm thermal receipt)
    const handlePrint = (repair: any) => {
        setSelectedRepair(repair);
        setIsPrintOpen(true);
        printThermalRepairBill(repair);
    };

    const triggerPrint = () => {
        printThermalRepairBill(selectedRepair);
    };

    // WhatsApp Message Generator
    const getWhatsAppUrl = (repair: any) => {
        const cleanPhone = (repair.customerPhone || "").replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("0")
            ? "92" + cleanPhone.slice(1)
            : cleanPhone;

        const message = `*Assalam-o-Alaikum ${repair.customerName}*,\n\nThis is an official update from *CGS Computers* regarding your repair device:\n\n📋 *Ticket No:* ${repair.ticketNumber}\n💻 *Device:* ${repair.deviceBrand || ""} ${repair.deviceModel || repair.deviceType}\n⚡ *Status:* ${STATUS_CONFIG[repair.status]?.label || repair.status}\n💵 *Total Bill:* Rs. ${Number(repair.finalAmount || repair.estimatedCost).toLocaleString()}\n✅ *Paid Amount:* Rs. ${Number(repair.paidAmount).toLocaleString()}\n🔴 *Remaining Balance:* Rs. ${Number(repair.balance).toLocaleString()}\n\n📍 *Shop Location:* Near Post Office Mandi Bahauddin\n📞 *Call / WhatsApp:* 0343-8483919 / 0333-8483919\n\nThank you for choosing CGS Computers!`;

        return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-6 select-none">
            {/* ==================================================== */}
            {/* HERO BANNER: Material Design 3 Expressive Banner      */}
            {/* ==================================================== */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
                {/* Decorative background blurs */}
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-40 -bottom-20 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white tracking-wide border border-white/20">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                CGS Service & Hardware Lab
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                7-Day Warranty Backed
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp Live Alerts
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <span>Repairs & Service Management</span>
                        </h2>
                        <p className="text-sm text-blue-100 font-medium">
                            Professional device intake, technician diagnostics, parts replacement, and printed claim tickets with warranty protection.
                        </p>
                    </div>

                    {/* Banner Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* View Switcher Toggle */}
                        <div className="flex items-center bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/15">
                            <button
                                onClick={() => setViewMode("table")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                                    viewMode === "table"
                                        ? "bg-white text-slate-900 shadow-md"
                                        : "text-white/80 hover:text-white"
                                )}
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Table View</span>
                            </button>
                            <button
                                onClick={() => setViewMode("kanban")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                                    viewMode === "kanban"
                                        ? "bg-white text-slate-900 shadow-md"
                                        : "text-white/80 hover:text-white"
                                )}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Kanban Pipeline</span>
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchRepairs}
                            className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                            title="Refresh Tickets"
                        >
                            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        </button>

                        {/* Primary New Ticket Button */}
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-blue-700 font-bold text-sm shadow-lg hover:shadow-xl hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>New Repair Ticket</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================================================== */}
            {/* STAT CARDS: Material Design 3 Tonal Elevated Cards   */}
            {/* ==================================================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* 1. Total Tickets */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-3xl" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Tickets
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-slate-900 tracking-tight">
                        {stats?.total ?? 0}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        Lifetime intake
                    </span>
                </div>

                {/* 2. In Progress / On Bench */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-purple-200/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group bg-gradient-to-b from-purple-50/30 to-white">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 rounded-t-3xl" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                            Active On Bench
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Wrench className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-purple-800 tracking-tight flex items-baseline gap-2">
                        <span>{(stats?.inProgress ?? 0) + (stats?.diagnosing ?? 0) + (stats?.received ?? 0)}</span>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    </div>
                    <span className="text-[11px] text-purple-600 font-medium mt-1 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        Under technician care
                    </span>
                </div>

                {/* 3. Ready for Pickup */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-emerald-200/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group bg-gradient-to-b from-emerald-50/30 to-white">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-3xl" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                            Ready For Pickup
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PackageCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-emerald-700 tracking-tight">
                        {stats?.ready ?? 0}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Repaired & tested
                    </span>
                </div>

                {/* 4. Delivered */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500 rounded-t-3xl" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Delivered
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
                        {stats?.delivered ?? 0}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 inline-flex items-center gap-1">
                        Handed over to client
                    </span>
                </div>

                {/* 5. Unpaid Balance */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-rose-200/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group bg-gradient-to-b from-rose-50/30 to-white col-span-2 md:col-span-3 lg:col-span-1">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 rounded-t-3xl" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                            Unpaid Balance
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 text-2xl font-black text-rose-600 tracking-tight">
                        Rs. {(stats?.totalPendingBalance ?? 0).toLocaleString()}
                    </div>
                    <span className="text-[11px] text-rose-600 font-medium mt-1 inline-flex items-center gap-1">
                        Receivable at pickup
                    </span>
                </div>
            </div>

            {/* ==================================================== */}
            {/* SEARCH & FILTER TOOLBAR                             */}
            {/* ==================================================== */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Modern Pill Search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ticket #, customer name, mobile, device model, serial..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Priority Selector Pill */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Priority:</span>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High (Urgent)</option>
                            <option value="URGENT">Critical</option>
                        </select>
                    </div>
                </div>

                {/* Filter Chips Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border",
                            statusFilter === "ALL"
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                    >
                        All Statuses ({repairs.length})
                    </button>

                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const count = repairs.filter((r) => r.status === key).length;
                        const isSelected = statusFilter === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5",
                                    isSelected
                                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                        : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50"
                                )}
                            >
                                <span>{config.label}</span>
                                {count > 0 && (
                                    <span
                                        className={cn(
                                            "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                                            isSelected
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 text-slate-700"
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ==================================================== */}
            {/* VIEW MODE 1: KANBAN PIPELINE BOARD                  */}
            {/* ==================================================== */}
            {viewMode === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                    {KANBAN_STAGES.map((stage) => {
                        const stageTickets = repairs.filter((r) => r.status === stage.key);
                        const StageIcon = stage.icon;

                        return (
                            <div
                                key={stage.key}
                                className="rounded-3xl bg-slate-100/70 border border-slate-200/70 p-3.5 space-y-3 min-h-[450px] flex flex-col"
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-700">
                                            <StageIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-black text-slate-800">
                                            {stage.label}
                                        </span>
                                    </div>
                                    <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[11px] font-bold flex items-center justify-center shadow-xs">
                                        {stageTickets.length}
                                    </span>
                                </div>

                                {/* Column Cards */}
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {stageTickets.length === 0 ? (
                                        <div className="h-32 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
                                            <span>No tickets</span>
                                        </div>
                                    ) : (
                                        stageTickets.map((ticket) => {
                                            const priorityMeta = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.NORMAL;
                                            const nextStatus = getNextStatus(ticket.status);

                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className="rounded-2xl bg-white border border-slate-200/80 p-3.5 space-y-2.5 shadow-xs hover:shadow-md transition-all group"
                                                >
                                                    {/* Card Header: Ticket # & Priority */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-xs font-black text-primary">
                                                            {ticket.ticketNumber}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "text-[10px] px-2 py-0.5 rounded-full uppercase border",
                                                                priorityMeta.badge
                                                            )}
                                                        >
                                                            {priorityMeta.label}
                                                        </span>
                                                    </div>

                                                    {/* Device info */}
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                            <span>{ticket.deviceBrand}</span>
                                                            <span className="truncate">{ticket.deviceModel || ticket.deviceType}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                                            {ticket.problemDescription}
                                                        </p>
                                                    </div>

                                                    {/* Customer & Phone */}
                                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                                                {ticket.customerName?.[0]?.toUpperCase() || "C"}
                                                            </div>
                                                            <span className="font-semibold text-slate-700 truncate max-w-[90px]">
                                                                {ticket.customerName}
                                                            </span>
                                                        </div>

                                                        {/* WhatsApp quick click */}
                                                        <a
                                                            href={getWhatsAppUrl(ticket)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                            title="WhatsApp Customer"
                                                        >
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>

                                                    {/* Financial & Actions Bar */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                                Balance
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    "text-xs font-black font-mono",
                                                                    Number(ticket.balance) > 0
                                                                        ? "text-rose-600"
                                                                        : "text-emerald-600"
                                                                )}
                                                            >
                                                                Rs. {Number(ticket.balance || 0).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handlePrint(ticket)}
                                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                                                                title="Print Slip"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => openEditModal(ticket)}
                                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                                                title="Edit Ticket"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>

                                                            {/* Next Stage Button */}
                                                            {nextStatus && (
                                                                <button
                                                                    onClick={() => handleQuickStatusChange(ticket.id, nextStatus)}
                                                                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                                                    title={`Move to ${STATUS_CONFIG[nextStatus]?.label}`}
                                                                >
                                                                    <span>Next</span>
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW MODE 2: ENHANCED TABLE VIEW                    */}
            {/* ==================================================== */}
            {viewMode === "table" && (
                <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Ticket #</th>
                                    <th className="py-3.5 px-5">Customer</th>
                                    <th className="py-3.5 px-5">Device Specification</th>
                                    <th className="py-3.5 px-5">Repair Stage</th>
                                    <th className="py-3.5 px-5">Priority</th>
                                    <th className="py-3.5 px-5">Total & Balance</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                                                <span className="font-semibold text-slate-600 text-sm">
                                                    Fetching repair tickets...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : repairs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <Wrench className="w-6 h-6" />
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm">No repair records found</p>
                                                <p className="text-xs text-slate-400">
                                                    No tickets match your search. Click "New Repair Ticket" above to record a new customer device.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    repairs.map((repair) => {
                                        const statusMeta = STATUS_CONFIG[repair.status] || STATUS_CONFIG.RECEIVED;
                                        const StatusIcon = statusMeta.icon;
                                        const priorityMeta = PRIORITY_CONFIG[repair.priority] || PRIORITY_CONFIG.NORMAL;
                                        const nextStatus = getNextStatus(repair.status);

                                        return (
                                            <tr
                                                key={repair.id}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                {/* Ticket # */}
                                                <td className="py-4 px-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono font-black text-sm text-blue-600">
                                                            {repair.ticketNumber}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(repair.receivedDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                                            {repair.customerName?.[0]?.toUpperCase() || "C"}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-slate-900 text-sm truncate">
                                                                {repair.customerName}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                                                                <span>{repair.customerPhone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Device Specification */}
                                                <td className="py-4 px-5 max-w-xs">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                                                                {repair.deviceBrand || "Brand"}
                                                            </span>
                                                            <span className="font-bold text-slate-800 text-xs truncate">
                                                                {repair.deviceModel || repair.deviceType}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                                                            {repair.problemDescription}
                                                        </p>
                                                        {repair.accessoriesIncluded && (
                                                            <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                                Acc: {repair.accessoriesIncluded}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Repair Stage Pill + Quick Advance */}
                                                <td className="py-4 px-5">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                                statusMeta.bg,
                                                                statusMeta.text,
                                                                statusMeta.border
                                                            )}
                                                        >
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            <span>{statusMeta.label}</span>
                                                        </span>

                                                        {/* Quick advance button */}
                                                        {nextStatus && (
                                                            <button
                                                                onClick={() => handleQuickStatusChange(repair.id, nextStatus)}
                                                                className="p-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                                                                title={`Move to ${STATUS_CONFIG[nextStatus]?.label}`}
                                                            >
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Priority */}
                                                <td className="py-4 px-5">
                                                    <span
                                                        className={cn(
                                                            "text-[10px] px-2.5 py-0.5 rounded-full uppercase border font-semibold",
                                                            priorityMeta.badge
                                                        )}
                                                    >
                                                        {priorityMeta.label}
                                                    </span>
                                                </td>

                                                {/* Total & Balance */}
                                                <td className="py-4 px-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-extrabold text-slate-900 text-sm">
                                                            Rs. {Number(repair.finalAmount || repair.estimatedCost).toLocaleString()}
                                                        </span>
                                                        {Number(repair.balance) > 0 ? (
                                                            <span className="text-[11px] font-bold text-rose-600 font-mono">
                                                                Bal: Rs. {Number(repair.balance).toLocaleString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                                                <Check className="w-3 h-3" /> Fully Paid
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* WhatsApp Message */}
                                                        <a
                                                            href={getWhatsAppUrl(repair)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                            title="Send WhatsApp Update"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </a>

                                                        {/* Print Receipt */}
                                                        <button
                                                            onClick={() => handlePrint(repair)}
                                                            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                                            title="Print Claim Sheet"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>

                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => openEditModal(repair)}
                                                            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                                            title="Update Diagnostics & Costs"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDelete(repair.id)}
                                                            className="p-2 rounded-full text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                                            title="Delete Ticket"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* INTAKE MODAL (NEW REPAIR TICKET)                    */}
            {/* ==================================================== */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="rounded-3xl bg-white max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 border border-slate-200/80">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                        New Repair Intake Ticket
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Fill in customer details, device specifications, reported faults, and advance payment
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            {/* Section 1: Customer Details */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                        1. Customer Information
                                    </span>
                                    {customers.length > 0 && (
                                        <select
                                            onChange={(e) => handleCustomerSelect(e.target.value)}
                                            className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-slate-50 focus:outline-none focus:border-blue-600 font-medium"
                                        >
                                            <option value="">-- Quick Select Existing Customer --</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.contact})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Customer Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, customerName: e.target.value })
                                            }
                                            placeholder="e.g. Muhammad Waqas"
                                            className="w-full m3-input text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Mobile / WhatsApp Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerPhone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, customerPhone: e.target.value })
                                            }
                                            placeholder="e.g. 0343-8483919"
                                            className="w-full m3-input text-sm font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            CNIC (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customerCnic}
                                            onChange={(e) =>
                                                setFormData({ ...formData, customerCnic: e.target.value })
                                            }
                                            placeholder="34301-xxxxxxx-x"
                                            className="w-full m3-input text-sm font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            City / Address (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customerAddress}
                                            onChange={(e) =>
                                                setFormData({ ...formData, customerAddress: e.target.value })
                                            }
                                            placeholder="Mandi Bahauddin"
                                            className="w-full m3-input text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Device Details */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Laptop className="w-3.5 h-3.5 text-blue-600" />
                                    2. Device Specifications
                                </span>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Device Category *
                                        </label>
                                        <select
                                            value={formData.deviceType}
                                            onChange={(e) =>
                                                setFormData({ ...formData, deviceType: e.target.value })
                                            }
                                            className="w-full m3-input text-sm"
                                        >
                                            {DEVICE_TYPES.map((dt) => (
                                                <option key={dt.label} value={dt.label}>
                                                    {dt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Brand / Manufacturer
                                        </label>
                                        <input
                                            type="text"
                                            list="brand-suggestions"
                                            value={formData.deviceBrand}
                                            onChange={(e) =>
                                                setFormData({ ...formData, deviceBrand: e.target.value })
                                            }
                                            placeholder="Dell, HP, Lenovo, Apple..."
                                            className="w-full m3-input text-sm"
                                        />
                                        <datalist id="brand-suggestions">
                                            {DEVICE_BRANDS.map((b) => (
                                                <option key={b} value={b} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Model / Generation
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.deviceModel}
                                            onChange={(e) =>
                                                setFormData({ ...formData, deviceModel: e.target.value })
                                            }
                                            placeholder="ThinkPad T480, Latitude 5490..."
                                            className="w-full m3-input text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Serial Number / Service Tag
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.serialNumber}
                                            onChange={(e) =>
                                                setFormData({ ...formData, serialNumber: e.target.value })
                                            }
                                            placeholder="S/N or Tag"
                                            className="w-full m3-input text-sm font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                            <Key className="w-3 h-3 text-slate-400" />
                                            Device PIN / Password
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.devicePassword}
                                            onChange={(e) =>
                                                setFormData({ ...formData, devicePassword: e.target.value })
                                            }
                                            placeholder="Needed for technician testing"
                                            className="w-full m3-input text-sm font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Priority Level
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) =>
                                                setFormData({ ...formData, priority: e.target.value })
                                            }
                                            className="w-full m3-input text-sm font-bold text-blue-700"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High (Urgent)</option>
                                            <option value="URGENT">Critical (Same Day)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Accessories Checklist */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Accessories Received With Device:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ACCESSORIES_OPTIONS.map((acc) => {
                                            const isSelected = formData.accessoriesIncluded.includes(acc);
                                            return (
                                                <button
                                                    type="button"
                                                    key={acc}
                                                    onClick={() => toggleAccessory(acc)}
                                                    className={cn(
                                                        "text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-medium",
                                                        isSelected
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                                    )}
                                                >
                                                    {isSelected && "✓ "}
                                                    {acc}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Condition Notes */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Pre-existing Physical Condition / Damage Notes
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.conditionNotes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, conditionNotes: e.target.value })
                                        }
                                        placeholder="e.g. Scratches on back lid, cracked hinge, missing screw"
                                        className="w-full m3-input text-sm"
                                    />
                                </div>
                            </div>

                            {/* Section 3: Fault & Diagnostics */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                                    3. Fault Description & Diagnostics
                                </span>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Customer Reported Problem *
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={formData.problemDescription}
                                        onChange={(e) =>
                                            setFormData({ ...formData, problemDescription: e.target.value })
                                        }
                                        placeholder="e.g. Laptop shuts down after 5 minutes, screen flickering, charging port loose..."
                                        className="w-full m3-input text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Assigned Technician
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.technicianName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, technicianName: e.target.value })
                                            }
                                            placeholder="e.g. Master Ali"
                                            className="w-full m3-input text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Estimated Completion Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expectedDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, expectedDate: e.target.value })
                                            }
                                            className="w-full m3-input text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Cost & Advance Paid */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                                    4. Cost Estimate & Advance Payment
                                </span>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Estimated Cost (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.estimatedCost}
                                            onChange={(e) =>
                                                setFormData({ ...formData, estimatedCost: e.target.value })
                                            }
                                            placeholder="e.g. 3500"
                                            className="w-full m3-input text-sm font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Advance Paid (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.paidAmount}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paidAmount: e.target.value })
                                            }
                                            placeholder="e.g. 1000"
                                            className="w-full m3-input text-sm font-semibold text-emerald-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Payment Method
                                        </label>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentMethod: e.target.value })
                                            }
                                            className="w-full m3-input text-sm"
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="EASYPAISA">EasyPaisa / JazzCash</option>
                                            <option value="BANK">Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                    <span>Create Ticket & Print Job Sheet</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* EDIT & PROGRESSION MODAL                             */}
            {/* ==================================================== */}
            {isEditOpen && selectedRepair && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="rounded-3xl bg-white max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 border border-slate-200/80">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <span className="font-mono text-blue-600 font-black text-xl">
                                        {selectedRepair.ticketNumber}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-xs px-3 py-1 rounded-full font-bold uppercase",
                                            STATUS_CONFIG[editData.status]?.bg,
                                            STATUS_CONFIG[editData.status]?.text
                                        )}
                                    >
                                        {STATUS_CONFIG[editData.status]?.label}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Customer: <strong className="text-slate-800">{editData.customerName}</strong> • Phone: {editData.customerPhone}
                                </p>
                            </div>

                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Status Progression Stepper */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Update Repair Lifecycle Stage:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    "RECEIVED",
                                    "DIAGNOSING",
                                    "WAITING_FOR_PARTS",
                                    "IN_PROGRESS",
                                    "READY",
                                    "DELIVERED",
                                    "UNREPAIRABLE",
                                    "CANCELLED",
                                ].map((st) => {
                                    const isCurrent = editData.status === st;
                                    const meta = STATUS_CONFIG[st];
                                    return (
                                        <button
                                            type="button"
                                            key={st}
                                            onClick={() => setEditData({ ...editData, status: st })}
                                            className={cn(
                                                "p-2.5 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5",
                                                isCurrent
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                            )}
                                        >
                                            {isCurrent && "✓ "}
                                            {meta.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Update Form */}
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Diagnostics & Technician Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Diagnostic Findings / Work Done Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={editData.diagnosticsNotes || ""}
                                    onChange={(e) =>
                                        setEditData({ ...editData, diagnosticsNotes: e.target.value })
                                    }
                                    placeholder="Explain work performed (e.g. Replaced display cable, reballed GPU, applied thermal paste, installed fresh Windows)..."
                                    className="w-full m3-input text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Assigned Technician
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.technicianName || ""}
                                        onChange={(e) =>
                                            setEditData({ ...editData, technicianName: e.target.value })
                                        }
                                        className="w-full m3-input text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Expected Completion Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editData.expectedDate || ""}
                                        onChange={(e) =>
                                            setEditData({ ...editData, expectedDate: e.target.value })
                                        }
                                        className="w-full m3-input text-sm"
                                    />
                                </div>
                            </div>

                            {/* Financial breakdown */}
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                    Billing, Parts & Payment Settlement
                                </span>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-600 font-medium mb-1">
                                            Parts Cost (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.partCost || 0}
                                            onChange={(e) => {
                                                const p = Number(e.target.value);
                                                const l = Number(editData.laborCost || 0);
                                                setEditData({
                                                    ...editData,
                                                    partCost: p,
                                                    finalAmount: p + l,
                                                });
                                            }}
                                            className="w-full m3-input text-sm font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-600 font-medium mb-1">
                                            Labor Charge (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.laborCost || 0}
                                            onChange={(e) => {
                                                const l = Number(e.target.value);
                                                const p = Number(editData.partCost || 0);
                                                setEditData({
                                                    ...editData,
                                                    laborCost: l,
                                                    finalAmount: p + l,
                                                });
                                            }}
                                            className="w-full m3-input text-sm font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-600 font-medium mb-1">
                                            Final Bill (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.finalAmount || 0}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    finalAmount: Number(e.target.value),
                                                })
                                            }
                                            className="w-full m3-input text-sm font-black text-blue-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-600 font-medium mb-1">
                                            Total Paid (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.paidAmount || 0}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    paidAmount: Number(e.target.value),
                                                })
                                            }
                                            className="w-full m3-input text-sm font-black text-emerald-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                    <span className="text-xs font-bold text-slate-700">
                                        Remaining Customer Balance:
                                    </span>
                                    <span
                                        className={cn(
                                            "text-base font-black font-mono",
                                            Math.max(
                                                0,
                                                Number(editData.finalAmount || 0) -
                                                    Number(editData.paidAmount || 0)
                                            ) > 0
                                                ? "text-rose-600"
                                                : "text-emerald-600"
                                        )}
                                    >
                                        Rs.{" "}
                                        {Math.max(
                                            0,
                                            Number(editData.finalAmount || 0) -
                                                Number(editData.paidAmount || 0)
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => handlePrint(selectedRepair)}
                                    className="px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print Claim Ticket</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(false)}
                                        className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* PRINT CLAIM TICKET / JOB SHEET MODAL                */}
            {/* ==================================================== */}
            {isPrintOpen && selectedRepair && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white max-w-[340px] w-full p-4 shadow-2xl relative space-y-3 my-8 border border-slate-900">
                        {/* Action buttons on top (hidden in print) */}
                        <div className="flex items-center justify-between print:hidden border-b border-slate-200 pb-2.5">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                                80mm Receipt Preview
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={triggerPrint}
                                    className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={() => setIsPrintOpen(false)}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Receipt Content */}
                        <div
                            ref={printRef}
                            id="printable-repair-receipt"
                            className="text-slate-900 font-sans text-[10px] space-y-2.5 p-1 bg-white"
                        >
                            {/* Store Header */}
                            <div className="text-center pb-2 border-b-2 border-slate-900">
                                {branding?.logo && (
                                    <img
                                        src={branding.logo}
                                        alt={branding.businessName}
                                        className="h-14 max-w-full object-contain mx-auto mb-1"
                                    />
                                )}
                                <h1 className="text-base font-black tracking-tight text-slate-900">
                                    {branding.businessName || "CGS COMPUTERS"}
                                </h1>
                                <p className="text-[9px] text-slate-600 mt-0.5">
                                    {branding.address || "Near Post Office Mandi Bahauddin"}
                                </p>
                                <p className="text-[9px] font-bold text-slate-800">
                                    Phone: {branding.phoneNumbers || "0343-8483919 / 0333-8483919"}
                                </p>
                                <div className="mt-1 inline-block px-2.5 py-0.5 border border-slate-900 font-black text-[9px] uppercase tracking-wider">
                                    Repair Claim / Job Sheet
                                </div>
                            </div>

                            {/* Ticket Info */}
                            <div className="flex justify-between items-center text-[10px] border-b border-dashed border-slate-300 pb-2">
                                <div>
                                    <p className="font-bold">
                                        Ticket: <span className="font-mono text-xs">{selectedRepair.ticketNumber}</span>
                                    </p>
                                    <p className="text-slate-500 text-[9px]">
                                        {new Date(selectedRepair.receivedDate || Date.now()).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={cn(
                                            "inline-block px-2 py-0.5 text-[9px] font-bold uppercase",
                                            STATUS_CONFIG[selectedRepair.status]?.bg,
                                            STATUS_CONFIG[selectedRepair.status]?.text
                                        )}
                                    >
                                        {STATUS_CONFIG[selectedRepair.status]?.label}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-slate-50 p-2 border border-slate-200 text-[10px] space-y-0.5">
                                <p>
                                    <strong>Customer:</strong> {selectedRepair.customerName}
                                </p>
                                <p>
                                    <strong>Phone:</strong> {selectedRepair.customerPhone}
                                </p>
                                {selectedRepair.customerAddress && (
                                    <p>
                                        <strong>Address:</strong> {selectedRepair.customerAddress}
                                    </p>
                                )}
                            </div>

                            {/* Device Info */}
                            <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Device:</span>
                                    <span className="font-bold">
                                        {selectedRepair.deviceBrand} {selectedRepair.deviceModel || selectedRepair.deviceType}
                                    </span>
                                </div>
                                {selectedRepair.serialNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Serial/Tag:</span>
                                        <span className="font-mono">{selectedRepair.serialNumber}</span>
                                    </div>
                                )}
                                {selectedRepair.accessoriesIncluded && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Accessories:</span>
                                        <span>{Array.isArray(selectedRepair.accessoriesIncluded) ? selectedRepair.accessoriesIncluded.join(', ') : selectedRepair.accessoriesIncluded}</span>
                                    </div>
                                )}
                                {selectedRepair.conditionNotes && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Condition:</span>
                                        <span>{selectedRepair.conditionNotes}</span>
                                    </div>
                                )}
                            </div>

                            {/* Fault / Problem */}
                            <div className="border-b border-dashed border-slate-300 pb-2 text-[10px]">
                                <span className="font-bold text-slate-700 block">Reported Fault:</span>
                                <p className="text-slate-800 bg-slate-50 p-1.5 border border-slate-200 mt-0.5 text-[9.5px]">
                                    {selectedRepair.problemDescription || 'Diagnosis & Repair Servicing'}
                                </p>
                            </div>

                            {/* Financial Summary */}
                            <div className="pt-1 space-y-1 text-[10px]">
                                <div className="flex justify-between">
                                    <span>Estimated / Total Bill:</span>
                                    <span className="font-bold">
                                        Rs. {Number(selectedRepair.finalAmount || selectedRepair.estimatedCost || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Advance Paid:</span>
                                    <span>Rs. {Number(selectedRepair.paidAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-black text-xs border-t-2 border-b-2 border-slate-900 py-1 mt-1">
                                    <span>BALANCE PAYABLE:</span>
                                    <span>Rs. {Number(selectedRepair.balance || (Number(selectedRepair.finalAmount || selectedRepair.estimatedCost || 0) - Number(selectedRepair.paidAmount || 0))).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Terms & Conditions Notice */}
                            <div className="pt-2 text-[8px] text-slate-600 space-y-1">
                                <p className="font-bold text-slate-800 uppercase">TERMS & CONDITIONS:</p>
                                <p className="whitespace-pre-line leading-relaxed">
                                    {branding?.receiptNote || "1. Please present this original claim slip when receiving your device.\n2. Checking warranty 7 days after delivery.\n3. Shop not responsible for data loss."}
                                </p>
                            </div>

                            {/* Signature lines */}
                            <div className="flex justify-between pt-5 text-[9px] text-slate-600">
                                <div className="text-center">
                                    <div className="w-20 border-b border-slate-400 mb-1" />
                                    <span>Customer Sign</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 border-b border-slate-400 mb-1" />
                                    <span>Technician Stamp</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-2 text-center text-[8px] text-slate-500 font-semibold">
                                {branding?.others || "RapidTechPro POS & Repair System"}
                            </div>
                        </div>
                    </div>
                </div>
            )}        </div>
    );
}
