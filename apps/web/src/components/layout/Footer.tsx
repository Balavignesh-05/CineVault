import Link from 'next/link';
import { Film, Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0F]/90 backdrop-blur-md border-t border-white/5 relative z-10 pt-16 pb-8">
      <div className="container flex flex-col space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Film className="w-8 h-8 text-accent-primary" />
              <span className="text-2xl font-display font-bold tracking-tight">CineVault</span>
            </Link>
            <p className="text-white/60 max-w-sm text-lg">
              Your premium destination for discovering movies, tracking your favorites, and exploring cinema.
            </p>
            <div className="pt-4 flex items-center gap-2 text-sm text-white/40">
              <span>Film data provided by</span>
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-primary hover:underline">TMDB</a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/discovery" className="text-white/60 hover:text-white transition-colors">Discover</Link></li>
              <li><Link href="/search" className="text-white/60 hover:text-white transition-colors">Search</Link></li>
              <li><Link href="/trending" className="text-white/60 hover:text-white transition-colors">Trending</Link></li>
              <li><Link href="/top-rated" className="text-white/60 hover:text-white transition-colors">Top Rated</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Connect</h3>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-white/40 pt-4 flex items-center gap-1.5">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by developers
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© {new Date().getFullYear()} CineVault. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
