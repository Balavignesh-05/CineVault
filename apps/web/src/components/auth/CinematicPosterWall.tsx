'use client';

import React from 'react';
import Image from 'next/image';

// Curated selection of iconic film posters via TMDB paths for fast, seamless rolling
const ROW_1 = [
  { id: 550, title: 'Fight Club', path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
  { id: 27205, title: 'Inception', path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
  { id: 157336, title: 'Interstellar', path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { id: 155, title: 'The Dark Knight', path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { id: 680, title: 'Pulp Fiction', path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { id: 129, title: 'Spirited Away', path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
  { id: 496243, title: 'Parasite', path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { id: 603, title: 'The Matrix', path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
];

const ROW_2 = [
  { id: 438631, title: 'Dune', path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
  { id: 244786, title: 'Whiplash', path: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg' },
  { id: 335984, title: 'Blade Runner 2049', path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
  { id: 324857, title: 'Spider-Man: Into the Spider-Verse', path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg' },
  { id: 278, title: 'The Shawshank Redemption', path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
  { id: 769, title: 'Goodfellas', path: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
  { id: 807, title: 'Seven', path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg' },
  { id: 13, title: 'Forrest Gump', path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg' },
];

const ROW_3 = [
  { id: 872585, title: 'Oppenheimer', path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { id: 120, title: 'The Lord of the Rings', path: '/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg' },
  { id: 238, title: 'The Godfather', path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { id: 429, title: 'The Good, the Bad and the Ugly', path: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg' },
  { id: 37799, title: 'The Social Network', path: '/n0ybibhJtQ5icDqTpTzbRytNDPx.jpg' },
  { id: 11, title: 'Star Wars', path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
  { id: 77338, title: 'The Intouchables', path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg' },
  { id: 597, title: 'Titanic', path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },
];

const ROW_4 = [
  { id: 693134, title: 'Dune: Part Two', path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { id: 105, title: 'Back to the Future', path: '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg' },
  { id: 1891, title: 'The Empire Strikes Back', path: '/nNAeTmF4nnKjqSsrni89KrAaAc1.jpg' },
  { id: 299536, title: 'Avengers: Infinity War', path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' },
  { id: 569094, title: 'Across the Spider-Verse', path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
  { id: 372058, title: 'Your Name.', path: '/q719jXXEzOoYaps6qFsC8llRaQ.jpg' },
  { id: 313369, title: 'La La Land', path: '/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg' },
  { id: 157336, title: 'Interstellar', path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
];

function PosterRow({
  items,
  direction = 'left',
}: {
  items: typeof ROW_1;
  direction?: 'left' | 'right';
}) {
  // Duplicate array once for seamless continuous loop
  const duplicated = [...items, ...items];

  return (
    <div className="flex w-full overflow-hidden select-none pointer-events-none py-1.5 opacity-25 hover:opacity-30 transition-opacity">
      <div
        className={`flex shrink-0 items-center gap-3.5 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
        style={{ width: 'max-content' }}
      >
        {duplicated.map((poster, index) => (
          <div
            key={`${poster.id}-${index}`}
            className="relative w-[110px] sm:w-[135px] md:w-[150px] aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-[#131A22] border border-[#273442]/50 shadow-md"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w185${poster.path}`}
              alt={poster.title}
              fill
              sizes="(max-width: 640px) 110px, (max-width: 768px) 135px, 150px"
              className="object-cover filter contrast-[1.05]"
              loading="lazy"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CinematicPosterWall() {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#0B0F14]"
      aria-hidden="true"
    >
      {/* ── Rotating Rolling Poster Matrix ────────────────────────── */}
      <div className="absolute -inset-x-20 -inset-y-10 flex flex-col justify-center -rotate-2 scale-105">
        <PosterRow items={ROW_1} direction="left" />
        <PosterRow items={ROW_2} direction="right" />
        <PosterRow items={ROW_3} direction="left" />
        <PosterRow items={ROW_4} direction="right" />
      </div>

      {/* ── Cinematic Dark Overlays ─────────────────────────────────── */}
      {/* Full-screen Dark Tint */}
      <div className="absolute inset-0 bg-[#0B0F14]/75 backdrop-blur-[2px]" />

      {/* Radial Vignette: keeps center legible for the card */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(11, 15, 20, 0.55) 0%, rgba(11, 15, 20, 0.90) 65%, #0B0F14 100%)',
        }}
      />

      {/* Top & Bottom Bleeds */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0F14] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0F14] to-transparent" />

      {/* Subtle Central Jade Aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(53, 214, 160, 0.07), transparent 60%)',
        }}
      />
    </div>
  );
}
