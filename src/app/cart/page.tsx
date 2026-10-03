'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Utensils,
  ShoppingBag as TakeawayIcon,
  ShieldCheck,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Top Back / Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#736357] dark:text-[#A8988B] hover:text-[#1A1412] dark:hover:text-[#F9F6F1] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Ordering</span>
          </Link>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-700/80 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Order</span>
            </button>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1412] dark:text-[#F9F6F1] mb-8">
          Review Your Order
        </h1>

        {items.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] p-10 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#EFE8DD] dark:bg-[#231B17] flex items-center justify-center mx-auto mb-4 text-[#C5A880]">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A1412] dark:text-[#F9F6F1] mb-2 font-medium">
              Your order is currently empty
            </h2>
            <p className="text-xs text-[#736357] dark:text-[#A8988B] mb-8 leading-relaxed max-w-sm mx-auto">
              Explore our single-origin coffees, handcrafted pastries, and signature culinary creations to begin.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#C5A880] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] hover:text-[#1A1412] text-xs uppercase tracking-widest font-semibold transition-all shadow-md"
            >
              <span>Explore Digital Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Left Col: Order Items & Dining Mode */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dining Mode Selection */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-[#9E7F56] dark:text-[#C5A880] font-bold">
                  Order Preference
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType('dine-in')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      orderType === 'dine-in'
                        ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                        : 'border-[#E8DFD5] dark:border-[#2E241F] hover:border-[#D8CCBD]'
                    }`}
                  >
                    <Utensils className={`w-5 h-5 shrink-0 ${orderType === 'dine-in' ? 'text-[#9E7F56] dark:text-[#C5A880]' : 'text-[#8C7A6D]'}`} />
                    <div>
                      <div className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">Dine-In</div>
                      <div className="text-xs text-[#736357] dark:text-[#A8988B]">Served fresh at your café table</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setOrderType('takeaway')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      orderType === 'takeaway'
                        ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                        : 'border-[#E8DFD5] dark:border-[#2E241F] hover:border-[#D8CCBD]'
                    }`}
                  >
                    <TakeawayIcon className={`w-5 h-5 shrink-0 ${orderType === 'takeaway' ? 'text-[#9E7F56] dark:text-[#C5A880]' : 'text-[#8C7A6D]'}`} />
                    <div>
                      <div className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">Takeaway</div>
                      <div className="text-xs text-[#736357] dark:text-[#A8988B]">Packaged for quick pickup</div>
                    </div>
                  </button>
                </div>

                {/* Table assignment if dine-in */}
                {orderType === 'dine-in' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF7F2] dark:bg-[#1F1915] p-4 rounded-xl border border-[#E8DFD5] dark:border-[#2E241F]">
                    <div className="flex items-center gap-2 text-[#1A1412] dark:text-[#F9F6F1] font-medium">
                      <MapPin className="w-4 h-4 text-[#C5A880]" />
                      <span>Assigned Table Number:</span>
                    </div>
                    <select
                      aria-label="Assigned Table Number"
                      value={tableNumber || ''}
                      onChange={(e) => setTableNumber(e.target.value || null)}
                      className="bg-white dark:bg-[#181310] border border-[#D8CCBD] dark:border-[#2E241F] rounded-lg px-3 py-1.5 text-xs text-[#1A1412] dark:text-[#F9F6F1] font-semibold focus:outline-none focus:border-[#C5A880]"
                    >
                      <option value="">Select table number...</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n.toString().padStart(2, '0')}>
                          Table {n.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="p-4 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#E8DFD5] dark:bg-[#231B17]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        <h4 className="text-sm font-semibold text-[#1A1412] dark:text-[#F9F6F1] truncate">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs font-medium text-[#9E7F56] dark:text-[#C5A880]">
                        ₹{item.price} each
                      </p>
                      {item.notes && (
                        <p className="text-[11px] text-[#736357] dark:text-[#A8988B] italic mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8DFD5] dark:border-[#2E241F]">
                      <div className="flex items-center border border-[#D8CCBD] dark:border-[#2E241F] rounded-lg bg-[#FAF7F2] dark:bg-[#1F1915] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-[#1A1412] dark:text-[#F9F6F1] hover:bg-[#E8DFD5] dark:hover:bg-[#2A211C] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-[#1A1412] dark:text-[#F9F6F1] hover:bg-[#E8DFD5] dark:hover:bg-[#2A211C] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="text-[#A8988B] hover:text-red-700 dark:hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Summary Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs space-y-4">
                <h3 className="font-serif text-xl text-[#1A1412] dark:text-[#F9F6F1]">Order Summary</h3>

                <div className="space-y-2.5 text-xs text-[#736357] dark:text-[#A8988B] pb-4 border-b border-[#E8DFD5] dark:border-[#2E241F]">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-[#1A1412] dark:text-[#F9F6F1]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Central GST (2.5%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State GST (2.5%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                  <span>Total Amount</span>
                  <span className="text-[#9E7F56] dark:text-[#C5A880]">₹{grandTotal.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 px-6 rounded-xl bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#C5A880] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] hover:text-[#1A1412] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 flex items-center gap-2 text-[11px] text-[#8C7A6D] dark:text-[#A8988B] justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Secure & Contactless Ordering</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
