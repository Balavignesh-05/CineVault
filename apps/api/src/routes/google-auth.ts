import { Router, Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { config } from '../config/env';
import jwt from 'jsonwebtoken';
import { authRateLimiter } from '../middleware/rateLimiter';
import { AppError } from '../utils/errors';

const router: Router = Router();

const isProd = config.nodeEnv === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' as const : 'lax' as const,
};

function generateAccessToken(user: { id: string; username: string; email: string; role: string }) {
  return jwt.sign(
    { sub: user.id, username: user.username, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] },
  );
}

async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const THIRTY_DAYS = 30 * 24 * 60 * 60;
  await redis.setex(`refresh:${token}`, THIRTY_DAYS, userId).catch(() => {});
  return token;
}

const googleLoginSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z
    .string()
    .url('Invalid redirect URI')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Redirect URI must be http or https',
    }),
});

// POST /api/v1/auth/google
router.post(
  '/google',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if Google OAuth is configured
      if (!config.google.clientId || !config.google.clientSecret) {
        throw new AppError(
          'Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
          503,
          'GOOGLE_NOT_CONFIGURED',
        );
      }

      const body = googleLoginSchema.parse(req.body);

      const oauth2Client = new OAuth2Client(
        config.google.clientId,
        config.google.clientSecret,
        body.redirectUri,
      );

      // Exchange authorization code for tokens
      let tokens;
      try {
        const tokenResponse = await oauth2Client.getToken(body.code);
        tokens = tokenResponse.tokens;
      } catch (err) {
        console.error('[GoogleAuth] Code exchange failed:', (err as Error).message);
        throw new AppError('Invalid or expired authorization code', 400, 'INVALID_AUTH_CODE');
      }

      if (!tokens.id_token) {
        throw new AppError('No ID token received from Google', 400, 'MISSING_ID_TOKEN');
      }

      // Verify the ID token — checks issuer, audience, expiry, and signature
      let payload;
      try {
        const ticket = await oauth2Client.verifyIdToken({
          idToken: tokens.id_token,
          audience: config.google.clientId,
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.error('[GoogleAuth] ID token verification failed:', (err as Error).message);
        throw new AppError('Invalid Google ID token', 400, 'INVALID_ID_TOKEN');
      }

      if (!payload || !payload.sub || !payload.email) {
        throw new AppError('Incomplete Google profile data', 400, 'INCOMPLETE_PROFILE');
      }

      // Reject unverified email addresses
      if (!payload.email_verified) {
        throw new AppError('Google email is not verified', 400, 'EMAIL_NOT_VERIFIED');
      }

      const googleUserId = payload.sub;
      const googleEmail = payload.email.toLowerCase();
      const googleName = payload.name || googleEmail.split('@')[0];
      const googlePicture = payload.picture || null;

      // Account linking logic
      let user;

      // 1. Check if this Google account is already linked
      const existingOAuth = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: 'google',
            providerUserId: googleUserId,
          },
        },
        include: {
          user: {
            select: {
              id: true, username: true, email: true, displayName: true,
              avatarUrl: true, role: true, createdAt: true,
            },
          },
        },
      });

      if (existingOAuth) {
        // Existing linked account — log in
        user = existingOAuth.user;
      } else {
        // 2. Check if email matches an existing user
        const existingUser = await prisma.user.findUnique({
          where: { email: googleEmail },
          select: {
            id: true, username: true, email: true, displayName: true,
            avatarUrl: true, role: true, createdAt: true,
          },
        });

        if (existingUser) {
          // Link Google account to existing user (safe: Google verified the email)
          await prisma.oAuthAccount.create({
            data: {
              userId: existingUser.id,
              provider: 'google',
              providerUserId: googleUserId,
            },
          });
          user = existingUser;
        } else {
          // 3. Create new user with auto-generated username
          const baseUsername = googleName
            .replace(/[^a-zA-Z0-9_]/g, '')
            .substring(0, 20)
            .toLowerCase() || 'user';
          
          // Ensure unique username by appending random suffix
          let username = baseUsername;
          let attempts = 0;
          while (attempts < 10) {
            const exists = await prisma.user.findUnique({
              where: { username },
              select: { id: true },
            });
            if (!exists) break;
            username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
            attempts++;
          }

          const newUser = await prisma.user.create({
            data: {
              username,
              email: googleEmail,
              passwordHash: null, // OAuth-only user — no password
              displayName: googleName,
              avatarUrl: googlePicture,
              role: 'member',
              oauthAccounts: {
                create: {
                  provider: 'google',
                  providerUserId: googleUserId,
                },
              },
            },
            select: {
              id: true, username: true, email: true, displayName: true,
              avatarUrl: true, role: true, createdAt: true,
            },
          });
          user = newUser;
        }
      }

      // Issue JWT cookies (same as standard login)
      const accessToken = generateAccessToken({ ...user, role: user.role });
      const refreshToken = await generateRefreshToken(user.id);

      res.cookie('refresh_token', refreshToken, {
        ...COOKIE_BASE,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.cookie('access_token', accessToken, {
        ...COOKIE_BASE,
        maxAge: 15 * 60 * 1000,
      });

      res.json({ data: { user, expiresIn: 900 } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
