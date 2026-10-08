import React from 'react';
import Link from 'next/link';
import { Film, Sparkles, Star, Clapperboard, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0b0e14] flex flex-col lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* ── Left Column: Cinematic Visual Showcase (Desktop) ──────── */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#0c1017]">
        {/* Cinematic Backdrop Image with Overlays */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center filter brightness-[0.35] contrast-[1.1] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        {/* Gradient overlays to guarantee CineVault dark aesthetic */}
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-transparent via-[#0b0e14]/40 to-[#0b0e14]" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,224,84,0.35)]">
              <Film size={22} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">CineVault</span>
          </Link>
        </div>

        {/* Center Content / Highlights */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>The Cinema Social Platform</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Discover, track, and celebrate great film.
          </h2>

          <p className="text-base text-text-secondary leading-relaxed font-normal">
            Your personal cinema universe. Keep a digital film diary, explore thousands of movies and TV shows, create shareable lists, and receive AI-curated recommendations.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <CheckCircle2 size={16} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-white/90">Detailed diary & logs</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <Star size={16} className="text-accent-amber shrink-0" />
              <span className="text-xs font-semibold text-white/90">Half-star precision ratings</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <Clapperboard size={16} className="text-accent-tertiary shrink-0" />
              <span className="text-xs font-semibold text-white/90">TMDB catalog of 500k+</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <Sparkles size={16} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-white/90">AI personalized recommendations</span>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 pt-4 border-t border-white/[0.08]">
          <p className="text-xs text-text-muted italic">
            &ldquo;Cinema is a mirror by which we often see ourselves.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Right Column: Auth Card (Mobile & Desktop) ─────────────── */}
      <div className="flex-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative z-10">
        {/* Mobile Header Logo */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,224,84,0.35)]">
              <Film size={22} />
            </div>
            <span className="text-2xl font-black text-white">CineVault</span>
          </Link>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-md bg-[#131722]/90 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-7 sm:p-9 shadow-2xl">
          {children}
        </div>

        <div className="mt-8 text-center text-xs text-text-muted">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to CineVault Home
          </Link>
        </div>
      </div>
    </div>
  );
}
