import Link from 'next/link';
import { Film, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#14181c] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <Film className="w-16 h-16 text-[#9ab] mx-auto opacity-50" />
        <h1 className="text-5xl font-black text-white">404</h1>
        <p className="text-xl font-bold text-[#9ab]">Page Not Found</p>
        <p className="text-sm text-[#678]">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-[#00e054] text-[#14181c] font-bold rounded-lg hover:bg-[#00c745] transition-colors text-sm">
            <Home size={16} /> Go Home
          </Link>
          <Link href="/films" className="flex items-center gap-2 px-6 py-3 bg-[#2c3440] text-white font-bold rounded-lg hover:bg-[#363c47] transition-colors text-sm">
            <Search size={16} /> Browse Films
          </Link>
        </div>
      </div>
    </div>
  );
}