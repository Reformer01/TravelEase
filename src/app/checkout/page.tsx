
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/firebase';

export default function CheckoutPage() {
  const router = useRouter();
  const { totalPrice, items, clearBasket } = useBasket();
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd'>('card');

  const taxesAndFees = Math.floor(totalPrice * 0.1);
  const serviceFee = Math.floor(totalPrice * 0.02);
  const grandTotal = totalPrice + taxesAndFees + serviceFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save the "last purchase" to localStorage for the confirmation page
    localStorage.setItem('travelease_last_purchase', JSON.stringify({
      items,
      total: grandTotal,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }));

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      const bookingId = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      clearBasket();
      toast({
        title: "Payment Successful",
        description: `Your booking ${bookingId} has been confirmed.`,
      });
      router.push(`/confirmation/${bookingId}`);
    }, 2500);
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
            <div className="flex flex-1 justify-end gap-6 items-center">
              <nav className="hidden md:flex items-center gap-8">
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="/">Home</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href={user ? "/profile/bookings" : "/auth/login"}>Bookings</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="/support">Support</Link>
              </nav>
              <Link href={user ? "/profile" : "/auth/login"}>
                <button className="flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link className="hover:text-primary" href="/search">Search Results</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="hover:text-primary">Passenger Details</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Secure Payment</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                      <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3" placeholder="John" type="text" defaultValue={user?.displayName?.split(' ')[0] || ''} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                      <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3" placeholder="Doe" type="text" defaultValue={user?.displayName?.split(' ')[1] || ''} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3" placeholder="john@example.com" type="email" defaultValue={user?.email || ''} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3" placeholder="+1 000 000 0000" type="tel" />
                    </div>
                  </div>
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
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Card Number</label>
                        <div className="relative">
                          <input required className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-transparent pr-12 focus:border-primary focus:ring-primary h-10 px-3" placeholder="0000 0000 0000 0000" type="text" />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <span className="material-symbols-outlined text-slate-400">credit_card</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</label>
                          <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3" placeholder="MM / YY" type="text" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">CVV</label>
                          <input required className="rounded-lg border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-primary h-10 px-3" placeholder="***" type="password" />
                        </div>
                      </div>
                      <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                          {loading ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
                          {!loading && <span className="material-symbols-outlined">lock</span>}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified_user</span>
                          Your payment information is encrypted and secure.
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
                        <p className="font-bold text-sm text-primary">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Base Fare ({items.length} items)</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Taxes & Fees</span>
                      <span className="font-medium">${taxesAndFees.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Service Fee</span>
                      <span className="font-medium">${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold">Total Amount</span>
                      <span className="font-black text-2xl text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
