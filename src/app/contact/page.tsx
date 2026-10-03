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
  Car,
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
    <div className="min-h-screen flex flex-col bg-[#f9f6f1] text-[#1a1412]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#100d0b] text-[#f9f6f1] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#c5a880]/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a880]/12 border border-[#c5a880]/30 text-[11px] uppercase tracking-[0.25em] font-semibold text-[#c5a880]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Concierge &amp; Private Gatherings</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#f9f6f1] font-normal">
            Connect With Us
          </h1>
          <p className="text-sm text-[#d8ccbd] max-w-xl mx-auto leading-relaxed font-light">
            Our atelier concierge is at your service for private dining buyouts, press inquiries, specialty coffee catering, or table hospitality.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Cards & Hours */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#9e7f56] font-bold">
                The Heritage Atelier
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1412]">
                Our Doors Are Always Open
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-3xl bg-white border border-[#e8ddd0] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#f2ebe0] border border-[#e8ddd0] flex items-center justify-center text-[#9e7f56]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1a1412]">Location</h3>
                <p className="text-xs text-[#7f7065] leading-relaxed">
                  42 Heritage Boulevard, Bandra West, Mumbai, MH 400050
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#e8ddd0] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#f2ebe0] border border-[#e8ddd0] flex items-center justify-center text-[#9e7f56]">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1a1412]">Concierge Direct</h3>
                <p className="text-xs text-[#7f7065] leading-relaxed font-mono">
                  +91 98200 44921 <br />
                  +91 98200 44922
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#e8ddd0] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#f2ebe0] border border-[#e8ddd0] flex items-center justify-center text-[#9e7f56]">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1a1412]">Electronic Mail</h3>
                <p className="text-xs text-[#7f7065] leading-relaxed">
                  concierge@noirandbean.com <br />
                  events@noirandbean.com
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#e8ddd0] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#f2ebe0] border border-[#e8ddd0] flex items-center justify-center text-[#9e7f56]">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1a1412]">Operating Hours</h3>
                <p className="text-xs text-[#7f7065] leading-relaxed">
                  Mon – Fri: 08:00 AM – 11:30 PM <br />
                  Sat – Sun: 07:30 AM – Midnight
                </p>
              </div>
            </div>

            {/* Valet Parking & Ambiance Note */}
            <div className="p-6 rounded-3xl bg-[#1f1815] text-[#f9f6f1] border border-[#c5a880]/25 shadow-md space-y-2">
              <div className="flex items-center gap-2.5 text-[#c5a880]">
                <Car className="w-5 h-5" />
                <h4 className="font-serif text-lg text-[#f9f6f1]">Valet Service &amp; Parking</h4>
              </div>
              <p className="text-xs text-[#d8ccbd] leading-relaxed">
                Complimentary white-glove valet parking is provided at the main portico entrance on Heritage Boulevard.
              </p>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e8ddd0] shadow-md">
            <h3 className="font-serif text-2xl text-[#1a1412] mb-1.5">Send a Message</h3>
            <p className="text-xs text-[#7f7065] mb-6 leading-relaxed">
              Please share your inquiry and our concierge team will respond within 2 to 4 business hours.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl text-[#1a1412]">Message Transmitted</h4>
                <p className="text-xs text-[#7f7065] max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our concierge desk has received your note and will be in touch promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#1a1412] hover:bg-[#c5a880] text-[#f9f6f1] hover:text-[#1a1412] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-[#1a1412] mb-1.5"
                  >
                    Your Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Natasha Kapoor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#d8ccbd] bg-[#f9f6f1] text-xs text-[#1a1412] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#1a1412] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="natasha@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#d8ccbd] bg-[#f9f6f1] text-xs text-[#1a1412] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold text-[#1a1412] mb-1.5"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+91 98199 44321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#d8ccbd] bg-[#f9f6f1] text-xs text-[#1a1412] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-[#1a1412] mb-1.5"
                  >
                    Nature of Inquiry
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#d8ccbd] bg-[#f9f6f1] text-xs text-[#1a1412] focus:outline-none focus:border-[#c5a880] cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Private Dining Buyout">Private Dining / Atelier Buyout</option>
                    <option value="Event Catering">Specialty Coffee Bar Catering</option>
                    <option value="Press & Media">Press &amp; Media Relations</option>
                    <option value="Feedback">Feedback on Experience</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-[#1a1412] mb-1.5"
                  >
                    Message &amp; Requirements *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    placeholder="Tell us about your questions, date preferences, or guest size..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#d8ccbd] bg-[#f9f6f1] text-xs text-[#1a1412] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1a1412] hover:bg-[#c5a880] text-[#f9f6f1] hover:text-[#1a1412] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
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
