'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Film } from 'lucide-react';
import Image from 'next/image';

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  official: boolean;
}

interface TrailerSectionProps {
  videos: Video[];
  movieTitle: string;
}

export function TrailerSection({ videos, movieTitle }: TrailerSectionProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const trailers = videos.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Featurette' || v.type === 'Clip'));
  
  if (trailers.length === 0) return null;

  const officialTrailer = trailers.find(v => v.type === 'Trailer' && v.official) || trailers[0];

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
        <Film className="text-[#e50914]" size={22} />
        Videos
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {trailers.slice(0, 8).map((video) => (
          <button
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="group relative aspect-video rounded-xl overflow-hidden bg-surface border border-border-subtle hover:border-[#e50914]/50 transition-all"
          >
            <Image
              src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
              alt={video.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-[#e50914] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={16} className="text-white fill-white ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] text-white font-semibold line-clamp-1">{video.name}</p>
              <p className="text-[9px] text-text-secondary mt-0.5">{video.type}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="relative w-full max-w-5xl aspect-video"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1&rel=0`}
                title={activeVideo.name}
                className="w-full h-full rounded-2xl"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#e50914] transition-colors flex items-center gap-2 text-sm"
              >
                <X size={20} /> Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
