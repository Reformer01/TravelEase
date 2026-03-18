"use client";

import Image from 'next/image';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TravelService, useBasket } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';

interface ServiceCardProps {
  service: TravelService & { 
    badge?: string; 
    badgeVariant?: 'default' | 'destructive' | 'secondary' | 'accent'; 
    availabilityHint?: string 
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { addToBasket } = useBasket();
  const { toast } = useToast();

  const handleAdd = () => {
    addToBasket(service);
    toast({
      title: "Added to Basket",
      description: `${service.title} has been added to your journey.`,
    });
  };

  return (
    <Card className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group border-none">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint="travel destination"
        />
        {service.badge && (
          <div className="absolute top-4 left-4 bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            {service.badge}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-10">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-slate-800">{service.rating}</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{service.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {service.type === 'hotel' ? `Starting at ₦${service.price.toLocaleString()}/night. Tropical paradise awaits with luxury amenities.` : `Fly to your next adventure with ${service.provider}.`}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-primary font-black text-xl">
              ₦{service.price.toLocaleString()} 
              <span className="text-slate-400 text-xs font-normal">/{service.type === 'hotel' ? 'night' : 'person'}</span>
            </span>
          </div>
          <Button 
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border-none" 
            onClick={handleAdd}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
