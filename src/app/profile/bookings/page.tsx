
"use client";

import { useAuth, useUser } from '@/supabase';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RequireAuth } from '@/components/require-auth';

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  const safeReadJson = useCallback(async (response: Response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }, []);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setIsBookingsLoading(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) return;

      const res = await fetch('/api/bookings/list', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await safeReadJson(res);

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!res.ok) {
        console.error('Failed to load bookings', { status: res.status, body: json });
        return;
      }

      setBookings((json as any)?.bookings || []);
    } catch (e) {
      console.error('Bookings load error', e);
    } finally {
      setIsBookingsLoading(false);
    }
  }, [auth, router, safeReadJson, user]);

  useEffect(() => {
    loadBookings();

    const onFocus = () => loadBookings();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadBookings();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadBookings]);

  if (isUserLoading || isBookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <RequireAuth>
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 sm:px-6 md:px-20 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-3 md:gap-8">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
            <h2 className="text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white uppercase">TravelEase</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-4 md:gap-8">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-semibold transition-colors" href="/">Home</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-semibold transition-colors" href="/search">Search</Link>
            <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-1" href="/profile/bookings">My Bookings</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-semibold transition-colors" href="/profile">Profile</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your upcoming journeys and travel history</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">event_upcoming</span>
            Booking History
          </h3>

          {!bookings || bookings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">luggage</span>
              <h3 className="text-xl font-bold">No bookings found</h3>
              <p className="text-slate-500 mb-8">Ready for an adventure? Start exploring today.</p>
              <Link href="/search">
                <button className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-xl text-white font-bold transition-all">Find Trips</button>
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <Link 
                key={booking.id} 
                href={`/profile/bookings/${booking.booking_reference || booking.id}`}
                className="block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-40 relative overflow-hidden">
                    <Image 
                      fill 
                      src={booking.image || "https://picsum.photos/seed/travel/400/300"} 
                      alt={booking.location} 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                          <span className="text-xs font-bold uppercase tracking-widest text-primary break-all">
                            Booking #{booking.booking_reference || booking.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white break-words">{booking.location}</h4>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                          {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-xs sm:text-sm text-slate-400">Total Price</p>
                        <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white break-all">₦{Number(booking.total_amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">{booking.title}</p>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/profile/bookings/${booking.booking_reference || booking.id}`);
                        }}
                        className="flex items-center text-primary font-bold text-sm gap-1 hover:translate-x-1 transition-transform bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20"
                      >
                        View Details
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
    </RequireAuth>
  );
}
