import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { getMovieDetails, buildSlug } from '../integrations/tmdb';

const router: Router = Router();

const createLogSchema = z.object({
  filmId: z.string().uuid().optional(),
  tmdbId: z.number().optional(),
  watchedDate: z.string().optional(),
  isRewatch: z.boolean().optional().default(false),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).optional().nullable(),
  liked: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
}).refine(data => data.filmId || data.tmdbId, {
  message: "Either filmId or tmdbId must be provided"
});

const createSeriesLogSchema = z.object({
  seriesId: z.string().uuid().optional(),
  tmdbId: z.number().optional(),
  watchedDate: z.string().optional(),
  isRewatch: z.boolean().optional().default(false),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).optional().nullable(),
  liked: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
}).refine(data => data.seriesId || data.tmdbId, {
  message: "Either seriesId or tmdbId must be provided"
});

const updateLogSchema = z.object({
  watchedDate: z.string().optional().nullable(),
  isRewatch: z.boolean().optional(),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).optional().nullable(),
  liked: z.boolean().optional(),
});

const createEpisodeLogSchema = z.object({
  episodeId: z.string().uuid(),
  watchedDate: z.string().optional(),
  isRewatch: z.boolean().optional().default(false),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).optional().nullable(),
  liked: z.boolean().optional().default(false),
});

// POST /api/v1/logs
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = createLogSchema.parse(req.body);

    let filmId = body.filmId;

    if (!filmId && body.tmdbId) {
      let film = await prisma.film.findUnique({ where: { tmdbId: body.tmdbId } });
      if (!film) {
        const tmdbMovie = await getMovieDetails(body.tmdbId);
        if (!tmdbMovie) throw new NotFoundError('TMDB Movie');
        
        const releaseYear = tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null;
        film = await prisma.film.create({
          data: {
            tmdbId: tmdbMovie.id,
            title: tmdbMovie.title,
            originalTitle: tmdbMovie.original_title,
            slug: buildSlug(tmdbMovie.title, releaseYear, tmdbMovie.id),
            overview: tmdbMovie.overview,
            tagline: tmdbMovie.tagline,
            releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
            runtime: tmdbMovie.runtime,
            posterUrl: tmdbMovie.poster_path,
            backdropUrl: tmdbMovie.backdrop_path,
          }
        });
      }
      filmId = film.id;
    }

    if (!filmId) throw new NotFoundError('Film');

    let log;

    // If this is just a 'like' toggle without explicit date or notes, update the latest log if it exists
    if (!body.watchedDate && !body.notes && body.liked !== undefined) {
      const latestLog = await prisma.filmLog.findFirst({
        where: { userId: req.user!.id, filmId: filmId },
        orderBy: { createdAt: 'desc' },
      });
      
      if (latestLog) {
        log = await prisma.filmLog.update({
          where: { id: latestLog.id },
          data: { liked: body.liked },
          include: { film: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true } } }
        });
      }
    }
    
    if (!log) {
      log = await prisma.filmLog.create({
        data: {
          userId: req.user!.id,
          filmId: filmId,
          watchedDate: body.watchedDate ? new Date(body.watchedDate) : null,
          isRewatch: body.isRewatch ?? false,
          rating: body.rating ?? null,
          liked: body.liked ?? false,
          notes: body.notes || null,
          tags: body.tags || [],
        },
        include: {
          film: {
            select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true },
          },
        },
      });
    }

    if (body.rating) {
      await updateFilmRatingAggregate(filmId);
    }

    res.status(201).json({ data: log });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/logs/liked/:tmdbId
router.get('/liked/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const { type } = req.query;

    if (type === 'tv') {
      const series = await prisma.series.findUnique({ where: { tmdbId } });
      if (!series) {
        return res.json({ liked: false });
      }
      const log = await prisma.seriesLog.findFirst({
        where: { userId: req.user!.id, seriesId: series.id, liked: true },
      });
      return res.json({ liked: !!log });
    } else {
      const film = await prisma.film.findUnique({ where: { tmdbId } });
      if (!film) {
        return res.json({ liked: false });
      }
      const log = await prisma.filmLog.findFirst({
        where: { userId: req.user!.id, filmId: film.id, liked: true },
      });
      return res.json({ liked: !!log });
    }

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/logs/me
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', year } = req.query as { page?: string; limit?: string; year?: string };
    
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const take = isNaN(parsedLimit) || parsedLimit <= 0 ? 20 : Math.min(parsedLimit, 100);
    const currentPage = isNaN(parsedPage) || parsedPage <= 0 ? 1 : parsedPage;
    const skip = (currentPage - 1) * take;

    let dateFilter = {};
    if (year) {
      const parsedYear = parseInt(year);
      if (!isNaN(parsedYear)) {
        dateFilter = {
          watchedDate: {
            gte: new Date(`${parsedYear}-01-01T00:00:00.000Z`),
            lte: new Date(`${parsedYear}-12-31T23:59:59.999Z`),
          }
        };
      }
    }

    const whereClause = {
      userId: req.user!.id,
      ...dateFilter
    };

    const [filmLogs, filmTotal] = await Promise.all([
      prisma.filmLog.findMany({
        where: whereClause,
        include: {
          film: {
            select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.filmLog.count({ where: whereClause }),
    ]);

    const [seriesLogs, seriesTotal] = await Promise.all([
      prisma.seriesLog.findMany({
        where: whereClause,
        include: {
          series: {
            select: { id: true, title: true, slug: true, posterUrl: true, firstAirDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.seriesLog.count({ where: whereClause }),
    ]);

    // Combine and sort
    const combined = [
      ...filmLogs.map(l => ({ ...l, type: 'film' as const })),
      ...seriesLogs.map(l => ({ ...l, type: 'series' as const }))
    ].sort((a, b) => {
      const dateA = a.watchedDate ? new Date(a.watchedDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.watchedDate ? new Date(b.watchedDate).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending
    }).slice(0, take); // In real app, proper offset merging requires complex logic or union query. Doing simple merge for now.

    const total = filmTotal + seriesTotal;

    res.json({
      data: { items: combined, total, page: currentPage, hasMore: skip + take < total },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/logs/:id
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const log = await prisma.filmLog.findUnique({ where: { id: req.params.id } });
    if (!log) throw new NotFoundError('Log');
    if (log.userId !== req.user!.id) throw new ForbiddenError();

    const body = updateLogSchema.parse(req.body);
    const hadRating = log.rating !== null;

    const updated = await prisma.filmLog.update({
      where: { id: req.params.id },
      data: {
        watchedDate: body.watchedDate !== undefined ? (body.watchedDate ? new Date(body.watchedDate) : null) : undefined,
        isRewatch: body.isRewatch,
        rating: body.rating !== undefined ? body.rating : undefined,
        liked: body.liked,
      },
      include: {
        film: {
          select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true },
        },
      },
    });

    if (hadRating || body.rating) {
      await updateFilmRatingAggregate(log.filmId);
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/logs/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const log = await prisma.filmLog.findUnique({ where: { id: req.params.id } });
    if (!log) throw new NotFoundError('Log');
    if (log.userId !== req.user!.id) throw new ForbiddenError();

    const hadRating = log.rating !== null;
    await prisma.filmLog.delete({ where: { id: req.params.id } });
    if (hadRating) await updateFilmRatingAggregate(log.filmId);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

async function updateFilmRatingAggregate(filmId: string) {
  const result = await prisma.filmLog.aggregate({
    where: { filmId, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.film.update({
    where: { id: filmId },
    data: {
      avgRating: result._avg.rating ?? null,
      ratingCount: result._count.rating,
    },
  });
}

// POST /api/v1/logs/series
router.post('/series', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = createSeriesLogSchema.parse(req.body);
    let seriesId = body.seriesId;

    if (!seriesId && body.tmdbId) {
      let series = await prisma.series.findUnique({ where: { tmdbId: body.tmdbId } });
      if (!series) {
        const { getSeriesDetails } = require('../integrations/tmdb');
        const tmdbSeries = await getSeriesDetails(body.tmdbId);
        if (!tmdbSeries) throw new NotFoundError('TMDB Series');
        
        const firstAirYear = tmdbSeries.first_air_date ? new Date(tmdbSeries.first_air_date).getFullYear() : null;
        series = await prisma.series.create({
          data: {
            tmdbId: tmdbSeries.id,
            title: tmdbSeries.name,
            originalTitle: tmdbSeries.original_name,
            slug: buildSlug(tmdbSeries.name, firstAirYear, tmdbSeries.id),
            overview: tmdbSeries.overview,
            firstAirDate: tmdbSeries.first_air_date ? new Date(tmdbSeries.first_air_date) : null,
            lastAirDate: tmdbSeries.last_air_date ? new Date(tmdbSeries.last_air_date) : null,
            posterUrl: tmdbSeries.poster_path,
            backdropUrl: tmdbSeries.backdrop_path,
            status: tmdbSeries.status,
          },
        });
      }
      seriesId = series.id;
    }
    if (!seriesId) throw new NotFoundError('Series');

    let log;
    if (!body.watchedDate && !body.notes && body.liked !== undefined) {
      const latestLog = await prisma.seriesLog.findFirst({
        where: { userId: req.user!.id, seriesId },
        orderBy: { createdAt: 'desc' },
      });
      if (latestLog) {
        log = await prisma.seriesLog.update({
          where: { id: latestLog.id },
          data: { liked: body.liked },
          include: { series: { select: { id: true, title: true, slug: true, posterUrl: true } } }
        });
      }
    }
    
    if (!log) {
      log = await prisma.seriesLog.create({
        data: {
          userId: req.user!.id,
          seriesId: seriesId,
          watchedDate: body.watchedDate ? new Date(body.watchedDate) : null,
          isRewatch: body.isRewatch ?? false,
          rating: body.rating ?? null,
          liked: body.liked ?? false,
          notes: body.notes || null,
          tags: body.tags || [],
        },
        include: { series: { select: { id: true, title: true, slug: true, posterUrl: true } } },
      });
    }

    if (body.rating) {
      await updateSeriesRatingAggregate(seriesId);
    }
    res.status(201).json({ data: log });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/logs/series/:id
router.put('/series/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const log = await prisma.seriesLog.findUnique({ where: { id: req.params.id } });
    if (!log) throw new NotFoundError('SeriesLog');
    if (log.userId !== req.user!.id) throw new ForbiddenError();

    const body = updateLogSchema.parse(req.body);
    const hadRating = log.rating !== null;

    const updated = await prisma.seriesLog.update({
      where: { id: req.params.id },
      data: {
        watchedDate: body.watchedDate !== undefined ? (body.watchedDate ? new Date(body.watchedDate) : null) : undefined,
        isRewatch: body.isRewatch,
        rating: body.rating !== undefined ? body.rating : undefined,
        liked: body.liked,
      },
      include: { series: { select: { id: true, title: true, slug: true, posterUrl: true } } },
    });

    if (hadRating || body.rating) await updateSeriesRatingAggregate(log.seriesId);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/logs/series/:id
router.delete('/series/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const log = await prisma.seriesLog.findUnique({ where: { id: req.params.id } });
    if (!log) throw new NotFoundError('SeriesLog');
    if (log.userId !== req.user!.id) throw new ForbiddenError();

    const hadRating = log.rating !== null;
    await prisma.seriesLog.delete({ where: { id: req.params.id } });
    if (hadRating) await updateSeriesRatingAggregate(log.seriesId);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

async function updateSeriesRatingAggregate(seriesId: string) {
  const result = await prisma.seriesLog.aggregate({
    where: { seriesId, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.series.update({
    where: { id: seriesId },
    data: {
      avgRating: result._avg.rating ?? null,
      ratingCount: result._count.rating,
    },
  });
}

// ── Episode Logs ──────────────────────────────────────────────────────────

// POST /api/v1/logs/episodes
router.post('/episodes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = createEpisodeLogSchema.parse(req.body);

    const episode = await prisma.episode.findUnique({ where: { id: body.episodeId } });
    if (!episode) throw new NotFoundError('Episode');

    const log = await prisma.episodeLog.create({
      data: {
        userId: req.user!.id,
        episodeId: body.episodeId,
        watchedDate: body.watchedDate ? new Date(body.watchedDate) : null,
        rating: body.rating ?? null,
        liked: body.liked ?? false,
      },
    });

    res.status(201).json({ data: log });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/logs/episodes/me
router.get('/episodes/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.episodeLog.findMany({
        where: { userId: req.user!.id },
        include: {
          episode: {
            include: {
              season: {
                include: {
                  series: {
                    select: { id: true, title: true, slug: true, posterUrl: true },
                  }
                }
              }
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.episodeLog.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      data: { items: logs, total, page: parseInt(page), hasMore: skip + take < total },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/logs/episodes/:id
router.delete('/episodes/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const log = await prisma.episodeLog.findUnique({ where: { id: req.params.id } });
    if (!log) throw new NotFoundError('EpisodeLog');
    if (log.userId !== req.user!.id) throw new ForbiddenError();

    await prisma.episodeLog.delete({ where: { id: req.params.id } });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
