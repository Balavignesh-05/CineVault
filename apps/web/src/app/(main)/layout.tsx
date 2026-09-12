import { Suspense } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Main app layout - server component.
 * AppHeader and Sidebar are wrapped in Suspense because they are 'use client'
 * components that call usePathname()/useRouter(). Suspense tells Next.js to
 * defer their SSR rendering, preventing the 'invariant expected layout router
 * to be mounted' error that occurs on Windows with pnpm due to path casing.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col lg:pl-[240px]">
        <Suspense
          fallback={
            <div
              style={{
                height: '64px',
                background: '#1a1e25',
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
        <div className="flex-1 pt-16">{children}</div>
      </div>
    </div>
  );
}
