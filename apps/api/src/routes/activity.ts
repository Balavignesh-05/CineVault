import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

// Helper to format events
function formatEvent(item: any, type: string) {
  const actor = item.user ? {
    id: item.user.id,
    username: item.user.username,
    displayName: item.user.displayName,
    avatarUrl: item.user.avatarUrl,
  } : null;

  const film = item.film ? {
    id: item.film.id,
    tmdbId: item.film.tmdbId,
    title: item.film.title,
    posterUrl: item.film.posterUrl,
    releaseYear: item.film.releaseDate ? new Date(item.film.releaseDate).getFullYear() : null,
  } : null;

  return {
    id: `${type}_${item.id}`,
    type,
    actor,
    film,
    rating: item.rating ? Number(item.rating) : undefined,
    reviewId: item.body && type === 'reviewed_film' ? item.id : undefined,
    collectionId: item.list ? item.list.id : undefined,
    targetUserId: item.following ? item.following.id : undefined,
    targetUser: item.following ? {
      id: item.following.id,
      username: item.following.username,
      displayName: item.following.displayName,
      avatarUrl: item.following.avatarUrl,
    } : undefined,
    metadata: {
      collectionTitle: item.list ? item.list.title : undefined,
      reviewBody: item.body && type === 'reviewed_film' ? item.body.substring(0, 100) + '...' : undefined,
    },
    createdAt: item.createdAt.toISOString(),
  };
}

// GET /api/v1/activity/?userId=&page=
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { userId, page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    // Fetch activities from different tables
    const [logs, reviews, lists, follows] = await Promise.all([
      prisma.filmLog.findMany({
        where: { userId },
        include: { user: true, film: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
      prisma.review.findMany({
        where: { userId, isPublished: true },
        include: { user: true, film: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
      prisma.list.findMany({
        where: { userId, isPublic: true },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          follower: true,
          following: true,
        },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
    ]);

    const events: any[] = [];

    logs.forEach(log => {
      events.push(formatEvent(log, log.rating ? 'rated_film' : 'watched_film'));
    });
    reviews.forEach(review => {
      events.push(formatEvent(review, 'reviewed_film'));
    });
    lists.forEach(list => {
      events.push(formatEvent({ ...list, list }, 'created_collection'));
    });
    follows.forEach(follow => {
      events.push(formatEvent({ ...follow, user: follow.follower }, 'followed_user'));
    });

    // Sort by createdAt desc
    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const paginatedEvents = events.slice(skip, skip + take);

    res.json({
      data: {
        items: paginatedEvents,
        page: parseInt(page as string, 10),
        hasMore: skip + take < events.length,
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/activity/feed
router.get('/feed', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const follows = await prisma.follow.findMany({
      where: { followerId: req.user!.id },
      select: { followingId: true },
    });
    const followingIds = follows.map(f => f.followingId);
    followingIds.push(req.user!.id); // include own activity in feed? (optional, let's include)

    const [logs, reviews, lists, newFollows] = await Promise.all([
      prisma.filmLog.findMany({
        where: { userId: { in: followingIds } },
        include: { user: true, film: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
      prisma.review.findMany({
        where: { userId: { in: followingIds }, isPublished: true },
        include: { user: true, film: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
      prisma.list.findMany({
        where: { userId: { in: followingIds }, isPublic: true },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
      prisma.follow.findMany({
        where: { followerId: { in: followingIds } },
        include: { follower: true, following: true },
        orderBy: { createdAt: 'desc' },
        take: skip + take,
      }),
    ]);

    const events: any[] = [];
    logs.forEach(log => events.push(formatEvent(log, log.rating ? 'rated_film' : 'watched_film')));
    reviews.forEach(review => events.push(formatEvent(review, 'reviewed_film')));
    lists.forEach(list => events.push(formatEvent({ ...list, list }, 'created_collection')));
    newFollows.forEach(follow => events.push(formatEvent({ ...follow, user: follow.follower }, 'followed_user')));

    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const paginatedEvents = events.slice(skip, skip + take);

    res.json({
      data: {
        items: paginatedEvents,
        page: parseInt(page as string, 10),
        hasMore: skip + take < events.length,
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
