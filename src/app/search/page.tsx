
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Star, 
  MapPin, 
  ChevronRight, 
  Search, 
  Notifications, 
  AccountCircle, 
  PriorityHigh,
  ChevronLeft,
  Public,
  Share,
  Chat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useBasket, TravelService } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';

// Mock data generator for results
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
    title: i % 2 === 0 ? 'Azure Luxury Suites' : i % 3 === 0 ? 'Mystique Boutique Resort' : 'Caldera View Hotel',
    provider: 'TravelEase Preferred',
    price: Math.floor(Math.random() * 300) + 200,
    rating: Number((Math.random() * 0.5 + 4.5).toFixed(1)),
    image: `https://picsum.photos/seed/search-${i}/800/600`,
    location: locations[i % locations.length].main,
    subLocation: locations[i % locations.length].sub,
    reviews: Math.floor(Math.random() * 1000) + 400,
    badges: ['Free Cancellation', 'Breakfast Included', 'Ocean View'],
    availability: 'Live Availability',
    leftCount: i % 2 === 0 ? 2 : 5
  }));
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'hotel';
  const { addToBasket } = useBasket();
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([120, 850]);

  const results = useMemo(() => getResults(type), [type]);

  const handleBookNow = (service: TravelService) => {
    addToBasket(service);
    toast({
      title: "Added to Basket",
      description: `${service.title} has been added to your journey.`,
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
              <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 uppercase">TravelEase</h2>
            </Link>
            <div className="hidden md:flex flex-col min-w-64">
              <div className="flex w-full items-stretch rounded-xl h-10 overflow-hidden bg-slate-200/50 dark:bg-primary/10 border border-slate-300 dark:border-primary/20">
                <div className="flex items-center justify-center pl-3 text-slate-500">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input 
                  className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-500" 
                  placeholder="Where to next?" 
                  defaultValue="Santorini, Greece"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8">
              <Link className={`text-sm font-semibold transition-colors ${type === 'hotel' ? 'text-primary' : 'hover:text-primary'}`} href="/search?type=hotel">Hotels</Link>
              <Link className={`text-sm font-semibold transition-colors ${type === 'flight' ? 'text-primary' : 'hover:text-primary'}`} href="/search?type=flight">Flights</Link>
              <Link className="text-sm font-semibold hover:text-primary transition-colors" href="#">Trips</Link>
              <Link className="text-sm font-semibold hover:text-primary transition-colors" href="#">Deals</Link>
            </nav>
            <div className="flex gap-3">
              <button className="flex items-center justify-center rounded-xl size-10 bg-slate-200/50 dark:bg-primary/10 hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">notifications</span>
              </button>
              <Link href="/auth/login">
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
              <p className="text-sm text-slate-500">{results.length * 40} results found</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Price Range</h4>
                <div className="pt-2">
                  <Slider 
                    defaultValue={[priceRange[0], priceRange[1]]} 
                    max={1000} 
                    step={10} 
                    onValueChange={(val) => setPriceRange(val)}
                  />
                  <div className="mt-4 flex justify-between text-xs font-medium">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Star Rating</h4>
                <div className="flex flex-col gap-3">
                  {[5, 4, 3].map((star) => (
                    <label key={star} className="flex cursor-pointer items-center gap-3">
                      <Checkbox className="border-slate-300 text-primary" defaultChecked={star >= 4} />
                      <span className="flex items-center gap-1 text-sm font-medium">
                        {star} <span className="material-symbols-outlined text-primary text-sm">star</span> Stars
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Amenities</h4>
                <div className="flex flex-col gap-3">
                  {['Free WiFi', 'Infinity Pool', 'Spa & Wellness', 'Airport Shuttle'].map((amenity, i) => (
                    <label key={amenity} className="flex cursor-pointer items-center gap-3">
                      <Checkbox className="border-slate-300 text-primary" defaultChecked={i === 1} />
                      <span className="text-sm font-medium">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full rounded-xl bg-primary font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl h-48 bg-slate-200 group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://picsum.photos/seed/map/400/300')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <button className="w-full rounded-lg bg-white/20 backdrop-blur-md py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition-all">
                View on Map
              </button>
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Home</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-500">Greece</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-semibold">Santorini</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Sort by:</span>
              <Select defaultValue="best">
                <SelectTrigger className="w-[180px] rounded-lg border-primary/10 bg-white dark:bg-primary/5 text-sm font-semibold">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best">Best Value</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="rating">Star Rating</SelectItem>
                  <SelectItem value="reviews">Guest Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {results.map((service) => (
              <div key={service.id} className="group flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-white dark:bg-primary/5 transition-all hover:shadow-xl hover:shadow-primary/5 sm:flex-row">
                <div className="relative h-64 w-full sm:h-auto sm:w-80 shrink-0 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                    style={{ backgroundImage: `url('${service.image}')` }}
                  ></div>
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
                        <h3 className="mt-1 text-xl font-bold">{service.title}</h3>
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
                        <span className="text-2xl font-black">${service.price}</span>
                        <span className="text-xs text-slate-500">/ night</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleBookNow(service)}
                      className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all border-none"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button className="flex size-10 items-center justify-center rounded-lg border border-primary/10 bg-white dark:bg-primary/5 hover:bg-primary/10">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="flex size-10 items-center justify-center rounded-lg bg-primary font-bold text-white">1</button>
              <button className="flex size-10 items-center justify-center rounded-lg border border-primary/10 bg-white dark:bg-primary/5 hover:bg-primary/10">2</button>
              <button className="flex size-10 items-center justify-center rounded-lg border border-primary/10 bg-white dark:bg-primary/5 hover:bg-primary/10">3</button>
              <span className="px-2">...</span>
              <button className="flex size-10 items-center justify-center rounded-lg border border-primary/10 bg-white dark:bg-primary/5 hover:bg-primary/10">12</button>
              <button className="flex size-10 items-center justify-center rounded-lg border border-primary/10 bg-white dark:bg-primary/5 hover:bg-primary/10">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/10 bg-white dark:bg-background-dark py-12 px-6 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                <h2 className="text-lg font-bold">TravelEase</h2>
              </div>
              <p className="text-sm text-slate-500">Making travel planning smarter, faster, and more accessible for everyone.</p>
              <div className="flex gap-4">
                <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></Link>
                <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></Link>
                <Link className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">chat</span></Link>
              </div>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Destinations</h4>
              <ul className="flex flex-col gap-3 text-sm text-slate-500">
                <li><Link className="hover:text-primary" href="#">Europe</Link></li>
                <li><Link className="hover:text-primary" href="#">North America</Link></li>
                <li><Link className="hover:text-primary" href="#">Asia Pacific</Link></li>
                <li><Link className="hover:text-primary" href="#">Middle East</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Company</h4>
              <ul className="flex flex-col gap-3 text-sm text-slate-500">
                <li><Link className="hover:text-primary" href="#">About Us</Link></li>
                <li><Link className="hover:text-primary" href="#">Careers</Link></li>
                <li><Link className="hover:text-primary" href="#">Mobile App</Link></li>
                <li><Link className="hover:text-primary" href="#">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Support</h4>
              <ul className="flex flex-col gap-3 text-sm text-slate-500">
                <li><Link className="hover:text-primary" href="#">Help Center</Link></li>
                <li><Link className="hover:text-primary" href="#">Privacy Policy</Link></li>
                <li><Link className="hover:text-primary" href="#">Terms of Service</Link></li>
                <li><Link className="hover:text-primary" href="#">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-primary/10 pt-8 text-center text-xs text-slate-500">
            © 2024 TravelEase Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
