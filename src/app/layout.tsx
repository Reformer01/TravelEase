import type { Metadata } from 'next';
import './globals.css';
import { BasketProvider } from '@/context/basket-context';
import { Navbar } from '@/components/layout/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen flex flex-col" style={{ fontFamily: '"Public Sans", sans-serif' }} suppressHydrationWarning>
        <FirebaseClientProvider>
          <BasketProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </BasketProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
