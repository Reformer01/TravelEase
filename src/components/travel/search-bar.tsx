"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const router = useRouter();
  const [type, setType] = useState('flight');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?type=${type}`);
  };

  return (
    <div className="mt-4 w-full bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl flex flex-col lg:flex-row gap-2">
      <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 group">
        <MapPin className="h-5 w-5 text-primary mr-3" />
        <Input 
          className="w-full bg-transparent border-none focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 h-auto" 
          placeholder="Where to?" 
        />
      </div>
      
      <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 group">
        <Calendar className="h-5 w-5 text-primary mr-3" />
        <Input 
          className="w-full bg-transparent border-none focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 h-auto" 
          placeholder="Dates" 
          type="text"
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => (e.target.type = "text")}
        />
      </div>

      <div className="flex-1 flex items-center px-4 py-3 group">
        <Users className="h-5 w-5 text-primary mr-3" />
        <Input 
          className="w-full bg-transparent border-none focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 h-auto" 
          placeholder="Guests" 
          type="number"
          min="1"
        />
      </div>

      <Button 
        onClick={handleSearch}
        className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 h-auto"
      >
        <Search className="h-5 w-5" />
        Search
      </Button>
    </div>
  );
}
