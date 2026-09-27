'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { Reservation } from '@/types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Printer,
  XCircle,
  ArrowRight,
  Coffee,
  AlertCircle,
} from 'lucide-react';

function ReservationConfirmationContent() {
  const searchParams = useSearchParams();
  const resId = searchParams.get('resId');

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (!resId) {
      setError('No reservation reference provided.');
      setLoading(false);
      return;
    }

    async function loadReservation() {
      try {
        const res = await fetch(`/api/reservations/${resId}`);
        const data = await res.json();
        if (data.success && data.reservation) {
          setReservation(data.reservation);
        } else {
          setError(data.error || 'Reservation not found');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error fetching reservation';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadReservation();
  }, [resId]);

  const handleCancelReservation = async () => {
    if (!reservation || !confirm('Are you sure you wish to cancel this reservation?')) return;
    setCancelling(true);

    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess(true);
        setReservation((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      } else {
        alert(data.error || 'Failed to cancel reservation');
      }
    } catch {
      alert('Error communicating with reservation server');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F3]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest text-[#8C7A6D]">Loading reservation pass...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F3]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-700/60 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-[#1A1412] mb-2 font-medium">Reservation Not Found</h2>
          <p className="text-xs text-[#736357] mb-6">{error || 'Unable to locate your booking.'}</p>
          <Link
            href="/reservation"
            className="px-6 py-2.5 rounded-full bg-[#1A1412] text-[#FBF8F3] text-xs font-medium uppercase tracking-wider"
          >
            Make a Reservation
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-4 text-[#9E7F56]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7F56] font-semibold block mb-1">
            Table Reserved & Acknowledged
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1412] mb-3">
            We Await Your Arrival
          </h1>
          <p className="text-xs text-[#736357]">
            Your dining experience has been scheduled at NOIR & BEAN.
          </p>
        </div>

        {cancelSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700" />
            <span>This reservation has been successfully cancelled.</span>
          </div>
        )}

        {/* Digital Luxury Pass Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#C5A880]/30 bg-white mb-10">
          {/* Header strip */}
          <div className="bg-[#1A1412] text-[#FBF8F3] p-6 sm:p-8 flex items-center justify-between border-b border-[#C5A880]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17]">
                <Coffee className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div>
                <span className="font-serif text-xl tracking-wider text-[#FBF8F3] block">
                  NOIR & BEAN
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">
                  Dining Pass
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#A8988B] block">
                Booking ID
              </span>
              <span className="text-sm font-bold text-[#C5A880] tracking-widest">
                {reservation.reservationNumber}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#E8DFD5]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9E7F56]" />
                  <span>Date</span>
                </span>
                <span className="text-sm font-bold text-[#1A1412]">{reservation.date}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9E7F56]" />
                  <span>Time Slot</span>
                </span>
                <span className="text-sm font-bold text-[#1A1412]">{reservation.time}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] block mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#9E7F56]" />
                  <span>Party Size</span>
                </span>
                <span className="text-sm font-bold text-[#1A1412]">{reservation.guests} Guests</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9E7F56]" />
                  <span>Allocated Table</span>
                </span>
                <span className="text-sm font-bold text-[#9E7F56]">
                  {reservation.assignedTableNumber ? `Table ${reservation.assignedTableNumber}` : reservation.tablePreference}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#736357]">
              <div>
                <strong className="block text-[#1A1412] font-semibold mb-0.5">Guest Name</strong>
                <span>{reservation.customerName}</span>
              </div>

              <div>
                <strong className="block text-[#1A1412] font-semibold mb-0.5">Contact Concierge</strong>
                <span>{reservation.customerPhone} • {reservation.customerEmail}</span>
              </div>

              {reservation.specialRequests && (
                <div className="sm:col-span-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                  <strong className="block text-[#1A1412] font-semibold mb-0.5">Special Requests</strong>
                  <span>&quot;{reservation.specialRequests}&quot;</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-[#FAF7F2] p-4 sm:p-6 border-t border-[#E8DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="font-semibold text-[#1A1412]">Status: {reservation.status}</span>
            </div>

            <div className="flex items-center gap-3">
              {reservation.status !== 'Cancelled' && (
                <button
                  onClick={handleCancelReservation}
                  disabled={cancelling}
                  className="text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Reservation'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-[#D8CCBD] text-xs uppercase tracking-widest font-semibold text-[#1A1412] hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#9E7F56]" />
            <span>Print Reservation Pass</span>
          </button>

          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1A1412] hover:bg-[#C5A880] text-[#FBF8F3] hover:text-[#1A1412] text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span>Preview Digital Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ReservationConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReservationConfirmationContent />
    </Suspense>
  );
}
