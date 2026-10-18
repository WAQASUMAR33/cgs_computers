"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, User, FileText, Printer, Eye, X, Filter, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [branding, setBranding] = useState<any>(null);

    useEffect(() => {
        fetchSales();
        fetchCustomers();
        fetch("/api/branding")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.branding) {
                    setBranding(data.branding);
                }
            })
            .catch(() => {});
    }, []);

    const fetchSales = async () => {
        try {
            const res = await fetch("/api/sales");
            const data = await res.json();
            setSales(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/customers");
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
    };

    const resetFilters = () => {
        setSelectedCustomer("");
        setStartDate("");
        setEndDate("");
        setSearchTerm("");
    };

    const filteredSales = sales.filter((sale: any) => {
        const matchesCustomer = !selectedCustomer || sale.customerId === selectedCustomer;
        const matchesSearch = !searchTerm ||
            sale.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const saleDate = new Date(sale.date);
        const matchesStartDate = !startDate || saleDate >= new Date(startDate);
        const matchesEndDate = !endDate || saleDate <= new Date(endDate + "T23:59:59");

        return matchesCustomer && matchesSearch && matchesStartDate && matchesEndDate;
    });

    const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.netTotal), 0);
    const totalPaid = filteredSales.reduce((sum, sale) => sum + Number(sale.paidAmount), 0);
    const totalBalance = filteredSales.reduce((sum, sale) => sum + Number(sale.balance), 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Sales Invoices & Records
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Inspect sales transactions, audit invoice balances, and reprint customer thermal/A4 bills.
                    </p>
                </div>
                {(searchTerm || selectedCustomer || startDate || endDate) && (
                    <button
                        onClick={resetFilters}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-slate-50 transition-all self-start sm:self-auto cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear Filters</span>
                    </button>
                )}
            </div>

            {/* Modern Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Billed</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(totalSales)}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">{filteredSales.length} transactions filtered</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cash Collected</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{formatCurrency(totalPaid)}</p>
                    <p className="text-xs font-semibold text-emerald-700/70 mt-1">Cash & card collections</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Receivable</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{formatCurrency(totalBalance)}</p>
                    <p className="text-xs font-semibold text-rose-700/70 mt-1">Pending customer credit due</p>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        <span>Filter & Search Invoices</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                        Showing {filteredSales.length} of {sales.length} records
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Search */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Search Bill / Customer
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search Bill # or Name..."
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Customer Filter */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Customer Account
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <select
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all"
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                            >
                                <option value="">All Customer Accounts</option>
                                {customers.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            From Date
                        </label>
                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="date"
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            To Date
                        </label>
                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="date"
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs sm:text-sm font-medium text-slate-900 transition-all"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bill #</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Net Total</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Paid</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-xs font-semibold text-slate-400">Loading sales records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-slate-400 font-medium">
                                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm font-semibold text-slate-600">No sales records found</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Try altering your search or date criteria.</p>
                                    </td>
                                </tr>
                            ) : filteredSales.map((sale: any) => {
                                const isFullyPaid = Number(sale.balance) <= 0;
                                return (
                                    <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                {sale.billNumber}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                                            {new Date(sale.date).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {sale.customer?.name?.[0]?.toUpperCase() || "W"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">
                                                        {sale.customer?.name || "Walk-in Customer"}
                                                    </p>
                                                    {sale.customer?.contact && (
                                                        <p className="text-[10px] text-slate-400">{sale.customer.contact}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                sale.type === "WHOLESALE"
                                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                            )}>
                                                {sale.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-xs text-slate-900">
                                            {formatCurrency(sale.netTotal)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-emerald-600 font-bold text-xs">
                                            {formatCurrency(sale.paidAmount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold text-xs">
                                            <span className={isFullyPaid ? "text-slate-400" : "text-rose-600"}>
                                                {formatCurrency(sale.balance)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setSelectedSale(sale)}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 transition-all cursor-pointer"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => reprintReceipt(sale, branding)}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-all cursor-pointer"
                                                    title="Quick Print Receipt"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedSale && (
                    <SaleDetailsModal
                        sale={selectedSale}
                        branding={branding}
                        onClose={() => setSelectedSale(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function reprintReceipt(sale: any, branding?: any) {
    const bizName = branding?.businessName || "CGS COMPUTERS";
    const bizAddress = branding?.address || "Near Post Office Mandi Bahauddin";
    const bizPhones = branding?.phoneNumbers || "0343-8483919 / 0333-8483919";
    const receiptNotes = branding?.receiptNote ? branding.receiptNote.replace(/\n/g, '<br>') : "No return after sale. Exchange within 7 days with bill.";
    const footerOthers = branding?.others ? branding.others.replace(/\n/g, '<br>') : "Thank You For Visiting!";
    const logoUrl = branding?.logo ? (branding.logo.startsWith('http') || branding.logo.startsWith('data:') ? branding.logo : window.location.origin + branding.logo) : '';

    const itemsGross = sale.items?.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0) || Number(sale.total || 0);
    const totalItemDiscounts = sale.items?.reduce((sum: number, item: any) => sum + (Number(item.discount) || 0), 0) || 0;
    const totalDiscount = Number(sale.discount || 0);
    const isWholesale = sale.type === 'WHOLESALE';

    const printWindow = window.open('', '_blank', 'width=380,height=700');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${sale.billNumber}</title>
    <style>
        @page { size: 80mm auto; margin: 3mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, -apple-system, sans-serif; font-size: 10px; width: 72mm; margin: 0 auto; padding: 2px 2px; color: #000; font-weight: 600; line-height: 1.3; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .header { text-align: center; margin-bottom: 6px; }
        .header img { height: 80px; max-width: 100%; object-fit: contain; margin: 0 auto 4px auto; display: block; }
        .biz-title { font-weight: 900; font-size: 14px; margin: 2px 0; }
        .header p { margin: 1px 0; font-size: 9px; font-weight: 600; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .divider-double { border-top: 2px dashed #000; margin: 6px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 9.5px; }
        table { width: 100%; border-collapse: collapse; margin: 5px 0; }
        th { font-weight: 800; text-transform: uppercase; font-size: 9px; padding: 3px 1px; border-bottom: 1px dashed #000; }
        td { padding: 3px 1px; font-size: 9px; vertical-align: top; }
        .total-row { display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; }
        .total-row.grand { font-size: 13px; font-weight: 900; margin: 4px 0; }
        .footer { text-align: center; margin-top: 8px; font-size: 8.5px; }
        .footer p { margin: 2px 0; }
    </style>
</head>
<body>
    <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="${bizName}" />` : ''}
        <div class="biz-title">${bizName.toUpperCase()}</div>
        <p>${bizAddress}</p>
        <p>${bizPhones}</p>
        ${isWholesale ? '<div style="display:inline-block; border: 1.5px solid #000; padding: 1px 6px; font-weight: 900; font-size: 9px; margin-top: 3px;">WHOLESALE TAX INVOICE</div>' : ''}
    </div>
    <div class="divider"></div>
    <div class="info-row"><span>Receipt #:</span><span style="font-family: monospace; font-weight: 800;">${sale.billNumber}</span></div>
    <div class="info-row"><span>Date:</span><span>${new Date(sale.date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
    <div class="info-row"><span>Customer:</span><span>${sale.customer?.name || 'Walk-in'}${sale.customer?.contact || sale.customer?.phone ? ` (${sale.customer.contact || sale.customer.phone})` : ''}</span></div>
    <div class="info-row"><span>Cashier:</span><span>Admin</span></div>
    <div class="divider"></div>
    <table>
        <thead>
            <tr>
                <th style="text-align: left;">ITEM</th>
                <th class="text-center" style="width: 10%;">QTY</th>
                <th class="text-right" style="width: 22%;">PRICE</th>
                <th class="text-right" style="width: 18%;">DISC</th>
                <th class="text-right" style="width: 24%;">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            ${(sale.items || []).map((it: any) => {
                const itemPrice = Number(it.price);
                const itemQty = Number(it.quantity);
                const itemDiscount = Number(it.discount || 0);
                const itemTotal = (itemPrice * itemQty) - itemDiscount;
                return `
                    <tr>
                        <td style="text-align: left; word-break: break-word;">${it.name}</td>
                        <td class="text-center">${itemQty}</td>
                        <td class="text-right">${itemPrice.toFixed(0)}</td>
                        <td class="text-right">${itemDiscount.toFixed(0)}</td>
                        <td class="text-right">${itemTotal.toFixed(0)}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
    <div class="divider"></div>
    <div class="total-row"><span>Gross Subtotal:</span><span>Rs. ${itemsGross.toFixed(2)}</span></div>
    ${totalDiscount > 0 ? `<div class="total-row"><span>Total Discount:</span><span>- Rs. ${totalDiscount.toFixed(2)}</span></div>` : ''}
    <div class="divider-double"></div>
    <div class="total-row grand"><span>NET TOTAL:</span><span>Rs. ${Number(sale.netTotal).toFixed(2)}</span></div>
    <div class="divider-double"></div>
    <div class="total-row"><span>Paid Amount:</span><span>Rs. ${Number(sale.paidAmount).toFixed(2)}</span></div>
    ${Number(sale.balance) > 0 ? `<div class="total-row" style="color: #c00;"><span>Balance Due:</span><span>Rs. ${Number(sale.balance).toFixed(2)}</span></div>` : ''}
    <div class="divider"></div>
    <div class="footer">
        <p style="margin-bottom: 4px; line-height: 1.35;">${receiptNotes}</p>
        <div class="divider"></div>
        <p style="font-size: 8px; margin-top: 3px;">${footerOthers}</p>
    </div>
    <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
</body>
</html>`);
    printWindow.document.close();
}

function SaleDetailsModal({ sale, branding, onClose }: { sale: any, branding?: any, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col z-10"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                {sale.billNumber}
                            </span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                sale.balance > 0
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            )}>
                                {sale.balance > 0 ? "Credit / Due" : "Paid in Full"}
                            </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">Sale Invoice Breakdown</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                            <p className="font-bold text-xs sm:text-sm text-slate-800 mt-0.5">{new Date(sale.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                            <p className="font-bold text-xs sm:text-sm text-slate-800 mt-0.5">{sale.customer?.name || 'Walk-in'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Type</p>
                            <p className="font-bold text-xs sm:text-sm text-slate-800 capitalize mt-0.5">{sale.type.toLowerCase()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Status</p>
                            <p className={`font-bold text-xs sm:text-sm mt-0.5 ${sale.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {sale.balance > 0 ? formatCurrency(sale.balance) : 'Nil'}
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Itemized Products</h4>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2.5 font-bold text-slate-500">Product</th>
                                        <th className="px-4 py-2.5 font-bold text-slate-500 text-center">Qty</th>
                                        <th className="px-4 py-2.5 font-bold text-slate-500 text-right">Price</th>
                                        <th className="px-4 py-2.5 font-bold text-slate-500 text-right">Disc</th>
                                        <th className="px-4 py-2.5 font-bold text-slate-500 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sale.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2.5 font-bold text-slate-800">{item.name}</td>
                                            <td className="px-4 py-2.5 text-center text-slate-600 font-medium">{item.quantity}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                            <td className="px-4 py-2.5 text-right text-rose-600">
                                                {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '—'}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-black text-slate-900">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="flex justify-end pt-2">
                        <div className="w-72 space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Gross Subtotal</span>
                                <span className="font-bold text-slate-900">{formatCurrency(sale.total)}</span>
                            </div>
                            {Number(sale.discount) > 0 && (
                                <div className="flex justify-between text-xs text-rose-600">
                                    <span>Discount Deducted</span>
                                    <span>-{formatCurrency(sale.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-black border-t border-slate-200 pt-2 mt-2 text-slate-900">
                                <span>Net Total</span>
                                <span className="text-blue-600">{formatCurrency(sale.netTotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-emerald-600 font-bold">
                                <span>Paid Amount</span>
                                <span>{formatCurrency(sale.paidAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-rose-600 font-bold">
                                <span>Outstanding Balance</span>
                                <span>{formatCurrency(sale.balance)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={() => reprintReceipt(sale, branding)}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print Bill</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
