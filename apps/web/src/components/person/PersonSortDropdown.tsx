'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PersonSortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'popularity_desc';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Sort By</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] bg-surface border-border-subtle text-xs font-semibold">
          <SelectValue placeholder="Sort order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popularity_desc">Popularity (High to Low)</SelectItem>
          <SelectItem value="date_desc">Release Date (Newest)</SelectItem>
          <SelectItem value="date_asc">Release Date (Oldest)</SelectItem>
          <SelectItem value="rating_desc">Average Rating (Highest)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
