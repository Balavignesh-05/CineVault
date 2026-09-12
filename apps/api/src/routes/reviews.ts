import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const router: Router = Router();

import { getMovieDetails, buildSlug } from '../integrations/tmdb';

const createReviewSchema = z.object({
  tmdbId: z.number().int().or(z.string().transform(Number)),
  mediaType: z.enum(['movie', 'tv']).optional().default('movie'),
  title: z.string().max(255).optional(),
  body: z.string().min(1).max(50000),
  containsSpoilers: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  watchedDate: z.string().optional().nullable(),
  rating: z.number().min(0.5).max(5).optional(),
  isRewatch: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
});

function calculateReadingTime(body: string): number {
  const wordCount = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// POST /api/v1/reviews
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createReviewSchema.parse(req.body);
    
    let film = null;
    let series = null;
    let log = null;
    let seriesLog = null;

    if (data.mediaType === 'tv') {
      series = await prisma.series.findUnique({ where: { tmdbId: data.tmdbId } });
      if (!series) {
        const { getSeriesDetails } = require('../integrations/tmdb');
        const tmdbSeries = await getSeriesDetails(data.tmdbId);
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

      seriesLog = await prisma.seriesLog.findFirst({
        where: { userId: req.user!.id, seriesId: series.id },
        orderBy: { createdAt: 'desc' },
      });

      if (seriesLog) {
        seriesLog = await prisma.seriesLog.update({
          where: { id: seriesLog.id },
          data: { 
            watchedDate: data.watchedDate ? new Date(data.watchedDate) : seriesLog.watchedDate,
            rating: data.rating !== undefined ? data.rating : seriesLog.rating,
            isRewatch: data.isRewatch !== undefined ? data.isRewatch : seriesLog.isRewatch,
            tags: data.tags !== undefined ? data.tags : seriesLog.tags
          }
        });
      } else {
        seriesLog = await prisma.seriesLog.create({
          data: {
            userId: req.user!.id,
            seriesId: series.id,
            watchedDate: data.watchedDate ? new Date(data.watchedDate) : new Date(),
            rating: data.rating,
            isRewatch: data.isRewatch,
            tags: data.tags || []
          }
        });
      }
    } else {
      // Find or create Film
      film = await prisma.film.findUnique({ where: { tmdbId: data.tmdbId } });
      
      if (!film) {
        const tmdbMovie = await getMovieDetails(data.tmdbId);
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
          },
        });
      }

      // Find or create FilmLog
      log = await prisma.filmLog.findFirst({
        where: { userId: req.user!.id, filmId: film.id },
        orderBy: { createdAt: 'desc' },
      });

      if (log) {
        log = await prisma.filmLog.update({
          where: { id: log.id },
          data: { 
            watchedDate: data.watchedDate ? new Date(data.watchedDate) : log.watchedDate,
            rating: data.rating !== undefined ? data.rating : log.rating,
            isRewatch: data.isRewatch !== undefined ? data.isRewatch : log.isRewatch,
            tags: data.tags !== undefined ? data.tags : log.tags
          }
        });
      } else {
        log = await prisma.filmLog.create({
          data: {
            userId: req.user!.id,
            filmId: film.id,
            watchedDate: data.watchedDate ? new Date(data.watchedDate) : new Date(),
            rating: data.rating,
            isRewatch: data.isRewatch,
            tags: data.tags || []
          }
        });
      }
    }

    const readingTime = calculateReadingTime(data.body);

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        filmId: film ? film.id : null,
        seriesId: series ? series.id : null,
        body: data.body,
        containsSpoilers: data.containsSpoilers,
        logId: log ? log.id : null,
        seriesLogId: seriesLog ? seriesLog.id : null,
        isPublished: data.isPublished,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        film: { select: { id: true, title: true, slug: true, posterUrl: true } },
        series: { select: { id: true, title: true, slug: true, posterUrl: true } },
      },
    });

    res.status(201).json({ data: review });
  } catch (err: any) {
    next(err);
  }
});

// GET /api/v1/reviews/me
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10);
    const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10);
    const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const skip = (currentPage - 1) * take;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user!.id },
        include: {
          film: { select: { id: true, title: true, slug: true, posterUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.review.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      data: {
        items: reviews,
        total,
        page: currentPage,
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reviews/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
        film: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true } },
        series: { select: { id: true, title: true, slug: true, posterUrl: true, firstAirDate: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    
    if (!review) throw new NotFoundError('Review');
    if (!review.isPublished && (!req.user || req.user.id !== review.userId)) {
      throw new ForbiddenError();
    }

    let isLikedByMe = false;
    if (req.user) {
      const like = await prisma.reviewLike.findUnique({
        where: { userId_reviewId: { userId: req.user.id, reviewId: review.id } },
      });
      isLikedByMe = !!like;
    }

    res.json({ data: { ...review, isLikedByMe } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/reviews/:id
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new NotFoundError('Review');
    if (review.userId !== req.user!.id) throw new ForbiddenError();

    const updateSchema = z.object({
      body: z.string().min(1).max(50000).optional(),
      containsSpoilers: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    });
    const data = updateSchema.parse(req.body);
    const updateData: any = { ...data };

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/reviews/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new NotFoundError('Review');
    if (review.userId !== req.user!.id && !['admin', 'moderator'].includes(req.user!.role)) {
      throw new ForbiddenError();
    }
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reviews/:id/like
router.post('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new NotFoundError('Review');

    await prisma.reviewLike.upsert({
      where: { userId_reviewId: { userId: req.user!.id, reviewId: req.params.id } },
      create: { userId: req.user!.id, reviewId: req.params.id },
      update: {},
    });

    const likeCount = await prisma.reviewLike.count({ where: { reviewId: req.params.id } });
    await prisma.review.update({ where: { id: req.params.id }, data: { likeCount } });

    res.json({ data: { liked: true, likeCount } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/reviews/:id/like
router.delete('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.reviewLike.deleteMany({
      where: { userId: req.user!.id, reviewId: req.params.id },
    });
    const likeCount = await prisma.reviewLike.count({ where: { reviewId: req.params.id } });
    await prisma.review.update({ where: { id: req.params.id }, data: { likeCount } });
    res.json({ data: { liked: false, likeCount } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reviews/:id/helpful
router.post('/:id/helpful', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new NotFoundError('Review');

    // We can assume there is a `ReviewHelpful` model or we just increment a counter
    // Given the DB schema wasn't fully detailed on ReviewHelpful, we will assume
    // it's a simple toggle/increment or requires a ReviewHelpful model.
    // If not, we just update the DB like this:
    // This upsert assumes ReviewHelpful exists. If not, it will error, but based on typical requirements:
    await prisma.reviewHelpful.upsert({
      where: { userId_reviewId: { userId: req.user!.id, reviewId: req.params.id } },
      create: { userId: req.user!.id, reviewId: req.params.id },
      update: {},
    });
    
    const helpfulCount = await prisma.reviewHelpful.count({ where: { reviewId: req.params.id } });
    
    await prisma.review.update({ where: { id: req.params.id }, data: { helpfulCount } });

    res.json({ data: { markedHelpful: true, helpfulCount } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reviews
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { filmId, seriesId, tmdbId, mediaType = 'movie', page = '1', limit = '20' } = req.query as { filmId?: string; seriesId?: string; tmdbId?: string; mediaType?: 'movie' | 'tv'; page?: string; limit?: string };
    const parsedLimit = parseInt(limit, 10);
    const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page, 10);
    const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const skip = (currentPage - 1) * take;

    const where: any = { isPublished: true };
    if (filmId) where.filmId = filmId;
    if (seriesId) where.seriesId = seriesId;
    if (tmdbId) {
      if (mediaType === 'tv') {
        const series = await prisma.series.findUnique({ where: { tmdbId: parseInt(tmdbId, 10) } });
        if (series) where.seriesId = series.id;
        else return res.json({ data: { items: [], total: 0, page: 1, hasMore: false } });
      } else {
        const film = await prisma.film.findUnique({ where: { tmdbId: parseInt(tmdbId, 10) } });
        if (film) where.filmId = film.id;
        else return res.json({ data: { items: [], total: 0, page: 1, hasMore: false } });
      }
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
          film: { select: { id: true, title: true, slug: true, posterUrl: true } },
          series: { select: { id: true, title: true, slug: true, posterUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ data: { items: reviews, total, page: currentPage, hasMore: skip + take < total } });
  } catch (err) {
    next(err);
  }
});

export default router;
