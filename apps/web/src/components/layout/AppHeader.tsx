'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Bell, Menu, X, Film, Star, LogOut, User, Settings, BookOpen, Dices, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/ui';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearchAutocomplete } from '../../hooks/useSearchAutocomplete';
import { SearchAutocomplete } from '../search/SearchAutocomplete';

import { FilmRouletteModal } from '../modals/FilmRouletteModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';
import styles from './AppHeader.module.css';

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get<any>('/notifications?unread=true&limit=1').then(r => r.data).catch(() => ({ total: 0 })),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const unreadCount = data?.unread ?? data?.total ?? 0;

  return (
    <Link href="/notifications" className={styles.iconBtn} aria-label="Notifications" style={{ position: 'relative' }}>
      <Bell size={18} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: '-4px', right: '-4px',
          background: '#00e054', color: '#14181c',
          fontSize: '9px', fontWeight: 900,
          borderRadius: '999px', minWidth: '16px', height: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, padding: '0 3px'
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);


  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    allSuggestions
  } = useSearchAutocomplete(searchQuery);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || allSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
        const selected = allSuggestions[selectedIndex];
        router.push(selected.url);
        setShowSuggestions(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      } else {
        handleSearch(e as unknown as React.FormEvent);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [showSuggestions, allSuggestions, selectedIndex, router, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Film className={styles.logoIcon} size={22} />
          <span className={styles.logoText}>CineVault</span>
        </Link>

        {/* Search */}
        {pathname !== '/search' ? (
          <div className="relative flex-1" ref={suggestionsRef}>
          <form className={`${styles.searchForm} ${searchFocused ? styles.searchFocused : ''}`} onSubmit={handleSearch}>
            <Search className={styles.searchIcon} size={16} />
            <input
              ref={searchRef}
              type="search"
              className={styles.searchInput}
              placeholder="Search movies, TV shows, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { setSearchFocused(true); if (searchQuery.trim().length >= 2) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={handleKeyDown}
              aria-label="Search films"
              autoComplete="off"
            />
          </form>

          <SearchAutocomplete
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            searchQuery={searchQuery}
            isLoading={isLoading}
            allSuggestions={allSuggestions}
            onClose={() => {
              setShowSuggestions(false);
              setSearchQuery('');
              setSelectedIndex(-1);
            }}
          />
        </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Mobile Menu Button */}
        <button
          className={`${styles.mobileMenuBtn} md:hidden`}
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Nav Links */}
        <nav className={styles.nav} aria-label="Main navigation">
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
          >
            Home
          </Link>
          <Link
            href="/discovery"
            className={`${styles.navLink} ${pathname?.startsWith('/discovery') ? styles.navLinkActive : ''}`}
          >
            Discover
          </Link>
          <Link
            href="/films"
            className={`${styles.navLink} ${pathname?.startsWith('/films') ? styles.navLinkActive : ''}`}
          >
            Movies
          </Link>
          <Link
            href="/series"
            className={`${styles.navLink} ${pathname?.startsWith('/series') ? styles.navLinkActive : ''}`}
          >
            TV Shows
          </Link>

          <button
            onClick={() => setRouletteOpen(true)}
            className={`${styles.navLink} text-accent-amber hover:text-[#ff9933] flex items-center gap-1 font-bold`}
          >
            <Dices size={16} /> Roulette
          </button>
          {isAuthenticated && (
            <>
              <Link
                href="/feed"
                className={`${styles.navLink} ${pathname?.startsWith('/feed') ? styles.navLinkActive : ''}`}
              >
                Feed
              </Link>
              <Link
                href="/dashboard"
                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`}
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              {/* Quick Log Button */}
              <Link
                href="/diary"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#00e054] text-[#14181c] font-bold text-xs rounded-lg hover:bg-[#00c745] transition-colors"
                aria-label="Log a film"
              >
                <PlusCircle size={14} /> Log Film
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <div className={styles.userMenu} ref={menuRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="User menu"
                  aria-expanded={menuOpen}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="avatar avatar-sm" />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      className={styles.dropdown}
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={styles.dropdownHeader}>
                        <p className={styles.dropdownName}>{user?.displayName}</p>
                        <p className={styles.dropdownUsername}>@{user?.username}</p>
                      </div>
                      <hr className="divider" style={{ margin: '8px 0' }} />
                      <Link href={`/profile/${user?.username}`} className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <User size={15} /> Profile
                      </Link>
                      <Link href="/diary" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <BookOpen size={15} /> Diary
                      </Link>
                      <Link href="/watchlist" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <Star size={15} /> Watchlist
                      </Link>
                      <Link href="/settings" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <Settings size={15} /> Settings
                      </Link>
                      <hr className="divider" style={{ margin: '8px 0' }} />
                      <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/signin" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border-subtle bg-surface"
          >
            <nav className="flex flex-col py-2">
              <Link href="/discovery" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Discover</Link>
              <Link href="/films" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Films</Link>
              <Link href="/lists" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Lists</Link>

              <Link href="/recommendations" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Recommendations</Link>
              {isAuthenticated && (
                <>
                  <div className="h-px bg-elevated mx-4 my-1" />
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Dashboard</Link>
                  <Link href="/diary" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Diary</Link>
                  <Link href="/watchlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Watchlist</Link>
                  <Link href="/feed" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Feed</Link>
                  <div className="h-px bg-elevated mx-4 my-1" />
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-elevated transition-colors w-full text-left">Sign Out</button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <div className="h-px bg-elevated mx-4 my-1" />
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary hover:bg-elevated transition-colors">Join Free</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <FilmRouletteModal isOpen={rouletteOpen} onClose={() => setRouletteOpen(false)} />
    </header>
  );
}
