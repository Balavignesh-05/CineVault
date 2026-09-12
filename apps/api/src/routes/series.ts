import { Router } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import {
  getSeriesDetails,
  getSeasonDetails,
  buildImageUrl,
  buildSlug,
  TmdbSeries,
  TmdbSeason,
} from '../integrations/tmdb';

const router: Router = Router();

// Helper: upsert series from TMDB data
async function upsertSeriesFromTmdb(tmdbData: TmdbSeries) {
  const year = tmdbData.first_air_date
    ? new Date(tmdbData.first_air_date).getFullYear()
    : null;
  const slug = buildSlug(tmdbData.name, year, tmdbData.id);

  const series = await prisma.series.upsert({
    where: { tmdbId: tmdbData.id },
    create: {
      tmdbId: tmdbData.id,
      imdbId: tmdbData.imdb_id ?? null,
      title: tmdbData.name,
      originalTitle: tmdbData.original_name,
      slug,
      firstAirDate: tmdbData.first_air_date ? new Date(tmdbData.first_air_date) : null,
      lastAirDate: tmdbData.last_air_date ? new Date(tmdbData.last_air_date) : null,
      status: tmdbData.status ?? null,
      overview: tmdbData.overview ?? null,
      posterUrl: buildImageUrl(tmdbData.poster_path, 'w500'),
      backdropUrl: buildImageUrl(tmdbData.backdrop_path, 'original'),
      avgRating: tmdbData.vote_average ?? null,
      ratingCount: tmdbData.vote_count ?? 0,
    },
    update: {
      title: tmdbData.name,
      overview: tmdbData.overview ?? null,
      posterUrl: buildImageUrl(tmdbData.poster_path, 'w500'),
      backdropUrl: buildImageUrl(tmdbData.backdrop_path, 'original'),
      lastAirDate: tmdbData.last_air_date ? new Date(tmdbData.last_air_date) : null,
      status: tmdbData.status ?? null,
    },
  });

  return series;
}

// GET /api/v1/series/:identifier
router.get('/:identifier', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { identifier } = req.params;
    const tmdbId = /^\d+$/.test(identifier) ? parseInt(identifier) : null;

    let series = null;
    if (tmdbId) {
      series = await prisma.series.findUnique({
        where: { tmdbId },
      });
    } else {
      series = await prisma.series.findUnique({
        where: { slug: identifier },
      });
    }

    // If not in DB, fetch from TMDB and cache
    if (!series && tmdbId) {
      const tmdbData = await getSeriesDetails(tmdbId);
      series = await upsertSeriesFromTmdb(tmdbData);
    }

    if (!series) throw new NotFoundError('Series');

    let userSeriesState = null;
    if (req.user) {
      const [liked, watchlisted] = await Promise.all([
        prisma.likedSeries.findUnique({ where: { userId_seriesId: { userId: req.user.id, seriesId: series.id } } }),
        prisma.watchlistSeries.findUnique({ where: { userId_seriesId: { userId: req.user.id, seriesId: series.id } } }),
      ]);
      userSeriesState = { liked: !!liked, watchlisted: !!watchlisted };
    }

    res.json({ data: { ...series, userSeriesState } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/series/:seriesId/season/:seasonNumber
router.get('/:seriesId/season/:seasonNumber', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const seriesId = req.params.seriesId;
    const seasonNumber = parseInt(req.params.seasonNumber);

    const series = await prisma.series.findUnique({ where: { id: seriesId } });
    if (!series) throw new NotFoundError('Series');

    let season = await prisma.season.findUnique({
      where: { seriesId_seasonNumber: { seriesId: series.id, seasonNumber } },
      include: { episodes: true },
    });

    if (!season) {
      const tmdbSeason = await getSeasonDetails(series.tmdbId, seasonNumber);
      
      season = await prisma.season.create({
        data: {
          tmdbId: tmdbSeason.id,
          seriesId: series.id,
          seasonNumber: tmdbSeason.season_number,
          name: tmdbSeason.name,
          overview: tmdbSeason.overview ?? null,
          posterUrl: buildImageUrl(tmdbSeason.poster_path, 'w500'),
          airDate: tmdbSeason.air_date ? new Date(tmdbSeason.air_date) : null,
          episodes: {
            create: tmdbSeason.episodes?.map(ep => ({
              tmdbId: ep.id,
              episodeNumber: ep.episode_number,
              name: ep.name,
              overview: ep.overview ?? null,
              airDate: ep.air_date ? new Date(ep.air_date) : null,
              stillUrl: buildImageUrl(ep.still_path, 'w500'),
              runtime: ep.runtime ?? null,
            })) || [],
          },
        },
        include: { episodes: true },
      });
    }

    // Get user logs for these episodes
    let episodeLogs: import('@prisma/client').EpisodeLog[] = [];
    if (req.user) {
      episodeLogs = await prisma.episodeLog.findMany({
        where: {
          userId: req.user.id,
          episodeId: { in: season.episodes.map(e => e.id) },
        },
      });
    }

    const response = {
      ...season,
      episodes: season.episodes.map(ep => {
        const log = episodeLogs.find(l => l.episodeId === ep.id);
        return {
          ...ep,
          userState: log ? { watched: true, rating: log.rating, liked: log.liked } : null,
        };
      }),
    };

    res.json({ data: response });
  } catch (err) {
    next(err);
  }
});

export default router;
