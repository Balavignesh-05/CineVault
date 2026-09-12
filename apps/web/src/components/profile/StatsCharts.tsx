'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { FavoriteGenresChart, GenreWatchedPoint } from './FavoriteGenresChart';

interface MonthlyActivity {
  month: string;
  count: number;
}

interface RatingDistribution {
  rating: string;
  count: number;
}

interface StatsChartsProps {
  monthlyActivity: MonthlyActivity[];
  ratingDistribution: RatingDistribution[];
  genres: GenreWatchedPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border-subtle p-3 rounded-lg shadow-xl">
        <p className="text-text-primary font-medium mb-1">{label}</p>
        <p className="text-accent-primary text-sm">
          {payload[0].value} {payload[0].value === 1 ? 'film' : 'films'}
        </p>
      </div>
    );
  }
  return null;
}

export function StatsCharts({ monthlyActivity, ratingDistribution, genres }: StatsChartsProps) {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Activity Chart */}
      <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle">
        <h3 className="text-lg font-semibold mb-6">Activity (Last 6 Months)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="var(--color-accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ratings Distribution */}
      <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle">
        <h3 className="text-lg font-semibold mb-6">Ratings Curve</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis dataKey="rating" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-elevated)' }} />
              <Bar dataKey="count" fill="var(--color-accent-amber)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Genres Pie Chart */}
      <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle lg:col-span-2">
        <h3 className="text-lg font-semibold mb-2">Favorite Genres</h3>
        <FavoriteGenresChart genres={genres} />
      </div>
    </div>
  );
}
