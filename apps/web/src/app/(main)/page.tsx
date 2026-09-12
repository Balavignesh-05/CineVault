import React, { Suspense } from 'react';
import { getTrending, getMovieDetails } from '@/lib/tmdb/client';
import { HeroSection } from '@/components/home/HeroSection';
import { 
  TrendingTodayRow,
  PopularThisWeekRow,
  NowPlayingRow,
  UpcomingMoviesRow,
  TopRatedMoviesRow,
  TopRatedTvRow,
  RecommendedRow,
  RowSkeleton 
} from '@/components/home/HomeRows';

import { HomeFeed } from '@/components/home/HomeFeed';

export const revalidate = 3600;

export default async function HomePage() {
  const trending = await getTrending('week').catch(() => ({ results: [] }));
  
  const topTrending = trending.results?.slice(0, 5) || [];
  const heroMovies = await Promise.all(
    topTrending.map(async (movie: any) => {
      const details = await getMovieDetails(movie.id).catch(() => null);
      return details ? { ...movie, ...details } : movie;
    })
  );

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-12">
      <HeroSection movies={heroMovies} />
      
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <HomeFeed />
        
        <Suspense fallback={<RowSkeleton />}>
          <TrendingTodayRow />
        </Suspense>
        
        <Suspense fallback={<RowSkeleton />}>
          <PopularThisWeekRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <NowPlayingRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <UpcomingMoviesRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <TopRatedTvRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <RecommendedRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <TopRatedMoviesRow />
        </Suspense>
      </div>
    </div>
  );
}
