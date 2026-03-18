"use client";

import Link from 'next/link';
import { ShoppingBasket, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBasket } from '@/context/basket-context';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/supabase';

export function Navbar() {
  const { items } = useBasket();
  const { user } = useUser();

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between lg:px-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-slate-100 uppercase">
            Travel<span className="text-primary">Ease</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/search?type=flight" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Discover</Link>
          <Link href={user ? "/profile/bookings" : loginFor('/profile/bookings')} className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">My Trips</Link>
          <Link href="/support" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Support</Link>
        </nav>

        <div className="flex items-center gap-3">
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
          <Button className="md:hidden rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20" variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
