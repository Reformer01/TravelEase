"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@/supabase';
import { useToast } from '@/hooks/use-toast';
import { useBasket } from '@/context/basket-context';

export default function CheckoutCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const { clearBasket } = useBasket();

  const [step, setStep] = useState<'verify' | 'finalize' | 'redirect'>('verify');
  const [status, setStatus] = useState<'verifying' | 'failed' | 'success'>('verifying');
  const [message, setMessage] = useState<string>('Verifying your payment with Paystack...');
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      const reference = searchParams.get('reference');
      if (!reference) {
        setStatus('failed');
        setMessage('Missing payment reference.');
        return;
      }

      // React StrictMode (dev) and state changes can cause effects to run multiple times.
      // Guard so we only verify/finalize once per page load.
      if (hasRunRef.current) return;

      if (isUserLoading) return;
      if (!user) {
        router.replace(`/auth/login?next=${encodeURIComponent(`/checkout/complete?reference=${reference}`)}`);
        return;
      }

      hasRunRef.current = true;

      try {
        const { data, error } = await auth.auth.getSession();
        if (error) throw error;
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Missing session');

        // Step 1: Verify payment
        setStep('verify');
        setMessage('Verifying your payment with Paystack...');
        
        const verifyRes = await fetch('/api/payments/paystack/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reference }),
        });

        const verifyJson = await verifyRes.json();
        if (!verifyRes.ok) {
          setStatus('failed');
          setMessage(verifyJson?.error || 'Unable to verify payment.');
          return;
        }

        if (verifyJson.status !== 'succeeded') {
          setStatus('failed');
          setMessage('Payment was not successful. Please return to your basket to retry.');
          return;
        }

        // Step 2: Finalize booking
        setStep('finalize');
        setMessage('Creating your booking...');

        const finalizeRes = await fetch('/api/bookings/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ paymentId: reference }),
        });

        const finalizeJson = await finalizeRes.json();
        
        // Handle idempotency - booking already exists
        if (finalizeRes.ok && finalizeJson.alreadyExists) {
          setBookingRef(finalizeJson.bookingReference);
          setStatus('success');
          setStep('redirect');
          setMessage('Your booking was already confirmed! Redirecting...');
          setTimeout(() => {
            router.replace(`/confirmation/${encodeURIComponent(finalizeJson.bookingReference)}`);
          }, 2000);
          return;
        }
        
        if (!finalizeRes.ok) {
          setStatus('failed');
          setMessage(finalizeJson?.error || 'Unable to finalize booking. Please contact support with reference: ' + reference);
          return;
        }

        setBookingRef(finalizeJson.bookingReference);
        setStatus('success');
        setStep('redirect');
        setMessage('Payment verified and booking confirmed! Redirecting...');
        toast({
          title: 'Booking Confirmed',
          description: `Your booking ${finalizeJson.bookingReference} has been confirmed.`,
        });

        setTimeout(() => {
          router.replace(`/confirmation/${encodeURIComponent(finalizeJson.bookingReference)}`);
        }, 2000);
      } catch (e: any) {
        console.error('Checkout complete error', e);
        setStatus('failed');
        setMessage(e?.message || 'Unable to complete checkout.');
      }
    };

    run();
  }, [auth, isUserLoading, router, searchParams, toast, user]);

  // Progress bar component
  const ProgressSteps = () => {
    const steps = [
      { key: 'verify', label: 'Verify Payment' },
      { key: 'finalize', label: 'Create Booking' },
      { key: 'redirect', label: 'Confirmation' },
    ];
    
    const currentIndex = steps.findIndex(s => s.key === step);
    
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              idx <= currentIndex ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {idx < currentIndex ? (
                <span className="material-symbols-outlined text-sm">check</span>
              ) : (
                idx + 1
              )}
            </div>
            <span className={`text-xs font-medium ${idx <= currentIndex ? 'text-primary' : 'text-slate-500'}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${idx < currentIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 p-6">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
          <ProgressSteps />
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <h1 className="text-2xl font-black mb-2">Payment Verification Issue</h1>
          <p className="text-slate-500 mb-6">{message}</p>
          
          {searchParams.get('reference') && (
            <p className="text-xs text-slate-400 mb-4">
              Reference: {searchParams.get('reference')}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/basket" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Return to Basket
            </Link>
            <Link href="/support" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 p-6">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
        <ProgressSteps />
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">refresh</span>
          </div>
        </div>
        <h1 className="text-2xl font-black mt-4">Completing checkout</h1>
        <p className="text-slate-500 mt-2">{message}</p>
      </div>
    </div>
  );
}
