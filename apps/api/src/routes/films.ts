import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getMovieWatchProviders,
  buildImageUrl,
  buildSlug,
  TmdbMovie,
} from '../integrations/tmdb';

const router: Router = Router();

// Helper: upsert film from TMDB data
async function upsertFilmFromTmdb(tmdbData: TmdbMovie) {
  const year = tmdbData.release_date
    ? new Date(tmdbData.release_date).getFullYear()
    : null;
  const slug = buildSlug(tmdbData.title, year, tmdbData.id);

  const film = await prisma.film.upsert({
    where: { tmdbId: tmdbData.id },
    create: {
      tmdbId: tmdbData.id,
      imdbId: tmdbData.imdb_id ?? null,
      title: tmdbData.title,
      originalTitle: tmdbData.original_title,
      slug,
      releaseDate: tmdbData.release_date ? new Date(tmdbData.release_date) : null,
      runtime: tmdbData.runtime ?? null,
      overview: tmdbData.overview ?? null,
      tagline: tmdbData.tagline ?? null,
      posterUrl: buildImageUrl(tmdbData.poster_path, 'w500'),
      backdropUrl: buildImageUrl(tmdbData.backdrop_path, 'original'),
      language: tmdbData.original_language ?? null,
      country: tmdbData.production_countries?.[0]?.iso_3166_1 ?? null,
      budget: BigInt(tmdbData.budget ?? 0),
      revenue: BigInt(tmdbData.revenue ?? 0),
      cachedAt: new Date(),
    },
    update: {
      title: tmdbData.title,
      overview: tmdbData.overview ?? null,
      posterUrl: buildImageUrl(tmdbData.poster_path, 'w500'),
      backdropUrl: buildImageUrl(tmdbData.backdrop_path, 'original'),
      runtime: tmdbData.runtime ?? null,
      cachedAt: new Date(),
    },
    include: { genres: { include: { genre: true } } },
  });

  // Upsert genres
  if (tmdbData.genres) {
    for (const g of tmdbData.genres) {
      const genreSlug = g.name.toLowerCase().replace(/\s+/g, '-');
      await prisma.genre.upsert({
        where: { id: g.id },
        create: { id: g.id, name: g.name, slug: genreSlug },
        update: { name: g.name },
      });
      await prisma.filmGenre.upsert({
        where: { filmId_genreId: { filmId: film.id, genreId: g.id } },
        create: { filmId: film.id, genreId: g.id },
        update: {},
      });
    }
  }

  return film;
}

// GET /api/v1/films/search?q=
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = '1' } = req.query as { q?: string; page?: string };
    if (!q || q.trim().length < 1) {
      res.json({ data: { items: [], total: 0, page: 1, hasMore: false } });
      return;
    }

    const cacheKey = `search:${q}:${page}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.json({ data: cached });
      return;
    }

    const results = await searchMovies(q, parseInt(page));

    // Map to a slim format for search results
    const items = results.results.map((m) => ({
      tmdbId: m.id,
      title: m.title,
      releaseYear: m.release_date ? new Date(m.release_date).getFullYear() : null,
      posterUrl: buildImageUrl(m.poster_path, 'w185'),
      overview: m.overview,
    }));

    const response = {
      items,
      total: results.total_results,
      page: results.page,
      hasMore: results.page < results.total_pages,
    };

    await cache.set(cacheKey, response, 300); // 5 min cache
    res.json({ data: response });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/films/popular
router.get('/popular', async (_req, res, next) => {
  try {
    const cacheKey = 'films:popular';
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.json({ data: cached });
      return;
    }

    const results = await getPopularMovies();
    const items = results.results.map((m) => ({
      tmdbId: m.id,
      title: m.title,
      releaseYear: m.release_date ? new Date(m.release_date).getFullYear() : null,
      posterUrl: buildImageUrl(m.poster_path, 'w342'),
      backdropUrl: buildImageUrl(m.backdrop_path, 'w780'),
      overview: m.overview,
      voteAverage: m.vote_average,
    }));

    await cache.set(cacheKey, items, 3600); // 1hr cache
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/films/:slug — by slug OR tmdbId
router.get('/:identifier', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is a TMDB id (numeric)
    const tmdbId = /^\d+$/.test(identifier) ? parseInt(identifier) : null;

    let film = null;
    if (tmdbId) {
      film = await prisma.film.findUnique({
        where: { tmdbId },
        include: { genres: { include: { genre: true } }, credits: { include: { person: true } } },
      });
    } else {
      film = await prisma.film.findUnique({
        where: { slug: identifier },
        include: { genres: { include: { genre: true } }, credits: { include: { person: true } } },
      });
    }

    // If not in DB, fetch from TMDB and cache
    if (!film && tmdbId) {
      const tmdbData = await getMovieDetails(tmdbId);
      await upsertFilmFromTmdb(tmdbData);
      film = await prisma.film.findUnique({
        where: { tmdbId },
        include: { genres: { include: { genre: true } }, credits: { include: { person: true } } },
      });
    }

    if (!film) throw new NotFoundError('Film');

    // Check if current user has logged/liked this film
    let userFilmState = null;
    if (req.user) {
      const [log, liked, watchlisted] = await Promise.all([
        prisma.filmLog.findFirst({ where: { userId: req.user.id, filmId: film.id }, orderBy: { createdAt: 'desc' } }),
        prisma.likedFilm.findUnique({ where: { userId_filmId: { userId: req.user.id, filmId: film.id } } }),
        prisma.watchlistItem.findUnique({ where: { userId_filmId: { userId: req.user.id, filmId: film.id } } }),
      ]);
      userFilmState = { log, liked: !!liked, watchlisted: !!watchlisted };
    }

    let watchProviders = null;
    try {
      if (film.tmdbId) {
        const providersRes = await getMovieWatchProviders(film.tmdbId) as any;
        // e.g. TMDB returns { id, results: { US: { link, flatrate: [], rent: [], buy: [] }, ... } }
        // We'll return just the US providers by default for simplicity, or the whole results object
        watchProviders = providersRes.results?.US || null;
      }
    } catch (e) {
      console.error('Failed to fetch watch providers:', e);
    }

    const response = {
      ...film,
      budget: film.budget?.toString(),
      revenue: film.revenue?.toString(),
      releaseYear: film.releaseDate ? new Date(film.releaseDate).getFullYear() : null,
      genres: film.genres.map((fg) => fg.genre),
      credits: film.credits.map((c) => ({
        person: c.person,
        role: c.role,
        character: c.character,
        order: c.order,
      })),
      userFilmState,
      watchProviders,
    };

    res.json({ data: response });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/films/:identifier/fans
router.get('/:identifier/fans', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let film = null;
    
    const tmdbId = /^\d+$/.test(identifier) ? parseInt(identifier) : null;
    if (tmdbId) {
      film = await prisma.film.findUnique({ where: { tmdbId } });
    } else {
      film = await prisma.film.findUnique({ where: { slug: identifier } });
    }

    if (!film) {
      return res.json({ data: [] });
    }

    // Find users who have this film's ID in their favoriteFilmIds array
    // PostgreSQL array overlap or containment
    const fans = await prisma.user.findMany({
      where: {
        favoriteFilmIds: {
          has: film.id
        }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
      take: 20
    });

    res.json({ data: fans });
  } catch (err) {
    next(err);
  }
});

export default router;
