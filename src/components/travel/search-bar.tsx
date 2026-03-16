
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SearchBar() {
  const router = useRouter();
  const [type, setType] = useState('flight');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?type=${type}`);
  };

  return (
    <div className="w-full bg-white p-2 rounded-2xl shadow-2xl border border-slate-100">
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="w-full md:flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <Input 
            className="w-full pl-12 pr-4 py-7 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-primary bg-slate-50/50 shadow-none text-base" 
            placeholder="Where are you going?" 
          />
        </div>
        
        <div className="w-full md:w-64 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <Input 
            className="w-full pl-12 pr-4 py-7 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-primary bg-slate-50/50 shadow-none text-base" 
            placeholder="Add dates" 
            type="text"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
          />
        </div>

        <div className="w-full md:w-48 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">
            <Users className="h-5 w-5" />
          </div>
          <Input 
            className="w-full pl-12 pr-4 py-7 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-primary bg-slate-50/50 shadow-none text-base" 
            placeholder="Guests" 
            type="number"
            min="1"
          />
        </div>

        <Button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-primary text-white font-bold px-8 py-7 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-lg"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
      
      <div className="mt-4 flex justify-center md:justify-start">
        <Tabs defaultValue="flight" onValueChange={setType} className="w-fit">
          <TabsList className="bg-slate-100/50 p-1 h-9">
            <TabsTrigger value="flight" className="data-[state=active]:bg-white data-[state=active]:text-primary h-7 text-xs font-bold px-4">Flights</TabsTrigger>
            <TabsTrigger value="hotel" className="data-[state=active]:bg-white data-[state=active]:text-primary h-7 text-xs font-bold px-4">Hotels</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:text-primary h-7 text-xs font-bold px-4">Activities</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
