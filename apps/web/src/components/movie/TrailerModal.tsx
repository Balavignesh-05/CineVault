'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface TrailerModalProps {
  trailerKey: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function TrailerModal({ trailerKey, isOpen, onClose, title = "Movie Trailer" }: TrailerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full p-0 bg-black border-none overflow-hidden h-[80vh] sm:h-auto sm:aspect-video rounded-xl shadow-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {isOpen && (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
