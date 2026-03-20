
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useUser } from '@/supabase';
import { RequireAuth } from '@/components/require-auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { totalPrice, items, clearBasket } = useBasket();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd'>('card');

  const selectedCar = items.find((it) => it.type === 'car') || null;
  const suggestedLocation = items.find((it) => typeof it.location === 'string' && it.location.trim())?.location;
  const browseCarsHref = suggestedLocation
    ? `/search?type=car&location=${encodeURIComponent(suggestedLocation)}`
    : '/search?type=car';

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  const taxesAndFees = Math.floor(totalPrice * 0.1);
  const serviceFee = Math.floor(totalPrice * 0.02);
  const grandTotal = totalPrice + taxesAndFees + serviceFee;

  const getAccessToken = async (): Promise<string | null> => {
    const { data, error } = await auth.auth.getSession();
    if (error) {
      console.error('Failed to get Supabase session', error);
      return null;
    }
    return data.session?.access_token ?? null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to book." });
      return;
    }

    setLoading(true);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast({ variant: "destructive", title: "Error", description: "Missing session." });
        setLoading(false);
        return;
      }

      const url = new URL(window.location.href);
      const availabilityToken = url.searchParams.get('availabilityToken');
      if (!availabilityToken) {
        toast({ variant: "destructive", title: "Error", description: "Missing availability verification. Please return to basket and verify." });
        setLoading(false);
        return;
      }

      // Read selected guestCount from form
      const formData = new FormData(e.currentTarget);
      const guestCount = Number(formData.get('guestCount')) || 2;

      const initRes = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'NGN',
          items,
          availabilityToken,
          paymentMethod,
          guestCount,
        }),
      });

      const initRaw = await initRes.text();
      const initJson = initRaw
        ? (() => {
            try {
              return JSON.parse(initRaw);
            } catch {
              return { raw: initRaw };
            }
          })()
        : {};
      if (!initRes.ok) {
        toast({ variant: "destructive", title: "Payment Error", description: (initJson as any)?.error || 'Unable to start payment.' });
        setLoading(false);
        return;
      }

      const authorizationUrl = (initJson as any).authorizationUrl as string | undefined;
      if (!authorizationUrl) {
        toast({ variant: "destructive", title: "Payment Error", description: 'Missing Paystack authorization URL.' });
        setLoading(false);
        return;
      }

      // Redirect to Paystack hosted checkout. Paystack will redirect back to /checkout/complete.
      window.location.href = authorizationUrl;
    } catch (err) {
      console.error('Checkout submit error', err);
      toast({ variant: "destructive", title: "Error", description: "Checkout failed." });
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your basket is empty</h2>
          <Link href="/search">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl">Go to Search</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-4 text-primary">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined">flight_takeoff</span>
              </div>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">TravelEase</h2>
            </Link>
            <div className="flex flex-1 justify-end gap-3 md:gap-6 items-center">
              <nav className="hidden md:flex items-center gap-8">
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="/">Home</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href={user ? "/profile/bookings" : loginFor('/profile/bookings')}>My Trips</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="/support">Support</Link>
              </nav>
              <Link href={user ? "/profile" : loginFor('/profile')}>
                <button className="flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <div className="flex items-center gap-2 min-w-0 overflow-x-auto whitespace-nowrap">
            <Link className="hover:text-primary" href="/search">Search Results</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="hover:text-primary">Passenger Details</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">Secure Payment</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Checkout</h1>
              <p className="text-slate-500 dark:text-slate-400">Complete your booking by providing the required details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  <h2 className="text-lg font-bold">Passenger Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3 text-sm" placeholder="John Doe" type="text" defaultValue={(user?.user_metadata?.full_name as string | undefined) || ''} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3 text-sm" placeholder="user@travelease.com" type="email" defaultValue={user?.email || ''} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3 text-sm" placeholder="+1 000 000 0000" type="tel" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">people</span>
                  <h2 className="text-lg font-bold">Number of Guests</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((count) => (
                      <label key={count} className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <input type="radio" name="guestCount" value={count} defaultChecked={count === 1} className="cursor-pointer" />
                        <span className="font-medium">{count} {count === 1 ? 'Guest' : 'Guests'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">airline_seat_flat</span>
                  <h2 className="text-lg font-bold">Booking Class</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1">
                      <input type="radio" name="bookingClass" value="economy" defaultChecked className="cursor-pointer" />
                      <span className="font-medium">Economy</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1">
                      <input type="radio" name="bookingClass" value="first" className="cursor-pointer" />
                      <span className="font-medium">First Class <span className="text-xs text-primary">(+₦5,000)</span></span>
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">directions_car</span>
                  <h2 className="text-lg font-bold">Car Rental</h2>
                </div>
                <div className="p-6 space-y-4">
                  {selectedCar ? (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold truncate">{selectedCar.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedCar.location || 'Pick-up location'} • {selectedCar.provider}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-slate-500">Price</p>
                          <p className="font-black text-primary">₦{Number(selectedCar.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        <Link href={browseCarsHref} className="text-sm font-bold text-primary hover:underline">
                          Change car
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Add a rental car for your trip by selecting one from our car rentals.
                      </p>
                      <Link
                        href={browseCarsHref}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-4 py-3 font-bold text-sm transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">search</span>
                        Browse cars
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Your selected car will appear in your basket and be included in your booking.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  <h2 className="text-lg font-bold">Travel Insurance</h2>
                </div>
                <div className="p-6 space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input type="checkbox" name="travelInsurance" value="true" className="cursor-pointer" />
                    <span className="font-medium">Add Travel Insurance <span className="text-xs text-primary">(+₦8,000)</span></span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive coverage for trip cancellation, medical emergencies, and lost baggage.</p>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">shield</span>
                    <h2 className="text-lg font-bold">Payment Gateway</h2>
                  </div>
                  <div className="flex items-center gap-1 opacity-60">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Powered by</span>
                    <span className="text-blue-600 font-extrabold text-sm">paystack</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 flex flex-col gap-2">
                      <button type="button" onClick={() => setPaymentMethod('card')} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${paymentMethod === 'card' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400'}`}>
                        <span className="material-symbols-outlined">credit_card</span>
                        <span className="font-semibold text-sm">Card</span>
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('bank')} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${paymentMethod === 'bank' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400'}`}>
                        <span className="material-symbols-outlined">account_balance</span>
                        <span className="font-semibold text-sm">Bank Transfer</span>
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('ussd')} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${paymentMethod === 'ussd' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400'}`}>
                        <span className="material-symbols-outlined">dialpad</span>
                        <span className="font-semibold text-sm">USSD</span>
                      </button>
                    </div>
                    <div className="flex-1 space-y-4 pt-2 md:pt-0">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Secure Payment</p>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400">lock</span>
                          <span className="text-xs text-slate-500">SSL encrypted • Powered by Paystack</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          You will be redirected to Paystack to complete payment. Do not enter your card or bank details on this page.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          By proceeding, you agree to our <Link href="/support/cancellation" className="text-primary hover:underline">cancellation policy</Link> and <Link href="/support/terms" className="text-primary hover:underline">terms of service</Link>.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                          {loading ? 'Redirecting...' : `Continue to Paystack (₦${grandTotal.toLocaleString()})`}
                          {!loading && <span className="material-symbols-outlined">open_in_new</span>}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified_user</span>
                          Secure payment powered by Paystack.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-lg">Booking Summary</h3>
                </div>
                <div className="p-5 space-y-6">
                  <div className="flex flex-col gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    {items.map((item) => (
                      <div key={item.basketId} className="flex items-center gap-3">
                        <div className="relative size-12 rounded overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.type} • {item.provider}</p>
                        </div>
                        <p className="font-bold text-sm text-primary">₦{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Base Fare ({items.length} items)</span>
                      <span className="font-medium">₦{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Taxes & Fees</span>
                      <span className="font-medium">₦{taxesAndFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Service Fee</span>
                      <span className="font-medium">₦{serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold">Total Amount</span>
                      <span className="font-black text-2xl text-primary">₦{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </RequireAuth>
  );
}
