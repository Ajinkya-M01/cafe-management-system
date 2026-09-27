'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu as MenuIcon, X, MapPin, Coffee } from 'lucide-react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen, tableNumber } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Reservations', href: '/reservation' },
    { label: 'Atmosphere', href: '/#atmosphere' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1A1412]/95 backdrop-blur-md text-[#FBF8F3] border-b border-[#C5A880]/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17] group-hover:border-[#C5A880] transition-colors">
                <Coffee className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#FBF8F3] group-hover:text-[#C5A880] transition-colors">
                  NOIR & BEAN
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]/90">
                  Specialty Café & Cuisine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm tracking-widest uppercase transition-colors py-1 relative ${
                      isActive
                        ? 'text-[#C5A880] font-medium'
                        : 'text-[#E8DFD5]/80 hover:text-[#FBF8F3]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A880] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* QR Table detected banner */}
              {tableNumber && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/40 text-xs font-medium text-[#C5A880]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Table {tableNumber}</span>
                </div>
              )}

              {/* Cart Button */}
              <button
                id="cart-trigger-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label="View Cart"
                className="relative p-2.5 rounded-full bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 hover:border-[#C5A880] text-[#FBF8F3] transition-all flex items-center justify-center cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C5A880] text-[#1A1412] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Reserve CTA desktop */}
              <Link
                href="/reservation"
                className="hidden lg:inline-flex items-center justify-center px-5 py-2 text-xs uppercase tracking-widest font-semibold text-[#1A1412] bg-[#C5A880] hover:bg-[#D4B68D] rounded-full transition-all shadow-sm"
              >
                Book Table
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#E8DFD5] hover:text-white"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A1412] border-b border-[#C5A880]/20 px-4 pt-3 pb-6 space-y-3">
            {tableNumber && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/40 text-xs font-medium text-[#C5A880]">
                <MapPin className="w-4 h-4" />
                <span>Currently seated at Table {tableNumber}</span>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base tracking-wider uppercase ${
                  pathname === link.href
                    ? 'text-[#C5A880] bg-[#2A211C]'
                    : 'text-[#E8DFD5] hover:text-white hover:bg-[#231B17]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservation"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 px-4 rounded-full bg-[#C5A880] text-[#1A1412] font-semibold text-xs tracking-widest uppercase mt-4"
            >
              Book A Table
            </Link>
          </div>
        )}
      </header>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />
    </>
  );
}
