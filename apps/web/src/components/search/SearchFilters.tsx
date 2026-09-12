'use client';

import { TMDBGenre } from '@/lib/tmdb/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFiltersProps {
  genres: TMDBGenre[];
  filters: {
    genre?: number;
    year?: number;
    language?: string;
    sortBy: string;
    ratingMin?: number;
    ratingMax?: number;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularity (Desc)' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.asc', label: 'Oldest' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'vote_count.desc', label: 'Most Votes' },
];

export function SearchFilters({ genres, filters, onFilterChange, onReset }: SearchFiltersProps) {
  const activeCount = [
    filters.genre, 
    filters.year, 
    filters.language, 
    filters.ratingMin !== undefined && filters.ratingMin > 0 ? true : undefined,
    filters.sortBy !== 'popularity.desc' ? true : undefined
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-[var(--color-bg-surface)] border border-[#3D3D55] rounded-xl p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <SlidersHorizontal className="w-5 h-5 text-[var(--color-accent-primary)]" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/90">
              {activeCount}
            </Badge>
          )}
        </div>
        
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-medium">Sort By</label>
          <Select value={filters.sortBy} onValueChange={(val) => onFilterChange('sortBy', val)}>
            <SelectTrigger className="bg-[var(--color-bg-base)] border-[#3D3D55]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-medium">Genre</label>
          <Select value={filters.genre?.toString() || ''} onValueChange={(val) => onFilterChange('genre', parseInt(val))}>
            <SelectTrigger className="bg-[var(--color-bg-base)] border-[#3D3D55]">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-medium">Release Year</label>
          <Input 
            type="number" 
            min="1900" 
            max="2025" 
            placeholder="e.g. 2023"
            value={filters.year || ''}
            onChange={(e) => onFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
            className="bg-[var(--color-bg-base)] border-[#3D3D55]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-medium">Language</label>
          <Select value={filters.language || ''} onValueChange={(val) => onFilterChange('language', val)}>
            <SelectTrigger className="bg-[var(--color-bg-base)] border-[#3D3D55]">
              <SelectValue placeholder="Any Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Language</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground font-medium">Min Rating</label>
            <span className="text-sm text-foreground">{filters.ratingMin || 0}+</span>
          </div>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[filters.ratingMin || 0]}
            onValueChange={([val]) => onFilterChange('ratingMin', val)}
            className="[&_[role=slider]]:bg-[var(--color-accent-primary)] [&_[role=slider]]:border-[var(--color-accent-primary)] [&_.bg-primary]:bg-[var(--color-accent-primary)]"
          />
        </div>
      </div>
    </div>
  );
}
