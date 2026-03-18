"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPageRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Artificial delay to allow the user to see the beautiful redirect design
    const timer = setTimeout(() => {
      const next = searchParams.get('next');
      const qs = next ? `&next=${encodeURIComponent(next)}` : '';
      router.replace(`/auth/login?mode=register${qs}`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 py-4 bg-white dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">flight_takeoff</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">TravelEase</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="layout-content-container flex flex-col max-w-[520px] w-full bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {/* Progress Header Image */}
            <div className="relative w-full h-[240px]">
              <Image 
                src="https://picsum.photos/seed/redirect/1000/600" 
                alt="Scenic aerial view" 
                fill 
                className="object-cover"
                data-ai-hint="aerial beach"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-white mb-2 uppercase tracking-widest">Secure Portal</span>
                <h3 className="text-white text-2xl font-bold">Your journey begins here</h3>
              </div>
            </div>

            {/* Loading State Content */}
            <div className="flex flex-col gap-6 p-8">
              <div className="space-y-4 text-center">
                <h2 className="text-slate-900 dark:text-white tracking-tight text-2xl md:text-3xl font-bold leading-tight">Redirecting to Registration...</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed">
                  Please wait a moment while we set up your TravelEase account and prepare your personalized dashboard.
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex gap-6 justify-between items-end">
                  <p className="text-primary text-sm font-semibold uppercase tracking-wider">Synchronizing Data</p>
                  <p className="text-slate-400 text-xs font-medium">75% Complete</p>
                </div>
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 h-3 w-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary relative w-[75%] transition-all duration-1000 ease-out">
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-center mt-2">
                  <span className="material-symbols-outlined text-primary text-sm animate-spin">refresh</span>
                  <p className="text-slate-400 dark:text-slate-50 text-sm font-normal leading-normal italic">Preparing your journey...</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-lg">shield</span>
                <span className="text-xs font-medium uppercase tracking-tighter">Secure Link</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <span className="text-xs font-medium uppercase tracking-tighter">Verified Provider</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-lg">lock</span>
                <span className="text-xs font-medium uppercase tracking-tighter">SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Support Link */}
          <p className="mt-8 text-slate-400 dark:text-slate-500 text-sm">
            Taking too long? <Link className="text-primary hover:underline font-medium" href="/auth/login?mode=register">Click here to manually redirect</Link>
          </p>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-semibold">© 2026 TravelEase. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}