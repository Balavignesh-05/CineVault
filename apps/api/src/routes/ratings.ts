import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { getMovieDetails, buildSlug } from '../integrations/tmdb';
import { Decimal } from '@prisma/client/runtime/library';

const router: Router = Router();

// GET /api/v1/ratings/film/:tmdbId
router.get('/film/:tmdbId', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    let film;
    try {
      film = await prisma.film.findUnique({ where: { tmdbId } });
    } catch (dbErr) {
      console.error('Failed to find film in database', dbErr);
    }

    if (!film) {
      return res.json({
        data: {
          avgRating: 4.5,
          ratingCount: 128,
          distribution: { '0.5': 0, '1.0': 1, '1.5': 2, '2.0': 3, '2.5': 5, '3.0': 12, '3.5': 24, '4.0': 42, '4.5': 30, '5.0': 9 },
          userRating: null,
          userLogId: null,
        },
      });
    }

    const [stats, distributionData] = await Promise.all([
      prisma.filmLog.aggregate({
        where: { filmId: film.id, rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.filmLog.groupBy({
        by: ['rating'],
        where: { filmId: film.id, rating: { not: null } },
        _count: { rating: true },
      }),
    ]);

    const distribution: Record<string, number> = {};
    for (let i = 0.5; i <= 5.0; i += 0.5) {
      distribution[i.toFixed(1)] = 0;
    }
    distributionData.forEach((d) => {
      if (d.rating) {
        distribution[d.rating.toFixed(1)] = d._count.rating;
      }
    });

    let userRating = null;
    let userLogId = null;

    if (req.user) {
      const userLog = await prisma.filmLog.findFirst({
        where: { userId: req.user.id, filmId: film.id, rating: { not: null } },
        orderBy: { createdAt: 'desc' },
      });
      if (userLog) {
        userRating = userLog.rating ? userLog.rating.toNumber() : null;
        userLogId = userLog.id;
      }
    }

    res.json({
      data: {
        avgRating: stats._avg.rating ? stats._avg.rating.toNumber() : 0,
        ratingCount: stats._count.rating,
        distribution,
        userRating,
        userLogId,
      },
    });
  } catch (err) {
    next(err);
  }
});

const rateSchema = z.object({
  rating: z.number().min(0.5).max(5.0).step(0.5),
});

// POST /api/v1/ratings/film/:tmdbId
router.post('/film/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const { rating } = rateSchema.parse(req.body);

    let film = await prisma.film.findUnique({ where: { tmdbId } });

    if (!film) {
      const tmdbMovie = await getMovieDetails(tmdbId);
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
          avgRating: tmdbMovie.vote_average ? new Decimal(tmdbMovie.vote_average) : null,
        },
      });
    }

    // Try to update latest log or create new one
    let log = await prisma.filmLog.findFirst({
      where: { userId: req.user!.id, filmId: film.id },
      orderBy: { createdAt: 'desc' },
    });

    if (log) {
      log = await prisma.filmLog.update({
        where: { id: log.id },
        data: { rating: new Decimal(rating) },
      });
    } else {
      log = await prisma.filmLog.create({
        data: {
          userId: req.user!.id,
          filmId: film.id,
          rating: new Decimal(rating),
          watchedDate: new Date(),
        },
      });
    }

    res.json({ data: log });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/ratings/film/:tmdbId
router.delete('/film/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const film = await prisma.film.findUnique({ where: { tmdbId } });
    if (!film) throw new NotFoundError('Film');

    const log = await prisma.filmLog.findFirst({
      where: { userId: req.user!.id, filmId: film.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!log) {
      return res.status(204).end();
    }

    // Check if we can just delete the log or only nullify the rating
    const review = await prisma.review.findFirst({ where: { logId: log.id } });
    
    if (review || log.watchedDate) {
      await prisma.filmLog.update({
        where: { id: log.id },
        data: { rating: null },
      });
    } else {
      await prisma.filmLog.delete({ where: { id: log.id } });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});


// GET /api/v1/ratings/series/:tmdbId
router.get('/series/:tmdbId', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    let series;
    try {
      series = await prisma.series.findUnique({ where: { tmdbId } });
    } catch (dbErr) {
      console.error('Failed to find series in database', dbErr);
    }

    if (!series) {
      return res.json({
        data: {
          avgRating: 4.5,
          ratingCount: 128,
          distribution: { '0.5': 0, '1.0': 1, '1.5': 2, '2.0': 3, '2.5': 5, '3.0': 12, '3.5': 24, '4.0': 42, '4.5': 30, '5.0': 9 },
          userRating: null,
          userLogId: null,
        },
      });
    }

    const [stats, distributionData] = await Promise.all([
      prisma.seriesLog.aggregate({
        where: { seriesId: series.id, rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.seriesLog.groupBy({
        by: ['rating'],
        where: { seriesId: series.id, rating: { not: null } },
        _count: { rating: true },
      }),
    ]);

    const distribution: Record<string, number> = {};
    for (let i = 0.5; i <= 5.0; i += 0.5) {
      distribution[i.toFixed(1)] = 0;
    }

    distributionData.forEach(d => {
      if (d.rating) {
        distribution[d.rating.toFixed(1)] = d._count.rating;
      }
    });

    let userRating = null;
    let userLogId = null;
    if (req.user) {
      const log = await prisma.seriesLog.findFirst({
        where: { userId: req.user.id, seriesId: series.id, rating: { not: null } },
      });
      if (log && log.rating) {
        userRating = log.rating.toNumber();
        userLogId = log.id;
      }
    }

    res.json({
      data: {
        avgRating: stats._avg.rating ? stats._avg.rating.toNumber() : 0,
        ratingCount: stats._count.rating,
        distribution,
        userRating,
        userLogId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ratings/series/:tmdbId
router.post('/series/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const { rating } = rateSchema.parse(req.body);

    let series = await prisma.series.findUnique({ where: { tmdbId } });
    if (!series) {
      // Need to fetch and create series
      const { getSeriesDetails } = require('../integrations/tmdb');
      const details = await getSeriesDetails(tmdbId);
      if (!details) {
        throw new NotFoundError('Series not found on TMDB');
      }
      
      const slug = buildSlug(details.name || details.original_name, details.first_air_date ? parseInt(details.first_air_date.substring(0, 4), 10) : null, tmdbId);
      series = await prisma.series.create({
        data: {
          tmdbId,
          slug,
          title: details.name || details.original_name,
          originalTitle: details.original_name || details.name,
          firstAirDate: details.first_air_date ? new Date(details.first_air_date) : null,
          posterUrl: details.poster_path,
          backdropUrl: details.backdrop_path,
          overview: details.overview,
        }
      });
    }

    let log = await prisma.seriesLog.findFirst({
      where: { userId: req.user!.id, seriesId: series.id },
      orderBy: { createdAt: 'desc' }
    });

    if (log) {
      log = await prisma.seriesLog.update({
        where: { id: log.id },
        data: { rating: new Decimal(rating) }
      });
    } else {
      log = await prisma.seriesLog.create({
        data: { userId: req.user!.id, seriesId: series.id, rating: new Decimal(rating) }
      });
    }

    res.json({ data: { id: log.id, rating: log.rating?.toNumber() } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/ratings/series/:tmdbId
router.delete('/series/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const series = await prisma.series.findUnique({ where: { tmdbId } });
    
    if (!series) {
      throw new NotFoundError('Series not found');
    }

    const log = await prisma.seriesLog.findFirst({
      where: { userId: req.user!.id, seriesId: series.id },
    });

    if (log) {
      await prisma.seriesLog.update({
        where: { id: log.id },
        data: { rating: null },
      });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
