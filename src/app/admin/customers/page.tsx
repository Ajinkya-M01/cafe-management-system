'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Customer, Order, Reservation } from '@/types';
import {
  Users,
  Search,
  ShoppingBag,
  Calendar,
  X,
  Crown,
  Phone,
  Mail,
  TrendingUp,
  Receipt,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/Badge';

interface EnrichedCustomer extends Customer {
  orderHistory?: Order[];
  reservationHistory?: Reservation[];
}

type SortOption = 'spend-desc' | 'orders-desc' | 'recent' | 'name-asc';
type TierFilter = 'all' | 'vip' | 'regular' | 'new';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('spend-desc');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [selectedCust, setSelectedCust] = useState<EnrichedCustomer | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'orders' | 'reservations'>('orders');

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

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    const vipCount = customers.filter((c) => c.totalSpend >= 10000).length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    return { total, totalRevenue, totalOrders, vipCount, aov };
  }, [customers]);

  // Filtered & Sorted list
  const processedCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        if (tierFilter === 'vip') return c.totalSpend >= 10000;
        if (tierFilter === 'regular') return c.totalOrders >= 3 && c.totalSpend < 10000;
        if (tierFilter === 'new') return c.totalOrders <= 1;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'spend-desc':
            return b.totalSpend - a.totalSpend;
          case 'orders-desc':
            return b.totalOrders - a.totalOrders;
          case 'recent':
            return (b.lastVisit || '').localeCompare(a.lastVisit || '');
          case 'name-asc':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [customers, tierFilter, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setTierFilter('all');
    setSortBy('spend-desc');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        eyebrow="Guest Loyalty &amp; Relationship Registry"
        title="Customer Directory"
        action={
          <div className="text-xs text-[#a8988b]">
            Total Patrons: <strong className="text-[#c5a880] font-mono text-sm">{customers.length}</strong>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a211c] border border-[#c5a880]/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Registered Guests</div>
            <div className="font-serif text-xl text-[#f9f6f1]">{loading ? '—' : metrics.total}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">VIP Club (₹10k+)</div>
            <div className="font-serif text-xl text-amber-400">{loading ? '—' : metrics.vipCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a211c] border border-[#c5a880]/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Lifetime Orders</div>
            <div className="font-serif text-xl text-[#f9f6f1]">{loading ? '—' : metrics.totalOrders}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Average Spend/Order</div>
            <div className="font-serif text-xl text-emerald-400">{loading ? '—' : `₹${metrics.aov}`}</div>
          </div>
        </div>
      </div>

      {/* Control Panel: Search, Tier Chips & Sort Selector */}
      <div className="p-4 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6d]" />
            <input
              type="text"
              placeholder="Search by patron name, phone (+91), or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/25 text-xs text-[#f9f6f1] placeholder-[#7f7065] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8988b] hover:text-[#f9f6f1]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/25 text-xs text-[#d8ccbd]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#c5a880]" />
              <select
                aria-label="Sort customers"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs text-[#f9f6f1] focus:outline-none cursor-pointer"
              >
                <option value="spend-desc">Highest Spend First</option>
                <option value="orders-desc">Most Orders First</option>
                <option value="recent">Recently Visited</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tier Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Patrons', count: customers.length },
            { id: 'vip', label: 'VIP Guests (₹10k+)', count: metrics.vipCount },
            {
              id: 'regular',
              label: 'Regulars (3+ Visits)',
              count: customers.filter((c) => c.totalOrders >= 3 && c.totalSpend < 10000).length,
            },
            {
              id: 'new',
              label: 'First-Time Guests',
              count: customers.filter((c) => c.totalOrders <= 1).length,
            },
          ].map((tier) => {
            const isSelected = tierFilter === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setTierFilter(tier.id as TierFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#c5a880] text-[#1a1412] shadow-xs font-bold'
                    : 'bg-[#171311] text-[#a8988b] border border-[#c5a880]/20 hover:text-[#f9f6f1] hover:border-[#c5a880]/40'
                }`}
              >
                <span>{tier.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-[#1a1412]/20 text-[#1a1412]' : 'bg-[#2a211c] text-[#a8988b]'
                  }`}
                >
                  {tier.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 shadow-lg overflow-hidden">
        {loading ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patron Name</th>
                <th>Contact</th>
                <th>Tier</th>
                <th>Total Orders</th>
                <th>Lifetime Spend</th>
                <th>Last Visit</th>
                <th className="text-right">Dossier</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={7} />
              ))}
            </tbody>
          </table>
        ) : processedCustomers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Users className="w-10 h-10 text-[#c5a880]" />}
              title="No customer profiles found"
              description="No patrons match your search or tier filters. Try searching by phone number or name."
              action={
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#c5a880] text-[#1a1412] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#dfc8a5] transition-colors"
                >
                  Reset Search
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patron</th>
                  <th>Contact Information</th>
                  <th>Loyalty Status</th>
                  <th>Order Frequency</th>
                  <th>Lifetime Value</th>
                  <th>Last Seated</th>
                  <th className="text-right">Dossier</th>
                </tr>
              </thead>
              <tbody>
                {processedCustomers.map((c) => {
                  const isVip = c.totalSpend >= 10000;
                  const isRegular = c.totalOrders >= 3;

                  return (
                    <tr key={c.id}>
                      {/* Name & Avatar */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isVip
                                ? 'bg-[#c5a880] text-[#1a1412] shadow-sm'
                                : 'bg-[#2a211c] text-[#c5a880] border border-[#c5a880]/25'
                            }`}
                          >
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#f9f6f1] flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {isVip && (
                                <span title="VIP Patron (₹10k+ Spend)">
                                  <Crown className="w-3.5 h-3.5 text-[#c5a880]" />
                                </span>
                              )}
                            </div>
                            {c.notes && (
                              <div className="text-[10px] text-[#a8988b] italic line-clamp-1 max-w-xs">
                                {c.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div className="font-mono text-xs text-[#f9f6f1]">{c.phone}</div>
                        {c.email ? (
                          <div className="text-[11px] text-[#a8988b]">{c.email}</div>
                        ) : (
                          <div className="text-[10px] text-[#7f7065] italic">No email on file</div>
                        )}
                      </td>

                      {/* Loyalty Tier */}
                      <td>
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#c5a880]/15 border border-[#c5a880]/35 text-[#c5a880]">
                            <Crown className="w-3 h-3" />
                            <span>VIP Elite</span>
                          </span>
                        ) : isRegular ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                            <Sparkles className="w-3 h-3" />
                            <span>Regular</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#2a211c] border border-[#c5a880]/15 text-[#a8988b]">
                            <span>Patron</span>
                          </span>
                        )}
                      </td>

                      {/* Total Orders */}
                      <td>
                        <div className="font-semibold text-[#f9f6f1] flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#c5a880]" />
                          <span>{c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}</span>
                        </div>
                      </td>

                      {/* Lifetime Spend */}
                      <td>
                        <span className="font-bold font-mono text-sm text-[#c5a880]">
                          ₹{c.totalSpend.toLocaleString()}
                        </span>
                      </td>

                      {/* Last Visit */}
                      <td>
                        <span className="text-[#d8ccbd] text-xs">{c.lastVisit || '—'}</span>
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        <button
                          onClick={() => {
                            setSelectedCust(c);
                            setActiveDossierTab('orders');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#2a211c] hover:bg-[#342a24] hover:text-[#dfc8a5] text-xs font-semibold text-[#c5a880] border border-[#c5a880]/25 transition-colors cursor-pointer"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Dossier Detail Modal */}
      {selectedCust && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setSelectedCust(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#1f1815] border border-[#c5a880]/30 rounded-3xl max-w-2xl w-full p-6 text-[#f9f6f1] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#c5a880]/20">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    selectedCust.totalSpend >= 10000
                      ? 'bg-[#c5a880] text-[#1a1412] shadow-md'
                      : 'bg-[#2a211c] text-[#c5a880] border border-[#c5a880]/30'
                  }`}
                >
                  {selectedCust.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl text-[#f9f6f1]">{selectedCust.name}</h3>
                    {selectedCust.totalSpend >= 10000 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a880]/20 border border-[#c5a880]/40 text-[#c5a880]">
                        VIP Guest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#a8988b] mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-[#c5a880]" />
                      <span>{selectedCust.phone}</span>
                    </span>
                    {selectedCust.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#c5a880]" />
                        <span>{selectedCust.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCust(null)}
                className="p-1.5 rounded-lg text-[#a8988b] hover:text-[#f9f6f1] hover:bg-[#2a211c] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#171311] border border-[#c5a880]/15">
                <span className="text-[10px] uppercase tracking-wider text-[#a8988b] block">Total Orders</span>
                <span className="text-xl font-bold font-mono text-[#f9f6f1]">{selectedCust.totalOrders}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#171311] border border-[#c5a880]/15">
                <span className="text-[10px] uppercase tracking-wider text-[#a8988b] block">Lifetime Value</span>
                <span className="text-xl font-bold font-mono text-[#c5a880]">₹{selectedCust.totalSpend.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#171311] border border-[#c5a880]/15">
                <span className="text-[10px] uppercase tracking-wider text-[#a8988b] block">Average Ticket</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ₹{selectedCust.totalOrders > 0 ? Math.round(selectedCust.totalSpend / selectedCust.totalOrders) : 0}
                </span>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#c5a880]/15 pb-2">
                <button
                  onClick={() => setActiveDossierTab('orders')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === 'orders'
                      ? 'bg-[#c5a880] text-[#1a1412]'
                      : 'text-[#a8988b] hover:text-[#f9f6f1]'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Order Archive ({selectedCust.orderHistory?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveDossierTab('reservations')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === 'reservations'
                      ? 'bg-[#c5a880] text-[#1a1412]'
                      : 'text-[#a8988b] hover:text-[#f9f6f1]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reservation History ({selectedCust.reservationHistory?.length || 0})</span>
                </button>
              </div>

              {/* Order Archive Tab */}
              {activeDossierTab === 'orders' && (
                <div className="pt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCust.orderHistory && selectedCust.orderHistory.length > 0 ? (
                    selectedCust.orderHistory.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl bg-[#171311] border border-[#c5a880]/15 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#c5a880]">{ord.orderNumber}</span>
                            <StatusBadge status={ord.status} />
                          </div>
                          <div className="text-[11px] text-[#d8ccbd] mt-1">
                            {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                          <div className="text-[10px] text-[#7f7065] mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#f9f6f1]">
                          ₹{ord.grandTotal.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#a8988b] py-6 text-center">No prior order records on file.</p>
                  )}
                </div>
              )}

              {/* Reservations Tab */}
              {activeDossierTab === 'reservations' && (
                <div className="pt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCust.reservationHistory && selectedCust.reservationHistory.length > 0 ? (
                    selectedCust.reservationHistory.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-[#171311] border border-[#c5a880]/15 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#c5a880]">{res.reservationNumber}</span>
                            <StatusBadge status={res.status} />
                          </div>
                          <div className="text-[#f9f6f1] text-[11px] mt-1">
                            📅 {res.date} at {res.time} &bull; 👥 {res.guests} Guests
                          </div>
                          {res.assignedTableNumber && (
                            <div className="text-[10px] text-[#c5a880] mt-0.5">
                              Assigned Table {res.assignedTableNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#a8988b] py-6 text-center">No reservation bookings on file.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#c5a880]/15 flex justify-end">
              <button
                onClick={() => setSelectedCust(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2a211c] hover:bg-[#342a24] text-xs font-semibold text-[#f9f6f1] transition-colors cursor-pointer"
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
