"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Search, Bell, User, LogOut, LayoutDashboard, Film, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-subtle bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <Link href="/" className="flex items-center gap-2 lg:w-[208px]">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-xl tracking-tight text-text-primary">CineVault</span>
        </Link>
      </div>

      {/* Global Search Bar - Center */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows, people..."
            className="block w-full p-2.5 pl-10 text-sm text-text-primary bg-surface border border-border-subtle rounded-full focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-muted transition-all outline-none"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {isAuthenticated ? (
          <>
            <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary rounded-full hidden sm:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden border border-border-subtle p-0 ml-1">
                  <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" className="object-cover h-full w-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-elevated border-border-subtle rounded-xl shadow-xl">
                <DropdownMenuLabel className="text-text-primary py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-text-muted mt-1">@{user?.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border-subtle" />
                <DropdownMenuItem asChild className="hover:bg-surface cursor-pointer rounded-lg m-1">
                  <Link href={`/profile/${user?.username}`}><User className="mr-2 h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-surface cursor-pointer rounded-lg m-1">
                  <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border-subtle" />
                <DropdownMenuItem onClick={logout} className="text-error hover:bg-error/10 hover:text-error cursor-pointer rounded-lg m-1">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button asChild className="bg-primary text-black font-bold rounded-full hover:bg-primary-hover transition-colors px-6">
            <Link href="/signin">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
