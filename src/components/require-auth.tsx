"use client";

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/supabase';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isUserLoading && !user) {
      const qs = searchParams?.toString();
      const next = `${pathname}${qs ? `?${qs}` : ''}`;
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }, [isUserLoading, user, router, pathname, searchParams]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
