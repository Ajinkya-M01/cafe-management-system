import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NOIR & BEAN | Coffee. Cuisine. Conversations.',
  description: 'An artisanal modern café experience. Single-estate coffees, hand-crafted culinary dishes, intimate table reservations, and seamless table ordering.',
  keywords: ['luxury cafe', 'specialty coffee', 'artisan bakery', 'fine dining cafe', 'table reservation', 'gourmet cafe Mumbai'],
  authors: [{ name: 'Noir & Bean Concierge' }],
  openGraph: {
    title: 'NOIR & BEAN | Coffee. Cuisine. Conversations.',
    description: 'An artisanal modern café experience.',
    type: 'website',
  },
};

import Providers from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#FBF8F3] text-[#1F1915] selection:bg-[#C5A880]/30 selection:text-[#181310]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
