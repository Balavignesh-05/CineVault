'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Film } from 'lucide-react';

// Curated selection of iconic, recognizable film posters with accurate TMDB paths
const ROW_1 = [
  { id: 27205, title: 'Inception', path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
  { id: 157336, title: 'Interstellar', path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { id: 475557, title: 'Joker', path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg' },
  { id: 155, title: 'The Dark Knight', path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { id: 680, title: 'Pulp Fiction', path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { id: 872585, title: 'Oppenheimer', path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { id: 496243, title: 'Parasite', path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { id: 129, title: 'Spirited Away', path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
];

const ROW_2 = [
  { id: 414906, title: 'The Batman', path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg' },
  { id: 438631, title: 'Dune', path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
  { id: 693134, title: 'Dune: Part Two', path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { id: 335984, title: 'Blade Runner 2049', path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
  { id: 244786, title: 'Whiplash', path: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg' },
  { id: 324857, title: 'Spider-Man: Into the Spider-Verse', path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg' },
  { id: 569094, title: 'Across the Spider-Verse', path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
  { id: 603, title: 'The Matrix', path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
];

const ROW_3 = [
  { id: 550, title: 'Fight Club', path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
  { id: 278, title: 'The Shawshank Redemption', path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
  { id: 238, title: 'The Godfather', path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { id: 120, title: 'The Lord of the Rings', path: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
  { id: 37799, title: 'The Social Network', path: '/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg' },
  { id: 769, title: 'Goodfellas', path: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
  { id: 807, title: 'Seven', path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg' },
  { id: 13, title: 'Forrest Gump', path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
];

const ROW_4 = [
  { id: 313369, title: 'La La Land', path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg' },
  { id: 372058, title: 'Your Name.', path: '/od22ftNnyag0TTxcnJhlsu3aLoU.jpg' },
  { id: 105, title: 'Back to the Future', path: '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg' },
  { id: 1891, title: 'The Empire Strikes Back', path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg' },
  { id: 299536, title: 'Avengers: Infinity War', path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' },
  { id: 597, title: 'Titanic', path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },
  { id: 77338, title: 'The Intouchables', path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg' },
  { id: 11, title: 'Star Wars', path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
];

interface PosterItem {
  id: number;
  title: string;
  path: string;
}

function PosterCard({ poster }: { poster: PosterItem }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-[120px] sm:w-[145px] md:w-[165px] aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-[#131A22] border border-[#273442]/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      {/* Background Graceful Cinema Placeholder (shown while loading or on error) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#182029] via-[#10151c] to-[#0b0e14] text-center select-none">
        <div className="w-8 h-8 rounded-full bg-[#35D6A0]/10 border border-[#35D6A0]/25 flex items-center justify-center text-[#35D6A0] mb-2">
          <Film size={14} />
        </div>
        <span className="text-[11px] font-semibold text-[#F4F3EC]/80 line-clamp-2 leading-tight">
          {poster.title}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#9AA8B7]/60 mt-1 font-mono">
          CineVault
        </span>
      </div>

      {/* Real Poster Image (hidden on error to avoid broken image icons) */}
      {!hasError && (
        <Image
          src={`https://image.tmdb.org/t/p/w342${poster.path}`}
          alt={poster.title}
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 145px, 165px"
          className={`object-cover filter brightness-[1.08] contrast-[1.06] saturate-[1.12] transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          unoptimized
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

function PosterRow({
  items,
  direction = 'left',
}: {
  items: PosterItem[];
  direction?: 'left' | 'right';
}) {
  // Duplicate array once for seamless continuous infinite marquee
  const duplicated = [...items, ...items];

  return (
    <div className="flex flex-col w-full overflow-hidden select-none pointer-events-none py-1 opacity-90 transition-opacity">
      <div
        className={`flex shrink-0 items-center gap-3.5 sm:gap-4 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
        style={{ width: 'max-content' }}
      >
        {duplicated.map((poster, index) => (
          <PosterCard key={`${poster.id}-${index}`} poster={poster} />
        ))}
      </div>
      {/* ── Glowing Jade Shelf Accent Line under each row ────────── */}
      <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#35D6A0]/35 to-transparent mt-2 sm:mt-2.5 shadow-[0_0_10px_rgba(53,214,160,0.4)] pointer-events-none" />
    </div>
  );
}

export function CinematicPosterWall() {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#0B0F14]"
      aria-hidden="true"
      style={{ perspective: '1200px' }}
    >
      {/* ── 3D Perspective Rolling Poster Matrix ────────────────────────── */}
      <div
        className="absolute -inset-x-28 -inset-y-16 flex flex-col justify-center gap-2 origin-center"
        style={{
          transform: 'rotateX(6deg) rotateY(-10deg) rotateZ(-3deg) scale(1.15)',
          transformStyle: 'preserve-3d',
        }}
      >
        <PosterRow items={ROW_1} direction="left" />
        <PosterRow items={ROW_2} direction="right" />
        <PosterRow items={ROW_3} direction="left" />
        <PosterRow items={ROW_4} direction="right" />
      </div>

      {/* ── Focused Dark Vignette Overlay: preserves legibility behind card ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 750px 650px at 50% 50%, rgba(11, 15, 20, 0.88) 0%, rgba(11, 15, 20, 0.65) 45%, rgba(11, 15, 20, 0.35) 75%, rgba(11, 15, 20, 0.70) 100%)',
        }}
      />

      {/* ── Edge Bleeds into deep background ────────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0F14] via-[#0B0F14]/75 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/75 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0B0F14]/85 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0B0F14]/85 to-transparent pointer-events-none" />

      {/* ── Ambient Central Jade Glow ───────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(53, 214, 160, 0.12), transparent 55%)',
        }}
      />
    </div>
  );
}
