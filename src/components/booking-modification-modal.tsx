"use client";

import * as React from "react";
import { useState } from "react";
import { BookingDates } from '@/types/dates';

interface BookingModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSave: (updates: BookingDates) => void;
  loading?: boolean;
}

export function BookingModificationModal({ open, onOpenChange, booking, onSave, loading = false }: BookingModificationModalProps) {
  const [checkIn, setCheckIn] = useState(booking?.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : '');
  const [checkOut, setCheckOut] = useState(() => {
    if (booking?.booking_date) {
      const date = new Date(booking.booking_date);
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    }
    return '';
  });
  const [adults, setAdults] = useState(booking?.adults || 2);
  const [children, setChildren] = useState(booking?.children || 0);

  const handleSave = () => {
    onSave({ checkIn, checkOut, adults, children });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const originalNights = 7; 
  const nightsDifference = nights - originalNights;
  
  // Calculate price (mock calculation)
  const originalPrice = booking?.total_amount || 1420;
  const pricePerNight = originalPrice / originalNights;
  const newPrice = pricePerNight * nights;
  const priceDifference = newPrice - originalPrice;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-[560px] bg-background-light dark:bg-background-dark rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">edit_calendar</span>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight">Modify Your Booking</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{booking?.location || 'Destination'}</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Current Details Reference */}
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Current Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Dates</p>
                <p className="text-sm font-medium">
                  {booking?.booking_date ? formatDate(booking.booking_date) : 'Oct 12'} - 
                  {booking?.booking_date ? formatDate(new Date(new Date(booking.booking_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()) : 'Oct 19, 2023'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Guests</p>
                <p className="text-sm font-medium">{adults} Adults, {children} Children</p>
              </div>
            </div>
          </div>

          {/* Update Dates Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              Select New Dates
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Check-in</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">event</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Check-out</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">event</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Guests Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              Travelers
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Adults</label>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <button 
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="size-7 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="text-sm font-bold">{adults}</span>
                  <button 
                    onClick={() => setAdults(adults + 1)}
                    className="size-7 flex items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Children</label>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <button 
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="size-7 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="text-sm font-bold">{children}</span>
                  <button 
                    onClick={() => setChildren(children + 1)}
                    className="size-7 flex items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Price Update */}
          <div className="mt-8 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Live Price Update</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {nightsDifference > 0 ? `+ ${nightsDifference} Nights Added` : nightsDifference < 0 ? `${nightsDifference} Nights Removed` : 'No Change'}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">Original: ₦{originalPrice.toFixed(0)}</span>
                <span className="text-2xl font-bold text-primary">₦{newPrice.toFixed(0)}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Difference</p>
                <p className={`text-sm font-bold ${priceDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {priceDifference >= 0 ? '+' : ''}₦{priceDifference.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => onOpenChange(false)}
            className="flex-1 order-2 sm:order-1 px-6 py-3 rounded-xl font-bold text-sm bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-[1.5] order-1 sm:order-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Save Changes
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
