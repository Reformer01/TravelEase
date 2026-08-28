"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBasket, TravelService } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/supabase';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Navbar } from '@/components/layout/navbar';

const getResults = (
  type: string | null
): (TravelService & {
  reviews: number;
  badges: string[];
  availability: string;
  leftCount?: number;
  subLocation: string;
})[] => {
  const locations = [
    { main: 'Santorini', sub: 'Oia, Greece', country: 'Greece' },
    { main: 'Kyoto', sub: 'Gion District, Japan', country: 'Japan' },
    { main: 'Bali', sub: 'Ubud, Indonesia', country: 'Indonesia' },
    { main: 'Paris', sub: 'Eiffel Tower Area, France', country: 'France' },
    { main: 'New York', sub: 'Manhattan, USA', country: 'USA' },
    { main: 'Dubai', sub: 'Downtown, UAE', country: 'UAE' },
  ];

  return Array.from({ length: 6 }).map((_, i) => ({
    id: `search-${i}`,
    type: (type as any) || 'hotel',
    title:
      type === 'flight'
        ? i % 2 === 0
          ? 'Lufthansa Economy'
          : 'Qatar Airways Business'
        : type === 'car'
          ? i % 2 === 0
            ? 'Toyota Corolla (Automatic)'
            : i % 3 === 0
              ? 'SUV - Honda CR-V'
              : 'Kia Rio (Compact)'
        : i % 2 === 0
          ? 'Azure Luxury Suites'
          : i % 3 === 0
            ? 'Mystique Boutique Resort'
            : 'Caldera View Hotel',
    provider: 'TravelEase Preferred',
    price: type === 'flight' ? (i * 100 + 300) * 1500 : type === 'car' ? (i * 25 + 40) * 1500 : (i * 80 + 150) * 1500,
    rating: i % 2 === 0 ? 5 : 4,
    image:
      type === 'flight'
        ? `https://picsum.photos/seed/flight-${i}/800/600`
        : type === 'car'
          ? `https://picsum.photos/seed/car-${i}/800/600`
          : `https://picsum.photos/seed/hotel-${i}/800/600`,
    location: locations[i % locations.length].main,
    subLocation: locations[i % locations.length].sub,
    reviews: Math.floor(Math.random() * 1000) + 400,
    badges: ['Free Cancellation', 'Instant Confirmation', 'TravelEase Choice'],
    availability: 'Live Availability',
    leftCount: i % 2 === 0 ? 2 : 5,
  }));
};

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'hotel';
  const locationParam = searchParams.get('location') || 'Santorini';
  const { addToBasket } = useBasket();
  const { toast } = useToast();
  const { user } = useUser();

  const loginFor = (path: string) => `/auth/login?next=${encodeURIComponent(path)}`;

  const [priceRange, setPriceRange] = useState([1275000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([5, 4]);
  const [sortBy, setSortBy] = useState<'value' | 'price' | 'rating' | 'reviews'>('value');
  const [showFilters, setShowFilters] = useState(false);

  const allResults = useMemo(() => getResults(type), [type]);

  const filteredResults = useMemo(() => {
    const filtered = allResults.filter((item) => {
      const priceMatch = item.price <= priceRange[0];
      const ratingMatch = selectedRatings.includes(Math.floor(item.rating));
      return priceMatch && ratingMatch;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });
    return sorted;
  }, [allResults, priceRange, selectedRatings, sortBy]);

  const handleBookNow = (service: TravelService) => {
    addToBasket(service);
    toast({
      title: 'Added to Basket',
      description: `${service.title} has been added to your journey.`,
    });
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]));
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-4 md:gap-8 px-4 sm:px-6 lg:px-20 py-8">
          <aside className="hidden w-72 shrink-0 flex-col gap-4 md:gap-8 lg:flex" aria-label="Filters">
          <div className="flex flex-col gap-6 rounded-xl border border-primary/10 bg-white dark:bg-primary/5 p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold">Filters</h3>
              <p className="text-sm text-slate-500">{filteredResults.length} results displayed</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Max Price: ₦{priceRange[0].toLocaleString()}</h4>
                <div className="relative pt-2">
                  <Slider defaultValue={[1275000]} max={1500000} step={15000} value={priceRange} onValueChange={setPriceRange} />
                </div>
              </div>
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Star Rating</h4>
                <div className="flex flex-col gap-3">
                  {[5, 4, 3].map((star) => (
                    <label key={star} className="flex cursor-pointer items-center gap-3">
                      <Checkbox checked={selectedRatings.includes(star)} onCheckedChange={() => toggleRating(star)} />
                      <span className="flex items-center gap-1 text-sm font-medium">
                        {star} <span className="material-symbols-outlined text-primary text-sm FILL-1">star</span> Stars
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-4 md:gap-6">
          <h1 className="sr-only">{type.charAt(0).toUpperCase() + type.slice(1)}s in {locationParam}</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm min-w-0 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="text-slate-500 hover:text-primary transition-colors">
                Home
              </Link>
              <span className="material-symbols-outlined text-xs" aria-hidden="true">chevron_right</span>
              <span className="text-slate-500">Search</span>
              <span className="material-symbols-outlined text-xs" aria-hidden="true">chevron_right</span>
              <span className="font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/20 bg-white dark:bg-slate-900 text-sm font-bold">Filters {showFilters ? '×' : '≡'}</button>
              <span className="text-sm text-slate-500 font-medium">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-lg border-primary/10 bg-white dark:bg-primary/5 py-1.5 pl-3 pr-8 text-sm font-semibold focus:ring-primary outline-none w-full sm:w-auto">
                <option value="value">Best Value</option>
                <option value="price">Price (Low to High)</option>
                <option value="rating">Star Rating</option>
                <option value="reviews">Guest Reviews</option>
              </select>
            </div>
          </div>
          {showFilters && (
            <div className="lg:hidden rounded-xl border border-primary/10 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h3 className="font-bold">Filters</h3>
              <div><h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Price: ₦{priceRange[0].toLocaleString()}</h4><Slider max={1500000} step={15000} value={priceRange} onValueChange={setPriceRange} /></div>
              <div className="flex flex-col gap-2">{[5,4,3].map(s => <label key={s} className="flex items-center gap-2"><Checkbox checked={selectedRatings.includes(s)} onCheckedChange={() => setSelectedRatings(p => p.includes(s) ? p.filter(r=>r!==s) : [...p,s])} /><span>{s} ★</span></label>)}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {filteredResults.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500">No matches found. Try adjusting your filters.</p>
                <button onClick={() => { setPriceRange([1500000]); setSelectedRatings([5,4,3]); }} className="mt-4 text-primary font-bold text-sm hover:underline">Reset filters</button>
              </div>
            ) : (
              filteredResults.map((service) => (
                  <div
                  key={service.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-white dark:bg-primary/5 transition-all hover:shadow-xl hover:shadow-primary/5 sm:flex-row"
                >
                  <Link href={`/search/${service.id}?type=${type}`} className="relative h-64 w-full sm:h-auto sm:w-80 shrink-0 overflow-hidden block">
                    <Image
                      src={service.image}
                      alt={`${service.title} in ${service.subLocation}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint="travel destination"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
                      <span className="size-1.5 rounded-full bg-white animate-pulse"></span>
                      {service.availability}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-primary">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`material-symbols-outlined text-sm ${i < Math.floor(service.rating) ? 'FILL-1' : ''}`}
                              >
                                star
                              </span>
                            ))}
                          </div>
                          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {service.subLocation}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-primary font-bold">
                            <span>{service.rating}</span>
                            <span className="text-xs">/ 5</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-tighter">{service.reviews} reviews</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {service.badges.map((badge) => (
                          <span key={badge} className="rounded-full bg-slate-100 dark:bg-primary/10 px-3 py-1 text-xs font-medium">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 border-t border-primary/10 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        {service.leftCount && (
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">priority_high</span>
                            Only {service.leftCount} left!
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                          <span className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">₦{service.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-500">/ {type === 'flight' ? 'person' : type === 'car' ? 'day' : 'night'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookNow(service)}
                        className="h-11 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 sm:w-auto sm:px-8"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
