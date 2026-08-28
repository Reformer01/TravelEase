"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useBasket, TravelService } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';

// Reuse same mock generator — ponytail: extract to lib later when real API exists
function getById(id: string, type: string | null): (TravelService & { reviews: number; badges: string[]; availability: string; subLocation: string }) | null {
  const locations = [
    { main: 'Santorini', sub: 'Oia, Greece' },
    { main: 'Kyoto', sub: 'Gion District, Japan' },
    { main: 'Bali', sub: 'Ubud, Indonesia' },
    { main: 'Paris', sub: 'Eiffel Tower Area, France' },
    { main: 'New York', sub: 'Manhattan, USA' },
    { main: 'Dubai', sub: 'Downtown, UAE' },
  ];
  for (let i = 0; i < 6; i++) {
    const sid = `search-${i}`;
    if (sid !== id) continue;
    const t = type || 'hotel';
    return {
      id: sid,
      type: t as any,
      title: t === 'flight' ? (i % 2 === 0 ? 'Lufthansa Economy' : 'Qatar Airways Business') : t === 'car' ? (i % 2 === 0 ? 'Toyota Corolla (Automatic)' : i % 3 === 0 ? 'SUV - Honda CR-V' : 'Kia Rio (Compact)') : i % 2 === 0 ? 'Azure Luxury Suites' : i % 3 === 0 ? 'Mystique Boutique Resort' : 'Caldera View Hotel',
      provider: 'TravelEase Preferred',
      price: t === 'flight' ? (i * 100 + 300) * 1500 : t === 'car' ? (i * 25 + 40) * 1500 : (i * 80 + 150) * 1500,
      rating: i % 2 === 0 ? 5 : 4,
      image: t === 'flight' ? `https://picsum.photos/seed/flight-${i}/800/600` : t === 'car' ? `https://picsum.photos/seed/car-${i}/800/600` : `https://picsum.photos/seed/hotel-${i}/800/600`,
      location: locations[i % locations.length].main,
      subLocation: locations[i % locations.length].sub,
      reviews: 600 + i * 100,
      badges: ['Free Cancellation', 'Instant Confirmation', 'TravelEase Choice'],
      availability: 'Live Availability',
    };
  }
  return null;
}

export default function SearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'hotel';
  const router = useRouter();
  const { addToBasket } = useBasket();
  const { toast } = useToast();

  const service = useMemo(() => getById(id as string, type), [id, type]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Not found</h1>
        <Link href="/search" className="text-primary hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-20 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Back"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="font-bold truncate">{service.title}</h1>
        <Link href="/basket" className="ml-auto text-sm font-semibold text-primary hover:underline">View Basket</Link>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-20 py-6 space-y-6">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200">
          <Image src={service.image} alt={`${service.title} in ${service.subLocation}`} fill className="object-cover" priority />
          <div className="absolute left-4 top-4 rounded-full bg-green-500/90 px-3 py-1 text-xs font-bold text-white">{service.availability}</div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-1 text-primary">{[...Array(5)].map((_, i) => <span key={i} className={`material-symbols-outlined text-sm ${i < service.rating ? 'FILL-1' : ''}`}>star</span>)}</div>
            <h2 className="text-3xl font-black">{service.title}</h2>
            <p className="text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{service.subLocation}</p>
            <div className="flex flex-wrap gap-2">{service.badges.map(b => <span key={b} className="rounded-full bg-slate-100 dark:bg-primary/10 px-3 py-1 text-xs font-medium">{b}</span>)}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Trusted stay with free cancellation and instant confirmation. Prices held at checkout — pay with Paystack (card/bank/USSD).</p>
          </div>
          <div className="lg:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit sticky top-20 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Price</p>
              <p className="text-3xl font-black">₦{service.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ {type === 'flight' ? 'person' : type === 'car' ? 'day' : 'night'}</span></p>
              <p className="text-xs text-slate-500">{service.reviews} reviews • {service.rating}/5</p>
            </div>
            <button
              onClick={() => { addToBasket(service); toast({ title: 'Added to Basket', description: `${service.title} added.` }); }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">shopping_basket</span> Add to Basket
            </button>
            <Link href="/basket" className="block text-center text-sm font-semibold text-primary hover:underline">Go to Basket →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
