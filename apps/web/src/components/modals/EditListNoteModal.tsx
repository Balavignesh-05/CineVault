'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface EditListNoteModalProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  filmId: string;
  filmTitle: string;
  initialNote: string;
}

export function EditListNoteModal({ open, onClose, listId, filmId, filmTitle, initialNote }: EditListNoteModalProps) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState(initialNote || '');

  useEffect(() => {
    if (open) {
      setNote(initialNote || '');
    }
  }, [open, initialNote]);

  const mutation = useMutation({
    mutationFn: () => api.put(`/collections/${listId}/films/${filmId}/note`, { note: note.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', listId] });
      toast.success('Note updated');
      onClose();
    },
    onError: () => toast.error('Failed to update note'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)]">
        <DialogHeader>
          <DialogTitle className="text-white">Note for {filmTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="film-note" className="text-text-secondary">Your thoughts on this film...</Label>
            <textarea
              id="film-note"
              className="w-full min-h-[100px] p-3 text-sm rounded-md bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] outline-none resize-y text-white"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. The cinematography here is unmatched..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border-subtle)] mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mt-4">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="mt-4">
              {mutation.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
