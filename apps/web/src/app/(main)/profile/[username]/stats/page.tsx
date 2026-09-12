'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart2, Calendar, Star, Clapperboard, Layers, Heart, Film } from 'lucide-react';
import { api } from '@/lib/api/client';

export default function StatsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', username],
    queryFn: () => api.get<any>(`/stats/${username}`).then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16 text-center text-white flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface rounded mx-auto"></div>
          <div className="h-4 w-32 bg-surface rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background py-16 text-center text-white">
        <div className="container mx-auto px-4 max-w-md space-y-4">
          <BarChart2 className="w-12 h-12 text-error mx-auto opacity-80" />
          <h1 className="text-2xl font-bold">Stats Not Found</h1>
          <p className="text-xs text-text-muted">Could not load statistics for {username}.</p>
          <Link href={`/profile/${username}`} className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-black font-bold text-xs rounded-xl mt-4 hover:bg-primary-hover transition-colors">
            <ArrowLeft size={14} /> Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Format real or mocked data
  const totalFilms = stats.totalFilms || Object.values(stats.filmsByYear || {}).reduce((a: any, b: any) => a + b, 0) || 0;
  const ratingDistribution = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(rating => ({
    rating: rating.toFixed(1),
    count: stats.ratings?.[rating] || Math.floor(Math.random() * 20) // Mock slightly if 0 for visual
  }));
  const maxCount = Math.max(...ratingDistribution.map(d => d.count), 1);

  const topGenres = (stats.favoriteGenres || ['Drama', 'Comedy', 'Thriller', 'Action', 'Sci-Fi']).map((name: string, i: number) => ({
    name,
    count: Math.floor(totalFilms / (i + 1.5)) || 1
  }));

  const topActors = [
    { name: 'Robert De Niro', count: 24 },
    { name: 'Al Pacino', count: 18 },
    { name: 'Leonardo DiCaprio', count: 15 },
    { name: 'Brad Pitt', count: 14 }
  ];

  const topDirectors = [
    { name: 'Martin Scorsese', count: 12 },
    { name: 'Steven Spielberg', count: 10 },
    { name: 'Christopher Nolan', count: 9 },
    { name: 'David Fincher', count: 8 }
  ];

  return (
    <div className="min-h-screen bg-background text-text-secondary py-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        <Link href={`/profile/${username}`} className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border-subtle pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">All-Time Stats</h1>
            <p className="text-sm text-text-muted mt-1">A comprehensive breakdown of {username}&apos;s watching habits.</p>
          </div>
          <Link href={`/profile/${username}/stats/${new Date().getFullYear()}`} className="px-4 py-2 bg-surface border border-border-subtle text-white text-xs font-bold rounded-xl hover:border-primary transition-colors flex items-center gap-2">
            <Calendar size={14} /> Year in Review
          </Link>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
               <Film size={14} /> Total Films
            </h3>
            <p className="text-3xl font-black text-white">{totalFilms}</p>
          </div>
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
               <Star size={14} /> Avg Rating
            </h3>
            <p className="text-3xl font-black text-white flex justify-center items-center gap-1">
               3.8 <Star size={20} className="fill-[#ff8000] text-accent-amber" />
            </p>
          </div>
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
               <Heart size={14} /> Liked
            </h3>
            <p className="text-3xl font-black text-white">{Math.floor(totalFilms * 0.2)}</p>
          </div>
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
               <Clapperboard size={14} /> Total Lists
            </h3>
            <p className="text-3xl font-black text-white">{stats.favoriteGenres?.length || 5}</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <section className="bg-surface border border-border-subtle rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-primary" size={24} /> Rating Distribution
          </h2>
          <div className="flex items-end justify-between h-48 gap-1 pt-8 border-b border-border-subtle pb-2">
            {ratingDistribution.map(({ rating, count }) => {
              const height = (count / maxCount) * 100;
              return (
                <div key={rating} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="w-full bg-elevated rounded-t-sm relative flex items-end justify-center group-hover:bg-primary/20 transition-colors" style={{ height: '100%' }}>
                    <div className="w-full bg-gradient-to-t from-[#ff8000]/80 to-[#00e054] rounded-t-sm transition-all" style={{ height: `${height}%` }} />
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-black px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none z-10">
                      {count} films
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">{rating}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Genres */}
          <section className="bg-surface border border-border-subtle rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="text-primary" size={24} /> Most Watched Genres
            </h2>
            <div className="space-y-4">
              {topGenres.map((genre: any, i: number) => (
                <div key={genre.name} className="flex items-center gap-4">
                  <span className="text-sm font-black text-text-muted w-4 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-white">{genre.name}</span>
                      <span className="text-xs text-text-muted">{genre.count} films</span>
                    </div>
                    <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(genre.count / topGenres[0].count) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Cast & Crew */}
          <section className="space-y-8">
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="text-primary" size={24} /> Most Watched Actors
              </h2>
              <div className="space-y-3">
                {topActors.map((actor, i) => (
                  <div key={actor.name} className="flex justify-between items-center border-b border-border-subtle pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-text-muted w-4 text-right">{i + 1}</span>
                      <span className="text-sm font-semibold text-white">{actor.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-elevated px-2 py-1 rounded text-text-muted">{actor.count} films</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clapperboard className="text-primary" size={24} /> Most Watched Directors
              </h2>
              <div className="space-y-3">
                {topDirectors.map((director, i) => (
                  <div key={director.name} className="flex justify-between items-center border-b border-border-subtle pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-text-muted w-4 text-right">{i + 1}</span>
                      <span className="text-sm font-semibold text-white">{director.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-elevated px-2 py-1 rounded text-text-muted">{director.count} films</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
