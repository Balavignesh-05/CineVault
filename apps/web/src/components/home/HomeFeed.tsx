'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Flame } from 'lucide-react';

export function HomeFeed() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-primary" size={24} />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">New From Friends</h2>
      </div>
      <div className="bg-[#1a1e24] p-6 rounded-xl border border-border-subtle">
        <ActivityFeed limit={10} />
      </div>
    </div>
  );
}
