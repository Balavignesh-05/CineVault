import React from 'react';
import Link from 'next/link';
import { Film, ArrowLeft, AlertCircle } from 'lucide-react';
import { discoverMovies, getGenres, normalizeMovieCard } from '@/lib/tmdb/client';
import { MediaCard } from '@/components/media/MediaCard';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

const GENRE_MAP: Record<string, { id: number; name: string }> = {
  'action': { id: 28, name: 'Action' },
  'adventure': { id: 12, name: 'Adventure' },
  'animation': { id: 16, name: 'Animation' },
  'comedy': { id: 35, name: 'Comedy' },
  'crime': { id: 80, name: 'Crime' },
  'documentary': { id: 99, name: 'Documentary' },
  'drama': { id: 18, name: 'Drama' },
  'family': { id: 10751, name: 'Family' },
  'fantasy': { id: 14, name: 'Fantasy' },
  'history': { id: 36, name: 'History' },
  'horror': { id: 27, name: 'Horror' },
  'music': { id: 10402, name: 'Music' },
  'mystery': { id: 9648, name: 'Mystery' },
  'romance': { id: 10749, name: 'Romance' },
  'sci-fi': { id: 878, name: 'Sci-Fi' },
  'science-fiction': { id: 878, name: 'Sci-Fi' },
  'thriller': { id: 53, name: 'Thriller' },
  'war': { id: 10752, name: 'War' },
  'western': { id: 37, name: 'Western' },
};

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  
  let genre = GENRE_MAP[cleanSlug];

  // Dynamic fallback to TMDB genre list if not in static map
  if (!genre) {
    const tmdbGenres = await getGenres().catch(() => ({ genres: [] }));
    const match = tmdbGenres.genres?.find(
      (g) => g.name.toLowerCase().replace(/\s+/g, '-') === cleanSlug || g.name.toLowerCase() === cleanSlug
    );
    if (match) {
      genre = { id: match.id, name: match.name };
    } else {
      genre = { id: 0, name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) };
    }
  }

  let movies: any[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await discoverMovies({
      with_genres: genre.id ? String(genre.id) : undefined,
      sort_by: 'popularity.desc',
    });
    movies = (data.results || []).map(normalizeMovieCard);
  } catch (err: any) {
    errorMsg = err?.message || 'Failed to fetch movies for this genre.';
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        
        <Link
          href="/discovery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Discover
        </Link>

        <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Film className="w-6 h-6 text-primary" /> {genre.name} Movies
            </h1>
            <p className="text-xs md:text-sm text-text-muted">
              Browse top-rated and popular {genre.name.toLowerCase()} films on CineVault
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-elevated border border-border-subtle text-xs font-semibold text-text-secondary whitespace-nowrap">
            {movies.length} Movies
          </span>
        </div>

        {errorMsg ? (
          <div className="p-8 rounded-2xl bg-surface border border-border-subtle text-center space-y-3 my-8">
            <AlertCircle className="w-10 h-10 text-error mx-auto opacity-80" />
            <h2 className="text-lg font-bold text-white">Unable to load genre catalog</h2>
            <p className="text-xs text-text-muted">{errorMsg}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface border border-border-subtle text-center space-y-3 my-8">
            <Film className="w-10 h-10 text-text-muted opacity-30 mx-auto" />
            <h2 className="text-lg font-bold text-white">No movies found</h2>
            <p className="text-xs text-text-muted">No {genre.name} movies found in TMDB catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {movies.map((movie) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
