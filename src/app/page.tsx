import Image from 'next/image';
import { SearchBar } from '@/components/travel/search-bar';
import { ServiceCard } from '@/components/travel/service-card';
import { TravelService } from '@/context/basket-context';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, Hotel, Map, Car, ArrowUpRight } from 'lucide-react';
import { NewsletterForm } from '@/components/travel/newsletter-form';
import { FooterYear } from '@/components/layout/footer-year';
import Link from 'next/link';

const featuredOffers: (TravelService & { badge?: string, badgeVariant?: 'default' | 'destructive' | 'secondary' | 'accent', availabilityHint?: string })[] = [
  {
    id: ' Santorini-1',
    type: 'flight',
    title: 'Santorini, Greece',
    provider: 'Aegean Air',
    price: 899,
    rating: 4.9,
    image: 'https://picsum.photos/seed/santorini/800/600',
    location: 'Aegean Sea',
    badge: 'Limited Time',
    badgeVariant: 'accent',
    availabilityHint: 'Checking real-time price...'
  },
  {
    id: 'kyoto-1',
    type: 'hotel',
    title: 'Kyoto, Japan',
    provider: 'Sakura Inn',
    price: 1120,
    rating: 4.8,
    image: 'https://picsum.photos/seed/kyoto/800/600',
    location: 'Kyoto Prefecture',
    badge: 'Hot Deal',
    badgeVariant: 'destructive',
    availabilityHint: 'Only 3 spots left!'
  },
  {
    id: 'ubud-1',
    type: 'activity',
    title: 'Ubud, Bali',
    provider: 'EcoTours',
    price: 645,
    rating: 4.7,
    image: 'https://picsum.photos/seed/bali/800/600',
    location: 'Bali, Indonesia',
    badge: 'Eco-Friendly',
    badgeVariant: 'secondary',
    availabilityHint: 'Live Availability'
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-0">
      {/* Hero & Search Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,hsl(var(--secondary))_0%,#ffffff_100%)] opacity-40"></div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 font-headline">
            Discover your next <span className="text-primary">adventure</span>
          </h1>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Search over 2 million properties and flights to the world's most breathtaking destinations.
          </p>
          
          <div className="max-w-5xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { name: 'Flights', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-600', href: '/search?type=flight' },
              { name: 'Hotels', icon: Hotel, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-600', href: '/search?type=hotel' },
              { name: 'Activities', icon: Map, color: 'text-orange-600', bg: 'bg-orange-50', hover: 'hover:bg-orange-600', href: '/search?type=activity' },
              { name: 'Car Rental', icon: Car, color: 'text-purple-600', bg: 'bg-purple-50', hover: 'hover:bg-purple-600', href: '#' },
            ].map((cat) => (
              <Link 
                key={cat.name} 
                href={cat.href}
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 min-w-[140px]"
              >
                <div className={`w-12 h-12 ${cat.bg} ${cat.color} rounded-full flex items-center justify-center group-hover:text-white ${cat.hover} transition-colors`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 font-headline">Unbeatable Travel Deals</h2>
              <p className="text-slate-600">Hand-picked destinations for your next escape.</p>
            </div>
            <Button variant="link" className="text-primary font-bold gap-1 group p-0">
              View all deals
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOffers.map((offer) => (
              <ServiceCard key={offer.id} service={offer} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Decoration Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-headline">Ready to find your getaway?</h2>
          <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Join 100k+ travelers receiving exclusive deals and inspiration directly in their inbox.
          </p>
          <NewsletterForm />
        </div>
      </section>
      
      {/* Footer minimal info */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-white tracking-tight">VoyageFlow</span>
          </div>
          <p className="text-sm max-w-md mx-auto">
            Making the world accessible, one flow at a time. &copy; <FooterYear /> VoyageFlow Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
