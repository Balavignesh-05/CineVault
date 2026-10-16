'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#F4F3EC] tracking-tight">Welcome back</h1>
        <p className="text-xs sm:text-sm text-[#9AA8B7]">Sign in to your CineVault account</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="signin-email" className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full h-11 px-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signin-password" className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="signin-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 pl-3.5 pr-11 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#9AA8B7] hover:text-[#F4F3EC] rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35D6A0]"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          <span>Sign In</span>
        </button>
      </form>

      <div className="pt-2 text-center text-xs sm:text-sm text-[#9AA8B7]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#35D6A0] hover:underline font-bold ml-1">
          Create one
        </Link>
      </div>
    </div>
  );
}