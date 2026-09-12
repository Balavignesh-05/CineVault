import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

// GET /api/v1/dashboard/
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [
      moviesWatched,
      reviewsWritten,
      collectionsCreated,
      watchlistCount,
      followersCount,
      followingCount,
      filmLogs,
      achievements,
      recentRatings,
      recentReviews,
      collections
    ] = await Promise.all([
      prisma.filmLog.count({ where: { userId } }),
      prisma.review.count({ where: { userId, isPublished: true } }),
      prisma.list.count({ where: { userId } }),
      prisma.watchlistItem.count({ where: { userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.filmLog.findMany({ where: { userId }, include: { film: true } }),
      prisma.userAchievement.findMany({ where: { userId, unlockedAt: { not: null } } }),
      prisma.filmLog.findMany({
        where: { userId, rating: { not: null } },
        include: { film: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.review.findMany({
        where: { userId, isPublished: true },
        include: { film: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.list.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
    ]);

    let hoursWatched = 0;
    let sumRating = 0;
    let ratingCount = 0;
    const ratingsDistribution: Record<string, number> = {};
    for (let i = 0.5; i <= 5.0; i += 0.5) ratingsDistribution[i.toFixed(1)] = 0;
    
    // Monthly Activity Setup
    const monthlyActivityMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyActivityMap[key] = 0;
    }

    filmLogs.forEach(log => {
      const runtime = log.film.runtime || 120;
      hoursWatched += (runtime / 60);

      if (log.rating) {
        sumRating += log.rating.toNumber();
        ratingCount++;
        ratingsDistribution[log.rating.toFixed(1)] = (ratingsDistribution[log.rating.toFixed(1)] || 0) + 1;
      }

      const d = new Date(log.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyActivityMap[key] !== undefined) {
        monthlyActivityMap[key]++;
      }
    });

    const monthlyActivity = Object.keys(monthlyActivityMap).sort().map(key => ({
      month: key,
      count: monthlyActivityMap[key]
    }));

    const avgRatingGiven = ratingCount > 0 ? (sumRating / ratingCount) : 0;

    res.json({
      data: {
        moviesWatched,
        hoursWatched: Math.round(hoursWatched),
        avgRatingGiven,
        reviewsWritten,
        collectionsCreated,
        watchlistCount,
        followersCount,
        followingCount,
        achievementsEarned: achievements.length,
        ratingsDistribution,
        monthlyActivity,
        recentRatings,
        recentReviews,
        collections,
        achievements,
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
