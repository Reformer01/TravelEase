
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingBag, Plane, Hotel, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBasket } from '@/context/basket-context';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function BasketPage() {
  const { items, removeFromBasket, totalPrice } = useBasket();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-primary/5 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-primary opacity-50" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your basket is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          It looks like you haven't added any travel services to your journey yet.
        </p>
        <Link href="/">
          <Button size="lg" className="px-12 font-bold bg-primary hover:bg-primary/90">
            Start Exploring
          </Button>
        </Link>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'activity': return <Map className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">Review Your Journey</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.basketId} className="overflow-hidden glass-card border-none">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </div>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.provider}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromBasket(item.basketId!)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Availability Verified ✓
                      </div>
                      <div className="text-2xl font-bold text-primary">${item.price}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-8 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-semibold">${totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-semibold">${Math.floor(totalPrice * 0.1)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${Math.floor(totalPrice * 1.1)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold group">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Secure payment processed via Paystack. Your booking will be confirmed instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
