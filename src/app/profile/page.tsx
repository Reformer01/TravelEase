"use client";

import { useUser, useAuth } from '@/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RequireAuth } from '@/components/require-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    homeAddress: ''
  });

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.email || '',
        phoneNumber: profile.phone_number || '',
        dateOfBirth: profile.date_of_birth || '',
        homeAddress: profile.home_address || ''
      });
    } else if (user) {
      const names = (user.user_metadata?.full_name as string | undefined)?.split(' ') || ['', ''];
      setFormData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || '',
        phoneNumber: (user.user_metadata?.phone as string | undefined) || '',
        dateOfBirth: '',
        homeAddress: ''
      });
    }
  }, [profile, user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setIsProfileLoading(true);
      try {
        const { data, error } = await auth.auth.getSession();
        if (error) throw error;
        const accessToken = data.session?.access_token;
        if (!accessToken) return;

        const res = await fetch('/api/profile/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const raw = await res.text();
        const json = raw
          ? (() => {
              try {
                return JSON.parse(raw);
              } catch {
                return { raw };
              }
            })()
          : {};
        if (!res.ok) {
          console.error('Failed to load profile', json);
          return;
        }
        setProfile((json as any).profile);
      } catch (e) {
        console.error('Profile load error', e);
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [auth, user]);

  const handleLogout = async () => {
    await auth.auth.signOut();
    router.push('/');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { data, error } = await auth.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Missing session');

      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          email: user.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          homeAddress: formData.homeAddress,
        }),
      });
      const raw = await res.text();
      const json = raw
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return { raw };
            }
          })()
        : {};
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Error', description: (json as any)?.error || 'Unable to save profile.' });
        setSaving(false);
        return;
      }
      setProfile((json as any).profile);
      toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
      setSaving(false);
    } catch (e: any) {
      console.error('Profile save error', e);
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Unable to save profile.' });
      setSaving(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-primary">
        <span className="material-symbols-outlined text-5xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <RequireAuth>
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">TravelEase</h2>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="/search">Explore</Link>
                <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="/profile/bookings">My Trips</Link>
                <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="/support">Support</Link>
              </nav>
            </div>
            <div className="flex flex-1 justify-end items-center gap-4">
              <div className="hidden sm:flex relative w-full max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input 
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400" 
                  placeholder="Search destinations..." 
                  type="text"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="material-symbols-outlined p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">notifications</button>
                <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary overflow-hidden">
                  <Image width={40} height={40} alt="Profile" className="h-full w-full object-cover" src={(user.user_metadata?.avatar_url as string | undefined) || "https://picsum.photos/seed/user/200/200"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center pb-6 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="relative group cursor-pointer">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary transition-colors">
                    <Image width={96} height={96} alt={(user.user_metadata?.full_name as string | undefined) || "User"} src={(user.user_metadata?.avatar_url as string | undefined) || "https://picsum.photos/seed/user/200/200"} />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
                    <span className="material-symbols-outlined text-xs">edit</span>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold truncate max-w-full text-center px-2">
                  {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : ((user.user_metadata?.full_name as string | undefined) || 'Explorer')}
                </h3>
                <p className="text-sm text-primary font-medium">Gold Member</p>
              </div>
              <nav className="space-y-1">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-medium">
                  <span className="material-symbols-outlined">person</span>
                  <span>Profile</span>
                </Link>
                <Link href="/profile/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">luggage</span>
                  <span>My Bookings</span>
                </Link>
                <Link href="/profile/payments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">credit_card</span>
                  <span>Payments</span>
                </Link>
                <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                  <span>Settings</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium">
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
            {/* Personal Information */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Personal Information</h2>
                <button className="text-primary text-sm font-semibold hover:underline">Edit All</button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</Label>
                    <Input 
                      value={`${formData.firstName} ${formData.lastName}`.trim()} 
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        setFormData({...formData, firstName: names[0] || '', lastName: names.slice(1).join(' ') || ''});
                      }}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</Label>
                    <Input 
                      value={formData.email} 
                      disabled
                      placeholder="user@travelease.com"
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</Label>
                    <Input 
                      value={formData.phoneNumber} 
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date of Birth</Label>
                    <Input 
                      value={formData.dateOfBirth} 
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      type="date"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Home Address</Label>
                    <textarea 
                      value={formData.homeAddress}
                      onChange={(e) => setFormData({...formData, homeAddress: e.target.value})}
                      placeholder="123 Wanderlust Lane, Travel City, TC 54321"
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary p-3 text-sm"
                    />
                  </div>
                </form>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <Button disabled={saving} type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md shadow-primary/20">
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </section>

            {/* Security & Login */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold">Security & Login</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary">password</span>
                    </div>
                    <div>
                      <p className="font-bold">Password</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Update</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6" fill="#4285F4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 1.2-4.53z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Google Account</p>
                      <p className="text-sm text-green-500 font-medium">Connected</p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-red-500 transition-colors material-symbols-outlined">link_off</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-primary mb-4">
                <span className="material-symbols-outlined text-2xl font-bold">flight_takeoff</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">TravelEase</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Discover your next adventure with the world's leading travel companion.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-primary transition-colors" href="#">About Us</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Careers</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Destinations</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-primary transition-colors" href="#">Europe</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Asia</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Americas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <div className="flex gap-2">
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3" 
                  placeholder="Email" 
                  type="email"
                />
                <button className="bg-primary text-white p-2 rounded-lg material-symbols-outlined hover:bg-primary/90 transition-colors">send</button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400"> 2026 TravelEase. All rights reserved.</p>
            <div className="flex gap-6">
              <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">social_leaderboard</span></Link>
              <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></Link>
              <Link className="text-slate-400 hover:text-primary transition-colors" href="mailto:support@travelease.com"><span className="material-symbols-outlined">alternate_email</span></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </RequireAuth>
  );
}