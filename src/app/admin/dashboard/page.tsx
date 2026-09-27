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

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
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

  if (loading || !metrics) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#A8988B]">Aggregating café metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Real-Time Operations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Café Executive Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/billing"
            className="px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span>POS Billing Terminal</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Sales */}
        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A8988B] mb-2">
            <span className="uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#2A211C] flex items-center justify-center text-[#C5A880]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">
              ₹{metrics.todayRevenue.toLocaleString()}
            </span>
            <p className="text-[11px] text-[#A8988B] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Week Total: ₹{metrics.weekRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A8988B] mb-2">
            <span className="uppercase tracking-wider">Today&apos;s Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#2A211C] flex items-center justify-center text-[#C5A880]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">
              {metrics.todayOrders}
            </span>
            <p className="text-[11px] text-[#A8988B] mt-1">
              <span className="text-amber-400 font-semibold">{metrics.pendingOrders} pending</span> • {metrics.preparingOrders} in kitchen
            </p>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A8988B] mb-2">
            <span className="uppercase tracking-wider">Table Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-[#2A211C] flex items-center justify-center text-[#C5A880]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">
              {metrics.occupiedTables} / 10
            </span>
            <p className="text-[11px] text-[#A8988B] mt-1">
              {metrics.tableUtilization}% Utilization • {metrics.availableTables} Available
            </p>
          </div>
        </div>

        {/* Reservations Today */}
        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#A8988B] mb-2">
            <span className="uppercase tracking-wider">Today&apos;s Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-[#2A211C] flex items-center justify-center text-[#C5A880]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">
              {metrics.todayReservations}
            </span>
            <p className="text-[11px] text-[#A8988B] mt-1">
              Reserved dining tables on schedule
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Live Orders Feed & Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Order Stream */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="font-serif text-xl text-[#FBF8F3]">Active Kitchen Feed</h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#C5A880] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#C5A880]/10">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-[#A8988B] py-8 text-center">No recent orders registered.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#C5A880] tracking-wider">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#FBF8F3] font-medium">
                        • {order.customerName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A211C] border border-[#C5A880]/30 text-[#D8CCBD]">
                        {order.type === 'dine-in' ? `Table ${order.tableNumber || '--'}` : 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-xs text-[#A8988B]">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#FBF8F3]">
                      ₹{order.grandTotal.toFixed(2)}
                    </span>

                    {/* Quick status button */}
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                        className="px-3 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-semibold border border-amber-700/60 cursor-pointer"
                      >
                        Start Prep
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                        className="px-3 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-700/60 cursor-pointer"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                        className="px-3 py-1 rounded-lg bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    {order.status === 'Completed' && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#2A211C] text-xs text-[#A8988B]">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Top Selling Curations */}
        <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#C5A880]/15">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <h3 className="font-serif text-xl text-[#FBF8F3]">Top Curations</h3>
          </div>

          <div className="space-y-3.5">
            {metrics.popularItems.map((item, idx) => (
              <div
                key={item.name}
                className="p-3 rounded-xl bg-[#251D19] border border-[#C5A880]/15 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-bold text-[#C5A880] w-4">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-[#FBF8F3] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#A8988B]">{item.count} orders placed</p>
                  </div>
                </div>
                <span className="font-bold text-[#FBF8F3] shrink-0">
                  ₹{item.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/reports"
              className="w-full py-2.5 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] text-center block transition-colors"
            >
              View Full Analytics Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
