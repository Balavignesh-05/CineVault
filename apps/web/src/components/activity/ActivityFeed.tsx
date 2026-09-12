'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ActivityEvent } from '@cinevault/shared-types';
import { ActivityItem } from './ActivityItem';
import { motion } from 'framer-motion';

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
}

export function ActivityFeed({ userId, limit = 20 }: ActivityFeedProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['activity', { userId, limit }],
    queryFn: () => {
      const endpoint = userId ? `/activity?userId=${userId}` : '/activity/feed';
      return api.get<ActivityEvent[]>(`${endpoint}${userId ? '&' : '?'}limit=${limit}`);
    }
  });

  if (isLoading) {
    return (
      <div className="relative pl-6 space-y-6">
        <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-border-subtle" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-bg-surface rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted bg-bg-surface rounded-lg border border-border-subtle">
        No recent activity found.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8">
      {/* Timeline line */}
      <div className="absolute left-[20px] sm:left-[28px] top-6 bottom-0 w-0.5 bg-border-subtle -z-10" />
      
      <div className="flex flex-col gap-6">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[27px] sm:-left-[35px] top-5 w-3 h-3 rounded-full bg-accent-primary border-2 border-bg-base z-10" />
            <ActivityItem event={event} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
