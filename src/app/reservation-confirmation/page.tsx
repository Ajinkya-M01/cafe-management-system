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
      <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B]">Loading reservation pass...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-700/60 dark:text-red-400 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-[#1A1412] dark:text-[#F9F6F1] mb-2 font-medium">Reservation Not Found</h2>
          <p className="text-xs text-[#736357] dark:text-[#A8988B] mb-6">{error || 'Unable to locate your booking.'}</p>
          <Link
            href="/reservation"
            className="px-6 py-2.5 rounded-full bg-[#1A1412] dark:bg-[#C5A880] text-[#F9F6F1] dark:text-[#1A1412] text-xs font-medium uppercase tracking-wider"
          >
            Make a Reservation
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-4 text-[#9E7F56] dark:text-[#C5A880]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7F56] dark:text-[#C5A880] font-semibold block mb-1">
            Table Reserved & Acknowledged
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1412] dark:text-[#F9F6F1] mb-3">
            We Await Your Arrival
          </h1>
          <p className="text-xs text-[#736357] dark:text-[#A8988B]">
            Your dining experience has been reserved at Atelier NOIR & BEAN.
          </p>
        </div>

        {cancelSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>This reservation has been successfully cancelled.</span>
          </div>
        )}

        {/* Digital Luxury Pass Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#C5A880]/30 bg-white dark:bg-[#181310] mb-10 transition-colors">
          {/* Header strip */}
          <div className="bg-[#1A1412] text-[#F9F6F1] p-6 sm:p-8 flex items-center justify-between border-b border-[#C5A880]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17] text-[#C5A880]">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-xl tracking-wider text-[#F9F6F1] block">
                  NOIR & BEAN
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">
                  Dining Reservation Pass
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#E8DFD5] dark:border-[#2E241F]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Date</span>
                </span>
                <span className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">{reservation.date}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B] block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Time Slot</span>
                </span>
                <span className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">{reservation.time}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B] block mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Party Size</span>
                </span>
                <span className="text-sm font-bold text-[#1A1412] dark:text-[#F9F6F1]">{reservation.guests} Guests</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6D] dark:text-[#A8988B] block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Allocated Table</span>
                </span>
                <span className="text-sm font-bold text-[#9E7F56] dark:text-[#C5A880]">
                  {reservation.assignedTableNumber ? `Table ${reservation.assignedTableNumber}` : reservation.tablePreference}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#736357] dark:text-[#A8988B]">
              <div>
                <strong className="block text-[#1A1412] dark:text-[#F9F6F1] font-semibold mb-0.5">Guest Name</strong>
                <span>{reservation.customerName}</span>
              </div>

              <div>
                <strong className="block text-[#1A1412] dark:text-[#F9F6F1] font-semibold mb-0.5">Contact Concierge</strong>
                <span>{reservation.customerPhone} • {reservation.customerEmail}</span>
              </div>

              {reservation.specialRequests && (
                <div className="sm:col-span-2 bg-[#FAF7F2] dark:bg-[#1F1915] p-3.5 rounded-xl border border-[#E8DFD5] dark:border-[#2E241F]">
                  <strong className="block text-[#1A1412] dark:text-[#F9F6F1] font-semibold mb-0.5">Special Requests</strong>
                  <span>&quot;{reservation.specialRequests}&quot;</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-[#FAF7F2] dark:bg-[#1F1915] p-4 sm:p-6 border-t border-[#E8DFD5] dark:border-[#2E241F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${reservation.status === 'Cancelled' ? 'bg-red-500' : 'bg-emerald-600'}`} />
              <span className="font-semibold text-[#1A1412] dark:text-[#F9F6F1]">Status: {reservation.status}</span>
            </div>

            <div className="flex items-center gap-3">
              {reservation.status !== 'Cancelled' && (
                <button
                  onClick={handleCancelReservation}
                  disabled={cancelling}
                  className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
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
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#181310] border border-[#D8CCBD] dark:border-[#2E241F] text-xs uppercase tracking-widest font-semibold text-[#1A1412] dark:text-[#F9F6F1] hover:bg-[#FAF7F2] dark:hover:bg-[#231B17] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#9E7F56] dark:text-[#C5A880]" />
            <span>Print Reservation Pass</span>
          </button>

          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#C5A880] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] hover:text-[#1A1412] text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
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
        <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] dark:bg-[#100D0B]">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReservationConfirmationContent />
    </Suspense>
  );
}
