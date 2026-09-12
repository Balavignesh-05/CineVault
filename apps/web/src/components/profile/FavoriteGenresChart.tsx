'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export interface GenreWatchedPoint {
  genre: string;
  count: number;
}

interface FavoriteGenresChartProps {
  genres: GenreWatchedPoint[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1'];

export function FavoriteGenresChart({ genres }: FavoriteGenresChartProps) {
  if (!genres || genres.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-text-muted">No genre data available</div>;
  }

  // Take top 8
  const data = genres.sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="count"
            nameKey="genre"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
