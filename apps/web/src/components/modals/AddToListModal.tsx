'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, List, Plus, Check, Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface UserList {
  id: string;
  title: string;
  description: string | null;
  filmCount: number;
  isRanked: boolean;
}

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

export function AddToListModal({ isOpen, onClose, movieId, movieTitle }: AddToListModalProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingToId, setAddingToId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['user-lists'],
    queryFn: () => api.get<{ data: UserList[] }>('/collections').catch(() => ({ data: [] as UserList[] })),
    enabled: isAuthenticated && isOpen,
  });

  const lists = data?.data ?? [];

  const addToListMutation = useMutation({
    mutationFn: ({ listId }: { listId: string }) =>
      api.post(`/collections/${listId}/items`, { tmdbId: movieId }),
    onSuccess: (_, { listId }) => {
      toast.success(`Added to list!`);
      queryClient.invalidateQueries({ queryKey: ['user-lists'] });
      setAddingToId(null);
    },
    onError: () => {
      toast.error('Failed to add to list');
      setAddingToId(null);
    },
  });

  const createListMutation = useMutation({
    mutationFn: (title: string) =>
      api.post<{ data: UserList }>('/collections', { title, description: '', isPublic: true }),
    onSuccess: (newList) => {
      toast.success(`List "${newListTitle}" created!`);
      queryClient.invalidateQueries({ queryKey: ['user-lists'] });
      setNewListTitle('');
      setIsCreating(false);
      // Auto-add the film to the newly created list
      if (newList?.data?.id) {
        addToListMutation.mutate({ listId: newList.data.id });
      }
    },
    onError: () => toast.error('Failed to create list'),
  });

  const handleAddToList = (listId: string) => {
    setAddingToId(listId);
    addToListMutation.mutate({ listId });
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    createListMutation.mutate(newListTitle.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <List size={18} className="text-primary" />
                  <h2 className="text-base font-bold text-white">Add to List</h2>
                </div>
                <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-elevated">
                  <X size={18} />
                </button>
              </div>

              {/* List of user lists */}
              <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-text-secondary" />
                  </div>
                ) : lists.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2 text-center">
                    <Film size={32} className="text-[#2c3440]" />
                    <p className="text-sm text-text-secondary">No lists yet</p>
                    <p className="text-xs text-text-muted">Create your first list below</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {lists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToList(list.id)}
                        disabled={addingToId === list.id}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-elevated transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{list.title}</p>
                          <p className="text-xs text-text-muted">{list.filmCount} films</p>
                        </div>
                        {addingToId === list.id ? (
                          <Loader2 size={16} className="animate-spin text-primary" />
                        ) : (
                          <Plus size={16} className="text-text-muted hover:text-primary transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create new list */}
              <div className="p-4 border-t border-border-subtle">
                {isCreating ? (
                  <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                    <input
                      autoFocus
                      value={newListTitle}
                      onChange={e => setNewListTitle(e.target.value)}
                      placeholder="List name..."
                      className="flex-1 px-3 py-2 rounded-xl bg-background border border-border-subtle text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newListTitle.trim() || createListMutation.isPending}
                      className="bg-primary hover:bg-[#00c048] text-[#14181c] font-bold"
                    >
                      {createListMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreating(false)}
                      className="text-text-muted hover:text-white"
                    >
                      <X size={14} />
                    </Button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border-subtle hover:border-primary/50 text-sm text-text-muted hover:text-primary transition-all"
                  >
                    <Plus size={14} /> Create New List
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
