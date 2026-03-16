'use client';

import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for subscription would go here
  };

  return (
    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
      <input 
        className="flex-1 px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-white/50 text-slate-900 shadow-xl" 
        placeholder="Enter your email" 
        required 
        type="email"
      />
      <Button className="bg-white text-primary font-bold px-8 py-7 rounded-xl hover:bg-slate-50 transition-colors shadow-xl border-none">
        Subscribe
      </Button>
    </form>
  );
}
