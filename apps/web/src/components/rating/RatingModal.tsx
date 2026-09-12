'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RatingWidget } from './RatingWidget';
import Image from 'next/image';

interface RatingModalProps {
  tmdbId: number;
  filmTitle: string;
  posterPath?: string | null;
  open: boolean;
  onClose: () => void;
}

export function RatingModal({ tmdbId, filmTitle, posterPath, open, onClose }: RatingModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Rate {filmTitle}</DialogTitle>
          <DialogDescription className="text-center">
            Share your thoughts on this film.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 gap-6">
          {posterPath && posterPath !== 'null' && posterPath !== 'undefined' && (
            <div className="relative w-32 h-48 rounded-md overflow-hidden shadow-lg border border-[#3D3D55]">
              <Image 
                src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                alt={filmTitle}
                fill
                className="object-cover"
              />
            </div>
          )}
          <RatingWidget tmdbId={tmdbId} filmTitle={filmTitle} onRated={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
