'use client';

import React, { useState } from 'react';
import type { Collection, CreateCollectionRequest, UpdateCollectionRequest } from '@cinevault/shared-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface CreateCollectionModalProps {
  open: boolean;
  onClose: () => void;
  existing?: Collection;
  onSuccess?: (c: Collection) => void;
}

export function CreateCollectionModal({ open, onClose, existing, onSuccess }: CreateCollectionModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string>(existing?.title ?? '');
  const [description, setDescription] = useState<string>(existing?.description ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(existing?.coverImageUrl ?? '');
  const [isPublic, setIsPublic] = useState<boolean>(existing?.isPublic ?? true);
  const [isRanked, setIsRanked] = useState<boolean>(existing?.isRanked ?? false);

  const mutation = useMutation<Collection, Error, CreateCollectionRequest | UpdateCollectionRequest>({
    mutationFn: (payload) => {
      if (existing) {
        return api.put<Collection>(`/collections/${existing.id}`, payload);
      }
      return api.post<Collection>('/collections', payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(existing ? 'Collection updated!' : 'Collection created!');
      onSuccess?.(data);
      onClose();
    },
    onError: () => toast.error('Failed to save collection'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      isPublic,
      isRanked,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text-primary)]">
            {existing ? 'Edit Collection' : 'Create Collection'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="col-title">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="col-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Favorite Sci-Fi"
              required
              className="bg-[var(--color-bg-base)] border-[var(--color-border-default)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="col-desc">Description</Label>
            <textarea
              id="col-desc"
              className="w-full min-h-[80px] p-2 rounded-md bg-[var(--color-bg-base)] border border-[var(--color-border-default)] focus:border-[var(--color-accent-primary)] outline-none resize-y text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this collection about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="col-cover">Cover Image URL</Label>
            <Input
              id="col-cover"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="bg-[var(--color-bg-base)] border-[var(--color-border-default)]"
            />
          </div>
          <div className="flex flex-col space-y-4 pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="col-public"
                checked={isPublic}
                onCheckedChange={(c) => setIsPublic(!!c)}
                className="border-border-muted"
              />
              <Label htmlFor="col-public" className="text-text-secondary cursor-pointer">
                Make collection public
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="col-ranked"
                checked={isRanked}
                onCheckedChange={(c) => setIsRanked(!!c)}
                className="border-border-muted"
              />
              <Label htmlFor="col-ranked" className="text-text-secondary cursor-pointer">
                Ranked List (ordered)
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || mutation.isPending}>
              {mutation.isPending ? 'Saving…' : existing ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
