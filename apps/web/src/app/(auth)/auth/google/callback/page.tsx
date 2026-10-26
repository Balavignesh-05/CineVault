'use client';

import { Suspense } from 'react';
import GoogleCallbackForm from './GoogleCallbackForm';

export default function GoogleCallbackPage() {
  return (
    <div className="w-full space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F3EC] tracking-tight">
          Signing in with Google
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA8B7]">
          Please wait while we verify your account...
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#35D6A0]/30 border-t-[#35D6A0] rounded-full animate-spin" />
          </div>
        }
      >
        <GoogleCallbackForm />
      </Suspense>
    </div>
  );
}
