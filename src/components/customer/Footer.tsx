import React from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail, Clock, ArrowUpRight, ShieldCheck, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#100d0b] text-[#e8ddd0] border-t border-[#c5a880]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-[#c5a880]/30 flex items-center justify-center bg-[#231b17] shadow-sm">
                <Coffee className="w-5 h-5 text-[#c5a880]" />
              </div>
              <span className="font-serif text-2xl tracking-[0.18em] text-[#f9f6f1] leading-none">
                NOIR &amp; BEAN
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-bold">
              Coffee. Cuisine. Conversations.
            </p>
            <p className="text-xs text-[#a8988b] leading-relaxed">
              An architectural sanctuary designed for contemplative mornings, elevated culinary indulgences, and memorable gatherings.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#1f1815] border border-[#c5a880]/25 flex items-center justify-center text-[#c5a880] hover:bg-[#c5a880] hover:text-[#1a1412] transition-all duration-200"
                aria-label="Instagram"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#1f1815] border border-[#c5a880]/25 flex items-center justify-center text-[#c5a880] hover:bg-[#c5a880] hover:text-[#1a1412] transition-all duration-200"
                aria-label="Social Media"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Hours of Hospitality */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg tracking-wider text-[#f9f6f1] border-b border-[#c5a880]/15 pb-2">
              Hours of Hospitality
            </h3>
            <ul className="space-y-3 text-xs text-[#a8988b]">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#f9f6f1] font-medium">Monday – Friday</strong>
                  <span>08:00 AM – 11:30 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#f9f6f1] font-medium">Saturday – Sunday</strong>
                  <span>07:30 AM – Midnight</span>
                </div>
              </li>
              <li className="text-[11px] text-[#7f7065] pt-0.5">
                * Kitchen and brew bar take last orders 45 minutes prior to close.
              </li>
            </ul>
          </div>

          {/* Column 3: Concierge & Location */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg tracking-wider text-[#f9f6f1] border-b border-[#c5a880]/15 pb-2">
              Concierge &amp; Atelier
            </h3>
            <ul className="space-y-3 text-xs text-[#a8988b]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <span>42 Heritage Boulevard, Bandra West, Mumbai, MH 400050</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span className="font-mono">+91 98200 44921</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>concierge@noirandbean.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Guest Navigation */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg tracking-wider text-[#f9f6f1] border-b border-[#c5a880]/15 pb-2">
              Guest Navigation
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/menu"
                  className="text-[#a8988b] hover:text-[#c5a880] transition-colors flex items-center justify-between group py-0.5"
                >
                  <span>Digital Menu &amp; Ordering</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/reservation"
                  className="text-[#a8988b] hover:text-[#c5a880] transition-colors flex items-center justify-between group py-0.5"
                >
                  <span>Table Reservations</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-[#a8988b] hover:text-[#c5a880] transition-colors flex items-center justify-between group py-0.5"
                >
                  <span>Current Cart / Bill</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#a8988b] hover:text-[#c5a880] transition-colors flex items-center justify-between group py-0.5"
                >
                  <span>Directions &amp; Contact</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#c5a880]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7f7065] gap-4">
          <p>&copy; {new Date().getFullYear()} NOIR &amp; BEAN Artisanal Café. All rights reserved. GSTIN: 27AABCU9603R1ZM</p>
          <div className="flex items-center gap-5">
            <span className="text-[#a8988b]">Crafted with Precision &amp; Poise</span>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-[#c5a880] hover:text-[#dfc8a5] transition-colors px-3 py-1.5 rounded-xl bg-[#1f1815] border border-[#c5a880]/25 text-[11px] font-semibold"
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
