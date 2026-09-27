'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Table, TableStatus } from '@/types';
import {
  MapPin,
  QrCode,
  Users,
  Receipt,
  Sparkles,
  Plus,
  RefreshCw,
  X,
  CheckCircle2,
  Printer,
  Download,
  AlertCircle,
} from 'lucide-react';

interface EnrichedTable extends Table {
  activeOrder?: {
    id: string;
    orderNumber: string;
    customerName: string;
    items: { name: string; quantity: number; price: number }[];
    grandTotal: number;
    createdAt: string;
  } | null;
  activeReservation?: {
    id: string;
    reservationNumber: string;
    customerName: string;
    time: string;
    guests: number;
  } | null;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<EnrichedTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<EnrichedTable | null>(null);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);
  const [newTableSec, setNewTableSec] = useState<'Indoor' | 'Patio' | 'Window' | 'Private'>('Indoor');

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      const data = await res.json();
      if (data.success) {
        setTables(data.tables);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleStatusChange = async (tableId: string, status: TableStatus) => {
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, status }),
      });
      if (res.ok) {
        fetchTables();
        if (selectedTable && selectedTable.id === tableId) {
          setSelectedTable((prev) => (prev ? { ...prev, status } : null));
        }
      }
    } catch (err) {
      console.error('Failed to change table status:', err);
    }
  };

  const handleClearSession = async (tableId: string) => {
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, clearSession: true }),
      });
      if (res.ok) {
        fetchTables();
        setSelectedTable(null);
      }
    } catch (err) {
      console.error('Failed to reset table:', err);
    }
  };

  const handleOpenQr = async (table: Table) => {
    setQrModalTable(table);
    setQrLoading(true);
    try {
      const res = await fetch(`/api/tables/${table.number}/qr`);
      const data = await res.json();
      if (data.success && data.qrDataUrl) {
        setQrDataUrl(data.qrDataUrl);
      }
    } catch (err) {
      console.error('Error generating QR:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newTableNum,
          capacity: newTableCap,
          section: newTableSec,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTableNum('');
        fetchTables();
      } else {
        alert(data.error || 'Failed to create table');
      }
    } catch {
      alert('Error creating table');
    }
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'Available':
        return 'border-emerald-600/40 bg-emerald-950/20 text-emerald-400';
      case 'Occupied':
        return 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]';
      case 'Reserved':
        return 'border-purple-600/40 bg-purple-950/20 text-purple-400';
      case 'Billing':
        return 'border-amber-600/40 bg-amber-950/20 text-amber-400';
      case 'Cleaning':
        return 'border-teal-600/40 bg-teal-950/20 text-teal-400';
      default:
        return 'border-gray-700 bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Dining Room & Floor Architecture
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Table Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/40 text-xs font-semibold text-[#FBF8F3] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Add Table</span>
          </button>
          <button
            onClick={() => {
              setLoading(true);
              fetchTables();
            }}
            className="p-2 rounded-xl bg-[#201815] border border-[#C5A880]/30 text-[#C5A880] hover:text-white cursor-pointer"
            title="Refresh tables"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Legends */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-[#A8988B] uppercase tracking-wider text-[10px] font-semibold">
          Status Key:
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
          <span>Occupied (Active Order)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Billing / Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span>Cleaning</span>
        </div>
      </div>

      {/* Visual Table Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest text-[#A8988B]">Mapping table floor plan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {tables.map((table) => {
            const isOccupied = table.status === 'Occupied';
            const isReserved = table.status === 'Reserved';
            return (
              <div
                key={table.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${getStatusColor(
                  table.status
                )} hover:scale-[1.02] shadow-sm`}
                onClick={() => setSelectedTable(table)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif text-2xl font-bold tracking-wide">
                      {table.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenQr(table);
                      }}
                      className="p-1.5 rounded-lg bg-[#14100E]/60 hover:bg-[#14100E] text-[#C5A880] transition-colors cursor-pointer"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 opacity-70" />
                      <span>{table.capacity} Seats</span>
                    </span>
                    <span>• {table.section}</span>
                  </div>

                  {isOccupied && (
                    <div className="p-2.5 rounded-xl bg-[#14100E]/70 border border-[#C5A880]/30 text-xs text-[#FBF8F3] space-y-1 mb-3">
                      <div className="font-semibold text-[#C5A880] truncate">
                        {table.activeOrder?.customerName || 'Dining Guest'}
                      </div>
                      <div className="font-bold text-sm">
                        ₹{(table.currentBillAmount || 0).toLocaleString()} Bill
                      </div>
                    </div>
                  )}

                  {isReserved && table.activeReservation && (
                    <div className="p-2.5 rounded-xl bg-[#14100E]/70 border border-purple-500/30 text-xs text-[#FBF8F3] space-y-1 mb-3">
                      <div className="font-semibold text-purple-300 truncate">
                        {table.activeReservation.customerName}
                      </div>
                      <div className="text-[10px] text-[#A8988B]">
                        Time: {table.activeReservation.time} ({table.activeReservation.guests} guests)
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-current/20 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    {table.status}
                  </span>
                  <span className="text-[11px] underline opacity-80 group-hover:opacity-100">
                    Manage
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Detail Drawer / Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 text-[#FBF8F3] shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2A211C] border border-[#C5A880]/30 flex items-center justify-center font-serif text-xl font-bold text-[#C5A880]">
                  {selectedTable.number}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-[#FBF8F3]">{selectedTable.name}</h3>
                  <span className="text-xs text-[#A8988B]">
                    {selectedTable.section} Section • {selectedTable.capacity} Seats
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1.5 rounded-full hover:bg-[#2A211C] text-[#A8988B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status selector */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#A8988B] font-semibold block">
                Update Table Status
              </label>
              <select
                aria-label="Update Table Status"
                value={selectedTable.status}
                onChange={(e) => handleStatusChange(selectedTable.id, e.target.value as TableStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] font-semibold focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Available">Available (Ready for guests)</option>
                <option value="Occupied">Occupied (Seated)</option>
                <option value="Reserved">Reserved (Holding table)</option>
                <option value="Billing">Billing (Bill requested)</option>
                <option value="Cleaning">Cleaning (Sanitizing)</option>
              </select>
            </div>

            {/* Active order breakdown if present */}
            {selectedTable.activeOrder ? (
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[#A8988B] text-[10px] uppercase block">Active Order</span>
                    <strong className="text-[#C5A880] text-sm">
                      {selectedTable.activeOrder.orderNumber}
                    </strong>
                    <p className="text-[#FBF8F3]">{selectedTable.activeOrder.customerName}</p>
                  </div>
                  <span className="text-base font-bold text-[#FBF8F3]">
                    ₹{selectedTable.activeOrder.grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="divide-y divide-[#C5A880]/10 max-h-32 overflow-y-auto text-xs pr-1">
                  {selectedTable.activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between text-[#D8CCBD]">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/admin/billing?tableNumber=${selectedTable.number}`}
                    className="flex-1 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs uppercase tracking-wider font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Generate Bill</span>
                  </Link>

                  <button
                    onClick={() => handleClearSession(selectedTable.id)}
                    className="px-3 py-2.5 rounded-xl bg-[#2A211C] hover:bg-red-950 text-red-300 text-xs font-semibold border border-red-800/40 cursor-pointer"
                    title="Release table session"
                  >
                    Clear Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/20 text-xs text-[#A8988B] text-center">
                No active running order linked to this table.
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleOpenQr(selectedTable)}
                className="flex-1 py-2.5 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>View Table QR</span>
              </button>

              <button
                onClick={() => setSelectedTable(null)}
                className="px-5 py-2.5 rounded-xl bg-[#14100E] text-xs font-semibold text-[#A8988B]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table QR Code Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1815] border border-[#C5A880]/40 rounded-3xl max-w-sm w-full p-6 text-[#FBF8F3] text-center shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">Table QR Code</span>
                <h3 className="font-serif text-xl text-[#FBF8F3]">Table {qrModalTable.number}</h3>
              </div>
              <button
                onClick={() => setQrModalTable(null)}
                className="p-1.5 rounded-full hover:bg-[#2A211C] text-[#A8988B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FBF8F3] rounded-2xl inline-block border-4 border-[#C5A880]">
              {qrLoading ? (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#1A1412] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`Table ${qrModalTable.number} QR`}
                  width={240}
                  height={240}
                  className="rounded-lg"
                />
              ) : null}
            </div>

            <p className="text-xs text-[#A8988B]">
              Guests scan this QR code with their camera to instantly browse the menu and order directly to Table {qrModalTable.number}.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Standee QR</span>
              </button>

              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`NoirBean_Table_${qrModalTable.number}_QR.png`}
                  className="p-2.5 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-[#C5A880]"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTable}
            className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-sm w-full p-6 text-[#FBF8F3] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <h3 className="font-serif text-xl text-[#FBF8F3]">Add New Table</h3>
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
                Table Number (e.g. 11)
              </label>
              <input
                type="text"
                required
                placeholder="11"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={newTableCap}
                onChange={(e) => setNewTableCap(parseInt(e.target.value, 10) || 2)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Ambiance Section
              </label>
              <select
                value={newTableSec}
                onChange={(e) => setNewTableSec(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Indoor">Indoor Atelier</option>
                <option value="Patio">Alfresco Courtyard</option>
                <option value="Window">Window Solarium</option>
                <option value="Private">Private Library</option>
              </select>
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
                className="px-5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider"
              >
                Create Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
