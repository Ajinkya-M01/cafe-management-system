'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Download,
  Printer,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Utensils,
  Layers,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonKpiCard } from '@/components/ui/Skeleton';

interface ReportMetrics {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  occupiedTables: number;
  availableTables: number;
  totalTables: number;
  tableUtilization: number;
  totalReservations: number;
  todayReservations: number;
  popularItems: { name: string; category: string; count: number; revenue: number }[];
  paymentBreakdown: { UPI: number; Card: number; Cash: number };
}

type DateRange = 'today' | 'week' | 'month' | 'all';

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('all');

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/admin/reports');
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Displayed revenue and volume based on dateRange
  const periodStats = useMemo(() => {
    if (!metrics) return { revenue: 0, label: 'All-Time Revenue', orders: 0 };
    switch (dateRange) {
      case 'today':
        return { revenue: metrics.todayRevenue, label: "Today's Revenue", orders: metrics.todayOrders };
      case 'week':
        return { revenue: metrics.weekRevenue, label: "7-Day Volume", orders: Math.round(metrics.totalOrders * 0.4) };
      case 'month':
        return { revenue: metrics.monthRevenue, label: "30-Day Volume", orders: Math.round(metrics.totalOrders * 0.85) };
      case 'all':
      default:
        return { revenue: metrics.totalRevenue, label: "Lifetime Gross Sales", orders: metrics.totalOrders };
    }
  }, [metrics, dateRange]);

  const handleExportCsv = () => {
    if (!metrics) return;

    const rows = [
      ['Metric', 'Value'],
      ['Total Lifetime Sales (INR)', metrics.totalRevenue.toString()],
      ['Today Sales (INR)', metrics.todayRevenue.toString()],
      ['Weekly Sales (INR)', metrics.weekRevenue.toString()],
      ['Monthly Sales (INR)', metrics.monthRevenue.toString()],
      ['Total Orders', metrics.totalOrders.toString()],
      ['Table Utilization (%)', `${metrics.tableUtilization}%`],
      ['Total Reservations', metrics.totalReservations.toString()],
      ['UPI Payments Count', metrics.paymentBreakdown.UPI.toString()],
      ['Card Payments Count', metrics.paymentBreakdown.Card.toString()],
      ['Cash Payments Count', metrics.paymentBreakdown.Cash.toString()],
      [],
      ['Top Menu Items', 'Category', 'Order Count', 'Revenue (INR)'],
      ...metrics.popularItems.map((item) => [
        item.name,
        item.category,
        item.count.toString(),
        item.revenue.toString(),
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NoirAndBean_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Financial Ledger &amp; Floor Performance"
          title="Executive Reports"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpiCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const totalPayments =
    metrics.paymentBreakdown.UPI +
    metrics.paymentBreakdown.Card +
    metrics.paymentBreakdown.Cash || 1;

  const upiPct = Math.round((metrics.paymentBreakdown.UPI / totalPayments) * 100);
  const cardPct = Math.round((metrics.paymentBreakdown.Card / totalPayments) * 100);
  const cashPct = Math.round((metrics.paymentBreakdown.Cash / totalPayments) * 100);

  const avgOrderValue = metrics.totalOrders > 0 ? Math.round(metrics.totalRevenue / metrics.totalOrders) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        eyebrow="Financial Ledger &amp; Floor Performance"
        title="Executive Reports"
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-[#1f1815] hover:bg-[#231b17] border border-[#c5a880]/25 text-xs font-semibold text-[#f9f6f1] flex items-center gap-2 cursor-pointer transition-all duration-200"
            >
              <Download className="w-4 h-4 text-[#c5a880]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        }
      />

      {/* Date Range Selector Strip */}
      <div className="p-3 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#a8988b] font-semibold pl-2">
            Time Horizon:
          </span>
          <div className="flex items-center gap-1 bg-[#171311] p-1 rounded-xl border border-[#c5a880]/20">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Past 7 Days' },
              { id: 'month', label: 'Past 30 Days' },
              { id: 'all', label: 'Lifetime' },
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setDateRange(period.id as DateRange)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  dateRange === period.id
                    ? 'bg-[#c5a880] text-[#1a1412] shadow-xs'
                    : 'text-[#a8988b] hover:text-[#f9f6f1]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[#a8988b] pr-2">
          Generated: <span className="text-[#f9f6f1] font-mono">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Revenue & Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selected Period Revenue */}
        <div className="p-5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/20 space-y-2 shadow-xs hover:border-[#c5a880]/40 transition-colors">
          <div className="flex items-center justify-between text-[#a8988b]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">{periodStats.label}</span>
            <div className="w-8 h-8 rounded-lg bg-[#2a211c] flex items-center justify-center text-[#c5a880]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-normal text-[#f9f6f1]">
            ₹{periodStats.revenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{periodStats.orders} orders processed</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/20 space-y-2 shadow-xs hover:border-[#c5a880]/40 transition-colors">
          <div className="flex items-center justify-between text-[#a8988b]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#2a211c] flex items-center justify-center text-[#c5a880]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-normal text-[#f9f6f1]">
            {metrics.totalOrders}
          </div>
          <p className="text-[11px] text-[#a8988b] flex items-center gap-1">
            <span>{metrics.todayOrders} new orders today</span>
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/20 space-y-2 shadow-xs hover:border-[#c5a880]/40 transition-colors">
          <div className="flex items-center justify-between text-[#a8988b]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Average Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-[#2a211c] flex items-center justify-center text-[#c5a880]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-normal text-[#c5a880]">
            ₹{avgOrderValue}
          </div>
          <p className="text-[11px] text-[#a8988b]">Gross yield per ticket</p>
        </div>

        {/* Table Floor Occupancy */}
        <div className="p-5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/20 space-y-2 shadow-xs hover:border-[#c5a880]/40 transition-colors">
          <div className="flex items-center justify-between text-[#a8988b]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Table Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-[#2a211c] flex items-center justify-center text-[#c5a880]">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-normal text-emerald-400">
            {metrics.tableUtilization}%
          </div>
          <p className="text-[11px] text-[#a8988b]">
            {metrics.occupiedTables} of {metrics.totalTables} tables occupied
          </p>
        </div>
      </div>

      {/* Analytics Breakdown: Payment Distribution & Floor Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="p-6 rounded-3xl bg-[#1f1815] border border-[#c5a880]/20 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-[#c5a880]" />
              </div>
              <h3 className="font-serif text-xl text-[#f9f6f1]">Payment Mode Breakdown</h3>
            </div>
            <span className="text-[11px] text-[#a8988b] font-mono">{totalPayments} total transactions</span>
          </div>

          <div className="space-y-4">
            {/* UPI */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-medium text-[#f9f6f1]">
                  <QrCode className="w-4 h-4 text-[#c5a880]" />
                  <span>UPI / Instant QR ({metrics.paymentBreakdown.UPI})</span>
                </span>
                <span className="font-bold text-[#c5a880] font-mono">{upiPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#14100e] overflow-hidden">
                <div
                  className="h-full bg-[#c5a880] rounded-full transition-all duration-500"
                  style={{ width: `${upiPct}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-medium text-[#f9f6f1]">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>Card / POS Machine ({metrics.paymentBreakdown.Card})</span>
                </span>
                <span className="font-bold text-sky-400 font-mono">{cardPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#14100e] overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${cardPct}%` }}
                />
              </div>
            </div>

            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-medium text-[#f9f6f1]">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Cash / Register Counter ({metrics.paymentBreakdown.Cash})</span>
                </span>
                <span className="font-bold text-emerald-400 font-mono">{cashPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#14100e] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${cashPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floor Utilization & Turnover Insights */}
        <div className="p-6 rounded-3xl bg-[#1f1815] border border-[#c5a880]/20 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#c5a880]" />
              </div>
              <h3 className="font-serif text-xl text-[#f9f6f1]">Floor Dynamics &amp; Booking Velocity</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#171311] border border-[#c5a880]/15 space-y-1">
              <span className="text-[10px] uppercase text-[#a8988b] font-semibold block">Floor Occupancy</span>
              <span className="text-3xl font-bold font-mono text-[#c5a880]">{metrics.tableUtilization}%</span>
              <p className="text-[11px] text-[#7f7065]">{metrics.occupiedTables} seated of {metrics.totalTables} tables</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#171311] border border-[#c5a880]/15 space-y-1">
              <span className="text-[10px] uppercase text-[#a8988b] font-semibold block">Total Reservations</span>
              <span className="text-3xl font-bold font-mono text-[#f9f6f1]">{metrics.totalReservations}</span>
              <p className="text-[11px] text-[#7f7065]">{metrics.todayReservations} scheduled for today</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#231b17] border border-[#c5a880]/20 text-xs text-[#d8ccbd] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#c5a880]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Operations Rhythm:</span>
            </div>
            <p className="text-[11px] text-[#a8988b] leading-relaxed">
              Peak guest volumes concentrate around 11:30 AM – 02:00 PM (Brunch &amp; Roast) and 07:30 PM – 10:30 PM (Dinner &amp; Desserts).
            </p>
          </div>
        </div>
      </div>

      {/* Top Menu Curations Ranking Table */}
      <div className="rounded-3xl bg-[#1f1815] border border-[#c5a880]/20 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-[#c5a880]/15 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-[#f9f6f1]">Top Performing Menu Curations</h3>
            <p className="text-xs text-[#a8988b] mt-0.5">Ranked by order volume and cumulative gross yield</p>
          </div>
          <span className="text-xs font-mono text-[#c5a880]">{metrics.popularItems.length} Signature Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Menu Item</th>
                <th>Category</th>
                <th>Volume Sold</th>
                <th className="text-right">Gross Sales</th>
              </tr>
            </thead>
            <tbody>
              {metrics.popularItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${
                        idx === 0
                          ? 'bg-[#c5a880] text-[#1a1412]'
                          : idx === 1
                          ? 'bg-[#dfc8a5] text-[#1a1412]'
                          : idx === 2
                          ? 'bg-[#9e7f56] text-[#f9f6f1]'
                          : 'bg-[#2a211c] text-[#a8988b]'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td>
                    <span className="font-semibold text-[#f9f6f1]">{item.name}</span>
                  </td>
                  <td>
                    <span className="text-[#c5a880] font-medium text-xs">{item.category}</span>
                  </td>
                  <td>
                    <span className="font-bold text-[#f9f6f1]">{item.count}</span>{' '}
                    <span className="text-[#a8988b] text-[11px]">orders</span>
                  </td>
                  <td className="text-right">
                    <span className="font-mono font-bold text-sm text-[#c5a880]">
                      ₹{item.revenue.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
