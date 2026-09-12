import { Suspense } from 'react';
import { MediaSection } from '@/components/home/MediaSection';
import {
  getTrending,
  getPopular,
  getTopRated,
  getUpcoming,
  getNowPlaying,
  getTvTopRated,
  discoverMovies,
  normalizeMovieCard,
  normalizeSeriesCard
} from '@/lib/tmdb/client';

export async function TrendingTodayRow() {
  const res = await getTrending('day').catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Trending Today" media={movies} />;
}

export async function PopularThisWeekRow() {
  const res = await getPopular().catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Popular This Week" media={movies} viewAllHref="/films" />;
}

export async function RecommendedRow() {
  const res = await discoverMovies({ sort_by: 'popularity.desc', with_genres: '28,878' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Recommended For You" media={movies} variant="dark" />;
}

export async function ContinueWatchingRow() {
  const res = await discoverMovies({ sort_by: 'revenue.desc', with_genres: '12' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Continue Watching" media={movies} />;
}

export async function TopRatedMoviesRow() {
  const res = await getTopRated().catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Top Rated Movies" media={movies} viewAllHref="/films" />;
}

export async function TopRatedTvRow() {
  const res = await getTvTopRated().catch(() => ({ results: [] }));
  const series = res.results?.map(normalizeSeriesCard) || [];
  return <MediaSection title="Top Rated TV Shows" media={series} viewAllHref="/series" />;
}

export async function NowPlayingRow() {
  const res = await getNowPlaying().catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Now Playing" media={movies} variant="dark" />;
}

export async function UpcomingMoviesRow() {
  const res = await getUpcoming().catch(() => ({ results: [] }));
  const today = new Date().toISOString().split('T')[0];
  const movies = res.results?.filter(m => m.release_date && m.release_date > today).map(normalizeMovieCard) || [];
  return <MediaSection title="Upcoming Movies" media={movies} />;
}

export async function NewReleasesRow() {
  const res = await discoverMovies({ sort_by: 'primary_release_date.desc', 'vote_count.gte': 100 }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="New Releases" media={movies} variant="dark" />;
}

export async function HiddenGemsRow() {
  const res = await discoverMovies({ 'vote_count.gte': 100, 'vote_count.lte': 2000, 'vote_average.gte': 7, sort_by: 'vote_average.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Hidden Gems" media={movies} />;
}

export async function OscarWinnersRow() {
  const res = await discoverMovies({ with_keywords: '278', sort_by: 'vote_average.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Oscar Winners" media={movies} />;
}

export async function MarvelCollectionRow() {
  const res = await discoverMovies({ with_companies: '420', sort_by: 'revenue.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Marvel Collection" media={movies} variant="dark" />;
}

export async function DcCollectionRow() {
  const res = await discoverMovies({ with_companies: '429,128064', sort_by: 'revenue.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="DC Collection" media={movies} />;
}

export async function ActorSpotlightRow() {
  // Leonardo DiCaprio
  const res = await discoverMovies({ with_cast: '6193', sort_by: 'popularity.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Actor Spotlight: Leonardo DiCaprio" media={movies} variant="dark" />;
}

export async function DirectorSpotlightRow() {
  // Christopher Nolan
  const res = await discoverMovies({ with_crew: '525', sort_by: 'popularity.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Director Spotlight: Christopher Nolan" media={movies} />;
}

export async function CriticallyAcclaimedRow() {
  const res = await discoverMovies({ 'vote_count.gte': 5000, sort_by: 'vote_average.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Critically Acclaimed" media={movies} variant="dark" />;
}

export async function HighestGrossingRow() {
  const res = await discoverMovies({ sort_by: 'revenue.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Highest Grossing Movies" media={movies} />;
}

export async function PopularInIndiaRow() {
  const res = await discoverMovies({ with_origin_country: 'IN', sort_by: 'popularity.desc' }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Most Popular in India" media={movies} variant="dark" />;
}

export async function BecauseYouWatchedRow() {
  // Mocking "Because You Watched Inception"
  const res = await discoverMovies({ with_genres: '878,28', sort_by: 'popularity.desc', page: 2 }).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Because You Watched Inception" media={movies} />;
}

export async function RecentlyViewedRow() {
  // Mocking Recently Viewed with a different page of popular
  const res = await getPopular(2).catch(() => ({ results: [] }));
  const movies = res.results?.map(normalizeMovieCard) || [];
  return <MediaSection title="Recently Viewed" media={movies} variant="dark" />;
}

export function RowSkeleton() {
  return (
    <div className="py-4 md:py-6 w-full animate-pulse">
      <div className="container space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[150px] aspect-[2/3] bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
