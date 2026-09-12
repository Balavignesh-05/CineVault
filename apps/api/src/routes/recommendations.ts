import { Router } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { authenticate, AuthRequest } from '../middleware/auth';

const router: Router = Router();

interface TmdbMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  overview: string;
  genre_ids: number[];
}

interface RecommendationSection {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  items: TmdbMovieResult[];
}

async function fetchTmdb(path: string): Promise<{ results: TmdbMovieResult[] }> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return { results: [] };
    return (await res.json()) as { results: TmdbMovieResult[] };
  } catch (error) {
    console.error('TMDB fetch failed:', error);
    return { results: [] };
  }
}

// GET /api/v1/recommendations
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const cacheKey = `recommendations:${userId}`;

    const cached = await cache.get<RecommendationSection[]>(cacheKey);
    if (cached) {
      return res.json({ data: cached });
    }

    let topRatedLogs: any[] = [];
    let watchedFilms: any[] = [];
    let watchlistFilms: any[] = [];

    try {
      [topRatedLogs, watchedFilms, watchlistFilms] = await Promise.all([
        prisma.filmLog.findMany({
          where: { userId, rating: { gte: 4.0 } },
          include: { film: { select: { id: true, tmdbId: true, title: true } } },
          take: 8,
          orderBy: { rating: 'desc' },
        }),
        prisma.filmLog.findMany({ where: { userId }, select: { film: { select: { tmdbId: true } } } }),
        prisma.watchlistItem.findMany({ where: { userId }, select: { film: { select: { tmdbId: true } } } }),
      ]);
    } catch (dbErr) {
      console.error('Database query failed for recommendations:', dbErr);
      return next(dbErr);
    }

    const excludeIds = new Set([
      ...watchedFilms.map((l) => l.film.tmdbId),
      ...watchlistFilms.map((w) => w.film.tmdbId),
    ]);

    const sections: RecommendationSection[] = [];

    // Because You Watched sections
    for (const log of topRatedLogs.slice(0, 3)) {
      const film = log.film;
      const tmdbCacheKey = `tmdb:recs:${film.tmdbId}`;
      let results = await cache.get<TmdbMovieResult[]>(tmdbCacheKey);
      if (!results) {
        const data = await fetchTmdb(`/movie/${film.tmdbId}/recommendations`);
        results = data.results;
        await cache.set(tmdbCacheKey, results, 24 * 60 * 60);
      }
      const filtered = results.filter((r) => !excludeIds.has(r.id)).slice(0, 10);
      if (filtered.length > 0) {
        sections.push({
          id: `because_you_watched_${film.tmdbId}`,
          category: 'because_you_watched',
          title: `Because You Watched ${film.title}`,
          subtitle: `Recommended because you gave ${film.title} ★${Number(log.rating).toFixed(1)}`,
          items: filtered,
        });
      }
    }

    // Trending For You
    const trendingCacheKey = 'tmdb:trending:week';
    let trendingResults = await cache.get<TmdbMovieResult[]>(trendingCacheKey);
    if (!trendingResults) {
      const data = await fetchTmdb('/trending/movie/week');
      trendingResults = data.results;
      await cache.set(trendingCacheKey, trendingResults, 3600);
    }
    const filteredTrending = trendingResults.filter((r) => !excludeIds.has(r.id)).slice(0, 10);
    if (filteredTrending.length > 0) {
      sections.push({
        id: 'trending_for_you',
        category: 'trending_for_you',
        title: 'Trending For You',
        subtitle: 'Popular movies the world is watching',
        items: filteredTrending,
      });
    }

    // Critically Acclaimed (vote_average >= 8.0)
    const criticalCacheKey = 'tmdb:critical:acclaimed';
    let criticalResults = await cache.get<TmdbMovieResult[]>(criticalCacheKey);
    if (!criticalResults) {
      const data = await fetchTmdb('/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=8.0');
      criticalResults = data.results;
      await cache.set(criticalCacheKey, criticalResults, 6 * 3600);
    }
    const filteredCritical = criticalResults.filter((r) => !excludeIds.has(r.id)).slice(0, 10);
    if (filteredCritical.length > 0) {
      sections.push({
        id: 'critically_acclaimed',
        category: 'critically_acclaimed',
        title: 'Critically Acclaimed',
        subtitle: 'Films beloved by critics worldwide',
        items: filteredCritical,
      });
    }

    // Hidden Gems (high rating, low count)
    const hiddenCacheKey = 'tmdb:hidden:gems';
    let hiddenResults = await cache.get<TmdbMovieResult[]>(hiddenCacheKey);
    if (!hiddenResults) {
      const data = await fetchTmdb('/discover/movie?sort_by=vote_average.desc&vote_count.gte=100&vote_count.lte=5000&vote_average.gte=7.0');
      hiddenResults = data.results;
      await cache.set(hiddenCacheKey, hiddenResults, 6 * 3600);
    }
    const filteredHidden = hiddenResults.filter((r) => !excludeIds.has(r.id)).slice(0, 10);
    if (filteredHidden.length > 0) {
      sections.push({
        id: 'hidden_gems',
        category: 'hidden_gems',
        title: 'Hidden Gems',
        subtitle: 'Under-the-radar films you\'ll love',
        items: filteredHidden,
      });
    }

    // Underrated (good rating, low popularity)
    const underratedCacheKey = 'tmdb:underrated';
    let underratedResults = await cache.get<TmdbMovieResult[]>(underratedCacheKey);
    if (!underratedResults) {
      const data = await fetchTmdb('/discover/movie?sort_by=vote_average.desc&vote_count.gte=200&vote_count.lte=10000&vote_average.gte=7.5');
      underratedResults = data.results;
      await cache.set(underratedCacheKey, underratedResults, 6 * 3600);
    }
    const filteredUnderrated = underratedResults.filter((r) => !excludeIds.has(r.id)).slice(0, 10);
    if (filteredUnderrated.length > 0) {
      sections.push({
        id: 'underrated',
        category: 'underrated',
        title: 'Underrated Movies',
        subtitle: 'Great films that deserve more attention',
        items: filteredUnderrated,
      });
    }

    // New Releases
    const today = new Date();
    const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
    const newReleasesCacheKey = 'tmdb:new:releases';
    let newResults = await cache.get<TmdbMovieResult[]>(newReleasesCacheKey);
    if (!newResults) {
      const data = await fetchTmdb(`/discover/movie?sort_by=popularity.desc&primary_release_date.gte=${sixMonthsAgo}`);
      newResults = data.results;
      await cache.set(newReleasesCacheKey, newResults, 3600);
    }
    const filteredNew = newResults.filter((r) => !excludeIds.has(r.id)).slice(0, 10);
    if (filteredNew.length > 0) {
      sections.push({
        id: 'new_releases_for_you',
        category: 'new_releases_for_you',
        title: 'New Releases For You',
        subtitle: 'Fresh out of theaters',
        items: filteredNew,
      });
    }

    await cache.set(cacheKey, sections, 6 * 3600);
    res.json({ data: sections });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/recommendations/trending
router.get('/trending', async (_req, res, next) => {
  try {
    const cacheKey = 'tmdb:trending:week';
    const cached = await cache.get<TmdbMovieResult[]>(cacheKey);
    if (cached) return res.json({ data: cached });

    const data = await fetchTmdb('/trending/movie/week');
    await cache.set(cacheKey, data.results, 3600);
    res.json({ data: data.results });
  } catch (err) {
    next(err);
  }
});

export default router;
