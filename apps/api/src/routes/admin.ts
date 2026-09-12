import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const router: Router = Router();

// Middleware: Require Admin or Moderator role
function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
    return next(new ForbiddenError('Admin or Moderator access required'));
  }
  next();
}

async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, details?: string) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details || null,
      },
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}

// GET /api/v1/admin/stats
router.get('/stats', authenticate, requireAdmin, async (_req: AuthRequest, res, next) => {
  try {
    const [u, r, fl, c, rp, a] = await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.filmLog.count(),
      prisma.list.count(),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.user.count({
        where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    res.json({
      data: {
        totalUsers: u,
        totalReviews: r,
        totalFilmsLogged: fl,
        totalCollections: c,
        totalReportsPending: rp,
        activeUsers24h: a,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/users
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const where: any = search
      ? {
          OR: [
            { username: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
            { displayName: { contains: search as string, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: {
        items: users,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/users/:id/suspend
router.patch('/users/:id/suspend', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'suspended' },
    });
    await logAdminAction(req.user!.id, 'suspend_user', 'user', user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/users/:id/ban
router.patch('/users/:id/ban', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'banned' },
    });
    await logAdminAction(req.user!.id, 'ban_user', 'user', user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/users/:id/restore
router.patch('/users/:id/restore', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'active' },
    });
    await logAdminAction(req.user!.id, 'restore_user', 'user', user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/reviews
router.get('/reviews', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: {
          user: { select: { id: true, username: true, displayName: true } },
          film: { select: { id: true, title: true, posterUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.review.count(),
    ]);

    res.json({
      data: {
        items: reviews,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/reviews/:id/approve
router.patch('/reviews/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });
    await logAdminAction(req.user!.id, 'approve_review', 'review', review.id);
    res.json({ data: review });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/reviews/:id/feature
router.patch('/reviews/:id/feature', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const current = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!current) throw new NotFoundError('Review');

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isFeatured: !current.isFeatured },
    });
    await logAdminAction(req.user!.id, review.isFeatured ? 'feature_review' : 'unfeature_review', 'review', review.id);
    res.json({ data: review });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/reviews/:id
router.delete('/reviews/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    await logAdminAction(req.user!.id, 'delete_review', 'review', req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/collections
router.get('/collections', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [collections, total] = await Promise.all([
      prisma.list.findMany({
        include: {
          user: { select: { id: true, username: true, displayName: true } },
          _count: { select: { films: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.list.count(),
    ]);

    res.json({
      data: {
        items: collections,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/collections/:id/feature
router.patch('/collections/:id/feature', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const current = await prisma.list.findUnique({ where: { id: req.params.id } });
    if (!current) throw new NotFoundError('Collection');

    const collection = await prisma.list.update({
      where: { id: req.params.id },
      data: { isFeatured: !current.isFeatured },
    });
    await logAdminAction(req.user!.id, collection.isFeatured ? 'feature_collection' : 'unfeature_collection', 'collection', collection.id);
    res.json({ data: collection });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/collections/:id
router.delete('/collections/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    await logAdminAction(req.user!.id, 'delete_collection', 'collection', req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/reports
router.get('/reports', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { status = 'pending', page = '1', limit = '20' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const where = status ? { status: status as string } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, username: true, displayName: true } },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      data: {
        items: reports,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/reports/:id/resolve
router.patch('/reports/:id/resolve', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['approved', 'dismissed', 'warned', 'suspended', 'deleted']),
    });
    const { status } = schema.parse(req.body);

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status,
        resolvedBy: req.user!.id,
      },
    });

    await logAdminAction(req.user!.id, `resolve_report_${status}`, 'report', report.id);
    res.json({ data: report });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/logs
router.get('/logs', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.adminLog.count(),
    ]);

    res.json({
      data: {
        items: logs,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
