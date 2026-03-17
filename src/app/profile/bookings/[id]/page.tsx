
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const bookingRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, 'users', user.uid, 'bookings', id as string);
  }, [db, user, id]);

  const itemsQuery = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return query(collection(db, 'users', user.uid, 'bookings', id as string, 'booking_items'));
  }, [db, user, id]);

  const { data: booking, isLoading: isBookingLoading } = useDoc(bookingRef);
  const { data: items, isLoading: isItemsLoading } = useCollection(itemsQuery);

  const handleCancel = () => {
    if (!bookingRef || !id) return;
    if (confirm('Are you sure you want to cancel this trip?')) {
      setIsDeleting(true);
      deleteDocumentNonBlocking(bookingRef);
      toast({
        title: "Booking Cancelled",
        description: "Your trip has been removed from your account.",
      });
      router.push('/profile/bookings');
    }
  };

  if (isUserLoading || isBookingLoading || isItemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
        <Link href="/profile/bookings">
          <Button>Back to My Bookings</Button>
        </Link>
      </div>
    );
  }

  const flightItems = items?.filter(item => item.type === 'flight') || [];
  const hotelItems = items?.filter(item => item.type === 'hotel') || [];

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-3 lg:px-40">
          <Link href="/profile/bookings" className="flex items-center gap-4 text-primary">
            <div className="size-6 flex items-center justify-center">
              <span className="material-symbols-outlined font-bold">arrow_back</span>
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Booking Details</h2>
          </Link>
          <div className="flex gap-2">
            <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">share</span>
            </button>
            <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">more_horiz</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-6 px-4 lg:px-0 gap-6">
          {/* Hero Header */}
          <div className="relative group">
            <div className="relative flex flex-col justify-end overflow-hidden rounded-xl min-h-80 shadow-lg bg-slate-900">
              <Image 
                src={booking.image || "https://picsum.photos/seed/travel-details/1200/800"} 
                alt={booking.location} 
                fill 
                className="object-cover opacity-60"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {booking.status === 'confirmed' ? 'Upcoming Trip' : 'Status: ' + booking.status}
                  </span>
                </div>
                <h1 className="text-white text-4xl font-bold leading-tight">{booking.location}</h1>
                <p className="text-slate-200 text-lg">
                  {booking.bookingDate ? format(new Date(booking.bookingDate), 'MMMM dd, yyyy') : 'Date Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full flex items-center justify-center ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              }`}>
                <span className="material-symbols-outlined">
                  {booking.status === 'confirmed' ? 'check_circle' : 'pending'}
                </span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">
                  Booking {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Reference: <span className="font-mono text-primary uppercase">#{booking.bookingReference}</span></p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="default" className="flex-1 sm:flex-none font-bold">
                <span className="material-symbols-outlined mr-2">download</span>
                Invoice
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none font-bold">
                Modify
              </Button>
            </div>
          </div>

          {/* Itinerary Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold px-1">Your Itinerary</h2>
            
            {/* Flight Cards */}
            {flightItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                    <span className="font-bold text-sm uppercase tracking-wide">Flight Details</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">Economy Class</span>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 flex justify-between items-center w-full">
                    <div className="text-center sm:text-left">
                      <p className="text-3xl font-bold">LHR</p>
                      <p className="text-sm text-slate-500">London, UK</p>
                      <p className="text-xs font-bold mt-1">10:30 AM</p>
                    </div>
                    <div className="flex flex-col items-center px-4 flex-1">
                      <div className="w-full flex items-center gap-2">
                        <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-700 border-dotted border-b-2"></div>
                        <span className="material-symbols-outlined text-slate-400 rotate-90">flight</span>
                        <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-700 border-dotted border-b-2"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">3h 15m</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-3xl font-bold">JTR</p>
                      <p className="text-sm text-slate-500">{booking.location}</p>
                      <p className="text-xs font-bold mt-1">1:45 PM</p>
                    </div>
                  </div>
                  <div className="w-full md:w-px md:h-16 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">airplane_ticket</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{item.provider}</p>
                      <p className="text-sm text-slate-500">Flight {item.id.split('-')[0].toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Hotel Cards */}
            {hotelItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">hotel</span>
                  <span className="font-bold text-sm uppercase tracking-wide">Accommodation</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 h-32 relative rounded-lg overflow-hidden shrink-0">
                      <Image fill className="object-cover" src={item.image} alt={item.title} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-sm text-slate-500 mb-4">{booking.location}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Check-in</p>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {format(new Date(item.startDate), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Check-out</p>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                             Oct 19, 11:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-primary text-sm">bed</span>
                        <span className="font-medium">Standard Selection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Traveler & Payment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traveler Information */}
            <section className="flex flex-col gap-4">
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold px-1">Travelers</h2>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm h-full">
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
                      {user.displayName ? user.displayName.substring(0, 2) : 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{user.displayName || 'Traveler'}</p>
                      <p className="text-xs text-slate-500">Primary Contact • Adult</p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Payment Summary */}
            <section className="flex flex-col gap-4">
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold px-1">Payment Summary</h2>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm h-full">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Selection</span>
                    <span className="font-medium">${booking.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Taxes & Fees</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between">
                    <span className="font-bold">Total Paid</span>
                    <span className="font-bold text-primary">${booking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">credit_card</span>
                    <span className="text-xs font-bold text-slate-500">Visa ending in 4242</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">PAID</span>
                </div>
              </div>
            </section>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
              <div>
                <p className="font-bold text-red-700 dark:text-red-400">Cancel Booking</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">Cancellations are managed as per our standard policy.</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30 font-bold hover:bg-red-100 dark:hover:bg-red-900/20"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                {isDeleting ? 'Cancelling...' : 'Cancel Trip'}
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto px-6 py-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Need help with your booking? <Link className="text-primary font-bold" href="/support">Contact Support</Link></p>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">© 2024 TravelEase Global Inc.</p>
        </footer>
      </div>
    </div>
  );
}
