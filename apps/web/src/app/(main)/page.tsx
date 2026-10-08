import React, { Suspense } from 'react';
import { getTrending, getMovieDetails } from '@/lib/tmdb/client';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { PeopleRail } from '@/components/home/PeopleRail';
import { 
  TrendingNowRow,
  PopularMoviesRow,
  PopularTvShowsRow,
  AiRecommendationsRow,
  TopRatedMoviesRow,
  NowPlayingRow,
  UpcomingMoviesRow,
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
    <div className="min-h-screen bg-background text-text-secondary pb-16">
      {/* Spotlight Hero Section */}
      <HeroSection movies={heroMovies} />
      
      {/* Category Navigation Bar */}
      <CategoryTabs activeTab="For You" />

      {/* Main Content Rails */}
      <div className="w-full pt-2 sm:pt-4 pb-12 space-y-6 md:space-y-8">
        <HomeFeed />
        
        {/* Trending Now Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <TrendingNowRow />
        </Suspense>
        
        {/* Popular Movies Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <PopularMoviesRow />
        </Suspense>

        {/* Popular TV Shows Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <PopularTvShowsRow />
        </Suspense>

        {/* Popular People Circular Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <PeopleRail />
        </Suspense>

        {/* AI Recommendations Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <AiRecommendationsRow />
        </Suspense>

        {/* Now Playing Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <NowPlayingRow />
        </Suspense>

        {/* Top Rated Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <TopRatedMoviesRow />
        </Suspense>

        {/* Upcoming Movies Rail */}
        <Suspense fallback={<RowSkeleton />}>
          <UpcomingMoviesRow />
        </Suspense>
      </div>
    </div>
  );
}
