
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useBasket } from '@/context/basket-context';
import { useAuth, useUser } from '@/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BasketPage() {
  const { items, removeFromBasket, totalPrice, isLoading } = useBasket();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  const flights = items.filter(item => item.type === 'flight');
  const hotels = items.filter(item => item.type === 'hotel');
  const activities = items.filter(item => item.type === 'activity');

  const taxesAndFees = Math.floor(totalPrice * 0.08);
  const grandTotal = totalPrice + taxesAndFees;

  const handleVerify = async () => {
    if (!user) {
      router.push(loginFor('/basket'));
      return;
    }
    setIsVerifying(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      const res = await fetch('/api/availability/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error('Availability verify failed', json);
        setIsVerifying(false);
        return;
      }
      const token = json.token as string;
      router.push(`/checkout?availabilityToken=${encodeURIComponent(token)}`);
    } catch (e) {
      console.error('Availability verify error', e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined block text-2xl">flight_takeoff</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">TravelEase</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href="/">Home</Link>
              <Link className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href={user ? "/profile/bookings" : loginFor('/profile/bookings')}>Bookings</Link>
              <Link className="text-sm font-semibold text-primary" href="/basket">Basket</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link href={user ? "/profile" : loginFor('/profile')}>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                  <Image width={32} height={32} alt="Profile" src={(user?.user_metadata?.avatar_url as string | undefined) || "https://picsum.photos/seed/user/200/200"} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <nav className="flex text-sm text-slate-500 dark:text-slate-400 gap-2 items-center mb-2">
            <Link className="hover:text-primary" href="/search">Search</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Basket</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight">Your Basket</h1>
          <p className="text-slate-600 dark:text-slate-400">Review your selections before checkout.</p>
        </div>

        {!user && items.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-bold">You’re browsing as a guest</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in to verify availability and proceed to checkout. Your basket will be saved to your account and you can view your <Link href="/profile/bookings" className="text-primary hover:underline font-medium">Bookings</Link> anytime.
              </p>
            </div>
            <Link href={loginFor('/basket')} className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl text-white font-bold text-center">
              Sign in to continue
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-48 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 h-64 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mt-6" />
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">shopping_basket</span>
            <h3 className="text-xl font-bold">Your basket is empty</h3>
            <p className="text-slate-500 mb-8">Looks like you haven't added any trips yet.</p>
            <Link href="/search">
              <button className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-xl text-white font-bold transition-all">Start Exploring</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Flights Section */}
              {flights.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                    <h2 className="text-xl font-bold">Flights</h2>
                  </div>
                  {flights.map((flight) => (
                    <div key={flight.basketId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-4">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-2xl font-bold">LHR</span>
                                <span className="text-xs text-slate-500">London, UK</span>
                              </div>
                              <div className="flex flex-col items-center flex-1 px-4">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">7h 45m</span>
                                <div className="w-full h-px bg-slate-200 dark:bg-slate-700 relative my-2">
                                  <span className="material-symbols-outlined absolute left-1/2 -translate-x-1/2 -top-3 text-primary bg-white dark:bg-slate-900 px-1">flight</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Non-stop</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold">JFK</span>
                                <span className="text-xs text-slate-500">New York, USA</span>
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Oct 24, 2023
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">airline_seat_recline_extra</span>
                                {flight.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between border-l border-slate-100 dark:border-slate-800 pl-6">
                            <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Subtotal</p>
                              <p className="text-2xl font-black text-primary">₦{flight.price.toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={() => removeFromBasket(flight.basketId!)}
                              className="text-sm font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Hotels Section */}
              {hotels.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">hotel</span>
                    <h2 className="text-xl font-bold">Hotels</h2>
                  </div>
                  {hotels.map((hotel) => (
                    <div key={hotel.basketId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-4">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-200 shrink-0 relative">
                          <Image fill alt="Hotel room" className="object-cover" src={hotel.image} />
                        </div>
                        <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-1 text-primary">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-sm ${i < Math.floor(hotel.rating) ? 'FILL-1' : ''}`}>star</span>
                              ))}
                            </div>
                            <h3 className="text-lg font-bold">{hotel.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">location_on</span>
                              {hotel.location || 'Manhattan, New York'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end justify-between border-l border-slate-100 dark:border-slate-800 pl-6">
                            <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Subtotal</p>
                              <p className="text-2xl font-black text-primary">₦{hotel.price.toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={() => removeFromBasket(hotel.basketId!)}
                              className="text-sm font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Activities Section */}
              {activities.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">local_activity</span>
                    <h2 className="text-xl font-bold">Activities</h2>
                  </div>
                  {activities.map((activity) => (
                    <div key={activity.basketId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-4">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-200 shrink-0 relative">
                          <Image fill alt="Activity" className="object-cover" src={activity.image} />
                        </div>
                        <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-bold">{activity.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">location_on</span>
                              {activity.location || 'Local Tour'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end justify-between border-l border-slate-100 dark:border-slate-800 pl-6">
                            <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Subtotal</p>
                              <p className="text-2xl font-black text-primary">₦{activity.price.toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={() => removeFromBasket(activity.basketId!)}
                              className="text-sm font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <div className="flex gap-4 items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">Prices and availability are subject to change until booking is completed. Use 'Verify Availability' to lock in your selections.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Items ({items.length})</span>
                    <span>₦{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span>Taxes & Fees</span>
                    <span>₦{taxesAndFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-black text-primary tracking-tight">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isVerifying ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">verified_user</span>
                        Verify Availability
                      </>
                    )}
                  </button>
                  <button className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">bookmark</span>
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
