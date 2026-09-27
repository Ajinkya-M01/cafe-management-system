'use client';

import React, { useEffect, useState } from 'react';
import { Reservation, ReservationStatus } from '@/types';
import {
  Calendar,
  Clock,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Plus,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Manual Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addTime, setAddTime] = useState('20:00');
  const [addGuests, setAddGuests] = useState(2);
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
        fetchReservations();
        setSelectedRes(null);
      }
    } catch (err) {
      console.error('Error updating reservation:', err);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
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
        fetchReservations();
      } else {
        alert(data.error || 'Failed to add reservation');
      }
    } catch {
      alert('Error creating reservation');
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Pending':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Completed':
        return 'bg-[#2A211C] text-[#A8988B] border-[#C5A880]/20';
      case 'Cancelled':
        return 'bg-red-950 text-red-300 border-red-900';
      case 'No-show':
        return 'bg-gray-800 text-gray-400 border-gray-700';
      default:
        return 'bg-[#2A211C] text-[#FBF8F3]';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Floor Scheduling & Hospitality
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Reservation Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>
          <button
            onClick={() => {
              setLoading(true);
              fetchReservations();
            }}
            className="p-2 rounded-xl bg-[#201815] border border-[#C5A880]/30 text-[#C5A880] hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6D]" />
          <input
            type="text"
            placeholder="Search by Reservation ID, Customer, Phone, or Table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#C5A880] text-[#14100E]'
                  : 'bg-[#14100E] text-[#A8988B] border border-[#C5A880]/20'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#A8988B]">Loading reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#A8988B]">
            No reservations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E8DFD5]">
              <thead className="uppercase text-[10px] text-[#A8988B] bg-[#171210] border-b border-[#C5A880]/20">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Party Size</th>
                  <th className="py-3.5 px-4">Table Assigned</th>
                  <th className="py-3.5 px-4">Special Requests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A880]/10">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-[#251D19]">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C5A880]">
                      {res.reservationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#FBF8F3]">
                      {res.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{res.customerPhone}</div>
                      <div className="text-[10px] text-[#8C7A6D]">{res.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#FBF8F3]">{res.date}</div>
                      <div className="text-[10px] text-[#C5A880]">{res.time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 font-bold text-[#FBF8F3]">
                        <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{res.guests} Guests</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.assignedTableNumber ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#2A211C] border border-[#C5A880]/30 text-[#C5A880] font-bold">
                          Table {res.assignedTableNumber}
                        </span>
                      ) : (
                        <span className="text-[#8C7A6D] italic">
                          Prefers {res.tablePreference}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[#A8988B]">
                      {res.specialRequests || '--'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusBadge(
                          res.status
                        )}`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRes(res)}
                          className="px-2.5 py-1 rounded bg-[#2A211C] hover:bg-[#342A24] text-xs font-semibold text-[#C5A880] border border-[#C5A880]/30 cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 text-[#FBF8F3] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">Manage Booking</span>
                <h3 className="font-serif text-2xl text-[#FBF8F3]">{selectedRes.reservationNumber}</h3>
              </div>
              <button onClick={() => setSelectedRes(null)} className="text-[#A8988B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p><strong>Guest:</strong> {selectedRes.customerName} ({selectedRes.customerPhone})</p>
              <p><strong>Slot:</strong> {selectedRes.date} at {selectedRes.time} ({selectedRes.guests} guests)</p>
              {selectedRes.specialRequests && (
                <p className="text-[#C5A880] italic">&quot;{selectedRes.specialRequests}&quot;</p>
              )}
            </div>

            {/* Assign Table Picker */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A8988B] font-semibold block">
                Assign Dining Table:
              </label>
              <select
                aria-label="Assign Dining Table"
                value={selectedRes.assignedTableNumber || ''}
                onChange={(e) =>
                  handleUpdateStatus(selectedRes.id, selectedRes.status, e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] font-semibold focus:outline-none focus:border-[#C5A880]"
              >
                <option value="">Unassigned</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const p = num.toString().padStart(2, '0');
                  return (
                    <option key={num} value={p}>
                      Table {p}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quick Status Buttons */}
            <div className="pt-2 border-t border-[#C5A880]/15 space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#A8988B] font-semibold block">
                Update Status:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'Confirmed', selectedRes.assignedTableNumber)}
                  className="py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-semibold cursor-pointer"
                >
                  Confirm Table
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'Completed')}
                  className="py-2 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-[#C5A880] font-semibold cursor-pointer"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'No-show')}
                  className="py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 font-semibold cursor-pointer"
                >
                  Mark No-Show
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRes.id, 'Cancelled')}
                  className="py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-semibold cursor-pointer"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateReservation}
            className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 text-[#FBF8F3] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <h3 className="font-serif text-xl text-[#FBF8F3]">Phone / Walk-In Reservation</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#A8988B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={addTime}
                  onChange={(e) => setAddTime(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={addGuests}
                  onChange={(e) => setAddGuests(parseInt(e.target.value, 10) || 2)}
                  className="w-full px-2 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Assign Table Number
              </label>
              <select
                aria-label="Assign Table Number"
                value={addTable}
                onChange={(e) => setAddTable(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const p = num.toString().padStart(2, '0');
                  return (
                    <option key={num} value={p}>
                      Table {p}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Special Requests
              </label>
              <textarea
                rows={2}
                value={addSpecial}
                onChange={(e) => setAddSpecial(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#A8988B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
