import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

// Meta title & description — Bagian 13 (SEO & Open Graph)
export const metadata = {
  title: 'Studio AI — Generator Copy & Tema Landing Page',
  description:
    'Studio AI adalah tools yang membuatkan draf copy dan tema visual landing page secara instan, ditenagai Claude API.',
  openGraph: {
    title: 'Studio AI',
    description:
      'Generate copy & tema landing page instan dengan AI. Portfolio project — Powered by Claude API.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio AI',
    description: 'Generate copy & tema landing page instan dengan AI.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
