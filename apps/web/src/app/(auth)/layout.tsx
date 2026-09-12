import Link from 'next/link';
import { Film } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary">
            <Film size={28} />
            <span className="text-2xl font-black text-white">CineVault</span>
          </Link>
        </div>
        <div className="bg-surface border border-border-subtle rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
