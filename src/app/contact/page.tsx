'use client';

import React, { useState } from 'react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Coffee,
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1A1412] text-[#FBF8F3] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#C5A880]/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs uppercase tracking-[0.25em] text-[#C5A880] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Concierge & Private Events</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#FBF8F3] mb-4">
            Connect With Us
          </h1>
          <p className="text-sm text-[#D8CCBD] max-w-xl mx-auto leading-relaxed">
            Our atelier concierge is at your service for private dining buyouts, press inquiries, specialty catering, or general table hospitality.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Contact Cards & Hours */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#9E7F56] font-semibold">
                The Heritage Atelier
              </span>
              <h2 className="font-serif text-3xl text-[#1A1412]">
                Our Doors Are Always Open
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center text-[#9E7F56]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1A1412]">Location</h3>
                <p className="text-xs text-[#736357] leading-relaxed">
                  42 Heritage Boulevard, Bandra West, Mumbai, MH 400050
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center text-[#9E7F56]">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1A1412]">Concierge Direct</h3>
                <p className="text-xs text-[#736357] leading-relaxed">
                  +91 98200 44921 <br />
                  +91 98200 44922
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center text-[#9E7F56]">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1A1412]">Electronic Mail</h3>
                <p className="text-xs text-[#736357] leading-relaxed">
                  concierge@noirandbean.com <br />
                  events@noirandbean.com
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center text-[#9E7F56]">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1A1412]">Operating Hours</h3>
                <p className="text-xs text-[#736357] leading-relaxed">
                  Mon – Fri: 08:00 AM – 11:30 PM <br />
                  Sat – Sun: 07:30 AM – Midnight
                </p>
              </div>
            </div>

            {/* Ambiance Note */}
            <div className="p-6 rounded-2xl bg-[#201815] text-[#FBF8F3] border border-[#C5A880]/30 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Coffee className="w-5 h-5 text-[#C5A880]" />
                <h4 className="font-serif text-lg text-[#FBF8F3]">Valet & Parking</h4>
              </div>
              <p className="text-xs text-[#D8CCBD] leading-relaxed">
                Complimentary valet service is provided at the main portico entrance on Heritage Boulevard.
              </p>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8DFD5] shadow-sm">
            <h3 className="font-serif text-2xl text-[#1A1412] mb-2">Send a Message</h3>
            <p className="text-xs text-[#736357] mb-6">
              Please share your inquiry and our team will respond within 2 to 4 business hours.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl text-[#1A1412]">Message Delivered</h4>
                <p className="text-xs text-[#736357] max-w-sm mx-auto">
                  Thank you for reaching out. Our guest relations team has received your note.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#1A1412] text-[#FBF8F3] text-xs uppercase tracking-wider font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1412] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Natasha Kapoor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] text-xs text-[#1A1412] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1412] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="natasha@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] text-xs text-[#1A1412] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1412] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98199 44321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] text-xs text-[#1A1412] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1412] mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] text-xs text-[#1A1412] focus:outline-none focus:border-[#C5A880] bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Private Dining Buyout">Private Dining / Atelier Buyout</option>
                    <option value="Event Catering">Specialty Coffee Bar Catering</option>
                    <option value="Press & Media">Press & Media Relations</option>
                    <option value="Feedback">Feedback on Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1412] mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your requirements or questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CCBD] text-xs text-[#1A1412] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1A1412] hover:bg-[#C5A880] text-[#FBF8F3] hover:text-[#1A1412] font-semibold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
