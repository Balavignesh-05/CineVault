'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [profileBackdropUrl, setProfileBackdropUrl] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setWebsite(user.website || '');
      setLocation(user.location || '');
      setProfileBackdropUrl((user as any).profileBackdropUrl || '');
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('/users/profile', data),
    onSuccess: () => alert('Profile updated!'),
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!isAuthenticated) return <div className="p-8 text-center text-text-secondary">Please sign in to view settings.</div>;

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="flex gap-4 border-b border-border-subtle pb-2">
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'profile' ? 'text-white border-b-2 border-primary' : 'text-text-muted hover:text-white'}`}>Profile</button>
          <button onClick={() => setActiveTab('account')} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'account' ? 'text-white border-b-2 border-primary' : 'text-text-muted hover:text-white'}`}>Account</button>
          <button onClick={() => setActiveTab('data')} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'data' ? 'text-white border-b-2 border-primary' : 'text-text-muted hover:text-white'}`}>Import/Export</button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate({ displayName, bio, website, location, profileBackdropUrl }); }} className="space-y-6 bg-surface p-8 rounded-2xl border border-border-subtle">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Display Name</label>
                <Input type="text" className="w-full bg-elevated text-white rounded-xl border-border-subtle" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Location</label>
                <Input type="text" className="w-full bg-elevated text-white rounded-xl border-border-subtle" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Website</label>
              <Input type="url" className="w-full bg-elevated text-white rounded-xl border-border-subtle" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Profile Backdrop Image URL (Pro)</label>
              <Input type="url" className="w-full bg-elevated text-white rounded-xl border-border-subtle" value={profileBackdropUrl} onChange={(e) => setProfileBackdropUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/original/..." />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bio</label>
              <textarea className="w-full bg-elevated text-white p-4 rounded-xl border border-border-subtle min-h-[120px] focus:ring-1 focus:ring-primary outline-none transition-all" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write something about yourself and your taste in movies..."></textarea>
            </div>

            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending} className="bg-primary text-black font-bold px-8 rounded-xl hover:bg-primary-hover">
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'account' && (
          <div className="p-8 bg-surface rounded-2xl border border-border-subtle">
            <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Connected integrations (e.g. JustWatch, TMDB) and email settings will appear here.</p>
              <Button variant="outline" className="border-border-subtle text-white hover:bg-elevated rounded-xl font-bold">
                Change Password
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="p-8 bg-surface rounded-2xl border border-border-subtle">
              <h2 className="text-xl font-bold text-white mb-2">Import Data</h2>
              <p className="text-sm text-text-muted mb-6">Import your films, reviews, and lists from Letterboxd via CSV files.</p>
              
              <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <p className="text-sm text-white font-bold mb-2">Drag and drop your Letterboxd CSV files here</p>
                <p className="text-xs text-text-muted mb-4">diary.csv, reviews.csv, or watchlist.csv</p>
                <Button variant="outline" className="border-border-subtle text-white hover:bg-elevated rounded-xl font-bold">
                  Browse Files
                </Button>
              </div>
            </div>

            <div className="p-8 bg-surface rounded-2xl border border-border-subtle">
              <h2 className="text-xl font-bold text-white mb-2">Export Data</h2>
              <p className="text-sm text-text-muted mb-6">Download a copy of all your CineVault data.</p>
              <Button className="bg-primary text-black hover:bg-primary-hover rounded-xl font-bold px-6">
                Export as CSV
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}