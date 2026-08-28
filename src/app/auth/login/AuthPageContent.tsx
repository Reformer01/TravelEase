"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@/supabase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Automatically redirect when the user state becomes available
  useEffect(() => {
    if (user) {
      const next = searchParams.get('next');
      router.push(next || '/profile');
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') setView('register');
  }, [searchParams]);

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = (formData.get('fullName') as string | null) || '';

    try {
      if (view === 'login') {
        const { data, error } = await auth.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await auth.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;

        const accessToken = data.session?.access_token;
        if (accessToken) {
          try {
            await fetch('/api/profile/me', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                fullName,
                email,
              }),
            });
          } catch (e) {
            console.error('Profile seed failed', e);
          }
        } else {
          toast({
            title: 'Check your email',
            description: 'Confirm your email to finish creating your account, then sign in.',
          });
        }
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Auth initialization error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "There was a problem starting the authentication process."
      });
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-xl shadow-2xl bg-white dark:bg-slate-900 min-h-[700px]">
        {/* Left Pane: Branding & Inspiration */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 z-10"></div>
            <Image 
              src="https://picsum.photos/seed/travel-auth/1200/1200" 
              alt="Scenic mountain lake landscape" 
              fill 
              className="object-cover"
              priority
              data-ai-hint="mountain lake"
            />
          </div>
          
          <div className="relative z-20 flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-4xl">flight_takeoff</span>
            <h1 className="text-2xl font-bold tracking-tight uppercase">TravelEase</h1>
          </div>

          <div className="relative z-20">
            <blockquote className="text-4xl font-bold leading-tight mb-6">
              "The world is a book and those who do not travel read only one page."
            </blockquote>
            <p className="text-lg text-white/80">— Saint Augustine</p>
          </div>

          <div className="relative z-20 flex gap-4">
            <div className={`h-1 w-12 rounded-full transition-all duration-300 ${view === 'login' ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`h-1 w-12 rounded-full transition-all duration-300 ${view === 'register' ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className="h-1 w-12 bg-white/30 rounded-full"></div>
          </div>
        </div>

        {/* Right Pane: Auth Forms */}
        <div className="flex flex-col p-8 md:p-12 lg:p-16 justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-8 lg:hidden text-primary">
              <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
              <h2 className="text-xl font-bold uppercase">TravelEase</h2>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {view === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {view === 'login' ? 'Please enter your details to access your account.' : 'Join us and start planning your next journey.'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
              <button 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all duration-300 ${view === 'login' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary'}`}
                onClick={() => setView('login')}
              >
                Login
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all duration-300 ${view === 'register' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary'}`}
                onClick={() => setView('register')}
              >
                Register
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {view === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                  <Input 
                    className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" 
                    id="fullName" 
                    name="fullName" 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                <Input 
                  className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" 
                  id="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  type="email" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
                  {view === 'login' && <Link className="text-sm font-semibold text-primary hover:underline" href="/auth/forgot">Forgot password?</Link>}
                </div>
                <div className="relative">
                  <Input 
                    className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white pr-12" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    minLength={8} 
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {view === 'login' && (
                <div className="flex items-center">
                  <Checkbox className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" id="remember-me" name="remember-me" />
                  <label className="ml-2 block text-sm text-slate-700 dark:text-slate-300" htmlFor="remember-me">
                    Remember me for 30 days
                  </label>
                </div>
              )}

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>By {view === 'login' ? 'signing in' : 'registering'}, you agree to TravelEase's <Link className="underline hover:text-primary" href="#">Terms of Service</Link> and <Link className="underline hover:text-primary" href="#">Privacy Policy</Link>.</p>
            </div>
            <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {view === 'login' ? (
                <p>
                  New here? <Link href="/auth/register" className="font-semibold text-primary hover:underline">Create account</Link>
                </p>
              ) : (
                <p>
                  Already have an account? <button type="button" onClick={() => setView('login')} className="font-semibold text-primary hover:underline">Sign in</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
