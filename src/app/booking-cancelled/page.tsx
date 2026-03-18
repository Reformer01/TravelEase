"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookingCancelledPage() {
  const router = useRouter();
  const [bookingReference, setBookingReference] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<number>(0);

  useEffect(() => {
    // In a real app, these would come from query params or API
    setBookingReference("STN-99281-XC");
    setRefundAmount(840.00);
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Navigation Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/10 px-6 py-4 lg:px-40 bg-white dark:bg-background-dark/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary">
            <div className="size-8 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-[-0.015em]">TravelEase</h2>
          </div>
          <button 
            onClick={() => router.push("/profile/bookings")}
            className="flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>

        {/* Main Content Container */}
        <main className="flex flex-1 justify-center py-10 px-6 lg:px-40">
          <div className="layout-content-container flex flex-col max-w-[640px] flex-1 items-center text-center">
            {/* Success Icon & Status */}
            <div className="mb-8 relative">
              <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-8 ring-emerald-500/5">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
            </div>
            
            <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl md:text-4xl font-extrabold leading-tight pb-2">
              Booking Cancelled Successfully
            </h1>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-semibold border border-primary/20 mb-6">
              <span className="material-symbols-outlined text-lg">confirmation_number</span>
              Reference: #{bookingReference}
            </div>

            {/* Visual Divider/Context Image */}
            <div className="w-full max-w-[480px] mb-8">
              <div className="w-full aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                <img 
                  alt="Scenic travel background" 
                  className="w-full h-full object-cover opacity-60 dark:opacity-40" 
                  src="https://picsum.photos/seed/travel-cancelled/640/360"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-slate-900/90 p-6 rounded-lg shadow-xl backdrop-blur-sm max-w-[80%]">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Refund Initiated</p>
                    <p className="text-2xl font-bold text-primary">₦{refundAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Details */}
            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 w-full mb-10 shadow-sm">
              <div className="flex items-start gap-4 text-left">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Refund Status</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">
                    A total refund of <span className="font-semibold text-slate-900 dark:text-slate-100">₦{refundAmount.toLocaleString()}</span> has been initiated to your original payment method. 
                    Funds typically reflect in your account within <span className="font-semibold">3-5 business days</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/profile/bookings" className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-8 py-4 font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 min-w-[200px]">
                <span className="material-symbols-outlined">format_list_bulleted</span>
                Return to My Bookings
              </Link>
              <Link href="/" className="flex items-center justify-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-8 py-4 font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-700 transition-all min-w-[200px]">
                <span className="material-symbols-outlined">home</span>
                Go to Home
              </Link>
            </div>

            <p className="mt-12 text-slate-400 dark:text-slate-500 text-xs">
              Need help with your cancellation? <Link className="text-primary hover:underline font-medium" href="/support">Contact Customer Support</Link>
            </p>
          </div>
        </main>

        {/* Footer Section */}
        <footer className="px-6 py-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">© 2026 TravelEase. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
