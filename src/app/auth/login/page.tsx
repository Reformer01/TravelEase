
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { GoogleAuthProvider, signInWithRedirect, FacebookAuthProvider } from 'firebase/auth';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Automatically redirect when the user state becomes available
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') setView('register');
  }, [searchParams]);

  const handleEmailAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (view === 'login') {
        initiateEmailSignIn(auth, email, password);
      } else {
        initiateEmailSignUp(auth, email, password);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "There was a problem starting the authentication process."
      });
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    if (socialLoading) return;
    setSocialLoading(true);
    try {
      const provider = providerName === 'google' 
        ? new GoogleAuthProvider() 
        : new FacebookAuthProvider();
      
      // Using redirect instead of popup to avoid popup-blocked and cancelled-popup errors
      // common in development environments and workstations.
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error(`${providerName} login failed`, error);
      setSocialLoading(false);
      
      if (error.code !== 'auth/cancelled-popup-request') {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Failed to initialize social login."
        });
      }
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
          
          <div className="relative z-20 flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl">flight_takeoff</span>
            <h1 className="text-2xl font-bold tracking-tight">TravelEase</h1>
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
              <h2 className="text-xl font-bold">TravelEase</h2>
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

            {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button 
                type="button"
                disabled={socialLoading}
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-semibold">{socialLoading ? 'Wait...' : 'Google'}</span>
              </button>
              <button 
                type="button"
                disabled={socialLoading}
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span className="text-sm font-semibold">{socialLoading ? 'Wait...' : 'Facebook'}</span>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fname" className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</Label>
                    <Input 
                      className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" 
                      id="fname" 
                      name="fname" 
                      placeholder="John" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lname" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</Label>
                    <Input 
                      className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" 
                      id="lname" 
                      name="lname" 
                      placeholder="Doe" 
                      required 
                    />
                  </div>
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
                  {view === 'login' && <Link className="text-sm font-semibold text-primary hover:underline" href="#">Forgot password?</Link>}
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
                disabled={loading || socialLoading}
              >
                {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>By {view === 'login' ? 'signing in' : 'registering'}, you agree to TravelEase's <Link className="underline hover:text-primary" href="#">Terms of Service</Link> and <Link className="underline hover:text-primary" href="#">Privacy Policy</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
