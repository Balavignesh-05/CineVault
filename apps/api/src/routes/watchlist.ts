import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { getMovieDetails, buildSlug } from '../integrations/tmdb';

const router: Router = Router();

// GET /api/v1/watchlist/?status=&search=&page=&limit=
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const where: any = { userId: req.user!.id };
    if (status) {
      where.status = status;
    }
    if (search) {
      where.film = { title: { contains: search as string, mode: 'insensitive' } };
    }

    let items: any[] = [];
    let total = 0;

    try {
      [items, total] = await Promise.all([
        prisma.watchlistItem.findMany({
          where,
          include: { film: true },
          orderBy: { addedAt: 'desc' },
          take,
          skip,
        }),
        prisma.watchlistItem.count({ where }),
      ]);
    } catch (dbErr) {
      return next(dbErr);
    }

    res.json({
      data: {
        items,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

const watchlistSchema = z.object({
  filmId: z.string().uuid().optional(),
  tmdbId: z.number().optional(),
  status: z.enum(['planned', 'watching', 'watched']).optional().default('planned'),
}).refine(data => data.filmId || data.tmdbId, {
  message: "Either filmId or tmdbId must be provided"
});

// POST /api/v1/watchlist/
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = watchlistSchema.parse(req.body);
    let filmId = data.filmId;

    if (!filmId && data.tmdbId) {
      let film = await prisma.film.findUnique({ where: { tmdbId: data.tmdbId } });
      
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
          }
        });
      }
      filmId = film.id;
    }

    if (!filmId) throw new NotFoundError('Film');

    const watchlistItem = await prisma.watchlistItem.upsert({
      where: { userId_filmId: { userId: req.user!.id, filmId } },
      create: { userId: req.user!.id, filmId, status: data.status },
      update: { status: data.status },
      include: { film: true },
    });

    res.status(201).json({ data: watchlistItem });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/watchlist/:identifier
router.patch('/:filmId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['planned', 'watching', 'watched']),
    });
    const { status } = schema.parse(req.body);

    const watchlistItem = await prisma.watchlistItem.update({
      where: { userId_filmId: { userId: req.user!.id, filmId: req.params.filmId } },
      data: { status },
      include: { film: true },
    });

    res.json({ data: watchlistItem });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/watchlist/:identifier
router.delete('/:identifier', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { identifier } = req.params;
    let filmId = identifier;

    // Check if identifier is a TMDB id (numeric)
    if (/^\d+$/.test(identifier)) {
      const tmdbId = parseInt(identifier, 10);
      const film = await prisma.film.findUnique({ where: { tmdbId } });
      if (!film) {
        return res.status(204).end(); // Doesn't exist, already deleted/not in DB
      }
      filmId = film.id;
    }

    await prisma.watchlistItem.delete({
      where: { userId_filmId: { userId: req.user!.id, filmId } },
    });
    res.status(204).end();
  } catch (err) {
    // If not found, just return 204 or ignore
    if ((err as any)?.code === 'P2025') {
      res.status(204).end();
    } else {
      next(err);
    }
  }
});

// GET /api/v1/watchlist/check/:tmdbId
router.get('/check/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const film = await prisma.film.findUnique({ where: { tmdbId } });
    
    if (!film) {
      return res.json({ data: { inWatchlist: false } });
    }

    const item = await prisma.watchlistItem.findUnique({
      where: { userId_filmId: { userId: req.user!.id, filmId: film.id } },
    });

    if (item) {
      res.json({ data: { inWatchlist: true, status: item.status, itemId: item.id } });
    } else {
      res.json({ data: { inWatchlist: false } });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
