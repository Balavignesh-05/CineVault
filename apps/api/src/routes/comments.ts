import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const router: Router = Router();

// GET /api/v1/comments/?reviewId=&page=
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { reviewId, page = '1', limit = '20' } = req.query;
    if (!reviewId || typeof reviewId !== 'string') {
      return res.status(400).json({ error: { message: 'reviewId is required' } });
    }

    const parsedLimit = parseInt(limit as string, 10); const take = Math.min(isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const parsedPage = parseInt(page as string, 10); const currentPage = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage); const skip = (currentPage - 1) * take;

    const [comments, total] = await Promise.all([
      prisma.reviewComment.findMany({
        where: { reviewId, parentId: null },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          replies: {
            include: {
              user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.reviewComment.count({ where: { reviewId, parentId: null } }),
    ]);

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        let isLikedByMe = false;
        if (req.user) {
          const like = await prisma.reviewCommentLike.findUnique({
            where: { userId_commentId: { userId: req.user.id, commentId: comment.id } },
          });
          isLikedByMe = !!like;
        }
        return { ...comment, isLikedByMe };
      })
    );

    res.json({
      data: {
        items: formattedComments,
        total,
        page: parseInt(page as string, 10),
        hasMore: skip + take < total,
      },
    });
  } catch (err) {
    next(err);
  }
});

const createCommentSchema = z.object({
  reviewId: z.string().uuid(),
  body: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

// POST /api/v1/comments/
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { reviewId, body, parentId } = createCommentSchema.parse(req.body);

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('Review');

    if (parentId) {
      const parent = await prisma.reviewComment.findUnique({ where: { id: parentId } });
      if (!parent || parent.reviewId !== reviewId) {
        throw new NotFoundError('Parent Comment');
      }
    }

    const comment = await prisma.reviewComment.create({
      data: {
        body,
        reviewId,
        parentId,
        userId: req.user!.id,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { commentCount: { increment: 1 } },
    });

    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/comments/:id
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bodySchema = z.object({ body: z.string().min(1).max(2000) });
    const { body } = bodySchema.parse(req.body);

    const comment = await prisma.reviewComment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new NotFoundError('Comment');
    if (comment.userId !== req.user!.id) throw new ForbiddenError();

    const updated = await prisma.reviewComment.update({
      where: { id: req.params.id },
      data: { body },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/comments/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const comment = await prisma.reviewComment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new NotFoundError('Comment');
    if (comment.userId !== req.user!.id && !['admin', 'moderator'].includes(req.user!.role)) {
      throw new ForbiddenError();
    }

    await prisma.reviewComment.delete({ where: { id: req.params.id } });

    await prisma.review.update({
      where: { id: comment.reviewId },
      data: { commentCount: { decrement: 1 } },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/comments/:id/like
router.post('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const comment = await prisma.reviewComment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new NotFoundError('Comment');

    await prisma.reviewCommentLike.upsert({
      where: { userId_commentId: { userId: req.user!.id, commentId: req.params.id } },
      create: { userId: req.user!.id, commentId: req.params.id },
      update: {},
    });

    const likeCount = await prisma.reviewCommentLike.count({ where: { commentId: req.params.id } });
    await prisma.reviewComment.update({ where: { id: req.params.id }, data: { likeCount } });

    res.json({ data: { liked: true, likeCount } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/comments/:id/like
router.delete('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.reviewCommentLike.deleteMany({
      where: { userId: req.user!.id, commentId: req.params.id },
    });

    const likeCount = await prisma.reviewCommentLike.count({ where: { commentId: req.params.id } });
    await prisma.reviewComment.update({ where: { id: req.params.id }, data: { likeCount } });

    res.json({ data: { liked: false, likeCount } });
  } catch (err) {
    next(err);
  }
});

export default router;
