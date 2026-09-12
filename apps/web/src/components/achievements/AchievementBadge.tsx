'use client';

import React from 'react';
import { Achievement, UserAchievement } from '@cinevault/shared-types';
import * as LucideIcons from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, userAchievement, size = 'md' }: AchievementBadgeProps) {
  const isUnlocked = !!userAchievement && userAchievement.unlockedAt !== null;
  
  // Icon resolution
  const IconComponent = (LucideIcons as any)[achievement.iconName] || LucideIcons.Award;
  
  // Tier colors
  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'from-amber-700 to-amber-500 text-white';
      case 'SILVER': return 'from-slate-400 to-slate-200 text-slate-900';
      case 'GOLD': return 'from-yellow-500 to-yellow-300 text-yellow-900';
      case 'DIAMOND': return 'from-cyan-400 to-blue-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]';
      default: return 'from-slate-700 to-slate-500 text-white';
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12 p-2',
    md: 'w-16 h-16 p-3',
    lg: 'w-24 h-24 p-5'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <div className={`
              relative rounded-full flex items-center justify-center
              ${sizeClasses[size]}
              ${isUnlocked ? `bg-gradient-to-br ${getTierColors(achievement.tier)}` : 'bg-bg-elevated border-2 border-border-subtle opacity-50 grayscale'}
              transition-transform hover:scale-105
            `}>
              <IconComponent className={`${iconSizes[size]} ${isUnlocked ? '' : 'text-text-muted'}`} />
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <LucideIcons.Lock className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            {size !== 'sm' && (
              <span className={`text-xs font-semibold text-center max-w-[100px] leading-tight ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                {achievement.title}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-center">
          <p className="font-bold mb-1">{achievement.title}</p>
          <p className="text-xs text-text-muted mb-2">{achievement.description}</p>
          {isUnlocked && userAchievement.unlockedAt ? (
            <p className="text-xs text-accent-primary">
              Unlocked on {format(new Date(userAchievement.unlockedAt), 'MMM d, yyyy')}
            </p>
          ) : (
            <p className="text-xs font-medium text-text-muted">
              Progress: {userAchievement?.progress || 0} / {achievement.requirement}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
