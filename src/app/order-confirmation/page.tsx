'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { Order } from '@/types';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  ShoppingBag,
  ChefHat,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided.');
      setLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Order not found');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error fetching order';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    // Poll status every 8 seconds for live kitchen updates
    const interval = setInterval(loadOrder, 8000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B]">Loading order status...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-700/60 dark:text-red-400 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-[#1A1412] dark:text-[#F9F6F1] mb-2 font-medium">Order Lookup Failed</h2>
          <p className="text-xs text-[#736357] dark:text-[#A8988B] mb-6">{error || 'Unable to retrieve order details.'}</p>
          <Link
            href="/menu"
            className="px-6 py-2.5 rounded-full bg-[#1A1412] dark:bg-[#C5A880] text-[#F9F6F1] dark:text-[#1A1412] text-xs font-medium uppercase tracking-wider"
          >
            Return to Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-4 text-[#9E7F56] dark:text-[#C5A880]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7F56] dark:text-[#C5A880] font-semibold block mb-1">
            Order Confirmed & In Motion
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1412] dark:text-[#F9F6F1] mb-3">
            Thank You, {order.customerName.split(' ')[0]}
          </h1>
          <p className="text-xs text-[#736357] dark:text-[#A8988B]">
            Order Reference: <strong className="text-[#1A1412] dark:text-[#F9F6F1] font-bold text-sm tracking-wider">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Live Kitchen Status Tracker */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-sm mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E8DFD5] dark:border-[#2E241F]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1915] border border-[#E8DFD5] dark:border-[#2E241F]">
                <ChefHat className="w-5 h-5 text-[#9E7F56] dark:text-[#C5A880]" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B] font-medium">
                  Live Preparation Status
                </h3>
                <p className="text-lg font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                  Status: <span className="text-[#9E7F56] dark:text-[#C5A880]">{order.status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#736357] dark:text-[#A8988B]">
              {order.type === 'dine-in' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1F1915] border border-[#E8DFD5] dark:border-[#2E241F] font-semibold text-[#1A1412] dark:text-[#F9F6F1]">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Dine-In • Table {order.tableNumber || 'Unassigned'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1F1915] border border-[#E8DFD5] dark:border-[#2E241F] font-semibold text-[#1A1412] dark:text-[#F9F6F1]">
                  <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Takeaway • Pickup: {order.pickupTime || '15-20 Mins'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Steps */}
          <div className="relative">
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-[2px] bg-[#E8DFD5] dark:bg-[#2E241F] -translate-y-1/2 z-0" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-[#1A1412] dark:bg-[#C5A880] text-[#C5A880] dark:text-[#1A1412] ring-4 ring-[#C5A880]/30 scale-110'
                          : isPassed
                          ? 'bg-[#C5A880] text-[#1A1412]'
                          : 'bg-[#FAF7F2] dark:bg-[#1F1915] text-[#A8988B] border border-[#D8CCBD] dark:border-[#2E241F]'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold tracking-wider uppercase ${
                        isCurrent
                          ? 'text-[#1A1412] dark:text-[#F9F6F1]'
                          : isPassed
                          ? 'text-[#9E7F56] dark:text-[#C5A880]'
                          : 'text-[#A8988B] dark:text-[#8C7A6D]'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Itemized Order Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-sm mb-8 space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] dark:border-[#2E241F]">
            <h3 className="font-serif text-xl text-[#1A1412] dark:text-[#F9F6F1]">Ordered Items</h3>
            <span className="text-xs text-[#8C7A6D] dark:text-[#A8988B]">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="divide-y divide-[#E8DFD5] dark:divide-[#2E241F]">
            {order.items.map((item, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-[#1A1412] dark:text-[#F9F6F1]">{item.name}</span>
                    <span className="text-[#8C7A6D] dark:text-[#A8988B] ml-2">× {item.quantity}</span>
                    {item.notes && (
                      <p className="text-[11px] text-[#736357] dark:text-[#A8988B] italic mt-0.5">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8DFD5] dark:border-[#2E241F] space-y-2 text-xs text-[#736357] dark:text-[#A8988B]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1A1412] dark:text-[#F9F6F1]">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5%)</span>
              <span>₹{order.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5%)</span>
              <span>₹{order.sgst.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-[#E8DFD5] dark:border-[#2E241F] flex justify-between text-base font-bold text-[#1A1412] dark:text-[#F9F6F1]">
              <span>Grand Total</span>
              <span className="text-[#9E7F56] dark:text-[#C5A880]">₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A6D] dark:text-[#A8988B] gap-2">
            <div>
              Payment: <strong className="text-[#1A1412] dark:text-[#F9F6F1]">{order.paymentMethod || 'UPI'}</strong> (
              <span className={order.paymentStatus === 'Paid' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-bold'}>
                {order.paymentStatus}
              </span>
              )
            </div>
            <div>GSTIN: 27AABCU9603R1ZM</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#181310] border border-[#D8CCBD] dark:border-[#2E241F] text-xs uppercase tracking-widest font-semibold text-[#1A1412] dark:text-[#F9F6F1] hover:bg-[#FAF7F2] dark:hover:bg-[#231B17] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#9E7F56] dark:text-[#C5A880]" />
            <span>Print Receipt</span>
          </button>

          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#C5A880] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] hover:text-[#1A1412] text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Additional Items</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] dark:bg-[#100D0B]">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
