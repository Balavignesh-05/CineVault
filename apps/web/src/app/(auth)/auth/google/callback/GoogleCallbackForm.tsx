'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { googleLogin } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

type CallbackState = 'loading' | 'success' | 'error';

export default function GoogleCallbackForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [state, setState] = useState<CallbackState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const errorParam = searchParams.get('error');

    // Handle Google OAuth errors (user cancelled, access denied, etc.)
    if (errorParam) {
      setState('error');
      if (errorParam === 'access_denied') {
        setErrorMsg('Google sign-in was cancelled. You can try again from the sign-in page.');
      } else {
        setErrorMsg(`Google returned an error: ${errorParam}`);
      }
      return;
    }

    if (!code) {
      setState('error');
      setErrorMsg('No authorization code received from Google.');
      return;
    }

    // Validate OAuth state parameter to prevent CSRF
    const savedState = sessionStorage.getItem('google_oauth_state');
    if (!returnedState || returnedState !== savedState) {
      setState('error');
      setErrorMsg('Invalid OAuth state. This may be a CSRF attack. Please try signing in again.');
      return;
    }

    // Clear the state from session storage
    sessionStorage.removeItem('google_oauth_state');

    // Exchange code for tokens via our API
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    googleLogin(code, redirectUri)
      .then(({ user }) => {
        setUser(user);
        setState('success');
        // Redirect to dashboard after brief success display
        setTimeout(() => router.push('/dashboard'), 800);
      })
      .catch((err) => {
        setState('error');
        const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
        setErrorMsg(message);
      });
  }, [searchParams, router, setUser]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {state === 'loading' && (
        <div className="flex flex-col items-center gap-3 text-[#9AA8B7]">
          <Loader2 size={32} className="animate-spin text-[#35D6A0]" />
          <p className="text-sm">Authenticating with Google...</p>
        </div>
      )}

      {state === 'success' && (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle size={32} className="text-[#35D6A0]" />
          <p className="text-sm text-[#F4F3EC] font-medium">Signed in successfully!</p>
          <p className="text-xs text-[#9AA8B7]">Redirecting to dashboard...</p>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-red-400 font-medium text-center">{errorMsg}</p>
          </div>
          <Link
            href="/signin"
            className="w-full h-11 bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(53,214,160,0.25)] flex items-center justify-center"
          >
            Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
