import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { CinematicPosterWall } from '@/components/auth/CinematicPosterWall';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0B0F14] flex flex-col justify-center items-center relative overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      {/* ── Cinematic Moving Poster Wall Background ─────────────────── */}
      <CinematicPosterWall />

      {/* ── Centered Auth Container (Aligned on Central Vertical Axis) ── */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center my-auto">
        {/* Brand Logo Header */}
        <Link
          href="/"
          className="flex flex-col items-center mb-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35D6A0] rounded-xl px-2 py-1 transition-transform hover:scale-[1.02]"
          aria-label="CineVault Home"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#35D6A0]/15 border border-[#35D6A0]/40 flex items-center justify-center text-[#35D6A0] shadow-[0_0_16px_rgba(53,214,160,0.3)]">
              <Film size={20} className="stroke-[2.2]" />
            </div>
            <span className="text-2xl font-black text-[#F4F3EC] tracking-tight">CineVault</span>
          </div>
          <span className="text-[10px] font-semibold text-[#9AA8B7] tracking-[0.22em] uppercase mt-1">
            The Cinema Social Platform
          </span>
        </Link>

        {/* Auth Form Card */}
        <div className="w-full bg-[#131A22]/95 backdrop-blur-xl border border-[#273442] hover:border-[#35D6A0]/35 transition-colors rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(53,214,160,0.06)] text-[#F4F3EC]">
          {children}
        </div>

        {/* Return Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#9AA8B7] hover:text-[#35D6A0] transition-colors inline-flex items-center gap-1.5 font-medium focus:outline-none focus-visible:underline"
          >
            ← Back to CineVault Home
          </Link>
        </div>
      </div>
    </div>
  );
}
