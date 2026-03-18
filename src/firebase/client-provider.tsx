'use client';

import React, { type ReactNode } from 'react';
import { SupabaseClientProvider } from '@/supabase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return <SupabaseClientProvider>{children}</SupabaseClientProvider>;
}