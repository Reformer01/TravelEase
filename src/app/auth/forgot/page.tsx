"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email')||'');
    const { error } = await auth.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/login` });
    setLoading(false);
    if (error) toast({ variant: 'destructive', title: 'Error', description: error.message });
    else { setSent(true); toast({ title: 'Check email', description: 'Reset link sent if account exists.' }); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border p-8">
        <h1 className="text-2xl font-black mb-2">Reset password</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your email to receive a reset link.</p>
        {sent ? <p className="text-sm text-green-600">If an account exists, you’ll get an email. <Link href="/auth/login" className="text-primary underline">Back to login</Link></p> : (
          <form onSubmit={handle} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required placeholder="you@example.com" /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send reset link'}</Button>
            <Link href="/auth/login" className="block text-center text-sm text-primary hover:underline">Back to login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
