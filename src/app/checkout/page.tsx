
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Lock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBasket } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPage() {
  const router = useRouter();
  const { totalPrice, items, clearBasket } = useBasket();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      const bookingId = Math.random().toString(36).substring(2, 9).toUpperCase();
      clearBasket();
      toast({
        title: "Payment Successful",
        description: `Your booking ${bookingId} has been confirmed.`,
      });
      router.push(`/confirmation/${bookingId}`);
    }, 2500);
  };

  if (items.length === 0) {
    return null; // Should redirect or show empty state, handled by useEffect if needed
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/basket" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Basket
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
            <p className="text-muted-foreground">Complete your booking for a seamless journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Passenger Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fname">First Name</Label>
                  <Input id="fname" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input id="lname" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
              </h2>
              <div className="border-2 border-primary/20 bg-primary/5 p-4 rounded-xl flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Paystack Secure</p>
                    <p className="text-xs text-muted-foreground">Cards, Bank, USSD</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-5 bg-blue-800 rounded opacity-50" />
                  <div className="w-8 h-5 bg-red-600 rounded opacity-50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" placeholder="4242 4242 4242 4242" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM / YY" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" required />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold mt-8"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay $${Math.floor(totalPrice * 1.1)} Now`
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-4">
              <Lock className="h-3 w-3" /> 256-Bit SSL Encryption
            </div>
          </form>
        </div>

        <div className="bg-white/40 backdrop-blur rounded-2xl p-8 border border-white/40 h-fit">
          <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.basketId} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.provider}</p>
                  <p className="text-sm font-bold text-primary mt-1">${item.price}</p>
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-semibold">${Math.floor(totalPrice * 0.1)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4">
                <span>Total</span>
                <span className="text-primary">${Math.floor(totalPrice * 1.1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
