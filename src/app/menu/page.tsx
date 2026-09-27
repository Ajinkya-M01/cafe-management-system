'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { useCart } from '@/context/CartContext';
import { Category, MenuItem } from '@/types';
import {
  Search,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Filter,
  X,
} from 'lucide-react';

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Coffee',
  'Tea',
  'Cold Beverages',
  'Breakfast',
  'Snacks',
  'Main Course',
  'Desserts',
  'Specials',
];

function MenuContent() {
  const searchParams = useSearchParams();
  const { addItem, tableNumber, setTableNumber, itemCount, grandTotal, setIsCartOpen, setOrderType } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [onlyPopular, setOnlyPopular] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-detect table from URL query (?table=04 or ?table=T-04)
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const clean = tableParam.replace(/^T-?/i, '').padStart(2, '0');
      setTableNumber(clean);
      setOrderType('dine-in');
    }
  }, [searchParams, setTableNumber, setOrderType]);

  // Fetch menu from backend API
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success && data.items) {
          setMenuItems(data.items);
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (vegOnly && !item.isVeg) {
        return false;
      }
      if (onlyPopular && !item.isPopular) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedCategory, vegOnly, onlyPopular, searchQuery]);

  const handleAdd = (item: MenuItem) => {
    const qty = itemQuantities[item.id] || 1;
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        image: item.image,
      },
      qty
    );

    setNotification(`${qty}x "${item.name}" added to order`);
    setTimeout(() => setNotification(null), 2500);

    // reset local counter
    setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  const handleQtyChange = (itemId: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3]">
      <Navbar />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#1A1412] text-[#FBF8F3] px-5 py-3 rounded-xl shadow-2xl border border-[#C5A880]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Hero / Header */}
      <div className="bg-[#1A1412] text-[#FBF8F3] py-14 px-4 sm:px-6 lg:px-8 border-b border-[#C5A880]/20">
        <div className="max-w-7xl mx-auto">
          {/* Table Banner if customer scanned QR code */}
          {tableNumber && (
            <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#FBF8F3] text-sm">
              <MapPin className="w-4 h-4 text-[#C5A880]" />
              <span>
                Ordering for <strong className="text-[#C5A880]">Table {tableNumber}</strong>
              </span>
              <button
                onClick={() => setTableNumber(null)}
                className="text-xs text-[#E8DFD5]/60 hover:text-white ml-2 underline"
                title="Clear table selection"
              >
                Change
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
                Atelier Culinary & Brew Roster
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl text-[#FBF8F3]">
                The Digital Menu
              </h1>
            </div>
            <p className="text-sm text-[#D8CCBD] max-w-md">
              Freshly prepared to order. Direct single-origin beans, house-cultured ferments, and locally farmed produce.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search sticky bar */}
      <div className="sticky top-20 z-30 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#E8DFD5] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6D]" />
              <input
                type="text"
                placeholder="Search coffee, mains, desserts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-[#D8CCBD] text-xs text-[#1A1412] placeholder-[#8C7A6D] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6D] hover:text-[#1A1412]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Toggle Badges */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                  vegOnly
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-[#4A3E37] border-[#D8CCBD] hover:border-emerald-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Vegetarian Only</span>
              </button>

              <button
                onClick={() => setOnlyPopular(!onlyPopular)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                  onlyPopular
                    ? 'bg-[#1A1412] text-[#C5A880] border-[#1A1412] shadow-xs'
                    : 'bg-white text-[#4A3E37] border-[#D8CCBD] hover:border-[#C5A880]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Popular Curations</span>
              </button>
            </div>
          </div>

          {/* Categories Pill Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1A1412] text-[#FBF8F3] shadow-sm'
                      : 'bg-white text-[#5F5046] border border-[#E8DFD5] hover:border-[#C5A880] hover:text-[#1A1412]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Item Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest text-[#8C7A6D]">Loading artisanal menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <Filter className="w-12 h-12 text-[#8C7A6D]/50 mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-[#1A1412] mb-2">No matching dishes found</h3>
            <p className="text-xs text-[#736357] mb-6">
              Try adjusting your category filter, dietary toggles, or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setVegOnly(false);
                setOnlyPopular(false);
              }}
              className="px-6 py-2 rounded-full bg-[#1A1412] text-[#FBF8F3] text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const qty = itemQuantities[item.id] || 1;
              return (
                <div
                  key={item.id}
                  className="card-luxury rounded-2xl overflow-hidden flex flex-col group border border-[#E8DFD5] bg-white"
                >
                  {/* Image and Badges */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#E8DFD5]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      <span className="text-[10px] font-semibold text-[#1A1412] uppercase tracking-wider">
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Popular Badge */}
                    {item.isPopular && (
                      <div className="absolute top-3 right-3 bg-[#1A1412]/90 backdrop-blur-xs text-[#C5A880] px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-[#C5A880]" />
                        <span>Signature</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-serif text-lg font-medium text-[#1A1412] group-hover:text-[#9E7F56] transition-colors leading-snug">
                          {item.name}
                        </h3>
                        <span className="font-semibold text-base text-[#1A1412] shrink-0">
                          ₹{item.price}
                        </span>
                      </div>

                      <p className="text-xs text-[#736357] leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Prep time & calories */}
                      <div className="flex items-center gap-4 text-[11px] text-[#8C7A6D] mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>{item.preparationTime} mins</span>
                        </span>
                        {item.calories && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>{item.calories} kcal</span>
                          </span>
                        )}
                        <span className="text-[#A8988B] uppercase tracking-wider text-[10px]">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Row */}
                    <div className="pt-4 border-t border-[#E8DFD5] flex items-center justify-between gap-3">
                      {/* Local Quantity Stepper */}
                      <div className="flex items-center border border-[#D8CCBD] rounded-lg bg-[#FAF7F2] overflow-hidden">
                        <button
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="px-2.5 py-1 text-[#1A1412] hover:bg-[#E8DFD5] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#1A1412]">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="px-2.5 py-1 text-[#1A1412] hover:bg-[#E8DFD5] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAdd(item)}
                        className="flex-1 py-2 px-4 rounded-xl bg-[#1A1412] hover:bg-[#C5A880] text-[#FBF8F3] hover:text-[#1A1412] text-xs uppercase tracking-wider font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Appears when items are in cart) */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <div className="p-3.5 rounded-2xl bg-[#1A1412] text-[#FBF8F3] shadow-2xl border border-[#C5A880]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880] text-[#1A1412] flex items-center justify-center font-bold text-sm">
                {itemCount}
              </div>
              <div>
                <p className="text-xs text-[#C5A880] uppercase tracking-wider">
                  {tableNumber ? `Table ${tableNumber} Order` : 'Order Total'}
                </p>
                <p className="text-base font-bold text-[#FBF8F3]">₹{grandTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#FBF8F3] transition-colors cursor-pointer"
              >
                View Order
              </button>
              <Link
                href="/checkout"
                className="px-5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#1A1412] text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>Checkout</span>
                <ShoppingBag className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
