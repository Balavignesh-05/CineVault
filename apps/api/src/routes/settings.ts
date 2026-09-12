import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

const updateSettingsSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(1000).optional().nullable(),
  website: z.string().url().or(z.literal('')).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().or(z.literal('')).optional().nullable(),
  isPrivate: z.boolean().optional(),
});

// GET /api/v1/settings
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        website: true,
        location: true,
        isPrivate: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundError('User');
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/settings
router.patch('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateSettingsSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.website !== undefined && { website: data.website || null }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
        ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        website: true,
        location: true,
        isPrivate: true,
        role: true,
        status: true,
      },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/settings/account
router.delete('/account', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.id },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
