'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGoogleAuthConfig } from '@/lib/api/auth';

export function useGoogleAuth() {
  const [clientId, setClientId] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  });
  const [isChecking, setIsChecking] = useState<boolean>(() => {
    return !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  });

  useEffect(() => {
    if (clientId) return;

    let isMounted = true;
    getGoogleAuthConfig()
      .then((cfg) => {
        if (isMounted) {
          if (cfg.configured && cfg.clientId) {
            setClientId(cfg.clientId);
          }
          setIsChecking(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const getGoogleOAuthUrl = useCallback(() => {
    if (!clientId) return null;
    if (typeof window === 'undefined') return null;

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem('google_oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, [clientId]);

  const initiateGoogleLogin = useCallback((): { success: boolean; error?: string } => {
    const url = getGoogleOAuthUrl();
    if (!url) {
      return {
        success: false,
        error: 'Google Sign-In is not configured yet. Please ensure GOOGLE_CLIENT_ID is set in Render or Vercel settings.',
      };
    }
    window.location.href = url;
    return { success: true };
  }, [getGoogleOAuthUrl]);

  return {
    clientId,
    isConfigured: Boolean(clientId),
    isChecking,
    getGoogleOAuthUrl,
    initiateGoogleLogin,
  };
}
