
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified auth page with register mode
    router.replace('/auth/login?mode=register');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
