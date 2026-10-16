import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cine-vault-gules.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'CineVault — Discover, Track & Share Movies',
    template: '%s | CineVault',
  },
  description: 'Your premium cinema discovery and social tracking platform. Discover trending films, track watchlists, write reviews, and explore curated movie collections.',
  keywords: ['movies', 'cinema', 'film discovery', 'watchlist', 'reviews', 'movie tracking', 'TMDB', 'social cinema'],
  authors: [{ name: 'CineVault Team' }],
  creator: 'CineVault',
  publisher: 'CineVault',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'CineVault',
    title: 'CineVault — Discover, Track & Share Movies',
    description: 'Your premium cinema discovery and social tracking platform. Discover trending films, track watchlists, write reviews, and explore curated movie collections.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'CineVault — Discover & Track Movies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineVault — Discover, Track & Share Movies',
    description: 'Your premium cinema discovery and social tracking platform. Track movies, write reviews, and discover what to watch next.',
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-background text-text-secondary antialiased selection:bg-primary selection:text-black min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
