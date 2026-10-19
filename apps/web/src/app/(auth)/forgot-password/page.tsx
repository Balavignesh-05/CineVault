'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (cooldown > 0) return;
      setError(null);
      setIsLoading(true);
      try {
        await forgotPassword(email);
        setIsSent(true);
        setCooldown(60);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (err.code === 'TIMEOUT' || err.code === 'NETWORK_ERROR') {
            setError('Network error. Please check your connection and try again.');
          } else if (err.status === 429) {
            setError('Too many requests. Please wait a moment before trying again.');
            setCooldown(60);
          } else {
            setError(err.message);
          }
        } else {
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, cooldown],
  );

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setCooldown(60);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Too many requests. Please wait a moment before trying again.');
          setCooldown(60);
        } else if (err.code === 'TIMEOUT' || err.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, cooldown]);

  // ── Success State ──────────────────────────────────────────────────
  if (isSent) {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#35D6A0]/15 border border-[#35D6A0]/30 flex items-center justify-center shadow-[0_0_20px_rgba(53,214,160,0.2)]">
            <CheckCircle2 size={28} className="text-[#35D6A0]" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
            Check your email
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8B7] leading-relaxed max-w-[340px] mx-auto">
            If an account exists for <span className="text-[#F4F3EC] font-medium">{email}</span>,
            we&apos;ve sent password reset instructions to your inbox.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm font-medium leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading || cooldown > 0}
            className="w-full h-11 bg-[#1A2430] hover:bg-[#273442] text-[#F4F3EC] font-semibold rounded-xl text-sm transition-all border border-[#273442] hover:border-[#35D6A0]/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
            </span>
          </button>

          {/* Back to Sign In */}
          <Link
            href="/signin"
            className="w-full h-11 bg-transparent hover:bg-[#1A2430] text-[#9AA8B7] hover:text-[#F4F3EC] font-medium rounded-xl text-sm transition-all border border-[#273442] hover:border-[#35D6A0]/30 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Form State ─────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
          Forgot password?
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA8B7]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm font-medium leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="forgot-email"
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
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full h-11 pl-10 pr-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/50 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || cooldown > 0}
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          <span>
            {cooldown > 0 ? `Wait ${cooldown}s` : 'Send reset link'}
          </span>
        </button>
      </form>

      {/* Back to Sign In */}
      <div className="pt-1 text-center">
        <Link
          href="/signin"
          className="text-xs sm:text-sm text-[#9AA8B7] hover:text-[#35D6A0] transition-colors inline-flex items-center gap-1.5 font-medium focus:outline-none focus-visible:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
