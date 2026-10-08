import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User } from 'lucide-react';
import { getPopularPeople } from '@/lib/tmdb/client';

export async function PeopleRail() {
  const data = await getPopularPeople(1).catch(() => ({ results: [] }));
  const people = (data.results || []).slice(0, 16);

  if (!people || people.length === 0) return null;

  return (
    <section className="py-4 md:py-6 w-full">
      <div className="container space-y-4 max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Popular People
            </h2>
            <p className="text-text-muted font-medium text-xs">
              Trending actors, directors and creative minds
            </p>
          </div>
          
          <Link 
            href="/person"
            className="group flex items-center gap-1 text-xs font-semibold text-primary hover:text-white transition-colors"
          >
            See all
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Circular Profiles Horizontal Rail */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {people.map((person: any) => {
            const profileUrl = person.profile_path
              ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
              : null;

            return (
              <Link
                key={person.id}
                href={`/person/${person.id}`}
                className="flex flex-col items-center shrink-0 w-24 sm:w-28 group text-center"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-surface border-2 border-white/10 group-hover:border-primary group-hover:shadow-[0_0_16px_rgba(0,224,84,0.3)] transition-all duration-300 mb-2.5">
                  {profileUrl ? (
                    <Image
                      src={profileUrl}
                      alt={person.name}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface text-text-muted">
                      <User size={28} />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-1 w-full">
                  {person.name}
                </span>
                <span className="text-[10px] text-text-muted font-medium line-clamp-1">
                  {person.known_for_department || 'Acting'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
