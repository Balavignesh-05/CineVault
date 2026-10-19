'use client';

import React, { Suspense } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#35D6A0] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
