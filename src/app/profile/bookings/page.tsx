
"use client";

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
          <p className="text-slate-500 font-medium">Loading your journeys...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display flex flex-col transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your upcoming journeys and travel history</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <Input 
              className="w-full pl-12 pr-4 py-6 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary shadow-sm" 
              placeholder="Search by destination or booking ID..." 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['All', 'Confirmed', 'Pending', 'Cancelled'].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? 'default' : 'secondary'}
                className={`h-11 rounded-xl font-bold px-6 transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Booking List */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">event_upcoming</span>
            Upcoming Trips
          </h3>

          {/* Santorini Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-56 h-48 md:h-auto relative overflow-hidden">
                <Image 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Santorini" 
                  src="https://picsum.photos/seed/santorini-booking/600/400"
                  data-ai-hint="Santorini sunset"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded">Booking #TE-88291</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase">Confirmed</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Santorini, Greece</h4>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      Oct 12 - Oct 19, 2024
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Paid</p>
                    <p className="text-2xl font-black text-primary">$1,840.00</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 gap-4">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Flight</span>
                      <span className="text-sm font-bold">Lufthansa A320</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Hotel</span>
                      <span className="text-sm font-bold">Azure Resort & Spa</span>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-black shadow-lg shadow-primary/20 transition-all">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tokyo Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm group">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-56 h-48 md:h-auto relative overflow-hidden">
                <Image 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Tokyo" 
                  src="https://picsum.photos/seed/tokyo-booking/600/400"
                  data-ai-hint="Tokyo skyline"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded">Booking #TE-91023</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">Payment Pending</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tokyo, Japan</h4>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      Nov 05 - Nov 15, 2024
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Price</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">$2,100.00</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 gap-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic font-medium">Please complete payment within 24 hours</p>
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-black shadow-lg shadow-primary/20">
                    Complete Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-16 mb-4">
            <span className="material-symbols-outlined text-slate-400">history</span>
            Past Trips
          </h3>

          {/* Paris Card */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden opacity-80 grayscale-[0.3] hover:grayscale-0 transition-all duration-500 group">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-56 h-48 md:h-auto relative overflow-hidden">
                <Image 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Paris" 
                  src="https://picsum.photos/seed/paris-booking/600/400"
                  data-ai-hint="Eiffel Tower"
                />
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Booking #TE-77102</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase">Completed</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-700 dark:text-slate-300 tracking-tight">Paris, France</h4>
                    <p className="text-slate-500 dark:text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      May 20 - May 25, 2024
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
                    <p className="text-2xl font-black text-slate-700 dark:text-slate-300">$1,250.00</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 gap-4">
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none text-primary border-primary/20 hover:bg-primary/10 font-black h-11 rounded-xl">Book Again</Button>
                    <Button variant="outline" className="flex-1 sm:flex-none text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 h-11 rounded-xl font-bold">Receipt</Button>
                  </div>
                  <button className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 font-black uppercase text-xs tracking-widest">
                    Leave a Review
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-16 flex justify-center">
          <nav className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary"><span className="material-symbols-outlined">chevron_left</span></Button>
            <Button className="h-10 w-10 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">1</Button>
            <Button variant="ghost" className="h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary font-bold">2</Button>
            <Button variant="ghost" className="h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary font-bold">3</Button>
            <span className="px-2 text-slate-400 font-bold">...</span>
            <Button variant="ghost" className="h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary font-bold">12</Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary"><span className="material-symbols-outlined">chevron_right</span></Button>
          </nav>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6 lg:px-20 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
            <span className="text-white text-xl font-black tracking-tighter uppercase">Travel<span className="text-primary">Ease</span></span>
          </div>
          <p className="text-sm font-medium">© 2024 TravelEase Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="text-slate-400 hover:text-primary transition-all hover:scale-110" href="#"><span className="material-symbols-outlined">share</span></Link>
            <Link className="text-slate-400 hover:text-primary transition-all hover:scale-110" href="#"><span className="material-symbols-outlined">mail</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
