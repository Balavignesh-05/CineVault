'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, RefreshCw } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function getGoogleOAuthUrl() {
  if (!GOOGLE_CLIENT_ID) return null;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const state = crypto.randomUUID();
  sessionStorage.setItem('google_oauth_state', state);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleGoogleLogin = () => {
    const url = getGoogleOAuthUrl();
    if (url) {
      window.location.href = url;
    } else {
      setError('Google Sign-In is not configured yet. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel settings.');
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* ── Card Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA8B7]">
          Sign in to your CineVault account
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm font-medium leading-relaxed flex items-center justify-between gap-2">
          <span>{error}</span>
          {error.includes('Network') || error.includes('timed out') ? (
            <button
              type="button"
              onClick={() => { setError(null); handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
              className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
              aria-label="Retry"
            >
              <RefreshCw size={14} />
            </button>
          ) : null}
        </div>
      )}

      {/* ── Sign In Form ────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="signin-email"
            className="block text-xs font-semibold text-[#F4F3EC]"
          >
            Email
          </label>
          <div className="relative flex items-center">
            <Mail
              size={16}
              className="absolute left-3.5 text-[#9AA8B7] pointer-events-none"
            />
            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full h-11 pl-10 pr-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/50 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="signin-password"
            className="block text-xs font-semibold text-[#F4F3EC]"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <Lock
              size={16}
              className="absolute left-3.5 text-[#9AA8B7] pointer-events-none"
            />
            <input
              id="signin-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full h-11 pl-10 pr-11 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/50 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#9AA8B7] hover:text-[#F4F3EC] transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#273442] bg-[#0B0F14] accent-[#35D6A0] focus:ring-1 focus:ring-[#35D6A0] cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-[#35D6A0] hover:text-[#6BE8BC] transition-colors font-medium focus:outline-none focus-visible:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          <span>Sign In</span>
        </button>
      </form>

      {/* ── OR Divider ──────────────────────────────────────────────── */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#273442]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[#131A22] text-[#9AA8B7] uppercase tracking-wider text-[10px] font-semibold">
            OR
          </span>
        </div>
      </div>

      {/* ── Google Sign-In Button ────────────────────────────────────── */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-11 rounded-xl bg-[#0B0F14] border border-[#273442] hover:border-[#9AA8B7]/50 flex items-center justify-center gap-3 transition-all text-sm font-medium text-[#F4F3EC] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35D6A0] hover:bg-[#131A22]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.56 0 2.96.54 4.07 1.43l3.05-3.05C17.26 1.7 14.8 1 12 1 7.42 1 3.51 3.6 1.63 7.37l3.71 2.88C6.22 7.32 8.87 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.82-.07-1.61-.21-2.27H12v4.51h6.47c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-1.99 3.7-4.93 3.7-8.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.34 14.75c-.23-.68-.36-1.41-.36-2.16s.13-1.48.36-2.16L1.63 7.55C.59 9.63 0 11.96 0 14.41s.59 4.78 1.63 6.86l3.71-2.88z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.07.72-2.45 1.16-4.23 1.16-3.13 0-5.78-2.32-6.66-5.25L1.63 16.01C3.51 19.78 7.42 22.38 12 22.38z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {!GOOGLE_CLIENT_ID && (
          <p className="text-[11px] text-[#9AA8B7]/70 text-center">
            Google Sign-In configuration pending (<code className="text-[10px] text-amber-400/90 font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>)
          </p>
        )}
      </div>

      {/* ── Footer Link ─────────────────────────────────────────────── */}
      <div className="pt-1 text-center text-xs sm:text-sm text-[#9AA8B7]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#35D6A0] hover:underline font-bold ml-1">
          Create one
        </Link>
      </div>
    </div>
  );
}