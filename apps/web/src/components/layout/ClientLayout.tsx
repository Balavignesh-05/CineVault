'use client';

import dynamic from 'next/dynamic';

// Dynamically load navigation-hook components client-side only
// This prevents "invariant expected layout router to be mounted" in Next.js 15
const AppHeader = dynamic(
  () => import('./AppHeader').then(m => ({ default: m.AppHeader })),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: '64px',
        background: '#2c3440',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }} />
    )
  }
);

const Sidebar = dynamic(
  () => import('./Sidebar').then(m => ({ default: m.Sidebar })),
  { ssr: false, loading: () => null }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-[240px]">
        <AppHeader />
        <div className="flex-1 pt-16">
          {children}
        </div>
      </div>
    </div>
  );
}
