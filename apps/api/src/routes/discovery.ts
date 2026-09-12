import { Router } from 'express';
import { redis as cache } from '../config/redis';

const router: Router = Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function fetchFromTmdb(endpoint: string, cacheKey: string, ttl: number) {
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = `${TMDB_BASE_URL}${endpoint}&api_key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  
  await cache.set(cacheKey, JSON.stringify(data), 'EX', ttl);
  return data;
}

// GET /api/v1/discovery/genres
router.get('/genres', async (_req, res, next) => {
  try {
    const data = await fetchFromTmdb('/genre/movie/list?', 'discovery_genres', 86400);
    res.json({ data: data.genres || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/by-genre/:genreId
router.get('/by-genre/:genreId', async (req, res, next) => {
  try {
    const data = await fetchFromTmdb(`/discover/movie?with_genres=${req.params.genreId}`, `discovery_genre_${req.params.genreId}`, 7200);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/by-decade/:decade
router.get('/by-decade/:decade', async (req, res, next) => {
  try {
    const decade = parseInt(req.params.decade, 10);
    const startDate = `${decade}-01-01`;
    const endDate = `${decade + 9}-12-31`;
    const data = await fetchFromTmdb(`/discover/movie?primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}`, `discovery_decade_${decade}`, 7200);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/award-winners
router.get('/award-winners', async (_req, res, next) => {
  try {
    // using a dummy keyword for awards
    const data = await fetchFromTmdb(`/discover/movie?with_keywords=7369`, 'discovery_awards', 14400);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/oscar-winners
router.get('/oscar-winners', async (_req, res, next) => {
  try {
    // dummy keyword 82346 for oscars
    const data = await fetchFromTmdb(`/discover/movie?with_keywords=82346`, 'discovery_oscars', 14400);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/streaming/:providerId
router.get('/streaming/:providerId', async (req, res, next) => {
  try {
    const data = await fetchFromTmdb(`/discover/movie?with_watch_providers=${req.params.providerId}&watch_region=US`, `discovery_provider_${req.params.providerId}`, 7200);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/by-person/:tmdbPersonId
router.get('/by-person/:tmdbPersonId', async (req, res, next) => {
  try {
    const data = await fetchFromTmdb(`/discover/movie?with_people=${req.params.tmdbPersonId}`, `discovery_person_${req.params.tmdbPersonId}`, 7200);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/discovery/by-studio/:companyId
router.get('/by-studio/:companyId', async (req, res, next) => {
  try {
    const data = await fetchFromTmdb(`/discover/movie?with_companies=${req.params.companyId}`, `discovery_company_${req.params.companyId}`, 7200);
    res.json({ data: data.results || [] });
  } catch (err) {
    next(err);
  }
});

export default router;
