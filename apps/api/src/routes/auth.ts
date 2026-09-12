import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { redis } from '../config/redis';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError, AuthError, ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { authRateLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// Schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(60),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Use strict rate limiters for auth endpoints
router.use('/register', authRateLimiter);
router.use('/login', authRateLimiter);
router.use('/refresh', authRateLimiter);

// Token helpers
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

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    let user;
    try {
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: body.email }, { username: body.username }] },
        select: { email: true, username: true },
      });

      if (existing?.email === body.email) {
        throw new ConflictError('Email already in use', 'EMAIL_TAKEN');
      }
      if (existing?.username === body.username) {
        throw new ConflictError('Username already taken', 'USERNAME_TAKEN');
      }

      const passwordHash = await bcrypt.hash(body.password, 12);

      user = await prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
          passwordHash,
          displayName: body.displayName,
          role: 'member',
        },
        select: {
          id: true, username: true, email: true, displayName: true,
          avatarUrl: true, role: true, createdAt: true,
        },
      });
    } catch (dbErr: any) {
      if (dbErr instanceof ConflictError) throw dbErr;
      console.error('Registration database error:', dbErr);
      return next(dbErr);
    }

    const accessToken = generateAccessToken({ ...user, role: user.role });
    const refreshToken = await generateRefreshToken(user.id);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.status(201).json({
      data: { user, expiresIn: 900 },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    let safeUser;
    try {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          id: true, username: true, email: true, displayName: true,
          avatarUrl: true, role: true, passwordHash: true, createdAt: true,
        },
      });

      if (!user || !user.passwordHash) {
        throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      const isValid = await bcrypt.compare(body.password, user.passwordHash);
      if (!isValid) {
        throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      const { passwordHash: _, ...rest } = user;
      safeUser = rest;
    } catch (dbErr: any) {
      if (dbErr instanceof AuthError) throw dbErr;
      console.error('Login database error:', dbErr);
      return next(dbErr);
    }

    const accessToken = generateAccessToken({ ...safeUser, role: safeUser.role });
    const refreshToken = await generateRefreshToken(safeUser.id);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ data: { user: safeUser, expiresIn: 900 } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await redis.del(`refresh:${refreshToken}`);
    }
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new AuthError('No refresh token');

    const userId = await redis.get(`refresh:${refreshToken}`);
    if (!userId) throw new AuthError('Invalid refresh token', 'TOKEN_EXPIRED');

    // Rotate refresh token
    await redis.del(`refresh:${refreshToken}`);
    const newRefreshToken = await generateRefreshToken(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });
    if (!user) throw new NotFoundError('User');

    const accessToken = generateAccessToken({ ...user, role: user.role });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ data: { expiresIn: 900 } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true, username: true, email: true, displayName: true,
          bio: true, avatarUrl: true, website: true, location: true,
          isPrivate: true, isVerified: true, role: true, createdAt: true, updatedAt: true,
        },
      });
    } catch (dbErr) {
      console.error('Fetch me database error:', dbErr);
      return next(dbErr);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
