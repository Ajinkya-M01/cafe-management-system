'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  User,
  MessageSquare,
} from 'lucide-react';

const TIME_SLOTS = [
  '11:30',
  '12:30',
  '13:30',
  '14:30',
  '16:00',
  '17:30',
  '19:00',
  '20:00',
  '20:30',
  '21:30',
  '22:30',
];

const PREFERENCES = [
  { id: 'Indoor', label: 'Main Dining Atelier', desc: 'Fluted travertine and warm wood ambiance' },
  { id: 'Window', label: 'Window Solarium', desc: 'Overlooking heritage avenue and bougainvillea' },
  { id: 'Patio', label: 'Alfresco Herb Courtyard', desc: 'Open-air courtyard with lush rosemary and lanterns' },
  { id: 'Private', label: 'Private Library Alcove', desc: 'Intimate setting for meetings or celebrations' },
];

export default function ReservationPage() {
  const router = useRouter();

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [tablePreference, setTablePreference] = useState('Indoor');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || !customerPhone || !customerEmail || !date || !time) {
      setErrorMessage('Please fill in all required reservation fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          date,
          time,
          guests,
          tablePreference,
          specialRequests,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to book reservation');
      }

      router.push(`/reservation-confirmation?resId=${data.reservation.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reservation failed';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F1] dark:bg-[#100D0B] text-[#1A1412] dark:text-[#F9F6F1] transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <section className="bg-[#1A1412] text-[#F9F6F1] py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#C5A880]/20 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs uppercase tracking-[0.25em] text-[#C5A880] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Table Reservations</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#F9F6F1] mb-4 tracking-tight">
            Curate Your Table
          </h1>
          <p className="text-xs sm:text-sm text-[#D8CCBD] max-w-xl mx-auto leading-relaxed">
            We reserve a limited number of tables daily to preserve an unhurried, peaceful dining atmosphere for our guests.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Date, Time & Party Size */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-sm space-y-6 transition-colors">
            <h3 className="font-serif text-2xl text-[#1A1412] dark:text-[#F9F6F1] border-b border-[#E8DFD5] dark:border-[#2E241F] pb-3">
              1. Date & Time
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Reservation Date *</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] text-sm text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] bg-[#FAF7F2] dark:bg-[#1A1412]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Number of Guests *</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuests(num)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        guests === num
                          ? 'bg-[#1A1412] dark:bg-[#C5A880] text-[#C5A880] dark:text-[#1A1412] shadow-xs'
                          : 'bg-[#FAF7F2] dark:bg-[#1A1412] text-[#4A3E37] dark:text-[#D8CCBD] border border-[#D8CCBD] dark:border-[#2E241F] hover:border-[#C5A880]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#9E7F56] dark:text-[#C5A880]" />
                <span>Available Dining Slots *</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const active = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C5A880] text-[#1A1412] shadow-sm font-bold'
                          : 'bg-[#FAF7F2] dark:bg-[#1A1412] text-[#5F5046] dark:text-[#D8CCBD] border border-[#E8DFD5] dark:border-[#2E241F] hover:border-[#C5A880]'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 2: Seating Ambiance */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-sm space-y-4 transition-colors">
            <h3 className="font-serif text-2xl text-[#1A1412] dark:text-[#F9F6F1] border-b border-[#E8DFD5] dark:border-[#2E241F] pb-3">
              2. Ambiance Preference
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PREFERENCES.map((pref) => {
                const active = tablePreference === pref.id;
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setTablePreference(pref.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[#C5A880] bg-[#C5A880]/10 shadow-xs ring-1 ring-[#C5A880]'
                        : 'border-[#E8DFD5] dark:border-[#2E241F] hover:border-[#D8CCBD]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif text-base font-medium text-[#1A1412] dark:text-[#F9F6F1]">
                        {pref.label}
                      </span>
                      {active && <CheckCircle className="w-4 h-4 text-[#9E7F56] dark:text-[#C5A880]" />}
                    </div>
                    <p className="text-xs text-[#736357] dark:text-[#A8988B]">{pref.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Guest Details & Special Requests */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181310] border border-[#E8DFD5] dark:border-[#2E241F] shadow-sm space-y-6 transition-colors">
            <h3 className="font-serif text-2xl text-[#1A1412] dark:text-[#F9F6F1] border-b border-[#E8DFD5] dark:border-[#2E241F] pb-3">
              3. Guest Details & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Deshmukh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98210 33499"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="rohan@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1412] dark:text-[#F9F6F1] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#9E7F56] dark:text-[#C5A880]" />
                  <span>Special Occasion or Dietary Preferences</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Celebrating our anniversary, quiet corner table requested..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D8CCBD] dark:border-[#2E241F] bg-white dark:bg-[#1A1412] text-xs text-[#1A1412] dark:text-[#F9F6F1] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-4 rounded-full bg-[#1A1412] dark:bg-[#C5A880] hover:bg-[#C5A880] dark:hover:bg-[#D8BE96] text-[#F9F6F1] dark:text-[#1A1412] hover:text-[#1A1412] text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-xl disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <div className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Confirm Reservation Booking</span>
              )}
            </button>
            <p className="text-[11px] text-[#8C7A6D] dark:text-[#A8988B] mt-3">
              We hold reserved tables for 15 minutes past the booking time. No advance booking deposit required.
            </p>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
