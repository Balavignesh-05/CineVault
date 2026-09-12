'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, PlayCircle, Star, Trophy, Clock } from 'lucide-react';

export default function YearInReviewPage({ params }: { params: Promise<{ username: string, year: string }> }) {
  const { username, year } = use(params);

  // Mocked Wrapped-style stats
  const totalFilms = 124;
  const totalHours = 248;
  const topGenre = 'Sci-Fi';
  const highestRated = { title: 'Dune: Part Two', rating: 5.0 };

  return (
    <div className="min-h-screen bg-background text-text-secondary py-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Link href={`/profile/${username}/stats`} className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to All-Time Stats
        </Link>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#00e054] tracking-tight">
            {year} in Review
          </h1>
          <p className="text-lg text-text-muted">A look back at {username}&apos;s cinematic journey in {year}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className="bg-surface border border-primary/30 rounded-3xl p-8 space-y-4 text-center transform hover:scale-105 transition-transform">
            <PlayCircle className="w-16 h-16 text-primary mx-auto opacity-80" />
            <h2 className="text-xl font-bold text-white">Films Watched</h2>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">{totalFilms}</p>
          </div>

          <div className="bg-surface border border-accent-amber/30 rounded-3xl p-8 space-y-4 text-center transform hover:scale-105 transition-transform">
            <Clock className="w-16 h-16 text-accent-amber mx-auto opacity-80" />
            <h2 className="text-xl font-bold text-white">Hours Spent</h2>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">{totalHours}</p>
          </div>

          <div className="bg-surface border border-[#9b51e0]/30 rounded-3xl p-8 space-y-4 text-center transform hover:scale-105 transition-transform">
            <Trophy className="w-16 h-16 text-[#9b51e0] mx-auto opacity-80" />
            <h2 className="text-xl font-bold text-white">Top Genre</h2>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">{topGenre}</p>
          </div>

          <div className="bg-surface border border-primary/30 rounded-3xl p-8 space-y-4 text-center transform hover:scale-105 transition-transform flex flex-col justify-center">
            <Star className="w-16 h-16 text-primary mx-auto opacity-80" />
            <h2 className="text-xl font-bold text-white">Highest Rated</h2>
            <p className="text-2xl font-black text-white">{highestRated.title}</p>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-primary text-primary" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
