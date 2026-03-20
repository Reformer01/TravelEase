"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useUser } from '@/supabase';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RequireAuth } from '@/components/require-auth';
import { CancellationModal } from '@/components/cancellation-modal';
import { BookingModificationModal } from '@/components/booking-modification-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  const [booking, setBooking] = useState<any>(null);
  const [items, setItems] = useState<any[] | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  const reloadBooking = useCallback(async () => {
    console.log('reloadBooking: starting refetch for booking', id);
    if (!user || !id) {
      console.log('reloadBooking: skipped - missing user or id');
      return;
    }
    setIsBookingLoading(true);
    setIsItemsLoading(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) return;

      console.log('reloadBooking: fetching detail');
      const res = await fetch(`/api/bookings/detail?reference=${encodeURIComponent(id as string)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const raw = await res.text();
      let json: any = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          json = { raw };
        }
      }
      if (!res.ok) {
        console.error('Failed to load booking detail', { status: res.status, body: json });
        return;
      }

      console.log('reloadBooking: got booking data', json.booking);
      setBooking(json.booking);
      setItems((json.items || []).map((it: any) => it.snapshot));
    } catch (e) {
      console.error('Booking detail load error', e);
    } finally {
      setIsBookingLoading(false);
      setIsItemsLoading(false);
      console.log('reloadBooking: finished loading');
    }
  }, [auth, id, user]);

  useEffect(() => {
    reloadBooking();
  }, [reloadBooking]);

  const handleCancel = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Missing session');

      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reference: id }),
      });
      const raw = await res.text();
      let json: any = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          json = { raw };
        }
      }
      if (!res.ok) {
        const errorMessage = json?.error || 'Failed to cancel booking';
        toast({
          title: 'Cancellation Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Booking Cancelled',
        description: json?.alreadyCancelled ? 'Booking was already cancelled.' : 'Your booking has been cancelled successfully.',
      });
      setShowCancelModal(false);
      await reloadBooking();
    } catch (e) {
      console.error('Cancel booking error', e);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while cancelling your booking.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleModify = async (updates: { checkIn: string; checkOut: string; adults: number; children: number }) => {
    if (!id) return;
    setIsModifying(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Missing session');

      const res = await fetch('/api/bookings/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reference: id, updates }),
      });
      const raw = await res.text();
      let json: any = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          json = { raw };
        }
      }
      if (!res.ok) {
        const errorMessage = json?.error || 'Failed to modify booking';
        toast({
          title: 'Modification Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Booking Updated Successfully',
        description: 'Your booking has been modified. A confirmation email with your updated itinerary has been sent to your registered email address.',
      });
      setShowModifyModal(false);
      await reloadBooking();
    } catch (e) {
      console.error('Modify booking error', e);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while modifying your booking.',
        variant: 'destructive',
      });
    } finally {
      setIsModifying(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Missing session');

      const res = await fetch('/api/bookings/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reference: id }),
      });
      const raw = await res.text();
      let json: any = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          json = { raw };
        }
      }
      if (!res.ok) {
        const errorMessage = json?.error || 'Failed to delete booking';
        toast({
          title: 'Deletion Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Booking Deleted',
        description: 'Your booking has been permanently deleted.',
      });
      setShowDeleteModal(false);
      
      // Refresh the bookings list by invalidating cache
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.removeItem('bookings-cache');
      }
      
      router.push('/profile/bookings');
    } catch (e) {
      console.error('Delete booking error', e);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting your booking.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
  const carItems = items?.filter(item => item.type === 'car') || [];

  // Calculate totals
  const flightTotal = flightItems.reduce((sum, item) => sum + item.price, 0);
  const hotelTotal = hotelItems.reduce((sum, item) => sum + item.price, 0);
  const carTotal = carItems.reduce((sum, item) => sum + item.price, 0);
  const taxesAndFees = Math.floor((flightTotal + hotelTotal + carTotal) * 0.08);
  const totalPaid = flightTotal + hotelTotal + carTotal + taxesAndFees;

  const isCancelled = booking?.status === 'cancelled';
  const isDeleted = booking?.status === 'deleted';
  const disableActions = isCancelled || isDeleted;

  return (
    <RequireAuth>
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-10 py-4">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={() => router.push('/profile/bookings')}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Booking Details</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ref: #{booking.booking_reference || booking.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                  <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
              {/* Hero Image */}
              <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-xl overflow-hidden mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <Image 
                  src={booking.image || "https://picsum.photos/seed/travel-details/1200/800"} 
                  alt={booking.location || "Destination"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <span className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block ${
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                  }`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                  </span>
                  <h1 className="text-white text-3xl md:text-4xl font-bold">{booking.location || 'Your Destination'}</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Check-in/Check-out Dates */}
                  <section className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[180px] bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Check-in</p>
                      <p className="text-xl font-bold">
                        {booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'TBD'}
                      </p>
                      <p className="text-sm text-slate-400">From 3:00 PM</p>
                    </div>
                    <div className="flex-1 min-w-[180px] bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Check-out</p>
                      <p className="text-xl font-bold">
                        {booking.booking_date ? format(new Date(new Date(booking.booking_date).getTime() + 7 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy') : 'TBD'}
                      </p>
                      <p className="text-sm text-slate-400">Until 11:00 AM</p>
                    </div>
                  </section>

                  {/* Flight Itinerary */}
                  {flightItems.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                        Flight Itinerary
                      </h3>
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">flight</span>
                              </div>
                              <div>
                                <p className="font-bold">{flightItems[0].provider || 'Airline'}</p>
                                <p className="text-xs text-slate-500">Flight {flightItems[0].id?.slice(0, 6).toUpperCase() || '---'} • Economy</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">Non-stop</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-center md:text-left">
                              <p className="text-2xl font-bold">08:45</p>
                              <p className="text-sm font-bold">LHR</p>
                              <p className="text-xs text-slate-500">London Heathrow</p>
                            </div>
                            <div className="flex-1 px-4 flex flex-col items-center">
                              <p className="text-xs text-slate-400 mb-1">3h 50m</p>
                              <div className="w-full h-px bg-slate-300 dark:bg-slate-700 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <span className="material-symbols-outlined text-slate-400 text-sm">flight</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-center md:text-right">
                              <p className="text-2xl font-bold">14:35</p>
                              <p className="text-sm font-bold">JTR</p>
                              <p className="text-xs text-slate-500">{booking.location || 'Destination'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Accommodation */}
                  {hotelItems.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">hotel</span>
                        Accommodation
                      </h3>
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-1/3 aspect-video md:aspect-auto relative">
                          <Image 
                            src={hotelItems[0].image || "https://picsum.photos/seed/hotel/400/300"} 
                            alt={hotelItems[0].title || "Hotel"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6 md:w-2/3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{hotelItems[0].title || 'Luxury Hotel'}</h4>
                            <div className="flex text-primary">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm">star</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 mb-4">{booking.location || 'Hotel Address'}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-symbols-outlined text-slate-400 text-sm">bed</span>
                              <span>Deluxe Sea View Suite</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="material-symbols-outlined text-slate-400 text-sm">group</span>
                              <span>{booking.adults || 2} Adult{(booking.adults || 2) > 1 ? 's' : ''}{(booking.children || 0) > 0 ? ` • ${booking.children} Children` : ''} • Breakfast Included</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Traveler Information */}
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Traveler Information
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {(user.user_metadata?.full_name as string | undefined)?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold">{(user.user_metadata?.full_name as string | undefined) || 'Primary Traveler'}</p>
                            <p className="text-xs text-slate-500">Lead Passenger • Email: {user.email}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">verified</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Payment Summary */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28">
                    <h3 className="text-lg font-bold mb-6">Payment Summary</h3>
                    <div className="space-y-4 mb-6">
                      {flightTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Flight</span>
                          <span className="font-medium">₦{flightTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {hotelTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Hotel</span>
                          <span className="font-medium">₦{hotelTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {carTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Car Rental</span>
                          <span className="font-medium">₦{carTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Taxes & Fees</span>
                        <span className="font-medium">₦{taxesAndFees.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                        <span className="font-bold">Total Paid</span>
                        <span className="font-bold text-primary text-xl">₦{Number(booking.total_amount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-8 flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">credit_card</span>
                      <div className="text-xs">
                        <p className="font-bold">Visa ending in 4242</p>
                        <p className="text-slate-500">Paid on {booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'Recently'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowModifyModal(true)}
                        disabled={disableActions}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Modify Booking
                      </button>
                      <button className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">receipt</span>
                        Download Invoice
                      </button>
                      {!disableActions && (
                        <button 
                          onClick={() => setShowCancelModal(true)}
                          className="w-full py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Cancel Booking
                        </button>
                      )}
                      {!isDeleted && (
                        <button 
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full py-3 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">delete_forever</span>
                          Delete Booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Help Section */}
                  <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">help</span>
                      Need help?
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Our support team is available 24/7 to assist with your journey.</p>
                    <Link href="/support" className="text-sm font-bold text-primary hover:underline">Contact Customer Support</Link>
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-10 px-4">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <div className="flex justify-center gap-6">
                  <Link className="text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</Link>
                  <Link className="text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</Link>
                  <Link className="text-slate-400 hover:text-primary transition-colors" href="#">Cookie Policy</Link>
                </div>
                <p className="text-slate-500 text-sm"> 2026 TravelEase. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </div>

        {/* Modals */}
        <CancellationModal
          open={showCancelModal}
          onOpenChange={setShowCancelModal}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
          bookingReference={booking.booking_reference || booking.id}
          bookingLocation={booking.location}
          loading={isCancelling}
        />
        
        <BookingModificationModal
          open={showModifyModal}
          onOpenChange={setShowModifyModal}
          booking={booking}
          onSave={handleModify}
          loading={isModifying}
        />
        
        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          bookingReference={booking.booking_reference || booking.id}
          bookingLocation={booking.location}
          loading={isDeleting}
        />
      </div>
    </RequireAuth>
  );
}