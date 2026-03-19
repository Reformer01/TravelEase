"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/supabase';

export default function ConfirmationPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const auth = useAuth();
  const { user } = useUser();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await auth.auth.getSession();
      if (error) {
        console.error('Failed to get Supabase session', error);
        setLoading(false);
        setError(error?.message || 'Failed to get session');
        return;
      }
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setLoading(false);
        setError('No access token found');
        return;
      }

      const res = await fetch(`/api/bookings/by-reference?reference=${encodeURIComponent(bookingId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const raw = await res.text();
      const json = raw
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return { raw };
            }
          })()
        : {};
      if (!res.ok) {
        console.error('Failed to fetch booking', json);
        setLoading(false);
        setError((json as any).error);
        return;
      }

      setPurchase({
        items: (json as any).items?.map((it: any) => it.snapshot) || [],
        total: (json as any).booking?.total_amount,
        date: (json as any).booking?.booking_date
          ? new Date((json as any).booking.booking_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : undefined,
        booking: (json as any).booking,
      });
      setLoading(false);
    };

    load();
  }, [auth, bookingId, user]);

  const firstItem = purchase?.items?.[0];
  const booking = purchase?.booking;
  const userEmail = user?.email || 'user@travelease.com';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!purchase || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">We couldn't find a booking with reference #{bookingId}.</p>
          <Link href="/profile/bookings" className="bg-primary text-white px-6 py-3 rounded-xl">View My Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Navigation Bar / Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 lg:px-40 bg-background-light dark:bg-background-dark">
          <div className="flex items-center gap-4">
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 uppercase">Booking Confirmed</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center rounded-xl h-10 bg-primary/10 text-primary px-4 text-sm font-bold hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] mr-2">share</span>
              Share
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-12 lg:px-40 flex flex-col items-center">
          <div className="max-w-[600px] w-full flex flex-col items-center">
            {/* Success Icon & Title */}
            <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-6xl">check_circle</span>
              </div>
              <h1 className="text-[32px] font-bold leading-tight text-center text-slate-900 dark:text-slate-100 font-headline">Success!</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mt-2">Your trip is booked and ready to go.</p>
              <div className="mt-4 px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reference: #{bookingId}</span>
              </div>
            </div>

            {/* Trip Summary Card */}
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mb-8">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100 font-headline">Trip Summary</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative">
                    <Image 
                      alt={firstItem?.title || "Trip"} 
                      fill 
                      className="object-cover" 
                      src={firstItem?.image || "https://picsum.photos/seed/travel/200/200"}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-primary uppercase">{firstItem?.type || 'Trip'} Package</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{firstItem?.title || 'Your Journey'}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{purchase?.date || 'Upcoming'}</span>
                  </div>
                </div>
              </div>
              
              {/* Traveler & Price Grid */}
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travelers</span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-slate-500">group</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">1 Adult</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
                  <span className="text-xl font-bold text-primary">₦{Number(purchase?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Location & Date Footer of Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight font-semibold">Location</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{firstItem?.location || 'Various'}</p>
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight font-semibold">Confirmed On</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{purchase?.date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/profile/bookings" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined">visibility</span>
                  View My Bookings
                </button>
              </Link>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-xl h-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">download</span>
                Download Receipt
              </button>
            </div>

            {/* Support Message */}
            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Need help? <Link className="text-primary hover:underline font-medium" href="/support">Contact Support</Link>
              </p>
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          © 2026 TravelEase. All rights reserved.
        </footer>
      </div>
    </div>
  );
}