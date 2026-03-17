"use client";

import Link from 'next/link';
import { Plane, ShoppingBasket, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBasket } from '@/context/basket-context';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const { items } = useBasket();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between lg:px-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-primary">
            <Plane className="h-8 w-8 rotate-45" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-slate-100">
            Travel<span className="text-primary">Ease</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/search?type=flight" className="text-sm font-semibold hover:text-primary transition-colors">Discover</Link>
          <Link href="/search?type=hotel" className="text-sm font-semibold hover:text-primary transition-colors">Trips</Link>
          <Link href="/search?type=activity" className="text-sm font-semibold hover:text-primary transition-colors">Support</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/basket">
            <Button variant="secondary" size="icon" className="relative rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20">
              <ShoppingBasket className="h-5 w-5" />
              {items.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] min-w-[1.25rem] h-5 bg-primary text-white" variant="default">
                  {items.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/auth/login" className="hidden sm:block">
            <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20">
              <User className="h-5 w-5" />
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
