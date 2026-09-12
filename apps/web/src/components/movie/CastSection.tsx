import Image from 'next/image';
import Link from 'next/link';
import { TMDBCastMember, TMDBCrewMember } from '@/lib/tmdb/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CastSectionProps {
  cast: TMDBCastMember[];
  director: TMDBCrewMember | null;
}

export function CastSection({ cast }: CastSectionProps) {
  const topCast = cast.slice(0, 15);

  if (topCast.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Top Cast</h2>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex w-max space-x-4">
          {topCast.map((member) => (
            <Link href={`/person/${member.id}`} key={member.id} className="w-[140px] flex flex-col group cursor-pointer">
              <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-bg-surface)] border border-[#3D3D55] mb-3 transition-transform group-hover:scale-105">
                {member.profile_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground opacity-50">
                      {member.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors" title={member.name}>
                {member.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate italic mt-0.5" title={member.character}>
                {member.character}
              </p>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-[#3D3D55]/30 hover:bg-[#3D3D55]" />
      </ScrollArea>
    </section>
  );
}
