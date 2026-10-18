"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Printer,
    CreditCard,
    CheckCircle2,
    User,
    Percent,
    Search,
    RotateCcw,
    Sparkles,
    UserPlus,
    X,
    FileText,
    ArrowRight,
    Tag,
    DollarSign,
    Box,
    Barcode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export default function POSPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-semibold text-foreground/50">Loading Point of Sale...</p>
            </div>
        }>
            <POSContent />
        </Suspense>
    );
}

function POSContent() {
    const searchParams = useSearchParams();
    const quotationId = searchParams.get("quotationId");

    // Main Mode: SALE | QUOTATION | RETURN
    const [activeMode, setActiveMode] = useState<"SALE" | "QUOTATION" | "RETURN">("SALE");
    const [billType, setBillType] = useState<"RETAIL" | "WHOLESALE">("RETAIL");

    // Master Data
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

    // New Customer Form State
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerContact, setNewCustomerContact] = useState("");
    const [newCustomerAddress, setNewCustomerAddress] = useState("");
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    // Common Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [cart, setCart] = useState<any[]>([]);
    const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
    const [billDiscountValue, setBillDiscountValue] = useState<number>(0);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [remarks, setRemarks] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Product Search & Adding
    const [productQuery, setProductQuery] = useState("");
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [itemDiscount, setItemDiscount] = useState<number>(0);

    // Sale Return Specific State
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
    const [foundInvoice, setFoundInvoice] = useState<any>(null);
    const [returnItems, setReturnItems] = useState<any[]>([]); // items selected for return
    const [returnPayoutMethod, setReturnPayoutMethod] = useState<"ACCOUNT" | "CASH">("ACCOUNT");
    const [isSearchingInvoice, setIsSearchingInvoice] = useState(false);

    // Receipt Modal State
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [lastReturn, setLastReturn] = useState<any>(null);

    // Store Branding State (for dynamic print headers and receipt notes)
    const [storeBranding, setStoreBranding] = useState({
        logo: "/libertycollection.png",
        businessName: "CGS Computers",
        description: "Computer Sales, Hardware & Repair Specialists",
        address: "Near Post Office Mandi Bahauddin",
        phoneNumbers: "0343-8483919 / 0333-8483919",
        receiptNote: "No item can be returned after sale.<br>Items can be exchanged only within 7 days of purchase.<br>Receipt must be presented for exchange.",
        others: "For queries: 0343-8483919 / 0333-8483919<br>Powered By RapidTechPro",
    });

    const productInputRef = useRef<HTMLInputElement>(null);
    const productContainerRef = useRef<HTMLDivElement>(null);
    const customerContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
        fetch("/api/branding")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.branding) {
                    setStoreBranding({
                        ...data.branding,
                        receiptNote: data.branding.receiptNote ? data.branding.receiptNote.replace(/\n/g, "<br>") : "",
                        others: data.branding.others ? data.branding.others.replace(/\n/g, "<br>") : "",
                    });
                }
            })
            .catch(() => {});
        const handleClickOutside = (event: MouseEvent) => {
            if (productContainerRef.current && !productContainerRef.current.contains(event.target as Node)) {
                setShowProductDropdown(false);
            }
            if (customerContainerRef.current && !customerContainerRef.current.contains(event.target as Node)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (quotationId) {
            fetchQuotation(quotationId);
        }
    }, [quotationId]);

    const loadData = async () => {
        try {
            const [prodRes, custRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/customers")
            ]);
            const prodData = await prodRes.json();
            const custData = await custRes.json();
            setProducts(Array.isArray(prodData) ? prodData : []);
            setCustomers(Array.isArray(custData) ? custData : []);
        } catch (error) {
            console.error("Error loading master data:", error);
        }
    };

    const fetchQuotation = async (id: string) => {
        try {
            const res = await fetch(`/api/sales/${id}`);
            const data = await res.json();
            if (data && !data.error) {
                if (data.customer) {
                    setSelectedCustomer(data.customer);
                    setCustomerSearch(data.customer.name);
                }
                setActiveMode("SALE");
                setBillType(data.type === 'QUOTATION' ? 'RETAIL' : data.type);

                const cartItems = data.items.map((item: any) => ({
                    id: `${item.productId}-${Date.now()}-${Math.random()}`,
                    productId: item.productId,
                    code: item.product?.code || "",
                    name: item.name || item.product?.name || "Product",
                    quantity: item.quantity,
                    price: Number(item.price),
                    itemDiscount: Number(item.discount),
                    subtotal: Number(item.subtotal),
                    stock: item.product?.stock || 0
                }));
                setCart(cartItems);
            }
        } catch (error) {
            console.error("Failed to load quotation", error);
        }
    };

    // Customer Selection Handling
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.contact && c.contact.includes(customerSearch))
    );

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomerName.trim()) return alert("Customer name is required");
        setIsCreatingCustomer(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCustomerName,
                    contact: newCustomerContact,
                    address: newCustomerAddress,
                })
            });
            const created = await res.json();
            if (!res.ok) throw new Error(created.error || "Failed to create customer");

            setCustomers([created, ...customers]);
            setSelectedCustomer(created);
            setCustomerSearch(created.name);
            setShowAddCustomerModal(false);
            setNewCustomerName("");
            setNewCustomerContact("");
            setNewCustomerAddress("");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    // Product Selector & Barcode Scan
    const filteredProducts = products.filter(p =>
        p.code.toLowerCase().includes(productQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(productQuery.toLowerCase())
    );

    const handleSelectProduct = (product: any) => {
        setSelectedProductId(product.id);
        setProductName(product.name);
        const itemPrice = billType === "WHOLESALE" ? Number(product.wholesalePrice) : Number(product.retailPrice);
        setPrice(itemPrice);
        setQuantity(1);
        setItemDiscount(0);
        setProductQuery(`${product.code} - ${product.name}`);
        setShowProductDropdown(false);
    };

    const handleProductKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && productQuery.trim()) {
            // Check exact barcode match first
            const exactMatch = products.find(p => p.code.toLowerCase() === productQuery.trim().toLowerCase());
            if (exactMatch) {
                quickAddProductToCart(exactMatch);
                setProductQuery("");
                setShowProductDropdown(false);
                return;
            }
            // If 1 item filtered, select it
            if (filteredProducts.length === 1) {
                quickAddProductToCart(filteredProducts[0]);
                setProductQuery("");
                setShowProductDropdown(false);
            }
        }
    };

    const quickAddProductToCart = (product: any) => {
        const itemPrice = billType === "WHOLESALE" ? Number(product.wholesalePrice) : Number(product.retailPrice);
        const existingIndex = cart.findIndex(c => c.productId === product.id && c.price === itemPrice && c.itemDiscount === 0);

        if (existingIndex > -1) {
            const updatedCart = [...cart];
            updatedCart[existingIndex].quantity += 1;
            updatedCart[existingIndex].subtotal = (updatedCart[existingIndex].price * updatedCart[existingIndex].quantity) - updatedCart[existingIndex].itemDiscount;
            setCart(updatedCart);
        } else {
            const newItem = {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                code: product.code,
                name: product.name,
                quantity: 1,
                price: itemPrice,
                itemDiscount: 0,
                subtotal: itemPrice,
                stock: product.stock
            };
            setCart([...cart, newItem]);
        }
    };

    const addCustomProductToCart = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        const subtotal = (price * quantity) - Number(itemDiscount);
        const newItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            code: product.code,
            name: productName || product.name,
            quantity: Number(quantity),
            price: Number(price),
            itemDiscount: Number(itemDiscount),
            subtotal: subtotal,
            stock: product.stock
        };

        setCart([...cart, newItem]);

        // Reset quick form
        setSelectedProductId("");
        setProductName("");
        setPrice(0);
        setQuantity(1);
        setItemDiscount(0);
        setProductQuery("");
    };

    const updateCartQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return {
                    ...item,
                    quantity: newQty,
                    subtotal: (item.price * newQty) - item.itemDiscount
                };
            }
            return item;
        }));
    };

    const updateCartItemField = (id: string, field: string, value: any) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                updated.subtotal = (Number(updated.price) * Number(updated.quantity)) - Number(updated.itemDiscount || 0);
                return updated;
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Financial calculations
    const itemsGrossTotal = cart.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    const itemDiscountsTotal = cart.reduce((sum, item) => sum + Number(item.itemDiscount || 0), 0);
    const subtotalAfterItemDiscounts = Math.max(0, itemsGrossTotal - itemDiscountsTotal);

    let calculatedBillDiscountAmount = 0;
    if (discountType === "PERCENT") {
        calculatedBillDiscountAmount = (subtotalAfterItemDiscounts * Math.min(100, Math.max(0, billDiscountValue))) / 100;
    } else {
        calculatedBillDiscountAmount = Math.min(subtotalAfterItemDiscounts, Math.max(0, billDiscountValue));
    }

    const netTotal = Math.max(0, subtotalAfterItemDiscounts - calculatedBillDiscountAmount);
    const balance = netTotal - paidAmount;

    // Checkout Handling
    const handleCheckout = async () => {
        if (!selectedCustomer) return alert("Please select a customer before completing checkout");
        if (cart.length === 0) return alert("Cart is empty. Add items first!");

        setIsProcessing(true);
        try {
            const res = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomer.id,
                    date,
                    type: activeMode === "QUOTATION" ? "QUOTATION" : billType,
                    items: cart,
                    total: itemsGrossTotal,
                    discount: itemDiscountsTotal + calculatedBillDiscountAmount,
                    netTotal,
                    paidAmount: activeMode === "QUOTATION" ? 0 : Number(paidAmount),
                    balance: activeMode === "QUOTATION" ? 0 : (balance > 0 ? balance : 0),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to process transaction");

            setLastSale(data);
            setLastReturn(null);
            setShowReceipt(true);

            // Clear state
            setCart([]);
            setPaidAmount(0);
            setBillDiscountValue(0);
            setRemarks("");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Sale Return Logic
    const handleSearchInvoice = async () => {
        if (!invoiceSearchQuery.trim()) return;
        setIsSearchingInvoice(true);
        try {
            const res = await fetch(`/api/sales`);
            const allSales = await res.json();
            if (Array.isArray(allSales)) {
                const match = allSales.find((s: any) => s.billNumber.toLowerCase() === invoiceSearchQuery.trim().toLowerCase());
                if (match) {
                    setFoundInvoice(match);
                    if (match.customer) {
                        setSelectedCustomer(match.customer);
                        setCustomerSearch(match.customer.name);
                    }
                    // Init return items
                    const itemsToReturn = match.items.map((it: any) => ({
                        productId: it.productId,
                        name: it.name || it.product?.name,
                        originalQty: it.quantity,
                        price: Number(it.price),
                        returnQty: 0,
                        subtotal: 0
                    }));
                    setReturnItems(itemsToReturn);
                } else {
                    alert(`No invoice found with number "${invoiceSearchQuery}"`);
                    setFoundInvoice(null);
                    setReturnItems([]);
                }
            }
        } catch (error) {
            console.error("Error searching invoice:", error);
            alert("Failed to search invoice");
        } finally {
            setIsSearchingInvoice(false);
        }
    };

    const updateReturnQuantity = (productId: string, returnQty: number) => {
        setReturnItems(returnItems.map(item => {
            if (item.productId === productId) {
                const validQty = Math.min(item.originalQty, Math.max(0, returnQty));
                return {
                    ...item,
                    returnQty: validQty,
                    subtotal: validQty * item.price
                };
            }
            return item;
        }));
    };

    const totalReturnAmount = returnItems.reduce((sum, item) => sum + item.subtotal, 0);

    const handleProcessReturn = async () => {
        if (!selectedCustomer) return alert("Please select a customer for the return");
        const activeReturns = returnItems.filter(i => i.returnQty > 0);
        if (activeReturns.length === 0) return alert("Please select at least 1 item quantity to return");

        setIsProcessing(true);
        try {
            const payload = {
                customerId: selectedCustomer.id,
                saleId: foundInvoice?.id || null,
                date,
                items: activeReturns.map(i => ({
                    productId: i.productId,
                    name: i.name,
                    quantity: i.returnQty,
                    price: i.price,
                    subtotal: i.subtotal
                })),
                totalAmount: totalReturnAmount,
                creditAmount: returnPayoutMethod === "ACCOUNT" ? totalReturnAmount : 0,
                refundAmount: returnPayoutMethod === "CASH" ? totalReturnAmount : 0,
                remarks: remarks || (foundInvoice ? `Return for ${foundInvoice.billNumber}` : "Direct Sale Return")
            };

            const res = await fetch("/api/sales/return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to process sale return");

            setLastReturn(data);
            setLastSale(null);
            setShowReceipt(true);

            // Reset return form
            setFoundInvoice(null);
            setReturnItems([]);
            setInvoiceSearchQuery("");
            setRemarks("");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Print Receipt Handler
    const handlePrint = () => {
        const record = lastSale || lastReturn;
        if (!record) return;

        const isReturn = !!lastReturn;
        const isWholesale = record.type === 'WHOLESALE';

        const logoSrc = storeBranding.logo.startsWith('http') || storeBranding.logo.startsWith('data:')
            ? storeBranding.logo
            : window.location.origin + storeBranding.logo;

        const printWindow = window.open('', '_blank', 'width=380,height=700');
        if (!printWindow) return;

        if (isReturn) {
            // 80mm Return Credit Voucher Receipt
            const returnHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Return Voucher - ${record.returnNumber}</title>
                    <style>
                        @page { size: 80mm auto; margin: 3mm; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
                            width: 72mm;
                            margin: 0 auto;
                            padding: 4px 2px;
                            color: #000;
                            font-size: 11px;
                            line-height: 1.3;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .header img { max-height: 55px; max-width: 90%; object-fit: contain; margin: 0 auto 3px auto; display: block; }
                        .biz-title { font-size: 15px; font-weight: 900; text-transform: uppercase; margin: 2px 0; }
                        .biz-sub { font-size: 9.5px; margin: 1px 0; }
                        .badge { display: inline-block; padding: 2px 6px; border: 1.5px solid #000; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 3px 0; }
                        .divider { border-top: 1px dashed #000; margin: 5px 0; }
                        .divider-double { border-top: 2px solid #000; margin: 6px 0; }
                        .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
                        table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 10px; }
                        th { border-bottom: 1px dashed #000; padding: 2px 1px; font-weight: 800; text-align: left; }
                        td { padding: 3px 1px; vertical-align: top; }
                        .grand { font-size: 13.5px; font-weight: 900; }
                    </style>
                </head>
                <body>
                    <div class="text-center header">
                        ${storeBranding.logo ? `<img src="${logoSrc}" alt="${storeBranding.businessName}" />` : ''}
                        <div class="biz-title">${storeBranding.businessName}</div>
                        <div class="biz-sub">${storeBranding.address}</div>
                        <div class="biz-sub"><strong>${storeBranding.phoneNumbers}</strong></div>
                        <div class="badge">RETURN CREDIT VOUCHER</div>
                    </div>
                    <div class="divider"></div>
                    <div class="row"><span>Voucher #:</span><span><strong>${record.returnNumber}</strong></span></div>
                    <div class="row"><span>Date:</span><span>${new Date(record.date).toLocaleString()}</span></div>
                    <div class="row"><span>Customer:</span><span><strong>${record.customer?.name || 'Walk-in'}</strong></span></div>
                    ${record.sale?.billNumber ? `<div class="row"><span>Original Bill:</span><span>${record.sale.billNumber}</span></div>` : ''}
                    <div class="row"><span>Payout Mode:</span><span><strong>${Number(record.creditAmount) > 0 ? 'Account Credit' : 'Cash Refunded'}</strong></span></div>
                    <div class="divider"></div>
                    <table>
                        <thead>
                            <tr>
                                <th>ITEM</th>
                                <th class="text-center" style="width: 15%;">QTY</th>
                                <th class="text-right" style="width: 25%;">PRICE</th>
                                <th class="text-right" style="width: 25%;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(record.items || []).map((it: any) => `
                                <tr>
                                    <td>${it.product?.name || it.name}</td>
                                    <td class="text-center">${it.quantity}</td>
                                    <td class="text-right">${Number(it.unitPrice || it.price).toFixed(2)}</td>
                                    <td class="text-right">${Number(it.total || it.subtotal || (it.unitPrice * it.quantity)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="divider-double"></div>
                    <div class="row grand">
                        <span>TOTAL REFUND:</span>
                        <span>RS ${Number(record.totalAmount || record.total || record.creditAmount).toFixed(2)}</span>
                    </div>
                    <div class="divider-double"></div>
                    <div class="text-center" style="font-size: 8.5px; margin-top: 6px;">
                        ${storeBranding.others}
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                    </script>
                </body>
                </html>
            `;
            printWindow.document.write(returnHTML);
            printWindow.document.close();
            return;
        }

        // 80mm Thermal Receipt for all Sales (Retail & Wholesale)


        // Thermal standard receipt
        const itemsGross = record.items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0);
        const itemDiscounts = record.items.reduce((sum: number, it: any) => sum + (Number(it.discount || 0)), 0);
        const totalSaleDiscount = Number(record.discount || 0);
        const billDiscountValue = Math.max(0, totalSaleDiscount - itemDiscounts);
        const billDiscountPercentage = itemsGross > 0 ? (billDiscountValue / itemsGross) * 100 : 0;
        const paymentMethod = Number(record.paidAmount) >= Number(record.netTotal) ? 'Cash' : (Number(record.paidAmount) > 0 ? 'Partial' : 'Credit');

        const thermalHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Receipt - ${record.billNumber}</title>
                <style>
                    @page { size: 80mm auto; margin: 3mm; }
                    body { font-family: 'Segoe UI', Arial, -apple-system, sans-serif; font-size: 10px; width: 72mm; margin: 0 auto; padding: 2px 2px; color: #000; font-weight: 600; line-height: 1.3; }
                    .header { text-align: center; margin-bottom: 6px; }
                    .header img { height: 80px; max-width: 100%; object-fit: contain; margin: 0 auto 4px auto; display: block; }
                    .header p { margin: 1px 0; font-size: 9px; font-weight: 600; }
                    .divider { border-top: 1px dashed #000; margin: 6px 0; }
                    .divider-double { border-top: 2px dashed #000; margin: 6px 0; }
                    .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 9.5px; }
                    table { width: 100%; border-collapse: collapse; margin: 5px 0; }
                    th { font-weight: 800; text-transform: uppercase; font-size: 9px; padding: 3px 1px; border-bottom: 1px dashed #000; }
                    td { padding: 3px 1px; font-size: 9px; vertical-align: top; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total-row { display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; }
                    .total-row.grand { font-size: 13px; font-weight: 900; margin: 4px 0; }
                    .footer { text-align: center; margin-top: 8px; font-size: 8.5px; }
                    .footer p { margin: 2px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${storeBranding.logo.startsWith('http') || storeBranding.logo.startsWith('data:') ? storeBranding.logo : window.location.origin + storeBranding.logo}" alt="${storeBranding.businessName}" />
                    <div style="font-weight: 900; font-size: 14px; margin: 2px 0;">${storeBranding.businessName}</div>
                    <p>${storeBranding.address}</p>
                    <p>${storeBranding.phoneNumbers}</p>
                    ${isWholesale ? '<div style="display:inline-block; border: 1.5px solid #000; padding: 1px 6px; font-weight: 900; font-size: 9px; margin-top: 3px;">WHOLESALE TAX INVOICE</div>' : ''}
                </div>
                <div class="divider"></div>
                <div class="info-row"><span>Receipt #:</span><span style="font-family: monospace; font-weight: 800;">${record.billNumber}</span></div>
                <div class="info-row"><span>Date:</span><span>${new Date(record.date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                <div class="info-row"><span>Customer:</span><span>${record.customer?.name || 'Walk-in'}${record.customer?.phone || record.customer?.contact ? ` (${record.customer.phone || record.customer.contact})` : ''}</span></div>
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
                        ${record.items.map((item: any) => {
                            const itemPrice = Number(item.price);
                            const itemQty = Number(item.quantity);
                            const itemDiscount = Number(item.discount || 0);
                            const itemTotal = (itemPrice * itemQty) - itemDiscount;
                            return `
                                <tr>
                                    <td style="text-align: left; word-break: break-word;">${item.name}</td>
                                    <td class="text-center">${itemQty}</td>
                                    <td class="text-right">${itemPrice.toFixed(2)}</td>
                                    <td class="text-right">${itemDiscount.toFixed(2)}</td>
                                    <td class="text-right">${itemTotal.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="divider"></div>
                <div class="total-row"><span>Subtotal:</span><span>${itemsGross.toFixed(2)}</span></div>
                ${itemDiscounts > 0 && billDiscountValue > 0 ? `
                    <div class="total-row"><span>Item Discount:</span><span>- ${itemDiscounts.toFixed(2)}</span></div>
                    <div class="total-row"><span>Bill Discount ${billDiscountPercentage > 0 ? `(${billDiscountPercentage.toFixed(0)}%)` : ''}:</span><span>- ${billDiscountValue.toFixed(2)}</span></div>
                ` : billDiscountValue > 0 ? `
                    <div class="total-row"><span>Bill Discount ${billDiscountPercentage > 0 ? `(${billDiscountPercentage.toFixed(0)}%)` : ''}:</span><span>- ${billDiscountValue.toFixed(2)}</span></div>
                ` : itemDiscounts > 0 ? `
                    <div class="total-row"><span>Bill Discount:</span><span>- ${itemDiscounts.toFixed(2)}</span></div>
                ` : ''}
                <div class="divider-double"></div>
                <div class="total-row grand"><span>TOTAL:</span><span>${Number(record.netTotal).toFixed(2)}</span></div>
                <div class="divider-double"></div>
                <div class="total-row"><span>Payment Method:</span><span>${paymentMethod}</span></div>
                <div class="total-row"><span>Amount Received:</span><span>${Number(record.paidAmount || 0).toFixed(2)}</span></div>
                ${Number(record.balance || 0) > 0 ? `<div class="total-row" style="color: #c00;"><span>Balance Due:</span><span>${Number(record.balance).toFixed(2)}</span></div>` : ''}
                <div class="divider"></div>
                <div class="footer">
                    <p style="margin-bottom: 4px; line-height: 1.35;">
                        ${storeBranding.receiptNote}
                    </p>
                    <div class="divider"></div>
                    <p style="font-size: 8px; margin-top: 3px;">${storeBranding.others}</p>
                </div>
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(thermalHTML);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            {/* Top Bar Navigation & Mode Toggles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">Point of Sale</h2>
                        <p className="text-xs text-slate-500 font-medium">Terminal Billing, Sales, and Returns Counter</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {/* Primary Mode Tabs */}
                    <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-xs flex-1 md:flex-initial">
                        <button
                            onClick={() => setActiveMode("SALE")}
                            className={cn(
                                "flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                                activeMode === "SALE" ? "bg-blue-600 text-white shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Sale
                        </button>
                        <button
                            onClick={() => setActiveMode("QUOTATION")}
                            className={cn(
                                "flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                                activeMode === "QUOTATION" ? "bg-amber-600 text-white shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Quotation
                        </button>
                        <button
                            onClick={() => setActiveMode("RETURN")}
                            className={cn(
                                "flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                                activeMode === "RETURN" ? "bg-rose-600 text-white shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Sale Return
                        </button>
                    </div>

                    {/* Retail / Wholesale toggle (Only for SALE mode) */}
                    {activeMode === "SALE" && (
                        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-xs">
                            <button
                                onClick={() => setBillType("RETAIL")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                    billType === "RETAIL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Retail
                            </button>
                            <button
                                onClick={() => setBillType("WHOLESALE")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                    billType === "WHOLESALE" ? "bg-purple-700 text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Wholesale
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area based on Active Mode */}
            {activeMode === "RETURN" ? (
                /* ================= SALE RETURN MODE ================= */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Return Selection Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Invoice Lookup Card */}
                        <div className="rounded-2xl bg-white border border-rose-200/80 p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-rose-600" />
                                Lookup Invoice for Return
                            </h3>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Enter Bill Number e.g. INV-000001"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-semibold text-xs sm:text-sm text-slate-900 shadow-xs"
                                        value={invoiceSearchQuery}
                                        onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchInvoice()}
                                    />
                                </div>
                                <button
                                    onClick={handleSearchInvoice}
                                    disabled={isSearchingInvoice || !invoiceSearchQuery.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 shadow-sm"
                                >
                                    {isSearchingInvoice ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Search className="w-3.5 h-3.5" />
                                    )}
                                    <span>Find Bill</span>
                                </button>
                            </div>
                        </div>

                        {/* Return Items Selection Table */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-700">
                                    <Box className="w-4 h-4 text-rose-600" />
                                    Select Items to Return
                                </h3>
                                {foundInvoice && (
                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                                        Bill #{foundInvoice.billNumber}
                                    </span>
                                )}
                            </div>

                            <div className="overflow-x-auto max-h-[450px]">
                                {returnItems.length === 0 ? (
                                    <div className="p-16 text-center text-slate-400">
                                        <RotateCcw className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                                        <p className="font-semibold text-sm text-slate-600">Search a bill number above to load sold items</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Or select a customer on the right to process a direct return</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50/75 border-b border-slate-200/80 sticky top-0">
                                            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <th className="px-4 py-3">Product</th>
                                                <th className="px-4 py-3 text-right">Sold Price</th>
                                                <th className="px-4 py-3 text-center">Sold Qty</th>
                                                <th className="px-4 py-3 text-center">Return Qty</th>
                                                <th className="px-4 py-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {returnItems.map((item) => (
                                                <tr key={item.productId} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-slate-900">{item.name}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-600">
                                                        {formatCurrency(item.price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                                                        {item.originalQty}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                                            <button
                                                                onClick={() => updateReturnQuantity(item.productId, item.returnQty - 1)}
                                                                className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.originalQty}
                                                                className="w-10 text-center bg-transparent font-extrabold text-xs text-slate-900 focus:outline-none"
                                                                value={item.returnQty}
                                                                onChange={(e) => updateReturnQuantity(item.productId, Number(e.target.value))}
                                                            />
                                                            <button
                                                                onClick={() => updateReturnQuantity(item.productId, item.returnQty + 1)}
                                                                className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-rose-600 text-sm">
                                                        {formatCurrency(item.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Return Summary & Payout Column */}
                    <div className="space-y-6">
                        {/* Customer Panel */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Customer Account
                            </label>
                            <div className="relative" ref={customerContainerRef}>
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search customer..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-semibold text-xs sm:text-sm text-slate-900 shadow-xs"
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setShowCustomerDropdown(true);
                                    }}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                />
                                {showCustomerDropdown && (
                                    <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                                        {filteredCustomers.map(c => (
                                            <div
                                                key={c.id}
                                                className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs"
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setCustomerSearch(c.name);
                                                    setShowCustomerDropdown(false);
                                                }}
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">{c.name}</p>
                                                    <p className="text-[11px] text-slate-400">{c.contact}</p>
                                                </div>
                                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                                                    Bal: {formatCurrency(c.balance)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedCustomer && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-center text-xs">
                                    <div>
                                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Selected Customer</p>
                                        <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedCustomer.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Current Debt</p>
                                        <p className="font-black text-rose-600 text-sm mt-0.5">{formatCurrency(selectedCustomer.balance)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payout Options & Complete Return */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Return Payout Mode
                            </h3>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setReturnPayoutMethod("ACCOUNT")}
                                    className={cn(
                                        "py-2.5 rounded-xl font-semibold text-xs transition-all border flex flex-col items-center gap-0.5 cursor-pointer",
                                        returnPayoutMethod === "ACCOUNT"
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    <span>Account Credit</span>
                                    <span className="text-[10px] opacity-80">(Reduces Debt)</span>
                                </button>
                                <button
                                    onClick={() => setReturnPayoutMethod("CASH")}
                                    className={cn(
                                        "py-2.5 rounded-xl font-semibold text-xs transition-all border flex flex-col items-center gap-0.5 cursor-pointer",
                                        returnPayoutMethod === "CASH"
                                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    <span>Cash Refund</span>
                                    <span className="text-[10px] opacity-80">(Cash Paid)</span>
                                </button>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Return Note / Reason
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-medium text-xs resize-none"
                                    rows={2}
                                    placeholder="Defective item, size exchange, etc..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>

                            {/* Total Return Amount */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white space-y-1 shadow-sm">
                                <span className="text-xs font-semibold uppercase tracking-wider text-rose-100">Total Return Value</span>
                                <div className="text-2xl font-black">{formatCurrency(totalReturnAmount)}</div>
                            </div>

                            {/* Submit Return */}
                            <button
                                onClick={handleProcessReturn}
                                disabled={isProcessing || totalReturnAmount === 0 || !selectedCustomer}
                                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing Return...</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Process Sale Return</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ================= SALE & QUOTATION MODE ================= */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Product Selection & Cart */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search & Add Product Card */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                    Add Items to Cart
                                </h3>
                                <span className="text-xs text-slate-400">Scan barcode & press Enter</span>
                            </div>

                            <div className="relative" ref={productContainerRef}>
                                <div className="relative flex items-center">
                                    <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        ref={productInputRef}
                                        type="text"
                                        placeholder="Scan barcode or type product name/code..."
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-xs sm:text-sm text-slate-900 shadow-xs"
                                        value={productQuery}
                                        onChange={(e) => {
                                            setProductQuery(e.target.value);
                                            setShowProductDropdown(true);
                                        }}
                                        onFocus={() => setShowProductDropdown(true)}
                                        onKeyDown={handleProductKeyDown}
                                    />
                                    {productQuery && (
                                        <button
                                            onClick={() => {
                                                setProductQuery("");
                                                setSelectedProductId("");
                                            }}
                                            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Instant Product Dropdown */}
                                {showProductDropdown && (
                                    <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                                        {filteredProducts.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                                No products found {productQuery ? `matching "${productQuery}"` : ""}
                                            </div>
                                        ) : (
                                            filteredProducts.map(p => {
                                                const unitPrice = billType === "WHOLESALE" ? Number(p.wholesalePrice) : Number(p.retailPrice);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors text-xs"
                                                        onClick={() => handleSelectProduct(p)}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs font-bold text-blue-600">{p.code}</span>
                                                                <span className="font-semibold text-slate-900">{p.name}</span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                Retail: {formatCurrency(p.retailPrice)} | Wholesale: {formatCurrency(p.wholesalePrice)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-slate-900">{formatCurrency(unitPrice)}</p>
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5",
                                                                p.stock > 5 ? "bg-emerald-50 text-emerald-700" : p.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                                                            )}>
                                                                Stock: {p.stock}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Detailed item modifier (when product selected) */}
                            {selectedProductId && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-12 gap-3 items-end">
                                    <div className="col-span-12 md:col-span-4">
                                        <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Item Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 font-bold text-xs text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 font-bold text-xs text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Discount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 font-medium text-xs text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                            value={itemDiscount}
                                            onChange={(e) => setItemDiscount(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2">
                                        <button
                                            onClick={addCustomProductToCart}
                                            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Cart Table */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-700">
                                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                                    Cart Items ({cart.length})
                                </h3>
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => setCart([])}
                                        className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                                    >
                                        Clear Cart
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[420px] overflow-y-auto">
                                {cart.length === 0 ? (
                                    <div className="p-16 text-center text-slate-400 text-xs">
                                        <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                                        <p className="font-semibold text-sm text-slate-600">No items added to cart</p>
                                        <p className="text-slate-400 mt-0.5">Scan barcode or search products above</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50/75 border-b border-slate-200/80 sticky top-0">
                                            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <th className="px-4 py-3">Item</th>
                                                <th className="px-4 py-3 text-center">Qty</th>
                                                <th className="px-4 py-3 text-right">Price</th>
                                                <th className="px-4 py-3 text-right">Disc.</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                                <th className="px-4 py-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {cart.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-none focus:outline-none font-semibold text-slate-900 text-xs"
                                                            value={item.name}
                                                            onChange={(e) => updateCartItemField(item.id, 'name', e.target.value)}
                                                        />
                                                        <span className="text-[11px] text-slate-400 font-mono">{item.code}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                                            <button
                                                                onClick={() => updateCartQuantity(item.id, -1)}
                                                                className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-10 text-center bg-transparent font-black text-xs text-slate-900 focus:outline-none"
                                                                value={item.quantity}
                                                                onChange={(e) => updateCartItemField(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                                                            />
                                                            <button
                                                                onClick={() => updateCartQuantity(item.id, 1)}
                                                                className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-20 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-right font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            value={item.price}
                                                            onChange={(e) => updateCartItemField(item.id, 'price', Number(e.target.value))}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-right font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            value={item.itemDiscount}
                                                            onChange={(e) => updateCartItemField(item.id, 'itemDiscount', Number(e.target.value))}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 text-sm">
                                                        {formatCurrency(item.subtotal)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Checkout */}
                    <div className="space-y-6">
                        {/* Customer Search & Selector */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Customer
                                </label>
                                <button
                                    onClick={() => setShowAddCustomerModal(true)}
                                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>New Customer</span>
                                </button>
                            </div>

                            <div className="relative" ref={customerContainerRef}>
                                <input
                                    type="text"
                                    placeholder="Search customer name or phone..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-xs sm:text-sm text-slate-900 shadow-xs"
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setShowCustomerDropdown(true);
                                    }}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                />
                                {showCustomerDropdown && (
                                    <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-52 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                                        {filteredCustomers.map(c => (
                                            <div
                                                key={c.id}
                                                className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors text-xs"
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setCustomerSearch(c.name);
                                                    setShowCustomerDropdown(false);
                                                }}
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">{c.name}</p>
                                                    <p className="text-[11px] text-slate-400">{c.contact || 'No Contact'}</p>
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded-full",
                                                    c.balance > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                                                )}>
                                                    Bal: {formatCurrency(c.balance)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedCustomer && (
                                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex justify-between items-center text-xs">
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedCustomer.name}</p>
                                        <p className="text-[11px] text-slate-500">{selectedCustomer.contact || 'No phone'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Ledger Balance</span>
                                        <span className={cn(
                                            "font-black text-sm",
                                            selectedCustomer.balance > 0 ? "text-rose-600" : "text-emerald-700"
                                        )}>
                                            {formatCurrency(selectedCustomer.balance)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Checkout & Bill Summary */}
                        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                Payment Summary
                            </h3>

                            {/* Date */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Invoice Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center text-xs font-medium">
                                <span className="text-slate-500">Gross Items Total</span>
                                <span className="font-bold text-slate-900">{formatCurrency(itemsGrossTotal)}</span>
                            </div>

                            {/* Bill Discount Row */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Discount</label>
                                    <div className="flex text-[10px] font-bold bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                        <button
                                            onClick={() => setDiscountType("PERCENT")}
                                            className={cn("px-2 py-0.5 rounded-md cursor-pointer", discountType === "PERCENT" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-400")}
                                        >
                                            %
                                        </button>
                                        <button
                                            onClick={() => setDiscountType("FIXED")}
                                            className={cn("px-2 py-0.5 rounded-md cursor-pointer", discountType === "FIXED" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-400")}
                                        >
                                            RS
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                    placeholder={discountType === "PERCENT" ? "0%" : "RS 0"}
                                    value={billDiscountValue || ""}
                                    onChange={(e) => setBillDiscountValue(Number(e.target.value))}
                                />
                            </div>

                            {/* Net Total Box */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shadow-sm">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 block">Net Total</span>
                                    <span className="text-2xl font-black">{formatCurrency(netTotal)}</span>
                                </div>
                                <Sparkles className="w-5 h-5 text-blue-200" />
                            </div>

                            {/* Paid Amount */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Paid Amount (Cash)</label>
                                    {/* Quick cash buttons */}
                                    <button
                                        onClick={() => setPaidAmount(netTotal)}
                                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                                    >
                                        Exact Amount
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-extrabold text-base text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                                    placeholder="0.00"
                                    value={paidAmount || ""}
                                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                                />

                                {/* Quick Cash increment chips */}
                                <div className="flex gap-1.5 mt-2">
                                    {[100, 500, 1000, 5000].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setPaidAmount((prev) => prev + val)}
                                            className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-700 transition cursor-pointer"
                                        >
                                            +{val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Balance Due / Change */}
                            <div className={cn(
                                "p-3 rounded-xl flex justify-between items-center border font-bold text-xs",
                                balance > 0 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            )}>
                                <span>{balance > 0 ? "Balance Due (Credit)" : "Change Return / Cleared"}</span>
                                <span className="font-extrabold">{formatCurrency(Math.abs(balance))}</span>
                            </div>

                            {/* Complete Sale Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || cart.length === 0 || !selectedCustomer}
                                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{activeMode === "QUOTATION" ? "Save Quotation" : "Complete Sale"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Customer Modal */}
            <AnimatePresence>
                {showAddCustomerModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCustomerModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white text-slate-900 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-base flex items-center gap-2 text-slate-900">
                                    <UserPlus className="w-5 h-5 text-blue-600" />
                                    Add New Customer
                                </h3>
                                <button onClick={() => setShowAddCustomerModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Customer Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                        placeholder="Full Name"
                                        value={newCustomerName}
                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                        placeholder="0300 0000000"
                                        value={newCustomerContact}
                                        onChange={(e) => setNewCustomerContact(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Address</label>
                                    <input
                                        type="text"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                        placeholder="City / Area"
                                        value={newCustomerAddress}
                                        onChange={(e) => setNewCustomerAddress(e.target.value)}
                                    />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCustomerModal(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingCustomer}
                                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                                    >
                                        {isCreatingCustomer ? "Saving..." : "Save Customer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Receipt Modal */}
            <AnimatePresence>
                {showReceipt && (lastSale || lastReturn) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReceipt(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative bg-white text-slate-900 p-6 md:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-lg z-10 border border-slate-200"
                        >
                            <div className="text-center space-y-1 mb-4 border-b border-dashed border-black/20 pb-4">
                                <img src={storeBranding.logo} alt={storeBranding.businessName} className="h-16 mx-auto object-contain mb-1" />
                                <h3 className="font-extrabold text-sm uppercase text-black">{storeBranding.businessName}</h3>
                                <p className="text-xs text-black/70 font-medium">{storeBranding.address}</p>
                                <p className="text-xs text-black/70 font-medium">{storeBranding.phoneNumbers}</p>
                                <div className="mt-2 inline-block px-3 py-1 text-xs font-black uppercase bg-black/5">
                                    {lastReturn ? "RETURN CREDIT VOUCHER" : (lastSale?.type || "SALE RECEIPT")}
                                </div>
                            </div>

                            {/* Summary Details */}
                            <div className="space-y-1.5 text-xs mb-4">
                                <div className="flex justify-between">
                                    <span className="text-black/60">Receipt #:</span>
                                    <span className="font-bold">{lastReturn ? lastReturn.returnNumber : lastSale.billNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black/60">Date:</span>
                                    <span className="font-bold">{new Date((lastReturn || lastSale).date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black/60">Customer:</span>
                                    <span className="font-bold">{(lastReturn || lastSale).customer?.name || "Walk-in"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black/60">Cashier:</span>
                                    <span className="font-bold">Admin</span>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="border-t border-b border-black/20 py-3 my-3">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-black/10 text-black/60 font-bold uppercase text-[10px]">
                                            <th className="text-left pb-2">Item</th>
                                            <th className="text-center pb-2 w-10">Qty</th>
                                            <th className="text-right pb-2 w-16">Price</th>
                                            <th className="text-right pb-2 w-14">Disc</th>
                                            <th className="text-right pb-2 w-20">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {(lastReturn || lastSale).items.map((item: any, i: number) => {
                                            const qty = Number(item.quantity || 0);
                                            const price = Number(item.price || 0);
                                            const discount = Number(item.discount || 0);
                                            const total = (price * qty) - discount;
                                            return (
                                                <tr key={i} className="align-middle">
                                                    <td className="py-2 text-left font-semibold text-black pr-1">
                                                        {item.name}
                                                    </td>
                                                    <td className="py-2 text-center text-black/70">
                                                        {qty}
                                                    </td>
                                                    <td className="py-2 text-right text-black/70 whitespace-nowrap">
                                                        {price.toFixed(2)}
                                                    </td>
                                                    <td className="py-2 text-right text-black/70 whitespace-nowrap">
                                                        {discount.toFixed(2)}
                                                    </td>
                                                    <td className="py-2 text-right font-bold text-black whitespace-nowrap">
                                                        {total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="space-y-1.5 text-xs">
                                {(() => {
                                    if (lastSale) {
                                        const itemsGross = lastSale.items?.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0) || Number(lastSale.total || 0);
                                        const itemDisc = lastSale.items?.reduce((sum: number, it: any) => sum + (Number(it.discount || 0)), 0) || 0;
                                        const totalSaleDisc = Number(lastSale.discount || 0);
                                        const billDiscVal = Math.max(0, totalSaleDisc - itemDisc);
                                        const billDiscPct = itemsGross > 0 ? (billDiscVal / itemsGross) * 100 : 0;
                                        const paymentMethod = Number(lastSale.paidAmount) >= Number(lastSale.netTotal) ? 'Cash' : (Number(lastSale.paidAmount) > 0 ? 'Partial' : 'Credit');

                                        return (
                                            <>
                                                <div className="flex justify-between text-black/70">
                                                    <span>Subtotal:</span>
                                                    <span>RS {itemsGross.toFixed(2)}</span>
                                                </div>
                                                {itemDisc > 0 && billDiscVal > 0 ? (
                                                    <>
                                                        <div className="flex justify-between text-red-600 font-semibold">
                                                            <span>Item Discount:</span>
                                                            <span>- RS {itemDisc.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-red-600 font-semibold">
                                                            <span>Bill Discount {billDiscPct > 0 ? `(${billDiscPct.toFixed(0)}%)` : ''}:</span>
                                                            <span>- RS {billDiscVal.toFixed(2)}</span>
                                                        </div>
                                                    </>
                                                ) : billDiscVal > 0 ? (
                                                    <div className="flex justify-between text-red-600 font-semibold">
                                                        <span>Bill Discount {billDiscPct > 0 ? `(${billDiscPct.toFixed(0)}%)` : ''}:</span>
                                                        <span>- RS {billDiscVal.toFixed(2)}</span>
                                                    </div>
                                                ) : itemDisc > 0 ? (
                                                    <div className="flex justify-between text-red-600 font-semibold">
                                                        <span>Bill Discount:</span>
                                                        <span>- RS {itemDisc.toFixed(2)}</span>
                                                    </div>
                                                ) : null}
                                                <div className="flex justify-between text-sm font-black pt-2 border-t-2 border-dashed border-black">
                                                    <span>TOTAL:</span>
                                                    <span>RS {Number(lastSale.netTotal).toFixed(2)}</span>
                                                </div>
                                                {lastSale.type !== 'QUOTATION' && (
                                                    <div className="pt-2 border-t border-black/10 space-y-1">
                                                        <div className="flex justify-between text-black/70">
                                                            <span>Payment Method:</span>
                                                            <span className="font-semibold">{paymentMethod}</span>
                                                        </div>
                                                        <div className="flex justify-between text-black/70">
                                                            <span>Amount Received:</span>
                                                            <span className="font-semibold">RS {Number(lastSale.paidAmount || 0).toFixed(2)}</span>
                                                        </div>
                                                        {Number(lastSale.balance || 0) > 0 && (
                                                            <div className="flex justify-between text-red-600 font-bold">
                                                                <span>Balance Due:</span>
                                                                <span>RS {Number(lastSale.balance).toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    } else if (lastReturn) {
                                        return (
                                            <div className="flex justify-between text-sm font-black pt-2 border-t border-black">
                                                <span>TOTAL RETURN VALUE:</span>
                                                <span>RS {Number(lastReturn.totalAmount).toFixed(2)}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Footer Instructions */}
                            <div className="border-t border-dashed border-black/20 pt-3 mt-4 text-center text-[10px] text-black/75 space-y-1">
                                <p className="whitespace-pre-line">{storeBranding.receiptNote?.replace(/<br>/g, "\n")}</p>
                                <div className="border-t border-black/10 pt-2 mt-2 text-[9px] text-black/60 whitespace-pre-line">
                                    {storeBranding.others?.replace(/<br>/g, "\n")}
                                </div>
                            </div>

                            {/* Print / Action Buttons */}
                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 py-3 rounded-xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print Receipt
                                </button>
                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="flex-1 py-3 rounded-xl bg-black/10 text-black font-bold hover:bg-black/20 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
