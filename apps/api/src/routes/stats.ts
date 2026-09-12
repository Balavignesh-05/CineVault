import { Router } from 'express';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

// GET /api/v1/stats/:username
router.get('/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
    });

    if (!user) throw new NotFoundError('User');

    const userId = user.id;

    const [
      moviesWatched,
      reviewsWritten,
      collectionsCreated,
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
      prisma.list.count({ where: { userId, isPublic: true } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.filmLog.findMany({ where: { userId }, include: { film: { include: { genres: { include: { genre: true } } } } } }),
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
        where: { userId, isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
    ]);

    let hoursWatched = 0;
    let sumRating = 0;
    let ratingCount = 0;
    const ratings: Record<string, number> = {};
    const filmsByYear: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    for (let i = 0.5; i <= 5.0; i += 0.5) ratings[i.toFixed(1)] = 0;

    filmLogs.forEach((log: any) => {
      const runtime = log.film.runtime || 120;
      hoursWatched += (runtime / 60);

      if (log.rating) {
        sumRating += log.rating.toNumber();
        ratingCount++;
        ratings[log.rating.toFixed(1)] = (ratings[log.rating.toFixed(1)] || 0) + 1;
      }
      
      const year = log.film.releaseDate ? new Date(log.film.releaseDate).getFullYear().toString() : 'Unknown';
      filmsByYear[year] = (filmsByYear[year] || 0) + 1;
      
      if (log.film.genres) {
        log.film.genres.forEach((g: any) => {
          const genreName = g.genre.name;
          genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
        });
      }
    });

    const avgRatingGiven = ratingCount > 0 ? (sumRating / ratingCount) : 0;
    const favoriteGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(g => g[0]);

    res.json({
      data: {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        moviesWatched,
        hoursWatched: Math.round(hoursWatched),
        avgRatingGiven,
        reviewsWritten,
        collectionsCreated,
        followersCount,
        followingCount,
        achievementsEarned: achievements.length,
        ratings,
        filmsByYear,
        favoriteGenres,
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
