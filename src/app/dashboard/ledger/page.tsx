"use client";

import { useState, useEffect, useRef } from "react";
import {
    BookOpen,
    Search,
    User,
    Printer,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    X,
    ChevronDown,
    Phone,
    CreditCard,
    CheckCircle2,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";

export default function LedgerPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [ledger, setLedger] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const customerContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => setCustomers(Array.isArray(data) ? data : []));
    }, []);

    // Close customer dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                customerContainerRef.current &&
                !customerContainerRef.current.contains(e.target as Node)
            ) {
                setShowCustomerDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchLedger = async (id: string) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/ledger?customerId=${id}`);
            const data = await res.json();
            setLedger(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCustomerId) {
            fetchLedger(selectedCustomerId);
        } else {
            setLedger([]);
        }
    }, [selectedCustomerId]);

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

    const filteredCustomers = customers.filter((c) => {
        const query = customerSearch.toLowerCase().trim();
        if (!query) return true;
        return (
            c.name.toLowerCase().includes(query) ||
            (c.contact && c.contact.toLowerCase().includes(query)) ||
            (c.cnic && c.cnic.toLowerCase().includes(query))
        );
    });

    const handleSelectCustomer = (customer: any) => {
        setSelectedCustomerId(customer.id);
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
    };

    const handleClearCustomer = () => {
        setSelectedCustomerId("");
        setCustomerSearch("");
        setLedger([]);
        setShowCustomerDropdown(false);
    };

    const printLedger = () => {
        if (!selectedCustomer || ledger.length === 0) return;

        const printWindow = window.open("", "_blank", "width=800,height=1000");
        if (!printWindow) return;

        const totalDebit = ledger.reduce((sum, e) => sum + Number(e.debit || 0), 0);
        const totalCredit = ledger.reduce((sum, e) => sum + Number(e.credit || 0), 0);

        const ledgerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Customer Ledger - ${selectedCustomer.name}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #0f172a; margin: 0; padding: 15px; background: white; }
                    .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
                    .header h1 { font-size: 24px; margin: 0 0 4px 0; font-weight: 900; letter-spacing: -0.5px; }
                    .header p { margin: 0; font-size: 11px; color: #64748b; }
                    .customer-info { background: #f8fafc; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; }
                    .customer-info h2 { margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #2563eb; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
                    .info-row { display: flex; justify-content: space-between; }
                    .info-row .label { font-weight: 600; color: #64748b; }
                    .info-row .value { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background: #0f172a; color: white; padding: 8px; text-align: left; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .debit { color: #059669; font-weight: bold; }
                    .credit { color: #dc2626; font-weight: bold; }
                    .footer { margin-top: 35px; padding-top: 15px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>CGS COMPUTERS</h1>
                    <p>Near Post Office Mandi Bahauddin • 0343-8483919 / 0333-8483919</p>
                    <p style="font-size: 12px; font-weight: bold; margin-top: 5px; color: #2563eb;">CUSTOMER AUDIT LEDGER STATEMENT</p>
                </div>

                <div class="customer-info">
                    <h2>${selectedCustomer.name}</h2>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Contact:</span> <span class="value">${selectedCustomer.contact || "—"}</span></div>
                        <div class="info-row"><span class="label">Current Balance:</span> <span class="value" style="color: ${Number(selectedCustomer.balance) > 0 ? '#dc2626' : '#059669'};">RS ${Number(selectedCustomer.balance).toFixed(2)}</span></div>
                        <div class="info-row"><span class="label">CNIC / ID:</span> <span class="value">${selectedCustomer.cnic || "—"}</span></div>
                        <div class="info-row"><span class="label">Address:</span> <span class="value">${selectedCustomer.address || "—"}</span></div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Date</th>
                            <th style="width: 45%;">Description / Ref</th>
                            <th class="text-right" style="width: 13%;">Debit (Paid)</th>
                            <th class="text-right" style="width: 13%;">Credit (Bill)</th>
                            <th class="text-right" style="width: 14%;">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ledger.map((entry) => `
                            <tr>
                                <td>${new Date(entry.date).toLocaleDateString()}</td>
                                <td>
                                    <strong>${entry.description}</strong>
                                    ${entry.sale ? ` <span style="font-family: monospace; font-size: 9px; color: #2563eb;">(${entry.sale.billNumber})</span>` : ""}
                                </td>
                                <td class="text-right debit">${Number(entry.debit) > 0 ? Number(entry.debit).toFixed(2) : "—"}</td>
                                <td class="text-right credit">${Number(entry.credit) > 0 ? Number(entry.credit).toFixed(2) : "—"}</td>
                                <td class="text-right"><strong>RS ${Number(entry.balance).toFixed(2)}</strong></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                    <table style="width: 320px; font-size: 11px;">
                        <tr><td style="font-weight: 600;">Total Payments (Debit):</td><td class="text-right debit">RS ${totalDebit.toFixed(2)}</td></tr>
                        <tr><td style="font-weight: 600;">Total Billed (Credit):</td><td class="text-right credit">RS ${totalCredit.toFixed(2)}</td></tr>
                        <tr style="border-top: 2px solid #0f172a;"><td style="font-size: 13px; font-weight: 900;">Closing Balance:</td><td class="text-right" style="font-size: 13px; font-weight: 900; color: ${Number(selectedCustomer.balance) > 0 ? '#dc2626' : '#059669'};">RS ${Number(selectedCustomer.balance).toFixed(2)}</td></tr>
                    </table>
                </div>

                <div class="footer">
                    <p>Official Computer-Generated Ledger • CGS Computers Mandi Bahauddin</p>
                    <p>Printed on: ${new Date().toLocaleString()}</p>
                </div>

                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(ledgerHTML);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Print Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        Customer Ledger
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Comprehensive account statement, payment history, and credit balance audit.
                    </p>
                </div>
                <button
                    onClick={printLedger}
                    disabled={!selectedCustomerId || ledger.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-40 shadow-xs cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Print Ledger Statement</span>
                </button>
            </div>

            {/* Filterable Customer Search Dropdown */}
            <div className="flex flex-col sm:flex-row gap-4 no-print" ref={customerContainerRef}>
                <div className="relative flex-1 max-w-xl">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 pl-0.5">
                        Select Customer Account
                    </label>

                    <div className="relative flex items-center">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Type customer name, phone number, or CNIC..."
                            className="w-full pl-10 pr-20 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all"
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setShowCustomerDropdown(true);
                            }}
                            onFocus={() => setShowCustomerDropdown(true)}
                        />

                        <div className="absolute right-3 flex items-center gap-1.5">
                            {customerSearch && (
                                <button
                                    onClick={handleClearCustomer}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    title="Clear selection"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <ChevronDown className={cn("w-4 h-4 transition-transform", showCustomerDropdown && "rotate-180")} />
                            </button>
                        </div>
                    </div>

                    {/* Popover Dropdown List */}
                    <AnimatePresence>
                        {showCustomerDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-40 left-0 right-0 top-full mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar"
                            >
                                {filteredCustomers.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-400 font-medium">
                                        No customer found matching "{customerSearch}"
                                    </div>
                                ) : (
                                    filteredCustomers.map((c) => {
                                        const isSelected = c.id === selectedCustomerId;
                                        const hasBalance = Number(c.balance) > 0;
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => handleSelectCustomer(c)}
                                                className={cn(
                                                    "p-3.5 hover:bg-blue-50/50 cursor-pointer flex justify-between items-center transition-colors group",
                                                    isSelected && "bg-blue-50/80 font-bold"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {c.name?.[0]?.toUpperCase() || "C"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs sm:text-sm text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                            {c.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 truncate">
                                                            {c.contact || "No phone"} {c.cnic ? `• ${c.cnic}` : ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0 ml-3">
                                                    <span
                                                        className={cn(
                                                            "text-xs font-bold px-2.5 py-1 rounded-full border",
                                                            hasBalance
                                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        )}
                                                    >
                                                        {formatCurrency(c.balance || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Selected Customer View & Ledger Content */}
            {selectedCustomerId ? (
                <div id="ledger-content" className="space-y-6">
                    {/* Customer Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Customer Account
                            </p>
                            <h3 className="text-xl font-extrabold text-slate-900">{selectedCustomer?.name}</h3>
                            <p className="text-xs font-semibold text-slate-500 mt-1">{selectedCustomer?.contact || "No contact on file"}</p>
                            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed font-medium">
                                {selectedCustomer?.address || "No address provided"}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Cumulative Credit Purchases
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                                {formatCurrency(ledger.reduce((sum, e) => sum + Number(e.credit || 0), 0))}
                            </h3>
                            <p className="text-xs text-rose-700/70 mt-1 font-semibold">
                                Total billed transactions
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Current Ledger Balance
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                {formatCurrency(selectedCustomer?.balance || 0)}
                            </h3>
                            <p className={cn(
                                "text-xs font-bold mt-1",
                                Number(selectedCustomer?.balance) > 0 ? "text-rose-600" : "text-emerald-600"
                            )}>
                                {Number(selectedCustomer?.balance) > 0 ? "Outstanding Receivable Due" : "Settled / In Advance"}
                            </p>
                        </div>
                    </div>

                    {/* Ledger Transactions Table */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                                    Statement of Account
                                </h3>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">
                                Statement for {selectedCustomer?.name} • Generated on {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Description / Ref
                                        </th>
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                            Debit (Received)
                                        </th>
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                            Credit (Sale)
                                        </th>
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                            Running Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                                    <span className="text-xs font-semibold">Loading ledger records...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                                                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                <p className="text-slate-600 font-semibold">No transactions recorded</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">This customer has no prior debit or credit records.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {/* Opening Balance Row */}
                                            <tr className="bg-slate-50/50">
                                                <td className="px-5 py-3 text-slate-400 font-mono">Initial</td>
                                                <td className="px-5 py-3 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                                                    Opening Balance
                                                </td>
                                                <td className="px-5 py-3 text-right text-slate-400">—</td>
                                                <td className="px-5 py-3 text-right text-slate-400">—</td>
                                                <td className="px-5 py-3 text-right font-black text-slate-600">
                                                    {formatCurrency(
                                                        Number(ledger[0]?.balance || 0) -
                                                            Number(ledger[0]?.credit || 0) +
                                                            Number(ledger[0]?.debit || 0)
                                                    )}
                                                </td>
                                            </tr>
                                            {ledger.map((entry: any) => (
                                                <tr
                                                    key={entry.id}
                                                    className="hover:bg-blue-50/30 transition-colors group"
                                                >
                                                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                                                            {entry.description}
                                                        </p>
                                                        {entry.sale && (
                                                            <p className="text-[10px] text-blue-600 font-mono font-bold mt-0.5">
                                                                Bill Ref: {entry.sale.billNumber}
                                                            </p>
                                                        )}
                                                        {entry.saleReturn && (
                                                            <p className="text-[10px] text-rose-600 font-mono font-bold mt-0.5">
                                                                Return Ref: {entry.saleReturn.returnNumber}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {Number(entry.debit) > 0 ? (
                                                            <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-xs sm:text-sm">
                                                                <span>{formatCurrency(entry.debit)}</span>
                                                                <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {Number(entry.credit) > 0 ? (
                                                            <div className="flex items-center justify-end gap-1.5 text-rose-600 font-bold text-xs sm:text-sm">
                                                                <span>{formatCurrency(entry.credit)}</span>
                                                                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80">
                                                            {formatCurrency(entry.balance)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-28 rounded-3xl border-2 border-dashed border-slate-200 bg-white text-slate-400 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-slate-800">Select a Customer Account Above</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Use the search dropdown above to view debit/credit transaction history and print account statements.
                    </p>
                </div>
            )}
        </div>
    );
}
