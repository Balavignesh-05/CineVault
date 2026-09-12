'use client';

import React from 'react';
import { Achievement, UserAchievement } from '@cinevault/shared-types';
import { AchievementBadge } from './AchievementBadge';
import { motion } from 'framer-motion';

interface AchievementProgressProps {
  achievement: Achievement;
  userAchievement: UserAchievement;
}

export function AchievementProgress({ achievement, userAchievement }: AchievementProgressProps) {
  const isUnlocked = !!userAchievement.unlockedAt;
  const progress = isUnlocked ? achievement.requirement : Math.min(userAchievement.progress, achievement.requirement);
  const percentage = Math.min(100, (progress / achievement.requirement) * 100);

  return (
    <div className="flex items-center gap-4 p-4 border border-border-subtle bg-bg-surface rounded-lg">
      <AchievementBadge achievement={achievement} userAchievement={userAchievement} size="sm" />
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-2">
          <h4 className="font-semibold text-sm truncate">{achievement.title}</h4>
          <span className="text-xs text-text-muted shrink-0">
            {progress} / {achievement.requirement}
          </span>
        </div>
        
        <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${isUnlocked ? 'bg-success' : 'bg-accent-primary'}`}
          />
        </div>
      </div>
    </div>
  );
}
