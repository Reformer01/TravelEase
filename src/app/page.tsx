"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/supabase';
import { Navbar } from '@/components/layout/navbar';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [destination, setDestination] = useState('');

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // hero inputs use id but also need names — read via DOM as fallback
    const dest = (fd.get('where') as string) || destination;
    const datesEl = e.currentTarget.querySelector('#hero-dates') as HTMLInputElement | null;
    const guestsEl = e.currentTarget.querySelector('#hero-guests') as HTMLInputElement | null;
    const params = new URLSearchParams();
    if (dest) params.set('location', dest);
    if (datesEl?.value) params.set('dates', datesEl.value);
    if (guestsEl?.value) params.set('guests', guestsEl.value);
    const q = params.toString();
    router.push(`/search${q ? `?${q}` : ''}`);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-col flex-1">
          {/* Hero Section */}
          <section className="relative px-4 py-8 lg:px-20 lg:py-12">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[520px] flex flex-col items-center justify-center p-6 lg:p-12 text-center">
              <div className="absolute inset-0 opacity-60">
                <Image 
                  className="w-full h-full object-cover" 
                  alt="Tropical beach" 
                  src="https://picsum.photos/seed/tropical/1200/800" 
                  fill 
                  priority
                  data-ai-hint="tropical beach"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="relative z-10 max-w-3xl flex flex-col gap-6">
                <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight">
                  Find Your Next Adventure
                </h1>
                <p className="text-slate-200 text-lg lg:text-xl font-medium">
                  Book flights, hotels, and unique experiences around the world.
                </p>
                {/* Search Bar Container */}
                <form onSubmit={handleSearch} className="mt-4 w-full bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl flex flex-col lg:flex-row gap-2">
                  <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                    <label htmlFor="hero-where" className="sr-only">Where to?</label>
                    <span className="material-symbols-outlined text-primary mr-3" aria-hidden="true">location_on</span>
                    <input 
                      id="hero-where"
                      name="where"
                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-primary/50 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 h-auto" 
                      placeholder="Where to?" 
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                    <label htmlFor="hero-dates" className="sr-only">Dates</label>
                    <span className="material-symbols-outlined text-primary mr-3" aria-hidden="true">calendar_month</span>
                    <input id="hero-dates" name="dates" className="w-full bg-transparent border-none focus:ring-2 focus:ring-primary/50 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 h-auto" placeholder="Dates" type="date" />
                  </div>
                  <div className="flex-1 flex items-center px-4 py-3">
                    <label htmlFor="hero-guests" className="sr-only">Guests</label>
                    <span className="material-symbols-outlined text-primary mr-3" aria-hidden="true">group</span>
                    <input id="hero-guests" name="guests" className="w-full bg-transparent border-none focus:ring-2 focus:ring-primary/50 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 h-auto" placeholder="Guests" type="number" min="1" defaultValue={2} />
                  </div>
                  <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <span className="material-symbols-outlined" aria-hidden="true">search</span>
                    Search
                  </button>
                </form>
              </div>
            </div>
          </section>
          {/* Categories */}
          <section className="px-4 lg:px-20 py-8">
            <div className="flex flex-wrap justify-center gap-4 lg:gap-8 border-b border-slate-200 dark:border-slate-800 pb-8">
              <Link className="flex flex-col items-center gap-2 group" href="/search?type=flight">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">flight</span>
                </div>
                <span className="text-sm font-bold">Flights</span>
              </Link>
              <Link className="flex flex-col items-center gap-2 group" href="/search?type=hotel">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">hotel</span>
                </div>
                <span className="text-sm font-bold">Hotels</span>
              </Link>
              <Link className="flex flex-col items-center gap-2 group" href="/search?type=activity">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">local_activity</span>
                </div>
                <span className="text-sm font-bold">Activities</span>
              </Link>
              <Link className="flex flex-col items-center gap-2 group" href="/search?type=car">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">directions_car</span>
                </div>
                <span className="text-sm font-bold">Car Rental</span>
              </Link>
            </div>
          </section>
          {/* Featured Deals */}
          <section className="px-4 lg:px-20 py-8 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Unbeatable Travel Deals</h2>
              <Link className="text-primary font-bold text-sm flex items-center gap-1 hover:underline" href="/search">
                View all
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Deal 1 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                <div className="relative h-64 overflow-hidden">
                  <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Luxury resort" src="https://picsum.photos/seed/bali/800/600" fill data-ai-hint="luxury resort" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    50% OFF
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Bali Stays</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Starting at ₦99/night. Tropical paradise awaits with private pool villas.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black text-xl">₦99 <span className="text-slate-400 text-xs font-normal">/night</span></span>
                    <Link href="/search?type=hotel&location=Bali">
                      <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Book Now</button>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Deal 2 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                <div className="relative h-64 overflow-hidden">
                  <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Ski resort" src="https://picsum.photos/seed/alps/800/600" fill data-ai-hint="ski resort" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Winter Sale
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Alpine Winter Sale</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Save on luxury ski resorts. Early bird bookings for the season.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black text-xl">₦150 <span className="text-slate-400 text-xs font-normal">/night</span></span>
                    <Link href="/search?type=hotel&location=Alps">
                      <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Book Now</button>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Deal 3 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                <div className="relative h-64 overflow-hidden">
                  <Image className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="London skyline" src="https://picsum.photos/seed/london/800/600" fill data-ai-hint="london city" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Free Breakfast
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">London City Breaks</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Inclusive of full English breakfast and city tour guide.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black text-xl">₦210 <span className="text-slate-400 text-xs font-normal">/night</span></span>
                    <Link href="/search?type=hotel&location=London">
                      <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Book Now</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-20 border-t border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <span className="material-symbols-outlined text-2xl font-bold">flight_takeoff</span>
                <span className="text-white text-lg font-black uppercase tracking-tighter">TravelEase</span>
              </div>
              <p className="text-sm">Making travel simple, affordable, and accessible for everyone, everywhere.</p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Company</h4>
              <Link className="text-sm hover:text-primary transition-colors" href="/support">About Us</Link>
              <Link className="text-sm hover:text-primary transition-colors" href="/support">Careers</Link>
              <Link className="text-sm hover:text-primary transition-colors" href="/support">Press</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Support</h4>
              <Link className="text-sm hover:text-primary transition-colors" href="/support">Help Center</Link>
              <Link className="text-sm hover:text-primary transition-colors" href="/support">Terms of Service</Link>
              <Link className="text-sm hover:text-primary transition-colors" href="/support">Privacy Policy</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <Link className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined">share</span>
                </Link>
                <Link className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="mailto:support@travelease.com">
                  <span className="material-symbols-outlined">mail</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs">
            © 2026 TravelEase. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}