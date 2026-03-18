'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

interface UserAuthState {
  user: SupabaseUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface SupabaseContextState {
  supabase: SupabaseClient;
  user: SupabaseUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

export function SupabaseClientProvider({ children }: { children: ReactNode }) {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!isMounted) return;
        setUserAuthState({ user: data.session?.user ?? null, isUserLoading: false, userError: null });
      } catch (err) {
        if (!isMounted) return;
        setUserAuthState({ user: null, isUserLoading: false, userError: err as Error });
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return;
      setUserAuthState({ user: session?.user ?? null, isUserLoading: false, userError: null });
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      supabase,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    }),
    [userAuthState]
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useAuth must be used within SupabaseClientProvider.');
  return ctx.supabase;
};

export const useUser = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useUser must be used within SupabaseClientProvider.');
  return { user: ctx.user, isUserLoading: ctx.isUserLoading, userError: ctx.userError };
};
