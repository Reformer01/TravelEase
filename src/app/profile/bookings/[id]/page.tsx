
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

const MOCK_DATA: Record<string, any> = {
  "TE-88291": {
    id: "TE-88291",
    location: "Santorini, Greece",
    date: "October 12 - October 19, 2024",
    status: "Confirmed",
    heroImage: "https://picsum.photos/seed/santorini-details/1200/800",
    types: ["flight", "hotel"],
    flight: {
      from: "LHR", fromCity: "London, UK", fromTime: "10:30 AM",
      to: "JTR", toCity: "Santorini, GR", toTime: "1:45 PM",
      airline: "Aegean Airlines", flightNum: "A3 420", duration: "3h 15m",
      class: "Economy Class"
    },
    hotel: {
      name: "Iconic Santorini, a Boutique Cave Hotel",
      address: "Imerovigli, Santorini, 84700",
      checkIn: "Oct 12, 3:00 PM",
      checkOut: "Oct 19, 11:00 AM",
      room: "Deluxe Cave Suite (1 Bedroom)",
      image: "https://picsum.photos/seed/hotel-cave/400/400"
    },
    price: { flight: 840, hotel: 2150, taxes: 124.50, total: 3114.50 }
  },
  "FL-77210": {
    id: "FL-77210",
    location: "New York, USA",
    date: "November 05, 2024",
    status: "Confirmed",
    heroImage: "https://picsum.photos/seed/ny-skyline/1200/800",
    types: ["flight"],
    flight: {
      from: "LHR", fromCity: "London, UK", fromTime: "08:00 AM",
      to: "JFK", toCity: "New York, USA", toTime: "11:15 AM",
      airline: "British Airways", flightNum: "BA 173", duration: "8h 15m",
      class: "Business Class"
    },
    price: { flight: 542, taxes: 45.00, total: 587.00 }
  },
  "HT-44921": {
    id: "HT-44921",
    location: "Tokyo, Japan",
    date: "December 01 - December 08, 2024",
    status: "Payment Pending",
    heroImage: "https://picsum.photos/seed/tokyo-night/1200/800",
    types: ["hotel"],
    hotel: {
      name: "Park Hyatt Tokyo",
      address: "3-7-1-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo",
      checkIn: "Dec 01, 2:00 PM",
      checkOut: "Dec 08, 12:00 PM",
      room: "Park View Deluxe Suite",
      image: "https://picsum.photos/seed/park-hyatt/400/400"
    },
    price: { hotel: 2100, taxes: 180.00, total: 2280.00 }
  }
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const booking = MOCK_DATA[id as string] || MOCK_DATA["TE-88291"];

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <div className="layout-container flex h-full grow flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-3 lg:px-40">
          <Link href="/profile/bookings" className="flex items-center gap-4 text-primary">
            <span className="material-symbols-outlined font-bold">arrow_back</span>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Booking Details</h2>
          </Link>
          <div className="flex gap-2">
            <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">share</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-6 px-4 lg:px-0 gap-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-xl min-h-80 shadow-lg bg-slate-900">
            <Image 
              src={booking.heroImage} 
              alt={booking.location} 
              fill 
              className="object-cover opacity-70" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {booking.status === 'Confirmed' ? 'Upcoming Trip' : 'Awaiting Payment'}
                </span>
              </div>
              <h1 className="text-white text-4xl font-bold leading-tight">{booking.location}</h1>
              <p className="text-slate-200 text-lg">{booking.date}</p>
            </div>
          </div>

          {/* Status Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full flex items-center justify-center ${
                booking.status === 'Confirmed' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              }`}>
                <span className="material-symbols-outlined">
                  {booking.status === 'Confirmed' ? 'check_circle' : 'pending'}
                </span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">
                  Booking {booking.status}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Reference: <span className="font-mono text-primary uppercase">#{booking.id}</span></p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all">Invoice</button>
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Modify</button>
            </div>
          </div>

          {/* Itinerary Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold px-1">Your Itinerary</h2>
            
            {/* Conditional Flight Card */}
            {booking.types.includes('flight') && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                    <span className="font-bold text-sm uppercase tracking-wide">Flight Details</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{booking.flight.class}</span>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 flex justify-between items-center w-full">
                    <div>
                      <p className="text-3xl font-bold">{booking.flight.from}</p>
                      <p className="text-sm text-slate-500">{booking.flight.fromCity}</p>
                      <p className="text-xs font-bold mt-1">{booking.flight.fromTime}</p>
                    </div>
                    <div className="flex flex-col items-center px-4 flex-1">
                      <div className="w-full flex items-center gap-2">
                        <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-700 border-dotted border-b-2"></div>
                        <span className="material-symbols-outlined text-slate-400 rotate-90">flight</span>
                        <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-700 border-dotted border-b-2"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">{booking.flight.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{booking.flight.to}</p>
                      <p className="text-sm text-slate-500">{booking.flight.toCity}</p>
                      <p className="text-xs font-bold mt-1">{booking.flight.toTime}</p>
                    </div>
                  </div>
                  <div className="w-full md:w-px md:h-16 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">airplane_ticket</span>
                    </div>
                    <div>
                      <p className="font-bold">{booking.flight.airline}</p>
                      <p className="text-sm text-slate-500">Flight {booking.flight.flightNum}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Hotel Card */}
            {booking.types.includes('hotel') && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">hotel</span>
                  <span className="font-bold text-sm uppercase tracking-wide">Accommodation</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 h-32 relative rounded-lg overflow-hidden shrink-0">
                      <Image fill className="object-cover" src={booking.hotel.image} alt={booking.hotel.name} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{booking.hotel.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{booking.hotel.address}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Check-in</p>
                          <p className="font-bold">{booking.hotel.checkIn}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Check-out</p>
                          <p className="font-bold">{booking.hotel.checkOut}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Payment Summary */}
          <section className="flex flex-col gap-4">
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold px-1">Payment Summary</h2>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
              <div className="space-y-3 mb-6">
                {booking.price.flight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Flight</span>
                    <span className="font-medium">${booking.price.flight.toFixed(2)}</span>
                  </div>
                )}
                {booking.price.hotel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Accommodation</span>
                    <span className="font-medium">${booking.price.hotel.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Taxes & Fees</span>
                  <span className="font-medium">${booking.price.taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-bold text-primary">${booking.price.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">credit_card</span>
                  <span className="text-xs font-bold text-slate-500">Visa ending in 4242</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  booking.status === 'Confirmed' ? 'text-green-600 bg-green-100' : 'text-amber-600 bg-amber-100'
                }`}>
                  {booking.status === 'Confirmed' ? 'PAID' : 'PENDING'}
                </span>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-auto px-6 py-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">Need help? <Link href="#" className="text-primary font-bold">Contact Support</Link></p>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">© 2024 TravelEase Global Inc.</p>
        </footer>
      </div>
    </div>
  );
}
