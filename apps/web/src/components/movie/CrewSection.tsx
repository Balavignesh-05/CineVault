import Link from 'next/link';
import Image from 'next/image';
import { Clapperboard } from 'lucide-react';

interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

interface CrewSectionProps {
  crew: CrewMember[];
}

const FEATURED_JOBS = [
  { label: 'Director', jobs: ['Director'] },
  { label: 'Screenplay', jobs: ['Screenplay', 'Writer', 'Story', 'Author'] },
  { label: 'Cinematography', jobs: ['Director of Photography', 'Cinematography'] },
  { label: 'Music', jobs: ['Original Music Composer', 'Music'] },
  { label: 'Producer', jobs: ['Producer', 'Executive Producer'] },
  { label: 'Editor', jobs: ['Editor'] },
  { label: 'Production Design', jobs: ['Production Design', 'Art Direction'] },
];

export function CrewSection({ crew }: CrewSectionProps) {
  const featured = FEATURED_JOBS.map(group => ({
    ...group,
    members: crew
      .filter(c => group.jobs.includes(c.job))
      .filter((c, i, a) => a.findIndex(x => x.id === c.id) === i)
      .slice(0, 2),
  })).filter(g => g.members.length > 0);

  if (featured.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Clapperboard className="text-[#40bcf4]" size={22} /> Crew
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {featured.map(group =>
          group.members.map(member => (
            <Link
              key={`${group.label}-${member.id}`}
              href={`/person/${member.id}`}
              className="group flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-subtle hover:border-[#3d4a56] transition-all"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-elevated shrink-0">
                {member.profile_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w45${member.profile_path}`}
                    alt={member.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted text-sm font-bold">
                    {member.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">{member.name}</p>
                <p className="text-[10px] text-text-muted">{group.label}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
