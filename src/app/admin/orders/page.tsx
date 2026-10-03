'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types';
import {
  Search,
  Eye,
  XCircle,
  RefreshCw,
  X,
  MapPin,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (dateFilter !== 'all') query.set('dateFilter', dateFilter);
      if (search.trim()) query.set('search', search.trim());

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter, search]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const DATE_FILTERS = ['today', 'yesterday', 'week', 'month', 'all'];
  const STATUS_FILTERS = ['all', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Kitchen & Front-of-House"
        title="Order Management"
        action={
          <button
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F1815] border border-[#C5A880]/30 hover:border-[#C5A880] text-xs font-semibold text-[#E8DFD5] cursor-pointer transition-colors min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6D]" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, phone, or table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-sm text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/12 transition-colors"
              aria-label="Search orders"
            />
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0" role="group" aria-label="Filter by date">
            {DATE_FILTERS.map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors shrink-0 cursor-pointer min-h-[36px] ${
                  dateFilter === df
                    ? 'bg-[#C5A880] text-[#14100E]'
                    : 'bg-[#14100E] text-[#A8988B] hover:text-white border border-[#C5A880]/20 hover:border-[#C5A880]/50'
                }`}
                aria-pressed={dateFilter === df}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors shrink-0 cursor-pointer min-h-[32px] ${
                statusFilter === st
                  ? 'bg-[#FBF8F3] text-[#14100E] font-semibold'
                  : 'bg-[#2A211C] text-[#D8CCBD] hover:bg-[#342A24]'
              }`}
              aria-pressed={statusFilter === st}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Location</th>
                <th scope="col">Items</th>
                <th scope="col">Total</th>
                <th scope="col">Time</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={8} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No orders found"
                      description="Try adjusting your date range or status filter."
                      variant="search"
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono font-bold text-[#C5A880]">{order.orderNumber}</td>
                    <td>
                      <div className="font-semibold text-[#FBF8F3]">{order.customerName}</div>
                      <div className="text-[10px] text-[#A8988B]">{order.customerPhone}</div>
                    </td>
                    <td>
                      {order.type === 'dine-in' ? (
                        <span className="inline-flex items-center gap-1.5 text-[#C5A880] font-semibold text-[11px]">
                          <MapPin className="w-3 h-3" />
                          Table {order.tableNumber || 'Unassigned'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                          <Clock className="w-3 h-3" />
                          Pickup ({order.pickupTime || '15 min'})
                        </span>
                      )}
                    </td>
                    <td className="max-w-[180px]">
                      <span className="truncate block text-[11px]">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>
                    <td className="font-bold text-[#FBF8F3]">&#8377;{order.grandTotal.toFixed(0)}</td>
                    <td className="text-[11px] text-[#A8988B]">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-[#2A211C] hover:bg-[#342A24] text-[#C5A880] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="View order details"
                          aria-label={`View details for order ${order.orderNumber}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                            className="px-2 py-1 rounded-lg bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 text-[10px] font-bold border border-blue-700/50 cursor-pointer transition-colors min-h-[28px]"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                            className="px-2 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 text-[10px] font-bold border border-purple-700/50 cursor-pointer transition-colors min-h-[28px]"
                          >
                            Cook
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Ready')}
                            className="px-2 py-1 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 text-[10px] font-bold border border-emerald-700/50 cursor-pointer transition-colors min-h-[28px]"
                          >
                            Ready
                          </button>
                        )}
                        {order.status === 'Ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Completed')}
                            className="px-2 py-1 rounded-lg bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-[10px] font-bold cursor-pointer transition-colors min-h-[28px]"
                          >
                            Done
                          </button>
                        )}
                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                            className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                            title="Cancel order"
                            aria-label={`Cancel order ${order.orderNumber}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && orders.length > 0 && (
          <div className="px-5 py-3 border-t border-[#C5A880]/10 flex items-center justify-between text-[11px] text-[#A8988B]">
            <span>{orders.length} order{orders.length !== 1 ? 's' : ''} shown</span>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Order details for ${selectedOrder.orderNumber}`}
        >
          <div className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-lg w-full p-6 text-[#FBF8F3] shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#C5A880]/15">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold block mb-1">
                  Order Details
                </span>
                <h3 className="font-serif text-2xl text-[#FBF8F3]">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-[#2A211C] text-[#A8988B] transition-colors cursor-pointer"
                aria-label="Close order details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] uppercase text-[#7F7065] mb-1">Customer</span>
                <strong className="text-[#FBF8F3] text-sm block">{selectedOrder.customerName}</strong>
                <p className="text-[#A8988B]">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-[#7F7065] mb-1">Fulfillment</span>
                <strong className="text-[#C5A880] text-sm block">
                  {selectedOrder.type === 'dine-in'
                    ? `Dine-In, Table ${selectedOrder.tableNumber || 'Unassigned'}`
                    : `Takeaway, Pickup ${selectedOrder.pickupTime || '15 min'}`}
                </strong>
                <StatusBadge status={selectedOrder.status} className="mt-1" />
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 rounded-xl bg-[#2A211C] text-xs text-[#D8CCBD]">
                <strong className="text-[#C5A880] block mb-0.5">Chef Note:</strong>
                &ldquo;{selectedOrder.notes}&rdquo;
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2 border-y border-[#C5A880]/12 py-4 max-h-48 overflow-y-auto">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium text-[#FBF8F3]">{item.name}</span>
                    <span className="text-[#A8988B] ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#FBF8F3]">
                    &#8377;{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs text-[#A8988B]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>&#8377;{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%)</span>
                <span>&#8377;{selectedOrder.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%)</span>
                <span>&#8377;{selectedOrder.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#FBF8F3] pt-2.5 border-t border-[#C5A880]/12 mt-1">
                <span>Grand Total</span>
                <span className="text-[#C5A880]">&#8377;{selectedOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#D8CCBD] hover:bg-[#342A24] transition-colors cursor-pointer"
              >
                Close
              </button>
              {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')}
                  className="px-5 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-xs font-bold cursor-pointer transition-colors"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
