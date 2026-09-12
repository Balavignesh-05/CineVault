'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MediaCard } from '@/components/media/MediaCard';
import { Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FilmsPage() {
  const [industry, setIndustry] = useState('All');
  const [year, setYear] = useState('');

  const [genre, setGenre] = useState('');
  const [decade, setDecade] = useState('');
  const [rating, setRating] = useState('');
  const [hideWatched, setHideWatched] = useState(false);
  const [hideWatchlist, setHideWatchlist] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['films', industry, year, genre, decade, rating, hideWatched, hideWatchlist],
    queryFn: () => {
      const params = new URLSearchParams();
      if (year) params.append('primary_release_year', year);
      if (genre) params.append('with_genres', genre);
      if (rating) params.append('vote_average.gte', rating);
      if (decade) {
        const start = parseInt(decade);
        params.append('primary_release_date.gte', `${start}-01-01`);
        params.append('primary_release_date.lte', `${start + 9}-12-31`);
      }
      if (industry === 'Bollywood') params.append('with_origin_country', 'IN');
      return fetch(`/api/tmdb/discover?${params.toString()}`).then(res => res.json());
    },
  });

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-24">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <Film className="w-6 h-6 text-text-muted" />
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Browse Films</h1>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 rounded-xl bg-surface border border-border-subtle text-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-text-muted uppercase tracking-widest text-[10px] font-bold">Filters</span>
            <select 
              className="bg-elevated text-text-secondary hover:text-white p-2 rounded-md border border-border-subtle outline-none min-w-[120px] transition-colors cursor-pointer appearance-none"
              value={year}
              onChange={(e) => { setYear(e.target.value); setDecade(''); }}
            >
              <option value="">Year</option>
              {Array.from({ length: 25 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>

            <select 
              className="bg-elevated text-text-secondary hover:text-white p-2 rounded-md border border-border-subtle outline-none min-w-[120px] transition-colors cursor-pointer appearance-none"
              value={decade}
              onChange={(e) => { setDecade(e.target.value); setYear(''); }}
            >
              <option value="">Decade</option>
              <option value="2020">2020s</option>
              <option value="2010">2010s</option>
              <option value="2000">2000s</option>
              <option value="1990">1990s</option>
              <option value="1980">1980s</option>
              <option value="1970">1970s</option>
            </select>

            <select 
              className="bg-elevated text-text-secondary hover:text-white p-2 rounded-md border border-border-subtle outline-none min-w-[120px] transition-colors cursor-pointer appearance-none"
              value={genre} 
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">Genre</option>
              <option value="28">Action</option>
              <option value="12">Adventure</option>
              <option value="16">Animation</option>
              <option value="35">Comedy</option>
              <option value="80">Crime</option>
              <option value="99">Documentary</option>
              <option value="18">Drama</option>
              <option value="10751">Family</option>
              <option value="14">Fantasy</option>
              <option value="27">Horror</option>
              <option value="878">Science Fiction</option>
              <option value="53">Thriller</option>
            </select>

            <select 
              className="bg-elevated text-text-secondary hover:text-white p-2 rounded-md border border-border-subtle outline-none min-w-[120px] transition-colors cursor-pointer appearance-none"
              value={rating} 
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">Rating</option>
              <option value="8">Highest Rated</option>
              <option value="6">Good</option>
            </select>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-4 w-full md:w-auto">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded border-border-subtle bg-elevated accent-accent-primary" checked={hideWatched} onChange={e => setHideWatched(e.target.checked)} />
              <span className="group-hover:text-white transition-colors">Hide Logged</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded border-border-subtle bg-elevated accent-accent-primary" checked={hideWatchlist} onChange={e => setHideWatchlist(e.target.checked)} />
              <span className="group-hover:text-white transition-colors">Hide Watchlist</span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : data?.results?.length === 0 ? (
          <div className="text-center py-20 text-text-muted">No films found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.results?.map((movie: any) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}