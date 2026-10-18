"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    Calendar,
    User,
    DollarSign,
    CreditCard,
    MessageSquare,
    History,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [payRes, custRes] = await Promise.all([
                fetch("/api/payments"),
                fetch("/api/customers")
            ]);
            const paymentsData = await payRes.json();
            const customersData = await custRes.json();
            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
            setCustomers(Array.isArray(customersData) ? customersData : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Payments & Receipts</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage incoming payments, settlement vouchers, and cash receipts.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Wallet className="w-4 h-4" />
                    <span>Collect Payment</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                            <History className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-700">Payment History</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{payments.length} Records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/75">
                                    <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                                    <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                                                <span className="text-xs font-medium">Loading history...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                ) : payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                                                    {payment.customer?.name?.[0]?.toUpperCase() || "C"}
                                                </div>
                                                <span className="font-semibold text-slate-900">{payment.customer?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200">
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{payment.remarks || "—"}</td>
                                        <td className="px-6 py-4 text-right font-extrabold text-emerald-700 text-sm">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-sm relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-28 h-28 opacity-5 text-emerald-600 pointer-events-none" />
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Total Collections</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                            {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 font-medium">All recorded customer receipts</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <PaymentModal
                        customers={customers}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => { setIsModalOpen(false); fetchData(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function PaymentModal({ customers, onClose, onSubmit }: { customers: any[], onClose: () => void, onSubmit: () => void }) {
    const [formData, setFormData] = useState<any>({
        customerId: "",
        amount: "",
        method: "Cash",
        remarks: "",
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    const printReceipt = (payment: any) => {
        const printWindow = window.open('', '_blank', 'width=300,height=600');
        if (!printWindow) return;

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Payment Receipt - ${payment.id}</title>
                <style>
                    @page {
                        size: 80mm auto;
                        margin: 5mm;
                    }
                    body {
                        font-family: 'Arial', 'Helvetica', sans-serif;
                        font-size: 12px;
                        line-height: 1.3;
                        color: black;
                        font-weight: bold;
                        margin: 0;
                        padding: 8px;
                        background: white;
                    }
                    * {
                        color: black !important;
                        font-weight: bold !important;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 8px;
                    }
                    .header h1 {
                        font-size: 16px;
                        margin: 0 0 2px 0;
                        font-weight: bold;
                        letter-spacing: 2px;
                    }
                    .header p {
                        margin: 0;
                        font-size: 9px;
                    }
                    .divider {
                        border-top: 1px dashed black;
                        margin: 6px 0;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                        font-size: 11px;
                    }
                    .label {
                        font-weight: normal;
                    }
                    .value {
                        text-align: right;
                        font-weight: bold;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 8px;
                        padding-top: 8px;
                        border-top: 2px solid black;
                        font-size: 14px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${window.location.origin}/libertycollection.png" alt="CGS Computers" style="height: 120px; margin-bottom: 5px;" />
                    <p>Near Post Office Mandi Bahauddin</p>
                    <p>0343-8483919 / 0333-8483919</p>
                    <div class="divider"></div>
                    <h2 style="font-size: 14px; margin: 5px 0;">PAYMENT RECEIPT</h2>
                </div>

                <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">${new Date(payment.date).toLocaleString('en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                    })}</span>
                </div>
                <div class="info-row">
                    <span class="label">Receipt #:</span>
                    <span class="value">${payment.id.slice(-6).toUpperCase()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Customer:</span>
                    <span class="value">${payment.customer.name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Method:</span>
                    <span class="value">${payment.method}</span>
                </div>
                ${payment.remarks ? `
                <div class="info-row">
                    <span class="label">Remarks:</span>
                    <span class="value">${payment.remarks}</span>
                </div>
                ` : ''}

                <div class="divider"></div>

                <div class="total-row">
                    <span>AMOUNT RECEIVED:</span>
                    <span>${Number(payment.amount).toFixed(2)}</span>
                </div>
                
                <div class="info-row" style="margin-top: 5px;">
                    <span class="label">Balance Due:</span>
                    <span class="value">${Number(payment.customer.balance).toFixed(2)}</span>
                </div>

                <div class="footer">
                    <p>Powered By RapidTechPro</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!formData.customerId || !formData.amount) return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Failed to process payment");
            const payment = await res.json();
            printReceipt(payment);
            onSubmit();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xl space-y-6"
            >
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Record Customer Payment</h3>
                            <p className="text-xs text-slate-400">Issue an official payment receipt</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">Select Customer <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-semibold text-slate-900 shadow-xs"
                                value={formData.customerId}
                                onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                            >
                                <option value="" disabled>Choose a customer...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} (Balance: {formatCurrency(c.balance)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">Amount Received (RS) <span className="text-rose-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-black text-lg text-emerald-700 shadow-xs"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">Receipt Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-slate-900 shadow-xs"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">Payment Method</label>
                        <div className="flex gap-2">
                            {["Cash", "Bank", "Cheque"].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, method: m })}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                        formData.method === m
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>{m}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-slate-700 block mb-1.5">Remarks / Reference</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            <textarea
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all h-20 resize-none font-medium text-slate-900 shadow-xs"
                                placeholder="Payment for invoice #..."
                                value={formData.remarks}
                                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Wallet className="w-4 h-4" />}
                            <span>Confirm Receipt</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
