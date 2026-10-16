'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
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
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#F4F3EC] tracking-tight">Create your account</h1>
        <p className="text-xs sm:text-sm text-[#9AA8B7]">Join CineVault and start tracking movies</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="signup-displayname" className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
            Display Name
          </label>
          <input
            id="signup-displayname"
            value={form.displayName}
            onChange={update('displayName')}
            placeholder="Your Name"
            required
            className="w-full h-11 px-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-username" className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
            Username
          </label>
          <input
            id="signup-username"
            value={form.username}
            onChange={update('username')}
            placeholder="yourhandle"
            required
            className="w-full h-11 px-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="you@example.com"
            required
            className="w-full h-11 px-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="signup-password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={update('password')}
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
            <UserPlus size={16} />
          )}
          <span>Create Account</span>
        </button>
      </form>

      <div className="pt-2 text-center text-xs sm:text-sm text-[#9AA8B7]">
        Already have an account?{' '}
        <Link href="/signin" className="text-[#35D6A0] hover:underline font-bold ml-1">
          Sign in
        </Link>
      </div>
    </div>
  );
}