import rateLimit from 'express-rate-limit';

// Global limit: 100 requests per minute
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per `window` (here, per minute).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again in a minute.',
      }
    });
  },
});

// Auth limit: 5 requests per 15 minutes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again later.' }
    });
  },
});

// AI limit: 10 requests per hour
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'AI request limit reached. Please try again in an hour.' }
    });
  },
});
