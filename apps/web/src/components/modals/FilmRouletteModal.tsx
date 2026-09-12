'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Dices, X, Star, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilmRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilmRouletteModal({ isOpen, onClose }: FilmRouletteModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [pickedMovie, setPickedMovie] = useState<any | null>(null);

  if (!isOpen) return null;

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Crime', 'Western', 'Adventure', 'Animation'];

  const handleSpin = async () => {
    setSpinning(true);
    
    try {
      const queryParams = new URLSearchParams();
      // Generate a random page between 1 and 20 for variety
      const randomPage = Math.floor(Math.random() * 20) + 1;
      queryParams.set('page', randomPage.toString());
      queryParams.set('sort_by', 'vote_average.desc');
      queryParams.set('vote_count.gte', '3000'); // Ensure well-known movies

      const tmdbGenreMap: Record<string, string> = {
        'Action': '28', 'Drama': '18', 'Crime': '80', 'Sci-Fi': '878',
        'Western': '37', 'Adventure': '12', 'Animation': '16'
      };

      if (selectedGenre !== 'All' && tmdbGenreMap[selectedGenre]) {
        queryParams.set('with_genres', tmdbGenreMap[selectedGenre]);
      }

      const res = await fetch(`/api/tmdb/discover?${queryParams.toString()}`);
      const { data } = await res.json();

      if (data?.results?.length > 0) {
        // Spin effect
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * data.results.length);
          const raw = data.results[randomIndex];
          const releaseYear = raw.release_date ? parseInt(raw.release_date.substring(0, 4)) : 2023;
          
          setPickedMovie({
            id: raw.id,
            title: raw.title,
            year: releaseYear,
            rating: raw.vote_average,
            posterPath: raw.poster_path,
            director: undefined,
            rank: (randomPage - 1) * 20 + randomIndex + 1
          });
          setSpinning(false);
        }, 800);
      } else {
        setSpinning(false);
      }
    } catch (err) {
      console.error(err);
      setSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-amber/10 border border-[#ff8000]/30 flex items-center justify-center text-accent-amber">
              <Dices size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Film Roulette</h2>
              <p className="text-xs text-text-secondary font-mono">Can&apos;t decide what to watch? Let CineVault pick!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-elevated hover:bg-[#3d4856] text-text-secondary hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          {/* Genre selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block">
              Filter Pool by Genre
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    selectedGenre === g
                      ? 'bg-primary text-[#14181c] font-bold'
                      : 'bg-surface border border-border-subtle text-text-secondary hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card Display */}
          {pickedMovie ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in zoom-in-95 duration-200 backdrop-blur-sm shadow-xl">
              <div className="relative aspect-[2/3] w-36 mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={
                    pickedMovie.posterPath.startsWith('http')
                      ? pickedMovie.posterPath
                      : `https://image.tmdb.org/t/p/w500${pickedMovie.posterPath}`
                  }
                  alt={pickedMovie.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/30">
                  #{pickedMovie.rank} Rank
                </div>
                <h3 className="text-xl font-bold text-white">{pickedMovie.title} ({pickedMovie.year})</h3>
                <p className="text-xs text-text-secondary font-mono">Directed by {pickedMovie.director}</p>
                <div className="text-sm font-bold font-mono text-accent-amber pt-1">
                  ★ {pickedMovie.rating.toFixed(1)} / 10 IMDb Rating
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/movies/${pickedMovie.id}`}
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-[#14181c] font-bold text-sm shadow-[0_0_15px_rgba(0,224,84,0.3)] transition-all hover:scale-105"
                >
                  View Movie Details
                </Link>
                <Button
                  onClick={handleSpin}
                  disabled={spinning}
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm py-2.5 h-auto transition-colors"
                >
                  <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} /> Spin Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 px-4 rounded-2xl bg-white/5 border border-white/10 border-dashed space-y-4 backdrop-blur-sm">
              <Dices size={48} className="text-primary mx-auto opacity-80 animate-bounce" />
              <p className="text-sm text-text-secondary">
                Press the button below to randomly pick a top-rated movie from our database!
              </p>
              <Button
                onClick={handleSpin}
                disabled={spinning}
                className="bg-primary hover:bg-[#00c048] text-[#14181c] font-bold px-6 py-3 rounded-xl gap-2 shadow-lg"
              >
                <Sparkles size={18} /> Spin Film Roulette
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
