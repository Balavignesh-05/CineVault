'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[CineVault Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="w-16 h-16 text-[#FF9F43] mx-auto" />
        <h1 className="text-2xl font-black text-[#F4F3EC]">Something went wrong</h1>
        <p className="text-[#9AA8B7] text-sm leading-relaxed">
          We encountered an unexpected error. Please try again, or go back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-[#0B0F14] font-bold rounded-xl hover:bg-primary-hover transition-colors text-sm shadow-[0_0_20px_rgba(53,214,160,0.2)]"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[#1A2430] border border-[#273442] text-[#F4F3EC] font-bold rounded-xl hover:border-[#35D6A0] transition-colors text-sm"
          >
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
