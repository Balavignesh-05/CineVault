import { Tag } from 'lucide-react';
import Link from 'next/link';

interface Keyword {
  id: number;
  name: string;
}

interface KeywordsSectionProps {
  keywords: Keyword[];
}

export function KeywordsSection({ keywords }: KeywordsSectionProps) {
  if (!keywords || keywords.length === 0) return null;
  
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Tag className="text-text-secondary" size={18} />
        Keywords
      </h2>
      <div className="flex flex-wrap gap-2">
        {keywords.slice(0, 20).map(kw => (
          <Link
            key={kw.id}
            href={`/search?q=${encodeURIComponent(kw.name)}`}
            className="px-3 py-1 rounded-lg bg-surface border border-border-subtle hover:border-primary/50 hover:text-primary text-xs text-text-secondary transition-all"
          >
            {kw.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
