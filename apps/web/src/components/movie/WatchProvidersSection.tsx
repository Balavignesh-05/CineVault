'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tv2, ShoppingCart, Download, Globe, ExternalLink } from 'lucide-react';
import type { TMDBWatchProviderCountry, TMDBWatchProvider } from '@/lib/tmdb/client';

interface WatchProvidersSectionProps {
  providers: Record<string, TMDBWatchProviderCountry>;
  movieTitle: string;
}

const POPULAR_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
];

function ProviderLogo({ provider }: { provider: TMDBWatchProvider }) {
  return (
    <div className="relative group">
      <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-[#00e054]/50 transition-all cursor-default shadow-lg">
        <Image
          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
          alt={provider.provider_name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface border border-border-subtle rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
        {provider.provider_name}
      </div>
    </div>
  );
}

function ProviderGroup({ title, providers, icon }: { title: string; providers: TMDBWatchProvider[]; icon: React.ReactNode }) {
  if (!providers || providers.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.map(p => (
          <ProviderLogo key={p.provider_id} provider={p} />
        ))}
      </div>
    </div>
  );
}

export function WatchProvidersSection({ providers, movieTitle }: WatchProvidersSectionProps) {
  const availableCountries = Object.keys(providers);
  
  const defaultCountry = availableCountries.includes('US') ? 'US'
    : availableCountries.includes('IN') ? 'IN'
    : availableCountries[0] || 'US';
    
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  
  const countryData = providers[selectedCountry];
  const hasAnyProviders = countryData && (
    (countryData.flatrate && countryData.flatrate.length > 0) ||
    (countryData.rent && countryData.rent.length > 0) ||
    (countryData.buy && countryData.buy.length > 0)
  );
  
  const displayCountries = POPULAR_COUNTRIES.filter(c => availableCountries.includes(c.code));
  const otherCountries = availableCountries
    .filter(c => !POPULAR_COUNTRIES.find(p => p.code === c))
    .map(c => ({ code: c, name: c }));
  const allCountries = [...displayCountries, ...otherCountries];

  if (availableCountries.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tv2 className="text-primary" size={22} />
          Where to Watch
        </h2>
        
        {/* Country selector */}
        <select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border-subtle text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          {allCountries.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-5">
        {hasAnyProviders ? (
          <>
            <ProviderGroup
              title="Stream"
              providers={countryData?.flatrate || []}
              icon={<Tv2 size={13} className="text-primary" />}
            />
            <ProviderGroup
              title="Rent"
              providers={countryData?.rent || []}
              icon={<Download size={13} className="text-[#40bcf4]" />}
            />
            <ProviderGroup
              title="Buy"
              providers={countryData?.buy || []}
              icon={<ShoppingCart size={13} className="text-accent-amber" />}
            />
            
            {countryData?.link && (
              <a
                href={countryData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-primary transition-colors mt-2"
              >
                <ExternalLink size={12} />
                View on JustWatch
              </a>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-4 gap-3 text-center">
            <Globe size={32} className="text-[#2c3440]" />
            <div>
              <p className="text-sm text-text-secondary font-medium">Not available in {POPULAR_COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry}</p>
              <p className="text-xs text-text-muted mt-1">Try selecting a different country or check JustWatch</p>
            </div>
            <a
              href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(movieTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink size={11} /> Search on JustWatch
            </a>
          </div>
        )}
      </div>
    </motion.section>
  );
}
