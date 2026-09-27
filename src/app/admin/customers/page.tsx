'use client';

import React, { useEffect, useState } from 'react';
import { Customer, Order, Reservation } from '@/types';
import {
  Users,
  Search,
  DollarSign,
  ShoppingBag,
  Calendar,
  X,
  Eye,
  Crown,
  Phone,
  Mail,
} from 'lucide-react';

interface EnrichedCustomer extends Customer {
  orderHistory?: Order[];
  reservationHistory?: Reservation[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<EnrichedCustomer | null>(null);

  const fetchCustomers = async () => {
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/admin/customers${query}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Guest Loyalty & Relationship Registry
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Customer Management
          </h1>
        </div>
        <div className="text-xs text-[#A8988B]">
          Total Registered Patrons: <strong className="text-[#C5A880]">{customers.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6D]" />
          <input
            type="text"
            placeholder="Search by patron name, phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#A8988B]">Loading guests database...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#A8988B]">
            No guest records match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E8DFD5]">
              <thead className="uppercase text-[10px] text-[#A8988B] bg-[#171210] border-b border-[#C5A880]/20">
                <tr>
                  <th className="py-3.5 px-4">Patron Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Lifetime Spend</th>
                  <th className="py-3.5 px-4">Last Visit</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A880]/10">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#251D19]">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#2A211C] border border-[#C5A880]/30 flex items-center justify-center font-bold text-xs text-[#C5A880]">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#FBF8F3] flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.totalSpend > 10000 && (
                              <span title="VIP Patron">
                                <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
                              </span>
                            )}
                          </div>
                          {c.notes && <div className="text-[10px] text-[#8C7A6D] italic">{c.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{c.phone}</td>
                    <td className="py-3.5 px-4 text-[#A8988B]">{c.email || '--'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#FBF8F3]">{c.totalOrders}</span> orders
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#C5A880]">
                      ₹{c.totalSpend.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#A8988B]">{c.lastVisit}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="px-3 py-1 rounded-lg bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] cursor-pointer"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest History Detail Modal */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-2xl w-full p-6 text-[#FBF8F3] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">Patron Dossier</span>
                <h3 className="font-serif text-2xl text-[#FBF8F3]">{selectedCust.name}</h3>
                <div className="flex items-center gap-4 text-xs text-[#A8988B] mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#C5A880]" />
                    <span>{selectedCust.phone}</span>
                  </span>
                  {selectedCust.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#C5A880]" />
                      <span>{selectedCust.email}</span>
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedCust(null)} className="text-[#A8988B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/20">
                <span className="text-[10px] uppercase tracking-wider text-[#A8988B] block">Total Orders</span>
                <span className="text-xl font-bold text-[#FBF8F3]">{selectedCust.totalOrders}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/20">
                <span className="text-[10px] uppercase tracking-wider text-[#A8988B] block">Lifetime Value</span>
                <span className="text-xl font-bold text-[#C5A880]">₹{selectedCust.totalSpend.toLocaleString()}</span>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
                Order History ({selectedCust.orderHistory?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-[#C5A880]/10">
                {selectedCust.orderHistory && selectedCust.orderHistory.length > 0 ? (
                  selectedCust.orderHistory.map((ord) => (
                    <div key={ord.id} className="pt-2 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[#C5A880] mr-2">{ord.orderNumber}</span>
                        <span className="text-[#D8CCBD]">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </span>
                        <div className="text-[10px] text-[#7F7065]">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.status}
                        </div>
                      </div>
                      <span className="font-bold text-[#FBF8F3]">₹{ord.grandTotal.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A8988B]">No prior orders recorded.</p>
                )}
              </div>
            </div>

            {/* Reservation History */}
            <div className="space-y-3 pt-2 border-t border-[#C5A880]/15">
              <h4 className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">
                Reservation History ({selectedCust.reservationHistory?.length || 0})
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedCust.reservationHistory && selectedCust.reservationHistory.length > 0 ? (
                  selectedCust.reservationHistory.map((res) => (
                    <div
                      key={res.id}
                      className="p-2.5 rounded-lg bg-[#14100E] border border-[#C5A880]/15 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-[#C5A880] mr-2">{res.reservationNumber}</span>
                        <span className="text-[#FBF8F3]">{res.date} at {res.time}</span>
                        <span className="text-[#8C7A6D] ml-2">({res.guests} Guests)</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        {res.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#A8988B]">No reservation bookings on file.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#C5A880]/15 flex justify-end">
              <button
                onClick={() => setSelectedCust(null)}
                className="px-5 py-2 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#FBF8F3]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
