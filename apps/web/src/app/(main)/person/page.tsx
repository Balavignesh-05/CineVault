import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, TrendingUp } from 'lucide-react';

export const revalidate = 3600;

async function getPopularPeople() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/person/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { results: [] };
    return res.json();
  } catch {
    return { results: [] };
  }
}

export default async function PeoplePage() {
  const data = await getPopularPeople();
  const people = data.results || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-12">
      {/* Header */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-surface/60 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Popular People</h1>
              <p className="text-sm text-text-muted">Actors, directors and crew members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Trending This Week</h2>
        </div>

        {people.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Could not load people. Check your TMDB API key.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {people.map((person: any) => (
              <Link
                key={person.id}
                href={`/person/${person.id}`}
                className="group block"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface mb-2">
                  {person.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${person.profile_path}`}
                      alt={person.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#252a33]">
                      <Users className="text-text-muted opacity-40" size={36} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">
                  {person.name}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {person.known_for_department}
                </p>
                {person.known_for?.length > 0 && (
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {person.known_for[0]?.title || person.known_for[0]?.name}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
