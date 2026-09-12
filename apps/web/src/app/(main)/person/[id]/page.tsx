import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, Calendar, MapPin, Film, Tv, Star, Award, 
  ArrowLeft, AlertCircle, Clapperboard, BookOpen, ChevronRight 
} from 'lucide-react';
import { getPersonDetails, normalizeMovieCard, normalizeSeriesCard } from '@/lib/tmdb/client';
import { MediaCard } from '@/components/media/MediaCard';
import { PersonSortDropdown } from '@/components/person/PersonSortDropdown';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PersonDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const personId = Number(id);
  const resolvedSearchParams = await searchParams;
  const sortBy = (resolvedSearchParams.sort as string) || 'popularity_desc';

  if (isNaN(personId)) {
    return (
      <div className="min-h-screen bg-background py-16 text-center text-text-muted">
        Invalid person ID.
      </div>
    );
  }

  let person: any = null;
  let errorMsg: string | null = null;

  try {
    person = await getPersonDetails(personId);
  } catch (err: any) {
    errorMsg = err?.message || 'Failed to fetch person details from TMDB.';
  }

  if (errorMsg || !person) {
    return (
      <div className="min-h-screen bg-background py-12 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-error mx-auto opacity-80" />
          <h1 className="text-2xl font-bold">Person Profile Not Found</h1>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {errorMsg || 'We could not find details for this person on TMDB.'}
          </p>
          <Link
            href="/discovery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={14} /> Return to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
    : null;

  const rawCast = person.combined_credits?.cast || [];
  const rawCrew = person.combined_credits?.crew || [];

  // Helper to deduplicate credits by ID
  const dedupe = (items: any[]) => {
    const seen = new Set<number>();
    return items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const sortCredits = (credits: any[]) => {
    return credits.sort((a, b) => {
      if (sortBy === 'date_desc') {
        const dateA = a.releaseYear || 0;
        const dateB = b.releaseYear || 0;
        return dateB - dateA;
      }
      if (sortBy === 'date_asc') {
        const dateA = a.releaseYear || 9999;
        const dateB = b.releaseYear || 9999;
        return dateA - dateB;
      }
      if (sortBy === 'rating_desc') {
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      }
      // default: popularity_desc
      return (b.popularity || 0) - (a.popularity || 0);
    });
  };

  // Movie Acting Credits
  const movieActingRaw = dedupe(rawCast.filter((c: any) => c.media_type === 'movie' || (!c.media_type && c.title)));
  const movieActing = sortCredits(movieActingRaw.map(normalizeMovieCard));

  // TV Acting Credits
  const tvActingRaw = dedupe(rawCast.filter((c: any) => c.media_type === 'tv' || (!c.media_type && c.name && !c.title)));
  const tvActing = sortCredits(tvActingRaw.map(normalizeSeriesCard));

  // Directing Credits
  const directingRaw = dedupe(rawCrew.filter((c: any) => c.job === 'Director'));
  const directing = sortCredits(directingRaw.map((c: any) => 
    c.media_type === 'tv' ? normalizeSeriesCard(c) : normalizeMovieCard(c)
  ));

  // Writing Credits
  const writingRaw = dedupe(rawCrew.filter((c: any) => ['Writer', 'Screenplay', 'Story', 'Author'].includes(c.job || '')));
  const writing = sortCredits(writingRaw.map((c: any) => 
    c.media_type === 'tv' ? normalizeSeriesCard(c) : normalizeMovieCard(c)
  ));

  // Production & Other Crew Credits
  const crewOtherRaw = dedupe(rawCrew.filter((c: any) => 
    !['Director', 'Writer', 'Screenplay', 'Story', 'Author'].includes(c.job || '')
  ));
  const crewOther = sortCredits(crewOtherRaw.map((c: any) => 
    c.media_type === 'tv' ? normalizeSeriesCard(c) : normalizeMovieCard(c)
  ));

  // Calculate age if birthday is present
  const getAge = (birthday: string, deathday?: string | null) => {
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = person.birthday ? getAge(person.birthday, person.deathday) : null;

  const genderText = person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : person.gender === 3 ? 'Non-binary' : null;

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        
        {/* Back Link */}
        <Link
          href="/discovery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Discover
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Image */}
          <div className="w-44 sm:w-52 md:w-64 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden bg-surface border border-border-subtle shadow-2xl relative mx-auto md:mx-0">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={person.name}
                fill
                sizes="(max-width: 768px) 208px, 256px"
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted p-4 text-center bg-surface">
                <User className="w-16 h-16 opacity-30 mb-2" />
                <span className="text-xs font-semibold">{person.name}</span>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                {person.known_for_department && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-xs uppercase tracking-wider">
                    {person.known_for_department}
                  </span>
                )}
                {person.popularity > 0 && (
                  <span className="px-3 py-1 rounded-full bg-surface border border-border-subtle text-text-muted text-xs font-mono flex items-center gap-1">
                    <Star size={11} className="text-accent-amber fill-accent-amber" />
                    Popularity: {Math.round(person.popularity)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {person.name}
              </h1>
            </div>

            {/* Quick Metadata */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-xs text-text-muted border-y border-border-subtle py-3">
              {person.birthday && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  <span>
                    Born: {person.birthday} {age !== null && !person.deathday && `(Age ${age})`}
                  </span>
                </div>
              )}
              {person.deathday && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-error" />
                  <span>Died: {person.deathday} (Aged {age})</span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
              {genderText && (
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  <span>{genderText}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Film size={14} className="text-primary" />
                <span>{movieActing.length + tvActing.length + directing.length + writing.length} Known Credits</span>
              </div>
            </div>

            {/* Biography */}
            {person.biography ? (
              <div className="space-y-2 pt-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                  <BookOpen size={14} className="text-primary" /> Biography
                </h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed whitespace-pre-line max-w-3xl">
                  {person.biography}
                </p>
              </div>
            ) : (
              <p className="text-xs italic text-text-muted">
                No detailed biography is currently available for {person.name} on TMDB.
              </p>
            )}
          </div>
        </div>

        {/* Filmography Sections */}
        <div className="space-y-10 pt-6 border-t border-border-subtle">
          <div className="flex justify-end">
            <Suspense fallback={null}>
              <PersonSortDropdown />
            </Suspense>
          </div>

          {/* Movies Acting */}
          {movieActing.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Film size={20} className="text-primary" />
                  Feature Films ({movieActing.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {movieActing.map((movie) => (
                  <MediaCard key={`movie-acting-${movie.id}`} media={movie} />
                ))}
              </div>
            </section>
          )}


          {/* Directing */}
          {directing.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Clapperboard size={20} className="text-primary" />
                  Directing ({directing.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {directing.map((item) => (
                  <MediaCard key={`directing-${item.id}`} media={item} />
                ))}
              </div>
            </section>
          )}

          {/* Writing */}
          {writing.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Award size={20} className="text-primary" />
                  Writing & Screenplay ({writing.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {writing.map((item) => (
                  <MediaCard key={`writing-${item.id}`} media={item} />
                ))}
              </div>
            </section>
          )}

          {/* Other Crew Credits */}
          {crewOther.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Producing & Crew ({crewOther.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {crewOther.map((item) => (
                  <MediaCard key={`crew-${item.id}`} media={item} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
