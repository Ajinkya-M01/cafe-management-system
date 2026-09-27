import React from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail, Clock, ArrowUpRight, ShieldCheck, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#14100E] text-[#E8DFD5] border-t border-[#C5A880]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17]">
                <Coffee className="w-5 h-5 text-[#C5A880]" />
              </div>
              <span className="font-serif text-2xl tracking-[0.15em] text-[#FBF8F3]">
                NOIR & BEAN
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-medium">
              Coffee. Cuisine. Conversations.
            </p>
            <p className="text-sm text-[#A8988B] leading-relaxed">
              An architectural sanctuary designed for contemplative mornings, elevated culinary indulgences, and memorable gatherings.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#201815] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] hover:bg-[#C5A880] hover:text-[#14100E] transition-all"
                aria-label="Instagram"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#201815] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] hover:bg-[#C5A880] hover:text-[#14100E] transition-all"
                aria-label="Social"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg tracking-wider text-[#FBF8F3] border-b border-[#C5A880]/20 pb-2">
              Hours of Hospitality
            </h3>
            <ul className="space-y-3 text-sm text-[#A8988B]">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#E8DFD5] font-medium">Monday – Friday</strong>
                  <span>08:00 AM – 11:30 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#E8DFD5] font-medium">Saturday – Sunday</strong>
                  <span>07:30 AM – Midnight</span>
                </div>
              </li>
              <li className="text-xs text-[#8C7A6D] pt-1">
                * Kitchen and specialty brew bar remain open until 45 minutes prior to closing.
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Concierge */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg tracking-wider text-[#FBF8F3] border-b border-[#C5A880]/20 pb-2">
              Concierge & Atelier
            </h3>
            <ul className="space-y-3 text-sm text-[#A8988B]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>42 Heritage Boulevard, Bandra West, Mumbai, MH 400050</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>+91 98200 44921</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>concierge@noirandbean.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg tracking-wider text-[#FBF8F3] border-b border-[#C5A880]/20 pb-2">
              Guest Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-[#C5A880] transition-colors flex items-center justify-between group">
                  <span>Digital Menu & Ordering</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="hover:text-[#C5A880] transition-colors flex items-center justify-between group">
                  <span>Table Reservations</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#C5A880] transition-colors flex items-center justify-between group">
                  <span>Current Order</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C5A880] transition-colors flex items-center justify-between group">
                  <span>Directions & Contact</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#C5A880]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7F7065] gap-4">
          <p>© {new Date().getFullYear()} NOIR & BEAN Artisanal Café. All rights reserved. GSTIN: 27AABCU9603R1ZM</p>
          <div className="flex items-center gap-6">
            <span className="text-[#A8988B]">Crafted with Precision & Passion</span>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-[#C5A880]/80 hover:text-[#C5A880] transition-colors px-2.5 py-1 rounded-md bg-[#201815] border border-[#C5A880]/20 text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
