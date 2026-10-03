'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu as MenuIcon, X, MapPin, Coffee } from 'lucide-react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen, tableNumber } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Reservations', href: '/reservation' },
    { label: 'Atmosphere', href: '/#atmosphere' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 text-[#FBF8F3] transition-all duration-500 ${
          scrolled
            ? 'bg-[#1A1412]/98 backdrop-blur-xl nav-scrolled border-b border-[#C5A880]/25'
            : 'bg-[#1A1412]/90 backdrop-blur-md border-b border-[#C5A880]/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17] group-hover:border-[#C5A880] group-hover:bg-[#2A211C] transition-all duration-300">
                <Coffee className="w-4 h-4 text-[#C5A880]" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-[1.35rem] tracking-[0.18em] font-medium text-[#FBF8F3] group-hover:text-[#C5A880] transition-colors duration-300">
                  NOIR &amp; BEAN
                </span>
                <span className="text-[9px] uppercase tracking-[0.28em] text-[#C5A880]/70 mt-0.5">
                  Specialty Café &amp; Cuisine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-[11px] tracking-[0.18em] uppercase transition-all duration-200 py-1 relative ${
                      isActive
                        ? 'text-[#C5A880] font-semibold'
                        : 'text-[#E8DFD5]/70 hover:text-[#FBF8F3]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#C5A880] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* QR Table detected badge */}
              {tableNumber && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C5A880]/12 border border-[#C5A880]/35 text-[11px] font-medium text-[#C5A880]">
                  <MapPin className="w-3 h-3" />
                  <span>Table {tableNumber}</span>
                </div>
              )}

              {/* Cart Button */}
              <button
                id="cart-trigger-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label="View Cart"
                className="relative p-2 rounded-full bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/25 hover:border-[#C5A880]/60 text-[#FBF8F3] transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                <ShoppingBag className="w-[18px] h-[18px] text-[#C5A880]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C5A880] text-[#1A1412] text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Reserve CTA desktop */}
              <Link
                href="/reservation"
                className="hidden lg:inline-flex items-center justify-center px-5 py-2 text-[10px] uppercase tracking-[0.18em] font-bold text-[#1A1412] bg-[#C5A880] hover:bg-[#D4B68D] rounded-full transition-all duration-200 shadow-sm"
              >
                Book Table
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#E8DFD5] hover:text-white transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A1412] border-b border-[#C5A880]/20 px-4 pt-2 pb-6 space-y-1">
            {tableNumber && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-[#C5A880]/12 border border-[#C5A880]/35 text-xs font-medium text-[#C5A880]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Seated at Table {tableNumber}</span>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm tracking-[0.12em] uppercase font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#C5A880] bg-[#231B17]'
                    : 'text-[#E8DFD5]/80 hover:text-white hover:bg-[#231B17]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservation"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-3 px-4 rounded-full bg-[#C5A880] text-[#1A1412] font-bold text-xs tracking-[0.18em] uppercase mt-4"
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
