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
  Percent,
  ArrowRight,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

function BillingContent() {
  const searchParams = useSearchParams();
  const initialTable = searchParams.get('tableNumber');

  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTableNum, setSelectedTableNum] = useState<string>(initialTable || '02');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

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
    if (selectedTableNum) { fetchTableOrder(selectedTableNum); }
    fetchBillsHistory();
  }, [selectedTableNum]);

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
        setActiveOrder(null);
      } else {
        alert(data.error || 'Failed to generate bill');
      }
    } catch {
      alert('Error generating bill');
    } finally {
      setBillingLoading(false);
    }
  };

  const subtotal = activeOrder
    ? activeOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const grandTotal = Math.round((taxableAmount + cgst + sgst) * 100) / 100;

  const handleDownloadPdf = (billToExport: Bill) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(`Customer: ${billToExport.customerName}`, 15, 52);
    doc.text(`Table: ${billToExport.tableNumber || 'Takeaway'}`, 15, 58);
    doc.text(`Date & Time: ${new Date(billToExport.generatedAt).toLocaleString()}`, 15, 64);
    doc.text(`Payment Mode: ${billToExport.paymentMethod} (${billToExport.paymentStatus})`, 130, 52);
    doc.text(`Order Ref: ${billToExport.orderNumber}`, 130, 58);
    let y = 75;
    doc.setFillColor(240, 235, 225);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item Description', 20, y + 5.5);
    doc.text('Qty', 115, y + 5.5);
    doc.text('Rate', 140, y + 5.5);
    doc.text('Total (INR)', 170, y + 5.5);
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
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for dining with NOIR & BEAN. We hope to welcome you again soon.', 105, 275, { align: 'center' });
    doc.save(`${billToExport.invoiceNumber}_NoirAndBean.pdf`);
  };

  const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const DISCOUNTS = [0, 5, 10, 15, 20];
  const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Card', 'Cash'];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Point of Sale & Invoicing"
        title="Billing Terminal"
        action={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1F1815] border border-[#C5A880]/20">
            {(['terminal', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[40px] ${
                  activeTab === tab
                    ? 'bg-[#C5A880] text-[#14100E]'
                    : 'text-[#A8988B] hover:text-[#FBF8F3]'
                }`}
                aria-pressed={activeTab === tab}
              >
                {tab === 'terminal' ? 'Live Terminal' : `Archives (${bills.length})`}
              </button>
            ))}
          </div>
        }
      />

      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Table selector + Order */}
          <div className="lg:col-span-2 space-y-5">
            {/* Table Selector Strip */}
            <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-3">
              <label className="text-[10px] uppercase tracking-wider text-[#A8988B] font-bold block">
                Select Seated Table
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {TABLES.map((num) => {
                  const padded = num.toString().padStart(2, '0');
                  const isActive = selectedTableNum === padded;
                  return (
                    <button
                      key={num}
                      onClick={() => { setSelectedTableNum(padded); setGeneratedBill(null); }}
                      className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                        isActive
                          ? 'bg-[#C5A880] text-[#14100E] shadow-md'
                          : 'bg-[#14100E] text-[#D8CCBD] border border-[#C5A880]/20 hover:border-[#C5A880]/50'
                      }`}
                      aria-pressed={isActive}
                      aria-label={`Table ${padded}`}
                    >
                      T{padded}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Order */}
            {activeOrder ? (
              <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-[#C5A880]/12">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#C5A880]">{activeOrder.orderNumber}</span>
                    <h3 className="font-serif text-xl text-[#FBF8F3] mt-0.5">Guest: {activeOrder.customerName}</h3>
                    <p className="text-[11px] text-[#A8988B] mt-0.5">
                      Table {selectedTableNum} &bull; {activeOrder.customerPhone}
                    </p>
                  </div>
                  <StatusBadge status={activeOrder.status} />
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#E8DFD5]">
                    <thead className="uppercase text-[10px] text-[#A8988B] border-b border-[#C5A880]/12">
                      <tr>
                        <th className="py-2.5 font-bold">Item</th>
                        <th className="py-2.5 text-center font-bold">Qty</th>
                        <th className="py-2.5 text-right font-bold">Price</th>
                        <th className="py-2.5 text-right font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A880]/08">
                      {activeOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-medium text-[#FBF8F3]">{item.name}</td>
                          <td className="py-2.5 text-center">{item.quantity}</td>
                          <td className="py-2.5 text-right">&#8377;{item.price}</td>
                          <td className="py-2.5 text-right font-semibold text-[#FBF8F3]">
                            &#8377;{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Discount & Payment Controls */}
                <div className="pt-4 border-t border-[#C5A880]/12 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Discount */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#A8988B] font-bold mb-2 flex items-center gap-1.5">
                      <Percent className="w-3 h-3 text-[#C5A880]" />
                      Guest Discount
                    </label>
                    <div className="flex items-center gap-2">
                      {DISCOUNTS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiscountPercent(d)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                            discountPercent === d
                              ? 'bg-[#C5A880] text-[#14100E]'
                              : 'bg-[#14100E] text-[#A8988B] border border-[#C5A880]/20 hover:border-[#C5A880]/50'
                          }`}
                          aria-pressed={discountPercent === d}
                        >
                          {d}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#A8988B] font-bold mb-2">
                      Settlement Mode
                    </label>
                    <div className="flex items-center gap-2">
                      {PAYMENT_METHODS.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMethod(mode)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                            paymentMethod === mode
                              ? 'bg-[#C5A880] text-[#14100E]'
                              : 'bg-[#14100E] text-[#A8988B] border border-[#C5A880]/20 hover:border-[#C5A880]/50'
                          }`}
                          aria-pressed={paymentMethod === mode}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : generatedBill ? (
              <div className="p-8 rounded-2xl bg-[#1F1815] border border-emerald-700/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif text-xl text-[#FBF8F3]">Bill Generated</h3>
                <p className="text-xs text-[#A8988B]">
                  Invoice {generatedBill.invoiceNumber} recorded successfully.
                </p>
              </div>
            ) : (
              <div className="p-10 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 text-center space-y-2">
                <Receipt className="w-10 h-10 text-[#8C7A6D]/50 mx-auto" />
                <h3 className="font-serif text-lg text-[#FBF8F3]">No Active Order for Table {selectedTableNum}</h3>
                <p className="text-xs text-[#A8988B]">
                  Guests have either settled their bill or have not placed an order yet.
                </p>
              </div>
            )}
          </div>

          {/* Right Col: Bill Preview */}
          <div className="space-y-5">
            {/* Bill Computation Card */}
            <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/30 shadow-xl space-y-4">
              <h3 className="font-serif text-xl text-[#FBF8F3]">Bill Computation</h3>

              <div className="space-y-2.5 text-xs text-[#A8988B] pb-4 border-b border-[#C5A880]/12">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#FBF8F3] font-semibold">&#8377;{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- &#8377;{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (2.5%)</span>
                  <span>&#8377;{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span>&#8377;{sgst.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-[#FBF8F3]">
                <span>Total Payable</span>
                <span className="text-[#C5A880]">&#8377;{grandTotal.toFixed(2)}</span>
              </div>

              {activeOrder && (
                <button
                  onClick={handleGenerateBill}
                  disabled={billingLoading}
                  className="w-full py-4 px-6 rounded-xl bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] font-bold text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]"
                >
                  {billingLoading ? (
                    <Spinner size="sm" className="border-[#14100E]" />
                  ) : (
                    <>
                      <span>Generate Bill</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {generatedBill && (
                <div className="pt-4 border-t border-[#C5A880]/15 space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Invoice {generatedBill.invoiceNumber} recorded!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.print()}
                      className="py-3 px-3 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/25 text-xs font-semibold text-[#FBF8F3] flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
                      Print Slip
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(generatedBill)}
                      className="py-3 px-3 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/25 text-xs font-semibold text-[#C5A880] flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF Bill
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thermal Receipt Preview */}
            {generatedBill && (
              <div
                id="printable-receipt"
                className="p-6 bg-white text-black font-mono text-[11px] rounded-2xl shadow-lg border border-gray-300 space-y-3"
              >
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
                  <div className="font-bold text-sm tracking-widest">NOIR &amp; BEAN</div>
                  <div className="text-[10px]">Coffee. Cuisine. Conversations.</div>
                  <div className="text-[9px]">42 Heritage Blvd, Bandra West, Mumbai</div>
                  <div className="text-[9px]">GSTIN: 27AABCU9603R1ZM</div>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>INV: {generatedBill.invoiceNumber}</span>
                  <span>T-{generatedBill.tableNumber || 'Takeaway'}</span>
                </div>
                <div className="text-[10px]">Date: {new Date(generatedBill.generatedAt).toLocaleString()}</div>
                <div className="border-t border-b border-dashed border-gray-400 py-2 space-y-1">
                  {generatedBill.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[140px]">{it.quantity}x {it.name}</span>
                      <span>&#8377;{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>&#8377;{generatedBill.subtotal.toFixed(2)}</span>
                  </div>
                  {generatedBill.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount ({generatedBill.discountPercentage}%):</span>
                      <span>-&#8377;{generatedBill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>CGST (2.5%):</span>
                    <span>&#8377;{generatedBill.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (2.5%):</span>
                    <span>&#8377;{generatedBill.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300">
                    <span>Grand Total:</span>
                    <span>&#8377;{generatedBill.grandTotal.toFixed(2)}</span>
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
        <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#C5A880]/12 flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#FBF8F3]">Settled Tax Invoices</h2>
            <span className="text-xs text-[#A8988B]">{bills.length} invoices</span>
          </div>
          <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Invoice #</th>
                  <th scope="col">Date &amp; Time</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Table</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col">Taxes</th>
                  <th scope="col">Grand Total</th>
                  <th scope="col">Payment</th>
                  <th scope="col" className="text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={9} />)
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        title="No invoices yet"
                        description="Settled bills will appear here after generating them from the Live Terminal."
                        icon={<FileText className="w-10 h-10 text-[#C5A880]/40" />}
                      />
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="font-mono font-bold text-[#C5A880] text-[11px]">{bill.invoiceNumber}</td>
                      <td className="text-[11px] text-[#A8988B]">
                        {new Date(bill.generatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="font-medium text-[#FBF8F3]">{bill.customerName}</td>
                      <td>{bill.tableNumber ? `Table ${bill.tableNumber}` : 'Takeaway'}</td>
                      <td>&#8377;{bill.subtotal.toFixed(2)}</td>
                      <td>&#8377;{(bill.cgst + bill.sgst).toFixed(2)}</td>
                      <td className="font-bold text-[#FBF8F3]">&#8377;{bill.grandTotal.toFixed(2)}</td>
                      <td><StatusBadge status={bill.paymentMethod} /></td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDownloadPdf(bill)}
                          className="p-2 rounded-lg bg-[#2A211C] hover:bg-[#342A24] text-[#C5A880] transition-colors cursor-pointer min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                          title="Download PDF Invoice"
                          aria-label={`Download invoice ${bill.invoiceNumber}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
        <div className="py-24 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs uppercase tracking-widest text-[#A8988B]">Loading terminal&hellip;</p>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
