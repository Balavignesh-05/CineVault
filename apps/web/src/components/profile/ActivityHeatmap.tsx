'use client';

import { useState } from 'react';

interface HeatmapProps {
  // Pass activity data: { date: 'YYYY-MM-DD', count: number }[]
  // For now we'll use dummy data if nothing provided
  data?: { date: string; count: number }[];
}

export function ActivityHeatmap({ data = [] }: HeatmapProps) {
  // Build 52 weeks of data, each week = 7 days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // ~1 year back

  // Build lookup
  const lookup: Record<string, number> = {};
  for (const item of data) {
    lookup[item.date] = item.count;
  }

  // Generate all days
  const days: { date: string; count: number }[] = [];
  for (let i = 0; i <= 364; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: lookup[key] || 0 });
  }

  // Pad to start on Sunday
  const firstDayOfWeek = new Date(startDate).getDay();
  const padded: (typeof days[0] | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  const weeks: ((typeof days[0] | null)[])[] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return '#1c2228';
    if (count === 1) return '#00e05433';
    if (count === 2) return '#00e05466';
    if (count <= 4) return '#00e054aa';
    return '#00e054';
  };

  const totalFilms = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Activity</h3>
        <span className="text-xs text-text-muted">{totalFilms} films in the last year</span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto scrollbar-none pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}: ${day.count} film${day.count !== 1 ? 's' : ''}` : ''}
                className="w-2.5 h-2.5 rounded-[2px] transition-all hover:ring-1 hover:ring-[#00e054]/50 cursor-default"
                style={{ backgroundColor: day ? getColor(day.count) : 'transparent' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 justify-end text-[9px] text-text-muted">
        <span>Less</span>
        {[0,1,2,3,4].map(n => (
          <div key={n} className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: getColor(n) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
