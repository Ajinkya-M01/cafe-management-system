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
  Plus,
  RefreshCw,
  X,
  Printer,
  Download,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { SkeletonTableCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

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

function getStatusStyle(status: TableStatus): { card: string; dot: string } {
  switch (status) {
    case 'Available': return {
      card: 'border-emerald-600/35 bg-emerald-950/15 hover:border-emerald-500/50',
      dot: 'bg-emerald-500',
    };
    case 'Occupied':  return {
      card: 'border-[#C5A880]/40 bg-[#C5A880]/08 hover:border-[#C5A880]/60',
      dot: 'bg-[#C5A880]',
    };
    case 'Reserved':  return {
      card: 'border-purple-600/35 bg-purple-950/15 hover:border-purple-500/50',
      dot: 'bg-purple-500',
    };
    case 'Billing':   return {
      card: 'border-amber-600/35 bg-amber-950/15 hover:border-amber-500/50',
      dot: 'bg-amber-500',
    };
    case 'Cleaning':  return {
      card: 'border-teal-600/35 bg-teal-950/15 hover:border-teal-500/50',
      dot: 'bg-teal-500',
    };
    default:          return { card: 'border-[#C5A880]/20 bg-[#1F1815]', dot: 'bg-gray-500' };
  }
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

  useEffect(() => { fetchTables(); }, []);

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
      if (res.ok) { fetchTables(); setSelectedTable(null); }
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
        body: JSON.stringify({ number: newTableNum, capacity: newTableCap, section: newTableSec }),
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

  const statusLegend: { label: string; color: string }[] = [
    { label: 'Available', color: 'bg-emerald-500' },
    { label: 'Occupied', color: 'bg-[#C5A880]' },
    { label: 'Reserved', color: 'bg-purple-500' },
    { label: 'Billing', color: 'bg-amber-500' },
    { label: 'Cleaning', color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dining Room & Floor Architecture"
        title="Table Management"
        action={
          <>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/40 text-xs font-semibold text-[#FBF8F3] cursor-pointer transition-colors min-h-[40px]"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              Add Table
            </button>
            <button
              onClick={() => { setLoading(true); fetchTables(); }}
              className="p-2.5 rounded-xl bg-[#1F1815] border border-[#C5A880]/30 hover:border-[#C5A880]/60 text-[#C5A880] cursor-pointer transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Refresh tables"
              aria-label="Refresh table data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        }
      />

      {/* Status Legend */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-[#A8988B] uppercase tracking-wider text-[10px] font-bold">Status Key:</span>
        {statusLegend.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
            <span className="text-[#D8CCBD]">{label}</span>
          </div>
        ))}
      </div>

      {/* Table Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonTableCard key={i} />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="rounded-2xl bg-[#1F1815] border border-[#C5A880]/20">
          <EmptyState
            title="No tables configured"
            description="Add your first table to start managing your floor plan."
            action={
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#14100E] text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Table
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {tables.map((table) => {
            const { card, dot } = getStatusStyle(table.status);
            return (
              <button
                key={table.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between text-left cursor-pointer group hover:scale-[1.02] hover:shadow-lg min-h-[160px] ${card}`}
                onClick={() => setSelectedTable(table)}
                aria-label={`Manage ${table.name} - ${table.status}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                      <span className="font-serif text-xl font-bold text-[#FBF8F3]">{table.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenQr(table); }}
                      className="p-1.5 rounded-lg bg-[#14100E]/60 hover:bg-[#14100E] text-[#C5A880] transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                      title="View QR Code"
                      aria-label={`QR code for ${table.name}`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#A8988B] mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {table.capacity}
                    </span>
                    <span>&bull;</span>
                    <span>{table.section}</span>
                  </div>

                  {table.status === 'Occupied' && table.activeOrder && (
                    <div className="p-2 rounded-lg bg-[#14100E]/60 border border-[#C5A880]/20 text-xs mb-2">
                      <div className="font-semibold text-[#C5A880] truncate text-[11px]">
                        {table.activeOrder.customerName}
                      </div>
                      <div className="font-bold text-[#FBF8F3] text-sm">
                        &#8377;{(table.currentBillAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {table.status === 'Reserved' && table.activeReservation && (
                    <div className="p-2 rounded-lg bg-[#14100E]/60 border border-purple-500/20 text-xs mb-2">
                      <div className="font-semibold text-purple-300 truncate text-[11px]">
                        {table.activeReservation.customerName}
                      </div>
                      <div className="text-[10px] text-[#A8988B]">
                        {table.activeReservation.time} &bull; {table.activeReservation.guests}g
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-current/15 mt-auto">
                  <StatusBadge status={table.status} />
                  <span className="text-[#A8988B] opacity-60 group-hover:opacity-100 transition-opacity">
                    Manage
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Table Detail Modal */}
      {selectedTable && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedTable(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Table management - ${selectedTable.name}`}
        >
          <div className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 text-[#FBF8F3] shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#C5A880]/15">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#2A211C] border border-[#C5A880]/30 flex items-center justify-center font-serif text-xl font-bold text-[#C5A880]">
                  {selectedTable.number}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#FBF8F3]">{selectedTable.name}</h3>
                  <span className="text-xs text-[#A8988B]">
                    {selectedTable.section} &bull; {selectedTable.capacity} seats
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-2 rounded-full hover:bg-[#2A211C] text-[#A8988B] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#A8988B] font-bold block" htmlFor="table-status-select">
                Update Status
              </label>
              <select
                id="table-status-select"
                value={selectedTable.status}
                onChange={(e) => handleStatusChange(selectedTable.id, e.target.value as TableStatus)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-sm text-[#FBF8F3] font-semibold focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/12 cursor-pointer"
              >
                <option value="Available">Available (Ready for guests)</option>
                <option value="Occupied">Occupied (Seated)</option>
                <option value="Reserved">Reserved (Holding table)</option>
                <option value="Billing">Billing (Bill requested)</option>
                <option value="Cleaning">Cleaning (Sanitizing)</option>
              </select>
            </div>

            {/* Active order breakdown */}
            {selectedTable.activeOrder ? (
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#A8988B] text-[10px] uppercase font-bold block mb-0.5">Active Order</span>
                    <strong className="text-[#C5A880] text-sm font-mono">{selectedTable.activeOrder.orderNumber}</strong>
                    <p className="text-[#FBF8F3] text-xs mt-0.5">{selectedTable.activeOrder.customerName}</p>
                  </div>
                  <span className="text-lg font-bold text-[#FBF8F3]">
                    &#8377;{selectedTable.activeOrder.grandTotal.toFixed(0)}
                  </span>
                </div>

                <div className="max-h-28 overflow-y-auto divide-y divide-[#C5A880]/08">
                  {selectedTable.activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between text-[11px] text-[#D8CCBD]">
                      <span>{item.quantity}x {item.name}</span>
                      <span>&#8377;{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/admin/billing?tableNumber=${selectedTable.number}`}
                    className="flex-1 py-3 rounded-xl bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-xs uppercase tracking-wider font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Generate Bill
                  </Link>
                  <button
                    onClick={() => handleClearSession(selectedTable.id)}
                    className="px-3 py-3 rounded-xl bg-[#2A211C] hover:bg-red-950/60 text-red-300 text-xs font-semibold border border-red-800/30 cursor-pointer transition-colors"
                  >
                    Clear Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#C5A880]/15 text-xs text-[#A8988B] text-center">
                No active order linked to this table.
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => handleOpenQr(selectedTable)}
                className="flex-1 py-2.5 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]"
              >
                <QrCode className="w-4 h-4" />
                View QR Code
              </button>
              <button
                onClick={() => setSelectedTable(null)}
                className="px-5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/15 text-xs font-semibold text-[#A8988B] cursor-pointer hover:text-[#FBF8F3] transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalTable && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setQrModalTable(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`QR Code for Table ${qrModalTable.number}`}
        >
          <div className="bg-[#1F1815] border border-[#C5A880]/40 rounded-3xl max-w-sm w-full p-6 text-[#FBF8F3] text-center shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/15">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold">Table QR</span>
                <h3 className="font-serif text-xl text-[#FBF8F3]">Table {qrModalTable.number}</h3>
              </div>
              <button
                onClick={() => setQrModalTable(null)}
                className="p-2 rounded-full hover:bg-[#2A211C] text-[#A8988B] transition-colors cursor-pointer"
                aria-label="Close QR modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block border-4 border-[#C5A880]">
              {qrLoading ? (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#1A1412] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`Table ${qrModalTable.number} QR code`}
                  width={240}
                  height={240}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-xs">
                  QR generation failed
                </div>
              )}
            </div>

            <p className="text-xs text-[#A8988B] max-w-xs mx-auto">
              Guests scan to browse the menu and order directly to Table {qrModalTable.number}.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                Print QR
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`NoirBean_Table_${qrModalTable.number}_QR.png`}
                  className="p-3 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-[#C5A880] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Download PNG"
                  aria-label="Download QR code as PNG"
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
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add new table"
        >
          <form
            onSubmit={handleCreateTable}
            className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-sm w-full p-6 text-[#FBF8F3] shadow-2xl space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/15">
              <h3 className="font-serif text-xl text-[#FBF8F3]">Add New Table</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-[#2A211C] text-[#A8988B] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A8988B] font-bold mb-1.5" htmlFor="new-table-num">
                Table Number (e.g. 11)
              </label>
              <input
                id="new-table-num"
                type="text"
                required
                placeholder="11"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-sm text-[#FBF8F3] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/12"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A8988B] font-bold mb-1.5" htmlFor="new-table-cap">
                Seating Capacity
              </label>
              <input
                id="new-table-cap"
                type="number"
                min="1"
                max="20"
                required
                value={newTableCap}
                onChange={(e) => setNewTableCap(parseInt(e.target.value, 10) || 2)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-sm text-[#FBF8F3] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/12"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A8988B] font-bold mb-1.5" htmlFor="new-table-sec">
                Section
              </label>
              <select
                id="new-table-sec"
                value={newTableSec}
                onChange={(e) => setNewTableSec(e.target.value as 'Indoor' | 'Patio' | 'Window' | 'Private')}
                className="w-full px-3.5 py-3 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-sm text-[#FBF8F3] focus:outline-none focus:border-[#C5A880] cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#A8988B] hover:bg-[#342A24] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#DFC8A5] text-[#14100E] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
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
