import Image from 'next/image';
import { SearchBar } from '@/components/travel/search-bar';
import { ServiceCard } from '@/components/travel/service-card';
import { TravelService } from '@/context/basket-context';
import { Plane, Hotel, Map, Car, ArrowRight, Share2, Mail } from 'lucide-react';
import Link from 'next/link';

const featuredOffers: (TravelService & { badge?: string })[] = [
  {
    id: 'bali-1',
    type: 'hotel',
    title: 'Bali Stays',
    provider: 'EcoResorts',
    price: 99,
    rating: 4.9,
    image: 'https://picsum.photos/seed/bali/800/600',
    location: 'Bali, Indonesia',
    badge: '50% OFF'
  },
  {
    id: 'alpine-1',
    type: 'hotel',
    title: 'Alpine Winter Sale',
    provider: 'MountainLodge',
    price: 150,
    rating: 4.8,
    image: 'https://picsum.photos/seed/alps/800/600',
    location: 'Swiss Alps',
    badge: 'Winter Sale'
  },
  {
    id: 'london-1',
    type: 'activity',
    title: 'London City Breaks',
    provider: 'UrbanTours',
    price: 210,
    rating: 4.7,
    image: 'https://picsum.photos/seed/london/800/600',
    location: 'London, UK',
    badge: 'Free Breakfast'
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-8 lg:px-20 lg:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[520px] flex flex-col items-center justify-center p-6 lg:p-12 text-center">
          <div className="absolute inset-0 opacity-60">
            <Image 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/tropical/1200/800" 
              alt="Tropical beach" 
              fill
              priority
              data-ai-hint="tropical beach"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="relative z-10 max-w-3xl flex flex-col gap-6">
            <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight">
              Find Your Next Adventure
            </h1>
            <p className="text-slate-200 text-lg lg:text-xl font-medium">
              Book flights, hotels, and unique experiences around the world.
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 lg:px-20 py-8">
        <div className="flex flex-wrap justify-center gap-4 lg:gap-12 border-b border-slate-200 dark:border-slate-800 pb-8">
          {[
            { name: 'Flights', icon: Plane, href: '/search?type=flight' },
            { name: 'Hotels', icon: Hotel, href: '/search?type=hotel' },
            { name: 'Activities', icon: Map, href: '/search?type=activity' },
            { name: 'Car Rental', icon: Car, href: '#' },
          ].map((cat) => (
            <Link key={cat.name} href={cat.href} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <cat.icon className="h-8 w-8" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Deals */}
      <section className="px-4 lg:px-20 py-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Unbeatable Travel Deals</h2>
          <Link href="/search" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredOffers.map((offer) => (
            <ServiceCard key={offer.id} service={offer} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-20 border-t border-slate-800 mt-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Plane className="h-6 w-6 rotate-45" />
              <span className="text-white text-lg font-black">TravelEase</span>
            </div>
            <p className="text-sm">Making travel simple, affordable, and accessible for everyone, everywhere.</p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest">Company</h4>
            <Link className="text-sm hover:text-primary transition-colors" href="#">About Us</Link>
            <Link className="text-sm hover:text-primary transition-colors" href="#">Careers</Link>
            <Link className="text-sm hover:text-primary transition-colors" href="#">Press</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest">Support</h4>
            <Link className="text-sm hover:text-primary transition-colors" href="#">Help Center</Link>
            <Link className="text-sm hover:text-primary transition-colors" href="#">Terms of Service</Link>
            <Link className="text-sm hover:text-primary transition-colors" href="#">Privacy Policy</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest">Connect</h4>
            <div className="flex gap-4">
              <Link className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                <Share2 className="h-5 w-5" />
              </Link>
              <Link className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-center text-xs">
          © 2024 TravelEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
