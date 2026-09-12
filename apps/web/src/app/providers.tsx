'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { 
      queries: { 
        staleTime: 60 * 1000, 
        retry: (failureCount, error: any) => {
          if (error?.status === 404 || error?.status === 401 || error?.status === 403) return false;
          return failureCount < 1;
        } 
      } 
    }
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
