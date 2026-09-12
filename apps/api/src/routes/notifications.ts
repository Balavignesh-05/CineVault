import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const router: Router = Router();

// GET /api/v1/notifications/
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: req.user!.id },
        include: {
          actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.notification.count({ where: { recipientId: req.user!.id } }),
    ]);

    res.json({
      data: {
        items: notifications,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notifications/count
router.get('/count', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { recipientId: req.user!.id, readAt: null },
    });
    res.json({ data: { count } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification || notification.recipientId !== req.user!.id) {
      throw new NotFoundError('Notification');
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { readAt: new Date() },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
