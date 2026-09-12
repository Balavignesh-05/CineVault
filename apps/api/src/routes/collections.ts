import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const router: Router = Router();

// GET /api/v1/collections/?userId=&page=
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { userId, page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const where: any = {};
    if (userId) {
      where.userId = userId;
      if (!req.user || req.user.id !== userId) {
        where.isPublic = true;
      }
    } else {
      where.isPublic = true;
    }

    let collections: any[] = [];
    let total = 0;

    try {
      [collections, total] = await Promise.all([
        prisma.list.findMany({
          where,
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            _count: { select: { films: true, likes: true } },
          },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
        prisma.list.count({ where }),
      ]);
    } catch (dbErr) {
      return next(dbErr);
    }

    res.json({
      data: {
        items: collections,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/collections/me
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collections = await prisma.list.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { films: true } },
      },
    });
    // Add filmCount alias for the frontend
    const mapped = collections.map(c => ({ ...c, filmCount: c._count.films }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/collections/contains/:tmdbId
router.get('/contains/:tmdbId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    if (isNaN(tmdbId)) return res.status(400).json({ error: { message: 'Invalid tmdbId' } });

    const lists = await prisma.list.findMany({
      where: {
        userId: req.user!.id,
        films: { some: { film: { tmdbId } } }
      },
      select: { id: true }
    });
    
    res.json(lists.map(l => l.id));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/collections/sync-film
router.post('/sync-film', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      tmdbId: z.number().int(),
      collectionIds: z.array(z.string().uuid())
    });
    const { tmdbId, collectionIds } = schema.parse(req.body);

    let film = await prisma.film.findUnique({ where: { tmdbId } });
    if (!film) {
      // Create film placeholder if it doesn't exist
      film = await prisma.film.create({
        data: {
          tmdbId,
          title: `Movie ${tmdbId}`,
          originalTitle: `Movie ${tmdbId}`,
          slug: `movie-${tmdbId}-${Date.now()}`,
        }
      });
    }

    // Get user's collections
    const userLists = await prisma.list.findMany({
      where: { userId: req.user!.id },
      select: { id: true }
    });
    const userListIds = userLists.map(l => l.id);

    // Filter collectionIds to only those owned by the user
    const validCollectionIds = collectionIds.filter(id => userListIds.includes(id));

    // Delete existing ListFilms for this film in ALL of the user's lists
    await prisma.listFilm.deleteMany({
      where: {
        filmId: film.id,
        listId: { in: userListIds }
      }
    });

    // Create new ListFilms
    if (validCollectionIds.length > 0) {
      await prisma.listFilm.createMany({
        data: validCollectionIds.map(listId => ({
          listId,
          filmId: film!.id,
        }))
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/collections/:id/clone
router.post('/:id/clone', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const originalCollection = await prisma.list.findUnique({
      where: { id: req.params.id },
      include: { films: true }
    });
    
    if (!originalCollection) throw new NotFoundError('Collection');
    if (!originalCollection.isPublic && originalCollection.userId !== req.user!.id) {
      throw new ForbiddenError();
    }

    const title = `${originalCollection.title} (Clone)`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const newCollection = await prisma.list.create({
      data: {
        title,
        slug,
        description: originalCollection.description,
        coverImageUrl: originalCollection.coverImageUrl,
        isPublic: false,
        isRanked: originalCollection.isRanked,
        userId: req.user!.id,
        films: {
          create: originalCollection.films.map(f => ({
            filmId: f.filmId,
            position: f.position,
            note: f.note
          }))
        }
      }
    });

    res.status(201).json({ data: newCollection });
  } catch (err) {
    next(err);
  }
});

const createCollectionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  coverImageUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  isRanked: z.boolean().default(false),
});

// POST /api/v1/collections/
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createCollectionSchema.parse(req.body);
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);
    const collection = await prisma.list.create({
      data: {
        ...data,
        slug,
        userId: req.user!.id,
      },
    });
    res.status(201).json({ data: collection });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/collections/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const collection = await prisma.list.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        films: {
          include: { film: true },
          orderBy: { position: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!collection) throw new NotFoundError('Collection');
    if (!collection.isPublic && (!req.user || req.user.id !== collection.userId)) {
      throw new ForbiddenError();
    }

    let isLikedByMe = false;
    if (req.user) {
      const like = await prisma.listLike.findUnique({
        where: { userId_listId: { userId: req.user.id, listId: collection.id } },
      });
      isLikedByMe = !!like;
    }

    res.json({ data: { ...collection, isLikedByMe } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/collections/:id
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createCollectionSchema.partial().parse(req.body);
    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== req.user!.id) throw new ForbiddenError();

    const updated = await prisma.list.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/collections/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== req.user!.id && !['admin', 'moderator'].includes(req.user!.role)) {
      throw new ForbiddenError();
    }

    await prisma.list.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/collections/:id/films
router.post('/:id/films', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      filmId: z.string().uuid(),
      position: z.number().int().optional(),
      note: z.string().max(500).optional(),
    });
    const { filmId, position, note } = schema.parse(req.body);

    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== req.user!.id) throw new ForbiddenError();

    const film = await prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundError('Film');

    let newPosition = position;
    if (newPosition === undefined) {
      const maxPos = await prisma.listFilm.aggregate({
        where: { listId: req.params.id },
        _max: { position: true },
      });
      newPosition = (maxPos._max.position || 0) + 1;
    }

    const listFilm = await prisma.listFilm.create({
      data: {
        listId: req.params.id,
        filmId,
        position: newPosition,
        note,
      },
    });

    res.status(201).json({ data: listFilm });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/collections/:id/films/:filmId
router.delete('/:id/films/:filmId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== req.user!.id) throw new ForbiddenError();

    await prisma.listFilm.delete({
      where: { listId_filmId: { listId: req.params.id, filmId: req.params.filmId } },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/collections/:id/films/reorder
router.patch('/:id/films/reorder', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.array(z.object({
      filmId: z.string().uuid(),
      position: z.number().int(),
    }));
    const reorderData = schema.parse(req.body);

    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== req.user!.id) throw new ForbiddenError();

    // Use a transaction for multiple updates
    await prisma.$transaction(
      reorderData.map((item) =>
        prisma.listFilm.update({
          where: { listId_filmId: { listId: req.params.id, filmId: item.filmId } },
          data: { position: item.position },
        })
      )
    );

    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/collections/:id/films/:filmId/note
router.put('/:id/films/:filmId/note', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      note: z.string().max(500).nullable().optional(),
    });
    const { note } = schema.parse(req.body);

    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== req.user!.id) throw new ForbiddenError();

    const listFilm = await prisma.listFilm.findUnique({
      where: { listId_filmId: { listId: req.params.id, filmId: req.params.filmId } }
    });
    if (!listFilm) throw new NotFoundError('Film in Collection');

    await prisma.listFilm.update({
      where: { listId_filmId: { listId: req.params.id, filmId: req.params.filmId } },
      data: { note },
    });

    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/collections/:id/like
router.post('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collection = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!collection) throw new NotFoundError('Collection');

    await prisma.listLike.upsert({
      where: { userId_listId: { userId: req.user!.id, listId: req.params.id } },
      create: { userId: req.user!.id, listId: req.params.id },
      update: {},
    });

    const likeCount = await prisma.listLike.count({ where: { listId: req.params.id } });
    await prisma.list.update({ where: { id: req.params.id }, data: { likeCount } });

    res.json({ data: { liked: true, likeCount } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/collections/:id/like
router.delete('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.listLike.deleteMany({
      where: { userId: req.user!.id, listId: req.params.id },
    });

    const likeCount = await prisma.listLike.count({ where: { listId: req.params.id } });
    await prisma.list.update({ where: { id: req.params.id }, data: { likeCount } });

    res.json({ data: { liked: false, likeCount } });
  } catch (err) {
    next(err);
  }
});

export default router;
