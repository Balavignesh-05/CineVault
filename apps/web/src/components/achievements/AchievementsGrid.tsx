'use client';

import React, { useState } from 'react';
import { Achievement, UserAchievement } from '@cinevault/shared-types';
import { AchievementProgress } from './AchievementProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AchievementsGridProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

export function AchievementsGrid({ achievements, userAchievements }: AchievementsGridProps) {
  const [activeTab, setActiveTab] = useState('ALL');

  const categories = ['ALL', 'WATCHING', 'SOCIAL', 'REVIEWS', 'COLLECTIONS'];

  const filtered = activeTab === 'ALL' 
    ? achievements 
    : achievements.filter(a => a.category === activeTab);

  const getUA = (achId: string) => 
    userAchievements.find(ua => ua.achievementId === achId) || {
      userId: '',
      achievementId: achId,
      progress: 0,
      unlockedAt: null
    } as UserAchievement;

  return (
    <div className="w-full">
      <Tabs defaultValue="ALL" onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <TabsList className="w-auto flex">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat.toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(ach => (
                <AchievementProgress key={ach.id} achievement={ach} userAchievement={getUA(ach.id)} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                No achievements found in this category.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
