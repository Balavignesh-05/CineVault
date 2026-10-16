import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { CinematicPosterWall } from '@/components/auth/CinematicPosterWall';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0B0F14] flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      {/* ── Cinematic Moving Poster Wall Background ─────────────────── */}
      <CinematicPosterWall />

      {/* ── Centered Auth Card Container ────────────────────────────── */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Logo Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 mb-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6A0] rounded-xl px-2 py-1"
          aria-label="CineVault Home"
        >
          <div className="w-10 h-10 rounded-xl bg-[#131A22] border border-[#273442] group-hover:border-[#35D6A0]/50 flex items-center justify-center text-[#35D6A0] group-hover:scale-105 transition-all shadow-[0_0_16px_rgba(53,214,160,0.25)]">
            <Film size={22} />
          </div>
          <span className="text-2xl font-black text-[#F4F3EC] tracking-tight">CineVault</span>
        </Link>

        {/* Form Card */}
        <div className="w-full bg-[#131A22]/90 backdrop-blur-xl border border-[#273442] rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-[#F4F3EC]">
          {children}
        </div>

        {/* Return Home Link */}
        <div className="mt-6 text-center text-xs">
          <Link
            href="/"
            className="text-[#9AA8B7] hover:text-[#35D6A0] transition-colors inline-flex items-center gap-1 font-semibold focus:outline-none focus-visible:underline"
          >
            ← Back to CineVault Home
          </Link>
        </div>
      </div>
    </div>
  );
}
