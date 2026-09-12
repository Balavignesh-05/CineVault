import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CineVault — Discover, Track & Share Movies',
  description: 'Your premium cinema discovery platform. Track movies, write reviews, and discover what to watch next.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-text-secondary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
