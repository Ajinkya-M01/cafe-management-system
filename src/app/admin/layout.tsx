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
  Clock,
} from 'lucide-react';
import { RoleBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: ('ADMIN' | 'MANAGER' | 'STAFF')[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',           href: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Orders Feed',         href: '/admin/orders',       icon: UtensilsCrossed },
  { label: 'Table Floor Plan',    href: '/admin/tables',       icon: MapPin },
  { label: 'Billing & POS',       href: '/admin/billing',      icon: Receipt },
  { label: 'Reservations',        href: '/admin/reservations', icon: CalendarCheck },
  { label: 'Menu Catalog',        href: '/admin/menu',         icon: BookOpen,   roles: ['ADMIN', 'MANAGER'] },
  { label: 'Guest Directory',     href: '/admin/customers',    icon: Users,      roles: ['ADMIN', 'MANAGER'] },
  { label: 'Reports & Analytics', href: '/admin/reports',      icon: BarChart3,  roles: ['ADMIN', 'MANAGER'] },
  { label: 'Settings & Staff',    href: '/admin/settings',     icon: Settings,   roles: ['ADMIN'] },
];

function UserInitials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0].slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/30 flex items-center justify-center font-bold text-[#C5A880] text-xs shrink-0 uppercase">
      {initials}
    </div>
  );
}

interface SidebarNavProps {
  pathname: string;
  user: { name: string; email: string; role: 'ADMIN' | 'MANAGER' | 'STAFF' };
  hasRole: (roles: ('ADMIN' | 'MANAGER' | 'STAFF')[]) => boolean;
  logout: () => void;
  onLinkClick?: () => void;
}

function SidebarNav({ pathname, user, hasRole, logout, onLinkClick }: SidebarNavProps) {
  return (
    <>
      {/* Brand header */}
      <div className="p-5 border-b border-[#C5A880]/15 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17] shrink-0">
          <Coffee className="w-4 h-4 text-[#C5A880]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-lg tracking-wider text-[#FBF8F3] leading-none">NOIR &amp; BEAN</h2>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] block mt-0.5">
            Operating System
          </span>
        </div>
      </div>

      {/* Current User Card */}
      <div className="px-4 py-3 shrink-0">
        <div className="p-3 rounded-xl bg-[#231B17] border border-[#C5A880]/15 flex items-center gap-3">
          <UserInitials name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#FBF8F3] truncate leading-none">{user.name}</p>
            <p className="text-[10px] text-[#A8988B] truncate mt-0.5">{user.email}</p>
          </div>
          <RoleBadge role={user.role} className="shrink-0" />
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 pb-2 space-y-0.5 overflow-y-auto" aria-label="Admin navigation">
        {NAV_ITEMS.filter((item) => !item.roles || hasRole(item.roles)).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onLinkClick}
              className={`sidebar-link group ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#14100E]' : 'text-[#C5A880] group-hover:text-[#E8DFD5]'}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-[#C5A880]/15 space-y-1 shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-[#A8988B] hover:text-[#FBF8F3] hover:bg-[#231B17] transition-colors min-h-[40px]"
        >
          <span>Customer Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer min-h-[44px]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}

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

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [pathname, isLoading, user, router]);

  // Close sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // For /admin/login, bypass layout wrapper
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14100E] text-[#FBF8F3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#231B17] border border-[#C5A880]/20 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-[#C5A880]" />
          </div>
          <Spinner size="md" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#A8988B]">Verifying credentials&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#171210] text-[#FBF8F3]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-[#1A1412] border-r border-[#C5A880]/15 shrink-0 h-screen sticky top-0">
        <SidebarNav
          pathname={pathname}
          user={user}
          hasRole={(roles) => hasRole(roles)}
          logout={logout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-[#1A1412] border-b border-[#C5A880]/15 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-[#E8DFD5] hover:text-white hover:bg-[#231B17] transition-colors cursor-pointer"
              aria-label={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileSidebarOpen}
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-live" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#A8988B] font-semibold">Live Service</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-[#C5A880] px-3 py-1.5 rounded-full bg-[#231B17] border border-[#C5A880]/20">
              <Clock className="w-3 h-3" />
              <span className="font-mono text-[11px] tabular-nums">{currentTime}</span>
            </div>

            {/* Role chip */}
            <div className="hidden sm:block">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-[#2A211C] border border-[#C5A880]/30 text-[#C5A880]">
                {user.role}
              </span>
            </div>

            {/* Mobile: user initials */}
            <div className="lg:hidden">
              <UserInitials name={user.name} />
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#1A1412] flex flex-col border-r border-[#C5A880]/15 transition-transform duration-300 ease-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!mobileSidebarOpen}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#C5A880]/15 shrink-0">
            <span className="font-serif text-lg text-[#FBF8F3]">NOIR &amp; BEAN</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 rounded-lg text-[#A8988B] hover:bg-[#231B17] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            <SidebarNav
              pathname={pathname}
              user={user}
              hasRole={(roles) => hasRole(roles)}
              logout={logout}
              onLinkClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#14100E] text-[#FBF8F3]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
