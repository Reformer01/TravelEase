"use client";

import Link from 'next/link';
import { ShoppingBasket, User, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBasket } from '@/context/basket-context';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/supabase';
import { useState } from 'react';
import { MobileNavigation } from './MobileNavigation';

export function Navbar() {
  const { items } = useBasket();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between lg:px-20">
        {/* Logo - Always visible */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-slate-100 uppercase">
            TravelEase
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/search?type=flight" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Discover</Link>
          <Link href="/search?type=car" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Cars</Link>
          <Link href={user ? "/profile/bookings" : loginFor('/profile/bookings')} className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">My Bookings</Link>
          <Link href="/support" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Support</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/basket">
            <Button variant="secondary" size="icon" className="relative rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20 transition-all">
              <ShoppingBasket className="h-5 w-5" />
              {items.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] min-w-[1.25rem] h-5 bg-primary text-white border-none" variant="default">
                  {items.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href={user ? "/profile" : loginFor('/profile')}>
            <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20 transition-all">
              {(user?.user_metadata?.avatar_url as string | undefined) ? (
                <img src={user?.user_metadata?.avatar_url || "https://picsum.photos/seed/user/64/64"} className="h-full w-full object-cover rounded-xl" alt="Profile" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button 
            className="rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20" 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Collapsible Mobile Search Bar */}
      <div className={`lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
        isSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="container mx-auto px-6 py-3 lg:px-20">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search destinations, flights, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                autoFocus
              />
            </div>
            <Button type="submit" className="rounded-xl">
              Search
            </Button>
          </form>
        </div>
      </div>

      <MobileNavigation isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />
    </header>
  );
}
