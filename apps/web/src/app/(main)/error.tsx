'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[CineVault Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#14181c] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="w-16 h-16 text-[#ff8000] mx-auto" />
        <h1 className="text-2xl font-black text-white">Something went wrong</h1>
        <p className="text-[#9ab] text-sm leading-relaxed">
          We encountered an unexpected error. Please try again, or go back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-[#00e054] text-[#14181c] font-bold rounded-lg hover:bg-[#00c745] transition-colors text-sm"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[#2c3440] text-white font-bold rounded-lg hover:bg-[#363c47] transition-colors text-sm"
          >
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
