
import type { Metadata } from 'next';
import './globals.css';
import { BasketProvider } from '@/context/basket-context';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClientProvider } from '@/supabase/provider';
import { HydrationProvider } from '@/components/hydration-provider';

export const metadata: Metadata = {
  title: 'TravelEase | Find Your Next Adventure',
  description: 'Book flights, hotels, and unique experiences around the world.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased" suppressHydrationWarning>
        <HydrationProvider>
          <SupabaseClientProvider>
            <BasketProvider>
              {children}
              <Toaster />
            </BasketProvider>
          </SupabaseClientProvider>
        </HydrationProvider>
      </body>
    </html>
  );
}
