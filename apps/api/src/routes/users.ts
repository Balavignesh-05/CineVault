import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../utils/errors';

import { z } from 'zod';

const router: Router = Router();

const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  theme: z.string().optional(),
});

// PUT /api/v1/users/settings
router.put('/settings', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { emailNotifications, pushNotifications, theme } = settingsSchema.parse(req.body);
    const userId = req.user!.id;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: { emailNotifications, pushNotifications, theme },
      create: { userId, emailNotifications, pushNotifications, theme },
    });

    res.json({ data: preferences });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/search?q=
router.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(parseInt(String(req.query.limit || '20')), 50);
    if (!q) {
      res.json({ data: { items: [] } });
      return;
    }
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true },
      take: limit,
    });
    res.json({ data: { items: users } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:username
router.get('/:username', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, displayName: true, bio: true,
        avatarUrl: true, website: true, location: true,
        isPrivate: true, isVerified: true, role: true, createdAt: true,
        _count: {
          select: {
            followers: true, following: true,
            filmLogs: true, reviews: true, lists: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundError('User');

    // Check if private
    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: user.id } },
      });
      isFollowing = !!follow;
    }

    const isOwner = req.user?.id === user.id;
    if (user.isPrivate && !isOwner && !isFollowing) {
      res.json({
        data: {
          id: user.id, username: user.username, displayName: user.displayName,
          avatarUrl: user.avatarUrl, isPrivate: true, isVerified: user.isVerified,
        },
      });
      return;
    }

    res.json({ data: { ...user, isFollowing, isOwner } });
  } catch (err) {
    next(err);
  }
});

const profileSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(500).optional().nullable(),
  website: z.string().url().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  profileBackdropUrl: z.string().url().optional().nullable(),
});

// PUT /api/v1/users/profile
router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { displayName, bio, website, location, profileBackdropUrl } = profileSchema.parse(req.body);
    const userId = req.user!.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { displayName, bio, website, location, profileBackdropUrl },
      select: { id: true, username: true, displayName: true, bio: true, website: true, location: true, profileBackdropUrl: true }
    });

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:username/films (recent logs)
router.get('/:username/films', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, isPrivate: true },
    });
    if (!user) throw new NotFoundError('User');

    const { page = '1', limit = '24' } = req.query as { page?: string; limit?: string };
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.filmLog.findMany({
        where: { userId: user.id },
        include: {
          film: {
            select: {
              id: true, title: true, slug: true, posterUrl: true, releaseDate: true,
              avgRating: true, ratingCount: true,
              genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.filmLog.count({ where: { userId: user.id } }),
    ]);

    res.json({ data: { items: logs, total, page: parseInt(page), hasMore: skip + take < total } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:username/reviews
router.get('/:username/reviews', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, isPrivate: true }
    });
    if (!user) throw new NotFoundError('User');

    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: user.id } },
      });
      isFollowing = !!follow;
    }

    const isOwner = req.user?.id === user.id;
    if (user.isPrivate && !isOwner && !isFollowing) {
      throw new ForbiddenError('Private profile');
    }

    const { page = '1', limit = '24' } = req.query as { page?: string; limit?: string };
    const parsedLimit = parseInt(limit as string, 10); 
    const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); 
    const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); 
    const skip = (currentPage - 1) * take;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { 
          userId: user.id,
          isPublished: isOwner ? undefined : true 
        },
        include: {
          film: {
            select: {
              id: true, title: true, slug: true, posterUrl: true, releaseDate: true,
            },
          },
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.review.count({ 
        where: { 
          userId: user.id,
          isPublished: isOwner ? undefined : true
        } 
      }),
    ]);

    res.json({ data: { items: reviews, total, page: parseInt(page), hasMore: skip + take < total } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/:username/favorites
router.put('/:username/favorites', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { favoriteFilmIds } = req.body;
    if (!Array.isArray(favoriteFilmIds)) {
      res.status(400).json({ error: { message: 'favoriteFilmIds must be an array' } });
      return;
    }
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw new NotFoundError('User');
    if (user.id !== req.user!.id) throw new ForbiddenError('Cannot modify another user');

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { favoriteFilmIds },
      select: { id: true, username: true, favoriteFilmIds: true }
    });

    res.json({ data: updatedUser });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:username/activity
router.get('/:username/activity', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, isPrivate: true }
    });
    if (!user) throw new NotFoundError('User');

    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: user.id } },
      });
      isFollowing = !!follow;
    }

    const isOwner = req.user?.id === user.id;
    if (user.isPrivate && !isOwner && !isFollowing) {
      throw new ForbiddenError('Private profile');
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const logs = await prisma.filmLog.findMany({
      where: { 
        userId: user.id,
        createdAt: { gte: oneYearAgo }
      },
      select: { createdAt: true }
    });

    const heatmapMap: Record<string, number> = {};
    logs.forEach(log => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
    });

    const heatmap = Object.keys(heatmapMap).map(date => ({
      date,
      count: heatmapMap[date]
    }));

    const recentReviews = await prisma.review.findMany({
      where: { userId: user.id, isPublished: true },
      include: { film: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      data: {
        heatmap,
        recentReviews
      }
    });

  } catch (err) {
    next(err);
  }
});

// POST /api/v1/users/:username/follow
router.post('/:username/follow', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true }
    });
    
    if (!targetUser) throw new NotFoundError('User');
    if (targetUser.id === req.user!.id) {
      res.status(400).json({ error: { message: 'Cannot follow yourself' } });
      return;
    }

    const follow = await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: req.user!.id,
          followingId: targetUser.id
        }
      },
      update: {},
      create: {
        followerId: req.user!.id,
        followingId: targetUser.id
      }
    });

    res.status(201).json({ data: follow });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/:username/follow
router.delete('/:username/follow', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true }
    });
    
    if (!targetUser) throw new NotFoundError('User');

    await prisma.follow.deleteMany({
      where: {
        followerId: req.user!.id,
        followingId: targetUser.id
      }
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:username/followers
router.get('/:username/followers', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username }, select: { id: true } });
    if (!user) throw new NotFoundError('User');
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } } }
    });
    const items = followers.map(f => f.follower);
    res.json({ data: { items } });
  } catch (err) { next(err); }
});

// GET /api/v1/users/:username/following
router.get('/:username/following', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username }, select: { id: true } });
    if (!user) throw new NotFoundError('User');
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: { following: { select: { id: true, username: true, displayName: true, avatarUrl: true } } }
    });
    const items = following.map(f => f.following);
    res.json({ data: { items } });
  } catch (err) { next(err); }
});

export default router;
