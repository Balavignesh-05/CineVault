import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { passwordResetRateLimiter } from '../middleware/rateLimiter';
import { sendPasswordResetEmail } from '../services/email';
import { AppError } from '../utils/errors';

const router: Router = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long'),
});

// POST /forgot-password
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = forgotPasswordSchema.parse(req.body);

      // Look up user by email (case-insensitive lookup)
      const user = await prisma.user.findFirst({
        where: { email: { equals: body.email, mode: 'insensitive' } },
        select: { id: true, email: true },
      });

      if (user) {
        // Invalidate existing unused tokens for this user
        await prisma.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            consumedAt: null,
          },
          data: {
            consumedAt: new Date(),
          },
        });

        // Generate 32-byte cryptographically secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store hash in PasswordResetToken
        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        });

        // Send reset email asynchronously
        await sendPasswordResetEmail(user.email, rawToken);
      }

      // Always return 200 with generic message to avoid email enumeration
      res.status(200).json({
        data: {
          message: "If an account exists for that email, we've sent password reset instructions.",
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /validate-reset-token
router.get(
  '/validate-reset-token',
  passwordResetRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token;

      if (!token || typeof token !== 'string') {
        return res.json({
          data: { valid: false, reason: 'TOKEN_INVALID' },
        });
      }

      const tokenHash = hashToken(token);

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });

      if (!resetToken) {
        return res.json({
          data: { valid: false, reason: 'TOKEN_INVALID' },
        });
      }

      if (resetToken.consumedAt) {
        return res.json({
          data: { valid: false, reason: 'TOKEN_USED' },
        });
      }

      if (resetToken.expiresAt < new Date()) {
        return res.json({
          data: { valid: false, reason: 'TOKEN_EXPIRED' },
        });
      }

      return res.json({
        data: { valid: true },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /reset-password
router.post(
  '/reset-password',
  passwordResetRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = resetPasswordSchema.parse(req.body);
      const tokenHash = hashToken(body.token);

      let resetUserId: string;

      await prisma.$transaction(async (tx) => {
        const resetToken = await tx.passwordResetToken.findUnique({
          where: { tokenHash },
        });

        if (!resetToken || resetToken.consumedAt || resetToken.expiresAt < new Date()) {
          throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
        }

        const passwordHash = await bcrypt.hash(body.password, 12);

        await tx.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        });

        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { consumedAt: new Date() },
        });

        resetUserId = resetToken.userId;
      });

      // Invalidate all active Redis refresh sessions for this user
      try {
        const keys = await redis.keys('refresh:*');
        for (const key of keys) {
          const storedUserId = await redis.get(key);
          if (storedUserId === resetUserId!) {
            await redis.del(key);
          }
        }
      } catch (redisErr) {
        console.error('[Reset Password] Failed to clear Redis sessions:', redisErr);
      }

      res.json({
        data: {
          message: 'Your password has been reset successfully. You can now sign in with your new password.',
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
