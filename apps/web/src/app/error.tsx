'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html>
      <body className="bg-background text-white flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <button onClick={reset} className="px-4 py-2 bg-primary text-black rounded-lg font-bold">Try again</button>
        </div>
      </body>
    </html>
  );
}
