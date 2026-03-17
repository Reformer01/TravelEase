
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBasket, TravelService } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const getResults = (type: string | null): (TravelService & { 
  reviews: number; 
  badges: string[]; 
  availability: string; 
  leftCount?: number;
  subLocation: string;
})[] => {
  const locations = [
    { main: 'Santorini', sub: 'Oia, Santorini', country: 'Greece' },
    { main: 'Kyoto', sub: 'Fira, Santorini', country: 'Japan' },
    { main: 'Bali', sub: 'Imerovigli, Santorini', country: 'Indonesia' }
  ];
  
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `search-${i}`,
    type: (type as any) || 'hotel',
    title: type === 'flight' 
      ? (i % 2 === 0 ? 'Lufthansa Economy' : 'Qatar Airways Business')
      : (i % 2 === 0 ? 'Azure Luxury Suites' : i % 3 === 0 ? 'Mystique Boutique Resort' : 'Caldera View Hotel'),
    provider: 'TravelEase Preferred',
    price: type === 'flight' ? (i * 100) + 300 : (i * 80) + 150,
    rating: i % 2 === 0 ? 5 : 4,
    image: type === 'flight' 
      ? `https://picsum.photos/seed/flight-${i}/800/600`
      : `https://picsum.photos/seed/hotel-${i}/800/600`,
    location: locations[i % locations.length].main,
    subLocation: locations[i % locations.length].sub,
    reviews: Math.floor(Math.random() * 1000) + 400,
    badges: ['Free Cancellation', 'Instant Confirmation', 'TravelEase Choice'],
    availability: 'Live Availability',
    leftCount: i % 2 === 0 ? 2 : 5
  }));
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'hotel';
  const locationParam = searchParams.get('location') || 'Santorini';
  const { addToBasket } = useBasket();
  const { toast } = useToast();
  const { user } = useUser();

  const [priceRange, setPriceRange] = useState([850]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([5, 4]);

  const allResults = useMemo(() => getResults(type), [type]);

  const filteredResults = useMemo(() => {
    return allResults.filter(item => {
      const priceMatch = item.price <= priceRange[0];
      const ratingMatch = selectedRatings.includes(Math.floor(item.rating));
      return priceMatch && ratingMatch;
    });
  }, [allResults, priceRange, selectedRatings]);

  const handleBookNow = (service: TravelService) => {
    addToBasket(service);
    toast({
      title: "Added to Basket",
      description: `${service.title} has been added to your journey.`,
    });
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">flight_takeoff</span>
              <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">TravelEase</h2>
            </Link>
            <div className="hidden md:flex flex-col min-w-64">
              <div className="flex w-full items-stretch rounded-xl h-10 overflow-hidden bg-slate-200/50 dark:bg-primary/10 border border-slate-300 dark:border-primary/20">
                <div className="flex items-center justify-center pl-3 text-slate-500">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-400" placeholder="Where to next?" defaultValue={locationParam} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8">
              <Link className={`text-sm font-semibold transition-colors ${type === 'hotel' ? 'text-primary' : 'hover:text-primary text-slate-600 dark:text-slate-300'}`} href="/search?type=hotel">Hotels</Link>
              <Link className={`text-sm font-semibold transition-colors ${type === 'flight' ? 'text-primary' : 'hover:text-primary text-slate-600 dark:text-slate-300'}`} href="/search?type=flight">Flights</Link>
              <Link className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href={user ? "/profile/bookings" : "/auth/login"}>My Bookings</Link>
              <Link className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="/support">Support</Link>
            </nav>
            <div className="flex gap-3">
              <Link href="/basket" className="relative flex items-center justify-center rounded-xl size-10 bg-slate-200/50 dark:bg-primary/10 hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">shopping_basket</span>
              </Link>
              <Link href={user ? "/profile" : "/auth/login"}>
                <button className="flex items-center justify-center rounded-xl size-10 bg-slate-200/50 dark:bg-primary/10 hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">account_circle</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 lg:px-20 py-8">
        <aside className="hidden w-72 shrink-0 flex-col gap-8 lg:flex">
          <div className="flex flex-col gap-6 rounded-xl border border-primary/10 bg-white dark:bg-primary/5 p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold">Filters</h3>
              <p className="text-sm text-slate-500">{filteredResults.length} results displayed</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Max Price: ${priceRange[0]}</h4>
                <div className="relative pt-2">
                  <Slider 
                    defaultValue={[850]} 
                    max={1000} 
                    step={10} 
                    value={priceRange} 
                    onValueChange={setPriceRange} 
                  />
                </div>
              </div>
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Star Rating</h4>
                <div className="flex flex-col gap-3">
                  {[5, 4, 3].map((star) => (
                    <label key={star} className="flex cursor-pointer items-center gap-3">
                      <Checkbox 
                        checked={selectedRatings.includes(star)} 
                        onCheckedChange={() => toggleRating(star)} 
                      />
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

        <section className="flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-primary transition-colors">Home</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-500">Search</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Sort by:</span>
              <select className="rounded-lg border-primary/10 bg-white dark:bg-primary/5 py-1.5 pl-3 pr-8 text-sm font-semibold focus:ring-primary outline-none">
                <option>Best Value</option>
                <option>Price (Low to High)</option>
                <option>Star Rating</option>
                <option>Guest Reviews</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredResults.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500">No matches found. Try adjusting your filters.</p>
              </div>
            ) : (
              filteredResults.map((service) => (
                <div key={service.id} className="group flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-white dark:bg-primary/5 transition-all hover:shadow-xl hover:shadow-primary/5 sm:flex-row">
                  <div className="relative h-64 w-full sm:h-auto sm:w-80 shrink-0 overflow-hidden">
                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint="travel destination"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
                      <span className="size-1.5 rounded-full bg-white animate-pulse"></span>
                      {service.availability}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-primary">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`material-symbols-outlined text-sm ${i < Math.floor(service.rating) ? 'FILL-1' : ''}`}>star</span>
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
                        {service.badges.map(badge => (
                          <span key={badge} className="rounded-full bg-slate-100 dark:bg-primary/10 px-3 py-1 text-xs font-medium">{badge}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex items-end justify-between border-t border-primary/10 pt-4">
                      <div>
                        {service.leftCount && (
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">priority_high</span>
                            Only {service.leftCount} left!
                          </p>
                        )}
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">${service.price}</span>
                          <span className="text-xs text-slate-500">/ {type === 'flight' ? 'person' : 'night'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleBookNow(service)}
                        className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all h-11"
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
