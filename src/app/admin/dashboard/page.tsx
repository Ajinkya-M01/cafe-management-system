'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Order } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { SkeletonKpiCard, SkeletonTableRow } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface DashboardMetrics {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  occupiedTables: number;
  availableTables: number;
  tableUtilization: number;
  todayReservations: number;
  popularItems: { name: string; count: number; revenue: number }[];
}

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: React.ElementType;
  iconColor?: string;
  delay?: string;
}

function KpiCard({ label, value, sub, icon: Icon, iconColor = 'text-[#C5A880]', delay = '' }: KpiCardProps) {
  return (
    <div className={`p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 flex flex-col justify-between gap-3 animate-reveal-up ${delay} hover:border-[#C5A880]/35 transition-colors`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#A8988B] font-semibold">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-[#2A211C] flex items-center justify-center shrink-0">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-[#FBF8F3] leading-none">{value}</div>
        <div className="text-[11px] text-[#A8988B] mt-1.5 flex items-center gap-1">{sub}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/reports'),
        fetch('/api/admin/orders?status=all'),
      ]);

      const reportsData = await reportsRes.json();
      const ordersData = await ordersRes.json();

      if (reportsData.success) {
        setMetrics(reportsData.metrics);
      }
      if (ordersData.success) {
        setRecentOrders(ordersData.orders.slice(0, 6));
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // live polling
    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#1F1815] border border-red-900/40 flex items-center gap-3 text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="ml-auto px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-reveal-up">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold block mb-1.5">
            Real-Time Operations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3] leading-tight">
            Executive Dashboard
          </h1>
        </div>
        <Link
          href="/admin/billing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-xs uppercase tracking-wider font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 shrink-0"
        >
          <span>POS Billing Terminal</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonKpiCard key={i} />)}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            label="Today's Revenue"
            value={<>&#8377;{metrics.todayRevenue.toLocaleString()}</>}
            sub={
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Week: &#8377;{metrics.weekRevenue.toLocaleString()}</span>
              </>
            }
            icon={DollarSign}
            delay="delay-0"
          />
          <KpiCard
            label="Today's Orders"
            value={metrics.todayOrders}
            sub={
              <>
                <span className="text-amber-400 font-semibold">{metrics.pendingOrders} pending</span>
                <span className="text-[#7F7065]">&nbsp;&bull; {metrics.preparingOrders} in kitchen</span>
              </>
            }
            icon={ShoppingBag}
            delay="delay-75"
          />
          <KpiCard
            label="Table Occupancy"
            value={<>{metrics.occupiedTables} <span className="text-[#A8988B] text-lg font-medium">/ 10</span></>}
            sub={
              <>
                <span>{metrics.tableUtilization}% utilization</span>
                <span className="text-[#7F7065]">&nbsp;&bull; {metrics.availableTables} free</span>
              </>
            }
            icon={MapPin}
            delay="delay-150"
          />
          <KpiCard
            label="Today's Bookings"
            value={metrics.todayReservations}
            sub={<span>Reserved dining tables</span>}
            icon={Calendar}
            delay="delay-200"
          />
        </div>
      ) : null}

      {/* Grid: Live Orders Feed & Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Order Stream */}
        <div className="lg:col-span-2 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 overflow-hidden animate-reveal-up delay-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A880]/15">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 status-dot-live" />
              <h2 className="font-serif text-xl text-[#FBF8F3]">Active Kitchen Feed</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#C5A880] hover:text-[#DFC8A5] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={4} />
                ))}
              </tbody>
            </table>
          ) : recentOrders.length === 0 ? (
            <EmptyState
              title="Kitchen is quiet"
              description="No active orders at the moment. New orders will appear here automatically."
              variant="default"
            />
          ) : (
            <div className="divide-y divide-[#C5A880]/08">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#251D19] transition-colors">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#C5A880] tracking-wider font-mono">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#FBF8F3] font-medium">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A211C] border border-[#C5A880]/25 text-[#D8CCBD]">
                        {order.type === 'dine-in' ? `Table ${order.tableNumber || '--'}` : 'Takeaway'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A8988B] truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-bold text-[#FBF8F3]">
                      &#8377;{order.grandTotal.toFixed(0)}
                    </span>
                    <StatusBadge status={order.status} />

                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                        className="px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800/70 text-amber-200 text-[10px] font-bold border border-amber-800/50 cursor-pointer transition-colors min-h-[32px]"
                      >
                        Start Prep
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 text-[10px] font-bold border border-emerald-800/50 cursor-pointer transition-colors min-h-[32px]"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                        className="px-3 py-1.5 rounded-lg bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-[10px] font-bold cursor-pointer transition-colors min-h-[32px]"
                      >
                        Complete
                      </button>
                    )}
                    {order.status === 'Completed' && (
                      <span className="p-1.5 rounded-lg bg-[#2A211C]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#A8988B]" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Top Selling Items */}
        <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 overflow-hidden animate-reveal-up delay-300">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#C5A880]/15">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <h2 className="font-serif text-xl text-[#FBF8F3]">Top Curations</h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" style={{ height: 56 }} />
              ))}
            </div>
          ) : metrics && metrics.popularItems.length > 0 ? (
            <div className="p-4 space-y-2">
              {metrics.popularItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-[#251D19] border border-[#C5A880]/12 flex items-center justify-between gap-3 hover:border-[#C5A880]/25 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#C5A880] w-5 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#FBF8F3] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#A8988B]">{item.count} orders</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FBF8F3] shrink-0">
                    &#8377;{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No data yet" description="Popular items will appear as orders come in." />
          )}

          <div className="px-4 pb-4">
            <Link
              href="/admin/reports"
              className="w-full py-2.5 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/25 text-xs font-semibold text-[#C5A880] text-center block transition-colors"
            >
              View Full Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
