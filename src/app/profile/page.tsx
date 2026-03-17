
"use client";

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { signOut } from 'firebase/auth';
import { Navbar } from '@/components/layout/navbar';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
          <p className="text-slate-500 font-medium tracking-tight">Loading your TravelEase profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center pb-6 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="relative group cursor-pointer">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary transition-colors">
                    <Image 
                      width={96}
                      height={96}
                      alt={user.displayName || "User"} 
                      className="h-full w-full object-cover" 
                      src={user.photoURL || "https://picsum.photos/seed/user/200/200"}
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
                    <span className="material-symbols-outlined text-xs">edit</span>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold truncate max-w-full">{user.displayName || user.email?.split('@')[0]}</h3>
                <p className="text-sm text-primary font-bold uppercase tracking-wider text-[10px]">Gold Member</p>
              </div>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">person</span>
                  <span>Profile</span>
                </button>
                <Link href="/profile/bookings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">luggage</span>
                  <span>My Bookings</span>
                </Link>
                <Link href="/basket" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">shopping_basket</span>
                  <span>My Basket</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                  <span>Settings</span>
                </button>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-bold"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            {/* Quick Stats / Travel Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Trips</p>
                  <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                </div>
                <p className="text-3xl font-black tracking-tight">24</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loyalty Points</p>
                  <span className="material-symbols-outlined text-primary">stars</span>
                </div>
                <p className="text-3xl font-black tracking-tight">4,250</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Visited</p>
                  <span className="material-symbols-outlined text-primary">public</span>
                </div>
                <p className="text-3xl font-black tracking-tight">12 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Countries</span></p>
              </div>
            </section>

            {/* Personal Information */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">Personal Information</h2>
                <button className="text-primary text-sm font-bold hover:underline">Edit All</button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Full Name</Label>
                    <Input className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 font-medium" readOnly value={user.displayName || "Alex Johnson"} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Email Address</Label>
                    <Input className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 font-medium" readOnly value={user.email || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Phone Number</Label>
                    <Input className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 font-medium" placeholder="+1 (555) 000-0000" type="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Date of Birth</Label>
                    <Input className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 font-medium" type="date" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Home Address</Label>
                    <Textarea className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium" rows={2} placeholder="123 Wanderlust Lane, Travel City, TC 54321" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90 text-white font-black py-2.5 px-10 rounded-xl transition-all shadow-lg shadow-primary/20 h-12">
                  Save Changes
                </Button>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black tracking-tight">Security & Login</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary">password</span>
                    </div>
                    <div>
                      <p className="font-bold">Password</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Secure your account with a unique password</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="font-bold px-6 h-10 rounded-lg">Update</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Google Account</p>
                      <p className="text-sm text-green-500 font-bold uppercase tracking-wider text-[10px]">Connected</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors material-symbols-outlined">link_off</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6 lg:px-20 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
            <span className="text-white text-xl font-black tracking-tighter uppercase">Travel<span className="text-primary">Ease</span></span>
          </div>
          <p className="text-sm font-medium">© 2024 TravelEase Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="text-slate-400 hover:text-primary transition-all hover:scale-110" href="#"><span className="material-symbols-outlined">share</span></Link>
            <Link className="text-slate-400 hover:text-primary transition-all hover:scale-110" href="#"><span className="material-symbols-outlined">mail</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
