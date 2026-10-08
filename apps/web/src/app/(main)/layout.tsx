import { Suspense } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

/**
 * Main app layout - server component.
 * Features a full-viewport cinematic shell with compact top navigation and mobile bottom nav.
 * Permanent desktop sidebar has been removed in favor of content-first full-width viewports.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Suspense
        fallback={
          <div
            style={{
              height: '64px',
              background: '#0c0f14',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
            }}
          />
        }
      >
        <AppHeader />
      </Suspense>
      
      {/* Main Content using full available viewport width */}
      <main className="flex-1 pb-20 md:pb-12 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}

