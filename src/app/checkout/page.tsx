'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { useCart } from '@/context/CartContext';
import { PaymentMethod } from '@/types';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  QrCode,
  Banknote,
  MapPin,
  Utensils,
  Clock,
  ShieldCheck,
  AlertCircle,
  User,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    subtotal,
    cgst,
    sgst,
    grandTotal,
    tableNumber,
    setTableNumber,
    orderType,
    setOrderType,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupTime, setPickupTime] = useState('15-20 Mins');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#EFE8DD] dark:bg-[#231B17] flex items-center justify-center mb-4 text-[#C5A880]">
            <Utensils className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="font-serif text-3xl text-[#1A1412] dark:text-[#F9F6F1] mb-3">No items in order</h2>
          <p className="text-xs text-[#736357] dark:text-[#A8988B] mb-6 leading-relaxed">
            Please add your favorite brew or culinary dishes to your order before proceeding to checkout.
          </p>
          <Link
            href="/menu"
            className="px-6 py-3 rounded-full bg-[#1A1412] dark:bg-[#C5A880] text-[#F9F6F1] dark:text-[#1A1412] text-xs uppercase tracking-wider font-semibold hover:bg-[#C5A880] hover:text-[#1A1412] transition-colors"
          >
            Explore Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and phone number for order tracking.');
      return;
    }

    if (orderType === 'dine-in' && !tableNumber) {
      setErrorMessage('Please specify your café table number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          type: orderType,
          tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
          pickupTime: orderType === 'takeaway' ? pickupTime : undefined,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes || '',
          })),
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear local cart
      clearCart();

      // Redirect to confirmation with order ID
      router.push(`/order-confirmation?orderId=${data.order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting order';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#736357] dark:text-[#A8988B] hover:text-[#1A1412] dark:hover:text-[#F9F6F1] font-semibold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1412] dark:text-[#F9F6F1] mb-8">
          Checkout & Confirmation
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Left: Customer Information & Preferences */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dining Mode */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#9E7F56] dark:text-[#C5A880] font-bold">
                1. Dining Option
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOrderType('dine-in')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    orderType === 'dine-in'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                      : 'border-[#E8DFD5] dark:border-[#2E241F]'
                  }`}
                >
                  <Utensils className="w-5 h-5 text-[#9E7F56] dark:text-[#C5A880] shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">Dine-In</div>
                    <div className="text-xs text-[#736357] dark:text-[#A8988B]">Served fresh to table</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    orderType === 'takeaway'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                      : 'border-[#E8DFD5] dark:border-[#2E241F]'
                  }`}
                >
                  <Clock className="w-5 h-5 text-[#9E7F56] dark:text-[#C5A880] shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">Takeaway</div>
                    <div className="text-xs text-[#736357] dark:text-[#A8988B]">Packaged for counter pickup</div>
                  </div>
                </button>
              </div>

              {orderType === 'dine-in' ? (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF7F2] dark:bg-[#1F1915] p-4 rounded-xl border border-[#E8DFD5] dark:border-[#2E241F]">
                  <div className="flex items-center gap-2 text-[#1A1412] dark:text-[#F9F6F1] font-medium">
                    <MapPin className="w-4 h-4 text-[#C5A880]" />
                    <span>Table Number:</span>
                  </div>
                  <select
                    aria-label="Table Number"
                    value={tableNumber || ''}
                    onChange={(e) => setTableNumber(e.target.value || null)}
                    className="bg-white dark:bg-[#181310] border border-[#D8CCBD] dark:border-[#2E241F] rounded-lg px-3 py-1.5 text-xs text-[#1A1412] dark:text-[#F9F6F1] font-semibold focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="">Select your table...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n.toString().padStart(2, '0')}>
                        Table {n.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF7F2] dark:bg-[#1F1915] p-4 rounded-xl border border-[#E8DFD5] dark:border-[#2E241F]">
                  <div className="flex items-center gap-2 text-[#1A1412] dark:text-[#F9F6F1] font-medium">
                    <Clock className="w-4 h-4 text-[#C5A880]" />
                    <span>Estimated Pickup Time:</span>
                  </div>
                  <select
                    aria-label="Estimated Pickup Time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="bg-white dark:bg-[#181310] border border-[#D8CCBD] dark:border-[#2E241F] rounded-lg px-3 py-1.5 text-xs text-[#1A1412] dark:text-[#F9F6F1] font-semibold focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="15-20 Mins">Ready in 15–20 Mins</option>
                    <option value="30 Mins">Ready in 30 Mins</option>
                    <option value="45 Mins">Ready in 45 Mins</option>
                    <option value="1 Hour">Ready in 1 Hour</option>
                  </select>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#9E7F56] dark:text-[#C5A880] font-bold">
                2. Guest Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Mehta"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 12345"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                    <span>Email Address (Optional for e-invoice)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="aarav@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                    <span>Special Preparation Notes / Allergies</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Extra hot milk, less sugar, gluten allergy..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#9E7F56] dark:text-[#C5A880] font-bold">
                3. Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                      : 'border-[#E8DFD5] dark:border-[#2E241F]'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <div>
                    <div className="text-xs font-bold text-[#1A1412] dark:text-[#F9F6F1]">UPI / QR</div>
                    <div className="text-[10px] text-[#736357] dark:text-[#A8988B]">GPay, PhonePe, Paytm</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                      : 'border-[#E8DFD5] dark:border-[#2E241F]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <div>
                    <div className="text-xs font-bold text-[#1A1412] dark:text-[#F9F6F1]">Card</div>
                    <div className="text-[10px] text-[#736357] dark:text-[#A8988B]">Visa, Mastercard, Amex</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'Cash'
                      ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                      : 'border-[#E8DFD5] dark:border-[#2E241F]'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <div>
                    <div className="text-xs font-bold text-[#1A1412] dark:text-[#F9F6F1]">Pay at Counter</div>
                    <div className="text-[10px] text-[#736357] dark:text-[#A8988B]">Cash / POS terminal</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Order Summary & Place Order Button */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs space-y-4">
              <h3 className="font-serif text-xl text-[#1A1412] dark:text-[#F9F6F1]">Order Breakdown</h3>

              <div className="divide-y divide-[#E8DFD5] dark:divide-[#2E241F] max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.menuItemId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#1A1412] dark:text-[#F9F6F1]">{item.name}</div>
                      <div className="text-[#8C7A6D] dark:text-[#A8988B]">
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                    <div className="font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-[#736357] dark:text-[#A8988B] pt-2 border-t border-[#E8DFD5] dark:border-[#2E241F]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1412] dark:text-[#F9F6F1]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (2.5%)</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-[#1A1412] dark:text-[#F9F6F1] pt-2 border-t border-[#E8DFD5] dark:border-[#2E241F]">
                <span>Grand Total</span>
                <span className="text-[#9E7F56] dark:text-[#C5A880]">₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#C5A880] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] hover:text-[#1A1412] font-semibold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <div className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-[#8C7A6D] dark:text-[#A8988B] justify-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Instant kitchen notification dispatched</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
