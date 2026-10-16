'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { TrailerModal } from './TrailerModal';
import type { TMDBWatchProviderCountry, TMDBWatchProvider } from '@/lib/tmdb/client';

interface WhereToWatchCardProps {
  providers: Record<string, TMDBWatchProviderCountry>;
  movieTitle: string;
  trailerKey?: string | null;
}

const COMMON_COUNTRIES = [
  { code: 'US', name: 'US' },
  { code: 'IN', name: 'IN' },
  { code: 'GB', name: 'UK' },
  { code: 'CA', name: 'CA' },
  { code: 'AU', name: 'AU' },
  { code: 'DE', name: 'DE' },
  { code: 'FR', name: 'FR' },
];

export function WhereToWatchCard({
  providers = {},
  movieTitle,
  trailerKey,
}: WhereToWatchCardProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const availableCodes = Object.keys(providers);
  const defaultCountry = availableCodes.includes('US')
    ? 'US'
    : availableCodes.includes('IN')
    ? 'IN'
    : availableCodes[0] || 'US';

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const countryData = providers[selectedCountry];
  const streamProviders: TMDBWatchProvider[] = countryData?.flatrate || [];
  const rentProviders: TMDBWatchProvider[] = countryData?.rent || [];
  const buyProviders: TMDBWatchProvider[] = countryData?.buy || [];
  const hasStreaming = streamProviders.length > 0;
  const justWatchLink =
    countryData?.link ||
    `https://www.justwatch.com/us/search?q=${encodeURIComponent(movieTitle)}`;

  return (
    <>
      <div className="bg-[#131A22] border border-[#273442] rounded-2xl p-4 space-y-3 shadow-md">
        {/* Header row: WHERE TO WATCH + Trailer Button */}
        <div className="flex items-center justify-between gap-2 border-b border-[#273442]/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#9AA8B7] uppercase tracking-[0.14em]">
              Where to Watch
            </span>
            {availableCodes.length > 1 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-[#1A2430] border border-[#273442] text-[10px] text-[#F4F3EC] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#35D6A0]"
                aria-label="Select streaming country"
              >
                {COMMON_COUNTRIES.filter((c) => availableCodes.includes(c.code)).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
                {availableCodes
                  .filter((c) => !COMMON_COUNTRIES.some((cc) => cc.code === c))
                  .slice(0, 10)
                  .map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {trailerKey && (
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A2430] hover:bg-[#222E3D] text-[#35D6A0] hover:text-[#6BE8BC] border border-[#273442] hover:border-[#35D6A0]/40 rounded-lg text-xs font-bold transition-all group"
              aria-label="Watch movie trailer"
            >
              <Play size={11} className="fill-current group-hover:scale-110 transition-transform" />
              <span>Trailer</span>
            </button>
          )}
        </div>

        {/* Content body */}
        <div>
          {hasStreaming ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {streamProviders.slice(0, 5).map((p) => (
                  <a
                    key={p.provider_id}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group block rounded-lg overflow-hidden border border-[#273442] hover:border-[#35D6A0] transition-colors"
                    title={`Stream on ${p.provider_name}`}
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                      alt={p.provider_name}
                      width={34}
                      height={34}
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <a
                  href={justWatchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#35D6A0] hover:underline flex items-center gap-1"
                >
                  All services... <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#9AA8B7]/60 font-semibold tracking-wider">
                  via JustWatch
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-1">
              <p className="text-xs text-[#9AA8B7]">
                Not streaming in {selectedCountry}.
              </p>
              {rentProviders.length > 0 || buyProviders.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#9AA8B7] uppercase font-bold mr-1">
                    Rent/Buy:
                  </span>
                  {[...rentProviders, ...buyProviders]
                    .filter((p, i, a) => a.findIndex((x) => x.provider_id === p.provider_id) === i)
                    .slice(0, 4)
                    .map((p) => (
                      <div
                        key={p.provider_id}
                        className="w-6 h-6 rounded overflow-hidden border border-[#273442]"
                        title={p.provider_name}
                      >
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                          alt={p.provider_name}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              ) : null}
              <div className="flex items-center justify-between pt-1">
                <a
                  href={justWatchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#35D6A0] hover:underline flex items-center gap-1"
                >
                  All services... <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#9AA8B7]/60 font-semibold tracking-wider">
                  via JustWatch
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {trailerKey && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerKey={trailerKey}
          title={`${movieTitle} — Trailer`}
        />
      )}
    </>
  );
}
