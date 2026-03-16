'use client';

import { useState, useEffect } from 'react';

export function FooterYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Fallback to a static year during hydration to avoid mismatches
  return <span>{year || '2025'}</span>;
}
