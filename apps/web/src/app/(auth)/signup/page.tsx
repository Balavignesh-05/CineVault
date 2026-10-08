'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { user } = await register(form);
      setUser(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="text-text-muted">Join CineVault and start tracking movies</p>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="signup-displayname" className="text-xs font-semibold text-text-secondary">Display Name</Label>
          <Input 
            id="signup-displayname" 
            value={form.displayName} 
            onChange={update('displayName')} 
            placeholder="Your Name" 
            required 
            className="bg-[#0b0e14]/80 border-white/10 text-white placeholder:text-text-muted focus-visible:ring-primary h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-username" className="text-xs font-semibold text-text-secondary">Username</Label>
          <Input 
            id="signup-username" 
            value={form.username} 
            onChange={update('username')} 
            placeholder="yourhandle" 
            required 
            className="bg-[#0b0e14]/80 border-white/10 text-white placeholder:text-text-muted focus-visible:ring-primary h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs font-semibold text-text-secondary">Email</Label>
          <Input 
            id="signup-email" 
            type="email" 
            value={form.email} 
            onChange={update('email')} 
            placeholder="you@example.com" 
            required 
            className="bg-[#0b0e14]/80 border-white/10 text-white placeholder:text-text-muted focus-visible:ring-primary h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-xs font-semibold text-text-secondary">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
              required
              className="bg-[#0b0e14]/80 border-white/10 text-white placeholder:text-text-muted focus-visible:ring-primary h-11 rounded-xl pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPw(p => !p)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white p-1 rounded-md transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-primary text-black font-bold hover:bg-primary-hover transition-all h-11 rounded-xl shadow-[0_0_20px_rgba(0,224,84,0.25)]" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Create Account
        </Button>
      </form>
      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href="/signin" className="text-primary hover:underline font-semibold">Sign in</Link>
      </p>
    </div>
  );
}