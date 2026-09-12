'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { TMDBImage, TMDBVideo } from '@/lib/tmdb/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface MediaSectionProps {
  images: {
    backdrops: TMDBImage[];
    posters: TMDBImage[];
    logos: TMDBImage[];
  };
  trailer: TMDBVideo | null;
}

export function MediaSection({ images, trailer }: MediaSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hasBackdrops = images.backdrops && images.backdrops.length > 0;
  const hasPosters = images.posters && images.posters.length > 0;

  if (!hasBackdrops && !hasPosters) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Media</h2>
      </div>

      <Tabs defaultValue={hasBackdrops ? 'backdrops' : 'posters'} className="w-full">
        <TabsList className="bg-[var(--color-bg-surface)] border border-[#3D3D55] mb-6">
          {hasBackdrops && <TabsTrigger value="backdrops">Backdrops ({images.backdrops.length})</TabsTrigger>}
          {hasPosters && <TabsTrigger value="posters">Posters ({images.posters.length})</TabsTrigger>}
        </TabsList>
        
        {hasBackdrops && (
          <TabsContent value="backdrops" className="mt-0">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max space-x-4">
                {images.backdrops.slice(0, 15).map((image, i) => (
                  <div 
                    key={i} 
                    className="relative w-[300px] sm:w-[400px] aspect-video rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage(`https://image.tmdb.org/t/p/original${image.file_path}`)}
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                      alt="Backdrop"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-[#3D3D55]/30 hover:bg-[#3D3D55]" />
            </ScrollArea>
          </TabsContent>
        )}

        {hasPosters && (
          <TabsContent value="posters" className="mt-0">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max space-x-4">
                {images.posters.slice(0, 15).map((image, i) => (
                  <div 
                    key={i} 
                    className="relative w-[150px] sm:w-[200px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage(`https://image.tmdb.org/t/p/original${image.file_path}`)}
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                      alt="Poster"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-[#3D3D55]/30 hover:bg-[#3D3D55]" />
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none flex items-center justify-center shadow-none">
          <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-[90vh]">
              <Image
                src={selectedImage}
                alt="Fullscreen media"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
