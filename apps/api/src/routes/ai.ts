import { Router } from 'express';
import { z } from 'zod';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { config } from '../config/env';
import { searchMovies, buildImageUrl } from '../integrations/tmdb';
import { authenticate, optionalAuth } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

router.use('/recommend', aiRateLimiter);

// Define the expected output schema from Gemini
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      description: 'List of 5 to 10 recommended movies based on the user prompt.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Title of the movie' },
          year: { type: Type.NUMBER, description: 'Release year' },
          reason: { type: Type.STRING, description: 'A short engaging 1-sentence reason why this movie fits the user query' },
        },
        required: ['title', 'year', 'reason'],
      },
    },
  },
  required: ['recommendations'],
};

// Initialize Gemini client (requires GEMINI_API_KEY env var)
const ai = config.geminiApiKey ? new GoogleGenAI({ apiKey: config.geminiApiKey }) : null;

const aiQuerySchema = z.object({
  prompt: z.string().min(3).max(500),
});

// POST /api/v1/ai/recommend
router.post('/recommend', optionalAuth, async (req, res, next) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: { message: 'AI features are not configured on this server.' } });
    }

    const { prompt } = aiQuerySchema.parse(req.body);

    const systemInstruction = `You are a world-class cinephile and movie recommender. The user will give you a prompt describing what they want to watch. 
You must return a list of 5-10 movie recommendations that perfectly match their request. Include the title, year, and a short 1-sentence engaging reason why you recommend it.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.7,
      },
    });

    const responseText = result.text;
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    const parsedResponse = JSON.parse(responseText);
    const recommendations = parsedResponse.recommendations || [];

    // Map AI recommendations to TMDB data
    const enrichedResults = [];
    
    for (const rec of recommendations) {
      // Search TMDB for the movie
      const tmdbSearch = await searchMovies(rec.title, 1);
      
      // Try to find an exact match by year, or fallback to first result
      const match = tmdbSearch.results.find(m => {
        if (!m.release_date) return false;
        const year = new Date(m.release_date).getFullYear();
        return year === rec.year || year === rec.year - 1 || year === rec.year + 1;
      }) || tmdbSearch.results[0];

      if (match) {
        enrichedResults.push({
          tmdbId: match.id,
          title: match.title,
          releaseYear: match.release_date ? new Date(match.release_date).getFullYear() : null,
          posterUrl: buildImageUrl(match.poster_path, 'w500'),
          backdropUrl: buildImageUrl(match.backdrop_path, 'w780'),
          overview: match.overview,
          voteAverage: match.vote_average,
          aiReason: rec.reason, // Inject AI reason
        });
      }
    }

    res.json({ data: { items: enrichedResults } });
  } catch (err) {
    next(err);
  }
});

export default router;
