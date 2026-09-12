'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DiaryEntry {
  id: string;
  watchedDate: string | null;
  movie: {
    tmdbId: number;
    title: string;
    posterUrl?: string | null;
  };
  rating: number | null;
}

interface DiaryCalendarProps {
  entries: DiaryEntry[];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function DiaryCalendar({ entries }: DiaryCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build map: 'YYYY-MM-DD' -> entries[]
  const entryMap: Record<string, DiaryEntry[]> = {};
  for (const entry of entries) {
    if (!entry.watchedDate) continue;
    const dateKey = entry.watchedDate.slice(0, 10);
    if (!entryMap[dateKey]) entryMap[dateKey] = [];
    entryMap[dateKey].push(entry);
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl bg-surface border border-border-subtle hover:bg-elevated transition-colors">
          <ChevronLeft size={16} className="text-white" />
        </button>
        <h3 className="text-lg font-black text-white">{MONTHS[month]} {year}</h3>
        <button onClick={nextMonth} className="p-2 rounded-xl bg-surface border border-border-subtle hover:bg-elevated transition-colors">
          <ChevronRight size={16} className="text-white" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-text-muted py-1 uppercase">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEntries = entryMap[dateKey] || [];
          const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
          const hasEntries = dayEntries.length > 0;

          return (
            <div
              key={day}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 border transition-all ${
                isToday
                  ? 'border-primary bg-primary/10'
                  : hasEntries
                  ? 'border-border-subtle bg-surface hover:border-primary/40'
                  : 'border-transparent'
              }`}
            >
              <span className={`text-[11px] font-bold ${
                isToday ? 'text-primary' : hasEntries ? 'text-white' : 'text-text-muted'
              }`}>{day}</span>
              {hasEntries && (
                <div className="mt-0.5 flex gap-0.5 flex-wrap justify-center">
                  {dayEntries.slice(0, 2).map((entry, i) => (
                    <Link key={i} href={`/movies/${entry.movie.tmdbId}`}>
                      {entry.movie.posterUrl ? (
                        <div className="relative w-4 h-5 rounded overflow-hidden">
                          <Image src={entry.movie.posterUrl} alt={entry.movie.title} fill sizes="16px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  ))}
                  {dayEntries.length > 2 && (
                    <span className="text-[8px] text-primary font-bold">+{dayEntries.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly summary */}
      <div className="text-sm text-text-muted text-center">
        {Object.values(entryMap).flat().length} film{Object.values(entryMap).flat().length !== 1 ? 's' : ''} watched this month
      </div>
    </div>
  );
}
