'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  MapPin,
  Receipt,
  CalendarCheck,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Coffee,
  ExternalLink,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: ('ADMIN' | 'MANAGER' | 'STAFF')[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders Feed', href: '/admin/orders', icon: UtensilsCrossed },
  { label: 'Table Floor Plan', href: '/admin/tables', icon: MapPin },
  { label: 'Billing & POS', href: '/admin/billing', icon: Receipt },
  { label: 'Reservations', href: '/admin/reservations', icon: CalendarCheck },
  { label: 'Menu Catalog', href: '/admin/menu', icon: BookOpen, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Guest Directory', href: '/admin/customers', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Settings & Staff', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, hasRole } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock in topbar
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // For /admin/login, bypass layout wrapper
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14100E] text-[#FBF8F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#A8988B]">Verifying atelier credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#171210] text-[#FBF8F3]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#1A1412] border-r border-[#C5A880]/20 shrink-0">
        {/* Brand header */}
        <div className="p-6 border-b border-[#C5A880]/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17]">
            <Coffee className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div>
            <h2 className="font-serif text-lg tracking-wider text-[#FBF8F3]">NOIR & BEAN</h2>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">
              Operating System
            </span>
          </div>
        </div>

        {/* Current User Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-[#231B17] border border-[#C5A880]/20 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#FBF8F3] truncate">{user.name}</p>
            <p className="text-[10px] text-[#A8988B] truncate">{user.email}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${
              user.role === 'ADMIN'
                ? 'bg-[#C5A880] text-[#14100E]'
                : user.role === 'MANAGER'
                ? 'bg-amber-800 text-white'
                : 'bg-emerald-900 text-emerald-200'
            }`}
          >
            {user.role}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.filter((item) => !item.roles || hasRole(item.roles)).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#C5A880] text-[#14100E] font-semibold shadow-xs'
                    : 'text-[#D8CCBD] hover:bg-[#231B17] hover:text-[#FBF8F3]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#14100E]' : 'text-[#C5A880]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-[#C5A880]/20 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#A8988B] hover:text-[#FBF8F3] hover:bg-[#231B17] transition-colors"
          >
            <span>Customer Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[#1A1412] border-b border-[#C5A880]/20 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-[#E8DFD5] hover:text-white"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-[#A8988B] font-semibold">
                Live Service
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-[#C5A880] px-3 py-1 rounded-full bg-[#231B17] border border-[#C5A880]/20">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{currentTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#A8988B] hidden sm:inline">Role:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#2A211C] border border-[#C5A880]/40 text-[#C5A880]">
                {user.role}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
            <div className="w-72 bg-[#1A1412] h-full flex flex-col p-4 border-r border-[#C5A880]/20">
              <div className="flex items-center justify-between pb-4 border-b border-[#C5A880]/20 mb-4">
                <span className="font-serif text-lg text-[#FBF8F3]">NOIR & BEAN</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-[#A8988B]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {NAV_ITEMS.filter((item) => !item.roles || hasRole(item.roles)).map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-[#C5A880] text-[#14100E] font-semibold'
                          : 'text-[#D8CCBD] hover:bg-[#231B17]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#C5A880]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 mt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#14100E] text-[#FBF8F3]">
          {children}
        </main>
      </div>
    </div>
  );
}
