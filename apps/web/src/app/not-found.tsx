import Link from 'next/link';
import { Film, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <Film className="w-16 h-16 text-[#6B7D90] mx-auto opacity-50" />
        <h1 className="text-5xl font-black text-[#F4F3EC]">404</h1>
        <p className="text-xl font-bold text-[#9AA8B7]">Page Not Found</p>
        <p className="text-sm text-[#6B7D90]">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-primary text-[#0B0F14] font-bold rounded-xl hover:bg-primary-hover transition-colors text-sm shadow-[0_0_20px_rgba(53,214,160,0.2)]">
            <Home size={16} /> Go Home
          </Link>
          <Link href="/films" className="flex items-center gap-2 px-6 py-3 bg-[#1A2430] border border-[#273442] text-[#F4F3EC] font-bold rounded-xl hover:border-[#35D6A0] transition-colors text-sm">
            <Search size={16} /> Browse Films
          </Link>
        </div>
      </div>
    </div>
  );
}