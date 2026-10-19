'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { validateResetToken, resetPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

type PageState = 'validating' | 'form' | 'success' | 'invalid' | 'expired' | 'error';

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: '', width: '0%' };
  if (password.length < 8) return { label: 'Too short', color: '#EF4444', width: '25%' };
  if (password.length >= 12) return { label: 'Strong', color: '#35D6A0', width: '100%' };
  return { label: 'Good', color: '#F59E0B', width: '66%' };
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('validating');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Token validation on mount ──────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setPageState('invalid');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await validateResetToken(token);
        if (!cancelled) setPageState('form');
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          if (err.code === 'TOKEN_EXPIRED' || err.message.toLowerCase().includes('expired')) {
            setPageState('expired');
          } else if (err.status === 400 || err.code === 'TOKEN_INVALID' || err.code === 'TOKEN_USED') {
            setPageState('invalid');
          } else if (err.code === 'TIMEOUT' || err.code === 'NETWORK_ERROR') {
            setError('Network error. Please refresh and try again.');
            setPageState('error');
          } else {
            setPageState('error');
            setError(err.message);
          }
        } else {
          setPageState('error');
          setError('Something went wrong. Please try again.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ── Form submission ────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) return;
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setError(null);
      setIsLoading(true);
      try {
        await resetPassword(token, password);
        setPageState('success');
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (err.code === 'TOKEN_EXPIRED' || err.message.toLowerCase().includes('expired')) {
            setPageState('expired');
          } else if (err.code === 'TOKEN_USED' || err.code === 'TOKEN_INVALID') {
            setPageState('invalid');
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
    },
    [token, password, confirmPassword],
  );

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // ── Validating State ───────────────────────────────────────────────
  if (pageState === 'validating') {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#35D6A0]/15 border border-[#35D6A0]/30 flex items-center justify-center">
            <Loader2 size={28} className="text-[#35D6A0] animate-spin" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
            Verifying link...
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8B7]">
            Please wait while we validate your reset link
          </p>
        </div>
      </div>
    );
  }

  // ── Success State ──────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#35D6A0]/15 border border-[#35D6A0]/30 flex items-center justify-center shadow-[0_0_20px_rgba(53,214,160,0.2)]">
            <ShieldCheck size={28} className="text-[#35D6A0]" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
            Password reset!
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8B7] leading-relaxed">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/signin"
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2"
        >
          <span>Continue to sign in</span>
        </Link>
      </div>
    );
  }

  // ── Invalid Token State ────────────────────────────────────────────
  if (pageState === 'invalid') {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <XCircle size={28} className="text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
            Invalid reset link
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8B7] leading-relaxed">
            This password reset link is invalid or has already been used. Please request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2"
        >
          <span>Request new link</span>
        </Link>
        <div className="text-center">
          <Link
            href="/signin"
            className="text-xs sm:text-sm text-[#9AA8B7] hover:text-[#35D6A0] transition-colors font-medium focus:outline-none focus-visible:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Expired Token State ────────────────────────────────────────────
  if (pageState === 'expired') {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
            Link expired
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8B7] leading-relaxed">
            This password reset link has expired. Please request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2"
        >
          <span>Request new link</span>
        </Link>
        <div className="text-center">
          <Link
            href="/signin"
            className="text-xs sm:text-sm text-[#9AA8B7] hover:text-[#35D6A0] transition-colors font-medium focus:outline-none focus-visible:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Generic Error State ────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div className="w-full space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <XCircle size={28} className="text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8B7] leading-relaxed">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2"
        >
          <span>Try again</span>
        </Link>
        <div className="text-center">
          <Link
            href="/signin"
            className="text-xs sm:text-sm text-[#9AA8B7] hover:text-[#35D6A0] transition-colors font-medium focus:outline-none focus-visible:underline"
          >
            Back to sign in
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
          Reset your password
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA8B7]">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm font-medium leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="reset-password"
            className="block text-xs font-semibold text-[#F4F3EC]"
          >
            New Password
          </label>
          <div className="relative flex items-center">
            <Lock
              size={16}
              className="absolute left-3.5 text-[#9AA8B7] pointer-events-none"
            />
            <input
              id="reset-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
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

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <div className="h-1 w-full bg-[#273442] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: strength.width,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <p className="text-[11px] font-medium" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="reset-confirm-password"
            className="block text-xs font-semibold text-[#F4F3EC]"
          >
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock
              size={16}
              className="absolute left-3.5 text-[#9AA8B7] pointer-events-none"
            />
            <input
              id="reset-confirm-password"
              type={showConfirmPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              className={`w-full h-11 pl-10 pr-11 bg-[#0B0F14] border rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/50 focus:outline-none focus:ring-1 text-sm transition-colors ${
                passwordsMismatch
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500'
                  : passwordsMatch
                    ? 'border-[#35D6A0]/50 focus:border-[#35D6A0] focus:ring-[#35D6A0]'
                    : 'border-[#273442] focus:border-[#35D6A0] focus:ring-[#35D6A0]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#9AA8B7] hover:text-[#F4F3EC] rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35D6A0]"
              aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
            >
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Match Indicator */}
          {confirmPassword.length > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {passwordsMatch ? (
                <>
                  <CheckCircle2 size={12} className="text-[#35D6A0]" />
                  <span className="text-[11px] font-medium text-[#35D6A0]">Passwords match</span>
                </>
              ) : (
                <>
                  <XCircle size={12} className="text-red-400" />
                  <span className="text-[11px] font-medium text-red-400">Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || password.length < 8 || !passwordsMatch}
          className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          <span>Reset password</span>
        </button>
      </form>

      {/* Back to Sign In */}
      <div className="pt-1 text-center">
        <Link
          href="/signin"
          className="text-xs sm:text-sm text-[#9AA8B7] hover:text-[#35D6A0] transition-colors font-medium focus:outline-none focus-visible:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
