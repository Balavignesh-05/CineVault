import { Router } from 'express';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

function formatFilm(film: any) {
  if (!film) return null;
  return {
    ...film,
    budget: film.budget !== undefined && film.budget !== null ? film.budget.toString() : null,
    revenue: film.revenue !== undefined && film.revenue !== null ? film.revenue.toString() : null,
  };
}

// GET /api/v1/stats/:username
router.get('/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
    });

    if (!user) throw new NotFoundError('User');

    const userId = user.id;

    const moviesWatched = await prisma.filmLog.count({ where: { userId } });
    const reviewsWritten = await prisma.review.count({ where: { userId, isPublished: true } });
    const collectionsCreated = await prisma.list.count({ where: { userId, isPublic: true } });
    const followersCount = await prisma.follow.count({ where: { followingId: userId } });
    const followingCount = await prisma.follow.count({ where: { followerId: userId } });
    const filmLogs = await prisma.filmLog.findMany({
      where: { userId },
      include: { film: { include: { genres: { include: { genre: true } } } } }
    });
    const achievements = await prisma.userAchievement.findMany({ where: { userId, unlockedAt: { not: null } } });
    const recentRatings = await prisma.filmLog.findMany({
      where: { userId, rating: { not: null } },
      include: { film: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    const recentReviews = await prisma.review.findMany({
      where: { userId, isPublished: true },
      include: { film: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    const collections = await prisma.list.findMany({
      where: { userId, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    let hoursWatched = 0;
    let sumRating = 0;
    let ratingCount = 0;
    const ratings: Record<string, number> = {};
    const filmsByYear: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    for (let i = 0.5; i <= 5.0; i += 0.5) ratings[i.toFixed(1)] = 0;

    filmLogs.forEach((log: any) => {
      if (log.film) {
        const runtime = log.film.runtime || 120;
        hoursWatched += (runtime / 60);

        const year = log.film.releaseDate ? new Date(log.film.releaseDate).getFullYear().toString() : 'Unknown';
        filmsByYear[year] = (filmsByYear[year] || 0) + 1;

        if (log.film.genres) {
          log.film.genres.forEach((g: any) => {
            const genreName = g.genre?.name;
            if (genreName) {
              genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
            }
          });
        }
      }

      if (log.rating !== null && log.rating !== undefined) {
        const numRating = typeof log.rating?.toNumber === 'function' ? log.rating.toNumber() : Number(log.rating);
        if (!isNaN(numRating)) {
          sumRating += numRating;
          ratingCount++;
          const ratingKey = numRating.toFixed(1);
          if (ratings[ratingKey] !== undefined) {
            ratings[ratingKey] = (ratings[ratingKey] || 0) + 1;
          }
        }
      }
    });

    const avgRatingGiven = ratingCount > 0 ? (sumRating / ratingCount) : 0;
    const favoriteGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(g => g[0]);

    const formattedRecentRatings = recentRatings.map((log: any) => ({
      ...log,
      rating: log.rating !== null && log.rating !== undefined ? (typeof log.rating?.toNumber === 'function' ? log.rating.toNumber() : Number(log.rating)) : null,
      film: formatFilm(log.film),
    }));

    const formattedRecentReviews = recentReviews.map((rev: any) => ({
      ...rev,
      film: formatFilm(rev.film),
    }));

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
        recentRatings: formattedRecentRatings,
        recentReviews: formattedRecentReviews,
        collections,
        achievements,
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
