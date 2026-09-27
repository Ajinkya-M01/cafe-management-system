'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
  RefreshCw,
  ShoppingBag,
  X,
} from 'lucide-react';

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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-950/70 text-amber-300 border-amber-800';
      case 'Confirmed':
        return 'bg-blue-950/70 text-blue-300 border-blue-800';
      case 'Preparing':
        return 'bg-purple-950/70 text-purple-300 border-purple-800';
      case 'Ready':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
      case 'Completed':
        return 'bg-[#251D19] text-[#A8988B] border-[#C5A880]/20';
      case 'Cancelled':
        return 'bg-red-950/70 text-red-400 border-red-900';
      default:
        return 'bg-[#251D19] text-[#FBF8F3]';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Kitchen & Front-of-House
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Order Management
          </h1>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchOrders();
          }}
          className="px-4 py-2 rounded-xl bg-[#201815] border border-[#C5A880]/30 hover:border-[#C5A880] text-xs font-semibold text-[#E8DFD5] flex items-center gap-2 cursor-pointer transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6D]" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, or Table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {['today', 'yesterday', 'week', 'month', 'all'].map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 cursor-pointer ${
                  dateFilter === df
                    ? 'bg-[#C5A880] text-[#14100E]'
                    : 'bg-[#14100E] text-[#A8988B] hover:text-white border border-[#C5A880]/20'
                }`}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-colors shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#FBF8F3] text-[#14100E]'
                    : 'bg-[#2A211C] text-[#D8CCBD] hover:bg-[#342A24]'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#A8988B]">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#A8988B]">
            No orders match the selected filters or query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E8DFD5]">
              <thead className="bg-[#171210] uppercase text-[10px] tracking-wider text-[#A8988B] border-b border-[#C5A880]/20">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Type / Location</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A880]/10">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#251D19] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C5A880]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#FBF8F3]">{order.customerName}</div>
                      <div className="text-[10px] text-[#A8988B]">{order.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {order.type === 'dine-in' ? (
                        <span className="inline-flex items-center gap-1 text-[#C5A880] font-semibold">
                          <MapPin className="w-3 h-3" />
                          <span>Table {order.tableNumber || 'Unassigned'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>Pickup ({order.pickupTime || '15 Mins'})</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#FBF8F3]">
                      ₹{order.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[#A8988B]">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-[#2A211C] hover:bg-[#342A24] text-[#C5A880] transition-colors cursor-pointer"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status transition quick action */}
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                            className="px-2 py-1 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[10px] font-semibold border border-blue-700/60 cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                            className="px-2 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[10px] font-semibold border border-purple-700/60 cursor-pointer"
                          >
                            Cook
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Ready')}
                            className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-semibold border border-emerald-700/60 cursor-pointer"
                          >
                            Ready
                          </button>
                        )}
                        {order.status === 'Ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Completed')}
                            className="px-2 py-1 rounded bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-[10px] font-bold cursor-pointer"
                          >
                            Done
                          </button>
                        )}
                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                            className="p-1 rounded text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            title="Cancel order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-lg w-full p-6 text-[#FBF8F3] shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
                  Order Details
                </span>
                <h3 className="font-serif text-2xl text-[#FBF8F3]">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-[#2A211C] text-[#A8988B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-[#A8988B]">
              <div>
                <span className="block text-[10px] uppercase text-[#7F7065]">Customer</span>
                <strong className="text-[#FBF8F3] text-sm">{selectedOrder.customerName}</strong>
                <p>{selectedOrder.customerPhone}</p>
              </div>

              <div>
                <span className="block text-[10px] uppercase text-[#7F7065]">Fulfillment</span>
                <strong className="text-[#C5A880] text-sm">
                  {selectedOrder.type === 'dine-in'
                    ? `Dine-In • Table ${selectedOrder.tableNumber || 'Unassigned'}`
                    : `Takeaway • Pickup: ${selectedOrder.pickupTime || '15 Mins'}`}
                </strong>
                <p>Status: {selectedOrder.status}</p>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 rounded-xl bg-[#2A211C] text-xs text-[#D8CCBD]">
                <strong className="text-[#C5A880] block mb-0.5">Chef Instructions:</strong>
                &quot;{selectedOrder.notes}&quot;
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2 border-y border-[#C5A880]/15 py-3 max-h-48 overflow-y-auto">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium text-[#FBF8F3]">{item.name}</span>
                    <span className="text-[#A8988B] ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#FBF8F3]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-1.5 text-xs text-[#A8988B]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Central GST (2.5%)</span>
                <span>₹{selectedOrder.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>State GST (2.5%)</span>
                <span>₹{selectedOrder.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#FBF8F3] pt-2 border-t border-[#C5A880]/15">
                <span>Grand Total</span>
                <span className="text-[#C5A880]">₹{selectedOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Status change actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#D8CCBD]"
              >
                Close
              </button>
              {selectedOrder.status !== 'Completed' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')}
                  className="px-5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold"
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
