import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

const createReportSchema = z.object({
  entityType: z.enum(['movie', 'review', 'comment', 'collection', 'profile']),
  entityId: z.string(),
  reason: z.enum(['spam', 'harassment', 'hate_speech', 'nsfw', 'fake_info', 'other']),
  reviewId: z.string().optional(),
});

// POST /api/v1/reports
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createReportSchema.parse(req.body);

    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        entityType: data.entityType,
        entityId: data.entityId,
        reason: data.reason,
        reviewId: data.reviewId || null,
        status: 'pending',
      },
    });

    res.status(201).json({ data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
