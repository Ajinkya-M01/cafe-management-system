'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Reservation, ReservationStatus } from '@/types';
import {
  Calendar,
  Clock,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  X,
  Phone,
  Mail,
  UserCheck,
  CalendarCheck,
  CalendarDays,
  UtensilsCrossed,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/Badge';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Manual Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addTime, setAddTime] = useState('20:00');
  const [addGuests, setAddGuests] = useState<number>(2);
  const [addTable, setAddTable] = useState('04');
  const [addSpecial, setAddSpecial] = useState('');

  const fetchReservations = async () => {
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (search.trim()) query.set('search', search.trim());

      const res = await fetch(`/api/admin/reservations?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReservations(data.reservations);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, search]);

  // Quick stats
  const stats = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((r) => r.status === 'Pending').length;
    const confirmed = reservations.filter((r) => r.status === 'Confirmed').length;
    const totalGuests = reservations.reduce((acc, r) => acc + (r.guests || 0), 0);
    return { total, pending, confirmed, totalGuests };
  }, [reservations]);

  const handleUpdateStatus = async (
    resId: string,
    status: ReservationStatus,
    assignedTableNumber?: string
  ) => {
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resId, status, assignedTableNumber }),
      });
      if (res.ok) {
        await fetchReservations();
        setSelectedRes(null);
      }
    } catch (err) {
      console.error('Error updating reservation:', err);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: addName,
          customerPhone: addPhone,
          customerEmail: addEmail,
          date: addDate,
          time: addTime,
          guests: addGuests,
          assignedTableNumber: addTable,
          specialRequests: addSpecial,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setAddName('');
        setAddPhone('');
        setAddEmail('');
        setAddSpecial('');
        await fetchReservations();
      } else {
        alert(data.error || 'Failed to add reservation');
      }
    } catch {
      alert('Error creating reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      if (dateFilter && res.date !== dateFilter) return false;
      return true;
    });
  }, [reservations, dateFilter]);

  const resetFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setSearch('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        eyebrow="Floor Scheduling &amp; Hospitality"
        title="Reservation Management"
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setLoading(true);
                fetchReservations();
              }}
              className="p-2.5 rounded-xl bg-[#1f1815] border border-[#c5a880]/25 text-[#c5a880] hover:text-[#dfc8a5] hover:bg-[#231b17] transition-all cursor-pointer"
              title="Refresh reservations"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a211c] border border-[#c5a880]/20 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Total Bookings</div>
            <div className="font-serif text-xl text-[#f9f6f1]">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Pending Approval</div>
            <div className="font-serif text-xl text-amber-400">{loading ? '—' : stats.pending}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Confirmed Tables</div>
            <div className="font-serif text-xl text-emerald-400">{loading ? '—' : stats.confirmed}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a211c] border border-[#c5a880]/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Guest Covers</div>
            <div className="font-serif text-xl text-[#f9f6f1]">{loading ? '—' : stats.totalGuests}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6d]" />
            <input
              type="text"
              placeholder="Search by Booking ID, Guest Name, Phone, or Assigned Table..."
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

          {/* Date Picker */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/25 text-xs text-[#d8ccbd]">
              <Calendar className="w-3.5 h-3.5 text-[#c5a880]" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-[#f9f6f1] focus:outline-none"
                aria-label="Filter by reservation date"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-[#a8988b] hover:text-[#f9f6f1] ml-1"
                  title="Clear date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show'].map((st) => {
            const isSelected = statusFilter === st;
            const count =
              st === 'all'
                ? reservations.length
                : reservations.filter((r) => r.status.toLowerCase() === st.toLowerCase()).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${isSelected
                    ? 'bg-[#c5a880] text-[#1a1412] shadow-xs font-bold'
                    : 'bg-[#171311] text-[#a8988b] border border-[#c5a880]/20 hover:text-[#f9f6f1] hover:border-[#c5a880]/40'
                  }`}
              >
                <span>{st === 'all' ? 'All Bookings' : st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-[#1a1412]/20 text-[#1a1412]' : 'bg-[#2a211c] text-[#a8988b]'
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 shadow-lg overflow-hidden">
        {loading ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Contact</th>
                <th>Schedule</th>
                <th>Party</th>
                <th>Table</th>
                <th>Special Note</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={9} />
              ))}
            </tbody>
          </table>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<CalendarDays className="w-10 h-10 text-[#c5a880]" />}
              title="No reservations found"
              description="No bookings match the selected status or date filters. Try adjusting your parameters."
              action={
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#c5a880] text-[#1a1412] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#dfc8a5] transition-colors"
                >
                  Reset Filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest</th>
                  <th>Contact</th>
                  <th>Schedule</th>
                  <th>Party</th>
                  <th>Table</th>
                  <th>Special Note</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((res) => (
                  <tr key={res.id}>
                    {/* Booking ID */}
                    <td className="font-mono font-bold text-[#c5a880]">
                      {res.reservationNumber}
                    </td>

                    {/* Guest Name & Avatar */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2a211c] border border-[#c5a880]/25 flex items-center justify-center font-bold text-xs text-[#c5a880] shrink-0">
                          {res.customerName.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#f9f6f1]">{res.customerName}</span>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div className="text-[#d8ccbd] font-mono text-[11px]">{res.customerPhone}</div>
                      {res.customerEmail && (
                        <div className="text-[10px] text-[#7f7065]">{res.customerEmail}</div>
                      )}
                    </td>

                    {/* Schedule (Date & Time) */}
                    <td>
                      <div className="font-medium text-[#f9f6f1] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#c5a880]" />
                        <span>{res.date}</span>
                      </div>
                      <div className="text-[11px] text-[#c5a880] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{res.time}</span>
                      </div>
                    </td>

                    {/* Party Size */}
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2a211c] border border-[#c5a880]/20 text-xs font-semibold text-[#f9f6f1]">
                        <Users className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>{res.guests}</span>
                      </span>
                    </td>

                    {/* Assigned Table */}
                    <td>
                      {res.assignedTableNumber ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#c5a880]/15 border border-[#c5a880]/35 text-[#c5a880] font-bold text-xs">
                          <UtensilsCrossed className="w-3 h-3" />
                          <span>Table {res.assignedTableNumber}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7f7065] italic">
                          Prefers {res.tablePreference || 'Standard'}
                        </span>
                      )}
                    </td>

                    {/* Special Requests */}
                    <td className="max-w-xs">
                      {res.specialRequests ? (
                        <span className="text-[11px] text-[#d8ccbd] italic line-clamp-1" title={res.specialRequests}>
                          &ldquo;{res.specialRequests}&rdquo;
                        </span>
                      ) : (
                        <span className="text-[#7f7065]">&mdash;</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td>
                      <StatusBadge status={res.status} />
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedRes(res)}
                        className="px-3 py-1.5 rounded-lg bg-[#2a211c] hover:bg-[#342a24] hover:text-[#dfc8a5] text-xs font-semibold text-[#c5a880] border border-[#c5a880]/25 transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservation Management Modal */}
      {selectedRes && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setSelectedRes(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#1f1815] border border-[#c5a880]/30 rounded-3xl max-w-md w-full p-6 text-[#f9f6f1] shadow-2xl space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-semibold">
                  Manage Booking
                </span>
                <h3 className="font-serif text-2xl text-[#f9f6f1]">{selectedRes.reservationNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="p-1.5 rounded-lg text-[#a8988b] hover:text-[#f9f6f1] hover:bg-[#2a211c] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Summary Card */}
            <div className="p-3.5 rounded-2xl bg-[#171311] border border-[#c5a880]/15 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#f9f6f1]">{selectedRes.customerName}</span>
                <StatusBadge status={selectedRes.status} />
              </div>
              <div className="flex items-center gap-3 text-[#a8988b]">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-[#c5a880]" />
                  <span>{selectedRes.customerPhone}</span>
                </span>
                {selectedRes.customerEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#c5a880]" />
                    <span>{selectedRes.customerEmail}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-[#d8ccbd] pt-1">
                <span>📅 {selectedRes.date} at {selectedRes.time}</span>
                <span>👥 {selectedRes.guests} Guests</span>
              </div>
              {selectedRes.specialRequests && (
                <div className="pt-1 text-[11px] text-[#c5a880] italic">
                  &ldquo;{selectedRes.specialRequests}&rdquo;
                </div>
              )}
            </div>

            {/* Assign Dining Table */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#d8ccbd] font-semibold block">
                Assign Dining Table:
              </label>
              <select
                aria-label="Assign Dining Table"
                value={selectedRes.assignedTableNumber || ''}
                onChange={(e) =>
                  handleUpdateStatus(selectedRes.id, selectedRes.status, e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] font-semibold focus:outline-none focus:border-[#c5a880]"
              >
                <option value="">Unassigned (Waitlist / Walk-in)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const p = num.toString().padStart(2, '0');
                  return (
                    <option key={num} value={p}>
                      Table {p} (Capacity 4)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="pt-2 border-t border-[#c5a880]/15 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[#a8988b] font-semibold block">
                Transition Booking Status:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedRes.id, 'Confirmed', selectedRes.assignedTableNumber)
                  }
                  className="py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Table</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'Completed')}
                  className="py-2.5 rounded-xl bg-[#2a211c] hover:bg-[#342a24] border border-[#c5a880]/30 text-[#c5a880] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Mark Seated</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'No-show')}
                  className="py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Mark No-Show</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'Cancelled')}
                  className="py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Walk-in / Phone Reservation Modal */}
      {showAddModal && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateReservation}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1f1815] border border-[#c5a880]/30 rounded-3xl max-w-lg w-full p-6 text-[#f9f6f1] shadow-2xl space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a880]">Direct Booking</span>
                <h3 className="font-serif text-xl text-[#f9f6f1]">Phone / Walk-In Reservation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#a8988b] hover:text-[#f9f6f1] hover:bg-[#2a211c] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="eleanor@atelier.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={addTime}
                  onChange={(e) => setAddTime(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Party Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={addGuests}
                  onChange={(e) => setAddGuests(parseInt(e.target.value, 10) || 2)}
                  className="w-full px-2 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                Assign Dining Table
              </label>
              <select
                aria-label="Assign Table Number"
                value={addTable}
                onChange={(e) => setAddTable(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const p = num.toString().padStart(2, '0');
                  return (
                    <option key={num} value={p}>
                      Table {p} (Dining Floor)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                Special Dining Requests
              </label>
              <textarea
                rows={2}
                placeholder="Anniversary celebration, window seating, dietary allergies..."
                value={addSpecial}
                onChange={(e) => setAddSpecial(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div className="pt-2 border-t border-[#c5a880]/15 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#2a211c] hover:bg-[#342a24] text-xs font-semibold text-[#a8988b] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <span>Confirm Booking</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
