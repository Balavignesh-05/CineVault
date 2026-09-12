'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Collection } from '@cinevault/shared-types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddToCollectionModalProps {
  tmdbId: number;
  filmTitle: string;
  open: boolean;
  onClose: () => void;
}

export function AddToCollectionModal({ tmdbId, filmTitle, open, onClose }: AddToCollectionModalProps) {
  const queryClient = useQueryClient();
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  
  const { data: collections, isLoading } = useQuery({
    queryKey: ['my-collections'],
    queryFn: () => api.get<Collection[]>('/collections/me'),
    enabled: open
  });

  const { data: initialStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['film-collections', tmdbId],
    queryFn: () => api.get<string[]>(`/collections/contains/${tmdbId}`),
    enabled: open
  });

  useEffect(() => {
    if (initialStatus) {
      setSelectedCollections(new Set(initialStatus));
    }
  }, [initialStatus]);

  const mutation = useMutation({
    mutationFn: (collectionIds: string[]) => 
      api.post('/collections/sync-film', { tmdbId, collectionIds }),
    onSuccess: () => {
      toast.success(`Updated collections for ${filmTitle}`);
      queryClient.invalidateQueries({ queryKey: ['film-collections', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['my-collections'] });
      onClose();
    },
    onError: () => toast.error('Failed to update collections')
  });

  const toggleCollection = (id: string) => {
    const next = new Set(selectedCollections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCollections(next);
  };

  const handleSubmit = () => {
    mutation.mutate(Array.from(selectedCollections));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-text-muted mb-4">Select collections to add <strong>{filmTitle}</strong> to:</p>
          
          {(isLoading || statusLoading) ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
            </div>
          ) : !collections || collections.length === 0 ? (
            <div className="text-center py-4 text-text-muted text-sm">
              You don&apos;t have any collections yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {collections.map(collection => (
                <div key={collection.id} className="flex items-center space-x-3 p-2 hover:bg-bg-elevated rounded-md cursor-pointer" onClick={() => toggleCollection(collection.id)}>
                  <Checkbox 
                    checked={selectedCollections.has(collection.id)}
                    onCheckedChange={() => toggleCollection(collection.id)}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{collection.title}</span>
                    <span className="text-xs text-text-muted">{collection.filmCount} films</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending || (isLoading || statusLoading)}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
