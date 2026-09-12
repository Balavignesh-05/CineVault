import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router: Router = Router();

export const ACHIEVEMENTS = [
  { id: 'first_log', title: 'First Watch', tier: 'Bronze', description: 'Log 1 film', requirement: 1, type: 'log' },
  { id: 'century', title: 'Century Club', tier: 'Silver', description: 'Log 100 films', requirement: 100, type: 'log' },
  { id: 'marathon', title: 'Film Marathon', tier: 'Gold', description: 'Log 500 films', requirement: 500, type: 'log' },
  { id: 'first_review', title: 'Budding Critic', tier: 'Bronze', description: 'Write 1 review', requirement: 1, type: 'review' },
  { id: 'critic', title: 'Seasoned Critic', tier: 'Silver', description: 'Write 10 reviews', requirement: 10, type: 'review' },
  { id: 'top_reviewer', title: 'Top Reviewer', tier: 'Gold', description: 'Write 50 reviews', requirement: 50, type: 'review' },
  { id: 'social_butterfly', title: 'Social Butterfly', tier: 'Bronze', description: 'Follow 5 users', requirement: 5, type: 'follow' },
  { id: 'connected', title: 'Well Connected', tier: 'Silver', description: 'Follow 20 users', requirement: 20, type: 'follow' },
  { id: 'collector', title: 'Collector', tier: 'Bronze', description: 'Create 1 collection', requirement: 1, type: 'list' },
  { id: 'curator', title: 'Curator', tier: 'Silver', description: 'Create 5 collections', requirement: 5, type: 'list' },
];

export async function checkAndUnlockAchievements(userId: string) {
  const [logCount, reviewCount, followCount, listCount] = await Promise.all([
    prisma.filmLog.count({ where: { userId } }),
    prisma.review.count({ where: { userId, isPublished: true } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.list.count({ where: { userId } }),
  ]);

  const counts: Record<string, number> = {
    log: logCount,
    review: reviewCount,
    follow: followCount,
    list: listCount,
  };

  const unlockedIds: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    const currentProgress = counts[achievement.type] || 0;
    
    // Attempt to upsert
    const userAch = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });

    if (!userAch) {
      const isUnlocked = currentProgress >= achievement.requirement;
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: currentProgress,
          unlockedAt: isUnlocked ? new Date() : null,
        },
      });

      if (isUnlocked) {
        unlockedIds.push(achievement.id);
        
        // Ensure achievement actually exists in DB for foreign keys if seeded.
        // Assuming seeded.
        
        // Create Notification
        try {
          await prisma.notification.create({
            data: {
              recipientId: userId,
              actorId: userId,
              type: 'mention',
              entityType: 'achievement',
              entityId: achievement.id,
            },
          });
        } catch (e) {
          console.error('Failed to create notification', e);
        }
      }
    } else {
      // Update progress if not unlocked
      if (!userAch.unlockedAt) {
        const isUnlocked = currentProgress >= achievement.requirement;
        await prisma.userAchievement.update({
          where: { id: userAch.id },
          data: {
            progress: currentProgress,
            unlockedAt: isUnlocked ? new Date() : null,
          },
        });

        if (isUnlocked) {
          unlockedIds.push(achievement.id);
          try {
            await prisma.notification.create({
              data: {
                recipientId: userId,
                actorId: userId,
                type: 'mention',
                entityType: 'achievement',
                entityId: achievement.id,
              },
            });
          } catch(e) {
            console.error('Failed to create notification', e);
          }
        }
      }
    }
  }
  
  return unlockedIds;
}

// GET /api/v1/achievements/
router.get('/', async (_req, res, next) => {
  try {
    // Return seeded list
    res.json({ data: ACHIEVEMENTS });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/achievements/me
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.user!.id },
    });

    const data = ACHIEVEMENTS.map(ach => {
      const userAch = userAchievements.find(ua => ua.achievementId === ach.id);
      return {
        ...ach,
        progress: userAch?.progress || 0,
        unlockedAt: userAch?.unlockedAt || null,
      };
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/achievements/check
router.post('/check', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const unlocked = await checkAndUnlockAchievements(req.user!.id);
    res.json({ data: { unlocked } });
  } catch (err) {
    next(err);
  }
});

export default router;
