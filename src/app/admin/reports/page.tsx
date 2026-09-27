'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  DollarSign,
  ShoppingBag,
  MapPin,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
} from 'lucide-react';

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

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);

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
      ['Top Menu Items', 'Order Count', 'Revenue (INR)'],
      ...metrics.popularItems.map((item) => [item.name, item.count.toString(), item.revenue.toString()]),
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
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#A8988B]">Compiling analytics...</p>
      </div>
    );
  }

  const totalPayments =
    metrics.paymentBreakdown.UPI +
    metrics.paymentBreakdown.Card +
    metrics.paymentBreakdown.Cash || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Financial Ledger & Floor Performance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Executive Reports
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#FBF8F3] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Revenue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#A8988B] block">Today&apos;s Revenue</span>
          <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">₹{metrics.todayRevenue.toLocaleString()}</span>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{metrics.todayOrders} orders today</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#A8988B] block">This Week&apos;s Revenue</span>
          <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">₹{metrics.weekRevenue.toLocaleString()}</span>
          <p className="text-[11px] text-[#A8988B] pt-1">Rolling 7-day volume</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#A8988B] block">This Month&apos;s Revenue</span>
          <span className="text-2xl sm:text-3xl font-bold text-[#FBF8F3]">₹{metrics.monthRevenue.toLocaleString()}</span>
          <p className="text-[11px] text-[#A8988B] pt-1">Rolling 30-day volume</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#A8988B] block">Cumulative Total</span>
          <span className="text-2xl sm:text-3xl font-bold text-[#C5A880]">₹{metrics.totalRevenue.toLocaleString()}</span>
          <p className="text-[11px] text-[#A8988B] pt-1">{metrics.totalOrders} total orders processed</p>
        </div>
      </div>

      {/* Analytics Breakdown Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods Distribution */}
        <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-5">
          <h3 className="font-serif text-xl text-[#FBF8F3] pb-3 border-b border-[#C5A880]/15">
            Payment Mode Distribution
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#FBF8F3]">
                  <QrCode className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>UPI / QR ({metrics.paymentBreakdown.UPI})</span>
                </span>
                <span className="text-[#C5A880]">
                  {Math.round((metrics.paymentBreakdown.UPI / totalPayments) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#14100E] overflow-hidden">
                <div
                  className="h-full bg-[#C5A880] rounded-full"
                  style={{ width: `${(metrics.paymentBreakdown.UPI / totalPayments) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#FBF8F3]">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Card / POS ({metrics.paymentBreakdown.Card})</span>
                </span>
                <span className="text-blue-400">
                  {Math.round((metrics.paymentBreakdown.Card / totalPayments) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#14100E] overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(metrics.paymentBreakdown.Card / totalPayments) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#FBF8F3]">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cash / Counter ({metrics.paymentBreakdown.Cash})</span>
                </span>
                <span className="text-emerald-400">
                  {Math.round((metrics.paymentBreakdown.Cash / totalPayments) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#14100E] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(metrics.paymentBreakdown.Cash / totalPayments) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floor Utilization & Reservations */}
        <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-5">
          <h3 className="font-serif text-xl text-[#FBF8F3] pb-3 border-b border-[#C5A880]/15">
            Table & Floor Utilization
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/15 space-y-1">
              <span className="text-[10px] uppercase text-[#A8988B] block">Current Utilization</span>
              <span className="text-3xl font-bold text-[#C5A880]">{metrics.tableUtilization}%</span>
              <p className="text-[10px] text-[#7F7065]">{metrics.occupiedTables} of {metrics.totalTables} active</p>
            </div>

            <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/15 space-y-1">
              <span className="text-[10px] uppercase text-[#A8988B] block">Total Bookings</span>
              <span className="text-3xl font-bold text-[#FBF8F3]">{metrics.totalReservations}</span>
              <p className="text-[10px] text-[#7F7065]">{metrics.todayReservations} scheduled today</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#2A211C] border border-[#C5A880]/20 text-xs text-[#D8CCBD]">
            <strong className="text-[#C5A880] block mb-0.5">Peak Operating Hours:</strong>
            Highest turnover recorded between 11:30 AM – 02:00 PM (Brunch) and 07:30 PM – 10:30 PM (Dinner Degustation).
          </div>
        </div>
      </div>

      {/* Top Menu Curations Ranking Table */}
      <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#C5A880]/15 flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#FBF8F3]">Top Performing Menu Items</h3>
          <span className="text-xs text-[#A8988B]">Ranked by popularity & gross yield</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E8DFD5]">
            <thead className="uppercase text-[10px] text-[#A8988B] bg-[#171210] border-b border-[#C5A880]/20">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Menu Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Sales (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A880]/10">
              {metrics.popularItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#251D19]">
                  <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">#{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-[#FBF8F3]">{item.name}</td>
                  <td className="py-3 px-4 text-[#A8988B]">{item.category}</td>
                  <td className="py-3 px-4 font-bold">{item.count} units</td>
                  <td className="py-3 px-4 font-bold text-[#C5A880] text-right">
                    ₹{item.revenue.toLocaleString()}
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
