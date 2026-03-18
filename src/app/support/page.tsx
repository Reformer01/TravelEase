"use client";

import Link from 'next/link';
import { useUser } from '@/supabase';

export default function SupportPage() {
  const { user } = useUser();

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  const faqs = [
    { q: "How do I cancel my booking?", a: "You can cancel your booking directly from your 'My Bookings' page. Most bookings offer free cancellation up to 24 hours before check-in." },
    { q: "When will I receive my refund?", a: "Refunds are typically processed within 5-10 business days depending on your bank's processing time." },
    { q: "Can I change my flight dates?", a: "Flight changes are subject to the airline's policy. Please contact our support team with your booking reference for assistance." },
    { q: "What documents do I need for travel?", a: "Requirements vary by destination. Please check the 'Travel Info' section in your confirmation email or consult your destination's consulate." }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-20">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
          <h2 className="text-slate-900 dark:text-slate-100 text-xl font-black leading-tight tracking-tight uppercase">TravelEase</h2>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href="/search">Search</Link>
          <Link className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href={user ? "/profile/bookings" : loginFor('/profile/bookings')}>My Bookings</Link>
          <Link className="text-sm font-semibold text-primary" href="/support">Help Center</Link>
        </nav>
        <Link href={user ? "/profile" : loginFor('/profile')}>
          <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tight mb-4">How can we help?</h1>
          <p className="text-slate-500 text-lg">Find answers to frequently asked questions or contact our support team.</p>
        </div>

        {/* Search Helper */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl focus:ring-primary focus:border-primary" 
            placeholder="Search help articles..." 
            type="text" 
          />
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">confirmation_number</span>
            <h3 className="font-bold mb-2">My Bookings</h3>
            <p className="text-sm text-slate-500">View, manage, or cancel your upcoming trips.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">payments</span>
            <h3 className="font-bold mb-2">Refunds</h3>
            <p className="text-sm text-slate-500">Check refund status and payment policies.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">shield_person</span>
            <h3 className="font-bold mb-2">Safety Info</h3>
            <p className="text-sm text-slate-500">Travel advisories and safety guidelines.</p>
          </div>
        </div>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">live_help</span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                <p className="text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="p-8 bg-primary rounded-3xl text-white text-center shadow-xl shadow-primary/20">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-white/80 mb-8">Our support team is available 24/7 to assist you with your travel needs.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-primary font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-colors">Chat with us</button>
            <button className="bg-black/20 text-white font-bold px-8 py-3 rounded-xl hover:bg-black/30 transition-colors border border-white/20">Email Support</button>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm">
        © 2026 TravelEase. All rights reserved.
      </footer>
    </div>
  );
}