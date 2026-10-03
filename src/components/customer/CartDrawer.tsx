'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, MapPin, Utensils } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    cgst,
    sgst,
    grandTotal,
    tableNumber,
    orderType,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F9F6F1] dark:bg-[#140F0D] text-[#1A1412] dark:text-[#F9F6F1] shadow-2xl flex flex-col border-l border-[#C5A880]/30 transition-colors">
          {/* Header */}
          <div className="p-6 bg-[#1A1412] text-[#F9F6F1] flex items-center justify-between border-b border-[#C5A880]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2A211C] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-xl tracking-wide text-[#F9F6F1]">Your Order</h2>
                <div className="flex items-center gap-2 text-xs text-[#C5A880]">
                  {orderType === 'dine-in' ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {tableNumber ? `Dine-in: Table ${tableNumber}` : 'Dine-in'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      <span>Takeaway Pickup</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl hover:bg-[#2A211C] text-[#D8CCBD] hover:text-white transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#EFE8DD] dark:bg-[#231B17] flex items-center justify-center mb-4 text-[#C5A880]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#1A1412] dark:text-[#F9F6F1] mb-1">
                  Your order is empty
                </h3>
                <p className="text-xs text-[#736357] dark:text-[#A8988B] max-w-xs mb-6 leading-relaxed">
                  Explore our artisanal coffee and culinary delicacies to begin your order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#1A1412] dark:bg-[#C5A880] text-[#F9F6F1] dark:text-[#1A1412] text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A880] hover:text-[#1A1412] transition-colors cursor-pointer"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#736357] dark:text-[#A8988B] pb-2 border-b border-[#E8DFD5] dark:border-[#2E241F]">
                  <span>{items.length} {items.length === 1 ? 'item' : 'items'} in order</span>
                  <button
                    onClick={clearCart}
                    className="text-[#9E7F56] hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1412] border border-[#E8DFD5] dark:border-[#2E241F] shadow-xs flex gap-3.5 items-center transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#E8DFD5] dark:bg-[#231B17]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                        <h4 className="text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] truncate">
                          {item.name}
                        </h4>
                      </div>
                      <div className="text-xs font-medium text-[#C5A880]">
                        ₹{item.price} each
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-[#8C7A6D] italic truncate mt-0.5">
                          &quot;{item.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="text-[#A8988B] hover:text-red-700 dark:hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center border border-[#D8CCBD] dark:border-[#2E241F] rounded-lg bg-[#FAF7F2] dark:bg-[#1F1915] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-[#E8DFD5] dark:hover:bg-[#2A211C] text-[#1A1412] dark:text-[#F9F6F1] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-[#E8DFD5] dark:hover:bg-[#2A211C] text-[#1A1412] dark:text-[#F9F6F1] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer with Calculations and Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1412] border-t border-[#E8DFD5] dark:border-[#2E241F] space-y-3 transition-colors">
              <div className="space-y-1.5 text-xs text-[#736357] dark:text-[#A8988B]">
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
                <div className="pt-2 border-t border-[#E8DFD5] dark:border-[#2E241F] flex justify-between text-base font-bold text-[#1A1412] dark:text-[#F9F6F1]">
                  <span>Total Payable</span>
                  <span className="text-[#C5A880]">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#2A211C] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880] dark:text-[#1A1412]" />
                </Link>
                <div className="text-center mt-2.5">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs text-[#8C7A6D] hover:text-[#1A1412] dark:hover:text-[#F9F6F1] underline transition-colors"
                  >
                    View detailed cart breakdown
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
