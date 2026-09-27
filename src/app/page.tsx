'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { useCart } from '@/context/CartContext';
import {
  ArrowRight,
  Coffee,
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  Star,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';

const signatureDishes = [
  {
    id: 'menu_01',
    name: 'Smoked Sea Salt Cortado',
    category: 'Signature Coffee',
    price: 340,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    description: 'Double ristretto infused with house-smoked Madagascar sea salt and silky oat emulsion.',
  },
  {
    id: 'menu_16',
    name: 'Truffle & Mushroom Pappardelle',
    category: 'Handcrafted Pasta',
    price: 740,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281223?auto=format&fit=crop&w=800&q=80',
    description: 'Ribbons in white truffle emulsion, glazed shiitake, and 24-month Parmigiano-Reggiano.',
  },
  {
    id: 'menu_13',
    name: 'Artisan Burrata Carpaccio',
    category: 'Antipasti',
    price: 580,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?auto=format&fit=crop&w=800&q=80',
    description: 'Pugliese burrata, marinated heirloom tomatoes, basil oil, and 12-year Modena balsamic.',
  },
  {
    id: 'menu_20',
    name: 'Basque Burnt Cheesecake',
    category: 'Artisanal Dessert',
    price: 450,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    description: 'Caramelized exterior with an impossibly molten, silky center and sour cherry compote.',
  },
];

const atmospheres = [
  {
    title: 'The Sunlit Window Solarium',
    desc: 'Luminous morning seating overlooking heritage bougainvillea, curated for peaceful reading and espresso rituals.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'The Botanical Courtyard',
    desc: 'Alfresco dining amidst jasmine and wild rosemary, ideal for evening conversations and twilight aperitifs.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'The Oak & Marble Atelier',
    desc: 'Deep espresso wood finishes, warm brass lighting, and custom sound design tailored for fine conversations.',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
  },
];

const testimonials = [
  {
    quote:
      'Noir & Bean has redefined what café culture can be in Mumbai. The Cortado is pure artistry, and the quiet sophistication is unmatched.',
    author: 'Chef Ranveer M.',
    publication: 'Culinary Chronicles Magazine',
  },
  {
    quote:
      'Their Truffled Pappardelle and Basque Cheesecake are reasons alone to visit weekly. Ordering from the table via QR was effortless.',
    author: 'Sunaina Singhania',
    publication: 'Architectural Digest Patron',
  },
  {
    quote:
      'The lighting, the custom playlists, the flawless single-origin Ethiopian pour-overs — this is a modern sanctuary of good taste.',
    author: 'Vikramaditya Roy',
    publication: 'Epicurean Reviewer',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { addItem, setTableNumber, setOrderType } = useCart();
  const [quickTableInput, setQuickTableInput] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const handleQuickQrSimulate = (tableNum: string) => {
    const padded = tableNum.padStart(2, '0');
    setTableNumber(padded);
    setOrderType('dine-in');
    router.push(`/menu?table=${padded}`);
  };

  const handleAddDish = (dish: (typeof signatureDishes)[0]) => {
    addItem({
      menuItemId: dish.id,
      name: dish.name,
      price: dish.price,
      isVeg: dish.isVeg,
      image: dish.image,
    });
    setAddedItemName(dish.name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3]">
      <Navbar />

      {/* Added to order toast notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1412] text-[#FBF8F3] px-5 py-3 rounded-xl shadow-2xl border border-[#C5A880]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />
          <div className="text-sm">
            <span className="font-semibold">{addedItemName}</span> added to order
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-[#C5A880] uppercase tracking-wider hover:underline ml-2"
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#14100E] text-[#FBF8F3]">
        {/* Background Image with subtle cinematic overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85"
            alt="Noir and Bean luxury cafe interior"
            fill
            priority
            className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-[#14100E]/70 to-[#14100E]/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 text-xs uppercase tracking-[0.25em] text-[#C5A880] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisanal Specialty Roastery & Kitchen</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#FBF8F3] mb-6 font-normal">
            Coffee. Cuisine. <br />
            <span className="italic text-[#C5A880]">Conversations.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#E8DFD5]/80 font-light leading-relaxed mb-10">
            Welcome to <strong className="font-medium text-[#FBF8F3]">NOIR & BEAN</strong>. An elevated dining sanctuary marrying rare single-origin coffees, seasonal European culinary techniques, and tranquil architectural design.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reservation"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2A211C] hover:bg-[#342A24] text-[#FBF8F3] border border-[#C5A880]/40 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Reserve Table</span>
            </Link>
          </div>

          {/* QR Table ordering quick simulation banner for customers sitting at tables */}
          <div className="mt-14 max-w-xl mx-auto p-4 rounded-2xl bg-[#231B17]/90 border border-[#C5A880]/30 backdrop-blur-md text-left shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#FBF8F3] font-semibold">
                  Seated at a table right now?
                </h4>
                <p className="text-[11px] text-[#A8988B]">
                  Select your table to simulate scanning the tabletop QR code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Select table number"
                className="bg-[#14100E] border border-[#C5A880]/30 rounded-lg px-3 py-1.5 text-xs text-[#E8DFD5] focus:outline-none focus:border-[#C5A880]"
                value={quickTableInput}
                onChange={(e) => setQuickTableInput(e.target.value)}
              >
                <option value="">Choose Table...</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n.toString()}>
                    Table {n.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => quickTableInput && handleQuickQrSimulate(quickTableInput)}
                disabled={!quickTableInput}
                className="px-3 py-1.5 rounded-lg bg-[#C5A880] text-[#14100E] text-xs font-semibold disabled:opacity-50 hover:bg-[#D4B68D] transition-colors whitespace-nowrap cursor-pointer"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy & Pillars Strip */}
      <section className="bg-[#1A1412] text-[#FBF8F3] py-8 border-y border-[#C5A880]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-[#C5A880] font-serif text-2xl font-normal">100%</p>
              <p className="text-xs uppercase tracking-widest text-[#A8988B]">Single-Estate Arabica</p>
            </div>
            <div className="space-y-1">
              <p className="text-[#C5A880] font-serif text-2xl font-normal">18-Hour</p>
              <p className="text-xs uppercase tracking-widest text-[#A8988B]">Kyoto Cold Extraction</p>
            </div>
            <div className="space-y-1">
              <p className="text-[#C5A880] font-serif text-2xl font-normal">Artisanal</p>
              <p className="text-xs uppercase tracking-widest text-[#A8988B]">Wild Yeast Fermentation</p>
            </div>
            <div className="space-y-1">
              <p className="text-[#C5A880] font-serif text-2xl font-normal">Instant</p>
              <p className="text-xs uppercase tracking-widest text-[#A8988B]">Table QR Ordering</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#9E7F56] font-semibold block mb-2">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1412]">
              Signature Delicacies
            </h2>
          </div>
          <Link
            href="/menu"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#9E7F56] hover:text-[#1A1412] transition-colors group"
          >
            <span>View Complete Digital Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {signatureDishes.map((dish) => (
            <div
              key={dish.id}
              className="card-luxury rounded-2xl overflow-hidden flex flex-col group border border-[#E8DFD5]"
            >
              <div className="relative h-60 w-full overflow-hidden bg-[#E8DFD5]">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute top-3 left-3 bg-[#1A1412]/80 backdrop-blur-xs text-[#FBF8F3] px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium">
                  {dish.category}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-sm">
                  <span
                    className={`block w-2.5 h-2.5 rounded-full ${
                      dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#1A1412] mb-1.5 group-hover:text-[#9E7F56] transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-[#736357] leading-relaxed mb-4 line-clamp-2">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8DFD5] flex items-center justify-between">
                  <span className="text-base font-bold text-[#1A1412]">
                    ₹{dish.price}
                  </span>
                  <button
                    onClick={() => handleAddDish(dish)}
                    className="px-3.5 py-1.5 rounded-full bg-[#1A1412] hover:bg-[#C5A880] text-[#FBF8F3] hover:text-[#1A1412] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    Add +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Story & Roastery */}
      <section className="bg-[#201815] text-[#FBF8F3] py-24 border-y border-[#C5A880]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
                Our Story & Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#FBF8F3] leading-tight">
                An Ode to Time, Terroir, and Texture.
              </h2>
              <p className="text-sm text-[#D8CCBD] leading-relaxed">
                Founded with a conviction that dining should be restorative, NOIR & BEAN bridges the discipline of third-wave roasting with the warmth of classical culinary hospitality.
              </p>
              <p className="text-sm text-[#D8CCBD] leading-relaxed">
                Every bean in our glass hoppers is sourced directly from ethical shade-grown estates in Chikmagalur, Yirgacheffe, and Huila. In the kitchen, our culinary brigade ferments sourdough for 36 hours, crafts seasonal pastas daily, and presents each dish as an unhurried work of art.
              </p>

              <div className="pt-4 flex items-center gap-8">
                <div>
                  <h4 className="font-serif text-2xl text-[#C5A880]">36-Hour</h4>
                  <p className="text-xs uppercase tracking-wider text-[#A8988B]">Wild Fermentations</p>
                </div>
                <div className="w-[1px] h-10 bg-[#C5A880]/30" />
                <div>
                  <h4 className="font-serif text-2xl text-[#C5A880]">Micro-Lot</h4>
                  <p className="text-xs uppercase tracking-wider text-[#A8988B]">Direct Farm Trade</p>
                </div>
              </div>
            </div>

            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#C5A880]/30">
              <Image
                src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80"
                alt="Artisan pour-over process"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#14100E]/80 backdrop-blur-md border border-[#C5A880]/30 text-xs text-[#E8DFD5]">
                Single-origin Ethiopian Yirgacheffe extracted through Japanese V60 glass towers.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atmospheric Gallery */}
      <section id="atmosphere" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7F56] font-semibold block mb-2">
            Sanctuary & Ambiance
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1412] mb-4">
            Designed for Serenity
          </h2>
          <p className="text-sm text-[#736357]">
            Natural linen, fluted travertine, hand-waxed teak, and bespoke warm illumination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {atmospheres.map((atm) => (
            <div
              key={atm.title}
              className="card-luxury rounded-2xl overflow-hidden group border border-[#E8DFD5]"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={atm.image}
                  alt={atm.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-medium text-[#1A1412] mb-2">
                  {atm.title}
                </h3>
                <p className="text-xs text-[#736357] leading-relaxed">
                  {atm.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Testimonials */}
      <section className="bg-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-y border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#9E7F56] font-semibold block mb-2">
              Critical Acclaim
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1412]">
              Words of Appreciation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-[#C5A880] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A880]" />
                  ))}
                </div>
                <blockquote className="text-sm text-[#4A3E37] italic leading-relaxed mb-6 font-serif">
                  &quot;{t.quote}&quot;
                </blockquote>
                <div className="pt-4 border-t border-[#E8DFD5]">
                  <p className="text-xs font-bold text-[#1A1412]">{t.author}</p>
                  <p className="text-[11px] text-[#8C7A6D]">{t.publication}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Banner CTA */}
      <section className="bg-[#1A1412] text-[#FBF8F3] py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <UtensilsCrossed className="w-10 h-10 text-[#C5A880] mx-auto mb-4 opacity-90" />
          <h2 className="font-serif text-3xl sm:text-5xl text-[#FBF8F3] mb-4">
            Reserve Your Experience
          </h2>
          <p className="text-sm text-[#D8CCBD] max-w-xl mx-auto mb-8 leading-relaxed">
            Whether an intimate dinner for two, a productive private breakfast, or a weekend coffee degustation, we welcome your presence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/reservation"
              className="px-8 py-3.5 rounded-full bg-[#C5A880] hover:bg-[#D4B68D] text-[#1A1412] text-xs uppercase tracking-widest font-semibold transition-all shadow-xl"
            >
              Book Table Online
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full bg-transparent hover:bg-white/5 border border-[#C5A880]/40 text-[#FBF8F3] text-xs uppercase tracking-widest font-medium transition-all"
            >
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
