
"use client";

import Image from 'next/image';
import { Star, MapPin, Clock, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TravelService, useBasket } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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

  const getBadgeClass = () => {
    switch(service.badgeVariant) {
      case 'destructive': return 'bg-red-500 text-white';
      case 'secondary': return 'bg-emerald-500 text-white';
      case 'accent': return 'bg-primary text-white';
      default: return 'bg-white/90 backdrop-blur text-primary';
    }
  };

  return (
    <Card className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint="travel destination"
        />
        {service.badge && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm z-10 ${getBadgeClass()}`}>
            {service.badge}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-10">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-slate-800">{service.rating}</span>
        </div>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-widest font-bold">
          {service.type === 'flight' ? <Clock className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
          {service.provider}
        </div>
        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        {service.location && (
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {service.location}
          </p>
        )}

        {service.availabilityHint && (
          <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-tight ${service.badgeVariant === 'destructive' ? 'text-orange-600' : 'text-primary'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${service.badgeVariant === 'destructive' ? 'bg-orange-400' : 'bg-primary/50'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${service.badgeVariant === 'destructive' ? 'bg-orange-500' : 'bg-primary'}`}></span>
            </span>
            {service.availabilityHint}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 border-t border-slate-50 mt-auto flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-xs line-through block leading-none mb-1">
            ${Math.floor(service.price * 1.3)}
          </span>
          <div className="text-2xl font-bold text-slate-900">
            ${service.price} <span className="text-xs font-normal text-slate-500">/ person</span>
          </div>
        </div>
        <Button 
          size="icon" 
          className="rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors w-11 h-11" 
          onClick={handleAdd}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
