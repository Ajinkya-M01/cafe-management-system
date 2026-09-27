'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bill, Order, PaymentMethod, PaymentStatus } from '@/types';
import {
  Receipt,
  Printer,
  Download,
  CheckCircle2,
  Search,
  CreditCard,
  QrCode,
  Banknote,
  Percent,
  Coffee,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';

function BillingContent() {
  const searchParams = useSearchParams();
  const initialTable = searchParams.get('tableNumber');
  const initialOrder = searchParams.get('orderId');

  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Terminal state
  const [selectedTableNum, setSelectedTableNum] = useState<string>(initialTable || '02');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  // Fetch running order for table
  const fetchTableOrder = async (tableNum: string) => {
    try {
      const res = await fetch(`/api/admin/billing?tableNumber=${tableNum}`);
      const data = await res.json();
      if (data.success && data.activeOrder) {
        setActiveOrder(data.activeOrder);
      } else {
        setActiveOrder(null);
      }
    } catch {
      setActiveOrder(null);
    }
  };

  const fetchBillsHistory = async () => {
    try {
      const res = await fetch('/api/admin/billing');
      const data = await res.json();
      if (data.success) {
        setBills(data.bills);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTableNum) {
      fetchTableOrder(selectedTableNum);
    }
    fetchBillsHistory();
  }, [selectedTableNum]);

  // Handle invoice generation
  const handleGenerateBill = async () => {
    if (!activeOrder) return;
    setBillingLoading(true);

    try {
      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          discountPercentage: discountPercent,
          paymentMethod,
          paymentStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedBill(data.bill);
        fetchBillsHistory();
      } else {
        alert(data.error || 'Failed to generate bill');
      }
    } catch {
      alert('Error generating bill');
    } finally {
      setBillingLoading(false);
    }
  };

  // Calculations for current active order
  const subtotal = activeOrder
    ? activeOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const grandTotal = Math.round((taxableAmount + cgst + sgst) * 100) / 100;

  // PDF Export via jsPDF
  const handleDownloadPdf = (billToExport: Bill) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dark header
    doc.setFillColor(26, 20, 18);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(245, 239, 230);
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('NOIR & BEAN', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Coffee. Cuisine. Conversations.', 15, 26);
    doc.text('GSTIN: 27AABCU9603R1ZM | 42 Heritage Blvd, Bandra West, Mumbai', 15, 32);

    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('TAX INVOICE', 160, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(billToExport.invoiceNumber, 160, 28);

    // Meta section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(`Customer: ${billToExport.customerName}`, 15, 52);
    doc.text(`Table: ${billToExport.tableNumber || 'Takeaway'}`, 15, 58);
    doc.text(`Date & Time: ${new Date(billToExport.generatedAt).toLocaleString()}`, 15, 64);
    doc.text(`Payment Mode: ${billToExport.paymentMethod} (${billToExport.paymentStatus})`, 130, 52);
    doc.text(`Order Ref: ${billToExport.orderNumber}`, 130, 58);

    // Items table header
    let y = 75;
    doc.setFillColor(240, 235, 225);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item Description', 20, y + 5.5);
    doc.text('Qty', 115, y + 5.5);
    doc.text('Rate', 140, y + 5.5);
    doc.text('Total (INR)', 170, y + 5.5);

    // Item rows
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    billToExport.items.forEach((item) => {
      doc.text(item.name, 20, y + 5);
      doc.text(item.quantity.toString(), 118, y + 5);
      doc.text(`INR ${item.price.toFixed(2)}`, 140, y + 5);
      doc.text(`INR ${(item.price * item.quantity).toFixed(2)}`, 170, y + 5);
      y += 8;
    });

    // Totals line
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, 195, y);
    y += 8;

    doc.text('Subtotal:', 130, y);
    doc.text(`INR ${billToExport.subtotal.toFixed(2)}`, 170, y);
    y += 6;

    if (billToExport.discountAmount > 0) {
      doc.text(`Discount (${billToExport.discountPercentage}%):`, 130, y);
      doc.text(`- INR ${billToExport.discountAmount.toFixed(2)}`, 170, y);
      y += 6;
    }

    doc.text('CGST (2.5%):', 130, y);
    doc.text(`INR ${billToExport.cgst.toFixed(2)}`, 170, y);
    y += 6;

    doc.text('SGST (2.5%):', 130, y);
    doc.text(`INR ${billToExport.sgst.toFixed(2)}`, 170, y);
    y += 8;

    doc.setFillColor(26, 20, 18);
    doc.rect(125, y - 2, 70, 10, 'F');
    doc.setTextColor(245, 239, 230);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Grand Total:', 130, y + 5);
    doc.text(`INR ${billToExport.grandTotal.toFixed(2)}`, 165, y + 5);

    // Footer
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for dining with NOIR & BEAN. We hope to welcome you again soon.', 105, 275, {
      align: 'center',
    });

    doc.save(`${billToExport.invoiceNumber}_NoirAndBean.pdf`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Point of Sale & Invoicing
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Billing Terminal
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#1F1815] border border-[#C5A880]/20">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-[#C5A880] text-[#14100E]'
                : 'text-[#A8988B] hover:text-[#FBF8F3]'
            }`}
          >
            Live Terminal
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#C5A880] text-[#14100E]'
                : 'text-[#A8988B] hover:text-[#FBF8F3]'
            }`}
          >
            Bill Archives ({bills.length})
          </button>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Table / Order Selector & Bill Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Table Selector Strip */}
            <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-3">
              <label className="text-xs uppercase tracking-wider text-[#A8988B] font-semibold block">
                Select Seated Table
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const padded = num.toString().padStart(2, '0');
                  const active = selectedTableNum === padded;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        setSelectedTableNum(padded);
                        setGeneratedBill(null);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C5A880] text-[#14100E] shadow-sm'
                          : 'bg-[#14100E] text-[#D8CCBD] border border-[#C5A880]/20 hover:border-[#C5A880]'
                      }`}
                    >
                      T-{padded}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Table Order */}
            {activeOrder ? (
              <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/15">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#C5A880]">
                      {activeOrder.orderNumber}
                    </span>
                    <h3 className="font-serif text-xl text-[#FBF8F3] mt-0.5">
                      Guest: {activeOrder.customerName}
                    </h3>
                    <p className="text-[11px] text-[#A8988B]">
                      Table {selectedTableNum} • Phone: {activeOrder.customerPhone}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold">
                    {activeOrder.status}
                  </span>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#E8DFD5]">
                    <thead className="uppercase text-[10px] text-[#A8988B] border-b border-[#C5A880]/15">
                      <tr>
                        <th className="py-2.5">Item</th>
                        <th className="py-2.5 text-center">Qty</th>
                        <th className="py-2.5 text-right">Price</th>
                        <th className="py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A880]/10">
                      {activeOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-medium text-[#FBF8F3]">{item.name}</td>
                          <td className="py-2.5 text-center">{item.quantity}</td>
                          <td className="py-2.5 text-right">₹{item.price}</td>
                          <td className="py-2.5 text-right font-semibold text-[#FBF8F3]">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Discounts & Payment Form Controls */}
                <div className="pt-4 border-t border-[#C5A880]/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Discount input */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Guest Discount (%)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[0, 5, 10, 15, 20].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiscountPercent(d)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            discountPercent === d
                              ? 'bg-[#C5A880] text-[#14100E]'
                              : 'bg-[#14100E] text-[#A8988B] border border-[#C5A880]/20'
                          }`}
                        >
                          {d}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5">
                      Settlement Mode
                    </label>
                    <div className="flex items-center gap-2">
                      {(['UPI', 'Card', 'Cash'] as PaymentMethod[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMethod(mode)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            paymentMethod === mode
                              ? 'bg-[#C5A880] text-[#14100E]'
                              : 'bg-[#14100E] text-[#A8988B] border border-[#C5A880]/20'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 text-center space-y-2">
                <Receipt className="w-12 h-12 text-[#8C7A6D]/50 mx-auto" />
                <h3 className="font-serif text-xl text-[#FBF8F3]">No Active Order for Table {selectedTableNum}</h3>
                <p className="text-xs text-[#A8988B]">
                  Guests have either settled their bill or haven&apos;t placed an order yet.
                </p>
              </div>
            )}
          </div>

          {/* Right Col: Bill Preview / POS Settlement Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/30 shadow-xl space-y-4">
              <h3 className="font-serif text-xl text-[#FBF8F3]">Bill Computation</h3>

              <div className="space-y-2 text-xs text-[#A8988B] pb-3 border-b border-[#C5A880]/15">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#FBF8F3] font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (2.5%)</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-[#FBF8F3] pt-1">
                <span>Total Payable</span>
                <span className="text-[#C5A880]">₹{grandTotal.toFixed(2)}</span>
              </div>

              {activeOrder && (
                <button
                  onClick={handleGenerateBill}
                  disabled={billingLoading}
                  className="w-full py-4 px-6 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {billingLoading ? (
                    <div className="inline-block w-4 h-4 border-2 border-[#14100E] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Generate Bill & Mark Paid</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {/* Thermal Receipt & PDF Actions if bill is generated */}
              {generatedBill && (
                <div className="pt-4 border-t border-[#C5A880]/20 space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Invoice {generatedBill.invoiceNumber} recorded!</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.print()}
                      className="py-2.5 px-3 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#FBF8F3] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Print Slip</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(generatedBill)}
                      className="py-2.5 px-3 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Bill</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thermal Print Slip Live Visual Component */}
            {generatedBill && (
              <div
                id="printable-receipt"
                className="p-6 bg-white text-black font-mono text-[11px] rounded-2xl shadow-lg border border-gray-300 space-y-3"
              >
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
                  <div className="font-bold text-sm tracking-widest">NOIR & BEAN</div>
                  <div className="text-[10px]">Coffee. Cuisine. Conversations.</div>
                  <div className="text-[9px]">42 Heritage Blvd, Bandra West, Mumbai</div>
                  <div className="text-[9px]">GSTIN: 27AABCU9603R1ZM</div>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span>INV: {generatedBill.invoiceNumber}</span>
                  <span>T-{generatedBill.tableNumber || 'Takeaway'}</span>
                </div>
                <div className="text-[10px]">
                  Date: {new Date(generatedBill.generatedAt).toLocaleString()}
                </div>

                <div className="border-t border-b border-dashed border-gray-400 py-2 space-y-1">
                  {generatedBill.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[140px]">{it.quantity}x {it.name}</span>
                      <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-right text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{generatedBill.subtotal.toFixed(2)}</span>
                  </div>
                  {generatedBill.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount ({generatedBill.discountPercentage}%):</span>
                      <span>-₹{generatedBill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>CGST (2.5%):</span>
                    <span>₹{generatedBill.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (2.5%):</span>
                    <span>₹{generatedBill.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300">
                    <span>Grand Total:</span>
                    <span>₹{generatedBill.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-dashed border-gray-400 text-[10px]">
                  <div>Paid via: {generatedBill.paymentMethod}</div>
                  <div className="text-[9px] mt-1">Thank you for dining with us!</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bill Archives Tab */
        <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#C5A880]/15 flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#FBF8F3]">Settled Tax Invoices</h3>
            <span className="text-xs text-[#A8988B]">{bills.length} Invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E8DFD5]">
              <thead className="uppercase text-[10px] text-[#A8988B] bg-[#171210] border-b border-[#C5A880]/20">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Taxes</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A880]/10">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#251D19]">
                    <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">
                      {bill.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#A8988B]">
                      {new Date(bill.generatedAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#FBF8F3]">{bill.customerName}</td>
                    <td className="py-3 px-4">{bill.tableNumber ? `Table ${bill.tableNumber}` : 'Takeaway'}</td>
                    <td className="py-3 px-4">₹{bill.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-4">₹{(bill.cgst + bill.sgst).toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-[#FBF8F3]">₹{bill.grandTotal.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPdf(bill)}
                        className="p-1.5 rounded-lg bg-[#2A211C] hover:bg-[#342A24] text-[#C5A880] transition-colors cursor-pointer"
                        title="Download PDF Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
